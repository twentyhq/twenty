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
        44,
        52,
        54,
        60,
        72,
        76,
        77,
        79,
        84,
        89,
        95,
        105,
        108,
        109,
        110,
        111,
        119,
        121,
        135,
        140,
        184,
        185,
        212,
        216,
        217,
        219,
        229,
        235,
        239,
        243,
        246,
        253,
        267,
        269,
        279,
        286,
        287,
        288,
        299,
        301,
        314,
        315,
        316,
        317,
        318,
        319,
        321,
        322,
        323,
        326,
        327,
        329,
        330,
        333,
        335,
        339,
        343,
        352,
        359,
        360,
        361,
        364,
        368,
        369,
        374,
        378,
        399,
        401,
        402,
        405,
        410,
        422,
        424,
        428,
        433,
        450,
        462,
        463,
        465,
        478,
        480,
        482,
        542,
        562,
        569,
        571,
        585,
        591,
        592,
        594,
        595,
        597,
        598,
        599,
        602,
        603,
        608,
        610,
        613,
        618,
        619,
        620,
        623,
        624
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
                286
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
                478
            ],
            "createdAt": [
                185
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                286
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
                286
            ],
            "roleId": [
                478
            ],
            "triggers": [
                286
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                286
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
                185
            ],
            "deletedAt": [
                185
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
                185
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
                185
            ],
            "id": [
                478
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                185
            ],
            "lastReadAt": [
                185
            ],
            "snoozedUntil": [
                185
            ],
            "threadId": [
                478
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                478
            ],
            "createdAt": [
                185
            ],
            "id": [
                478
            ],
            "parts": [
                13
            ],
            "processedAt": [
                185
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                478
            ],
            "status": [
                1
            ],
            "threadId": [
                478
            ],
            "turnId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                185
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                478
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                478
            ],
            "messageId": [
                478
            ],
            "orderIndex": [
                7
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                286
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
                286
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                286
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
                185
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
                185
            ],
            "errorMessage": [
                1
            ],
            "id": [
                478
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
                185
            ],
            "status": [
                15
            ],
            "threadId": [
                478
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
                478
            ],
            "aggregateOperation": [
                17
            ],
            "configurationType": [
                602
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                286
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "label": [
                1
            ],
            "numberFormat": [
                121
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                394
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
                79
            ],
            "kind": [
                1
            ],
            "limitValue": [
                79
            ],
            "periodEnd": [
                185
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
                185
            ],
            "expiresAt": [
                185
            ],
            "id": [
                478
            ],
            "name": [
                1
            ],
            "revokedAt": [
                185
            ],
            "role": [
                416
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                185
            ],
            "id": [
                478
            ],
            "name": [
                1
            ],
            "revokedAt": [
                185
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
                286
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
                185
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
                478
            ],
            "role": [
                323
            ],
            "workspaceMemberId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "AppPreferencesApplication": {
            "id": [
                478
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                478
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
                56
            ],
            "applicationRegistrationId": [
                478
            ],
            "applicationVariables": [
                59
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                286
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                134
            ],
            "defaultLogicFunctionRole": [
                416
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                260
            ],
            "healthCheckLogicFunctionId": [
                478
            ],
            "id": [
                478
            ],
            "logicFunctions": [
                298
            ],
            "logoFileId": [
                478
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                345
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                478
            ],
            "settingsCustomTabFrontComponentId": [
                478
            ],
            "settingsMenuItems": [
                449
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                478
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                185
            ],
            "id": [
                478
            ],
            "lastAuthorizedAt": [
                185
            ],
            "lastUsedAt": [
                185
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                478
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                478
            ],
            "archivedAt": [
                185
            ],
            "authFailedAt": [
                185
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                390
            ],
            "connectionProviderId": [
                478
            ],
            "createdAt": [
                185
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                478
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                185
            ],
            "lastSignedInAt": [
                185
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
                185
            ],
            "userWorkspaceId": [
                478
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
                478
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                40
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
                42
            ],
            "coverage": [
                43
            ],
            "files": [
                45
            ],
            "manifest": [
                286
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
                54
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
                44
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
                478
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
                253
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
                253
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
                185
            ],
            "fileFolder": [
                253
            ],
            "fileId": [
                478
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
                50
            ],
            "description": [
                1
            ],
            "status": [
                52
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
                185
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                478
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
                478
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                54
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                185
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
                583
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                478
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                54
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                185
            ],
            "description": [
                1
            ],
            "id": [
                478
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
                286
            ],
            "type": [
                1
            ],
            "updatedAt": [
                185
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
                64
            ],
            "applicationRefreshToken": [
                64
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
                478
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
                286
            ],
            "scope": [
                60
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
                185
            ],
            "domain": [
                1
            ],
            "id": [
                478
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
                432
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                185
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
                64
            ],
            "refreshToken": [
                64
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                65
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
                478
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
                431
            ],
            "workspaceUrls": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                69
            ],
            "availableWorkspacesForSignUp": [
                69
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                70
            ],
            "tokens": [
                65
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                478
            ],
            "aggregateOperation": [
                17
            ],
            "axisNameDisplay": [
                72
            ],
            "color": [
                1
            ],
            "configurationType": [
                602
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
                286
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupMode": [
                76
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                77
            ],
            "numberFormat": [
                121
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                359
            ],
            "primaryAxisGroupByFieldMetadataId": [
                478
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                267
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                359
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                478
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                267
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
                286
            ],
            "formattedToRawLookup": [
                286
            ],
            "groupMode": [
                76
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
                77
            ],
            "series": [
                78
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
                286
            ],
            "objectMetadataId": [
                478
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
                103
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
                478
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
                99
            ],
            "currentBillingSubscription": [
                99
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                463
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                84
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
                96
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
        "BillingMeteredProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                96
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
                85
            ],
            "meteredProducts": [
                86
            ],
            "planKey": [
                89
            ],
            "resourceCreditProducts": [
                85
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
                105
            ],
            "recurringInterval": [
                462
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
                105
            ],
            "recurringInterval": [
                462
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                92
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
                96
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
                96
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                85
            ],
            "on_BillingMeteredProduct": [
                86
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
                89
            ],
            "priceUsageBased": [
                105
            ],
            "productKey": [
                95
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
                185
            ],
            "periodStart": [
                185
            ],
            "productKey": [
                95
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
                100
            ],
            "cancelAt": [
                185
            ],
            "currentPeriodEnd": [
                185
            ],
            "id": [
                478
            ],
            "interval": [
                462
            ],
            "metadata": [
                286
            ],
            "phases": [
                101
            ],
            "status": [
                463
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                94
            ],
            "creditAmount": [
                9
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                478
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
                102
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
                99
            ],
            "currentBillingSubscription": [
                99
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
                478
            ],
            "contactAutoCreationPolicy": [
                108
            ],
            "createdAt": [
                185
            ],
            "handle": [
                1
            ],
            "id": [
                478
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                109
            ],
            "syncStageStartedAt": [
                185
            ],
            "syncStatus": [
                110
            ],
            "syncedAt": [
                185
            ],
            "throttleFailureCount": [
                9
            ],
            "updatedAt": [
                185
            ],
            "visibility": [
                111
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
                602
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                602
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
                119
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
                602
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                286
            ],
            "error": [
                124
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
                602
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
                339
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                341
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
                128
            ],
            "aiModelTiers": [
                130
            ],
            "aiModels": [
                129
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
                63
            ],
            "billing": [
                80
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                118
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
                132
            ],
            "publicFeatureFlags": [
                388
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                447
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                464
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                185
            ],
            "link": [
                1
            ],
            "startAt": [
                185
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
                478
            ],
            "availabilityObjectMetadataId": [
                478
            ],
            "availabilityType": [
                135
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                478
            ],
            "createdAt": [
                185
            ],
            "engineComponentKey": [
                219
            ],
            "frontComponent": [
                260
            ],
            "frontComponentId": [
                478
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                478
            ],
            "pageLayoutId": [
                478
            ],
            "payload": [
                136
            ],
            "position": [
                9
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
            ],
            "workflowVersionId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                351
            ],
            "on_PathCommandMenuItemPayload": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                46
            ],
            "files": [
                251
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                478
            ],
            "archivedAt": [
                185
            ],
            "authFailedAt": [
                185
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                390
            ],
            "connectionProviderId": [
                478
            ],
            "createdAt": [
                185
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                478
            ],
            "lastCredentialsRefreshedAt": [
                185
            ],
            "lastSignedInAt": [
                185
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
                185
            ],
            "userWorkspaceId": [
                478
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
                272
            ],
            "handle": [
                1
            ],
            "id": [
                478
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                212
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
                286
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
                286
            ],
            "roleId": [
                478
            ],
            "triggers": [
                286
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                478
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                47
            ],
            "targets": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                53
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
                478
            ],
            "availabilityType": [
                135
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                478
            ],
            "engineComponentKey": [
                219
            ],
            "frontComponentId": [
                478
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
                478
            ],
            "pageLayoutId": [
                478
            ],
            "payload": [
                286
            ],
            "position": [
                9
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                478
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
                313
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
                286
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
                286
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                478
            ],
            "options": [
                286
            ],
            "relationCreationPayload": [
                286
            ],
            "settings": [
                286
            ],
            "type": [
                246
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
                478
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
                478
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
                157
            ],
            "indexType": [
                279
            ],
            "objectMetadataId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                286
            ],
            "databaseEventTriggerSettings": [
                286
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                286
            ],
            "id": [
                478
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                286
            ],
            "source": [
                286
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                286
            ],
            "universalIdentifier": [
                478
            ],
            "workflowActionTriggerSettings": [
                286
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
                478
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
                478
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                478
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                478
            ],
            "targetRecordId": [
                478
            ],
            "type": [
                343
            ],
            "userWorkspaceId": [
                478
            ],
            "viewId": [
                478
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
                286
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
                155
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                158
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                162
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
                478
            ],
            "type": [
                369
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                368
            ],
            "pageLayoutId": [
                478
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
                286
            ],
            "objectMetadataId": [
                478
            ],
            "pageLayoutTabId": [
                478
            ],
            "position": [
                286
            ],
            "title": [
                1
            ],
            "type": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                478
            ],
            "filter": [
                286
            ],
            "objectMetadataId": [
                478
            ],
            "orderBy": [
                286
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
                478
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                79
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                79
            ],
            "operationType": [
                562
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                569
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                571
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
                478
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                478
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
                478
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
                478
            ],
            "id": [
                478
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
                478
            ],
            "viewId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                478
            ],
            "logicalOperator": [
                591
            ],
            "parentViewFilterGroupId": [
                478
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
            ],
            "operand": [
                592
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                478
            ],
            "subFieldName": [
                1
            ],
            "value": [
                286
            ],
            "viewFilterGroupId": [
                478
            ],
            "viewId": [
                478
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
                478
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "viewId": [
                478
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
                478
            ],
            "calendarFieldMetadataId": [
                478
            ],
            "calendarLayout": [
                585
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                478
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                594
            ],
            "mainGroupByFieldMetadataId": [
                478
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                478
            ],
            "openRecordIn": [
                595
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                598
            ],
            "visibility": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                597
            ],
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                478
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
                478
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
                140
            ],
            "before": [
                140
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                478
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                478
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
                478
            ],
            "name": [
                262
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                478
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
                478
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                205
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
                478
            ],
            "pageLayoutId": [
                478
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
                478
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
                478
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                433
            ],
            "type": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                478
            ],
            "status": [
                433
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                141
            ],
            "IMAP": [
                141
            ],
            "SMTP": [
                141
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
                602
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                185
            ],
            "domain": [
                1
            ],
            "id": [
                478
            ],
            "status": [
                216
            ],
            "tenantStatus": [
                217
            ],
            "unsubscribeHostnameStatus": [
                480
            ],
            "updatedAt": [
                185
            ],
            "verificationRecords": [
                580
            ],
            "verifiedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                602
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
                286
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
                286
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
                221
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                286
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
                185
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
                185
            ],
            "currentPeriodEnd": [
                185
            ],
            "expiresAt": [
                185
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
                185
            ],
            "start": [
                185
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
                229
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
                227
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                228
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
                230
            ],
            "first": [
                7
            ],
            "table": [
                235
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                231
            ],
            "records": [
                234
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
                286
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                185
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
                328
            ],
            "objectRecordEventsWithQueryIds": [
                358
            ],
            "queueJobEvents": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                478
            ],
            "payload": [
                286
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                239
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
                478
            ],
            "createdAt": [
                185
            ],
            "defaultValue": [
                286
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                478
            ],
            "morphRelations": [
                409
            ],
            "name": [
                1
            ],
            "object": [
                345
            ],
            "objectMetadataId": [
                478
            ],
            "options": [
                286
            ],
            "relation": [
                409
            ],
            "settings": [
                286
            ],
            "type": [
                246
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                185
            ],
            "writability": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                602
            ],
            "fieldDisplayMode": [
                243
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
                244
            ],
            "pageInfo": [
                365
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                140
            ],
            "node": [
                240
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                245
            ],
            "id": [
                479
            ],
            "isActive": [
                106
            ],
            "isSystem": [
                106
            ],
            "isUIEditable": [
                106
            ],
            "isUIReadOnly": [
                106
            ],
            "objectMetadataId": [
                479
            ],
            "or": [
                245
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
                478
            ],
            "id": [
                478
            ],
            "objectMetadataId": [
                478
            ],
            "roleId": [
                478
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
                478
            ],
            "objectMetadataId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                602
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
                185
            ],
            "id": [
                478
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
                478
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
                185
            ],
            "fileId": [
                478
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
                185
            ],
            "id": [
                478
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
                602
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                478
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                433
            ],
            "type": [
                269
            ],
            "workspace": [
                622
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
                326
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                602
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
                478
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                58
            ],
            "applicationVariables": [
                286
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
                185
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                478
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
                478
            ],
            "updatedAt": [
                185
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
                602
            ],
            "frontComponentId": [
                478
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                478
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
                478
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
                478
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
                478
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
                478
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
                602
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
                273
            ],
            "IMAP": [
                273
            ],
            "SMTP": [
                273
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
                212
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
                64
            ],
            "workspace": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                185
            ],
            "id": [
                478
            ],
            "indexFieldMetadataList": [
                277
            ],
            "indexType": [
                279
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
                185
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                140
            ],
            "node": [
                275
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                185
            ],
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
            ],
            "order": [
                9
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                278
            ],
            "id": [
                479
            ],
            "isCustom": [
                106
            ],
            "or": [
                278
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                478
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
                282
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
                478
            ],
            "messageThreadId": [
                478
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
                288
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                478
            ],
            "aggregateOperation": [
                17
            ],
            "axisNameDisplay": [
                72
            ],
            "color": [
                1
            ],
            "configurationType": [
                602
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
                286
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
                121
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                359
            ],
            "primaryAxisGroupByFieldMetadataId": [
                478
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                267
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                359
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                478
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                267
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
                286
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                294
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
                286
            ],
            "objectMetadataId": [
                478
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
                293
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
                478
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
                478
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                185
            ],
            "cronTriggerSettings": [
                286
            ],
            "databaseEventTriggerSettings": [
                286
            ],
            "description": [
                1
            ],
            "executionMode": [
                299
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                286
            ],
            "id": [
                478
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
                286
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
            ],
            "workflowActionTriggerSettings": [
                286
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                286
            ],
            "duration": [
                9
            ],
            "error": [
                286
            ],
            "logs": [
                1
            ],
            "status": [
                301
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                478
            ],
            "applicationUniversalIdentifier": [
                478
            ],
            "id": [
                478
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                64
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
                286
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
                308
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                54
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
                309
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                310
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
                602
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                138
            ],
            "connectedAccountId": [
                478
            ],
            "contactAutoCreationPolicy": [
                314
            ],
            "createdAt": [
                185
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
                478
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                321
            ],
            "pendingGroupEmailsAction": [
                315
            ],
            "syncStage": [
                316
            ],
            "syncStageStartedAt": [
                185
            ],
            "syncStatus": [
                317
            ],
            "syncedAt": [
                185
            ],
            "throttleFailureCount": [
                9
            ],
            "throttleRetryAfter": [
                185
            ],
            "type": [
                318
            ],
            "updatedAt": [
                185
            ],
            "visibility": [
                319
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
                185
            ],
            "externalId": [
                1
            ],
            "id": [
                478
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                478
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                322
            ],
            "updatedAt": [
                185
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
                185
            ],
            "emailAddress": [
                1
            ],
            "id": [
                478
            ],
            "reason": [
                326
            ],
            "source": [
                327
            ],
            "unsubscribeTopicId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                324
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
                357
            ],
            "recordId": [
                1
            ],
            "type": [
                329
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
                478
            ],
            "property": [
                1
            ],
            "provenance": [
                333
            ],
            "recordId": [
                478
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
                478
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                133
            ],
            "objectMetadataItems": [
                337
            ],
            "views": [
                338
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
                478
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
                478
            ],
            "key": [
                594
            ],
            "objectMetadataId": [
                478
            ],
            "type": [
                598
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                456,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                607,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                478,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        478,
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
                        478,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        478,
                        "UUID!"
                    ],
                    "roleId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        478,
                        "UUID!"
                    ],
                    "roleId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                67,
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
                117,
                {
                    "input": [
                        116,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                104
            ],
            "cancelSwitchBillingPlan": [
                104
            ],
            "cancelSwitchResourceCreditPrice": [
                104
            ],
            "checkCustomDomainValidRecords": [
                206
            ],
            "checkPublicDomainValidRecords": [
                206,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                98,
                {
                    "plan": [
                        89,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        462,
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
                53,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                53,
                {
                    "fileId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                137,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        478,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                363,
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
                255,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                255,
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
                255,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                255,
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
                        143,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                313,
                {
                    "input": [
                        144,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                145,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        48,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                146,
                {
                    "input": [
                        147,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                61,
                {
                    "input": [
                        148,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                87
            ],
            "createCalendarEvent": [
                150,
                {
                    "input": [
                        149,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                6
            ],
            "createCommandMenuItem": [
                134,
                {
                    "input": [
                        151,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                204,
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
                153,
                {
                    "input": [
                        152,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                215,
                {
                    "input": [
                        154,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                254,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        253,
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
                260,
                {
                    "input": [
                        156,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                342,
                {
                    "inputs": [
                        161,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                588,
                {
                    "inputs": [
                        175,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                587,
                {
                    "inputs": [
                        176,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                593,
                {
                    "inputs": [
                        179,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                324,
                {
                    "input": [
                        160,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                342,
                {
                    "input": [
                        161,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                254,
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
                453,
                {
                    "input": [
                        451,
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
                        478,
                        "UUID!"
                    ],
                    "properties": [
                        286
                    ],
                    "recordId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        142,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                240,
                {
                    "input": [
                        163,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                275,
                {
                    "input": [
                        164,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                298,
                {
                    "input": [
                        159,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                345,
                {
                    "input": [
                        165,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                416,
                {
                    "createRoleInput": [
                        170,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                366,
                {
                    "input": [
                        166,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                367,
                {
                    "input": [
                        167,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                370,
                {
                    "input": [
                        168,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                387,
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
                453,
                {
                    "input": [
                        452,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                456,
                {
                    "input": [
                        171,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                87,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        89,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        462,
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
                481,
                {
                    "input": [
                        172,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                560,
                {
                    "input": [
                        173,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                579,
                {
                    "input": [
                        174,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                584,
                {
                    "input": [
                        180,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                587,
                {
                    "input": [
                        176,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                588,
                {
                    "input": [
                        175,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                589,
                {
                    "input": [
                        178,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                590,
                {
                    "input": [
                        177,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                593,
                {
                    "input": [
                        179,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                596,
                {
                    "input": [
                        181,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                600,
                {
                    "input": [
                        182,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                456,
                {
                    "id": [
                        478,
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
                313,
                {
                    "id": [
                        478,
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
                        186,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                134,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                138,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                607
            ],
            "deleteEmailGroupChannel": [
                313,
                {
                    "id": [
                        478,
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
                260,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                342,
                {
                    "ids": [
                        478,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                342,
                {
                    "id": [
                        478,
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
                240,
                {
                    "input": [
                        187,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                275,
                {
                    "input": [
                        188,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                298,
                {
                    "input": [
                        302,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                345,
                {
                    "input": [
                        189,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        478,
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
                        478,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                190,
                {
                    "input": [
                        191,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                456,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                192,
                {
                    "twoFactorAuthenticationMethodId": [
                        478,
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
                        478,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                573
            ],
            "deleteUserFromWorkspace": [
                576,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                579,
                {
                    "id": [
                        478,
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
                587,
                {
                    "input": [
                        194,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                588,
                {
                    "input": [
                        193,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                589,
                {
                    "input": [
                        195,
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
                593,
                {
                    "input": [
                        196,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        197,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                600,
                {
                    "id": [
                        478,
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
                587,
                {
                    "input": [
                        200,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                588,
                {
                    "input": [
                        199,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                589,
                {
                    "input": [
                        201,
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
                593,
                {
                    "input": [
                        202,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        203,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                138,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                207,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                208,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                209,
                {
                    "input": [
                        210,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                213,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        478
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                82
            ],
            "enqueueJob": [
                222,
                {
                    "input": [
                        220,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                224,
                {
                    "input": [
                        223,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                611
            ],
            "executeOneLogicFunction": [
                300,
                {
                    "input": [
                        237,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                28,
                {
                    "apiKeyId": [
                        478,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                58,
                {
                    "applicationId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                64
            ],
            "generateTransientToken": [
                472
            ],
            "getAuthTokensFromLoginToken": [
                66,
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
                66,
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
                66,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                264,
                {
                    "input": [
                        265,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                305,
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
                362
            ],
            "grantApplicationCapabilities": [
                37,
                {
                    "input": [
                        266,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                274,
                {
                    "userId": [
                        478,
                        "UUID!"
                    ],
                    "workspaceId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                281,
                {
                    "input": [
                        280,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                283,
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
                283
            ],
            "installApplication": [
                35,
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
                        478,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                10,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                10,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                225
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        411,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                403,
                {
                    "principal": [
                        400,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        408,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                58,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                66,
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
                        412,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                413,
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
                443,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                134,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                367,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                366,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                370,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                467,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                436,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        478,
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
                        414,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                418,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                429,
                {
                    "input": [
                        425,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                51,
                {
                    "applicationId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                271,
                {
                    "connectionParameters": [
                        211,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        478
                    ]
                }
            ],
            "sendChatMessage": [
                436,
                {
                    "browsingContext": [
                        286
                    ],
                    "fileAttachments": [
                        252,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        478,
                        "[UUID!]"
                    ],
                    "messageId": [
                        478,
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
                        478,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                439,
                {
                    "input": [
                        438,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                442,
                {
                    "input": [
                        441,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                443,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        478
                    ]
                }
            ],
            "sendMessageCampaign": [
                445,
                {
                    "input": [
                        444,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                440,
                {
                    "input": [
                        446,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                30,
                {
                    "input": [
                        448,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                225,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                403,
                {
                    "accessLevel": [
                        399,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        408,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                403,
                {
                    "accessLevel": [
                        399,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        400,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        408,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                104,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                71,
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
                71,
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
                454,
                {
                    "input": [
                        455
                    ]
                }
            ],
            "signUpInWorkspace": [
                454,
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
                        478
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
                363,
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
                        185,
                        "DateTime!"
                    ],
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                120,
                {
                    "connectedAccountId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                458,
                {
                    "companyContext": [
                        286
                    ],
                    "personContext": [
                        286
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                459
            ],
            "subscribeToAgentChatThread": [
                10,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "switchBillingPlan": [
                104
            ],
            "switchSubscriptionInterval": [
                104
            ],
            "syncApplication": [
                621,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        286,
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
                        286
                    ],
                    "type": [
                        24,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                53,
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
                474,
                {
                    "input": [
                        473,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                476,
                {
                    "input": [
                        475,
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
                        478,
                        "UUID!"
                    ]
                }
            ],
            "updateApiKey": [
                26,
                {
                    "input": [
                        484,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                313,
                {
                    "input": [
                        485,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                35,
                {
                    "id": [
                        478,
                        "UUID!"
                    ],
                    "input": [
                        486,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                53,
                {
                    "input": [
                        487,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                57,
                {
                    "input": [
                        489,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                107,
                {
                    "input": [
                        491,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                134,
                {
                    "input": [
                        493,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                313,
                {
                    "input": [
                        494,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                260,
                {
                    "input": [
                        496,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                238,
                {
                    "input": [
                        498,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                342,
                {
                    "inputs": [
                        509,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                345,
                {
                    "inputs": [
                        510,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                593,
                {
                    "inputs": [
                        532,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                313,
                {
                    "input": [
                        501,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                320,
                {
                    "input": [
                        503,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                320,
                {
                    "input": [
                        505,
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
                342,
                {
                    "input": [
                        509,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        483,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        478
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
                240,
                {
                    "input": [
                        508,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        499,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                345,
                {
                    "input": [
                        510,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                416,
                {
                    "updateRoleInput": [
                        517,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                366,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        511,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                367,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        512,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                370,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        514,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                366,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        516,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                284,
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
                456,
                {
                    "input": [
                        519,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                467,
                {
                    "input": [
                        520,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                481,
                {
                    "input": [
                        521,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                560,
                {
                    "input": [
                        522,
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
                579,
                {
                    "input": [
                        523,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                584,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        534,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                587,
                {
                    "input": [
                        527,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                588,
                {
                    "input": [
                        525,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                589,
                {
                    "input": [
                        530,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                590,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        529,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                593,
                {
                    "input": [
                        532,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                596,
                {
                    "input": [
                        535,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                600,
                {
                    "input": [
                        537,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                607,
                {
                    "data": [
                        540,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                607,
                {
                    "data": [
                        539,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                616,
                {
                    "roleId": [
                        478,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        541,
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
                53,
                {
                    "file": [
                        542,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                251,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        542,
                        "Upload!"
                    ],
                    "fileFolder": [
                        253,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                255,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        542,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                255,
                {
                    "file": [
                        542,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                255,
                {
                    "file": [
                        542,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                255,
                {
                    "file": [
                        542,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                247,
                {
                    "upsertFieldPermissionsInput": [
                        543,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                584,
                {
                    "input": [
                        546,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                353,
                {
                    "upsertObjectPermissionsInput": [
                        547,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                417,
                {
                    "upsertPermissionFlagsInput": [
                        548,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                550,
                {
                    "input": [
                        549,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                584,
                {
                    "input": [
                        551,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                61,
                {
                    "input": [
                        577,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                581,
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
                71,
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
                215,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                582,
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
                478
            ],
            "color": [
                1
            ],
            "createdAt": [
                185
            ],
            "folderId": [
                478
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                478
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                478
            ],
            "targetRecordId": [
                478
            ],
            "targetRecordIdentifier": [
                396
            ],
            "type": [
                343
            ],
            "updatedAt": [
                185
            ],
            "userWorkspaceId": [
                478
            ],
            "viewId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                478
            ],
            "color": [
                1
            ],
            "createdAt": [
                185
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                348,
                {
                    "filter": [
                        245,
                        "FieldFilter!"
                    ],
                    "paging": [
                        183,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                240
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "imageIdentifierFieldMetadataId": [
                478
            ],
            "indexMetadataList": [
                275
            ],
            "indexMetadatas": [
                350,
                {
                    "filter": [
                        278,
                        "IndexFilter!"
                    ],
                    "paging": [
                        183,
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
                478
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
                352
            ],
            "readability": [
                330
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                478
            ],
            "searchFieldMetadataList": [
                435
            ],
            "sharingReach": [
                360
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                185
            ],
            "writability": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                347
            ],
            "pageInfo": [
                365
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                140
            ],
            "node": [
                345
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                244
            ],
            "pageInfo": [
                365
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                349
            ],
            "id": [
                479
            ],
            "isActive": [
                106
            ],
            "isRemote": [
                106
            ],
            "isSearchable": [
                106
            ],
            "isSystem": [
                106
            ],
            "isUICreatable": [
                106
            ],
            "isUIEditable": [
                106
            ],
            "isUIReadOnly": [
                106
            ],
            "or": [
                349
            ],
            "universalIdentifier": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                276
            ],
            "pageInfo": [
                365
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                478
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
                478
            ],
            "restrictedFields": [
                286
            ],
            "rowLevelPermissionPredicateGroups": [
                420
            ],
            "rowLevelPermissionPredicates": [
                419
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
                478
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
                184
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                357
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
                286
            ],
            "before": [
                286
            ],
            "diff": [
                286
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
                356
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
                361
            ],
            "previousOnboardingStatus": [
                361
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
                140
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                140
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                478
            ],
            "createdAt": [
                185
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                478
            ],
            "deletedAt": [
                185
            ],
            "id": [
                478
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
                478
            ],
            "tabs": [
                367
            ],
            "type": [
                369
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                478
            ],
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                368
            ],
            "pageLayoutId": [
                478
            ],
            "position": [
                9
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
            ],
            "widgets": [
                370
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                478
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                286
            ],
            "configuration": [
                601
            ],
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "gridPosition": [
                268
            ],
            "id": [
                478
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
                478
            ],
            "pageLayoutTabId": [
                478
            ],
            "position": [
                373
            ],
            "title": [
                1
            ],
            "type": [
                603
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                368
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
                368
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
                371
            ],
            "on_PageLayoutWidgetGridPosition": [
                372
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                374
            ],
            "index": [
                7
            ],
            "layoutMode": [
                368
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
                478
            ],
            "createdAt": [
                185
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                478
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                478
            ],
            "aggregateOperation": [
                17
            ],
            "color": [
                1
            ],
            "configurationType": [
                602
            ],
            "dateGranularity": [
                359
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
                286
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupByFieldMetadataId": [
                478
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
                121
            ],
            "orderBy": [
                267
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
                382
            ],
            "formattedToRawLookup": [
                286
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
                286
            ],
            "objectMetadataId": [
                478
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
                297
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
                478
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
                212
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
                478
            ],
            "createdAt": [
                185
            ],
            "domain": [
                1
            ],
            "id": [
                478
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
                239
            ],
            "metadata": [
                389
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
                386
            ],
            "IMAP": [
                386
            ],
            "SMTP": [
                386
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                62
            ],
            "authProviders": [
                63
            ],
            "displayName": [
                1
            ],
            "id": [
                478
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                625
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
                478
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
                        478,
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
                        263,
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
                        295
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
                313,
                {
                    "filter": [
                        296
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                38,
                {
                    "applicationId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                39,
                {
                    "applicationId": [
                        478,
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
                434,
                {
                    "applicationId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                74,
                {
                    "input": [
                        75,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                98,
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
                478,
                {
                    "calendarEventId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                12,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                123,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                6,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                126,
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
                615,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                460,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                134,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                134
            ],
            "currentUser": [
                573
            ],
            "currentUserApplicationAuthorizations": [
                36
            ],
            "currentUserSessions": [
                575
            ],
            "currentWorkspace": [
                607
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
                226
            ],
            "eventLogs": [
                233,
                {
                    "input": [
                        232,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                41,
                {
                    "universalIdentifier": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                240,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                242,
                {
                    "filter": [
                        245,
                        "FieldFilter!"
                    ],
                    "paging": [
                        183,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                385,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                53,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                57,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                127,
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
                289,
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
                53
            ],
            "findManyApplications": [
                35
            ],
            "findManyLogicFunctions": [
                298
            ],
            "findManyMarketplaceApps": [
                306,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                387
            ],
            "findMarketplaceAppDetail": [
                307,
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
                35,
                {
                    "id": [
                        478
                    ],
                    "universalIdentifier": [
                        478
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                53,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                298,
                {
                    "input": [
                        302,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                289,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                609
            ],
            "findWorkspaceFromInviteHash": [
                607,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                614
            ],
            "frontComponent": [
                260,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                260
            ],
            "getAddressDetails": [
                383,
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
                416
            ],
            "getApprovedAccessDomains": [
                61
            ],
            "getAutoCompleteAddress": [
                68,
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
                286,
                {
                    "input": [
                        302,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                139,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                215
            ],
            "getInviteSuggestions": [
                285
            ],
            "getJobs": [
                289,
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
                        302,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                366,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                367,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                367,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                370,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                370,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                366,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        369
                    ]
                }
            ],
            "getPermissionFlags": [
                377
            ],
            "getPublicWorkspaceDataByDomain": [
                391,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                392,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                97
            ],
            "getRole": [
                416,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                416
            ],
            "getSSOIdentityProviders": [
                257
            ],
            "getToolIndex": [
                471
            ],
            "getToolInputSchema": [
                286,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                557,
                {
                    "input": [
                        558
                    ]
                }
            ],
            "getView": [
                584,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                587,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                588,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                588,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                587,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                589,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                590,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                590,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                589,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                593,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                593,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                596,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                596,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                584,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        598,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                612
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
                291,
                {
                    "input": [
                        292,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                88
            ],
            "messageSuppressions": [
                325,
                {
                    "input": [
                        258,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                331,
                {
                    "input": [
                        334,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                336
            ],
            "mostlyEmptyFieldMetadataIds": [
                478,
                {
                    "objectMetadataId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "myAppPreferencesApplicationVariables": [
                574,
                {
                    "applicationUniversalIdentifier": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "myAppPreferencesApplications": [
                34
            ],
            "myCalendarChannels": [
                107,
                {
                    "connectedAccountId": [
                        478
                    ]
                }
            ],
            "myConnectedAccounts": [
                138
            ],
            "myMessageChannels": [
                313,
                {
                    "connectedAccountId": [
                        478
                    ]
                }
            ],
            "myMessageFolders": [
                320,
                {
                    "messageChannelId": [
                        478
                    ]
                }
            ],
            "myUserApplicationVariables": [
                617
            ],
            "navigationMenuItem": [
                342,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                342
            ],
            "object": [
                345,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                355
            ],
            "objects": [
                346,
                {
                    "filter": [
                        349,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        183,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                380,
                {
                    "input": [
                        381,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                115,
                {
                    "input": [
                        384,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                307,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                306,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                398,
                {
                    "targets": [
                        408,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                403,
                {
                    "target": [
                        408,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                456,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                456
            ],
            "timelineActivityTypes": [
                467
            ],
            "unsubscribeTopics": [
                481
            ],
            "usageLimits": [
                560
            ],
            "usageQuotaDefinitions": [
                564
            ],
            "usageQuotaScopeConsumption": [
                566,
                {
                    "input": [
                        567,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                568
            ],
            "validatePasswordResetToken": [
                578,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                579,
                {
                    "objectMetadataId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                600,
                {
                    "id": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                600
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                478
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
                478
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
                478
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
                478
            ],
            "permissions": [
                397
            ],
            "recordId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                478
            ],
            "workspaceMemberId": [
                478
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
                399
            ],
            "generalAccessLevel": [
                399
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                397
            ],
            "roles": [
                406
            ],
            "shares": [
                404
            ],
            "sharingMode": [
                405
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                399
            ],
            "id": [
                8
            ],
            "principalId": [
                478
            ],
            "principalRoleId": [
                478
            ],
            "principalType": [
                401
            ],
            "rowCause": [
                402
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
                478
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
                602
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
                478
            ],
            "recordId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                240
            ],
            "sourceObjectMetadata": [
                345
            ],
            "targetFieldMetadata": [
                240
            ],
            "targetObjectMetadata": [
                345
            ],
            "type": [
                410
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
                478
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
                247
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                353
            ],
            "permissionFlags": [
                417
            ],
            "rowLevelPermissionPredicateGroups": [
                420
            ],
            "rowLevelPermissionPredicates": [
                419
            ],
            "universalIdentifier": [
                478
            ],
            "workspaceMembers": [
                616
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
                478
            ],
            "roleId": [
                478
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
                424
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
                286
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
                422
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
                478
            ],
            "logicalOperator": [
                422
            ],
            "objectMetadataId": [
                478
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                478
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
                478
            ],
            "id": [
                478
            ],
            "operand": [
                424
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
            ],
            "rowLevelPermissionPredicateGroupId": [
                478
            ],
            "subFieldName": [
                1
            ],
            "value": [
                286
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
                427
            ],
            "messages": [
                427
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                478
            ],
            "thread": [
                430
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                478
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
                426
            ],
            "content": [
                1
            ],
            "role": [
                428
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
                286
            ],
            "success": [
                4
            ],
            "threadId": [
                478
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
                478
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                433
            ],
            "type": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                478
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                433
            ],
            "type": [
                269
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
                185
            ],
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                478
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                478
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
                437
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
                286
            ],
            "workspaceMemberId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                478
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
                614
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
                185
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                115
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
                286
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                478
            ],
            "createdAt": [
                185
            ],
            "frontComponentId": [
                478
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "position": [
                9
            ],
            "scope": [
                450
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
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
                478
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
                478
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                433
            ],
            "type": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                64
            ],
            "workspace": [
                626
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
                478
            ],
            "content": [
                1
            ],
            "createdAt": [
                185
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                185
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                415
            ],
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                624
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
                234,
                {
                    "fieldFilters": [
                        228,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        235,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                395,
                {
                    "input": [
                        169,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                303,
                {
                    "input": [
                        304,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        478,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                236,
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
                465
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
                602
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
                478
            ],
            "createdAt": [
                185
            ],
            "emit": [
                468
            ],
            "frontComponentUniversalIdentifier": [
                478
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                478
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                478
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                478
            ],
            "on": [
                1
            ],
            "through": [
                469
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                478
            ],
            "relationFieldUniversalIdentifier": [
                478
            ],
            "triggerFieldUniversalIdentifiers": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                602
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
                286
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
                64
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                478
            ],
            "gt": [
                478
            ],
            "gte": [
                478
            ],
            "iLike": [
                478
            ],
            "in": [
                478
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                478
            ],
            "lt": [
                478
            ],
            "lte": [
                478
            ],
            "neq": [
                478
            ],
            "notILike": [
                478
            ],
            "notIn": [
                478
            ],
            "notLike": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                185
            ],
            "description": [
                1
            ],
            "id": [
                478
            ],
            "name": [
                1
            ],
            "updatedAt": [
                185
            ],
            "visibility": [
                482
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
                478
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                286
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
                286
            ],
            "roleId": [
                478
            ],
            "triggers": [
                286
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
                478
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
                478
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                319
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
                488
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
                490
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
                478
            ],
            "update": [
                492
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                108
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                478
            ],
            "availabilityType": [
                135
            ],
            "engineComponentKey": [
                219
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                478
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                286
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
                286
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                478
            ],
            "options": [
                286
            ],
            "settings": [
                286
            ],
            "translations": [
                332
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
                478
            ],
            "update": [
                497
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
                478
            ],
            "update": [
                500
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                286
            ],
            "databaseEventTriggerSettings": [
                286
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                286
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
                286
            ],
            "workflowActionTriggerSettings": [
                286
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                478
            ],
            "update": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                314
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
                321
            ],
            "visibility": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                478
            ],
            "update": [
                504
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
                478
            ],
            "update": [
                504
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
                478
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
                478
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
                478
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
                478
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
                352
            ],
            "readability": [
                330
            ],
            "sharingReach": [
                360
            ],
            "shortcut": [
                1
            ],
            "translations": [
                332
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                478
            ],
            "update": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                478
            ],
            "update": [
                506
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                478
            ],
            "update": [
                507
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
                478
            ],
            "type": [
                369
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
                368
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
                478
            ],
            "layoutMode": [
                368
            ],
            "position": [
                9
            ],
            "title": [
                1
            ],
            "widgets": [
                515
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
                286
            ],
            "configuration": [
                286
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                478
            ],
            "pageLayoutTabId": [
                478
            ],
            "position": [
                286
            ],
            "title": [
                1
            ],
            "type": [
                603
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
                286
            ],
            "configuration": [
                286
            ],
            "id": [
                478
            ],
            "objectMetadataId": [
                478
            ],
            "pageLayoutTabId": [
                478
            ],
            "position": [
                286
            ],
            "title": [
                1
            ],
            "type": [
                603
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
                478
            ],
            "tabs": [
                513
            ],
            "type": [
                369
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                478
            ],
            "update": [
                518
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
                478
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
                478
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                332
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
                482
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                478
            ],
            "payload": [
                173
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                478
            ],
            "update": [
                524
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
                478
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
                478
            ],
            "update": [
                526
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
                478
            ],
            "update": [
                528
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                478
            ],
            "logicalOperator": [
                591
            ],
            "parentViewFilterGroupId": [
                478
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                478
            ],
            "update": [
                531
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                478
            ],
            "operand": [
                592
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                478
            ],
            "subFieldName": [
                1
            ],
            "value": [
                286
            ],
            "viewFilterGroupId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                478
            ],
            "update": [
                533
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                478
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
                478
            ],
            "calendarFieldMetadataId": [
                478
            ],
            "calendarLayout": [
                585
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                478
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                478
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                478
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                595
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                598
            ],
            "visibility": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                478
            ],
            "update": [
                536
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                597
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
                478
            ],
            "update": [
                538
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
                286
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                478
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
                613
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                286
            ],
            "workspaceMemberId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                248
            ],
            "roleId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                478
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                544
            ],
            "id": [
                478
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
                544
            ],
            "groups": [
                545
            ],
            "widgetId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                354
            ],
            "roleId": [
                478
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                478
            ],
            "predicateGroups": [
                421
            ],
            "predicates": [
                423
            ],
            "roleId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                420
            ],
            "predicates": [
                419
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                555
            ],
            "viewFields": [
                552
            ],
            "viewFilterGroups": [
                553
            ],
            "viewFilters": [
                554
            ],
            "viewSorts": [
                556
            ],
            "widgetId": [
                478
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
                478
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
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                478
            ],
            "logicalOperator": [
                591
            ],
            "parentViewFilterGroupId": [
                478
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
                478
            ],
            "id": [
                478
            ],
            "operand": [
                592
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                478
            ],
            "subFieldName": [
                1
            ],
            "value": [
                286
            ],
            "viewFilterGroupId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                478
            ],
            "calendarFieldMetadataId": [
                478
            ],
            "calendarLayout": [
                585
            ],
            "kanbanAggregateOperation": [
                17
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                478
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                478
            ],
            "openRecordIn": [
                595
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                598
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                597
            ],
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                185
            ],
            "periodStart": [
                185
            ],
            "timeSeries": [
                570
            ],
            "usageByApplication": [
                559
            ],
            "usageByModel": [
                559
            ],
            "usageByOperationType": [
                559
            ],
            "usageByUser": [
                559
            ],
            "userDailyUsage": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                562
            ],
            "periodEnd": [
                185
            ],
            "periodStart": [
                185
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
                79
            ],
            "createdAt": [
                185
            ],
            "id": [
                478
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                79
            ],
            "operationType": [
                562
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                569
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                571
            ],
            "updatedAt": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                571
            ],
            "operationType": [
                562
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                561
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                565
            ],
            "resourceType": [
                569
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                563
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
                562
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                571
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                79
            ],
            "periodEnd": [
                185
            ],
            "periodStart": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                562
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                569
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                571
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                79
            ],
            "id": [
                478
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                79
            ],
            "operationType": [
                562
            ],
            "periodEnd": [
                185
            ],
            "periodStart": [
                185
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                79
            ],
            "resourceType": [
                569
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
                571
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
                570
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
                70
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                185
            ],
            "currentUserWorkspace": [
                576
            ],
            "currentWorkspace": [
                607
            ],
            "deletedAt": [
                185
            ],
            "deletedWorkspaceMembers": [
                198
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
                478
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
                361
            ],
            "previousOnboardingStatus": [
                361
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                185
            ],
            "userVars": [
                287
            ],
            "userWorkspaces": [
                576
            ],
            "workspaceMember": [
                616
            ],
            "workspaceMembers": [
                616
            ],
            "workspaces": [
                576
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
                286
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
                185
            ],
            "expiresAt": [
                185
            ],
            "id": [
                478
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
                185
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "id": [
                478
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                353
            ],
            "objectsPermissions": [
                353
            ],
            "permissionFlags": [
                378
            ],
            "twoFactorAuthenticationMethodSummary": [
                477
            ],
            "updatedAt": [
                185
            ],
            "user": [
                573
            ],
            "userId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                478
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
                478
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
                478
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                478
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
                64
            ],
            "workspaceUrls": [
                625
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
                478
            ],
            "calendarEndFieldMetadataId": [
                478
            ],
            "calendarFieldMetadataId": [
                478
            ],
            "calendarLayout": [
                585
            ],
            "createdAt": [
                185
            ],
            "createdByUserWorkspaceId": [
                478
            ],
            "deletedAt": [
                185
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                478
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
                478
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                594
            ],
            "mainGroupByFieldMetadataId": [
                478
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                478
            ],
            "openRecordIn": [
                595
            ],
            "position": [
                9
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                598
            ],
            "universalIdentifier": [
                478
            ],
            "updatedAt": [
                185
            ],
            "viewFieldGroups": [
                588
            ],
            "viewFields": [
                587
            ],
            "viewFilterGroups": [
                590
            ],
            "viewFilters": [
                589
            ],
            "viewGroups": [
                593
            ],
            "viewSorts": [
                596
            ],
            "visibility": [
                599
            ],
            "workspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                602
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
                478
            ],
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
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
                478
            ],
            "updatedAt": [
                185
            ],
            "viewFieldGroupId": [
                478
            ],
            "viewId": [
                478
            ],
            "workspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "id": [
                478
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
                185
            ],
            "viewFields": [
                587
            ],
            "viewId": [
                478
            ],
            "workspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
            ],
            "operand": [
                592
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                478
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                185
            ],
            "value": [
                286
            ],
            "viewFilterGroupId": [
                478
            ],
            "viewId": [
                478
            ],
            "workspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "id": [
                478
            ],
            "logicalOperator": [
                591
            ],
            "parentViewFilterGroupId": [
                478
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                185
            ],
            "viewId": [
                478
            ],
            "workspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "fieldValue": [
                1
            ],
            "id": [
                478
            ],
            "isVisible": [
                4
            ],
            "position": [
                9
            ],
            "updatedAt": [
                185
            ],
            "viewId": [
                478
            ],
            "workspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "direction": [
                597
            ],
            "fieldMetadataId": [
                478
            ],
            "id": [
                478
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                185
            ],
            "viewId": [
                478
            ],
            "workspaceId": [
                478
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
                478
            ],
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "description": [
                1
            ],
            "id": [
                478
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
                185
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
                73
            ],
            "on_CalendarConfiguration": [
                112
            ],
            "on_CallRecordingSummaryConfiguration": [
                113
            ],
            "on_CallRecordingTranscriptConfiguration": [
                114
            ],
            "on_ChatConfiguration": [
                122
            ],
            "on_ChatThreadsConfiguration": [
                125
            ],
            "on_EmailThreadConfiguration": [
                214
            ],
            "on_EmailsConfiguration": [
                218
            ],
            "on_FieldConfiguration": [
                241
            ],
            "on_FieldRichTextConfiguration": [
                249
            ],
            "on_FieldsConfiguration": [
                250
            ],
            "on_FilesConfiguration": [
                256
            ],
            "on_FormFieldConfiguration": [
                259
            ],
            "on_FrontComponentConfiguration": [
                261
            ],
            "on_IframeConfiguration": [
                270
            ],
            "on_LineChartConfiguration": [
                290
            ],
            "on_MessageCampaignBodyConfiguration": [
                311
            ],
            "on_MessageCampaignDetailsConfiguration": [
                312
            ],
            "on_NotesConfiguration": [
                344
            ],
            "on_PieChartConfiguration": [
                379
            ],
            "on_RecordTableConfiguration": [
                407
            ],
            "on_StandaloneRichTextConfiguration": [
                457
            ],
            "on_TasksConfiguration": [
                466
            ],
            "on_TimelineConfiguration": [
                470
            ],
            "on_ViewConfiguration": [
                586
            ],
            "on_WorkflowConfiguration": [
                604
            ],
            "on_WorkflowRunConfiguration": [
                605
            ],
            "on_WorkflowVersionConfiguration": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                608
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
                286
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                81
            ],
            "billingEntitlements": [
                83
            ],
            "billingSubscriptions": [
                99
            ],
            "createdAt": [
                185
            ],
            "currentBillingSubscription": [
                99
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                416
            ],
            "deletedAt": [
                185
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
                238
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                478
            ],
            "installedApplications": [
                35
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
                478
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
                185
            ],
            "viewFields": [
                587
            ],
            "viewFilterGroups": [
                590
            ],
            "viewFilters": [
                589
            ],
            "viewGroups": [
                593
            ],
            "viewSorts": [
                596
            ],
            "views": [
                584
            ],
            "workspaceCustomApplication": [
                35
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                613
            ],
            "workspaceMembersCount": [
                9
            ],
            "workspaceUrls": [
                625
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
                286
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                610
            ],
            "personEnrichment": [
                286
            ],
            "personOutcome": [
                623
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
                185
            ],
            "id": [
                478
            ],
            "roleId": [
                478
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
                618
            ],
            "id": [
                478
            ],
            "locale": [
                1
            ],
            "name": [
                262
            ],
            "numberFormat": [
                619
            ],
            "openRecordIn": [
                364
            ],
            "roles": [
                416
            ],
            "timeFormat": [
                620
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
                478
            ],
            "userWorkspaceId": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                478
            ],
            "variables": [
                574
            ],
            "workspaceMemberId": [
                478
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
                286
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
                478
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
                478
            ],
            "workspaceUrls": [
                625
            ],
            "__typename": [
                1
            ]
        }
    }
}