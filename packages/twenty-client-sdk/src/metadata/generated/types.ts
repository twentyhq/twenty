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
        101,
        107,
        110,
        111,
        112,
        113,
        121,
        123,
        137,
        142,
        186,
        187,
        214,
        218,
        219,
        220,
        222,
        232,
        238,
        242,
        246,
        249,
        256,
        271,
        273,
        283,
        290,
        291,
        292,
        303,
        305,
        320,
        321,
        322,
        323,
        324,
        325,
        327,
        328,
        329,
        332,
        333,
        335,
        336,
        339,
        341,
        345,
        349,
        358,
        365,
        366,
        367,
        370,
        374,
        375,
        380,
        384,
        407,
        409,
        410,
        413,
        418,
        430,
        432,
        436,
        441,
        458,
        470,
        471,
        473,
        497,
        499,
        501,
        561,
        581,
        588,
        590,
        604,
        610,
        611,
        613,
        614,
        616,
        617,
        618,
        621,
        622,
        627,
        629,
        632,
        637,
        638,
        639,
        642,
        643
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
                290
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
                497
            ],
            "createdAt": [
                187
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                290
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
                290
            ],
            "roleId": [
                497
            ],
            "triggers": [
                290
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                290
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
                187
            ],
            "deletedAt": [
                187
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
                187
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                187
            ],
            "id": [
                497
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                187
            ],
            "lastReadAt": [
                187
            ],
            "snoozedUntil": [
                187
            ],
            "threadId": [
                497
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                497
            ],
            "createdAt": [
                187
            ],
            "id": [
                497
            ],
            "parts": [
                15
            ],
            "processedAt": [
                187
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                497
            ],
            "senderWorkspaceMemberId": [
                497
            ],
            "status": [
                1
            ],
            "threadId": [
                497
            ],
            "turnId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                187
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                497
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                497
            ],
            "messageId": [
                497
            ],
            "orderIndex": [
                8
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                290
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
                290
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                290
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
                187
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
                187
            ],
            "errorMessage": [
                1
            ],
            "id": [
                497
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
                187
            ],
            "status": [
                17
            ],
            "threadId": [
                497
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
                497
            ],
            "aggregateOperation": [
                19
            ],
            "configurationType": [
                621
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                290
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "label": [
                1
            ],
            "numberFormat": [
                123
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                402
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
                187
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
                187
            ],
            "expiresAt": [
                187
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "revokedAt": [
                187
            ],
            "role": [
                424
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                187
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "revokedAt": [
                187
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
                290
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
                187
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
                497
            ],
            "role": [
                329
            ],
            "workspaceMemberId": [
                497
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
                497
            ],
            "applicationVariables": [
                60
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                290
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                136
            ],
            "createdAt": [
                187
            ],
            "defaultLogicFunctionRole": [
                424
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                263
            ],
            "healthCheckLogicFunctionId": [
                497
            ],
            "id": [
                497
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                302
            ],
            "logoFileId": [
                497
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                351
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                497
            ],
            "settingsCustomTabFrontComponentId": [
                497
            ],
            "settingsMenuItems": [
                457
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                497
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                187
            ],
            "id": [
                497
            ],
            "lastAuthorizedAt": [
                187
            ],
            "lastUsedAt": [
                187
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                497
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                497
            ],
            "archivedAt": [
                187
            ],
            "authFailedAt": [
                187
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                398
            ],
            "connectionProviderId": [
                497
            ],
            "createdAt": [
                187
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                497
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                187
            ],
            "lastSignedInAt": [
                187
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
                187
            ],
            "userWorkspaceId": [
                497
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
                497
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
                290
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
                497
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
                256
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
                256
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
                187
            ],
            "fileFolder": [
                256
            ],
            "fileId": [
                497
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
                187
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                497
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
                497
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
                187
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
                602
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                497
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
                187
            ],
            "description": [
                1
            ],
            "id": [
                497
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
                290
            ],
            "type": [
                1
            ],
            "updatedAt": [
                187
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
                497
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
                290
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
                187
            ],
            "domain": [
                1
            ],
            "id": [
                497
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
                440
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                187
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
                497
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
                439
            ],
            "workspaceUrls": [
                644
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
                497
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
                621
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
                290
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
                123
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                365
            ],
            "primaryAxisGroupByFieldMetadataId": [
                497
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                271
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                365
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                497
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                271
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
                290
            ],
            "formattedToRawLookup": [
                290
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
                290
            ],
            "objectMetadataId": [
                497
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
                105
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
                497
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
                471
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
                107
            ],
            "recurringInterval": [
                470
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
                107
            ],
            "recurringInterval": [
                470
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
                107
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
                187
            ],
            "periodStart": [
                187
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
                102
            ],
            "cancelAt": [
                187
            ],
            "collectionMethod": [
                101
            ],
            "currentPeriodEnd": [
                187
            ],
            "id": [
                497
            ],
            "interval": [
                470
            ],
            "metadata": [
                290
            ],
            "phases": [
                103
            ],
            "status": [
                471
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
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
                497
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
                104
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
                497
            ],
            "contactAutoCreationPolicy": [
                110
            ],
            "createdAt": [
                187
            ],
            "handle": [
                1
            ],
            "id": [
                497
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                111
            ],
            "syncStageStartedAt": [
                187
            ],
            "syncStatus": [
                112
            ],
            "syncedAt": [
                187
            ],
            "throttleFailureCount": [
                11
            ],
            "updatedAt": [
                187
            ],
            "visibility": [
                113
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
                621
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                621
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
                121
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
                621
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                290
            ],
            "error": [
                126
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
                621
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
                345
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                347
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
                130
            ],
            "aiModelTiers": [
                132
            ],
            "aiModels": [
                131
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
                120
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
                134
            ],
            "publicFeatureFlags": [
                396
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                455
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                472
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                187
            ],
            "link": [
                1
            ],
            "startAt": [
                187
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
                497
            ],
            "availabilityObjectMetadataId": [
                497
            ],
            "availabilityType": [
                137
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                497
            ],
            "createdAt": [
                187
            ],
            "engineComponentKey": [
                222
            ],
            "frontComponent": [
                263
            ],
            "frontComponentId": [
                497
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                497
            ],
            "pageLayoutId": [
                497
            ],
            "payload": [
                138
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
            ],
            "workflowVersionId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                357
            ],
            "on_PathCommandMenuItemPayload": [
                382
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
                254
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                497
            ],
            "archivedAt": [
                187
            ],
            "authFailedAt": [
                187
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                398
            ],
            "connectionProviderId": [
                497
            ],
            "createdAt": [
                187
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                497
            ],
            "lastCredentialsRefreshedAt": [
                187
            ],
            "lastSignedInAt": [
                187
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
                187
            ],
            "userWorkspaceId": [
                497
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
                276
            ],
            "handle": [
                1
            ],
            "id": [
                497
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                214
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
                290
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
                290
            ],
            "roleId": [
                497
            ],
            "triggers": [
                290
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                497
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                325
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
                497
            ],
            "availabilityType": [
                137
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                497
            ],
            "engineComponentKey": [
                222
            ],
            "frontComponentId": [
                497
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
                497
            ],
            "pageLayoutId": [
                497
            ],
            "payload": [
                290
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                497
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
                319
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
                290
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
                290
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                497
            ],
            "options": [
                290
            ],
            "relationCreationPayload": [
                290
            ],
            "settings": [
                290
            ],
            "type": [
                249
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
                497
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
                497
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
                159
            ],
            "indexType": [
                283
            ],
            "objectMetadataId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                290
            ],
            "databaseEventTriggerSettings": [
                290
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                290
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                290
            ],
            "source": [
                290
            ],
            "timeoutSeconds": [
                11
            ],
            "toolTriggerSettings": [
                290
            ],
            "universalIdentifier": [
                497
            ],
            "workflowActionTriggerSettings": [
                290
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
                497
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
                497
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                497
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                497
            ],
            "targetRecordId": [
                497
            ],
            "type": [
                349
            ],
            "userWorkspaceId": [
                497
            ],
            "viewId": [
                497
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
                290
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
                157
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                160
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                164
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
                497
            ],
            "type": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                374
            ],
            "pageLayoutId": [
                497
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
                290
            ],
            "objectMetadataId": [
                497
            ],
            "pageLayoutTabId": [
                497
            ],
            "position": [
                290
            ],
            "title": [
                1
            ],
            "type": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                497
            ],
            "filter": [
                290
            ],
            "objectMetadataId": [
                497
            ],
            "orderBy": [
                290
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
                497
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
                501
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
                581
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                588
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                590
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
                497
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                497
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
                497
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
                497
            ],
            "id": [
                497
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
                497
            ],
            "viewId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                497
            ],
            "logicalOperator": [
                610
            ],
            "parentViewFilterGroupId": [
                497
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "operand": [
                611
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                290
            ],
            "viewFilterGroupId": [
                497
            ],
            "viewId": [
                497
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
                497
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                497
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
                497
            ],
            "calendarFieldMetadataId": [
                497
            ],
            "calendarLayout": [
                604
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                497
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                613
            ],
            "mainGroupByFieldMetadataId": [
                497
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                497
            ],
            "openRecordIn": [
                614
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                617
            ],
            "visibility": [
                618
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                616
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                497
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
                497
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
                142
            ],
            "before": [
                142
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                497
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                497
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
                497
            ],
            "name": [
                266
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                497
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
                497
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                207
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
                497
            ],
            "pageLayoutId": [
                497
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
                497
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
                497
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                441
            ],
            "type": [
                273
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                497
            ],
            "status": [
                441
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                143
            ],
            "IMAP": [
                143
            ],
            "SMTP": [
                143
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
                621
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                187
            ],
            "domain": [
                1
            ],
            "id": [
                497
            ],
            "status": [
                219
            ],
            "tenantStatus": [
                220
            ],
            "unsubscribeHostnameStatus": [
                499
            ],
            "updatedAt": [
                187
            ],
            "verificationRecords": [
                599
            ],
            "verifiedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainExceptionCode": {},
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                621
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
                290
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
                290
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
                224
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                290
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
                187
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
                187
            ],
            "currentPeriodEnd": [
                187
            ],
            "expiresAt": [
                187
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
                187
            ],
            "start": [
                187
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
                232
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
                230
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                231
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
                233
            ],
            "first": [
                8
            ],
            "table": [
                238
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                234
            ],
            "records": [
                237
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
                290
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                187
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
                334
            ],
            "objectRecordEventsWithQueryIds": [
                364
            ],
            "queueJobEvents": [
                293
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                497
            ],
            "payload": [
                290
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                242
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
                497
            ],
            "createdAt": [
                187
            ],
            "defaultValue": [
                290
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                497
            ],
            "morphRelations": [
                417
            ],
            "name": [
                1
            ],
            "object": [
                351
            ],
            "objectMetadataId": [
                497
            ],
            "options": [
                290
            ],
            "relation": [
                417
            ],
            "settings": [
                290
            ],
            "type": [
                249
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                187
            ],
            "writability": [
                341
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                621
            ],
            "fieldDisplayMode": [
                246
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
                247
            ],
            "pageInfo": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                142
            ],
            "node": [
                243
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                248
            ],
            "id": [
                498
            ],
            "isActive": [
                108
            ],
            "isSystem": [
                108
            ],
            "isUIEditable": [
                108
            ],
            "isUIReadOnly": [
                108
            ],
            "objectMetadataId": [
                498
            ],
            "or": [
                248
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
                497
            ],
            "id": [
                497
            ],
            "objectMetadataId": [
                497
            ],
            "roleId": [
                497
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
                497
            ],
            "objectMetadataId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                621
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
                187
            ],
            "id": [
                497
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
                497
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
                187
            ],
            "fileId": [
                497
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
                187
            ],
            "id": [
                497
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
                621
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                497
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                441
            ],
            "type": [
                273
            ],
            "workspace": [
                641
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
                332
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                621
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
                497
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                59
            ],
            "applicationVariables": [
                290
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
                187
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                497
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
                497
            ],
            "updatedAt": [
                187
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                265
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                621
            ],
            "frontComponentId": [
                497
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                497
            ],
            "pageLayoutType": [
                375
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
                497
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
                497
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
                497
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
                497
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
                621
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
                277
            ],
            "IMAP": [
                277
            ],
            "SMTP": [
                277
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
                214
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
                645
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                187
            ],
            "id": [
                497
            ],
            "indexFieldMetadataList": [
                281
            ],
            "indexType": [
                283
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
                187
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                142
            ],
            "node": [
                279
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                187
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "order": [
                11
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                282
            ],
            "id": [
                498
            ],
            "isCustom": [
                108
            ],
            "or": [
                282
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                497
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
                286
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
                497
            ],
            "messageThreadId": [
                497
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
                292
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                497
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
                621
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
                290
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
                123
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                365
            ],
            "primaryAxisGroupByFieldMetadataId": [
                497
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                271
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                365
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                497
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                271
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
                290
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                298
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
                290
            ],
            "objectMetadataId": [
                497
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
                297
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
                497
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
                497
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                187
            ],
            "cronTriggerSettings": [
                290
            ],
            "databaseEventTriggerSettings": [
                290
            ],
            "description": [
                1
            ],
            "executionMode": [
                303
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                290
            ],
            "id": [
                497
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
                290
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
            ],
            "workflowActionTriggerSettings": [
                290
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                290
            ],
            "duration": [
                11
            ],
            "error": [
                290
            ],
            "logs": [
                1
            ],
            "status": [
                305
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                497
            ],
            "applicationUniversalIdentifier": [
                497
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                497
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
                290
            ],
            "name": [
                1
            ],
            "objects": [
                312
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                313
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
                314
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                315
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
                621
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignSendBlockerDTO": {
            "code": [
                218
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
                140
            ],
            "connectedAccountId": [
                497
            ],
            "contactAutoCreationPolicy": [
                320
            ],
            "createdAt": [
                187
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
                497
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                327
            ],
            "pendingGroupEmailsAction": [
                321
            ],
            "syncStage": [
                322
            ],
            "syncStageStartedAt": [
                187
            ],
            "syncStatus": [
                323
            ],
            "syncedAt": [
                187
            ],
            "throttleFailureCount": [
                11
            ],
            "throttleRetryAfter": [
                187
            ],
            "type": [
                324
            ],
            "updatedAt": [
                187
            ],
            "visibility": [
                325
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
                187
            ],
            "externalId": [
                1
            ],
            "id": [
                497
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                497
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                328
            ],
            "updatedAt": [
                187
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
                187
            ],
            "emailAddress": [
                1
            ],
            "id": [
                497
            ],
            "reason": [
                332
            ],
            "source": [
                333
            ],
            "unsubscribeTopicId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                330
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
                363
            ],
            "recordId": [
                1
            ],
            "type": [
                335
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
                497
            ],
            "property": [
                1
            ],
            "provenance": [
                339
            ],
            "recordId": [
                497
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
                497
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                135
            ],
            "objectMetadataItems": [
                343
            ],
            "views": [
                344
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
                497
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
                497
            ],
            "key": [
                613
            ],
            "objectMetadataId": [
                497
            ],
            "type": [
                617
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                464,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                626,
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
                        497
                    ],
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        497,
                        "UUID!"
                    ],
                    "roleId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        497,
                        "UUID!"
                    ],
                    "roleId": [
                        497,
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
                119,
                {
                    "input": [
                        118,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                106
            ],
            "cancelSwitchBillingPlan": [
                106
            ],
            "cancelSwitchResourceCreditPrice": [
                106
            ],
            "checkCustomDomainValidRecords": [
                208
            ],
            "checkPublicDomainValidRecords": [
                208,
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
                        470,
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
                        497,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                139,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        497,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                369,
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
                258,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                258,
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
                258,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                258,
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
                        145,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                319,
                {
                    "input": [
                        146,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                147,
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
                148,
                {
                    "input": [
                        149,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                62,
                {
                    "input": [
                        150,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                88
            ],
            "createCalendarEvent": [
                152,
                {
                    "input": [
                        151,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                9
            ],
            "createCommandMenuItem": [
                136,
                {
                    "input": [
                        153,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                206,
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
                155,
                {
                    "input": [
                        154,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                217,
                {
                    "input": [
                        156,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                257,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        256,
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
                263,
                {
                    "input": [
                        158,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                348,
                {
                    "inputs": [
                        163,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                607,
                {
                    "inputs": [
                        177,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                606,
                {
                    "inputs": [
                        178,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                612,
                {
                    "inputs": [
                        181,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                330,
                {
                    "input": [
                        162,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                348,
                {
                    "input": [
                        163,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                257,
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
                461,
                {
                    "input": [
                        459,
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
                        497,
                        "UUID!"
                    ],
                    "properties": [
                        290
                    ],
                    "recordId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        144,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                243,
                {
                    "input": [
                        165,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                279,
                {
                    "input": [
                        166,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                302,
                {
                    "input": [
                        161,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                351,
                {
                    "input": [
                        167,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                424,
                {
                    "createRoleInput": [
                        172,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                372,
                {
                    "input": [
                        168,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                373,
                {
                    "input": [
                        169,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                376,
                {
                    "input": [
                        170,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                395,
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
                461,
                {
                    "input": [
                        460,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                464,
                {
                    "input": [
                        173,
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
                        470,
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
                500,
                {
                    "input": [
                        174,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                579,
                {
                    "input": [
                        175,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                598,
                {
                    "input": [
                        176,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                603,
                {
                    "input": [
                        182,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                606,
                {
                    "input": [
                        178,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                607,
                {
                    "input": [
                        177,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                608,
                {
                    "input": [
                        180,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                609,
                {
                    "input": [
                        179,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                612,
                {
                    "input": [
                        181,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                615,
                {
                    "input": [
                        183,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                619,
                {
                    "input": [
                        184,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                464,
                {
                    "id": [
                        497,
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
                319,
                {
                    "id": [
                        497,
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
                        188,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                136,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                140,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                626
            ],
            "deleteEmailGroupChannel": [
                319,
                {
                    "id": [
                        497,
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
                263,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                348,
                {
                    "ids": [
                        497,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                348,
                {
                    "id": [
                        497,
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
                243,
                {
                    "input": [
                        189,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                279,
                {
                    "input": [
                        190,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                302,
                {
                    "input": [
                        306,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                351,
                {
                    "input": [
                        191,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        497,
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
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                192,
                {
                    "input": [
                        193,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                464,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                194,
                {
                    "twoFactorAuthenticationMethodId": [
                        497,
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
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                592
            ],
            "deleteUserFromWorkspace": [
                595,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                598,
                {
                    "id": [
                        497,
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
                606,
                {
                    "input": [
                        196,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                607,
                {
                    "input": [
                        195,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                608,
                {
                    "input": [
                        197,
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
                612,
                {
                    "input": [
                        198,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        199,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                619,
                {
                    "id": [
                        497,
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
                606,
                {
                    "input": [
                        202,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                607,
                {
                    "input": [
                        201,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                608,
                {
                    "input": [
                        203,
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
                612,
                {
                    "input": [
                        204,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        205,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                140,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                209,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                210,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                211,
                {
                    "input": [
                        212,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                215,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        497
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                83
            ],
            "enqueueJob": [
                225,
                {
                    "input": [
                        223,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                227,
                {
                    "input": [
                        226,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                630
            ],
            "executeOneLogicFunction": [
                304,
                {
                    "input": [
                        240,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                30,
                {
                    "apiKeyId": [
                        497,
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
                        497,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                65
            ],
            "generateTransientToken": [
                480
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                494,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        497,
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
                495,
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
                268,
                {
                    "input": [
                        269,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                309,
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
                368
            ],
            "grantApplicationCapabilities": [
                38,
                {
                    "input": [
                        270,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                278,
                {
                    "userId": [
                        497,
                        "UUID!"
                    ],
                    "workspaceId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                285,
                {
                    "input": [
                        284,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                287,
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
                287
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
                228
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        419,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                411,
                {
                    "principal": [
                        408,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        416,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        497,
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
                        420,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                421,
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
                451,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                136,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                373,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                372,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                475,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                444,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        497,
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
                        422,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                426,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                437,
                {
                    "input": [
                        433,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                52,
                {
                    "applicationId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                275,
                {
                    "connectionParameters": [
                        213,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        497
                    ]
                }
            ],
            "sendChatMessage": [
                444,
                {
                    "browsingContext": [
                        290
                    ],
                    "fileAttachments": [
                        255,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        497,
                        "[UUID!]"
                    ],
                    "messageId": [
                        497,
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
                        497,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                447,
                {
                    "input": [
                        446,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                450,
                {
                    "input": [
                        449,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                451,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        497
                    ]
                }
            ],
            "sendMessageCampaign": [
                453,
                {
                    "input": [
                        452,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                448,
                {
                    "input": [
                        454,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                32,
                {
                    "input": [
                        456,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                228,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                411,
                {
                    "accessLevel": [
                        407,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        416,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                411,
                {
                    "accessLevel": [
                        407,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        408,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        416,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                106,
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
                462,
                {
                    "input": [
                        463
                    ]
                }
            ],
            "signUpInWorkspace": [
                462,
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
                        497
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
                369,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "startChannelSync": [
                122,
                {
                    "connectedAccountId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                466,
                {
                    "companyContext": [
                        290
                    ],
                    "personContext": [
                        290
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                467
            ],
            "switchBillingPlan": [
                106
            ],
            "switchSubscriptionInterval": [
                106
            ],
            "syncApplication": [
                640,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        290,
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
                        290
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
            "triggerAddPeopleToMessageListJob": [
                482,
                {
                    "input": [
                        481,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                486,
                {
                    "input": [
                        483,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                485,
                {
                    "input": [
                        484,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                490,
                {
                    "input": [
                        487,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                489,
                {
                    "input": [
                        488,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                492,
                {
                    "input": [
                        491,
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
                        187
                    ],
                    "threadIds": [
                        497,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                28,
                {
                    "input": [
                        503,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                319,
                {
                    "input": [
                        504,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                36,
                {
                    "id": [
                        497,
                        "UUID!"
                    ],
                    "input": [
                        505,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                54,
                {
                    "input": [
                        506,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                58,
                {
                    "input": [
                        508,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                109,
                {
                    "input": [
                        510,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                136,
                {
                    "input": [
                        512,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                319,
                {
                    "input": [
                        513,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                263,
                {
                    "input": [
                        515,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                241,
                {
                    "input": [
                        517,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                348,
                {
                    "inputs": [
                        528,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                351,
                {
                    "inputs": [
                        529,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                612,
                {
                    "inputs": [
                        551,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                319,
                {
                    "input": [
                        520,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                326,
                {
                    "input": [
                        522,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                326,
                {
                    "input": [
                        524,
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
                348,
                {
                    "input": [
                        528,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        502,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        497
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
                243,
                {
                    "input": [
                        527,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        518,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                351,
                {
                    "input": [
                        529,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                424,
                {
                    "updateRoleInput": [
                        536,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                372,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        530,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                373,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        531,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        533,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                372,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        535,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                288,
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
                464,
                {
                    "input": [
                        538,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                475,
                {
                    "input": [
                        539,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                500,
                {
                    "input": [
                        540,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                579,
                {
                    "input": [
                        541,
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
                598,
                {
                    "input": [
                        542,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                603,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        553,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                606,
                {
                    "input": [
                        546,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                607,
                {
                    "input": [
                        544,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                608,
                {
                    "input": [
                        549,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        548,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                612,
                {
                    "input": [
                        551,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                615,
                {
                    "input": [
                        554,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                619,
                {
                    "input": [
                        556,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                626,
                {
                    "data": [
                        559,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                626,
                {
                    "data": [
                        558,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                635,
                {
                    "roleId": [
                        497,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        560,
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
                        561,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                254,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        561,
                        "Upload!"
                    ],
                    "fileFolder": [
                        256,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                258,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        561,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                258,
                {
                    "file": [
                        561,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                258,
                {
                    "file": [
                        561,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                258,
                {
                    "file": [
                        561,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                250,
                {
                    "upsertFieldPermissionsInput": [
                        562,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                603,
                {
                    "input": [
                        565,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                359,
                {
                    "upsertObjectPermissionsInput": [
                        566,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                425,
                {
                    "upsertPermissionFlagsInput": [
                        567,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                569,
                {
                    "input": [
                        568,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                603,
                {
                    "input": [
                        570,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                62,
                {
                    "input": [
                        596,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                600,
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
                217,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                601,
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
                497
            ],
            "color": [
                1
            ],
            "createdAt": [
                187
            ],
            "folderId": [
                497
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                497
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                497
            ],
            "targetRecordId": [
                497
            ],
            "targetRecordIdentifier": [
                404
            ],
            "type": [
                349
            ],
            "updatedAt": [
                187
            ],
            "userWorkspaceId": [
                497
            ],
            "viewId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                497
            ],
            "color": [
                1
            ],
            "createdAt": [
                187
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                354,
                {
                    "filter": [
                        248,
                        "FieldFilter!"
                    ],
                    "paging": [
                        185,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                243
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "imageIdentifierFieldMetadataId": [
                497
            ],
            "indexMetadataList": [
                279
            ],
            "indexMetadatas": [
                356,
                {
                    "filter": [
                        282,
                        "IndexFilter!"
                    ],
                    "paging": [
                        185,
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
                497
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
                358
            ],
            "readability": [
                336
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                497
            ],
            "searchFieldMetadataList": [
                443
            ],
            "sharingReach": [
                366
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                187
            ],
            "writability": [
                341
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                353
            ],
            "pageInfo": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                142
            ],
            "node": [
                351
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                247
            ],
            "pageInfo": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                355
            ],
            "id": [
                498
            ],
            "isActive": [
                108
            ],
            "isRemote": [
                108
            ],
            "isSearchable": [
                108
            ],
            "isSystem": [
                108
            ],
            "isUICreatable": [
                108
            ],
            "isUIEditable": [
                108
            ],
            "isUIReadOnly": [
                108
            ],
            "or": [
                355
            ],
            "universalIdentifier": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                280
            ],
            "pageInfo": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                497
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
                497
            ],
            "restrictedFields": [
                290
            ],
            "rowLevelPermissionPredicateGroups": [
                428
            ],
            "rowLevelPermissionPredicates": [
                427
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
                497
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
                186
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                363
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
                290
            ],
            "before": [
                290
            ],
            "diff": [
                290
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
                362
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
                367
            ],
            "previousOnboardingStatus": [
                367
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
                142
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                142
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                497
            ],
            "createdAt": [
                187
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                497
            ],
            "deletedAt": [
                187
            ],
            "id": [
                497
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
                497
            ],
            "tabs": [
                373
            ],
            "type": [
                375
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                497
            ],
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                374
            ],
            "pageLayoutId": [
                497
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
            ],
            "widgets": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                497
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                290
            ],
            "configuration": [
                620
            ],
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "gridPosition": [
                272
            ],
            "id": [
                497
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
                497
            ],
            "pageLayoutTabId": [
                497
            ],
            "position": [
                379
            ],
            "title": [
                1
            ],
            "type": [
                622
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                374
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
                374
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
                377
            ],
            "on_PageLayoutWidgetGridPosition": [
                378
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                381
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                380
            ],
            "index": [
                8
            ],
            "layoutMode": [
                374
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
                497
            ],
            "createdAt": [
                187
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                497
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                497
            ],
            "aggregateOperation": [
                19
            ],
            "color": [
                1
            ],
            "configurationType": [
                621
            ],
            "dateGranularity": [
                365
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
                290
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupByFieldMetadataId": [
                497
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
                123
            ],
            "orderBy": [
                271
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
                388
            ],
            "formattedToRawLookup": [
                290
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
                290
            ],
            "objectMetadataId": [
                497
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
                301
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
                187
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                117
            ],
            "blockers": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                497
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
                214
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
                497
            ],
            "createdAt": [
                187
            ],
            "domain": [
                1
            ],
            "id": [
                497
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
                242
            ],
            "metadata": [
                397
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
                394
            ],
            "IMAP": [
                394
            ],
            "SMTP": [
                394
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
                497
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                644
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
                497
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
                        497,
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
                        267,
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
                        299
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
                319,
                {
                    "filter": [
                        300
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                39,
                {
                    "applicationId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                40,
                {
                    "applicationId": [
                        497,
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
                442,
                {
                    "applicationId": [
                        497,
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
                497,
                {
                    "calendarEventId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                125,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                128,
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
                634,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                468,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                136,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                136
            ],
            "currentUser": [
                592
            ],
            "currentUserApplicationAuthorizations": [
                37
            ],
            "currentUserSessions": [
                594
            ],
            "currentWorkspace": [
                626
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
                229
            ],
            "eventLogs": [
                236,
                {
                    "input": [
                        235,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                42,
                {
                    "universalIdentifier": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                243,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                245,
                {
                    "filter": [
                        248,
                        "FieldFilter!"
                    ],
                    "paging": [
                        185,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                393,
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
                129,
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
                293,
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
                54
            ],
            "findManyApplications": [
                36
            ],
            "findManyLogicFunctions": [
                302
            ],
            "findManyMarketplaceApps": [
                310,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                395
            ],
            "findMarketplaceAppDetail": [
                311,
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
                        497
                    ],
                    "universalIdentifier": [
                        497
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
                302,
                {
                    "input": [
                        306,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                293,
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
                293,
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
                628
            ],
            "findWorkspaceFromInviteHash": [
                626,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                633
            ],
            "frontComponent": [
                263,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                263
            ],
            "getAddressDetails": [
                389,
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
                424
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
                290,
                {
                    "input": [
                        306,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                141,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                217
            ],
            "getInviteSuggestions": [
                289
            ],
            "getJobs": [
                293,
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
                        306,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                372,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                373,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                373,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                376,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                372,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        375
                    ]
                }
            ],
            "getPermissionFlags": [
                383
            ],
            "getPublicWorkspaceDataByDomain": [
                399,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                400,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                98
            ],
            "getRole": [
                424,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                424
            ],
            "getSSOIdentityProviders": [
                260
            ],
            "getToolIndex": [
                479
            ],
            "getToolInputSchema": [
                290,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                576,
                {
                    "input": [
                        577
                    ]
                }
            ],
            "getView": [
                603,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                606,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                607,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                607,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                606,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                608,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                609,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                608,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                612,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                612,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                615,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                615,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                603,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        617,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                631
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
                295,
                {
                    "input": [
                        296,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                89
            ],
            "messageSuppressions": [
                331,
                {
                    "input": [
                        261,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                337,
                {
                    "input": [
                        340,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                342
            ],
            "mostlyEmptyFieldMetadataIds": [
                497,
                {
                    "objectMetadataId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                109,
                {
                    "connectedAccountId": [
                        497
                    ]
                }
            ],
            "myConnectedAccounts": [
                140
            ],
            "myMessageChannels": [
                319,
                {
                    "connectedAccountId": [
                        497
                    ]
                }
            ],
            "myMessageFolders": [
                326,
                {
                    "messageChannelId": [
                        497
                    ]
                }
            ],
            "myUserApplicationVariables": [
                636
            ],
            "navigationMenuItem": [
                348,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                348
            ],
            "object": [
                351,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                361
            ],
            "objects": [
                352,
                {
                    "filter": [
                        355,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        185,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                386,
                {
                    "input": [
                        387,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                117,
                {
                    "input": [
                        390,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                392,
                {
                    "input": [
                        391,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                311,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                310,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                406,
                {
                    "targets": [
                        416,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                411,
                {
                    "target": [
                        416,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                464,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                464
            ],
            "timelineActivityTypes": [
                475
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                496,
                {
                    "userId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                500
            ],
            "usageLimits": [
                579
            ],
            "usageQuotaDefinitions": [
                583
            ],
            "usageQuotaScopeConsumption": [
                585,
                {
                    "input": [
                        586,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                587
            ],
            "validatePasswordResetToken": [
                597,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                598,
                {
                    "objectMetadataId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                619,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                497
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
                497
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
                497
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
                497
            ],
            "permissions": [
                405
            ],
            "recordId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                497
            ],
            "workspaceMemberId": [
                497
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
                407
            ],
            "generalAccessLevel": [
                407
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                405
            ],
            "roles": [
                414
            ],
            "shares": [
                412
            ],
            "sharingMode": [
                413
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                407
            ],
            "id": [
                10
            ],
            "principalId": [
                497
            ],
            "principalRoleId": [
                497
            ],
            "principalType": [
                409
            ],
            "rowCause": [
                410
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
                497
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
                621
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
                497
            ],
            "recordId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                243
            ],
            "sourceObjectMetadata": [
                351
            ],
            "targetFieldMetadata": [
                243
            ],
            "targetObjectMetadata": [
                351
            ],
            "type": [
                418
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
                497
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
            "applicationId": [
                497
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
                250
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                359
            ],
            "permissionFlags": [
                425
            ],
            "rowLevelPermissionPredicateGroups": [
                428
            ],
            "rowLevelPermissionPredicates": [
                427
            ],
            "universalIdentifier": [
                497
            ],
            "workspaceMembers": [
                635
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
                497
            ],
            "roleId": [
                497
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
                432
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
                290
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
                430
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
                497
            ],
            "logicalOperator": [
                430
            ],
            "objectMetadataId": [
                497
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                497
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
                497
            ],
            "id": [
                497
            ],
            "operand": [
                432
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                290
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
                435
            ],
            "messages": [
                435
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                290
            ],
            "runAsWorkspaceMemberId": [
                497
            ],
            "thread": [
                438
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                497
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
                434
            ],
            "content": [
                1
            ],
            "role": [
                436
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
                290
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                497
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
                497
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                441
            ],
            "type": [
                273
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                497
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                441
            ],
            "type": [
                273
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
                187
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                497
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                497
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
                445
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
                290
            ],
            "workspaceMemberIds": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                497
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
                633
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
                187
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                117
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
                290
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                497
            ],
            "createdAt": [
                187
            ],
            "frontComponentId": [
                497
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "position": [
                11
            ],
            "scope": [
                458
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
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
                497
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
                497
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                441
            ],
            "type": [
                273
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
                645
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
                497
            ],
            "content": [
                1
            ],
            "createdAt": [
                187
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                187
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                423
            ],
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                643
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
                237,
                {
                    "fieldFilters": [
                        231,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        238,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                403,
                {
                    "input": [
                        171,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                307,
                {
                    "input": [
                        308,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                239,
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
                473
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
                621
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
                497
            ],
            "createdAt": [
                187
            ],
            "emit": [
                476
            ],
            "frontComponentUniversalIdentifier": [
                497
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                497
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                497
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                497
            ],
            "on": [
                1
            ],
            "through": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                497
            ],
            "relationFieldUniversalIdentifier": [
                497
            ],
            "triggerFieldUniversalIdentifiers": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                621
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
                290
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
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                497
            ],
            "personFilter": [
                290
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                187
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
                187
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                497
            ],
            "gt": [
                497
            ],
            "gte": [
                497
            ],
            "iLike": [
                497
            ],
            "in": [
                497
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                497
            ],
            "lt": [
                497
            ],
            "lte": [
                497
            ],
            "neq": [
                497
            ],
            "notILike": [
                497
            ],
            "notIn": [
                497
            ],
            "notLike": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                187
            ],
            "description": [
                1
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "updatedAt": [
                187
            ],
            "visibility": [
                501
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
                497
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                290
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
                290
            ],
            "roleId": [
                497
            ],
            "triggers": [
                290
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
                497
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
                497
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                325
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
                507
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
                509
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
                497
            ],
            "update": [
                511
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                110
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                113
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                497
            ],
            "availabilityType": [
                137
            ],
            "engineComponentKey": [
                222
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                497
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                290
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
                290
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                497
            ],
            "options": [
                290
            ],
            "settings": [
                290
            ],
            "translations": [
                338
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
                497
            ],
            "update": [
                516
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
                497
            ],
            "update": [
                519
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                290
            ],
            "databaseEventTriggerSettings": [
                290
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                290
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
                290
            ],
            "workflowActionTriggerSettings": [
                290
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                497
            ],
            "update": [
                521
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                320
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
                327
            ],
            "visibility": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                497
            ],
            "update": [
                523
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
                497
            ],
            "update": [
                523
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
                497
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
                497
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
                497
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
                497
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
                358
            ],
            "readability": [
                336
            ],
            "sharingReach": [
                366
            ],
            "shortcut": [
                1
            ],
            "translations": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                497
            ],
            "update": [
                514
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                497
            ],
            "update": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                497
            ],
            "update": [
                526
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
                497
            ],
            "type": [
                375
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
                374
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
                497
            ],
            "layoutMode": [
                374
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                534
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
                290
            ],
            "configuration": [
                290
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                497
            ],
            "pageLayoutTabId": [
                497
            ],
            "position": [
                290
            ],
            "title": [
                1
            ],
            "type": [
                622
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
                290
            ],
            "configuration": [
                290
            ],
            "id": [
                497
            ],
            "objectMetadataId": [
                497
            ],
            "pageLayoutTabId": [
                497
            ],
            "position": [
                290
            ],
            "title": [
                1
            ],
            "type": [
                622
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
                497
            ],
            "tabs": [
                532
            ],
            "type": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                497
            ],
            "update": [
                537
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
                497
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
                497
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                338
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                497
            ],
            "payload": [
                175
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                497
            ],
            "update": [
                543
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
                497
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
                497
            ],
            "update": [
                545
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
                497
            ],
            "update": [
                547
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                497
            ],
            "logicalOperator": [
                610
            ],
            "parentViewFilterGroupId": [
                497
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                497
            ],
            "update": [
                550
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                497
            ],
            "operand": [
                611
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                290
            ],
            "viewFilterGroupId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                497
            ],
            "update": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                497
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
                497
            ],
            "calendarFieldMetadataId": [
                497
            ],
            "calendarLayout": [
                604
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                497
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                497
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                614
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                617
            ],
            "visibility": [
                618
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                497
            ],
            "update": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                616
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
                497
            ],
            "update": [
                557
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
                290
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                497
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
                632
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                290
            ],
            "workspaceMemberId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                251
            ],
            "roleId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                497
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                563
            ],
            "id": [
                497
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
                563
            ],
            "groups": [
                564
            ],
            "widgetId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                360
            ],
            "roleId": [
                497
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                497
            ],
            "predicateGroups": [
                429
            ],
            "predicates": [
                431
            ],
            "roleId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                428
            ],
            "predicates": [
                427
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                574
            ],
            "viewFields": [
                571
            ],
            "viewFilterGroups": [
                572
            ],
            "viewFilters": [
                573
            ],
            "viewSorts": [
                575
            ],
            "widgetId": [
                497
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
                497
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                497
            ],
            "logicalOperator": [
                610
            ],
            "parentViewFilterGroupId": [
                497
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
                497
            ],
            "id": [
                497
            ],
            "operand": [
                611
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                290
            ],
            "viewFilterGroupId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                497
            ],
            "calendarFieldMetadataId": [
                497
            ],
            "calendarLayout": [
                604
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                497
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                497
            ],
            "openRecordIn": [
                614
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                617
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                616
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                187
            ],
            "periodStart": [
                187
            ],
            "timeSeries": [
                589
            ],
            "usageByApplication": [
                578
            ],
            "usageByModel": [
                578
            ],
            "usageByOperationType": [
                578
            ],
            "usageByUser": [
                578
            ],
            "userDailyUsage": [
                591
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                581
            ],
            "periodEnd": [
                187
            ],
            "periodStart": [
                187
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
                187
            ],
            "id": [
                497
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                80
            ],
            "operationType": [
                581
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                588
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                590
            ],
            "updatedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                590
            ],
            "operationType": [
                581
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                580
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                584
            ],
            "resourceType": [
                588
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                582
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
                581
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                590
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
                187
            ],
            "periodStart": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                581
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                588
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                590
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
                497
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                80
            ],
            "operationType": [
                581
            ],
            "periodEnd": [
                187
            ],
            "periodStart": [
                187
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                80
            ],
            "resourceType": [
                588
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
                590
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
                589
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
                187
            ],
            "currentUserWorkspace": [
                595
            ],
            "currentWorkspace": [
                626
            ],
            "deletedAt": [
                187
            ],
            "deletedWorkspaceMembers": [
                200
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
                497
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
                367
            ],
            "previousOnboardingStatus": [
                367
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                187
            ],
            "userVars": [
                291
            ],
            "userWorkspaces": [
                595
            ],
            "workspaceMember": [
                635
            ],
            "workspaceMembers": [
                635
            ],
            "workspaces": [
                595
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
                290
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
                187
            ],
            "expiresAt": [
                187
            ],
            "id": [
                497
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
                187
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "id": [
                497
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                359
            ],
            "objectsPermissions": [
                359
            ],
            "permissionFlags": [
                384
            ],
            "twoFactorAuthenticationMethodSummary": [
                493
            ],
            "updatedAt": [
                187
            ],
            "user": [
                592
            ],
            "userId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                497
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
                497
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
                497
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                497
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
                644
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
                497
            ],
            "calendarEndFieldMetadataId": [
                497
            ],
            "calendarFieldMetadataId": [
                497
            ],
            "calendarLayout": [
                604
            ],
            "createdAt": [
                187
            ],
            "createdByUserWorkspaceId": [
                497
            ],
            "deletedAt": [
                187
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                497
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
                497
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                613
            ],
            "mainGroupByFieldMetadataId": [
                497
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                497
            ],
            "openRecordIn": [
                614
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                617
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                187
            ],
            "viewFieldGroups": [
                607
            ],
            "viewFields": [
                606
            ],
            "viewFilterGroups": [
                609
            ],
            "viewFilters": [
                608
            ],
            "viewGroups": [
                612
            ],
            "viewSorts": [
                615
            ],
            "visibility": [
                618
            ],
            "workspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                621
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
                497
            ],
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
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
                497
            ],
            "updatedAt": [
                187
            ],
            "viewFieldGroupId": [
                497
            ],
            "viewId": [
                497
            ],
            "workspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "id": [
                497
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
                187
            ],
            "viewFields": [
                606
            ],
            "viewId": [
                497
            ],
            "workspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "operand": [
                611
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                187
            ],
            "value": [
                290
            ],
            "viewFilterGroupId": [
                497
            ],
            "viewId": [
                497
            ],
            "workspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "id": [
                497
            ],
            "logicalOperator": [
                610
            ],
            "parentViewFilterGroupId": [
                497
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                497
            ],
            "workspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "fieldValue": [
                1
            ],
            "id": [
                497
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                497
            ],
            "workspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "direction": [
                616
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                497
            ],
            "workspaceId": [
                497
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
                497
            ],
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "description": [
                1
            ],
            "id": [
                497
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
                187
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
                114
            ],
            "on_CallRecordingSummaryConfiguration": [
                115
            ],
            "on_CallRecordingTranscriptConfiguration": [
                116
            ],
            "on_ChatConfiguration": [
                124
            ],
            "on_ChatThreadsConfiguration": [
                127
            ],
            "on_EmailThreadConfiguration": [
                216
            ],
            "on_EmailsConfiguration": [
                221
            ],
            "on_FieldConfiguration": [
                244
            ],
            "on_FieldRichTextConfiguration": [
                252
            ],
            "on_FieldsConfiguration": [
                253
            ],
            "on_FilesConfiguration": [
                259
            ],
            "on_FormFieldConfiguration": [
                262
            ],
            "on_FrontComponentConfiguration": [
                264
            ],
            "on_IframeConfiguration": [
                274
            ],
            "on_LineChartConfiguration": [
                294
            ],
            "on_MessageCampaignBodyConfiguration": [
                316
            ],
            "on_MessageCampaignDetailsConfiguration": [
                317
            ],
            "on_NotesConfiguration": [
                350
            ],
            "on_PieChartConfiguration": [
                385
            ],
            "on_RecordTableConfiguration": [
                415
            ],
            "on_StandaloneRichTextConfiguration": [
                465
            ],
            "on_TasksConfiguration": [
                474
            ],
            "on_TimelineConfiguration": [
                478
            ],
            "on_ViewConfiguration": [
                605
            ],
            "on_WorkflowConfiguration": [
                623
            ],
            "on_WorkflowRunConfiguration": [
                624
            ],
            "on_WorkflowVersionConfiguration": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                627
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
                290
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
                187
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
                424
            ],
            "deletedAt": [
                187
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
                241
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                497
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
                497
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
                187
            ],
            "viewFields": [
                606
            ],
            "viewFilterGroups": [
                609
            ],
            "viewFilters": [
                608
            ],
            "viewGroups": [
                612
            ],
            "viewSorts": [
                615
            ],
            "views": [
                603
            ],
            "workspaceCustomApplication": [
                36
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                632
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                644
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
                290
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                629
            ],
            "personEnrichment": [
                290
            ],
            "personOutcome": [
                642
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
                187
            ],
            "id": [
                497
            ],
            "roleId": [
                497
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
                637
            ],
            "id": [
                497
            ],
            "locale": [
                1
            ],
            "name": [
                266
            ],
            "numberFormat": [
                638
            ],
            "openRecordIn": [
                370
            ],
            "roles": [
                424
            ],
            "timeFormat": [
                639
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
                497
            ],
            "userWorkspaceId": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                497
            ],
            "variables": [
                593
            ],
            "workspaceMemberId": [
                497
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
                290
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
                497
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
                497
            ],
            "workspaceUrls": [
                644
            ],
            "__typename": [
                1
            ]
        }
    }
}