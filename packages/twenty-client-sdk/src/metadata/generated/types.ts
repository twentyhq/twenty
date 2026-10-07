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
        43,
        51,
        53,
        59,
        71,
        75,
        76,
        78,
        83,
        88,
        94,
        104,
        107,
        108,
        109,
        110,
        118,
        120,
        134,
        139,
        183,
        184,
        211,
        215,
        216,
        218,
        228,
        234,
        238,
        242,
        245,
        252,
        266,
        268,
        278,
        285,
        286,
        287,
        298,
        300,
        313,
        314,
        315,
        316,
        317,
        318,
        320,
        321,
        322,
        325,
        326,
        328,
        329,
        332,
        334,
        338,
        342,
        351,
        358,
        359,
        360,
        363,
        367,
        368,
        373,
        377,
        398,
        400,
        401,
        404,
        409,
        421,
        423,
        427,
        432,
        449,
        461,
        462,
        464,
        477,
        479,
        481,
        541,
        561,
        568,
        570,
        584,
        590,
        591,
        593,
        594,
        596,
        597,
        598,
        601,
        602,
        607,
        609,
        612,
        617,
        618,
        619,
        622,
        623
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
                285
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
                477
            ],
            "createdAt": [
                184
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                285
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
                285
            ],
            "roleId": [
                477
            ],
            "triggers": [
                285
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                285
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
                184
            ],
            "deletedAt": [
                184
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
                184
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
                184
            ],
            "id": [
                477
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                184
            ],
            "lastReadAt": [
                184
            ],
            "snoozedUntil": [
                184
            ],
            "threadId": [
                477
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                477
            ],
            "createdAt": [
                184
            ],
            "id": [
                477
            ],
            "parts": [
                13
            ],
            "processedAt": [
                184
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                477
            ],
            "status": [
                1
            ],
            "threadId": [
                477
            ],
            "turnId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                184
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                477
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                477
            ],
            "messageId": [
                477
            ],
            "orderIndex": [
                7
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                285
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
                285
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                285
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
                184
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
                184
            ],
            "errorMessage": [
                1
            ],
            "id": [
                477
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
                184
            ],
            "status": [
                15
            ],
            "threadId": [
                477
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
                477
            ],
            "aggregateOperation": [
                17
            ],
            "configurationType": [
                601
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                285
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "label": [
                1
            ],
            "numberFormat": [
                120
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                393
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
                78
            ],
            "kind": [
                1
            ],
            "limitValue": [
                78
            ],
            "periodEnd": [
                184
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
                184
            ],
            "expiresAt": [
                184
            ],
            "id": [
                477
            ],
            "name": [
                1
            ],
            "revokedAt": [
                184
            ],
            "role": [
                415
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                184
            ],
            "id": [
                477
            ],
            "name": [
                1
            ],
            "revokedAt": [
                184
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
                285
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
                184
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
                477
            ],
            "role": [
                322
            ],
            "workspaceMemberId": [
                477
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
                55
            ],
            "applicationRegistrationId": [
                477
            ],
            "applicationVariables": [
                58
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                285
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                133
            ],
            "defaultLogicFunctionRole": [
                415
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                259
            ],
            "healthCheckLogicFunctionId": [
                477
            ],
            "id": [
                477
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                297
            ],
            "logoFileId": [
                477
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                344
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                477
            ],
            "settingsCustomTabFrontComponentId": [
                477
            ],
            "settingsMenuItems": [
                448
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                477
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                184
            ],
            "id": [
                477
            ],
            "lastAuthorizedAt": [
                184
            ],
            "lastUsedAt": [
                184
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                477
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                477
            ],
            "archivedAt": [
                184
            ],
            "authFailedAt": [
                184
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                389
            ],
            "connectionProviderId": [
                477
            ],
            "createdAt": [
                184
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                477
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                184
            ],
            "lastSignedInAt": [
                184
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
                184
            ],
            "userWorkspaceId": [
                477
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
                477
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                39
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
                41
            ],
            "coverage": [
                42
            ],
            "files": [
                44
            ],
            "manifest": [
                285
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
                53
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
                43
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
                477
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
                252
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
                252
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
                184
            ],
            "fileFolder": [
                252
            ],
            "fileId": [
                477
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
                49
            ],
            "description": [
                1
            ],
            "status": [
                51
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
                184
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                477
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
                477
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                53
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                184
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
                582
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                477
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                53
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                184
            ],
            "description": [
                1
            ],
            "id": [
                477
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
                285
            ],
            "type": [
                1
            ],
            "updatedAt": [
                184
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
                63
            ],
            "applicationRefreshToken": [
                63
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
                477
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
                285
            ],
            "scope": [
                59
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
                184
            ],
            "domain": [
                1
            ],
            "id": [
                477
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
                431
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                184
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
                63
            ],
            "refreshToken": [
                63
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                64
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
                477
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
                430
            ],
            "workspaceUrls": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                68
            ],
            "availableWorkspacesForSignUp": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                69
            ],
            "tokens": [
                64
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                477
            ],
            "aggregateOperation": [
                17
            ],
            "axisNameDisplay": [
                71
            ],
            "color": [
                1
            ],
            "configurationType": [
                601
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
                285
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupMode": [
                75
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                76
            ],
            "numberFormat": [
                120
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                358
            ],
            "primaryAxisGroupByFieldMetadataId": [
                477
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                266
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                358
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                477
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                266
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
                285
            ],
            "formattedToRawLookup": [
                285
            ],
            "groupMode": [
                75
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
                76
            ],
            "series": [
                77
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
                285
            ],
            "objectMetadataId": [
                477
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
                102
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
                477
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
                98
            ],
            "currentBillingSubscription": [
                98
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                462
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                83
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
                95
            ],
            "name": [
                1
            ],
            "prices": [
                89
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
                95
            ],
            "name": [
                1
            ],
            "prices": [
                90
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
                84
            ],
            "meteredProducts": [
                85
            ],
            "planKey": [
                88
            ],
            "resourceCreditProducts": [
                84
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
                104
            ],
            "recurringInterval": [
                461
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
                104
            ],
            "recurringInterval": [
                461
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                91
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
                95
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
                95
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                84
            ],
            "on_BillingMeteredProduct": [
                85
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
                88
            ],
            "priceUsageBased": [
                104
            ],
            "productKey": [
                94
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
                184
            ],
            "periodStart": [
                184
            ],
            "productKey": [
                94
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
                99
            ],
            "cancelAt": [
                184
            ],
            "currentPeriodEnd": [
                184
            ],
            "id": [
                477
            ],
            "interval": [
                461
            ],
            "metadata": [
                285
            ],
            "phases": [
                100
            ],
            "status": [
                462
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                93
            ],
            "creditAmount": [
                9
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                477
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
                101
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
                98
            ],
            "currentBillingSubscription": [
                98
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
                477
            ],
            "contactAutoCreationPolicy": [
                107
            ],
            "createdAt": [
                184
            ],
            "handle": [
                1
            ],
            "id": [
                477
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                108
            ],
            "syncStageStartedAt": [
                184
            ],
            "syncStatus": [
                109
            ],
            "syncedAt": [
                184
            ],
            "throttleFailureCount": [
                9
            ],
            "updatedAt": [
                184
            ],
            "visibility": [
                110
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
                601
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                601
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
                118
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
                601
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                285
            ],
            "error": [
                123
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
                601
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
                338
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                340
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
                127
            ],
            "aiModelTiers": [
                129
            ],
            "aiModels": [
                128
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
                62
            ],
            "billing": [
                79
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                117
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
                131
            ],
            "publicFeatureFlags": [
                387
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                446
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                463
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                184
            ],
            "link": [
                1
            ],
            "startAt": [
                184
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
                477
            ],
            "availabilityObjectMetadataId": [
                477
            ],
            "availabilityType": [
                134
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                477
            ],
            "createdAt": [
                184
            ],
            "engineComponentKey": [
                218
            ],
            "frontComponent": [
                259
            ],
            "frontComponentId": [
                477
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                477
            ],
            "pageLayoutId": [
                477
            ],
            "payload": [
                135
            ],
            "position": [
                9
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
            ],
            "workflowVersionId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                350
            ],
            "on_PathCommandMenuItemPayload": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                45
            ],
            "files": [
                250
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                477
            ],
            "archivedAt": [
                184
            ],
            "authFailedAt": [
                184
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                389
            ],
            "connectionProviderId": [
                477
            ],
            "createdAt": [
                184
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                477
            ],
            "lastCredentialsRefreshedAt": [
                184
            ],
            "lastSignedInAt": [
                184
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
                184
            ],
            "userWorkspaceId": [
                477
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
                271
            ],
            "handle": [
                1
            ],
            "id": [
                477
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                211
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
                285
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
                285
            ],
            "roleId": [
                477
            ],
            "triggers": [
                285
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                477
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                46
            ],
            "targets": [
                48
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                52
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
                477
            ],
            "availabilityType": [
                134
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                477
            ],
            "engineComponentKey": [
                218
            ],
            "frontComponentId": [
                477
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
                477
            ],
            "pageLayoutId": [
                477
            ],
            "payload": [
                285
            ],
            "position": [
                9
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                477
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
                312
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
                285
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
                285
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                477
            ],
            "options": [
                285
            ],
            "relationCreationPayload": [
                285
            ],
            "settings": [
                285
            ],
            "type": [
                245
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
                477
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
                477
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
                156
            ],
            "indexType": [
                278
            ],
            "objectMetadataId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                285
            ],
            "databaseEventTriggerSettings": [
                285
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                285
            ],
            "id": [
                477
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                285
            ],
            "source": [
                285
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                285
            ],
            "universalIdentifier": [
                477
            ],
            "workflowActionTriggerSettings": [
                285
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
                477
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
                477
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                477
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                477
            ],
            "targetRecordId": [
                477
            ],
            "type": [
                342
            ],
            "userWorkspaceId": [
                477
            ],
            "viewId": [
                477
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
                285
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
                154
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                157
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                161
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
                477
            ],
            "type": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                367
            ],
            "pageLayoutId": [
                477
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
                285
            ],
            "objectMetadataId": [
                477
            ],
            "pageLayoutTabId": [
                477
            ],
            "position": [
                285
            ],
            "title": [
                1
            ],
            "type": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                477
            ],
            "filter": [
                285
            ],
            "objectMetadataId": [
                477
            ],
            "orderBy": [
                285
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
                477
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                78
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                78
            ],
            "operationType": [
                561
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                568
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                570
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
                477
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                477
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
                477
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
                477
            ],
            "id": [
                477
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
                477
            ],
            "viewId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                477
            ],
            "logicalOperator": [
                590
            ],
            "parentViewFilterGroupId": [
                477
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
            ],
            "operand": [
                591
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                477
            ],
            "subFieldName": [
                1
            ],
            "value": [
                285
            ],
            "viewFilterGroupId": [
                477
            ],
            "viewId": [
                477
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
                477
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "viewId": [
                477
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
                477
            ],
            "calendarFieldMetadataId": [
                477
            ],
            "calendarLayout": [
                584
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                477
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                593
            ],
            "mainGroupByFieldMetadataId": [
                477
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                477
            ],
            "openRecordIn": [
                594
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                597
            ],
            "visibility": [
                598
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                596
            ],
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                477
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
                477
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
                139
            ],
            "before": [
                139
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                477
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                477
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
                477
            ],
            "name": [
                261
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                477
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
                477
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                204
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
                477
            ],
            "pageLayoutId": [
                477
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
                477
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
                477
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                432
            ],
            "type": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                477
            ],
            "status": [
                432
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                140
            ],
            "IMAP": [
                140
            ],
            "SMTP": [
                140
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
                601
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                184
            ],
            "domain": [
                1
            ],
            "id": [
                477
            ],
            "status": [
                215
            ],
            "tenantStatus": [
                216
            ],
            "unsubscribeHostnameStatus": [
                479
            ],
            "updatedAt": [
                184
            ],
            "verificationRecords": [
                579
            ],
            "verifiedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                601
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
                285
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
                285
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
                220
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                285
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
                184
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
                184
            ],
            "currentPeriodEnd": [
                184
            ],
            "expiresAt": [
                184
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
                184
            ],
            "start": [
                184
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
                228
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
                226
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                227
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
                229
            ],
            "first": [
                7
            ],
            "table": [
                234
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                230
            ],
            "records": [
                233
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
                285
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                184
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
                327
            ],
            "objectRecordEventsWithQueryIds": [
                357
            ],
            "queueJobEvents": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                477
            ],
            "payload": [
                285
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                238
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
                477
            ],
            "createdAt": [
                184
            ],
            "defaultValue": [
                285
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                477
            ],
            "morphRelations": [
                408
            ],
            "name": [
                1
            ],
            "object": [
                344
            ],
            "objectMetadataId": [
                477
            ],
            "options": [
                285
            ],
            "relation": [
                408
            ],
            "settings": [
                285
            ],
            "type": [
                245
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                184
            ],
            "writability": [
                334
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                601
            ],
            "fieldDisplayMode": [
                242
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
                243
            ],
            "pageInfo": [
                364
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                139
            ],
            "node": [
                239
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                244
            ],
            "id": [
                478
            ],
            "isActive": [
                105
            ],
            "isSystem": [
                105
            ],
            "isUIEditable": [
                105
            ],
            "isUIReadOnly": [
                105
            ],
            "objectMetadataId": [
                478
            ],
            "or": [
                244
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
                477
            ],
            "id": [
                477
            ],
            "objectMetadataId": [
                477
            ],
            "roleId": [
                477
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
                477
            ],
            "objectMetadataId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                601
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
                184
            ],
            "id": [
                477
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
                477
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
                184
            ],
            "fileId": [
                477
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
                184
            ],
            "id": [
                477
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
                601
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                477
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                432
            ],
            "type": [
                268
            ],
            "workspace": [
                621
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
                325
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                601
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
                477
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                57
            ],
            "applicationVariables": [
                285
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
                184
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                477
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
                477
            ],
            "updatedAt": [
                184
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
                601
            ],
            "frontComponentId": [
                477
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                477
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
                477
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
                477
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
                477
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
                477
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
                601
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
                272
            ],
            "IMAP": [
                272
            ],
            "SMTP": [
                272
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
                211
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
                63
            ],
            "workspace": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                184
            ],
            "id": [
                477
            ],
            "indexFieldMetadataList": [
                276
            ],
            "indexType": [
                278
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
                184
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                139
            ],
            "node": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                184
            ],
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
            ],
            "order": [
                9
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                277
            ],
            "id": [
                478
            ],
            "isCustom": [
                105
            ],
            "or": [
                277
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                477
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
                281
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
                477
            ],
            "messageThreadId": [
                477
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
                287
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                477
            ],
            "aggregateOperation": [
                17
            ],
            "axisNameDisplay": [
                71
            ],
            "color": [
                1
            ],
            "configurationType": [
                601
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
                285
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
                120
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                358
            ],
            "primaryAxisGroupByFieldMetadataId": [
                477
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                266
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                358
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                477
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                266
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
                285
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                293
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
                285
            ],
            "objectMetadataId": [
                477
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
                292
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
                477
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
                477
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                184
            ],
            "cronTriggerSettings": [
                285
            ],
            "databaseEventTriggerSettings": [
                285
            ],
            "description": [
                1
            ],
            "executionMode": [
                298
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                285
            ],
            "id": [
                477
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
                285
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
            ],
            "workflowActionTriggerSettings": [
                285
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                285
            ],
            "duration": [
                9
            ],
            "error": [
                285
            ],
            "logs": [
                1
            ],
            "status": [
                300
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                477
            ],
            "applicationUniversalIdentifier": [
                477
            ],
            "id": [
                477
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                63
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
                285
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
                307
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                53
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
                308
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                309
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
                601
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                137
            ],
            "connectedAccountId": [
                477
            ],
            "contactAutoCreationPolicy": [
                313
            ],
            "createdAt": [
                184
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
                477
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                320
            ],
            "pendingGroupEmailsAction": [
                314
            ],
            "syncStage": [
                315
            ],
            "syncStageStartedAt": [
                184
            ],
            "syncStatus": [
                316
            ],
            "syncedAt": [
                184
            ],
            "throttleFailureCount": [
                9
            ],
            "throttleRetryAfter": [
                184
            ],
            "type": [
                317
            ],
            "updatedAt": [
                184
            ],
            "visibility": [
                318
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
                184
            ],
            "externalId": [
                1
            ],
            "id": [
                477
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                477
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                321
            ],
            "updatedAt": [
                184
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
                184
            ],
            "emailAddress": [
                1
            ],
            "id": [
                477
            ],
            "reason": [
                325
            ],
            "source": [
                326
            ],
            "unsubscribeTopicId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                323
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
                356
            ],
            "recordId": [
                1
            ],
            "type": [
                328
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
                477
            ],
            "property": [
                1
            ],
            "provenance": [
                332
            ],
            "recordId": [
                477
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
                477
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                132
            ],
            "objectMetadataItems": [
                336
            ],
            "views": [
                337
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
                477
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
                477
            ],
            "key": [
                593
            ],
            "objectMetadataId": [
                477
            ],
            "type": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                455,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                606,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                477,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        477,
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
                        477,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        477,
                        "UUID!"
                    ],
                    "roleId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        477,
                        "UUID!"
                    ],
                    "roleId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                66,
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
                116,
                {
                    "input": [
                        115,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                103
            ],
            "cancelSwitchBillingPlan": [
                103
            ],
            "cancelSwitchResourceCreditPrice": [
                103
            ],
            "checkCustomDomainValidRecords": [
                205
            ],
            "checkPublicDomainValidRecords": [
                205,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                97,
                {
                    "plan": [
                        88,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        461,
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
                52,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                52,
                {
                    "fileId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                136,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        477,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                362,
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
                254,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                254,
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
                254,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                254,
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
                        142,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                312,
                {
                    "input": [
                        143,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                144,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        47,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                145,
                {
                    "input": [
                        146,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                60,
                {
                    "input": [
                        147,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                86
            ],
            "createCalendarEvent": [
                149,
                {
                    "input": [
                        148,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                6
            ],
            "createCommandMenuItem": [
                133,
                {
                    "input": [
                        150,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                203,
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
                152,
                {
                    "input": [
                        151,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                214,
                {
                    "input": [
                        153,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                253,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        252,
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
                259,
                {
                    "input": [
                        155,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                341,
                {
                    "inputs": [
                        160,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                587,
                {
                    "inputs": [
                        174,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                586,
                {
                    "inputs": [
                        175,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                592,
                {
                    "inputs": [
                        178,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                323,
                {
                    "input": [
                        159,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                341,
                {
                    "input": [
                        160,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                253,
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
                452,
                {
                    "input": [
                        450,
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
                        477,
                        "UUID!"
                    ],
                    "properties": [
                        285
                    ],
                    "recordId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        141,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                239,
                {
                    "input": [
                        162,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                274,
                {
                    "input": [
                        163,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                297,
                {
                    "input": [
                        158,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                344,
                {
                    "input": [
                        164,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                415,
                {
                    "createRoleInput": [
                        169,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                365,
                {
                    "input": [
                        165,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                366,
                {
                    "input": [
                        166,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                369,
                {
                    "input": [
                        167,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                386,
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
                452,
                {
                    "input": [
                        451,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                455,
                {
                    "input": [
                        170,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                86,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        88,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        461,
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
                480,
                {
                    "input": [
                        171,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                559,
                {
                    "input": [
                        172,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                578,
                {
                    "input": [
                        173,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                583,
                {
                    "input": [
                        179,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                586,
                {
                    "input": [
                        175,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                587,
                {
                    "input": [
                        174,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                588,
                {
                    "input": [
                        177,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                589,
                {
                    "input": [
                        176,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                592,
                {
                    "input": [
                        178,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                595,
                {
                    "input": [
                        180,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                599,
                {
                    "input": [
                        181,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                455,
                {
                    "id": [
                        477,
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
                312,
                {
                    "id": [
                        477,
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
                        185,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                133,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                137,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                606
            ],
            "deleteEmailGroupChannel": [
                312,
                {
                    "id": [
                        477,
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
                259,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                341,
                {
                    "ids": [
                        477,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                341,
                {
                    "id": [
                        477,
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
                239,
                {
                    "input": [
                        186,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                274,
                {
                    "input": [
                        187,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                297,
                {
                    "input": [
                        301,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                344,
                {
                    "input": [
                        188,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        477,
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
                        477,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                189,
                {
                    "input": [
                        190,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                455,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                191,
                {
                    "twoFactorAuthenticationMethodId": [
                        477,
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
                        477,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                572
            ],
            "deleteUserFromWorkspace": [
                575,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                578,
                {
                    "id": [
                        477,
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
                586,
                {
                    "input": [
                        193,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                587,
                {
                    "input": [
                        192,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                588,
                {
                    "input": [
                        194,
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
                592,
                {
                    "input": [
                        195,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        196,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                599,
                {
                    "id": [
                        477,
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
                586,
                {
                    "input": [
                        199,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                587,
                {
                    "input": [
                        198,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                588,
                {
                    "input": [
                        200,
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
                592,
                {
                    "input": [
                        201,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        202,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                137,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                206,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                207,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                208,
                {
                    "input": [
                        209,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                212,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        477
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                81
            ],
            "enqueueJob": [
                221,
                {
                    "input": [
                        219,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                223,
                {
                    "input": [
                        222,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                610
            ],
            "executeOneLogicFunction": [
                299,
                {
                    "input": [
                        236,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                28,
                {
                    "apiKeyId": [
                        477,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                57,
                {
                    "applicationId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                63
            ],
            "generateTransientToken": [
                471
            ],
            "getAuthTokensFromLoginToken": [
                65,
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
                65,
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
                65,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                263,
                {
                    "input": [
                        264,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                304,
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
                361
            ],
            "grantApplicationCapabilities": [
                36,
                {
                    "input": [
                        265,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                273,
                {
                    "userId": [
                        477,
                        "UUID!"
                    ],
                    "workspaceId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                280,
                {
                    "input": [
                        279,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                282,
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
                282
            ],
            "installApplication": [
                34,
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
                        477,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                10,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                10,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                224
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        410,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                402,
                {
                    "principal": [
                        399,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        407,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                57,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                65,
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
                        411,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                412,
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
                442,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                133,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                366,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                365,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                466,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                435,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        477,
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
                        413,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                417,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                428,
                {
                    "input": [
                        424,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                50,
                {
                    "applicationId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                270,
                {
                    "connectionParameters": [
                        210,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        477
                    ]
                }
            ],
            "sendChatMessage": [
                435,
                {
                    "browsingContext": [
                        285
                    ],
                    "fileAttachments": [
                        251,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        477,
                        "[UUID!]"
                    ],
                    "messageId": [
                        477,
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
                        477,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                438,
                {
                    "input": [
                        437,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                441,
                {
                    "input": [
                        440,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                442,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        477
                    ]
                }
            ],
            "sendMessageCampaign": [
                444,
                {
                    "input": [
                        443,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                439,
                {
                    "input": [
                        445,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                30,
                {
                    "input": [
                        447,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                224,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                402,
                {
                    "accessLevel": [
                        398,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        407,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                402,
                {
                    "accessLevel": [
                        398,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        399,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        407,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                103,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                70,
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
                70,
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
                453,
                {
                    "input": [
                        454
                    ]
                }
            ],
            "signUpInWorkspace": [
                453,
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
                        477
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
                362,
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
                        184,
                        "DateTime!"
                    ],
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                119,
                {
                    "connectedAccountId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                457,
                {
                    "companyContext": [
                        285
                    ],
                    "personContext": [
                        285
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                458
            ],
            "subscribeToAgentChatThread": [
                10,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "switchBillingPlan": [
                103
            ],
            "switchSubscriptionInterval": [
                103
            ],
            "syncApplication": [
                620,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        285,
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
                        285
                    ],
                    "type": [
                        24,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                52,
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
                473,
                {
                    "input": [
                        472,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                475,
                {
                    "input": [
                        474,
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
                        477,
                        "UUID!"
                    ]
                }
            ],
            "updateApiKey": [
                26,
                {
                    "input": [
                        483,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                312,
                {
                    "input": [
                        484,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                34,
                {
                    "id": [
                        477,
                        "UUID!"
                    ],
                    "input": [
                        485,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                52,
                {
                    "input": [
                        486,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                56,
                {
                    "input": [
                        488,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                106,
                {
                    "input": [
                        490,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                133,
                {
                    "input": [
                        492,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                312,
                {
                    "input": [
                        493,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                259,
                {
                    "input": [
                        495,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                237,
                {
                    "input": [
                        497,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                341,
                {
                    "inputs": [
                        508,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                344,
                {
                    "inputs": [
                        509,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                592,
                {
                    "inputs": [
                        531,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                312,
                {
                    "input": [
                        500,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                319,
                {
                    "input": [
                        502,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                319,
                {
                    "input": [
                        504,
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
                341,
                {
                    "input": [
                        508,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        482,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        477
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
                239,
                {
                    "input": [
                        507,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        498,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                344,
                {
                    "input": [
                        509,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                415,
                {
                    "updateRoleInput": [
                        516,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                365,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        510,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                366,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        511,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        513,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                365,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        515,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                283,
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
                455,
                {
                    "input": [
                        518,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                466,
                {
                    "input": [
                        519,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                480,
                {
                    "input": [
                        520,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                559,
                {
                    "input": [
                        521,
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
                578,
                {
                    "input": [
                        522,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                583,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        533,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                586,
                {
                    "input": [
                        526,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                587,
                {
                    "input": [
                        524,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                588,
                {
                    "input": [
                        529,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                589,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        528,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                592,
                {
                    "input": [
                        531,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                595,
                {
                    "input": [
                        534,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                599,
                {
                    "input": [
                        536,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                606,
                {
                    "data": [
                        539,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                606,
                {
                    "data": [
                        538,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                615,
                {
                    "roleId": [
                        477,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        540,
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
                52,
                {
                    "file": [
                        541,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                250,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        541,
                        "Upload!"
                    ],
                    "fileFolder": [
                        252,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                254,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        541,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                254,
                {
                    "file": [
                        541,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                254,
                {
                    "file": [
                        541,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                254,
                {
                    "file": [
                        541,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                246,
                {
                    "upsertFieldPermissionsInput": [
                        542,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                583,
                {
                    "input": [
                        545,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                352,
                {
                    "upsertObjectPermissionsInput": [
                        546,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                416,
                {
                    "upsertPermissionFlagsInput": [
                        547,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                549,
                {
                    "input": [
                        548,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                583,
                {
                    "input": [
                        550,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                60,
                {
                    "input": [
                        576,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                580,
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
                70,
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
                214,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                581,
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
                477
            ],
            "color": [
                1
            ],
            "createdAt": [
                184
            ],
            "folderId": [
                477
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                477
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                477
            ],
            "targetRecordId": [
                477
            ],
            "targetRecordIdentifier": [
                395
            ],
            "type": [
                342
            ],
            "updatedAt": [
                184
            ],
            "userWorkspaceId": [
                477
            ],
            "viewId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                477
            ],
            "color": [
                1
            ],
            "createdAt": [
                184
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                347,
                {
                    "filter": [
                        244,
                        "FieldFilter!"
                    ],
                    "paging": [
                        182,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                239
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "imageIdentifierFieldMetadataId": [
                477
            ],
            "indexMetadataList": [
                274
            ],
            "indexMetadatas": [
                349,
                {
                    "filter": [
                        277,
                        "IndexFilter!"
                    ],
                    "paging": [
                        182,
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
                477
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
                351
            ],
            "readability": [
                329
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                477
            ],
            "searchFieldMetadataList": [
                434
            ],
            "sharingReach": [
                359
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                184
            ],
            "writability": [
                334
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                346
            ],
            "pageInfo": [
                364
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                139
            ],
            "node": [
                344
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                243
            ],
            "pageInfo": [
                364
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                348
            ],
            "id": [
                478
            ],
            "isActive": [
                105
            ],
            "isRemote": [
                105
            ],
            "isSearchable": [
                105
            ],
            "isSystem": [
                105
            ],
            "isUICreatable": [
                105
            ],
            "isUIEditable": [
                105
            ],
            "isUIReadOnly": [
                105
            ],
            "or": [
                348
            ],
            "universalIdentifier": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                275
            ],
            "pageInfo": [
                364
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                477
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
                477
            ],
            "restrictedFields": [
                285
            ],
            "rowLevelPermissionPredicateGroups": [
                419
            ],
            "rowLevelPermissionPredicates": [
                418
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
                477
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
                183
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                356
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
                285
            ],
            "before": [
                285
            ],
            "diff": [
                285
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
                355
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
                360
            ],
            "previousOnboardingStatus": [
                360
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
                139
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                139
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                477
            ],
            "createdAt": [
                184
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                477
            ],
            "deletedAt": [
                184
            ],
            "id": [
                477
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
                477
            ],
            "tabs": [
                366
            ],
            "type": [
                368
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                477
            ],
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                367
            ],
            "pageLayoutId": [
                477
            ],
            "position": [
                9
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
            ],
            "widgets": [
                369
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                477
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                285
            ],
            "configuration": [
                600
            ],
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "gridPosition": [
                267
            ],
            "id": [
                477
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
                477
            ],
            "pageLayoutTabId": [
                477
            ],
            "position": [
                372
            ],
            "title": [
                1
            ],
            "type": [
                602
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                367
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
                367
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
                370
            ],
            "on_PageLayoutWidgetGridPosition": [
                371
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                374
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                373
            ],
            "index": [
                7
            ],
            "layoutMode": [
                367
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
                477
            ],
            "createdAt": [
                184
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                477
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                477
            ],
            "aggregateOperation": [
                17
            ],
            "color": [
                1
            ],
            "configurationType": [
                601
            ],
            "dateGranularity": [
                358
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
                285
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupByFieldMetadataId": [
                477
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
                120
            ],
            "orderBy": [
                266
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
                381
            ],
            "formattedToRawLookup": [
                285
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
                285
            ],
            "objectMetadataId": [
                477
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
                296
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
                477
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
                211
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
                477
            ],
            "createdAt": [
                184
            ],
            "domain": [
                1
            ],
            "id": [
                477
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
                238
            ],
            "metadata": [
                388
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
                385
            ],
            "IMAP": [
                385
            ],
            "SMTP": [
                385
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                61
            ],
            "authProviders": [
                62
            ],
            "displayName": [
                1
            ],
            "id": [
                477
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                624
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
                477
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
                        477,
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
                        262,
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
                        294
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
                312,
                {
                    "filter": [
                        295
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                37,
                {
                    "applicationId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                38,
                {
                    "applicationId": [
                        477,
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
                433,
                {
                    "applicationId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                73,
                {
                    "input": [
                        74,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                97,
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
                477,
                {
                    "calendarEventId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                12,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                122,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                6,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                125,
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
                614,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                459,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                133,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                133
            ],
            "currentUser": [
                572
            ],
            "currentUserApplicationAuthorizations": [
                35
            ],
            "currentUserSessions": [
                574
            ],
            "currentWorkspace": [
                606
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
                225
            ],
            "eventLogs": [
                232,
                {
                    "input": [
                        231,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                40,
                {
                    "universalIdentifier": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                239,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                241,
                {
                    "filter": [
                        244,
                        "FieldFilter!"
                    ],
                    "paging": [
                        182,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                384,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                52,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                54,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                56,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                126,
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
                288,
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
                52
            ],
            "findManyApplications": [
                34
            ],
            "findManyLogicFunctions": [
                297
            ],
            "findManyMarketplaceApps": [
                305,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                386
            ],
            "findMarketplaceAppDetail": [
                306,
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
                34,
                {
                    "id": [
                        477
                    ],
                    "universalIdentifier": [
                        477
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                52,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                297,
                {
                    "input": [
                        301,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                288,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                608
            ],
            "findWorkspaceFromInviteHash": [
                606,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                613
            ],
            "frontComponent": [
                259,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                259
            ],
            "getAddressDetails": [
                382,
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
                415
            ],
            "getApprovedAccessDomains": [
                60
            ],
            "getAutoCompleteAddress": [
                67,
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
                285,
                {
                    "input": [
                        301,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                138,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                214
            ],
            "getInviteSuggestions": [
                284
            ],
            "getJobs": [
                288,
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
                        301,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                365,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                366,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                366,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                369,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                365,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        368
                    ]
                }
            ],
            "getPermissionFlags": [
                376
            ],
            "getPublicWorkspaceDataByDomain": [
                390,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                391,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                96
            ],
            "getRole": [
                415,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                415
            ],
            "getSSOIdentityProviders": [
                256
            ],
            "getToolIndex": [
                470
            ],
            "getToolInputSchema": [
                285,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                556,
                {
                    "input": [
                        557
                    ]
                }
            ],
            "getView": [
                583,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                586,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                587,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                587,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                586,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                588,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                589,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                589,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                588,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                592,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                592,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                595,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                595,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                583,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        597,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                611
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
                290,
                {
                    "input": [
                        291,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                87
            ],
            "messageSuppressions": [
                324,
                {
                    "input": [
                        257,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                330,
                {
                    "input": [
                        333,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                335
            ],
            "mostlyEmptyFieldMetadataIds": [
                477,
                {
                    "objectMetadataId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                106,
                {
                    "connectedAccountId": [
                        477
                    ]
                }
            ],
            "myConnectedAccounts": [
                137
            ],
            "myMessageChannels": [
                312,
                {
                    "connectedAccountId": [
                        477
                    ]
                }
            ],
            "myMessageFolders": [
                319,
                {
                    "messageChannelId": [
                        477
                    ]
                }
            ],
            "myUserApplicationVariables": [
                616
            ],
            "navigationMenuItem": [
                341,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                341
            ],
            "object": [
                344,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                354
            ],
            "objects": [
                345,
                {
                    "filter": [
                        348,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        182,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                379,
                {
                    "input": [
                        380,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                114,
                {
                    "input": [
                        383,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                306,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                305,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                397,
                {
                    "targets": [
                        407,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                402,
                {
                    "target": [
                        407,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                455,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                455
            ],
            "timelineActivityTypes": [
                466
            ],
            "unsubscribeTopics": [
                480
            ],
            "usageLimits": [
                559
            ],
            "usageQuotaDefinitions": [
                563
            ],
            "usageQuotaScopeConsumption": [
                565,
                {
                    "input": [
                        566,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                567
            ],
            "validatePasswordResetToken": [
                577,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                578,
                {
                    "objectMetadataId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                599,
                {
                    "id": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                477
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
                477
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
                477
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
                477
            ],
            "permissions": [
                396
            ],
            "recordId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                477
            ],
            "workspaceMemberId": [
                477
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
                398
            ],
            "generalAccessLevel": [
                398
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                396
            ],
            "roles": [
                405
            ],
            "shares": [
                403
            ],
            "sharingMode": [
                404
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                398
            ],
            "id": [
                8
            ],
            "principalId": [
                477
            ],
            "principalRoleId": [
                477
            ],
            "principalType": [
                400
            ],
            "rowCause": [
                401
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
                477
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
                601
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
                477
            ],
            "recordId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                239
            ],
            "sourceObjectMetadata": [
                344
            ],
            "targetFieldMetadata": [
                239
            ],
            "targetObjectMetadata": [
                344
            ],
            "type": [
                409
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
                477
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
                246
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                352
            ],
            "permissionFlags": [
                416
            ],
            "rowLevelPermissionPredicateGroups": [
                419
            ],
            "rowLevelPermissionPredicates": [
                418
            ],
            "universalIdentifier": [
                477
            ],
            "workspaceMembers": [
                615
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
                477
            ],
            "roleId": [
                477
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
                423
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
                285
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
                421
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
                477
            ],
            "logicalOperator": [
                421
            ],
            "objectMetadataId": [
                477
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                477
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
                477
            ],
            "id": [
                477
            ],
            "operand": [
                423
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
            ],
            "rowLevelPermissionPredicateGroupId": [
                477
            ],
            "subFieldName": [
                1
            ],
            "value": [
                285
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
                426
            ],
            "messages": [
                426
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                477
            ],
            "thread": [
                429
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                477
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
                425
            ],
            "content": [
                1
            ],
            "role": [
                427
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
                285
            ],
            "success": [
                4
            ],
            "threadId": [
                477
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
                477
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                432
            ],
            "type": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                477
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                432
            ],
            "type": [
                268
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
                184
            ],
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                477
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                477
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
                436
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
                285
            ],
            "workspaceMemberId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                477
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
                613
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
                184
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                114
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
                285
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                477
            ],
            "createdAt": [
                184
            ],
            "frontComponentId": [
                477
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "position": [
                9
            ],
            "scope": [
                449
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
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
                477
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
                477
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                432
            ],
            "type": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                63
            ],
            "workspace": [
                625
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
                477
            ],
            "content": [
                1
            ],
            "createdAt": [
                184
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                184
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                414
            ],
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                623
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
                233,
                {
                    "fieldFilters": [
                        227,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        234,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                394,
                {
                    "input": [
                        168,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                302,
                {
                    "input": [
                        303,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        477,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                235,
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
                464
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
                601
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
                477
            ],
            "createdAt": [
                184
            ],
            "emit": [
                467
            ],
            "frontComponentUniversalIdentifier": [
                477
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                477
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                477
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                477
            ],
            "on": [
                1
            ],
            "through": [
                468
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                477
            ],
            "relationFieldUniversalIdentifier": [
                477
            ],
            "triggerFieldUniversalIdentifiers": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                601
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
                285
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
                63
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                477
            ],
            "gt": [
                477
            ],
            "gte": [
                477
            ],
            "iLike": [
                477
            ],
            "in": [
                477
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                477
            ],
            "lt": [
                477
            ],
            "lte": [
                477
            ],
            "neq": [
                477
            ],
            "notILike": [
                477
            ],
            "notIn": [
                477
            ],
            "notLike": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                184
            ],
            "description": [
                1
            ],
            "id": [
                477
            ],
            "name": [
                1
            ],
            "updatedAt": [
                184
            ],
            "visibility": [
                481
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
                477
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                285
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
                285
            ],
            "roleId": [
                477
            ],
            "triggers": [
                285
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
                477
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
                477
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                318
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
                487
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
                489
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
                477
            ],
            "update": [
                491
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                107
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                477
            ],
            "availabilityType": [
                134
            ],
            "engineComponentKey": [
                218
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                477
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                285
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
                285
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                477
            ],
            "options": [
                285
            ],
            "settings": [
                285
            ],
            "translations": [
                331
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
                477
            ],
            "update": [
                496
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
                477
            ],
            "update": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                285
            ],
            "databaseEventTriggerSettings": [
                285
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                285
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
                285
            ],
            "workflowActionTriggerSettings": [
                285
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                477
            ],
            "update": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                313
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
                320
            ],
            "visibility": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                477
            ],
            "update": [
                503
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
                477
            ],
            "update": [
                503
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
                477
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
                477
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
                477
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
                477
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
                351
            ],
            "readability": [
                329
            ],
            "sharingReach": [
                359
            ],
            "shortcut": [
                1
            ],
            "translations": [
                331
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                477
            ],
            "update": [
                494
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                477
            ],
            "update": [
                505
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                477
            ],
            "update": [
                506
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
                477
            ],
            "type": [
                368
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
                367
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
                477
            ],
            "layoutMode": [
                367
            ],
            "position": [
                9
            ],
            "title": [
                1
            ],
            "widgets": [
                514
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
                285
            ],
            "configuration": [
                285
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                477
            ],
            "pageLayoutTabId": [
                477
            ],
            "position": [
                285
            ],
            "title": [
                1
            ],
            "type": [
                602
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
                285
            ],
            "configuration": [
                285
            ],
            "id": [
                477
            ],
            "objectMetadataId": [
                477
            ],
            "pageLayoutTabId": [
                477
            ],
            "position": [
                285
            ],
            "title": [
                1
            ],
            "type": [
                602
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
                477
            ],
            "tabs": [
                512
            ],
            "type": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                477
            ],
            "update": [
                517
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
                477
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
                477
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                331
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                477
            ],
            "payload": [
                172
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                477
            ],
            "update": [
                523
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
                477
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
                477
            ],
            "update": [
                525
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
                477
            ],
            "update": [
                527
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                477
            ],
            "logicalOperator": [
                590
            ],
            "parentViewFilterGroupId": [
                477
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                477
            ],
            "update": [
                530
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                477
            ],
            "operand": [
                591
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                477
            ],
            "subFieldName": [
                1
            ],
            "value": [
                285
            ],
            "viewFilterGroupId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                477
            ],
            "update": [
                532
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                477
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
                477
            ],
            "calendarFieldMetadataId": [
                477
            ],
            "calendarLayout": [
                584
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                477
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                477
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                477
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                594
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                597
            ],
            "visibility": [
                598
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                477
            ],
            "update": [
                535
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                596
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
                477
            ],
            "update": [
                537
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
                285
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                477
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
                612
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                285
            ],
            "workspaceMemberId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                247
            ],
            "roleId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                477
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                543
            ],
            "id": [
                477
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
                543
            ],
            "groups": [
                544
            ],
            "widgetId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                353
            ],
            "roleId": [
                477
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                477
            ],
            "predicateGroups": [
                420
            ],
            "predicates": [
                422
            ],
            "roleId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                419
            ],
            "predicates": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                554
            ],
            "viewFields": [
                551
            ],
            "viewFilterGroups": [
                552
            ],
            "viewFilters": [
                553
            ],
            "viewSorts": [
                555
            ],
            "widgetId": [
                477
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
                477
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                477
            ],
            "logicalOperator": [
                590
            ],
            "parentViewFilterGroupId": [
                477
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
                477
            ],
            "id": [
                477
            ],
            "operand": [
                591
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                477
            ],
            "subFieldName": [
                1
            ],
            "value": [
                285
            ],
            "viewFilterGroupId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                477
            ],
            "calendarFieldMetadataId": [
                477
            ],
            "calendarLayout": [
                584
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                477
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                477
            ],
            "openRecordIn": [
                594
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                596
            ],
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                184
            ],
            "periodStart": [
                184
            ],
            "timeSeries": [
                569
            ],
            "usageByApplication": [
                558
            ],
            "usageByModel": [
                558
            ],
            "usageByOperationType": [
                558
            ],
            "usageByUser": [
                558
            ],
            "userDailyUsage": [
                571
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                561
            ],
            "periodEnd": [
                184
            ],
            "periodStart": [
                184
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
                78
            ],
            "createdAt": [
                184
            ],
            "id": [
                477
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                78
            ],
            "operationType": [
                561
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                568
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                570
            ],
            "updatedAt": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                570
            ],
            "operationType": [
                561
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                560
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                564
            ],
            "resourceType": [
                568
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                562
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
                561
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                570
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                78
            ],
            "periodEnd": [
                184
            ],
            "periodStart": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                561
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                568
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                570
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                78
            ],
            "id": [
                477
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                78
            ],
            "operationType": [
                561
            ],
            "periodEnd": [
                184
            ],
            "periodStart": [
                184
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                78
            ],
            "resourceType": [
                568
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
                570
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
                569
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
                69
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                184
            ],
            "currentUserWorkspace": [
                575
            ],
            "currentWorkspace": [
                606
            ],
            "deletedAt": [
                184
            ],
            "deletedWorkspaceMembers": [
                197
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
                477
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
                360
            ],
            "previousOnboardingStatus": [
                360
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                184
            ],
            "userVars": [
                286
            ],
            "userWorkspaces": [
                575
            ],
            "workspaceMember": [
                615
            ],
            "workspaceMembers": [
                615
            ],
            "workspaces": [
                575
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
                285
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
                184
            ],
            "expiresAt": [
                184
            ],
            "id": [
                477
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
                184
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "id": [
                477
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                352
            ],
            "objectsPermissions": [
                352
            ],
            "permissionFlags": [
                377
            ],
            "twoFactorAuthenticationMethodSummary": [
                476
            ],
            "updatedAt": [
                184
            ],
            "user": [
                572
            ],
            "userId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                477
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
                477
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
                477
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                477
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
                63
            ],
            "workspaceUrls": [
                624
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
                477
            ],
            "calendarEndFieldMetadataId": [
                477
            ],
            "calendarFieldMetadataId": [
                477
            ],
            "calendarLayout": [
                584
            ],
            "createdAt": [
                184
            ],
            "createdByUserWorkspaceId": [
                477
            ],
            "deletedAt": [
                184
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                477
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
                477
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                593
            ],
            "mainGroupByFieldMetadataId": [
                477
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                477
            ],
            "openRecordIn": [
                594
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                597
            ],
            "universalIdentifier": [
                477
            ],
            "updatedAt": [
                184
            ],
            "viewFieldGroups": [
                587
            ],
            "viewFields": [
                586
            ],
            "viewFilterGroups": [
                589
            ],
            "viewFilters": [
                588
            ],
            "viewGroups": [
                592
            ],
            "viewSorts": [
                595
            ],
            "visibility": [
                598
            ],
            "workspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                601
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
                477
            ],
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
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
                477
            ],
            "updatedAt": [
                184
            ],
            "viewFieldGroupId": [
                477
            ],
            "viewId": [
                477
            ],
            "workspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "id": [
                477
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
                184
            ],
            "viewFields": [
                586
            ],
            "viewId": [
                477
            ],
            "workspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
            ],
            "operand": [
                591
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                477
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                184
            ],
            "value": [
                285
            ],
            "viewFilterGroupId": [
                477
            ],
            "viewId": [
                477
            ],
            "workspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "id": [
                477
            ],
            "logicalOperator": [
                590
            ],
            "parentViewFilterGroupId": [
                477
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                184
            ],
            "viewId": [
                477
            ],
            "workspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "fieldValue": [
                1
            ],
            "id": [
                477
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "updatedAt": [
                184
            ],
            "viewId": [
                477
            ],
            "workspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "direction": [
                596
            ],
            "fieldMetadataId": [
                477
            ],
            "id": [
                477
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                184
            ],
            "viewId": [
                477
            ],
            "workspaceId": [
                477
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
                477
            ],
            "createdAt": [
                184
            ],
            "deletedAt": [
                184
            ],
            "description": [
                1
            ],
            "id": [
                477
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
                184
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
                72
            ],
            "on_CalendarConfiguration": [
                111
            ],
            "on_CallRecordingSummaryConfiguration": [
                112
            ],
            "on_CallRecordingTranscriptConfiguration": [
                113
            ],
            "on_ChatConfiguration": [
                121
            ],
            "on_ChatThreadsConfiguration": [
                124
            ],
            "on_EmailThreadConfiguration": [
                213
            ],
            "on_EmailsConfiguration": [
                217
            ],
            "on_FieldConfiguration": [
                240
            ],
            "on_FieldRichTextConfiguration": [
                248
            ],
            "on_FieldsConfiguration": [
                249
            ],
            "on_FilesConfiguration": [
                255
            ],
            "on_FormFieldConfiguration": [
                258
            ],
            "on_FrontComponentConfiguration": [
                260
            ],
            "on_IframeConfiguration": [
                269
            ],
            "on_LineChartConfiguration": [
                289
            ],
            "on_MessageCampaignBodyConfiguration": [
                310
            ],
            "on_MessageCampaignDetailsConfiguration": [
                311
            ],
            "on_NotesConfiguration": [
                343
            ],
            "on_PieChartConfiguration": [
                378
            ],
            "on_RecordTableConfiguration": [
                406
            ],
            "on_StandaloneRichTextConfiguration": [
                456
            ],
            "on_TasksConfiguration": [
                465
            ],
            "on_TimelineConfiguration": [
                469
            ],
            "on_ViewConfiguration": [
                585
            ],
            "on_WorkflowConfiguration": [
                603
            ],
            "on_WorkflowRunConfiguration": [
                604
            ],
            "on_WorkflowVersionConfiguration": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                607
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
                285
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                80
            ],
            "billingEntitlements": [
                82
            ],
            "billingSubscriptions": [
                98
            ],
            "createdAt": [
                184
            ],
            "currentBillingSubscription": [
                98
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                415
            ],
            "deletedAt": [
                184
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
                237
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                477
            ],
            "installedApplications": [
                34
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
                477
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
                184
            ],
            "viewFields": [
                586
            ],
            "viewFilterGroups": [
                589
            ],
            "viewFilters": [
                588
            ],
            "viewGroups": [
                592
            ],
            "viewSorts": [
                595
            ],
            "views": [
                583
            ],
            "workspaceCustomApplication": [
                34
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                612
            ],
            "workspaceMembersCount": [
                9
            ],
            "workspaceUrls": [
                624
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
                285
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                609
            ],
            "personEnrichment": [
                285
            ],
            "personOutcome": [
                622
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
                184
            ],
            "id": [
                477
            ],
            "roleId": [
                477
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
                617
            ],
            "id": [
                477
            ],
            "locale": [
                1
            ],
            "name": [
                261
            ],
            "numberFormat": [
                618
            ],
            "openRecordIn": [
                363
            ],
            "roles": [
                415
            ],
            "timeFormat": [
                619
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
                477
            ],
            "userWorkspaceId": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                477
            ],
            "variables": [
                573
            ],
            "workspaceMemberId": [
                477
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
                285
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
                477
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
                477
            ],
            "workspaceUrls": [
                624
            ],
            "__typename": [
                1
            ]
        }
    }
}