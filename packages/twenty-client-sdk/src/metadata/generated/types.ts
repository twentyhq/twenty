export default {
    "scalars": [
        1,
        4,
        6,
        8,
        10,
        11,
        17,
        19,
        21,
        24,
        26,
        33,
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
        482,
        484,
        486,
        546,
        566,
        573,
        575,
        589,
        595,
        596,
        598,
        599,
        601,
        602,
        603,
        606,
        607,
        612,
        614,
        617,
        622,
        623,
        624,
        627,
        628
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
                482
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
                482
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
                482
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
                186
            ],
            "deletedAt": [
                186
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
                186
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                186
            ],
            "id": [
                482
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                482
            ],
            "createdAt": [
                186
            ],
            "id": [
                482
            ],
            "parts": [
                15
            ],
            "processedAt": [
                186
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                482
            ],
            "status": [
                1
            ],
            "threadId": [
                482
            ],
            "turnId": [
                482
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
                482
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                482
            ],
            "messageId": [
                482
            ],
            "orderIndex": [
                8
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
                11
            ],
            "endedAt": [
                186
            ],
            "errorMessage": [
                1
            ],
            "id": [
                482
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
                186
            ],
            "status": [
                17
            ],
            "threadId": [
                482
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
                482
            ],
            "aggregateOperation": [
                19
            ],
            "configurationType": [
                606
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
                8
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
                8
            ],
            "sections": [
                23
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
                186
            ],
            "expiresAt": [
                186
            ],
            "id": [
                482
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
                482
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
                10
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
                33
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
                35
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
                482
            ],
            "role": [
                324
            ],
            "workspaceMemberId": [
                482
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
                482
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
                482
            ],
            "id": [
                482
            ],
            "logicFunctions": [
                299
            ],
            "logoFileId": [
                482
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
                482
            ],
            "settingsCustomTabFrontComponentId": [
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                482
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
                482
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                482
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
                482
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
                482
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
                482
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
                482
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
                482
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
                186
            ],
            "fileFolder": [
                254
            ],
            "fileId": [
                482
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
                482
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
                482
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
                8
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                8
            ],
            "versionDistribution": [
                587
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                482
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
                482
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
                482
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
                482
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
                482
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
                629
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
                482
            ],
            "aggregateOperation": [
                19
            ],
            "axisNameDisplay": [
                73
            ],
            "color": [
                1
            ],
            "configurationType": [
                606
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
                8
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
                482
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
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                360
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                482
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
                482
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
                482
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
                11
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
                11
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
                11
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
                11
            ],
            "totalGrantedCredits": [
                11
            ],
            "unitPriceCents": [
                11
            ],
            "usedCredits": [
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
                101
            ],
            "cancelAt": [
                186
            ],
            "currentPeriodEnd": [
                186
            ],
            "id": [
                482
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
                11
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                482
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
                103
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
                482
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
                482
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
                11
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
                606
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                606
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
                606
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
                606
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
                21
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
                27
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
                24
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
                482
            ],
            "availabilityObjectMetadataId": [
                482
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
                482
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
                482
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                482
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
                482
            ],
            "pageLayoutId": [
                482
            ],
            "payload": [
                137
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                482
            ],
            "updatedAt": [
                186
            ],
            "workflowVersionId": [
                482
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
                482
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
                482
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
                482
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
                482
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
                482
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                482
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
                11
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                482
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
                482
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
                482
            ],
            "engineComponentKey": [
                220
            ],
            "frontComponentId": [
                482
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
                482
            ],
            "pageLayoutId": [
                482
            ],
            "payload": [
                287
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                482
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
                482
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
                482
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
                482
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
                482
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
                482
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
                11
            ],
            "toolTriggerSettings": [
                287
            ],
            "universalIdentifier": [
                482
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
                482
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
                482
            ],
            "icon": [
                1
            ],
            "id": [
                482
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                482
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                482
            ],
            "targetRecordId": [
                482
            ],
            "type": [
                344
            ],
            "userWorkspaceId": [
                482
            ],
            "viewId": [
                482
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
                482
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
                482
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
                287
            ],
            "objectMetadataId": [
                482
            ],
            "pageLayoutTabId": [
                482
            ],
            "position": [
                287
            ],
            "title": [
                1
            ],
            "type": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                482
            ],
            "filter": [
                287
            ],
            "objectMetadataId": [
                482
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
                482
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
                486
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
                566
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                573
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                575
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                19
            ],
            "fieldMetadataId": [
                482
            ],
            "id": [
                482
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
                482
            ],
            "viewId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                482
            ],
            "logicalOperator": [
                595
            ],
            "parentViewFilterGroupId": [
                482
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                482
            ],
            "id": [
                482
            ],
            "operand": [
                596
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                482
            ],
            "subFieldName": [
                1
            ],
            "value": [
                287
            ],
            "viewFilterGroupId": [
                482
            ],
            "viewId": [
                482
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
                482
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                482
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
                482
            ],
            "calendarFieldMetadataId": [
                482
            ],
            "calendarLayout": [
                589
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                482
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                482
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                598
            ],
            "mainGroupByFieldMetadataId": [
                482
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                482
            ],
            "openRecordIn": [
                599
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                602
            ],
            "visibility": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                601
            ],
            "fieldMetadataId": [
                482
            ],
            "id": [
                482
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                482
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                482
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
                482
            ],
            "name": [
                263
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                482
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
                482
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
                482
            ],
            "pageLayoutId": [
                482
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
                482
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
                482
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
                482
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
                606
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
                482
            ],
            "status": [
                217
            ],
            "tenantStatus": [
                218
            ],
            "unsubscribeHostnameStatus": [
                484
            ],
            "updatedAt": [
                186
            ],
            "verificationRecords": [
                584
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
                606
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
                287
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
                8
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
                8
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
                482
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
                482
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
                482
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
                482
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
                482
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
                606
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
                483
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
                483
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
                482
            ],
            "id": [
                482
            ],
            "objectMetadataId": [
                482
            ],
            "roleId": [
                482
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
                482
            ],
            "objectMetadataId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                606
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
                482
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
                482
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
                482
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
                482
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
                606
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                482
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
                626
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
                327
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                606
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
                482
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
                482
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
                482
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
                606
            ],
            "frontComponentId": [
                482
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                482
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
                482
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
                482
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
                482
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
                482
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
                606
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
                65
            ],
            "workspace": [
                630
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
                482
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
                482
            ],
            "id": [
                482
            ],
            "order": [
                11
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
                483
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
                482
            ],
            "messages": [
                34
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
                482
            ],
            "messageThreadId": [
                482
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
                289
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                482
            ],
            "aggregateOperation": [
                19
            ],
            "axisNameDisplay": [
                73
            ],
            "color": [
                1
            ],
            "configurationType": [
                606
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
                8
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
                482
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
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                360
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                482
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
                482
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
                482
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
                482
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
                482
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
                287
            ],
            "universalIdentifier": [
                482
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
                11
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                482
            ],
            "applicationUniversalIdentifier": [
                482
            ],
            "id": [
                482
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                482
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
                606
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                606
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
                482
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
                482
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
                11
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
                482
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                482
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
                482
            ],
            "reason": [
                327
            ],
            "source": [
                328
            ],
            "unsubscribeTopicId": [
                482
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
                482
            ],
            "property": [
                1
            ],
            "provenance": [
                334
            ],
            "recordId": [
                482
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
                482
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                482
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
                482
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
                482
            ],
            "key": [
                598
            ],
            "objectMetadataId": [
                482
            ],
            "type": [
                602
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                611,
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
                        482
                    ],
                    "threadId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        482,
                        "UUID!"
                    ],
                    "roleId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        482,
                        "UUID!"
                    ],
                    "roleId": [
                        482,
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
                        482,
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
                        482,
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
                28,
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
                9
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
                        11,
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
                592,
                {
                    "inputs": [
                        176,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                591,
                {
                    "inputs": [
                        177,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                597,
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
                454,
                {
                    "input": [
                        452,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                25,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        482,
                        "UUID!"
                    ],
                    "properties": [
                        287
                    ],
                    "recordId": [
                        482,
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
                485,
                {
                    "input": [
                        173,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                564,
                {
                    "input": [
                        174,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                583,
                {
                    "input": [
                        175,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                588,
                {
                    "input": [
                        181,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                591,
                {
                    "input": [
                        177,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                592,
                {
                    "input": [
                        176,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                593,
                {
                    "input": [
                        179,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                594,
                {
                    "input": [
                        178,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                597,
                {
                    "input": [
                        180,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                600,
                {
                    "input": [
                        182,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                604,
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
                        482,
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
                        33
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                314,
                {
                    "id": [
                        482,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                139,
                {
                    "id": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                611
            ],
            "deleteEmailGroupChannel": [
                314,
                {
                    "id": [
                        482,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                343,
                {
                    "ids": [
                        482,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                343,
                {
                    "id": [
                        482,
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
                        482,
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
                        482,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                193,
                {
                    "twoFactorAuthenticationMethodId": [
                        482,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                577
            ],
            "deleteUserFromWorkspace": [
                580,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                583,
                {
                    "id": [
                        482,
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
                591,
                {
                    "input": [
                        195,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                592,
                {
                    "input": [
                        194,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                593,
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
                597,
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
                604,
                {
                    "id": [
                        482,
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
                591,
                {
                    "input": [
                        201,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                592,
                {
                    "input": [
                        200,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                593,
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
                597,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                208,
                {
                    "id": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                209,
                {
                    "id": [
                        482,
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
                        482
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
                615
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
                30,
                {
                    "apiKeyId": [
                        482,
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
                        482,
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
            "generateTwoFactorAuthenticationRecoveryCode": [
                479,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        482,
                        "UUID!"
                    ]
                }
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
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                480,
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
                        482,
                        "UUID!"
                    ],
                    "workspaceId": [
                        482,
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
                        482,
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
                        482,
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
                        482,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                8
            ],
            "revokeApiKey": [
                28,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        482,
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
                        482,
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
                        482
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
                        482,
                        "[UUID!]"
                    ],
                    "messageId": [
                        482,
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
                        482,
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
                        482
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
                32,
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
                        482
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
            "startChannelSync": [
                121,
                {
                    "connectedAccountId": [
                        482,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                460
            ],
            "switchBillingPlan": [
                105
            ],
            "switchSubscriptionInterval": [
                105
            ],
            "syncApplication": [
                625,
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
                25,
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
                        26,
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
            "updateAgentChatThreadInboxState": [
                12,
                {
                    "action": [
                        6,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        186
                    ],
                    "threadIds": [
                        482,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                28,
                {
                    "input": [
                        488,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                314,
                {
                    "input": [
                        489,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                36,
                {
                    "id": [
                        482,
                        "UUID!"
                    ],
                    "input": [
                        490,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                54,
                {
                    "input": [
                        491,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                58,
                {
                    "input": [
                        493,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                108,
                {
                    "input": [
                        495,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                135,
                {
                    "input": [
                        497,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                314,
                {
                    "input": [
                        498,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                261,
                {
                    "input": [
                        500,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                239,
                {
                    "input": [
                        502,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                343,
                {
                    "inputs": [
                        513,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                346,
                {
                    "inputs": [
                        514,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                597,
                {
                    "inputs": [
                        536,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                314,
                {
                    "input": [
                        505,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                321,
                {
                    "input": [
                        507,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                321,
                {
                    "input": [
                        509,
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
                        513,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        487,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        482
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
                        512,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        503,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                346,
                {
                    "input": [
                        514,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                417,
                {
                    "updateRoleInput": [
                        521,
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
                        515,
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
                        516,
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
                        518,
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
                        520,
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
                        523,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                468,
                {
                    "input": [
                        524,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                485,
                {
                    "input": [
                        525,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                564,
                {
                    "input": [
                        526,
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
                583,
                {
                    "input": [
                        527,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                588,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        538,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                591,
                {
                    "input": [
                        531,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                592,
                {
                    "input": [
                        529,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                593,
                {
                    "input": [
                        534,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                594,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        533,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                597,
                {
                    "input": [
                        536,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                600,
                {
                    "input": [
                        539,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                604,
                {
                    "input": [
                        541,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                611,
                {
                    "data": [
                        544,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                611,
                {
                    "data": [
                        543,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                620,
                {
                    "roleId": [
                        482,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        545,
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
                        546,
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
                        546,
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
                        546,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                256,
                {
                    "file": [
                        546,
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
                        546,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                256,
                {
                    "file": [
                        546,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                248,
                {
                    "upsertFieldPermissionsInput": [
                        547,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                588,
                {
                    "input": [
                        550,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                354,
                {
                    "upsertObjectPermissionsInput": [
                        551,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                418,
                {
                    "upsertPermissionFlagsInput": [
                        552,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                554,
                {
                    "input": [
                        553,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                588,
                {
                    "input": [
                        555,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                62,
                {
                    "input": [
                        581,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                585,
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
                586,
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
                482
            ],
            "color": [
                1
            ],
            "createdAt": [
                186
            ],
            "folderId": [
                482
            ],
            "icon": [
                1
            ],
            "id": [
                482
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                482
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                482
            ],
            "targetRecordId": [
                482
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
                482
            ],
            "viewId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                482
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
                482
            ],
            "imageIdentifierFieldMetadataId": [
                482
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
                482
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
                482
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
                483
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
                483
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
                482
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
                482
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
                482
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
                482
            ],
            "createdAt": [
                186
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                482
            ],
            "deletedAt": [
                186
            ],
            "id": [
                482
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
                482
            ],
            "tabs": [
                368
            ],
            "type": [
                370
            ],
            "universalIdentifier": [
                482
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
                482
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
                482
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
                482
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                482
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
                482
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                287
            ],
            "configuration": [
                605
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
                482
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
                482
            ],
            "pageLayoutTabId": [
                482
            ],
            "position": [
                374
            ],
            "title": [
                1
            ],
            "type": [
                607
            ],
            "universalIdentifier": [
                482
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
                8
            ],
            "columnSpan": [
                8
            ],
            "layoutMode": [
                369
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
                8
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
                482
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
                482
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
                482
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
                482
            ],
            "aggregateOperation": [
                19
            ],
            "color": [
                1
            ],
            "configurationType": [
                606
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
                8
            ],
            "groupByFieldMetadataId": [
                482
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
                482
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
                482
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
                482
            ],
            "createdAt": [
                186
            ],
            "domain": [
                1
            ],
            "id": [
                482
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
                482
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                629
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
                482
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
                16,
                {
                    "agentId": [
                        482,
                        "UUID!"
                    ],
                    "limit": [
                        8,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                20
            ],
            "apiKey": [
                28,
                {
                    "input": [
                        264,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                28
            ],
            "appConnection": [
                31,
                {
                    "id": [
                        10,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                31,
                {
                    "filter": [
                        296
                    ]
                }
            ],
            "appKeyValue": [
                32,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        33
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                40,
                {
                    "applicationId": [
                        482,
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
                        482,
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
                482,
                {
                    "calendarEventId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                124,
                {
                    "threadId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        482,
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
                619,
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                135
            ],
            "currentUser": [
                577
            ],
            "currentUserApplicationAuthorizations": [
                37
            ],
            "currentUserSessions": [
                579
            ],
            "currentWorkspace": [
                611
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
                        482,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                241,
                {
                    "id": [
                        482,
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
                        13,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                36,
                {
                    "id": [
                        482
                    ],
                    "universalIdentifier": [
                        482
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
                613
            ],
            "findWorkspaceFromInviteHash": [
                611,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                618
            ],
            "frontComponent": [
                261,
                {
                    "id": [
                        482,
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
                22
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
                        482,
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
                        482,
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
                        482,
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
                561,
                {
                    "input": [
                        562
                    ]
                }
            ],
            "getView": [
                588,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                591,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                592,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                592,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                591,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                593,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                594,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                594,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                593,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                597,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                597,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                600,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                600,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                588,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        602,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                616
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
                482,
                {
                    "objectMetadataId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                108,
                {
                    "connectedAccountId": [
                        482
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
                        482
                    ]
                }
            ],
            "myMessageFolders": [
                321,
                {
                    "messageChannelId": [
                        482
                    ]
                }
            ],
            "myUserApplicationVariables": [
                621
            ],
            "navigationMenuItem": [
                343,
                {
                    "id": [
                        482,
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
                        482,
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
                        482,
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
            "twoFactorAuthenticationRecoveryStatus": [
                481,
                {
                    "userId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                485
            ],
            "usageLimits": [
                564
            ],
            "usageQuotaDefinitions": [
                568
            ],
            "usageQuotaScopeConsumption": [
                570,
                {
                    "input": [
                        571,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                572
            ],
            "validatePasswordResetToken": [
                582,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                583,
                {
                    "objectMetadataId": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                604,
                {
                    "id": [
                        482,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                482
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
                482
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
                482
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
                482
            ],
            "permissions": [
                398
            ],
            "recordId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                482
            ],
            "workspaceMemberId": [
                482
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
                10
            ],
            "principalId": [
                482
            ],
            "principalRoleId": [
                482
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
                482
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
                606
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
                482
            ],
            "recordId": [
                482
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
                482
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
                29
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
                482
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
                482
            ],
            "workspaceMembers": [
                620
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
                482
            ],
            "roleId": [
                482
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
                482
            ],
            "logicalOperator": [
                423
            ],
            "objectMetadataId": [
                482
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                482
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
                482
            ],
            "id": [
                482
            ],
            "operand": [
                425
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                482
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
                482
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
                482
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
                482
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
                482
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
                482
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
                482
            ],
            "id": [
                482
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                482
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                482
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
                618
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
                33
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
                482
            ],
            "createdAt": [
                186
            ],
            "frontComponentId": [
                482
            ],
            "icon": [
                1
            ],
            "id": [
                482
            ],
            "position": [
                11
            ],
            "scope": [
                451
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                482
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
                482
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
                482
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
                630
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
                482
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
                482
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
                606
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                628
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
                        482,
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
                606
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
                482
            ],
            "createdAt": [
                186
            ],
            "emit": [
                469
            ],
            "frontComponentUniversalIdentifier": [
                482
            ],
            "icon": [
                1
            ],
            "id": [
                482
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
                482
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                482
            ],
            "universalIdentifier": [
                482
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
                482
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
                482
            ],
            "relationFieldUniversalIdentifier": [
                482
            ],
            "triggerFieldUniversalIdentifiers": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                606
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                186
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
                66
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
                186
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                482
            ],
            "gt": [
                482
            ],
            "gte": [
                482
            ],
            "iLike": [
                482
            ],
            "in": [
                482
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                482
            ],
            "lt": [
                482
            ],
            "lte": [
                482
            ],
            "neq": [
                482
            ],
            "notILike": [
                482
            ],
            "notIn": [
                482
            ],
            "notLike": [
                482
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
                482
            ],
            "name": [
                1
            ],
            "updatedAt": [
                186
            ],
            "visibility": [
                486
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
                482
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
                482
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
                482
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
                482
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
                492
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
                494
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
                482
            ],
            "update": [
                496
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
                482
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
                482
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                482
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
                482
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
                482
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
                482
            ],
            "update": [
                501
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
                482
            ],
            "update": [
                504
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
                11
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
                482
            ],
            "update": [
                506
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
                482
            ],
            "update": [
                508
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
                482
            ],
            "update": [
                508
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
                482
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
                482
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
                482
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
                482
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
                482
            ],
            "update": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                482
            ],
            "update": [
                510
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                482
            ],
            "update": [
                511
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
                482
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
                482
            ],
            "layoutMode": [
                369
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                519
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
                482
            ],
            "pageLayoutTabId": [
                482
            ],
            "position": [
                287
            ],
            "title": [
                1
            ],
            "type": [
                607
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
                482
            ],
            "objectMetadataId": [
                482
            ],
            "pageLayoutTabId": [
                482
            ],
            "position": [
                287
            ],
            "title": [
                1
            ],
            "type": [
                607
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
                482
            ],
            "tabs": [
                517
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
                482
            ],
            "update": [
                522
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
                482
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
                482
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
                486
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                482
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
                482
            ],
            "update": [
                528
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
                482
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
                482
            ],
            "update": [
                530
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
                482
            ],
            "update": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                19
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                482
            ],
            "logicalOperator": [
                595
            ],
            "parentViewFilterGroupId": [
                482
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                482
            ],
            "update": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                482
            ],
            "operand": [
                596
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                482
            ],
            "subFieldName": [
                1
            ],
            "value": [
                287
            ],
            "viewFilterGroupId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                482
            ],
            "update": [
                537
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                482
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
                482
            ],
            "calendarFieldMetadataId": [
                482
            ],
            "calendarLayout": [
                589
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                482
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                482
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                482
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                599
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                602
            ],
            "visibility": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                482
            ],
            "update": [
                540
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                601
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
                482
            ],
            "update": [
                542
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
                21
            ],
            "aiChatModelTier": [
                21
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
                482
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
                617
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                482
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                548
            ],
            "id": [
                482
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
                548
            ],
            "groups": [
                549
            ],
            "widgetId": [
                482
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
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                482
            ],
            "predicateGroups": [
                422
            ],
            "predicates": [
                424
            ],
            "roleId": [
                482
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
                559
            ],
            "viewFields": [
                556
            ],
            "viewFilterGroups": [
                557
            ],
            "viewFilters": [
                558
            ],
            "viewSorts": [
                560
            ],
            "widgetId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                19
            ],
            "fieldMetadataId": [
                482
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                482
            ],
            "logicalOperator": [
                595
            ],
            "parentViewFilterGroupId": [
                482
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
                482
            ],
            "id": [
                482
            ],
            "operand": [
                596
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                482
            ],
            "subFieldName": [
                1
            ],
            "value": [
                287
            ],
            "viewFilterGroupId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                482
            ],
            "calendarFieldMetadataId": [
                482
            ],
            "calendarLayout": [
                589
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                482
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                482
            ],
            "openRecordIn": [
                599
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                601
            ],
            "fieldMetadataId": [
                482
            ],
            "id": [
                482
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
                574
            ],
            "usageByApplication": [
                563
            ],
            "usageByModel": [
                563
            ],
            "usageByOperationType": [
                563
            ],
            "usageByUser": [
                563
            ],
            "userDailyUsage": [
                576
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                566
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
                11
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
                482
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                80
            ],
            "operationType": [
                566
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                573
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                575
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
                575
            ],
            "operationType": [
                566
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                565
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                569
            ],
            "resourceType": [
                573
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                567
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
                566
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                575
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
                566
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                573
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                575
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
                482
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                80
            ],
            "operationType": [
                566
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
                573
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
                575
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
            "__typename": [
                1
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                574
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
                580
            ],
            "currentWorkspace": [
                611
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
                482
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
                580
            ],
            "workspaceMember": [
                620
            ],
            "workspaceMembers": [
                620
            ],
            "workspaces": [
                580
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
                482
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
                482
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
                482
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
                577
            ],
            "userId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                482
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
                482
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
                482
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                482
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
                482
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
                65
            ],
            "workspaceUrls": [
                629
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
                482
            ],
            "calendarEndFieldMetadataId": [
                482
            ],
            "calendarFieldMetadataId": [
                482
            ],
            "calendarLayout": [
                589
            ],
            "createdAt": [
                186
            ],
            "createdByUserWorkspaceId": [
                482
            ],
            "deletedAt": [
                186
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                482
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
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                482
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                598
            ],
            "mainGroupByFieldMetadataId": [
                482
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                482
            ],
            "openRecordIn": [
                599
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                602
            ],
            "universalIdentifier": [
                482
            ],
            "updatedAt": [
                186
            ],
            "viewFieldGroups": [
                592
            ],
            "viewFields": [
                591
            ],
            "viewFilterGroups": [
                594
            ],
            "viewFilters": [
                593
            ],
            "viewGroups": [
                597
            ],
            "viewSorts": [
                600
            ],
            "visibility": [
                603
            ],
            "workspaceId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                19
            ],
            "applicationId": [
                482
            ],
            "createdAt": [
                186
            ],
            "deletedAt": [
                186
            ],
            "fieldMetadataId": [
                482
            ],
            "id": [
                482
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
                482
            ],
            "updatedAt": [
                186
            ],
            "viewFieldGroupId": [
                482
            ],
            "viewId": [
                482
            ],
            "workspaceId": [
                482
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
                482
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
                186
            ],
            "viewFields": [
                591
            ],
            "viewId": [
                482
            ],
            "workspaceId": [
                482
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
                482
            ],
            "id": [
                482
            ],
            "operand": [
                596
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                482
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
                482
            ],
            "viewId": [
                482
            ],
            "workspaceId": [
                482
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
                482
            ],
            "logicalOperator": [
                595
            ],
            "parentViewFilterGroupId": [
                482
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                186
            ],
            "viewId": [
                482
            ],
            "workspaceId": [
                482
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
                482
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "updatedAt": [
                186
            ],
            "viewId": [
                482
            ],
            "workspaceId": [
                482
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
                601
            ],
            "fieldMetadataId": [
                482
            ],
            "id": [
                482
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                186
            ],
            "viewId": [
                482
            ],
            "workspaceId": [
                482
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
                482
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
                482
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
                18
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
                590
            ],
            "on_WorkflowConfiguration": [
                608
            ],
            "on_WorkflowRunConfiguration": [
                609
            ],
            "on_WorkflowVersionConfiguration": [
                610
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                612
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                21
            ],
            "aiChatModelTier": [
                21
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
                11
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
                482
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
                482
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
                186
            ],
            "viewFields": [
                591
            ],
            "viewFilterGroups": [
                594
            ],
            "viewFilters": [
                593
            ],
            "viewGroups": [
                597
            ],
            "viewSorts": [
                600
            ],
            "views": [
                588
            ],
            "workspaceCustomApplication": [
                36
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                617
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                629
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
                287
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                614
            ],
            "personEnrichment": [
                287
            ],
            "personOutcome": [
                627
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
                482
            ],
            "roleId": [
                482
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
                622
            ],
            "id": [
                482
            ],
            "locale": [
                1
            ],
            "name": [
                263
            ],
            "numberFormat": [
                623
            ],
            "openRecordIn": [
                365
            ],
            "roles": [
                417
            ],
            "timeFormat": [
                624
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
                482
            ],
            "userWorkspaceId": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                482
            ],
            "variables": [
                578
            ],
            "workspaceMemberId": [
                482
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
                482
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
                482
            ],
            "workspaceUrls": [
                629
            ],
            "__typename": [
                1
            ]
        }
    }
}