export default {
    "scalars": [
        1,
        4,
        7,
        8,
        9,
        15,
        17,
        19,
        22,
        24,
        31,
        45,
        53,
        55,
        61,
        73,
        77,
        78,
        80,
        85,
        90,
        96,
        106,
        109,
        110,
        111,
        112,
        120,
        122,
        136,
        141,
        185,
        186,
        213,
        217,
        218,
        220,
        230,
        236,
        240,
        244,
        247,
        254,
        268,
        270,
        280,
        287,
        288,
        289,
        300,
        302,
        315,
        316,
        317,
        318,
        319,
        320,
        322,
        323,
        324,
        327,
        328,
        330,
        331,
        334,
        336,
        340,
        344,
        353,
        360,
        361,
        362,
        365,
        369,
        370,
        375,
        379,
        400,
        402,
        403,
        406,
        411,
        423,
        425,
        429,
        434,
        451,
        463,
        464,
        466,
        479,
        481,
        483,
        543,
        563,
        570,
        572,
        586,
        592,
        593,
        595,
        596,
        598,
        599,
        600,
        603,
        604,
        609,
        611,
        614,
        619,
        620,
        621,
        624,
        625
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
                287
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
                479
            ],
            "createdAt": [
                186
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                287
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
                287
            ],
            "roleId": [
                479
            ],
            "triggers": [
                287
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                287
            ],
            "threadId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThread": {
            "contextWindowTokens": [
                7
            ],
            "conversationSize": [
                7
            ],
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "id": [
                8
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                7
            ],
            "totalInputCredits": [
                9
            ],
            "totalInputTokens": [
                7
            ],
            "totalOutputCredits": [
                9
            ],
            "totalOutputTokens": [
                7
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                186
            ],
            "id": [
                479
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                186
            ],
            "lastReadAt": [
                186
            ],
            "snoozedUntil": [
                186
            ],
            "threadId": [
                479
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                479
            ],
            "createdAt": [
                186
            ],
            "id": [
                479
            ],
            "parts": [
                13
            ],
            "processedAt": [
                186
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                479
            ],
            "status": [
                1
            ],
            "threadId": [
                479
            ],
            "turnId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                186
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                479
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                479
            ],
            "messageId": [
                479
            ],
            "orderIndex": [
                7
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                287
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
                287
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                287
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
                186
            ],
            "creatorName": [
                1
            ],
            "creatorSource": [
                1
            ],
            "credits": [
                9
            ],
            "endedAt": [
                186
            ],
            "errorMessage": [
                1
            ],
            "id": [
                479
            ],
            "input": [
                1
            ],
            "inputTokens": [
                7
            ],
            "modelId": [
                1
            ],
            "outputTokens": [
                7
            ],
            "reply": [
                1
            ],
            "startedAt": [
                186
            ],
            "status": [
                15
            ],
            "threadId": [
                479
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
                479
            ],
            "aggregateOperation": [
                17
            ],
            "configurationType": [
                603
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                287
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "label": [
                1
            ],
            "numberFormat": [
                122
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                395
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
                80
            ],
            "kind": [
                1
            ],
            "limitValue": [
                80
            ],
            "periodEnd": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                7
            ],
            "sections": [
                21
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
                7
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
                9
            ],
            "__typename": [
                1
            ]
        },
        "ApiKey": {
            "createdAt": [
                186
            ],
            "expiresAt": [
                186
            ],
            "id": [
                479
            ],
            "name": [
                1
            ],
            "revokedAt": [
                186
            ],
            "role": [
                417
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                186
            ],
            "id": [
                479
            ],
            "name": [
                1
            ],
            "revokedAt": [
                186
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
                8
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
                31
            ],
            "value": [
                287
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
                33
            ],
            "receivedAt": [
                186
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
                479
            ],
            "role": [
                324
            ],
            "workspaceMemberId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "AppPreferencesApplication": {
            "hasConnectionProviders": [
                4
            ],
            "id": [
                479
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "AppPreferencesSettingsMenuItem": {
            "frontComponentId": [
                479
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "position": [
                9
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                479
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
                57
            ],
            "applicationRegistrationId": [
                479
            ],
            "applicationVariables": [
                60
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                287
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                135
            ],
            "defaultLogicFunctionRole": [
                417
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                261
            ],
            "healthCheckLogicFunctionId": [
                479
            ],
            "id": [
                479
            ],
            "logicFunctions": [
                299
            ],
            "logoFileId": [
                479
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                346
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                479
            ],
            "settingsCustomTabFrontComponentId": [
                479
            ],
            "settingsMenuItems": [
                450
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                479
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                186
            ],
            "id": [
                479
            ],
            "lastAuthorizedAt": [
                186
            ],
            "lastUsedAt": [
                186
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                479
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                479
            ],
            "archivedAt": [
                186
            ],
            "authFailedAt": [
                186
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                391
            ],
            "connectionProviderId": [
                479
            ],
            "createdAt": [
                186
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                479
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                186
            ],
            "lastSignedInAt": [
                186
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
                186
            ],
            "userWorkspaceId": [
                479
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
                479
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                41
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
                43
            ],
            "coverage": [
                44
            ],
            "files": [
                46
            ],
            "manifest": [
                287
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
                55
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
                45
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
                479
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
                254
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
                254
            ],
            "filePath": [
                1
            ],
            "size": [
                7
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
                186
            ],
            "fileFolder": [
                254
            ],
            "fileId": [
                479
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
                51
            ],
            "description": [
                1
            ],
            "status": [
                53
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
                186
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                479
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
                479
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                55
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                7
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                7
            ],
            "versionDistribution": [
                584
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                479
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                55
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                186
            ],
            "description": [
                1
            ],
            "id": [
                479
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
                287
            ],
            "type": [
                1
            ],
            "updatedAt": [
                186
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
                65
            ],
            "applicationRefreshToken": [
                65
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
                479
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
                287
            ],
            "scope": [
                61
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
                186
            ],
            "domain": [
                1
            ],
            "id": [
                479
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
                433
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                186
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
                65
            ],
            "refreshToken": [
                65
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                66
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
                479
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
                432
            ],
            "workspaceUrls": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                70
            ],
            "availableWorkspacesForSignUp": [
                70
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                71
            ],
            "tokens": [
                66
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                479
            ],
            "aggregateOperation": [
                17
            ],
            "axisNameDisplay": [
                73
            ],
            "color": [
                1
            ],
            "configurationType": [
                603
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
                287
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupMode": [
                77
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                78
            ],
            "numberFormat": [
                122
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                360
            ],
            "primaryAxisGroupByFieldMetadataId": [
                479
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                268
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                360
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                479
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                268
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
                287
            ],
            "formattedToRawLookup": [
                287
            ],
            "groupMode": [
                77
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
                78
            ],
            "series": [
                79
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
                287
            ],
            "objectMetadataId": [
                479
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
                104
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
                479
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
                100
            ],
            "currentBillingSubscription": [
                100
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                464
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                85
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
                97
            ],
            "name": [
                1
            ],
            "prices": [
                91
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
                97
            ],
            "name": [
                1
            ],
            "prices": [
                92
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
                86
            ],
            "meteredProducts": [
                87
            ],
            "planKey": [
                90
            ],
            "resourceCreditProducts": [
                86
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                9
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                106
            ],
            "recurringInterval": [
                463
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                106
            ],
            "recurringInterval": [
                463
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceTier": {
            "flatAmount": [
                9
            ],
            "unitAmount": [
                9
            ],
            "upTo": [
                9
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
                97
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
                97
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                86
            ],
            "on_BillingMeteredProduct": [
                87
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
                90
            ],
            "priceUsageBased": [
                106
            ],
            "productKey": [
                96
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "grantedCredits": [
                9
            ],
            "periodEnd": [
                186
            ],
            "periodStart": [
                186
            ],
            "productKey": [
                96
            ],
            "rolloverCredits": [
                9
            ],
            "totalGrantedCredits": [
                9
            ],
            "unitPriceCents": [
                9
            ],
            "usedCredits": [
                9
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
                101
            ],
            "cancelAt": [
                186
            ],
            "currentPeriodEnd": [
                186
            ],
            "id": [
                479
            ],
            "interval": [
                463
            ],
            "metadata": [
                287
            ],
            "phases": [
                102
            ],
            "status": [
                464
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                95
            ],
            "creditAmount": [
                9
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                479
            ],
            "quantity": [
                9
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                9
            ],
            "items": [
                103
            ],
            "start_date": [
                9
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
                9
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                9
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
                100
            ],
            "currentBillingSubscription": [
                100
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
                479
            ],
            "contactAutoCreationPolicy": [
                109
            ],
            "createdAt": [
                186
            ],
            "handle": [
                1
            ],
            "id": [
                479
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                110
            ],
            "syncStageStartedAt": [
                186
            ],
            "syncStatus": [
                111
            ],
            "syncedAt": [
                186
            ],
            "throttleFailureCount": [
                9
            ],
            "updatedAt": [
                186
            ],
            "visibility": [
                112
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
                603
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "duplicateEmails": [
                7
            ],
            "globallyUnsubscribed": [
                7
            ],
            "hardSuppressed": [
                7
            ],
            "sendable": [
                7
            ],
            "topicUnsubscribed": [
                7
            ],
            "totalMembers": [
                7
            ],
            "trackingRefused": [
                7
            ],
            "withoutEmail": [
                7
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
                7
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                120
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
                603
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                287
            ],
            "error": [
                125
            ],
            "maxSeq": [
                7
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
                603
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                9
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
                9
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
                9
            ],
            "maxScoreLevels": [
                9
            ],
            "medianLatencyMs": [
                9
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                9
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
                9
            ],
            "costPerTask": [
                9
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
                9
            ],
            "intelligenceIndex": [
                9
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
                9
            ],
            "modelFamily": [
                340
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                342
            ],
            "outputCostPerMillionTokens": [
                9
            ],
            "outputTokensPerSecond": [
                9
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                129
            ],
            "aiModelTiers": [
                131
            ],
            "aiModels": [
                130
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                25
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                64
            ],
            "billing": [
                81
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                119
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
                133
            ],
            "publicFeatureFlags": [
                389
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                448
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                465
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                186
            ],
            "link": [
                1
            ],
            "startAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                22
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
                479
            ],
            "availabilityObjectMetadataId": [
                479
            ],
            "availabilityType": [
                136
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                479
            ],
            "createdAt": [
                186
            ],
            "engineComponentKey": [
                220
            ],
            "frontComponent": [
                261
            ],
            "frontComponentId": [
                479
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                479
            ],
            "pageLayoutId": [
                479
            ],
            "payload": [
                137
            ],
            "position": [
                9
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "workflowVersionId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                352
            ],
            "on_PathCommandMenuItemPayload": [
                377
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                47
            ],
            "files": [
                252
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                479
            ],
            "archivedAt": [
                186
            ],
            "authFailedAt": [
                186
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                391
            ],
            "connectionProviderId": [
                479
            ],
            "createdAt": [
                186
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                479
            ],
            "lastCredentialsRefreshedAt": [
                186
            ],
            "lastSignedInAt": [
                186
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
                186
            ],
            "userWorkspaceId": [
                479
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
                273
            ],
            "handle": [
                1
            ],
            "id": [
                479
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                213
            ],
            "host": [
                1
            ],
            "password": [
                1
            ],
            "port": [
                9
            ],
            "username": [
                1
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
                287
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
                287
            ],
            "roleId": [
                479
            ],
            "triggers": [
                287
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                479
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                320
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                48
            ],
            "targets": [
                50
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                54
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
                479
            ],
            "availabilityType": [
                136
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                479
            ],
            "engineComponentKey": [
                220
            ],
            "frontComponentId": [
                479
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
                479
            ],
            "pageLayoutId": [
                479
            ],
            "payload": [
                287
            ],
            "position": [
                9
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                479
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
                314
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
                287
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
                287
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                479
            ],
            "options": [
                287
            ],
            "relationCreationPayload": [
                287
            ],
            "settings": [
                287
            ],
            "type": [
                247
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
                479
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
                479
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
                158
            ],
            "indexType": [
                280
            ],
            "objectMetadataId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                287
            ],
            "databaseEventTriggerSettings": [
                287
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                287
            ],
            "id": [
                479
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                287
            ],
            "source": [
                287
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                287
            ],
            "universalIdentifier": [
                479
            ],
            "workflowActionTriggerSettings": [
                287
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
                479
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
                479
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                479
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                479
            ],
            "targetRecordId": [
                479
            ],
            "type": [
                344
            ],
            "userWorkspaceId": [
                479
            ],
            "viewId": [
                479
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
                287
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
                156
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                159
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                163
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
                479
            ],
            "type": [
                370
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                369
            ],
            "pageLayoutId": [
                479
            ],
            "position": [
                9
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
                287
            ],
            "objectMetadataId": [
                479
            ],
            "pageLayoutTabId": [
                479
            ],
            "position": [
                287
            ],
            "title": [
                1
            ],
            "type": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                479
            ],
            "filter": [
                287
            ],
            "objectMetadataId": [
                479
            ],
            "orderBy": [
                287
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
                479
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                80
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                80
            ],
            "operationType": [
                563
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                570
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                572
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
                479
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                479
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                9
            ],
            "viewId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                17
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                479
            ],
            "viewId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                479
            ],
            "logicalOperator": [
                592
            ],
            "parentViewFilterGroupId": [
                479
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "operand": [
                593
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                479
            ],
            "subFieldName": [
                1
            ],
            "value": [
                287
            ],
            "viewFilterGroupId": [
                479
            ],
            "viewId": [
                479
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
                479
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "viewId": [
                479
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
                479
            ],
            "calendarFieldMetadataId": [
                479
            ],
            "calendarLayout": [
                586
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                479
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                595
            ],
            "mainGroupByFieldMetadataId": [
                479
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                479
            ],
            "openRecordIn": [
                596
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                599
            ],
            "visibility": [
                600
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                598
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                479
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
                479
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
                141
            ],
            "before": [
                141
            ],
            "first": [
                7
            ],
            "last": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventAction": {},
        "DateTime": {},
        "DeleteApprovedAccessDomainInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                479
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                479
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
                479
            ],
            "name": [
                263
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                479
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
                479
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                206
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
                479
            ],
            "pageLayoutId": [
                479
            ],
            "position": [
                9
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
                479
            ],
            "memberCount": [
                9
            ],
            "name": [
                1
            ],
            "position": [
                9
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
                479
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                434
            ],
            "type": [
                270
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                479
            ],
            "status": [
                434
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                142
            ],
            "IMAP": [
                142
            ],
            "SMTP": [
                142
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
                603
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                186
            ],
            "domain": [
                1
            ],
            "id": [
                479
            ],
            "status": [
                217
            ],
            "tenantStatus": [
                218
            ],
            "unsubscribeHostnameStatus": [
                481
            ],
            "updatedAt": [
                186
            ],
            "verificationRecords": [
                581
            ],
            "verifiedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "EngineComponentKey": {},
        "EnqueueJobInput": {
            "delayMs": [
                7
            ],
            "jobId": [
                1
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payload": [
                287
            ],
            "retryLimit": [
                7
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
                287
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
                7
            ],
            "jobs": [
                222
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                287
            ],
            "retryLimit": [
                7
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
                7
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
                186
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
                186
            ],
            "currentPeriodEnd": [
                186
            ],
            "expiresAt": [
                186
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
                186
            ],
            "start": [
                186
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
                230
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
                228
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                229
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
                231
            ],
            "first": [
                7
            ],
            "table": [
                236
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                232
            ],
            "records": [
                235
            ],
            "totalCount": [
                7
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
                287
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                186
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
                329
            ],
            "objectRecordEventsWithQueryIds": [
                359
            ],
            "queueJobEvents": [
                290
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                479
            ],
            "payload": [
                287
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                240
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
                479
            ],
            "createdAt": [
                186
            ],
            "defaultValue": [
                287
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                479
            ],
            "morphRelations": [
                410
            ],
            "name": [
                1
            ],
            "object": [
                346
            ],
            "objectMetadataId": [
                479
            ],
            "options": [
                287
            ],
            "relation": [
                410
            ],
            "settings": [
                287
            ],
            "type": [
                247
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                186
            ],
            "writability": [
                336
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                603
            ],
            "fieldDisplayMode": [
                244
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
                245
            ],
            "pageInfo": [
                366
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                141
            ],
            "node": [
                241
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                246
            ],
            "id": [
                480
            ],
            "isActive": [
                107
            ],
            "isSystem": [
                107
            ],
            "isUIEditable": [
                107
            ],
            "isUIReadOnly": [
                107
            ],
            "objectMetadataId": [
                480
            ],
            "or": [
                246
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
                479
            ],
            "id": [
                479
            ],
            "objectMetadataId": [
                479
            ],
            "roleId": [
                479
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
                479
            ],
            "objectMetadataId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                603
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
                186
            ],
            "id": [
                479
            ],
            "path": [
                1
            ],
            "size": [
                9
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
                479
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
                186
            ],
            "fileId": [
                479
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
                186
            ],
            "id": [
                479
            ],
            "path": [
                1
            ],
            "size": [
                9
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
                603
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                479
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                434
            ],
            "type": [
                270
            ],
            "workspace": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "FindMessageSuppressionsInput": {
            "limit": [
                7
            ],
            "offset": [
                7
            ],
            "reason": [
                327
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                603
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
                479
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                59
            ],
            "applicationVariables": [
                287
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
                186
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                479
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
                479
            ],
            "updatedAt": [
                186
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
                603
            ],
            "frontComponentId": [
                479
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                479
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
                479
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
                479
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
                479
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
                479
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
                9
            ],
            "columnSpan": [
                9
            ],
            "row": [
                9
            ],
            "rowSpan": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                603
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
                274
            ],
            "IMAP": [
                274
            ],
            "SMTP": [
                274
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
                213
            ],
            "host": [
                1
            ],
            "port": [
                9
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
                65
            ],
            "workspace": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                186
            ],
            "id": [
                479
            ],
            "indexFieldMetadataList": [
                278
            ],
            "indexType": [
                280
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
                186
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                141
            ],
            "node": [
                276
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                186
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "order": [
                9
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                279
            ],
            "id": [
                480
            ],
            "isCustom": [
                107
            ],
            "or": [
                279
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                479
            ],
            "messages": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                283
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
                479
            ],
            "messageThreadId": [
                479
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
                7
            ],
            "enqueuedAt": [
                9
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                9
            ],
            "jobId": [
                1
            ],
            "progress": [
                7
            ],
            "startedAt": [
                9
            ],
            "state": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                479
            ],
            "aggregateOperation": [
                17
            ],
            "axisNameDisplay": [
                73
            ],
            "color": [
                1
            ],
            "configurationType": [
                603
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
                287
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "isCumulative": [
                4
            ],
            "isStacked": [
                4
            ],
            "numberFormat": [
                122
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                360
            ],
            "primaryAxisGroupByFieldMetadataId": [
                479
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                268
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                360
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                479
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                268
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
                287
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                295
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
                287
            ],
            "objectMetadataId": [
                479
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
                9
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "data": [
                294
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                9
            ],
            "lng": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "applicationId": [
                479
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                186
            ],
            "cronTriggerSettings": [
                287
            ],
            "databaseEventTriggerSettings": [
                287
            ],
            "description": [
                1
            ],
            "executionMode": [
                300
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                287
            ],
            "id": [
                479
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
                9
            ],
            "toolTriggerSettings": [
                287
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "workflowActionTriggerSettings": [
                287
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                287
            ],
            "duration": [
                9
            ],
            "error": [
                287
            ],
            "logs": [
                1
            ],
            "status": [
                302
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                8
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                479
            ],
            "applicationUniversalIdentifier": [
                479
            ],
            "id": [
                479
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                65
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
                7
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
                287
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
                309
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                55
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
                310
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                311
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
                603
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                139
            ],
            "connectedAccountId": [
                479
            ],
            "contactAutoCreationPolicy": [
                315
            ],
            "createdAt": [
                186
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
                479
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                322
            ],
            "pendingGroupEmailsAction": [
                316
            ],
            "syncStage": [
                317
            ],
            "syncStageStartedAt": [
                186
            ],
            "syncStatus": [
                318
            ],
            "syncedAt": [
                186
            ],
            "throttleFailureCount": [
                9
            ],
            "throttleRetryAfter": [
                186
            ],
            "type": [
                319
            ],
            "updatedAt": [
                186
            ],
            "visibility": [
                320
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
                186
            ],
            "externalId": [
                1
            ],
            "id": [
                479
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                479
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                323
            ],
            "updatedAt": [
                186
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
                186
            ],
            "emailAddress": [
                1
            ],
            "id": [
                479
            ],
            "reason": [
                327
            ],
            "source": [
                328
            ],
            "unsubscribeTopicId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                325
            ],
            "totalCount": [
                7
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
                358
            ],
            "recordId": [
                1
            ],
            "type": [
                330
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
                479
            ],
            "property": [
                1
            ],
            "provenance": [
                334
            ],
            "recordId": [
                479
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
                479
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                134
            ],
            "objectMetadataItems": [
                338
            ],
            "views": [
                339
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
                479
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
                479
            ],
            "key": [
                595
            ],
            "objectMetadataId": [
                479
            ],
            "type": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                457,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                608,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                479,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        479,
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
                10,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        479,
                        "UUID!"
                    ],
                    "roleId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        479,
                        "UUID!"
                    ],
                    "roleId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                68,
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
                118,
                {
                    "input": [
                        117,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                105
            ],
            "cancelSwitchBillingPlan": [
                105
            ],
            "cancelSwitchResourceCreditPrice": [
                105
            ],
            "checkCustomDomainValidRecords": [
                207
            ],
            "checkPublicDomainValidRecords": [
                207,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                99,
                {
                    "plan": [
                        90,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        463,
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
                54,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                54,
                {
                    "fileId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                138,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        479,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                364,
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
                256,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                256,
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
                256,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                256,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApiKey": [
                26,
                {
                    "input": [
                        144,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                314,
                {
                    "input": [
                        145,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                146,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        49,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                147,
                {
                    "input": [
                        148,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                62,
                {
                    "input": [
                        149,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                88
            ],
            "createCalendarEvent": [
                151,
                {
                    "input": [
                        150,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                6
            ],
            "createCommandMenuItem": [
                135,
                {
                    "input": [
                        152,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                205,
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
                154,
                {
                    "input": [
                        153,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                216,
                {
                    "input": [
                        155,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                255,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        254,
                        "FileFolder!"
                    ],
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        9,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                261,
                {
                    "input": [
                        157,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                343,
                {
                    "inputs": [
                        162,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                589,
                {
                    "inputs": [
                        176,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                588,
                {
                    "inputs": [
                        177,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                594,
                {
                    "inputs": [
                        180,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                325,
                {
                    "input": [
                        161,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                343,
                {
                    "input": [
                        162,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                255,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        9,
                        "Float!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                454,
                {
                    "input": [
                        452,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                23,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        479,
                        "UUID!"
                    ],
                    "properties": [
                        287
                    ],
                    "recordId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        143,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                241,
                {
                    "input": [
                        164,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                276,
                {
                    "input": [
                        165,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                299,
                {
                    "input": [
                        160,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                346,
                {
                    "input": [
                        166,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                417,
                {
                    "createRoleInput": [
                        171,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                367,
                {
                    "input": [
                        167,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                368,
                {
                    "input": [
                        168,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                371,
                {
                    "input": [
                        169,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                388,
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
                454,
                {
                    "input": [
                        453,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                457,
                {
                    "input": [
                        172,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                88,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        90,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        463,
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
                482,
                {
                    "input": [
                        173,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                561,
                {
                    "input": [
                        174,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                580,
                {
                    "input": [
                        175,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                585,
                {
                    "input": [
                        181,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                588,
                {
                    "input": [
                        177,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                589,
                {
                    "input": [
                        176,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                590,
                {
                    "input": [
                        179,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                591,
                {
                    "input": [
                        178,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                594,
                {
                    "input": [
                        180,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                597,
                {
                    "input": [
                        182,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                601,
                {
                    "input": [
                        183,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                457,
                {
                    "id": [
                        479,
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
                        31
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                314,
                {
                    "id": [
                        479,
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
                        187,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                135,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                139,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                608
            ],
            "deleteEmailGroupChannel": [
                314,
                {
                    "id": [
                        479,
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
                261,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                343,
                {
                    "ids": [
                        479,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                343,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                3,
                {
                    "input": [
                        11,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                241,
                {
                    "input": [
                        188,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                276,
                {
                    "input": [
                        189,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                299,
                {
                    "input": [
                        303,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                346,
                {
                    "input": [
                        190,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        479,
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
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                191,
                {
                    "input": [
                        192,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                457,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                193,
                {
                    "twoFactorAuthenticationMethodId": [
                        479,
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
                        479,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                574
            ],
            "deleteUserFromWorkspace": [
                577,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                580,
                {
                    "id": [
                        479,
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
                588,
                {
                    "input": [
                        195,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                589,
                {
                    "input": [
                        194,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                590,
                {
                    "input": [
                        196,
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
                594,
                {
                    "input": [
                        197,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        198,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                601,
                {
                    "id": [
                        479,
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
                588,
                {
                    "input": [
                        201,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                589,
                {
                    "input": [
                        200,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                590,
                {
                    "input": [
                        202,
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
                594,
                {
                    "input": [
                        203,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        204,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                139,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                208,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                209,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                210,
                {
                    "input": [
                        211,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                214,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        479
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                83
            ],
            "enqueueJob": [
                223,
                {
                    "input": [
                        221,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                225,
                {
                    "input": [
                        224,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                612
            ],
            "executeOneLogicFunction": [
                301,
                {
                    "input": [
                        238,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                28,
                {
                    "apiKeyId": [
                        479,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                59,
                {
                    "applicationId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                65
            ],
            "generateTransientToken": [
                473
            ],
            "getAuthTokensFromLoginToken": [
                67,
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
                67,
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
                67,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                265,
                {
                    "input": [
                        266,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                306,
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
                363
            ],
            "grantApplicationCapabilities": [
                38,
                {
                    "input": [
                        267,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                275,
                {
                    "userId": [
                        479,
                        "UUID!"
                    ],
                    "workspaceId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                282,
                {
                    "input": [
                        281,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                284,
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
                284
            ],
            "installApplication": [
                36,
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
            "markAgentChatThreadAsRead": [
                10,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                10,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                10,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                226
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        412,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                404,
                {
                    "principal": [
                        401,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        409,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                59,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                67,
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
                        413,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                414,
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
                444,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                135,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                368,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                367,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                371,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                468,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                437,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                7
            ],
            "revokeApiKey": [
                26,
                {
                    "input": [
                        415,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                419,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                430,
                {
                    "input": [
                        426,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                52,
                {
                    "applicationId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                272,
                {
                    "connectionParameters": [
                        212,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        479
                    ]
                }
            ],
            "sendChatMessage": [
                437,
                {
                    "browsingContext": [
                        287
                    ],
                    "fileAttachments": [
                        253,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        479,
                        "[UUID!]"
                    ],
                    "messageId": [
                        479,
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
                        479,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                440,
                {
                    "input": [
                        439,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                443,
                {
                    "input": [
                        442,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                444,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        479
                    ]
                }
            ],
            "sendMessageCampaign": [
                446,
                {
                    "input": [
                        445,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                441,
                {
                    "input": [
                        447,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                30,
                {
                    "input": [
                        449,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                226,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                404,
                {
                    "accessLevel": [
                        400,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        409,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                404,
                {
                    "accessLevel": [
                        400,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        401,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        409,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                105,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                72,
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
                72,
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
                455,
                {
                    "input": [
                        456
                    ]
                }
            ],
            "signUpInWorkspace": [
                455,
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
                        479
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
                364,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "snoozeAgentChatThread": [
                10,
                {
                    "snoozedUntil": [
                        186,
                        "DateTime!"
                    ],
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                121,
                {
                    "connectedAccountId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                459,
                {
                    "companyContext": [
                        287
                    ],
                    "personContext": [
                        287
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                460
            ],
            "subscribeToAgentChatThread": [
                10,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "switchBillingPlan": [
                105
            ],
            "switchSubscriptionInterval": [
                105
            ],
            "syncApplication": [
                622,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        287,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                23,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        287
                    ],
                    "type": [
                        24,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                54,
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
                475,
                {
                    "input": [
                        474,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                477,
                {
                    "input": [
                        476,
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
                10,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "updateApiKey": [
                26,
                {
                    "input": [
                        485,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                314,
                {
                    "input": [
                        486,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                36,
                {
                    "id": [
                        479,
                        "UUID!"
                    ],
                    "input": [
                        487,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                54,
                {
                    "input": [
                        488,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                58,
                {
                    "input": [
                        490,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                108,
                {
                    "input": [
                        492,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                135,
                {
                    "input": [
                        494,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                314,
                {
                    "input": [
                        495,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                261,
                {
                    "input": [
                        497,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                239,
                {
                    "input": [
                        499,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                343,
                {
                    "inputs": [
                        510,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                346,
                {
                    "inputs": [
                        511,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                594,
                {
                    "inputs": [
                        533,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                314,
                {
                    "input": [
                        502,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                321,
                {
                    "input": [
                        504,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                321,
                {
                    "input": [
                        506,
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
                343,
                {
                    "input": [
                        510,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        484,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        479
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
                241,
                {
                    "input": [
                        509,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        500,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                346,
                {
                    "input": [
                        511,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                417,
                {
                    "updateRoleInput": [
                        518,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                367,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        512,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                368,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        513,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                371,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        515,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                367,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        517,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                285,
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
                457,
                {
                    "input": [
                        520,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                468,
                {
                    "input": [
                        521,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                482,
                {
                    "input": [
                        522,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                561,
                {
                    "input": [
                        523,
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
                580,
                {
                    "input": [
                        524,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                585,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        535,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                588,
                {
                    "input": [
                        528,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                589,
                {
                    "input": [
                        526,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                590,
                {
                    "input": [
                        531,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                591,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        530,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                594,
                {
                    "input": [
                        533,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                597,
                {
                    "input": [
                        536,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                601,
                {
                    "input": [
                        538,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                608,
                {
                    "data": [
                        541,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                608,
                {
                    "data": [
                        540,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                617,
                {
                    "roleId": [
                        479,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        542,
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
                54,
                {
                    "file": [
                        543,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                252,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        543,
                        "Upload!"
                    ],
                    "fileFolder": [
                        254,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                256,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        543,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                256,
                {
                    "file": [
                        543,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                256,
                {
                    "file": [
                        543,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                256,
                {
                    "file": [
                        543,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                248,
                {
                    "upsertFieldPermissionsInput": [
                        544,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                585,
                {
                    "input": [
                        547,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                354,
                {
                    "upsertObjectPermissionsInput": [
                        548,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                418,
                {
                    "upsertPermissionFlagsInput": [
                        549,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                551,
                {
                    "input": [
                        550,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                585,
                {
                    "input": [
                        552,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                62,
                {
                    "input": [
                        578,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                582,
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
                72,
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
                216,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                583,
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
                479
            ],
            "color": [
                1
            ],
            "createdAt": [
                186
            ],
            "folderId": [
                479
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                479
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                479
            ],
            "targetRecordId": [
                479
            ],
            "targetRecordIdentifier": [
                397
            ],
            "type": [
                344
            ],
            "updatedAt": [
                186
            ],
            "userWorkspaceId": [
                479
            ],
            "viewId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                479
            ],
            "color": [
                1
            ],
            "createdAt": [
                186
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                349,
                {
                    "filter": [
                        246,
                        "FieldFilter!"
                    ],
                    "paging": [
                        184,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                241
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "imageIdentifierFieldMetadataId": [
                479
            ],
            "indexMetadataList": [
                276
            ],
            "indexMetadatas": [
                351,
                {
                    "filter": [
                        279,
                        "IndexFilter!"
                    ],
                    "paging": [
                        184,
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
                479
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
                353
            ],
            "readability": [
                331
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                479
            ],
            "searchFieldMetadataList": [
                436
            ],
            "sharingReach": [
                361
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                186
            ],
            "writability": [
                336
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                348
            ],
            "pageInfo": [
                366
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                141
            ],
            "node": [
                346
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                245
            ],
            "pageInfo": [
                366
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                350
            ],
            "id": [
                480
            ],
            "isActive": [
                107
            ],
            "isRemote": [
                107
            ],
            "isSearchable": [
                107
            ],
            "isSystem": [
                107
            ],
            "isUICreatable": [
                107
            ],
            "isUIEditable": [
                107
            ],
            "isUIReadOnly": [
                107
            ],
            "or": [
                350
            ],
            "universalIdentifier": [
                480
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                277
            ],
            "pageInfo": [
                366
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                479
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
                479
            ],
            "restrictedFields": [
                287
            ],
            "rowLevelPermissionPredicateGroups": [
                421
            ],
            "rowLevelPermissionPredicates": [
                420
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
                479
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
                7
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordEvent": {
            "action": [
                185
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                358
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
                287
            ],
            "before": [
                287
            ],
            "diff": [
                287
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
                357
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
                362
            ],
            "previousOnboardingStatus": [
                362
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
                141
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                141
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                479
            ],
            "createdAt": [
                186
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                479
            ],
            "deletedAt": [
                186
            ],
            "id": [
                479
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
                479
            ],
            "tabs": [
                368
            ],
            "type": [
                370
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                479
            ],
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                369
            ],
            "pageLayoutId": [
                479
            ],
            "position": [
                9
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "widgets": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                479
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                287
            ],
            "configuration": [
                602
            ],
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "gridPosition": [
                269
            ],
            "id": [
                479
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
                479
            ],
            "pageLayoutTabId": [
                479
            ],
            "position": [
                374
            ],
            "title": [
                1
            ],
            "type": [
                604
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                369
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "column": [
                7
            ],
            "columnSpan": [
                7
            ],
            "layoutMode": [
                369
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
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetCanvasPosition": [
                372
            ],
            "on_PageLayoutWidgetGridPosition": [
                373
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                375
            ],
            "index": [
                7
            ],
            "layoutMode": [
                369
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
                479
            ],
            "createdAt": [
                186
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                479
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                479
            ],
            "aggregateOperation": [
                17
            ],
            "color": [
                1
            ],
            "configurationType": [
                603
            ],
            "dateGranularity": [
                360
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
                287
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupByFieldMetadataId": [
                479
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
                122
            ],
            "orderBy": [
                268
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
                383
            ],
            "formattedToRawLookup": [
                287
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
                287
            ],
            "objectMetadataId": [
                479
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
                9
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
                298
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
                479
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
                213
            ],
            "host": [
                1
            ],
            "port": [
                9
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
                479
            ],
            "createdAt": [
                186
            ],
            "domain": [
                1
            ],
            "id": [
                479
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
                240
            ],
            "metadata": [
                390
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
                387
            ],
            "IMAP": [
                387
            ],
            "SMTP": [
                387
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                63
            ],
            "authProviders": [
                64
            ],
            "displayName": [
                1
            ],
            "id": [
                479
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                626
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
                479
            ],
            "logo": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "agentRuns": [
                14,
                {
                    "agentId": [
                        479,
                        "UUID!"
                    ],
                    "limit": [
                        7,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                18
            ],
            "apiKey": [
                26,
                {
                    "input": [
                        264,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                26
            ],
            "appConnection": [
                29,
                {
                    "id": [
                        8,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                29,
                {
                    "filter": [
                        296
                    ]
                }
            ],
            "appKeyValue": [
                30,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        31
                    ]
                }
            ],
            "appMessageChannels": [
                314,
                {
                    "filter": [
                        297
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                39,
                {
                    "applicationId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                40,
                {
                    "applicationId": [
                        479,
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
                435,
                {
                    "applicationId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                75,
                {
                    "input": [
                        76,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                99,
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
                479,
                {
                    "calendarEventId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                12,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                124,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                6,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                127,
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
                616,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                461,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                135,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                135
            ],
            "currentUser": [
                574
            ],
            "currentUserApplicationAuthorizations": [
                37
            ],
            "currentUserSessions": [
                576
            ],
            "currentWorkspace": [
                608
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
                227
            ],
            "eventLogs": [
                234,
                {
                    "input": [
                        233,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                42,
                {
                    "universalIdentifier": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                241,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                243,
                {
                    "filter": [
                        246,
                        "FieldFilter!"
                    ],
                    "paging": [
                        184,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                386,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                54,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                56,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                58,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                128,
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
                290,
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
                54
            ],
            "findManyApplications": [
                36
            ],
            "findManyLogicFunctions": [
                299
            ],
            "findManyMarketplaceApps": [
                307,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                388
            ],
            "findMarketplaceAppDetail": [
                308,
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
                        11,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                36,
                {
                    "id": [
                        479
                    ],
                    "universalIdentifier": [
                        479
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                54,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                299,
                {
                    "input": [
                        303,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                290,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                610
            ],
            "findWorkspaceFromInviteHash": [
                608,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                615
            ],
            "frontComponent": [
                261,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                261
            ],
            "getAddressDetails": [
                384,
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
                20
            ],
            "getApiKeyRoles": [
                417
            ],
            "getApprovedAccessDomains": [
                62
            ],
            "getAutoCompleteAddress": [
                69,
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
                287,
                {
                    "input": [
                        303,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                140,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                216
            ],
            "getInviteSuggestions": [
                286
            ],
            "getJobs": [
                290,
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
                        303,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                367,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                368,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                368,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                371,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                371,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                367,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        370
                    ]
                }
            ],
            "getPermissionFlags": [
                378
            ],
            "getPublicWorkspaceDataByDomain": [
                392,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                393,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                98
            ],
            "getRole": [
                417,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                417
            ],
            "getSSOIdentityProviders": [
                258
            ],
            "getToolIndex": [
                472
            ],
            "getToolInputSchema": [
                287,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                558,
                {
                    "input": [
                        559
                    ]
                }
            ],
            "getView": [
                585,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                588,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                589,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                589,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                588,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                590,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                591,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                591,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                590,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                594,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                594,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                597,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                597,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                585,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        599,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                613
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
                292,
                {
                    "input": [
                        293,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                89
            ],
            "messageSuppressions": [
                326,
                {
                    "input": [
                        259,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                332,
                {
                    "input": [
                        335,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                337
            ],
            "mostlyEmptyFieldMetadataIds": [
                479,
                {
                    "objectMetadataId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "myAppPreferencesApplicationVariables": [
                575,
                {
                    "applicationUniversalIdentifier": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "myAppPreferencesApplications": [
                34
            ],
            "myAppPreferencesSettingsMenuItems": [
                35,
                {
                    "applicationUniversalIdentifier": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                108,
                {
                    "connectedAccountId": [
                        479
                    ]
                }
            ],
            "myConnectedAccounts": [
                139
            ],
            "myMessageChannels": [
                314,
                {
                    "connectedAccountId": [
                        479
                    ]
                }
            ],
            "myMessageFolders": [
                321,
                {
                    "messageChannelId": [
                        479
                    ]
                }
            ],
            "myUserApplicationVariables": [
                618
            ],
            "navigationMenuItem": [
                343,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                343
            ],
            "object": [
                346,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                356
            ],
            "objects": [
                347,
                {
                    "filter": [
                        350,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        184,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                381,
                {
                    "input": [
                        382,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                116,
                {
                    "input": [
                        385,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                308,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                307,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                399,
                {
                    "targets": [
                        409,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                404,
                {
                    "target": [
                        409,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                457,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                457
            ],
            "timelineActivityTypes": [
                468
            ],
            "unsubscribeTopics": [
                482
            ],
            "usageLimits": [
                561
            ],
            "usageQuotaDefinitions": [
                565
            ],
            "usageQuotaScopeConsumption": [
                567,
                {
                    "input": [
                        568,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                569
            ],
            "validatePasswordResetToken": [
                579,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                580,
                {
                    "objectMetadataId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                601,
                {
                    "id": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                479
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
                479
            ],
            "progress": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "RecordIdentifier": {
            "id": [
                479
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
                479
            ],
            "permissions": [
                398
            ],
            "recordId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                479
            ],
            "workspaceMemberId": [
                479
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
                400
            ],
            "generalAccessLevel": [
                400
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                398
            ],
            "roles": [
                407
            ],
            "shares": [
                405
            ],
            "sharingMode": [
                406
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                400
            ],
            "id": [
                8
            ],
            "principalId": [
                479
            ],
            "principalRoleId": [
                479
            ],
            "principalType": [
                402
            ],
            "rowCause": [
                403
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
                479
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
                603
            ],
            "isUIEditable": [
                4
            ],
            "recordLimit": [
                7
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
                479
            ],
            "recordId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                241
            ],
            "sourceObjectMetadata": [
                346
            ],
            "targetFieldMetadata": [
                241
            ],
            "targetObjectMetadata": [
                346
            ],
            "type": [
                411
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
                8
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
                479
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
                27
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
                248
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                354
            ],
            "permissionFlags": [
                418
            ],
            "rowLevelPermissionPredicateGroups": [
                421
            ],
            "rowLevelPermissionPredicates": [
                420
            ],
            "universalIdentifier": [
                479
            ],
            "workspaceMembers": [
                617
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
                479
            ],
            "roleId": [
                479
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
                425
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
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
                287
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
                423
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
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
                479
            ],
            "logicalOperator": [
                423
            ],
            "objectMetadataId": [
                479
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                479
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateInput": {
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "operand": [
                425
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
            ],
            "rowLevelPermissionPredicateGroupId": [
                479
            ],
            "subFieldName": [
                1
            ],
            "value": [
                287
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
                428
            ],
            "messages": [
                428
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                479
            ],
            "thread": [
                431
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                479
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
                427
            ],
            "content": [
                1
            ],
            "role": [
                429
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
                287
            ],
            "success": [
                4
            ],
            "threadId": [
                479
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
                479
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                434
            ],
            "type": [
                270
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                479
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                434
            ],
            "type": [
                270
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
                186
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                479
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                479
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
                438
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
                287
            ],
            "workspaceMemberId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                479
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
                615
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
                186
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                116
            ],
            "campaignId": [
                1
            ],
            "queuedCount": [
                7
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
                9
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
                31
            ],
            "value": [
                287
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                479
            ],
            "createdAt": [
                186
            ],
            "frontComponentId": [
                479
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "position": [
                9
            ],
            "scope": [
                451
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
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
                479
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
                479
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                434
            ],
            "type": [
                270
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                65
            ],
            "workspace": [
                627
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
                479
            ],
            "content": [
                1
            ],
            "createdAt": [
                186
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                186
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                416
            ],
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                625
            ],
            "thread": [
                6
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
                235,
                {
                    "fieldFilters": [
                        229,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        236,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                396,
                {
                    "input": [
                        170,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                304,
                {
                    "input": [
                        305,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        479,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                237,
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
                466
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
                603
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
                479
            ],
            "createdAt": [
                186
            ],
            "emit": [
                469
            ],
            "frontComponentUniversalIdentifier": [
                479
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                479
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                479
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                479
            ],
            "on": [
                1
            ],
            "through": [
                470
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                479
            ],
            "relationFieldUniversalIdentifier": [
                479
            ],
            "triggerFieldUniversalIdentifiers": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                603
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
                287
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
                65
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                479
            ],
            "gt": [
                479
            ],
            "gte": [
                479
            ],
            "iLike": [
                479
            ],
            "in": [
                479
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                479
            ],
            "lt": [
                479
            ],
            "lte": [
                479
            ],
            "neq": [
                479
            ],
            "notILike": [
                479
            ],
            "notIn": [
                479
            ],
            "notLike": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                186
            ],
            "description": [
                1
            ],
            "id": [
                479
            ],
            "name": [
                1
            ],
            "updatedAt": [
                186
            ],
            "visibility": [
                483
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
                479
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                287
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
                287
            ],
            "roleId": [
                479
            ],
            "triggers": [
                287
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
                479
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
                479
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                320
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
                489
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
                491
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
                479
            ],
            "update": [
                493
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                109
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                112
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                479
            ],
            "availabilityType": [
                136
            ],
            "engineComponentKey": [
                220
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                479
            ],
            "position": [
                9
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                287
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
                287
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                479
            ],
            "options": [
                287
            ],
            "settings": [
                287
            ],
            "translations": [
                333
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
                479
            ],
            "update": [
                498
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
                479
            ],
            "update": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                287
            ],
            "databaseEventTriggerSettings": [
                287
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                287
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
                9
            ],
            "toolTriggerSettings": [
                287
            ],
            "workflowActionTriggerSettings": [
                287
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                479
            ],
            "update": [
                503
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                315
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
                322
            ],
            "visibility": [
                320
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                479
            ],
            "update": [
                505
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
                479
            ],
            "update": [
                505
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
                479
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
                479
            ],
            "position": [
                9
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
                479
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
                479
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
                353
            ],
            "readability": [
                331
            ],
            "sharingReach": [
                361
            ],
            "shortcut": [
                1
            ],
            "translations": [
                333
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                479
            ],
            "update": [
                496
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                479
            ],
            "update": [
                507
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                479
            ],
            "update": [
                508
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
                479
            ],
            "type": [
                370
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
                369
            ],
            "position": [
                9
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
                479
            ],
            "layoutMode": [
                369
            ],
            "position": [
                9
            ],
            "title": [
                1
            ],
            "widgets": [
                516
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
                287
            ],
            "configuration": [
                287
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                479
            ],
            "pageLayoutTabId": [
                479
            ],
            "position": [
                287
            ],
            "title": [
                1
            ],
            "type": [
                604
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
                287
            ],
            "configuration": [
                287
            ],
            "id": [
                479
            ],
            "objectMetadataId": [
                479
            ],
            "pageLayoutTabId": [
                479
            ],
            "position": [
                287
            ],
            "title": [
                1
            ],
            "type": [
                604
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
                479
            ],
            "tabs": [
                514
            ],
            "type": [
                370
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                479
            ],
            "update": [
                519
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
                479
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
                479
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                333
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                479
            ],
            "payload": [
                174
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                479
            ],
            "update": [
                525
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
                479
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
                479
            ],
            "update": [
                527
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
                9
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                479
            ],
            "update": [
                529
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                17
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                479
            ],
            "logicalOperator": [
                592
            ],
            "parentViewFilterGroupId": [
                479
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                479
            ],
            "update": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                479
            ],
            "operand": [
                593
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                479
            ],
            "subFieldName": [
                1
            ],
            "value": [
                287
            ],
            "viewFilterGroupId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                479
            ],
            "update": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                479
            ],
            "fieldValue": [
                1
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
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
                479
            ],
            "calendarFieldMetadataId": [
                479
            ],
            "calendarLayout": [
                586
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                479
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                479
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                479
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                596
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                599
            ],
            "visibility": [
                600
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                479
            ],
            "update": [
                537
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                598
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
                479
            ],
            "update": [
                539
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
                19
            ],
            "aiChatModelTier": [
                19
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                287
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                479
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                9
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
                9
            ],
            "workspaceDiscoverability": [
                614
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                287
            ],
            "workspaceMemberId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                249
            ],
            "roleId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                479
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                545
            ],
            "id": [
                479
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                545
            ],
            "groups": [
                546
            ],
            "widgetId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                355
            ],
            "roleId": [
                479
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
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                479
            ],
            "predicateGroups": [
                422
            ],
            "predicates": [
                424
            ],
            "roleId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                421
            ],
            "predicates": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                556
            ],
            "viewFields": [
                553
            ],
            "viewFilterGroups": [
                554
            ],
            "viewFilters": [
                555
            ],
            "viewSorts": [
                557
            ],
            "widgetId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                17
            ],
            "fieldMetadataId": [
                479
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "size": [
                9
            ],
            "viewFieldId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                479
            ],
            "logicalOperator": [
                592
            ],
            "parentViewFilterGroupId": [
                479
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "operand": [
                593
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                479
            ],
            "subFieldName": [
                1
            ],
            "value": [
                287
            ],
            "viewFilterGroupId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                479
            ],
            "calendarFieldMetadataId": [
                479
            ],
            "calendarLayout": [
                586
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                479
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                479
            ],
            "openRecordIn": [
                596
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                598
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                186
            ],
            "periodStart": [
                186
            ],
            "timeSeries": [
                571
            ],
            "usageByApplication": [
                560
            ],
            "usageByModel": [
                560
            ],
            "usageByOperationType": [
                560
            ],
            "usageByUser": [
                560
            ],
            "userDailyUsage": [
                573
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                563
            ],
            "periodEnd": [
                186
            ],
            "periodStart": [
                186
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
                9
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
                80
            ],
            "createdAt": [
                186
            ],
            "id": [
                479
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                80
            ],
            "operationType": [
                563
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                570
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                572
            ],
            "updatedAt": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                572
            ],
            "operationType": [
                563
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                562
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                566
            ],
            "resourceType": [
                570
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                564
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
                563
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                80
            ],
            "periodEnd": [
                186
            ],
            "periodStart": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                563
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                570
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                80
            ],
            "id": [
                479
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                80
            ],
            "operationType": [
                563
            ],
            "periodEnd": [
                186
            ],
            "periodStart": [
                186
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                80
            ],
            "resourceType": [
                570
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
                572
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                9
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
                571
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
                71
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                186
            ],
            "currentUserWorkspace": [
                577
            ],
            "currentWorkspace": [
                608
            ],
            "deletedAt": [
                186
            ],
            "deletedWorkspaceMembers": [
                199
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
                479
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
                362
            ],
            "previousOnboardingStatus": [
                362
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                186
            ],
            "userVars": [
                288
            ],
            "userWorkspaces": [
                577
            ],
            "workspaceMember": [
                617
            ],
            "workspaceMembers": [
                617
            ],
            "workspaces": [
                577
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
                287
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
                186
            ],
            "expiresAt": [
                186
            ],
            "id": [
                479
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
                186
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "id": [
                479
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                354
            ],
            "objectsPermissions": [
                354
            ],
            "permissionFlags": [
                379
            ],
            "twoFactorAuthenticationMethodSummary": [
                478
            ],
            "updatedAt": [
                186
            ],
            "user": [
                574
            ],
            "userId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                479
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
                479
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
                479
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                479
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
                9
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
                65
            ],
            "workspaceUrls": [
                626
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
                7
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
                479
            ],
            "calendarEndFieldMetadataId": [
                479
            ],
            "calendarFieldMetadataId": [
                479
            ],
            "calendarLayout": [
                586
            ],
            "createdAt": [
                186
            ],
            "createdByUserWorkspaceId": [
                479
            ],
            "deletedAt": [
                186
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                479
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
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                479
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                595
            ],
            "mainGroupByFieldMetadataId": [
                479
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                479
            ],
            "openRecordIn": [
                596
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                599
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "viewFieldGroups": [
                589
            ],
            "viewFields": [
                588
            ],
            "viewFilterGroups": [
                591
            ],
            "viewFilters": [
                590
            ],
            "viewGroups": [
                594
            ],
            "viewSorts": [
                597
            ],
            "visibility": [
                600
            ],
            "workspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                17
            ],
            "applicationId": [
                479
            ],
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
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
                9
            ],
            "size": [
                9
            ],
            "universalIdentifier": [
                479
            ],
            "updatedAt": [
                186
            ],
            "viewFieldGroupId": [
                479
            ],
            "viewId": [
                479
            ],
            "workspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "id": [
                479
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
                9
            ],
            "updatedAt": [
                186
            ],
            "viewFields": [
                588
            ],
            "viewId": [
                479
            ],
            "workspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "operand": [
                593
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                479
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                186
            ],
            "value": [
                287
            ],
            "viewFilterGroupId": [
                479
            ],
            "viewId": [
                479
            ],
            "workspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "id": [
                479
            ],
            "logicalOperator": [
                592
            ],
            "parentViewFilterGroupId": [
                479
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                186
            ],
            "viewId": [
                479
            ],
            "workspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "fieldValue": [
                1
            ],
            "id": [
                479
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "updatedAt": [
                186
            ],
            "viewId": [
                479
            ],
            "workspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "direction": [
                598
            ],
            "fieldMetadataId": [
                479
            ],
            "id": [
                479
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                186
            ],
            "viewId": [
                479
            ],
            "workspaceId": [
                479
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
                479
            ],
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "description": [
                1
            ],
            "id": [
                479
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
                186
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                16
            ],
            "on_BarChartConfiguration": [
                74
            ],
            "on_CalendarConfiguration": [
                113
            ],
            "on_CallRecordingSummaryConfiguration": [
                114
            ],
            "on_CallRecordingTranscriptConfiguration": [
                115
            ],
            "on_ChatConfiguration": [
                123
            ],
            "on_ChatThreadsConfiguration": [
                126
            ],
            "on_EmailThreadConfiguration": [
                215
            ],
            "on_EmailsConfiguration": [
                219
            ],
            "on_FieldConfiguration": [
                242
            ],
            "on_FieldRichTextConfiguration": [
                250
            ],
            "on_FieldsConfiguration": [
                251
            ],
            "on_FilesConfiguration": [
                257
            ],
            "on_FormFieldConfiguration": [
                260
            ],
            "on_FrontComponentConfiguration": [
                262
            ],
            "on_IframeConfiguration": [
                271
            ],
            "on_LineChartConfiguration": [
                291
            ],
            "on_MessageCampaignBodyConfiguration": [
                312
            ],
            "on_MessageCampaignDetailsConfiguration": [
                313
            ],
            "on_NotesConfiguration": [
                345
            ],
            "on_PieChartConfiguration": [
                380
            ],
            "on_RecordTableConfiguration": [
                408
            ],
            "on_StandaloneRichTextConfiguration": [
                458
            ],
            "on_TasksConfiguration": [
                467
            ],
            "on_TimelineConfiguration": [
                471
            ],
            "on_ViewConfiguration": [
                587
            ],
            "on_WorkflowConfiguration": [
                605
            ],
            "on_WorkflowRunConfiguration": [
                606
            ],
            "on_WorkflowVersionConfiguration": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                609
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                19
            ],
            "aiChatModelTier": [
                19
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                287
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                82
            ],
            "billingEntitlements": [
                84
            ],
            "billingSubscriptions": [
                100
            ],
            "createdAt": [
                186
            ],
            "currentBillingSubscription": [
                100
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                417
            ],
            "deletedAt": [
                186
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                9
            ],
            "featureFlags": [
                239
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                479
            ],
            "installedApplications": [
                36
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
                479
            ],
            "metadataVersion": [
                9
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                9
            ],
            "updatedAt": [
                186
            ],
            "viewFields": [
                588
            ],
            "viewFilterGroups": [
                591
            ],
            "viewFilters": [
                590
            ],
            "viewGroups": [
                594
            ],
            "viewSorts": [
                597
            ],
            "views": [
                585
            ],
            "workspaceCustomApplication": [
                36
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                614
            ],
            "workspaceMembersCount": [
                9
            ],
            "workspaceUrls": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceActivationStatus": {},
        "WorkspaceAiStats": {
            "conversationsCount": [
                7
            ],
            "skillsCount": [
                7
            ],
            "toolsCount": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "WorkspaceCompanyEnrichmentResult": {
            "enrichment": [
                287
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                611
            ],
            "personEnrichment": [
                287
            ],
            "personOutcome": [
                624
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
                186
            ],
            "id": [
                479
            ],
            "roleId": [
                479
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
                7
            ],
            "colorScheme": [
                1
            ],
            "dateFormat": [
                619
            ],
            "id": [
                479
            ],
            "locale": [
                1
            ],
            "name": [
                263
            ],
            "numberFormat": [
                620
            ],
            "openRecordIn": [
                365
            ],
            "roles": [
                417
            ],
            "timeFormat": [
                621
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
                479
            ],
            "userWorkspaceId": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                479
            ],
            "variables": [
                575
            ],
            "workspaceMemberId": [
                479
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
                287
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
                479
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
                479
            ],
            "workspaceUrls": [
                626
            ],
            "__typename": [
                1
            ]
        }
    }
}