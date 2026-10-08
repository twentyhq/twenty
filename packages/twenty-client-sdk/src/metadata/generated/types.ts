export default {
    "scalars": [
        1,
        4,
        7,
        9,
        10,
        16,
        18,
        20,
        23,
        25,
        32,
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
        481,
        483,
        485,
        545,
        565,
        572,
        574,
        588,
        594,
        595,
        597,
        598,
        600,
        601,
        602,
        605,
        606,
        611,
        613,
        616,
        621,
        622,
        623,
        626,
        627
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
                481
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
                481
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
                481
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
                7
            ],
            "openThreadCount": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
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
                9
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                7
            ],
            "totalInputCredits": [
                10
            ],
            "totalInputTokens": [
                7
            ],
            "totalOutputCredits": [
                10
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
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                185
            ],
            "id": [
                481
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                481
            ],
            "createdAt": [
                185
            ],
            "id": [
                481
            ],
            "parts": [
                14
            ],
            "processedAt": [
                185
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                481
            ],
            "status": [
                1
            ],
            "threadId": [
                481
            ],
            "turnId": [
                481
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
                481
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                481
            ],
            "messageId": [
                481
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
                10
            ],
            "endedAt": [
                185
            ],
            "errorMessage": [
                1
            ],
            "id": [
                481
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
                16
            ],
            "threadId": [
                481
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
                481
            ],
            "aggregateOperation": [
                18
            ],
            "configurationType": [
                605
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
                22
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
                10
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
                481
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
                481
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
                9
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
                32
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
                34
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
                481
            ],
            "role": [
                323
            ],
            "workspaceMemberId": [
                481
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
                481
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
                481
            ],
            "id": [
                481
            ],
            "logicFunctions": [
                298
            ],
            "logoFileId": [
                481
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
                481
            ],
            "settingsCustomTabFrontComponentId": [
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                481
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
                481
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                481
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
                481
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
                481
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
                481
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
                481
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
                481
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
                481
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
                481
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
                481
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
                586
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                481
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
                481
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
                481
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
                481
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
                481
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
                628
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
                481
            ],
            "aggregateOperation": [
                18
            ],
            "axisNameDisplay": [
                72
            ],
            "color": [
                1
            ],
            "configurationType": [
                605
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
                481
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
                10
            ],
            "rangeMin": [
                10
            ],
            "secondaryAxisGroupByDateGranularity": [
                359
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                481
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
                481
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
                481
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
                10
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
                10
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
                10
            ],
            "unitAmount": [
                10
            ],
            "upTo": [
                10
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
                10
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
                10
            ],
            "totalGrantedCredits": [
                10
            ],
            "unitPriceCents": [
                10
            ],
            "usedCredits": [
                10
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
                481
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
                10
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                481
            ],
            "quantity": [
                10
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                10
            ],
            "items": [
                102
            ],
            "start_date": [
                10
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                10
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
                481
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
                481
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
                10
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
                605
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                605
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
                605
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
                605
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                10
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
                10
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
                10
            ],
            "maxScoreLevels": [
                10
            ],
            "medianLatencyMs": [
                10
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                10
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
                10
            ],
            "costPerTask": [
                10
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
                10
            ],
            "intelligenceIndex": [
                10
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
                10
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
                10
            ],
            "outputTokensPerSecond": [
                10
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
                20
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
                26
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
                23
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
                481
            ],
            "availabilityObjectMetadataId": [
                481
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
                481
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
                481
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                481
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
                481
            ],
            "pageLayoutId": [
                481
            ],
            "payload": [
                136
            ],
            "position": [
                10
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                481
            ],
            "updatedAt": [
                185
            ],
            "workflowVersionId": [
                481
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
                481
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
                481
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
                481
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
                481
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
                481
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                481
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
                10
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                481
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
                481
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
                481
            ],
            "engineComponentKey": [
                219
            ],
            "frontComponentId": [
                481
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
                481
            ],
            "pageLayoutId": [
                481
            ],
            "payload": [
                286
            ],
            "position": [
                10
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                481
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
                481
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
                481
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
                481
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
                481
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
                481
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
                10
            ],
            "toolTriggerSettings": [
                286
            ],
            "universalIdentifier": [
                481
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
                481
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
                481
            ],
            "icon": [
                1
            ],
            "id": [
                481
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                481
            ],
            "position": [
                10
            ],
            "targetObjectMetadataId": [
                481
            ],
            "targetRecordId": [
                481
            ],
            "type": [
                343
            ],
            "userWorkspaceId": [
                481
            ],
            "viewId": [
                481
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
                481
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
                481
            ],
            "position": [
                10
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
                481
            ],
            "pageLayoutTabId": [
                481
            ],
            "position": [
                286
            ],
            "title": [
                1
            ],
            "type": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                481
            ],
            "filter": [
                286
            ],
            "objectMetadataId": [
                481
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
                481
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
                485
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
                565
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                572
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                574
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                481
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                10
            ],
            "viewId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                18
            ],
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "size": [
                10
            ],
            "viewFieldGroupId": [
                481
            ],
            "viewId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                481
            ],
            "logicalOperator": [
                594
            ],
            "parentViewFilterGroupId": [
                481
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "viewId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
            ],
            "operand": [
                595
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                481
            ],
            "subFieldName": [
                1
            ],
            "value": [
                286
            ],
            "viewFilterGroupId": [
                481
            ],
            "viewId": [
                481
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
                481
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "viewId": [
                481
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
                481
            ],
            "calendarFieldMetadataId": [
                481
            ],
            "calendarLayout": [
                588
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                481
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                18
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                481
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                597
            ],
            "mainGroupByFieldMetadataId": [
                481
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                481
            ],
            "openRecordIn": [
                598
            ],
            "position": [
                10
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                601
            ],
            "visibility": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                600
            ],
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                481
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                481
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
                481
            ],
            "name": [
                262
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                481
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
                481
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
                481
            ],
            "pageLayoutId": [
                481
            ],
            "position": [
                10
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
                481
            ],
            "memberCount": [
                10
            ],
            "name": [
                1
            ],
            "position": [
                10
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
                481
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
                481
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
                605
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
                481
            ],
            "status": [
                216
            ],
            "tenantStatus": [
                217
            ],
            "unsubscribeHostnameStatus": [
                483
            ],
            "updatedAt": [
                185
            ],
            "verificationRecords": [
                583
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
                605
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
                481
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
                481
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
                481
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
                481
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
                481
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
                605
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
                482
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
                482
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
                481
            ],
            "id": [
                481
            ],
            "objectMetadataId": [
                481
            ],
            "roleId": [
                481
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
                481
            ],
            "objectMetadataId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                605
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
                481
            ],
            "path": [
                1
            ],
            "size": [
                10
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
                481
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
                481
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
                481
            ],
            "path": [
                1
            ],
            "size": [
                10
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
                605
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                481
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
                625
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                605
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
                481
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
                481
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
                481
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
                605
            ],
            "frontComponentId": [
                481
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                481
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
                481
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
                481
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
                481
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
                481
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
                10
            ],
            "columnSpan": [
                10
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
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                605
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
                10
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
                629
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
                481
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
                481
            ],
            "id": [
                481
            ],
            "order": [
                10
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
                482
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
                481
            ],
            "messages": [
                33
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
                481
            ],
            "messageThreadId": [
                481
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
                10
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                10
            ],
            "jobId": [
                1
            ],
            "progress": [
                7
            ],
            "startedAt": [
                10
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
                481
            ],
            "aggregateOperation": [
                18
            ],
            "axisNameDisplay": [
                72
            ],
            "color": [
                1
            ],
            "configurationType": [
                605
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
                481
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
                10
            ],
            "rangeMin": [
                10
            ],
            "secondaryAxisGroupByDateGranularity": [
                359
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                481
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
                481
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
                10
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                10
            ],
            "lng": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "applicationId": [
                481
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
                481
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
                10
            ],
            "toolTriggerSettings": [
                286
            ],
            "universalIdentifier": [
                481
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
                10
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
                9
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                481
            ],
            "applicationUniversalIdentifier": [
                481
            ],
            "id": [
                481
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                481
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
                605
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                605
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
                481
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
                481
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
                10
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
                481
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                481
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
                481
            ],
            "reason": [
                326
            ],
            "source": [
                327
            ],
            "unsubscribeTopicId": [
                481
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
                481
            ],
            "property": [
                1
            ],
            "provenance": [
                333
            ],
            "recordId": [
                481
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
                481
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                481
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
                481
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
                481
            ],
            "key": [
                597
            ],
            "objectMetadataId": [
                481
            ],
            "type": [
                601
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                610,
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
            "archiveAgentChatThread": [
                11,
                {
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        481
                    ],
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        481,
                        "UUID!"
                    ],
                    "roleId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        481,
                        "UUID!"
                    ],
                    "roleId": [
                        481,
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
                        481,
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
                        481,
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
                27,
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
                8
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
                        10,
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
                591,
                {
                    "inputs": [
                        175,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                590,
                {
                    "inputs": [
                        176,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                596,
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
                        10,
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
                24,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        481,
                        "UUID!"
                    ],
                    "properties": [
                        286
                    ],
                    "recordId": [
                        481,
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
                484,
                {
                    "input": [
                        172,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                563,
                {
                    "input": [
                        173,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                582,
                {
                    "input": [
                        174,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                587,
                {
                    "input": [
                        180,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                590,
                {
                    "input": [
                        176,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                591,
                {
                    "input": [
                        175,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                592,
                {
                    "input": [
                        178,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                593,
                {
                    "input": [
                        177,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                596,
                {
                    "input": [
                        179,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                599,
                {
                    "input": [
                        181,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                603,
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
                        481,
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
                        32
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                313,
                {
                    "id": [
                        481,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                138,
                {
                    "id": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                610
            ],
            "deleteEmailGroupChannel": [
                313,
                {
                    "id": [
                        481,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                342,
                {
                    "ids": [
                        481,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                342,
                {
                    "id": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                3,
                {
                    "input": [
                        12,
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
                        481,
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
                        481,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                192,
                {
                    "twoFactorAuthenticationMethodId": [
                        481,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                576
            ],
            "deleteUserFromWorkspace": [
                579,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                582,
                {
                    "id": [
                        481,
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
                590,
                {
                    "input": [
                        194,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                591,
                {
                    "input": [
                        193,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                592,
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
                596,
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
                603,
                {
                    "id": [
                        481,
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
                590,
                {
                    "input": [
                        200,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                591,
                {
                    "input": [
                        199,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                592,
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
                596,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                207,
                {
                    "id": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                208,
                {
                    "id": [
                        481,
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
                        481
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
                614
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
                29,
                {
                    "apiKeyId": [
                        481,
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
                        481,
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
            "generateTwoFactorAuthenticationRecoveryCode": [
                478,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        481,
                        "UUID!"
                    ]
                }
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
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                479,
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
                        481,
                        "UUID!"
                    ],
                    "workspaceId": [
                        481,
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
                11,
                {
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                11,
                {
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                11,
                {
                    "threadId": [
                        481,
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
                        481,
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
                        481,
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
                        481,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                7
            ],
            "revokeApiKey": [
                27,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        481,
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
                        481,
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
                        481
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
                        481,
                        "[UUID!]"
                    ],
                    "messageId": [
                        481,
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
                        481,
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
                        481
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
                31,
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
                        481
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
                11,
                {
                    "snoozedUntil": [
                        185,
                        "DateTime!"
                    ],
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                120,
                {
                    "connectedAccountId": [
                        481,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                459
            ],
            "subscribeToAgentChatThread": [
                11,
                {
                    "threadId": [
                        481,
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
                624,
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
                24,
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
                        25,
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
                11,
                {
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "updateApiKey": [
                27,
                {
                    "input": [
                        487,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                313,
                {
                    "input": [
                        488,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                35,
                {
                    "id": [
                        481,
                        "UUID!"
                    ],
                    "input": [
                        489,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                53,
                {
                    "input": [
                        490,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                57,
                {
                    "input": [
                        492,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                107,
                {
                    "input": [
                        494,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                134,
                {
                    "input": [
                        496,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                313,
                {
                    "input": [
                        497,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                260,
                {
                    "input": [
                        499,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                238,
                {
                    "input": [
                        501,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                342,
                {
                    "inputs": [
                        512,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                345,
                {
                    "inputs": [
                        513,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                596,
                {
                    "inputs": [
                        535,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                313,
                {
                    "input": [
                        504,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                320,
                {
                    "input": [
                        506,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                320,
                {
                    "input": [
                        508,
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
                        512,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        486,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        481
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
                        511,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        502,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                345,
                {
                    "input": [
                        513,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                416,
                {
                    "updateRoleInput": [
                        520,
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
                        514,
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
                        515,
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
                        517,
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
                        519,
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
                        522,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                467,
                {
                    "input": [
                        523,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                484,
                {
                    "input": [
                        524,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                563,
                {
                    "input": [
                        525,
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
                582,
                {
                    "input": [
                        526,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                587,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        537,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                590,
                {
                    "input": [
                        530,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                591,
                {
                    "input": [
                        528,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                592,
                {
                    "input": [
                        533,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                593,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        532,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                596,
                {
                    "input": [
                        535,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                599,
                {
                    "input": [
                        538,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                603,
                {
                    "input": [
                        540,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                610,
                {
                    "data": [
                        543,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                610,
                {
                    "data": [
                        542,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                619,
                {
                    "roleId": [
                        481,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        544,
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
                        545,
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
                        545,
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
                        545,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                255,
                {
                    "file": [
                        545,
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
                        545,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                255,
                {
                    "file": [
                        545,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                247,
                {
                    "upsertFieldPermissionsInput": [
                        546,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                587,
                {
                    "input": [
                        549,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                353,
                {
                    "upsertObjectPermissionsInput": [
                        550,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                417,
                {
                    "upsertPermissionFlagsInput": [
                        551,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                553,
                {
                    "input": [
                        552,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                587,
                {
                    "input": [
                        554,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                61,
                {
                    "input": [
                        580,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                584,
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
                585,
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
                481
            ],
            "color": [
                1
            ],
            "createdAt": [
                185
            ],
            "folderId": [
                481
            ],
            "icon": [
                1
            ],
            "id": [
                481
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                481
            ],
            "position": [
                10
            ],
            "targetObjectMetadataId": [
                481
            ],
            "targetRecordId": [
                481
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
                481
            ],
            "viewId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                481
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
                481
            ],
            "imageIdentifierFieldMetadataId": [
                481
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
                481
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
                481
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
                482
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
                482
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
                481
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
                481
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
                481
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
                481
            ],
            "createdAt": [
                185
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                481
            ],
            "deletedAt": [
                185
            ],
            "id": [
                481
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
                481
            ],
            "tabs": [
                367
            ],
            "type": [
                369
            ],
            "universalIdentifier": [
                481
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
                481
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
                481
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
                481
            ],
            "position": [
                10
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                481
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
                481
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                286
            ],
            "configuration": [
                604
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
                481
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
                481
            ],
            "pageLayoutTabId": [
                481
            ],
            "position": [
                373
            ],
            "title": [
                1
            ],
            "type": [
                606
            ],
            "universalIdentifier": [
                481
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
                481
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
                481
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
                481
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
                481
            ],
            "aggregateOperation": [
                18
            ],
            "color": [
                1
            ],
            "configurationType": [
                605
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
                481
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
                481
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
                10
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
                481
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
                10
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
                481
            ],
            "createdAt": [
                185
            ],
            "domain": [
                1
            ],
            "id": [
                481
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
                481
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                628
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
                481
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
                6
            ],
            "agentRuns": [
                15,
                {
                    "agentId": [
                        481,
                        "UUID!"
                    ],
                    "limit": [
                        7,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                19
            ],
            "apiKey": [
                27,
                {
                    "input": [
                        263,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                27
            ],
            "appConnection": [
                30,
                {
                    "id": [
                        9,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                30,
                {
                    "filter": [
                        295
                    ]
                }
            ],
            "appKeyValue": [
                31,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        32
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                39,
                {
                    "applicationId": [
                        481,
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
                        481,
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
                481,
                {
                    "calendarEventId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                13,
                {
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                123,
                {
                    "threadId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                8,
                {
                    "id": [
                        481,
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
                618,
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                134
            ],
            "currentUser": [
                576
            ],
            "currentUserApplicationAuthorizations": [
                36
            ],
            "currentUserSessions": [
                578
            ],
            "currentWorkspace": [
                610
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
                        481,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                240,
                {
                    "id": [
                        481,
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
                        12,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                35,
                {
                    "id": [
                        481
                    ],
                    "universalIdentifier": [
                        481
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
                612
            ],
            "findWorkspaceFromInviteHash": [
                610,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                617
            ],
            "frontComponent": [
                260,
                {
                    "id": [
                        481,
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
                21
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
                        481,
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
                        481,
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
                        481,
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
                560,
                {
                    "input": [
                        561
                    ]
                }
            ],
            "getView": [
                587,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                590,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                591,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                591,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                590,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                592,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                593,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                593,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                592,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                596,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                596,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                599,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                599,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                587,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        601,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                615
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
                481,
                {
                    "objectMetadataId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                107,
                {
                    "connectedAccountId": [
                        481
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
                        481
                    ]
                }
            ],
            "myMessageFolders": [
                320,
                {
                    "messageChannelId": [
                        481
                    ]
                }
            ],
            "myUserApplicationVariables": [
                620
            ],
            "navigationMenuItem": [
                342,
                {
                    "id": [
                        481,
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
                        481,
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
                        481,
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
            "twoFactorAuthenticationRecoveryStatus": [
                480,
                {
                    "userId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                484
            ],
            "usageLimits": [
                563
            ],
            "usageQuotaDefinitions": [
                567
            ],
            "usageQuotaScopeConsumption": [
                569,
                {
                    "input": [
                        570,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                571
            ],
            "validatePasswordResetToken": [
                581,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                582,
                {
                    "objectMetadataId": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                603,
                {
                    "id": [
                        481,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                481
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
                481
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
                481
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
                481
            ],
            "permissions": [
                397
            ],
            "recordId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                481
            ],
            "workspaceMemberId": [
                481
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
                9
            ],
            "principalId": [
                481
            ],
            "principalRoleId": [
                481
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
                481
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
                605
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
                481
            ],
            "recordId": [
                481
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
                9
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
                481
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
                28
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
                481
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
                481
            ],
            "workspaceMembers": [
                619
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
                481
            ],
            "roleId": [
                481
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
                10
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
                10
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
                481
            ],
            "logicalOperator": [
                422
            ],
            "objectMetadataId": [
                481
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                481
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateInput": {
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
            ],
            "operand": [
                424
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                10
            ],
            "rowLevelPermissionPredicateGroupId": [
                481
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
                481
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
                481
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
                481
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
                481
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
                481
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
                481
            ],
            "id": [
                481
            ],
            "position": [
                10
            ],
            "tsVectorFieldMetadataId": [
                481
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                481
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
                617
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
                10
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
                32
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
                481
            ],
            "createdAt": [
                185
            ],
            "frontComponentId": [
                481
            ],
            "icon": [
                1
            ],
            "id": [
                481
            ],
            "position": [
                10
            ],
            "scope": [
                450
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                481
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
                481
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
                481
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
                629
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
                481
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
                481
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
                605
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                627
            ],
            "thread": [
                8
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
                        481,
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
                605
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
                481
            ],
            "createdAt": [
                185
            ],
            "emit": [
                468
            ],
            "frontComponentUniversalIdentifier": [
                481
            ],
            "icon": [
                1
            ],
            "id": [
                481
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
                481
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                481
            ],
            "universalIdentifier": [
                481
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
                481
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
                481
            ],
            "relationFieldUniversalIdentifier": [
                481
            ],
            "triggerFieldUniversalIdentifiers": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                605
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                185
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
                65
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
                185
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                481
            ],
            "gt": [
                481
            ],
            "gte": [
                481
            ],
            "iLike": [
                481
            ],
            "in": [
                481
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                481
            ],
            "lt": [
                481
            ],
            "lte": [
                481
            ],
            "neq": [
                481
            ],
            "notILike": [
                481
            ],
            "notIn": [
                481
            ],
            "notLike": [
                481
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
                481
            ],
            "name": [
                1
            ],
            "updatedAt": [
                185
            ],
            "visibility": [
                485
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
                481
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
                481
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
                481
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
                481
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
                491
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
                493
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
                481
            ],
            "update": [
                495
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
                481
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
                481
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                481
            ],
            "position": [
                10
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
                481
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
                481
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
                481
            ],
            "update": [
                500
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
                481
            ],
            "update": [
                503
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
                10
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
                481
            ],
            "update": [
                505
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
                481
            ],
            "update": [
                507
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
                481
            ],
            "update": [
                507
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
                481
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
                481
            ],
            "position": [
                10
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
                481
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
                481
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
                481
            ],
            "update": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                481
            ],
            "update": [
                509
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                481
            ],
            "update": [
                510
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
                481
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
                10
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
                481
            ],
            "layoutMode": [
                368
            ],
            "position": [
                10
            ],
            "title": [
                1
            ],
            "widgets": [
                518
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
                481
            ],
            "pageLayoutTabId": [
                481
            ],
            "position": [
                286
            ],
            "title": [
                1
            ],
            "type": [
                606
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
                481
            ],
            "objectMetadataId": [
                481
            ],
            "pageLayoutTabId": [
                481
            ],
            "position": [
                286
            ],
            "title": [
                1
            ],
            "type": [
                606
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
                481
            ],
            "tabs": [
                516
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
                481
            ],
            "update": [
                521
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
                481
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
                481
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
                485
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                481
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
                481
            ],
            "update": [
                527
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
                481
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
                481
            ],
            "update": [
                529
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                481
            ],
            "update": [
                531
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                18
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "size": [
                10
            ],
            "viewFieldGroupId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                481
            ],
            "logicalOperator": [
                594
            ],
            "parentViewFilterGroupId": [
                481
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "viewId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                481
            ],
            "update": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                481
            ],
            "operand": [
                595
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                481
            ],
            "subFieldName": [
                1
            ],
            "value": [
                286
            ],
            "viewFilterGroupId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                481
            ],
            "update": [
                536
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                481
            ],
            "fieldValue": [
                1
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
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
                481
            ],
            "calendarFieldMetadataId": [
                481
            ],
            "calendarLayout": [
                588
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                481
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                18
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                481
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                481
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                598
            ],
            "position": [
                10
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                601
            ],
            "visibility": [
                602
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                481
            ],
            "update": [
                539
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                600
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
                481
            ],
            "update": [
                541
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
                20
            ],
            "aiChatModelTier": [
                20
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
                481
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                10
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
                10
            ],
            "workspaceDiscoverability": [
                616
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                481
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "viewFieldId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                547
            ],
            "id": [
                481
            ],
            "isVisible": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                547
            ],
            "groups": [
                548
            ],
            "widgetId": [
                481
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
                481
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
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                481
            ],
            "predicateGroups": [
                421
            ],
            "predicates": [
                423
            ],
            "roleId": [
                481
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
                558
            ],
            "viewFields": [
                555
            ],
            "viewFilterGroups": [
                556
            ],
            "viewFilters": [
                557
            ],
            "viewSorts": [
                559
            ],
            "widgetId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                18
            ],
            "fieldMetadataId": [
                481
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "size": [
                10
            ],
            "viewFieldId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                481
            ],
            "logicalOperator": [
                594
            ],
            "parentViewFilterGroupId": [
                481
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
            ],
            "operand": [
                595
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                481
            ],
            "subFieldName": [
                1
            ],
            "value": [
                286
            ],
            "viewFilterGroupId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                481
            ],
            "calendarFieldMetadataId": [
                481
            ],
            "calendarLayout": [
                588
            ],
            "kanbanAggregateOperation": [
                18
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                481
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                481
            ],
            "openRecordIn": [
                598
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                601
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                600
            ],
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
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
                573
            ],
            "usageByApplication": [
                562
            ],
            "usageByModel": [
                562
            ],
            "usageByOperationType": [
                562
            ],
            "usageByUser": [
                562
            ],
            "userDailyUsage": [
                575
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                565
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
                10
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
                481
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                79
            ],
            "operationType": [
                565
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                572
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                574
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
                574
            ],
            "operationType": [
                565
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                564
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                568
            ],
            "resourceType": [
                572
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                566
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
                565
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                574
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
                565
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                572
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                574
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
                481
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                79
            ],
            "operationType": [
                565
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
                572
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
                574
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                10
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
                573
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
                579
            ],
            "currentWorkspace": [
                610
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
                481
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
                579
            ],
            "workspaceMember": [
                619
            ],
            "workspaceMembers": [
                619
            ],
            "workspaces": [
                579
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
                481
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
                481
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
                481
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
                576
            ],
            "userId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                481
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
                481
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
                481
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                481
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
                481
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
                10
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
                628
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
                481
            ],
            "calendarEndFieldMetadataId": [
                481
            ],
            "calendarFieldMetadataId": [
                481
            ],
            "calendarLayout": [
                588
            ],
            "createdAt": [
                185
            ],
            "createdByUserWorkspaceId": [
                481
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
                481
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
                18
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                481
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                597
            ],
            "mainGroupByFieldMetadataId": [
                481
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                481
            ],
            "openRecordIn": [
                598
            ],
            "position": [
                10
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                601
            ],
            "universalIdentifier": [
                481
            ],
            "updatedAt": [
                185
            ],
            "viewFieldGroups": [
                591
            ],
            "viewFields": [
                590
            ],
            "viewFilterGroups": [
                593
            ],
            "viewFilters": [
                592
            ],
            "viewGroups": [
                596
            ],
            "viewSorts": [
                599
            ],
            "visibility": [
                602
            ],
            "workspaceId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                18
            ],
            "applicationId": [
                481
            ],
            "createdAt": [
                185
            ],
            "deletedAt": [
                185
            ],
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
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
                10
            ],
            "size": [
                10
            ],
            "universalIdentifier": [
                481
            ],
            "updatedAt": [
                185
            ],
            "viewFieldGroupId": [
                481
            ],
            "viewId": [
                481
            ],
            "workspaceId": [
                481
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
                481
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
                10
            ],
            "updatedAt": [
                185
            ],
            "viewFields": [
                590
            ],
            "viewId": [
                481
            ],
            "workspaceId": [
                481
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
                481
            ],
            "id": [
                481
            ],
            "operand": [
                595
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                481
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
                481
            ],
            "viewId": [
                481
            ],
            "workspaceId": [
                481
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
                481
            ],
            "logicalOperator": [
                594
            ],
            "parentViewFilterGroupId": [
                481
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "updatedAt": [
                185
            ],
            "viewId": [
                481
            ],
            "workspaceId": [
                481
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
                481
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "updatedAt": [
                185
            ],
            "viewId": [
                481
            ],
            "workspaceId": [
                481
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
                600
            ],
            "fieldMetadataId": [
                481
            ],
            "id": [
                481
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                185
            ],
            "viewId": [
                481
            ],
            "workspaceId": [
                481
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
                481
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
                481
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
                17
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
                589
            ],
            "on_WorkflowConfiguration": [
                607
            ],
            "on_WorkflowRunConfiguration": [
                608
            ],
            "on_WorkflowVersionConfiguration": [
                609
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                611
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                20
            ],
            "aiChatModelTier": [
                20
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
                10
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
                481
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
                481
            ],
            "metadataVersion": [
                10
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                10
            ],
            "updatedAt": [
                185
            ],
            "viewFields": [
                590
            ],
            "viewFilterGroups": [
                593
            ],
            "viewFilters": [
                592
            ],
            "viewGroups": [
                596
            ],
            "viewSorts": [
                599
            ],
            "views": [
                587
            ],
            "workspaceCustomApplication": [
                35
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                616
            ],
            "workspaceMembersCount": [
                10
            ],
            "workspaceUrls": [
                628
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
                613
            ],
            "personEnrichment": [
                286
            ],
            "personOutcome": [
                626
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
                481
            ],
            "roleId": [
                481
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
                621
            ],
            "id": [
                481
            ],
            "locale": [
                1
            ],
            "name": [
                262
            ],
            "numberFormat": [
                622
            ],
            "openRecordIn": [
                364
            ],
            "roles": [
                416
            ],
            "timeFormat": [
                623
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
                481
            ],
            "userWorkspaceId": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                481
            ],
            "variables": [
                577
            ],
            "workspaceMemberId": [
                481
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
                481
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
                481
            ],
            "workspaceUrls": [
                628
            ],
            "__typename": [
                1
            ]
        }
    }
}