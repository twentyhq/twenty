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
        487,
        489,
        491,
        552,
        572,
        579,
        581,
        595,
        601,
        602,
        604,
        605,
        607,
        608,
        609,
        612,
        613,
        618,
        620,
        623,
        628,
        629,
        630,
        633,
        634
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                487
            ],
            "createdAt": [
                194
            ],
            "id": [
                487
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
                487
            ],
            "status": [
                1
            ],
            "threadId": [
                487
            ],
            "turnId": [
                487
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
                487
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                487
            ],
            "messageId": [
                487
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
                487
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
                487
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
                487
            ],
            "aggregateOperation": [
                26
            ],
            "configurationType": [
                612
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
                487
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
                487
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
                487
            ],
            "role": [
                332
            ],
            "workspaceMemberId": [
                487
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
                487
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
                487
            ],
            "id": [
                487
            ],
            "logicFunctions": [
                307
            ],
            "logoFileId": [
                487
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
                487
            ],
            "settingsCustomTabFrontComponentId": [
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                487
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
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                593
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                487
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
                487
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
                487
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
                487
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
                487
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
                635
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
                487
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
                612
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                612
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                612
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
                612
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
                612
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
                487
            ],
            "availabilityObjectMetadataId": [
                487
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
                487
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
                487
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                487
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
                487
            ],
            "pageLayoutId": [
                487
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
                487
            ],
            "updatedAt": [
                194
            ],
            "workflowVersionId": [
                487
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
                487
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
                487
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
                487
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
                487
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
                487
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                487
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
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                487
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
                487
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
                487
            ],
            "engineComponentKey": [
                228
            ],
            "frontComponentId": [
                487
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
                487
            ],
            "pageLayoutId": [
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
            ],
            "icon": [
                1
            ],
            "id": [
                487
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                487
            ],
            "position": [
                18
            ],
            "targetObjectMetadataId": [
                487
            ],
            "targetRecordId": [
                487
            ],
            "type": [
                352
            ],
            "userWorkspaceId": [
                487
            ],
            "viewId": [
                487
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
                487
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
                487
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
                487
            ],
            "pageLayoutTabId": [
                487
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                487
            ],
            "filter": [
                295
            ],
            "objectMetadataId": [
                487
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
                487
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
                491
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
                572
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                579
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                581
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                487
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
                487
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
                487
            ],
            "id": [
                487
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
                487
            ],
            "viewId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                487
            ],
            "logicalOperator": [
                601
            ],
            "parentViewFilterGroupId": [
                487
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "viewId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                487
            ],
            "id": [
                487
            ],
            "operand": [
                602
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                487
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                487
            ],
            "viewId": [
                487
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
                487
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
            ],
            "viewId": [
                487
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
                487
            ],
            "calendarFieldMetadataId": [
                487
            ],
            "calendarLayout": [
                595
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                487
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                487
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                604
            ],
            "mainGroupByFieldMetadataId": [
                487
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                487
            ],
            "openRecordIn": [
                605
            ],
            "position": [
                18
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                608
            ],
            "visibility": [
                609
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                607
            ],
            "fieldMetadataId": [
                487
            ],
            "id": [
                487
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                487
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
                487
            ],
            "name": [
                271
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                487
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
                487
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
                487
            ],
            "pageLayoutId": [
                487
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
                487
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
                487
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
                487
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
                612
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
                487
            ],
            "status": [
                225
            ],
            "tenantStatus": [
                226
            ],
            "unsubscribeHostnameStatus": [
                489
            ],
            "updatedAt": [
                194
            ],
            "verificationRecords": [
                590
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
                612
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
                487
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
                487
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
                487
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
                487
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
                487
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
                612
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
                488
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
                488
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
                487
            ],
            "id": [
                487
            ],
            "objectMetadataId": [
                487
            ],
            "roleId": [
                487
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
                487
            ],
            "objectMetadataId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                612
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
                487
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
                487
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
                487
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
                487
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
                612
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                487
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
                632
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                612
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
                487
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
                487
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
                487
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
                612
            ],
            "frontComponentId": [
                487
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                487
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
                487
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
                487
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
                487
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
                487
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
                612
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
                636
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
                487
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
                487
            ],
            "id": [
                487
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
                488
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
                487
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
                487
            ],
            "messageThreadId": [
                487
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
                487
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
                612
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                487
            ],
            "applicationUniversalIdentifier": [
                487
            ],
            "id": [
                487
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                487
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
                612
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                612
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
                487
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
                487
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
                487
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                487
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
                487
            ],
            "reason": [
                335
            ],
            "source": [
                336
            ],
            "unsubscribeTopicId": [
                487
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
                487
            ],
            "property": [
                1
            ],
            "provenance": [
                342
            ],
            "recordId": [
                487
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
                487
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                487
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
                487
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
                487
            ],
            "key": [
                604
            ],
            "objectMetadataId": [
                487
            ],
            "type": [
                608
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                617,
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
                        487,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        487,
                        "[UUID!]!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                487,
                {
                    "threadId": [
                        487,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        487
                    ],
                    "threadId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        487,
                        "UUID!"
                    ],
                    "roleId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        487,
                        "UUID!"
                    ],
                    "roleId": [
                        487,
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
                        487,
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
                        487,
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
                        487
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
                598,
                {
                    "inputs": [
                        184,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                597,
                {
                    "inputs": [
                        185,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                603,
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
                        487,
                        "UUID!"
                    ],
                    "properties": [
                        295
                    ],
                    "recordId": [
                        487,
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
                490,
                {
                    "input": [
                        181,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                570,
                {
                    "input": [
                        182,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                589,
                {
                    "input": [
                        183,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                594,
                {
                    "input": [
                        189,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                597,
                {
                    "input": [
                        185,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                598,
                {
                    "input": [
                        184,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                599,
                {
                    "input": [
                        187,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                600,
                {
                    "input": [
                        186,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                603,
                {
                    "input": [
                        188,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                606,
                {
                    "input": [
                        190,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                610,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        487,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        487
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
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                146,
                {
                    "id": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                617
            ],
            "deleteEmailGroupChannel": [
                322,
                {
                    "id": [
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                351,
                {
                    "ids": [
                        487,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                351,
                {
                    "id": [
                        487,
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
                        487,
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
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                201,
                {
                    "twoFactorAuthenticationMethodId": [
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                583
            ],
            "deleteUserFromWorkspace": [
                586,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                589,
                {
                    "id": [
                        487,
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
                597,
                {
                    "input": [
                        203,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                598,
                {
                    "input": [
                        202,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                599,
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
                603,
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
                610,
                {
                    "id": [
                        487,
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
                597,
                {
                    "input": [
                        209,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                598,
                {
                    "input": [
                        208,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                599,
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
                603,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                216,
                {
                    "id": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                217,
                {
                    "id": [
                        487,
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
                        487
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
                621
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
                        487,
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
                        487,
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
                        487,
                        "UUID!"
                    ],
                    "workspaceId": [
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "leaveAgentChatChannel": [
                4,
                {
                    "channelId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsDoneInChannel": [
                4,
                {
                    "threadId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsRead": [
                19,
                {
                    "threadId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                19,
                {
                    "threadId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        487
                    ],
                    "threadId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                19,
                {
                    "threadId": [
                        487,
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
                        487,
                        "UUID!"
                    ],
                    "memberWorkspaceMemberId": [
                        487,
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
                        487,
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
                        487,
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
                        487,
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
                        487,
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
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        487,
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
                        487,
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
                        487
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
                        487,
                        "[UUID!]"
                    ],
                    "messageId": [
                        487,
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
                        487,
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
                        487
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
                        487
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
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                128,
                {
                    "connectedAccountId": [
                        487,
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
                        487,
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
                        487,
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
                631,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "updateAgentChatChannel": [
                5,
                {
                    "channelId": [
                        487,
                        "UUID!"
                    ],
                    "input": [
                        492,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateApiKey": [
                35,
                {
                    "input": [
                        494,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                322,
                {
                    "input": [
                        495,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                43,
                {
                    "id": [
                        487,
                        "UUID!"
                    ],
                    "input": [
                        496,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                61,
                {
                    "input": [
                        497,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                65,
                {
                    "input": [
                        499,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                115,
                {
                    "input": [
                        501,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                142,
                {
                    "input": [
                        503,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                322,
                {
                    "input": [
                        504,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                269,
                {
                    "input": [
                        506,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                247,
                {
                    "input": [
                        508,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                351,
                {
                    "inputs": [
                        519,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                354,
                {
                    "inputs": [
                        520,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                603,
                {
                    "inputs": [
                        542,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                322,
                {
                    "input": [
                        511,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                329,
                {
                    "input": [
                        513,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                329,
                {
                    "input": [
                        515,
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
                        519,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        493,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        487
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
                        518,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        509,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                354,
                {
                    "input": [
                        520,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                425,
                {
                    "updateRoleInput": [
                        527,
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
                        521,
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
                        522,
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
                        524,
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
                        526,
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
                        529,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                476,
                {
                    "input": [
                        530,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                490,
                {
                    "input": [
                        531,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                570,
                {
                    "input": [
                        532,
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
                589,
                {
                    "input": [
                        533,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                594,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        544,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                597,
                {
                    "input": [
                        537,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                598,
                {
                    "input": [
                        535,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                599,
                {
                    "input": [
                        540,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                600,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        539,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                603,
                {
                    "input": [
                        542,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                606,
                {
                    "input": [
                        545,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                610,
                {
                    "input": [
                        547,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                617,
                {
                    "data": [
                        550,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                617,
                {
                    "data": [
                        549,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                626,
                {
                    "roleId": [
                        487,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        551,
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
                        552,
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
                        552,
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
                        552,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                264,
                {
                    "file": [
                        552,
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
                        552,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                264,
                {
                    "file": [
                        552,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                256,
                {
                    "upsertFieldPermissionsInput": [
                        553,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                594,
                {
                    "input": [
                        556,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                362,
                {
                    "upsertObjectPermissionsInput": [
                        557,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                426,
                {
                    "upsertPermissionFlagsInput": [
                        558,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                560,
                {
                    "input": [
                        559,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                594,
                {
                    "input": [
                        561,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                69,
                {
                    "input": [
                        587,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                591,
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
                592,
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
                487
            ],
            "color": [
                1
            ],
            "createdAt": [
                194
            ],
            "folderId": [
                487
            ],
            "icon": [
                1
            ],
            "id": [
                487
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                487
            ],
            "position": [
                18
            ],
            "targetObjectMetadataId": [
                487
            ],
            "targetRecordId": [
                487
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
                487
            ],
            "viewId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                487
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
                487
            ],
            "imageIdentifierFieldMetadataId": [
                487
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
                487
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
                487
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
                488
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
                488
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
                487
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
                487
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
                487
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
                487
            ],
            "createdAt": [
                194
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                487
            ],
            "deletedAt": [
                194
            ],
            "id": [
                487
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
                487
            ],
            "tabs": [
                376
            ],
            "type": [
                378
            ],
            "universalIdentifier": [
                487
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
                487
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
                487
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
                487
            ],
            "position": [
                18
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                487
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
                487
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                295
            ],
            "configuration": [
                611
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
                487
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
                487
            ],
            "pageLayoutTabId": [
                487
            ],
            "position": [
                382
            ],
            "title": [
                1
            ],
            "type": [
                613
            ],
            "universalIdentifier": [
                487
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
                487
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
                487
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
                487
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
                487
            ],
            "aggregateOperation": [
                26
            ],
            "color": [
                1
            ],
            "configurationType": [
                612
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
                487
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
                487
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
                487
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
                487
            ],
            "createdAt": [
                194
            ],
            "domain": [
                1
            ],
            "id": [
                487
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
                487
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                635
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
                487
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
                        487,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                47,
                {
                    "applicationId": [
                        487,
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
                        487,
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
                487,
                {
                    "calendarEventId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "threadId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                131,
                {
                    "threadId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        487,
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
                625,
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                142
            ],
            "currentUser": [
                583
            ],
            "currentUserApplicationAuthorizations": [
                44
            ],
            "currentUserSessions": [
                585
            ],
            "currentWorkspace": [
                617
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
                        487,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                249,
                {
                    "id": [
                        487,
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
                        487
                    ],
                    "universalIdentifier": [
                        487
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
                619
            ],
            "findWorkspaceFromInviteHash": [
                617,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                624
            ],
            "frontComponent": [
                269,
                {
                    "id": [
                        487,
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
                        487,
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
                        487,
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
                        487,
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
                567,
                {
                    "input": [
                        568
                    ]
                }
            ],
            "getView": [
                594,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                597,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                598,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                598,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                597,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                599,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                600,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                600,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                599,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                603,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                603,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                606,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                606,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                594,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        608,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                622
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
                487,
                {
                    "objectMetadataId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                115,
                {
                    "connectedAccountId": [
                        487
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
                        487
                    ]
                }
            ],
            "myMessageFolders": [
                329,
                {
                    "messageChannelId": [
                        487
                    ]
                }
            ],
            "myUserApplicationVariables": [
                627
            ],
            "navigationMenuItem": [
                351,
                {
                    "id": [
                        487,
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
                        487,
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
                        487,
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
            "unsubscribeTopics": [
                490
            ],
            "usageLimits": [
                570
            ],
            "usageQuotaDefinitions": [
                574
            ],
            "usageQuotaScopeConsumption": [
                576,
                {
                    "input": [
                        577,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                578
            ],
            "validatePasswordResetToken": [
                588,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                589,
                {
                    "objectMetadataId": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                610,
                {
                    "id": [
                        487,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                610
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                487
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
                487
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
                487
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
                487
            ],
            "permissions": [
                406
            ],
            "recordId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                487
            ],
            "workspaceMemberId": [
                487
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
                487
            ],
            "principalRoleId": [
                487
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
                487
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
                612
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
                487
            ],
            "recordId": [
                487
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
                487
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
                487
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
                487
            ],
            "workspaceMembers": [
                626
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
                487
            ],
            "roleId": [
                487
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
                487
            ],
            "logicalOperator": [
                431
            ],
            "objectMetadataId": [
                487
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                487
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
                487
            ],
            "id": [
                487
            ],
            "operand": [
                433
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                18
            ],
            "rowLevelPermissionPredicateGroupId": [
                487
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
                487
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
                487
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
                487
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
                487
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
                487
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
                487
            ],
            "id": [
                487
            ],
            "position": [
                18
            ],
            "tsVectorFieldMetadataId": [
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                487
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
                624
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
                487
            ],
            "createdAt": [
                194
            ],
            "frontComponentId": [
                487
            ],
            "icon": [
                1
            ],
            "id": [
                487
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
                487
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
                487
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
                487
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
                636
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
                487
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
                487
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
                612
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                634
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
                        487,
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
                612
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
                487
            ],
            "createdAt": [
                194
            ],
            "emit": [
                477
            ],
            "frontComponentUniversalIdentifier": [
                487
            ],
            "icon": [
                1
            ],
            "id": [
                487
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
                487
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                487
            ],
            "universalIdentifier": [
                487
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
                487
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
                487
            ],
            "relationFieldUniversalIdentifier": [
                487
            ],
            "triggerFieldUniversalIdentifiers": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                612
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                487
            ],
            "gt": [
                487
            ],
            "gte": [
                487
            ],
            "iLike": [
                487
            ],
            "in": [
                487
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                487
            ],
            "lt": [
                487
            ],
            "lte": [
                487
            ],
            "neq": [
                487
            ],
            "notILike": [
                487
            ],
            "notIn": [
                487
            ],
            "notLike": [
                487
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
                487
            ],
            "name": [
                1
            ],
            "updatedAt": [
                194
            ],
            "visibility": [
                491
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
                487
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
                487
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
                487
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
                487
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
                498
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
                500
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
                487
            ],
            "update": [
                502
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
                487
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
                487
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                487
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
                487
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
                487
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
                487
            ],
            "update": [
                507
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
                487
            ],
            "update": [
                510
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
                487
            ],
            "update": [
                512
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
                487
            ],
            "update": [
                514
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
                487
            ],
            "update": [
                514
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
                487
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
                487
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
                487
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
                487
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
                487
            ],
            "update": [
                505
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                487
            ],
            "update": [
                516
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                487
            ],
            "update": [
                517
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
                487
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
                487
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
                525
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
                487
            ],
            "pageLayoutTabId": [
                487
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                613
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
                487
            ],
            "objectMetadataId": [
                487
            ],
            "pageLayoutTabId": [
                487
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                613
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
                487
            ],
            "tabs": [
                523
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
                487
            ],
            "update": [
                528
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
                487
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
                487
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
                491
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                487
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
                487
            ],
            "update": [
                534
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
                487
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
                487
            ],
            "update": [
                536
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
                487
            ],
            "update": [
                538
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                487
            ],
            "logicalOperator": [
                601
            ],
            "parentViewFilterGroupId": [
                487
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "viewId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                487
            ],
            "update": [
                541
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                487
            ],
            "operand": [
                602
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                487
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                487
            ],
            "update": [
                543
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                487
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
                487
            ],
            "calendarFieldMetadataId": [
                487
            ],
            "calendarLayout": [
                595
            ],
            "groupLoadLimit": [
                11
            ],
            "icon": [
                1
            ],
            "id": [
                487
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                487
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                487
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                605
            ],
            "position": [
                18
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                608
            ],
            "visibility": [
                609
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                487
            ],
            "update": [
                546
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                607
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
                487
            ],
            "update": [
                548
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
                487
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
                623
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                487
            ],
            "isVisible": [
                4
            ],
            "position": [
                18
            ],
            "viewFieldId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                554
            ],
            "id": [
                487
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
                554
            ],
            "groups": [
                555
            ],
            "widgetId": [
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                487
            ],
            "predicateGroups": [
                430
            ],
            "predicates": [
                432
            ],
            "roleId": [
                487
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
                565
            ],
            "viewFields": [
                562
            ],
            "viewFilterGroups": [
                563
            ],
            "viewFilters": [
                564
            ],
            "viewSorts": [
                566
            ],
            "widgetId": [
                487
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
                487
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                487
            ],
            "logicalOperator": [
                601
            ],
            "parentViewFilterGroupId": [
                487
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
                487
            ],
            "id": [
                487
            ],
            "operand": [
                602
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                487
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                487
            ],
            "calendarFieldMetadataId": [
                487
            ],
            "calendarLayout": [
                595
            ],
            "kanbanAggregateOperation": [
                26
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                487
            ],
            "kanbanColumnWidth": [
                11
            ],
            "mainGroupByFieldMetadataId": [
                487
            ],
            "openRecordIn": [
                605
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                607
            ],
            "fieldMetadataId": [
                487
            ],
            "id": [
                487
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
                580
            ],
            "usageByApplication": [
                569
            ],
            "usageByModel": [
                569
            ],
            "usageByOperationType": [
                569
            ],
            "usageByUser": [
                569
            ],
            "userDailyUsage": [
                582
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                572
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
                487
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                87
            ],
            "operationType": [
                572
            ],
            "periodCount": [
                11
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                579
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                581
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
                581
            ],
            "operationType": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                571
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                575
            ],
            "resourceType": [
                579
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                573
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
                572
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                581
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
                572
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                579
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                581
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
                487
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                87
            ],
            "operationType": [
                572
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
                579
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
                581
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
                580
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
                586
            ],
            "currentWorkspace": [
                617
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
                487
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
                586
            ],
            "workspaceMember": [
                626
            ],
            "workspaceMembers": [
                626
            ],
            "workspaces": [
                586
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
                487
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
                487
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
                487
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
                583
            ],
            "userId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                487
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
                487
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
                487
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                487
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
                487
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
                635
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
                487
            ],
            "calendarEndFieldMetadataId": [
                487
            ],
            "calendarFieldMetadataId": [
                487
            ],
            "calendarLayout": [
                595
            ],
            "createdAt": [
                194
            ],
            "createdByUserWorkspaceId": [
                487
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
                487
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
                487
            ],
            "kanbanColumnWidth": [
                11
            ],
            "key": [
                604
            ],
            "mainGroupByFieldMetadataId": [
                487
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                487
            ],
            "openRecordIn": [
                605
            ],
            "position": [
                18
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                608
            ],
            "universalIdentifier": [
                487
            ],
            "updatedAt": [
                194
            ],
            "viewFieldGroups": [
                598
            ],
            "viewFields": [
                597
            ],
            "viewFilterGroups": [
                600
            ],
            "viewFilters": [
                599
            ],
            "viewGroups": [
                603
            ],
            "viewSorts": [
                606
            ],
            "visibility": [
                609
            ],
            "workspaceId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                612
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
                487
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "fieldMetadataId": [
                487
            ],
            "id": [
                487
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
                487
            ],
            "updatedAt": [
                194
            ],
            "viewFieldGroupId": [
                487
            ],
            "viewId": [
                487
            ],
            "workspaceId": [
                487
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
                487
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
                597
            ],
            "viewId": [
                487
            ],
            "workspaceId": [
                487
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
                487
            ],
            "id": [
                487
            ],
            "operand": [
                602
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "relationTargetFieldMetadataId": [
                487
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
                487
            ],
            "viewId": [
                487
            ],
            "workspaceId": [
                487
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
                487
            ],
            "logicalOperator": [
                601
            ],
            "parentViewFilterGroupId": [
                487
            ],
            "positionInViewFilterGroup": [
                18
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                487
            ],
            "workspaceId": [
                487
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
                487
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
                487
            ],
            "workspaceId": [
                487
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
                607
            ],
            "fieldMetadataId": [
                487
            ],
            "id": [
                487
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
            ],
            "viewId": [
                487
            ],
            "workspaceId": [
                487
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
                487
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
                487
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
                596
            ],
            "on_WorkflowConfiguration": [
                614
            ],
            "on_WorkflowRunConfiguration": [
                615
            ],
            "on_WorkflowVersionConfiguration": [
                616
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                618
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
                487
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
                487
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
                597
            ],
            "viewFilterGroups": [
                600
            ],
            "viewFilters": [
                599
            ],
            "viewGroups": [
                603
            ],
            "viewSorts": [
                606
            ],
            "views": [
                594
            ],
            "workspaceCustomApplication": [
                43
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                623
            ],
            "workspaceMembersCount": [
                18
            ],
            "workspaceUrls": [
                635
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
                620
            ],
            "personEnrichment": [
                295
            ],
            "personOutcome": [
                633
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
                487
            ],
            "roleId": [
                487
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
                628
            ],
            "id": [
                487
            ],
            "locale": [
                1
            ],
            "name": [
                271
            ],
            "numberFormat": [
                629
            ],
            "openRecordIn": [
                373
            ],
            "roles": [
                425
            ],
            "timeFormat": [
                630
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
                487
            ],
            "userWorkspaceId": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                487
            ],
            "variables": [
                584
            ],
            "workspaceMemberId": [
                487
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
                487
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
                487
            ],
            "workspaceUrls": [
                635
            ],
            "__typename": [
                1
            ]
        }
    }
}