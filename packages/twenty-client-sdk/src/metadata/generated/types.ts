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
        63,
        75,
        79,
        80,
        82,
        87,
        92,
        98,
        108,
        111,
        112,
        113,
        114,
        122,
        124,
        138,
        143,
        187,
        188,
        215,
        219,
        220,
        222,
        232,
        238,
        242,
        246,
        249,
        256,
        270,
        272,
        282,
        289,
        290,
        291,
        302,
        304,
        317,
        318,
        319,
        320,
        321,
        322,
        324,
        325,
        326,
        329,
        330,
        332,
        333,
        336,
        338,
        342,
        346,
        355,
        362,
        363,
        364,
        367,
        371,
        372,
        377,
        381,
        402,
        404,
        405,
        408,
        413,
        425,
        427,
        431,
        436,
        453,
        465,
        466,
        468,
        484,
        486,
        488,
        548,
        568,
        575,
        577,
        591,
        597,
        598,
        600,
        601,
        603,
        604,
        605,
        608,
        609,
        614,
        616,
        619,
        624,
        625,
        626,
        629,
        630
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
                289
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
                484
            ],
            "createdAt": [
                188
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                289
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
                289
            ],
            "roleId": [
                484
            ],
            "triggers": [
                289
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                289
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
                188
            ],
            "deletedAt": [
                188
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
                188
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                188
            ],
            "id": [
                484
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                188
            ],
            "lastReadAt": [
                188
            ],
            "snoozedUntil": [
                188
            ],
            "threadId": [
                484
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                484
            ],
            "createdAt": [
                188
            ],
            "id": [
                484
            ],
            "parts": [
                15
            ],
            "processedAt": [
                188
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                484
            ],
            "status": [
                1
            ],
            "threadId": [
                484
            ],
            "turnId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                188
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                484
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                484
            ],
            "messageId": [
                484
            ],
            "orderIndex": [
                8
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                289
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
                289
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                289
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
                188
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
                188
            ],
            "errorMessage": [
                1
            ],
            "id": [
                484
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
                188
            ],
            "status": [
                17
            ],
            "threadId": [
                484
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
                484
            ],
            "aggregateOperation": [
                19
            ],
            "configurationType": [
                608
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                289
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "label": [
                1
            ],
            "numberFormat": [
                124
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                397
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
                82
            ],
            "kind": [
                1
            ],
            "limitValue": [
                82
            ],
            "periodEnd": [
                188
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
                188
            ],
            "expiresAt": [
                188
            ],
            "id": [
                484
            ],
            "name": [
                1
            ],
            "revokedAt": [
                188
            ],
            "role": [
                419
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                188
            ],
            "id": [
                484
            ],
            "name": [
                1
            ],
            "revokedAt": [
                188
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
                289
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
                188
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
                484
            ],
            "role": [
                326
            ],
            "workspaceMemberId": [
                484
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
                484
            ],
            "applicationVariables": [
                62
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                289
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                137
            ],
            "defaultLogicFunctionRole": [
                419
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
                484
            ],
            "id": [
                484
            ],
            "logicFunctions": [
                301
            ],
            "logoFileId": [
                484
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                348
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                484
            ],
            "settingsCustomTabFrontComponentId": [
                484
            ],
            "settingsMenuItems": [
                452
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                484
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                188
            ],
            "id": [
                484
            ],
            "lastAuthorizedAt": [
                188
            ],
            "lastUsedAt": [
                188
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                484
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                484
            ],
            "archivedAt": [
                188
            ],
            "authFailedAt": [
                188
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                393
            ],
            "connectionProviderId": [
                484
            ],
            "createdAt": [
                188
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                484
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                188
            ],
            "lastSignedInAt": [
                188
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
                188
            ],
            "userWorkspaceId": [
                484
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
                484
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
                289
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
                484
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
                188
            ],
            "fileFolder": [
                256
            ],
            "fileId": [
                484
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
                188
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                484
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
                484
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
                188
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
                589
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                484
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
                188
            ],
            "description": [
                1
            ],
            "id": [
                484
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
                289
            ],
            "type": [
                1
            ],
            "updatedAt": [
                188
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
                67
            ],
            "applicationRefreshToken": [
                67
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationUpgradeRoleGrant": {
            "action": [
                1
            ],
            "fieldUniversalIdentifier": [
                1
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "permissionFlagUniversalIdentifier": [
                1
            ],
            "type": [
                61
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationUpgradeRoleGrantType": {},
        "ApplicationVariable": {
            "description": [
                1
            ],
            "id": [
                484
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
                289
            ],
            "scope": [
                63
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
                188
            ],
            "domain": [
                1
            ],
            "id": [
                484
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
                435
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                188
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
                67
            ],
            "refreshToken": [
                67
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                68
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
                484
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
                434
            ],
            "workspaceUrls": [
                631
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                72
            ],
            "availableWorkspacesForSignUp": [
                72
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                73
            ],
            "tokens": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                484
            ],
            "aggregateOperation": [
                19
            ],
            "axisNameDisplay": [
                75
            ],
            "color": [
                1
            ],
            "configurationType": [
                608
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
                289
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupMode": [
                79
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                80
            ],
            "numberFormat": [
                124
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                362
            ],
            "primaryAxisGroupByFieldMetadataId": [
                484
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                270
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                362
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                484
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                270
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
                289
            ],
            "formattedToRawLookup": [
                289
            ],
            "groupMode": [
                79
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
                80
            ],
            "series": [
                81
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
                289
            ],
            "objectMetadataId": [
                484
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
                106
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
                484
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
                102
            ],
            "currentBillingSubscription": [
                102
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                466
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                87
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
                99
            ],
            "name": [
                1
            ],
            "prices": [
                93
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
                99
            ],
            "name": [
                1
            ],
            "prices": [
                94
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
                88
            ],
            "meteredProducts": [
                89
            ],
            "planKey": [
                92
            ],
            "resourceCreditProducts": [
                88
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
                108
            ],
            "recurringInterval": [
                465
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
                108
            ],
            "recurringInterval": [
                465
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                95
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
                99
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
                99
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                88
            ],
            "on_BillingMeteredProduct": [
                89
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
                92
            ],
            "priceUsageBased": [
                108
            ],
            "productKey": [
                98
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
                188
            ],
            "periodStart": [
                188
            ],
            "productKey": [
                98
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
                103
            ],
            "cancelAt": [
                188
            ],
            "currentPeriodEnd": [
                188
            ],
            "id": [
                484
            ],
            "interval": [
                465
            ],
            "metadata": [
                289
            ],
            "phases": [
                104
            ],
            "status": [
                466
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                97
            ],
            "creditAmount": [
                11
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                484
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
                105
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
                102
            ],
            "currentBillingSubscription": [
                102
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
                484
            ],
            "contactAutoCreationPolicy": [
                111
            ],
            "createdAt": [
                188
            ],
            "handle": [
                1
            ],
            "id": [
                484
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                112
            ],
            "syncStageStartedAt": [
                188
            ],
            "syncStatus": [
                113
            ],
            "syncedAt": [
                188
            ],
            "throttleFailureCount": [
                11
            ],
            "updatedAt": [
                188
            ],
            "visibility": [
                114
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
                608
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                608
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
                122
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
                608
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                289
            ],
            "error": [
                127
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
                608
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
                342
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                344
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
                131
            ],
            "aiModelTiers": [
                133
            ],
            "aiModels": [
                132
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
                66
            ],
            "billing": [
                83
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                121
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
                135
            ],
            "publicFeatureFlags": [
                391
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                450
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                467
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                188
            ],
            "link": [
                1
            ],
            "startAt": [
                188
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
                484
            ],
            "availabilityObjectMetadataId": [
                484
            ],
            "availabilityType": [
                138
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                484
            ],
            "createdAt": [
                188
            ],
            "engineComponentKey": [
                222
            ],
            "frontComponent": [
                263
            ],
            "frontComponentId": [
                484
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                484
            ],
            "pageLayoutId": [
                484
            ],
            "payload": [
                139
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
            ],
            "workflowVersionId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                354
            ],
            "on_PathCommandMenuItemPayload": [
                379
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
                484
            ],
            "archivedAt": [
                188
            ],
            "authFailedAt": [
                188
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                393
            ],
            "connectionProviderId": [
                484
            ],
            "createdAt": [
                188
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                484
            ],
            "lastCredentialsRefreshedAt": [
                188
            ],
            "lastSignedInAt": [
                188
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
                188
            ],
            "userWorkspaceId": [
                484
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
                275
            ],
            "handle": [
                1
            ],
            "id": [
                484
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                215
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
                289
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
                289
            ],
            "roleId": [
                484
            ],
            "triggers": [
                289
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                484
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                322
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
                484
            ],
            "availabilityType": [
                138
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                484
            ],
            "engineComponentKey": [
                222
            ],
            "frontComponentId": [
                484
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
                484
            ],
            "pageLayoutId": [
                484
            ],
            "payload": [
                289
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                484
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
                316
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
                289
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
                289
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                484
            ],
            "options": [
                289
            ],
            "relationCreationPayload": [
                289
            ],
            "settings": [
                289
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
                484
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
                484
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
                160
            ],
            "indexType": [
                282
            ],
            "objectMetadataId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                289
            ],
            "databaseEventTriggerSettings": [
                289
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                289
            ],
            "id": [
                484
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                289
            ],
            "source": [
                289
            ],
            "timeoutSeconds": [
                11
            ],
            "toolTriggerSettings": [
                289
            ],
            "universalIdentifier": [
                484
            ],
            "workflowActionTriggerSettings": [
                289
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
                484
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
                484
            ],
            "icon": [
                1
            ],
            "id": [
                484
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                484
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                484
            ],
            "targetRecordId": [
                484
            ],
            "type": [
                346
            ],
            "userWorkspaceId": [
                484
            ],
            "viewId": [
                484
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
                289
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
                158
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                161
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                165
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
                484
            ],
            "type": [
                372
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                371
            ],
            "pageLayoutId": [
                484
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
                289
            ],
            "objectMetadataId": [
                484
            ],
            "pageLayoutTabId": [
                484
            ],
            "position": [
                289
            ],
            "title": [
                1
            ],
            "type": [
                609
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                484
            ],
            "filter": [
                289
            ],
            "objectMetadataId": [
                484
            ],
            "orderBy": [
                289
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
                484
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
                488
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                82
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                82
            ],
            "operationType": [
                568
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                575
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                577
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
                484
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                484
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
                484
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
                484
            ],
            "id": [
                484
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
                484
            ],
            "viewId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                484
            ],
            "logicalOperator": [
                597
            ],
            "parentViewFilterGroupId": [
                484
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
            ],
            "operand": [
                598
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                484
            ],
            "subFieldName": [
                1
            ],
            "value": [
                289
            ],
            "viewFilterGroupId": [
                484
            ],
            "viewId": [
                484
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
                484
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                484
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
                484
            ],
            "calendarFieldMetadataId": [
                484
            ],
            "calendarLayout": [
                591
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                484
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                484
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                600
            ],
            "mainGroupByFieldMetadataId": [
                484
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                484
            ],
            "openRecordIn": [
                601
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                604
            ],
            "visibility": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                603
            ],
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                484
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
                484
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
                143
            ],
            "before": [
                143
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                484
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                484
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
                484
            ],
            "name": [
                265
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                484
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
                484
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                208
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
                484
            ],
            "pageLayoutId": [
                484
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
                484
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
                484
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                436
            ],
            "type": [
                272
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                484
            ],
            "status": [
                436
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                144
            ],
            "IMAP": [
                144
            ],
            "SMTP": [
                144
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
                608
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                188
            ],
            "domain": [
                1
            ],
            "id": [
                484
            ],
            "status": [
                219
            ],
            "tenantStatus": [
                220
            ],
            "unsubscribeHostnameStatus": [
                486
            ],
            "updatedAt": [
                188
            ],
            "verificationRecords": [
                586
            ],
            "verifiedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                608
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
                289
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
                289
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
                289
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
                188
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
                188
            ],
            "currentPeriodEnd": [
                188
            ],
            "expiresAt": [
                188
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
                188
            ],
            "start": [
                188
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
                289
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                188
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
                331
            ],
            "objectRecordEventsWithQueryIds": [
                361
            ],
            "queueJobEvents": [
                292
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                484
            ],
            "payload": [
                289
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
                484
            ],
            "createdAt": [
                188
            ],
            "defaultValue": [
                289
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                484
            ],
            "morphRelations": [
                412
            ],
            "name": [
                1
            ],
            "object": [
                348
            ],
            "objectMetadataId": [
                484
            ],
            "options": [
                289
            ],
            "relation": [
                412
            ],
            "settings": [
                289
            ],
            "type": [
                249
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                188
            ],
            "writability": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                608
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
                368
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                143
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
                485
            ],
            "isActive": [
                109
            ],
            "isSystem": [
                109
            ],
            "isUIEditable": [
                109
            ],
            "isUIReadOnly": [
                109
            ],
            "objectMetadataId": [
                485
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
                484
            ],
            "id": [
                484
            ],
            "objectMetadataId": [
                484
            ],
            "roleId": [
                484
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
                484
            ],
            "objectMetadataId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                608
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
                188
            ],
            "id": [
                484
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
                484
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
                188
            ],
            "fileId": [
                484
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
                188
            ],
            "id": [
                484
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
                608
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                484
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                436
            ],
            "type": [
                272
            ],
            "workspace": [
                628
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
                329
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                608
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
                484
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                59
            ],
            "applicationVariables": [
                289
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
                188
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                484
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
                484
            ],
            "updatedAt": [
                188
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
                608
            ],
            "frontComponentId": [
                484
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                484
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
                484
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
                484
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
                484
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
                484
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
                608
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
                276
            ],
            "IMAP": [
                276
            ],
            "SMTP": [
                276
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
                215
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
                67
            ],
            "workspace": [
                632
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                188
            ],
            "id": [
                484
            ],
            "indexFieldMetadataList": [
                280
            ],
            "indexType": [
                282
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
                188
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                143
            ],
            "node": [
                278
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                188
            ],
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
            ],
            "order": [
                11
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                281
            ],
            "id": [
                485
            ],
            "isCustom": [
                109
            ],
            "or": [
                281
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                484
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
                285
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
                484
            ],
            "messageThreadId": [
                484
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
                291
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                484
            ],
            "aggregateOperation": [
                19
            ],
            "axisNameDisplay": [
                75
            ],
            "color": [
                1
            ],
            "configurationType": [
                608
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
                289
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
                124
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                362
            ],
            "primaryAxisGroupByFieldMetadataId": [
                484
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                270
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                362
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                484
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                270
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
                289
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                297
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
                289
            ],
            "objectMetadataId": [
                484
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
                296
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
                484
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
                484
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                188
            ],
            "cronTriggerSettings": [
                289
            ],
            "databaseEventTriggerSettings": [
                289
            ],
            "description": [
                1
            ],
            "executionMode": [
                302
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                289
            ],
            "id": [
                484
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
                289
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
            ],
            "workflowActionTriggerSettings": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                289
            ],
            "duration": [
                11
            ],
            "error": [
                289
            ],
            "logs": [
                1
            ],
            "status": [
                304
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                484
            ],
            "applicationUniversalIdentifier": [
                484
            ],
            "id": [
                484
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                67
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
                289
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
                311
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
                312
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                313
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
                608
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                141
            ],
            "connectedAccountId": [
                484
            ],
            "contactAutoCreationPolicy": [
                317
            ],
            "createdAt": [
                188
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
                484
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                324
            ],
            "pendingGroupEmailsAction": [
                318
            ],
            "syncStage": [
                319
            ],
            "syncStageStartedAt": [
                188
            ],
            "syncStatus": [
                320
            ],
            "syncedAt": [
                188
            ],
            "throttleFailureCount": [
                11
            ],
            "throttleRetryAfter": [
                188
            ],
            "type": [
                321
            ],
            "updatedAt": [
                188
            ],
            "visibility": [
                322
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
                188
            ],
            "externalId": [
                1
            ],
            "id": [
                484
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                484
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                325
            ],
            "updatedAt": [
                188
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
                188
            ],
            "emailAddress": [
                1
            ],
            "id": [
                484
            ],
            "reason": [
                329
            ],
            "source": [
                330
            ],
            "unsubscribeTopicId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                327
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
                360
            ],
            "recordId": [
                1
            ],
            "type": [
                332
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
                484
            ],
            "property": [
                1
            ],
            "provenance": [
                336
            ],
            "recordId": [
                484
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
                484
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                136
            ],
            "objectMetadataItems": [
                340
            ],
            "views": [
                341
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
                484
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
                484
            ],
            "key": [
                600
            ],
            "objectMetadataId": [
                484
            ],
            "type": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                459,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                613,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                484,
                {
                    "threadId": [
                        484,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        484,
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
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        484
                    ],
                    "threadId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        484,
                        "UUID!"
                    ],
                    "roleId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        484,
                        "UUID!"
                    ],
                    "roleId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                70,
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
                120,
                {
                    "input": [
                        119,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                107
            ],
            "cancelSwitchBillingPlan": [
                107
            ],
            "cancelSwitchResourceCreditPrice": [
                107
            ],
            "checkCustomDomainValidRecords": [
                209
            ],
            "checkPublicDomainValidRecords": [
                209,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                101,
                {
                    "plan": [
                        92,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        465,
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
                        484,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                140,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        484,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                366,
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
                        146,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                316,
                {
                    "input": [
                        147,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                148,
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
                149,
                {
                    "input": [
                        150,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                64,
                {
                    "input": [
                        151,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                90
            ],
            "createCalendarEvent": [
                153,
                {
                    "input": [
                        152,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                9
            ],
            "createCommandMenuItem": [
                137,
                {
                    "input": [
                        154,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                207,
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
                156,
                {
                    "input": [
                        155,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                218,
                {
                    "input": [
                        157,
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
                        159,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                345,
                {
                    "inputs": [
                        164,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                594,
                {
                    "inputs": [
                        178,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                593,
                {
                    "inputs": [
                        179,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                599,
                {
                    "inputs": [
                        182,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                327,
                {
                    "input": [
                        163,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                345,
                {
                    "input": [
                        164,
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
                456,
                {
                    "input": [
                        454,
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
                        484,
                        "UUID!"
                    ],
                    "properties": [
                        289
                    ],
                    "recordId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        145,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                243,
                {
                    "input": [
                        166,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                278,
                {
                    "input": [
                        167,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                301,
                {
                    "input": [
                        162,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                348,
                {
                    "input": [
                        168,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                419,
                {
                    "createRoleInput": [
                        173,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                369,
                {
                    "input": [
                        169,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                370,
                {
                    "input": [
                        170,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                373,
                {
                    "input": [
                        171,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                390,
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
                456,
                {
                    "input": [
                        455,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                459,
                {
                    "input": [
                        174,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                90,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        92,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        465,
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
                487,
                {
                    "input": [
                        175,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                566,
                {
                    "input": [
                        176,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                585,
                {
                    "input": [
                        177,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                590,
                {
                    "input": [
                        183,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                593,
                {
                    "input": [
                        179,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                594,
                {
                    "input": [
                        178,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                595,
                {
                    "input": [
                        181,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                596,
                {
                    "input": [
                        180,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                599,
                {
                    "input": [
                        182,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                602,
                {
                    "input": [
                        184,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                606,
                {
                    "input": [
                        185,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                459,
                {
                    "id": [
                        484,
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
                316,
                {
                    "id": [
                        484,
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
                        189,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                137,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                141,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                613
            ],
            "deleteEmailGroupChannel": [
                316,
                {
                    "id": [
                        484,
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
                        484,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                345,
                {
                    "ids": [
                        484,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                345,
                {
                    "id": [
                        484,
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
                        190,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                278,
                {
                    "input": [
                        191,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                301,
                {
                    "input": [
                        305,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                348,
                {
                    "input": [
                        192,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        484,
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
                        484,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                193,
                {
                    "input": [
                        194,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                459,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                195,
                {
                    "twoFactorAuthenticationMethodId": [
                        484,
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
                        484,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                579
            ],
            "deleteUserFromWorkspace": [
                582,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                585,
                {
                    "id": [
                        484,
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
                593,
                {
                    "input": [
                        197,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                594,
                {
                    "input": [
                        196,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                595,
                {
                    "input": [
                        198,
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
                599,
                {
                    "input": [
                        199,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        200,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                606,
                {
                    "id": [
                        484,
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
                593,
                {
                    "input": [
                        203,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                594,
                {
                    "input": [
                        202,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                595,
                {
                    "input": [
                        204,
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
                599,
                {
                    "input": [
                        205,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        206,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                141,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                210,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                211,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                212,
                {
                    "input": [
                        213,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                216,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        484
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                85
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
                617
            ],
            "executeOneLogicFunction": [
                303,
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
                        484,
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
                        484,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                67
            ],
            "generateTransientToken": [
                475
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                481,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                69,
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
                69,
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
                69,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                482,
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
                267,
                {
                    "input": [
                        268,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                308,
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
                365
            ],
            "grantApplicationCapabilities": [
                38,
                {
                    "input": [
                        269,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                277,
                {
                    "userId": [
                        484,
                        "UUID!"
                    ],
                    "workspaceId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                284,
                {
                    "input": [
                        283,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                286,
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
                286
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
                        414,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                406,
                {
                    "principal": [
                        403,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        411,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        484,
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
                69,
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
                        415,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                416,
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
                446,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                137,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                370,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                373,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                470,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                439,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        484,
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
                        417,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                432,
                {
                    "input": [
                        428,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                52,
                {
                    "applicationId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                274,
                {
                    "connectionParameters": [
                        214,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        484
                    ]
                }
            ],
            "sendChatMessage": [
                439,
                {
                    "browsingContext": [
                        289
                    ],
                    "fileAttachments": [
                        255,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        484,
                        "[UUID!]"
                    ],
                    "messageId": [
                        484,
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
                        484,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                442,
                {
                    "input": [
                        441,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                445,
                {
                    "input": [
                        444,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                446,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        484
                    ]
                }
            ],
            "sendMessageCampaign": [
                448,
                {
                    "input": [
                        447,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                443,
                {
                    "input": [
                        449,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                32,
                {
                    "input": [
                        451,
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
                406,
                {
                    "accessLevel": [
                        402,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        411,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                406,
                {
                    "accessLevel": [
                        402,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        403,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        411,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                107,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                74,
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
                74,
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
                457,
                {
                    "input": [
                        458
                    ]
                }
            ],
            "signUpInWorkspace": [
                457,
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
                        484
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
                366,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "startChannelSync": [
                123,
                {
                    "connectedAccountId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                461,
                {
                    "companyContext": [
                        289
                    ],
                    "personContext": [
                        289
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                462
            ],
            "switchBillingPlan": [
                107
            ],
            "switchSubscriptionInterval": [
                107
            ],
            "syncApplication": [
                627,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        289,
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
                        289
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
                477,
                {
                    "input": [
                        476,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                479,
                {
                    "input": [
                        478,
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
                        188
                    ],
                    "threadIds": [
                        484,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                28,
                {
                    "input": [
                        490,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                316,
                {
                    "input": [
                        491,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                36,
                {
                    "id": [
                        484,
                        "UUID!"
                    ],
                    "input": [
                        492,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                54,
                {
                    "input": [
                        493,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                58,
                {
                    "input": [
                        495,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                110,
                {
                    "input": [
                        497,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                137,
                {
                    "input": [
                        499,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                316,
                {
                    "input": [
                        500,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                263,
                {
                    "input": [
                        502,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                241,
                {
                    "input": [
                        504,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                345,
                {
                    "inputs": [
                        515,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                348,
                {
                    "inputs": [
                        516,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                599,
                {
                    "inputs": [
                        538,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                316,
                {
                    "input": [
                        507,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                323,
                {
                    "input": [
                        509,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                323,
                {
                    "input": [
                        511,
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
                345,
                {
                    "input": [
                        515,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        489,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        484
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
                        514,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        505,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                348,
                {
                    "input": [
                        516,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                419,
                {
                    "updateRoleInput": [
                        523,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        517,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                370,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        518,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                373,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        520,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        522,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                287,
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
                459,
                {
                    "input": [
                        525,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                470,
                {
                    "input": [
                        526,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                487,
                {
                    "input": [
                        527,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                566,
                {
                    "input": [
                        528,
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
                585,
                {
                    "input": [
                        529,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                590,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        540,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                593,
                {
                    "input": [
                        533,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                594,
                {
                    "input": [
                        531,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                595,
                {
                    "input": [
                        536,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                596,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        535,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                599,
                {
                    "input": [
                        538,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                602,
                {
                    "input": [
                        541,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                606,
                {
                    "input": [
                        543,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                613,
                {
                    "data": [
                        546,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                613,
                {
                    "data": [
                        545,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                622,
                {
                    "roleId": [
                        484,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        547,
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
                    "hasUserApprovedRoleGrants": [
                        4
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
                        548,
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
                        548,
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
                        548,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                258,
                {
                    "file": [
                        548,
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
                        548,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                258,
                {
                    "file": [
                        548,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                250,
                {
                    "upsertFieldPermissionsInput": [
                        549,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                590,
                {
                    "input": [
                        552,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                356,
                {
                    "upsertObjectPermissionsInput": [
                        553,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                420,
                {
                    "upsertPermissionFlagsInput": [
                        554,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                556,
                {
                    "input": [
                        555,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                590,
                {
                    "input": [
                        557,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                64,
                {
                    "input": [
                        583,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                587,
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
                74,
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
                218,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                588,
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
                484
            ],
            "color": [
                1
            ],
            "createdAt": [
                188
            ],
            "folderId": [
                484
            ],
            "icon": [
                1
            ],
            "id": [
                484
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                484
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                484
            ],
            "targetRecordId": [
                484
            ],
            "targetRecordIdentifier": [
                399
            ],
            "type": [
                346
            ],
            "updatedAt": [
                188
            ],
            "userWorkspaceId": [
                484
            ],
            "viewId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                484
            ],
            "color": [
                1
            ],
            "createdAt": [
                188
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                351,
                {
                    "filter": [
                        248,
                        "FieldFilter!"
                    ],
                    "paging": [
                        186,
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
                484
            ],
            "imageIdentifierFieldMetadataId": [
                484
            ],
            "indexMetadataList": [
                278
            ],
            "indexMetadatas": [
                353,
                {
                    "filter": [
                        281,
                        "IndexFilter!"
                    ],
                    "paging": [
                        186,
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
                484
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
                355
            ],
            "readability": [
                333
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                484
            ],
            "searchFieldMetadataList": [
                438
            ],
            "sharingReach": [
                363
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                188
            ],
            "writability": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                350
            ],
            "pageInfo": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                143
            ],
            "node": [
                348
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
                368
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                352
            ],
            "id": [
                485
            ],
            "isActive": [
                109
            ],
            "isRemote": [
                109
            ],
            "isSearchable": [
                109
            ],
            "isSystem": [
                109
            ],
            "isUICreatable": [
                109
            ],
            "isUIEditable": [
                109
            ],
            "isUIReadOnly": [
                109
            ],
            "or": [
                352
            ],
            "universalIdentifier": [
                485
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                279
            ],
            "pageInfo": [
                368
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                484
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
                484
            ],
            "restrictedFields": [
                289
            ],
            "rowLevelPermissionPredicateGroups": [
                423
            ],
            "rowLevelPermissionPredicates": [
                422
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
                484
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
                187
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                360
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
                289
            ],
            "before": [
                289
            ],
            "diff": [
                289
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
                359
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
                364
            ],
            "previousOnboardingStatus": [
                364
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
                143
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                143
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                484
            ],
            "createdAt": [
                188
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                484
            ],
            "deletedAt": [
                188
            ],
            "id": [
                484
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
                484
            ],
            "tabs": [
                370
            ],
            "type": [
                372
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                484
            ],
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                371
            ],
            "pageLayoutId": [
                484
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
            ],
            "widgets": [
                373
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                484
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                289
            ],
            "configuration": [
                607
            ],
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "gridPosition": [
                271
            ],
            "id": [
                484
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
                484
            ],
            "pageLayoutTabId": [
                484
            ],
            "position": [
                376
            ],
            "title": [
                1
            ],
            "type": [
                609
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                371
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
                371
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
                374
            ],
            "on_PageLayoutWidgetGridPosition": [
                375
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                378
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                377
            ],
            "index": [
                8
            ],
            "layoutMode": [
                371
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
                484
            ],
            "createdAt": [
                188
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                484
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                484
            ],
            "aggregateOperation": [
                19
            ],
            "color": [
                1
            ],
            "configurationType": [
                608
            ],
            "dateGranularity": [
                362
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
                289
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupByFieldMetadataId": [
                484
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
                124
            ],
            "orderBy": [
                270
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
                385
            ],
            "formattedToRawLookup": [
                289
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
                289
            ],
            "objectMetadataId": [
                484
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
                300
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
                484
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
                215
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
                484
            ],
            "createdAt": [
                188
            ],
            "domain": [
                1
            ],
            "id": [
                484
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
                392
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
                389
            ],
            "IMAP": [
                389
            ],
            "SMTP": [
                389
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                65
            ],
            "authProviders": [
                66
            ],
            "displayName": [
                1
            ],
            "id": [
                484
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                631
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
                484
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
                        484,
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
                        266,
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
                        298
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
                316,
                {
                    "filter": [
                        299
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                39,
                {
                    "applicationId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                40,
                {
                    "applicationId": [
                        484,
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
                437,
                {
                    "applicationId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "applicationUpgradeRoleGrants": [
                60,
                {
                    "applicationId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                77,
                {
                    "input": [
                        78,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                101,
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
                484,
                {
                    "calendarEventId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                126,
                {
                    "threadId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                129,
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
                621,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                463,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                137,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                137
            ],
            "currentUser": [
                579
            ],
            "currentUserApplicationAuthorizations": [
                37
            ],
            "currentUserSessions": [
                581
            ],
            "currentWorkspace": [
                613
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
                        484,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                243,
                {
                    "id": [
                        484,
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
                        186,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                388,
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
                130,
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
                292,
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
                301
            ],
            "findManyMarketplaceApps": [
                309,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                390
            ],
            "findMarketplaceAppDetail": [
                310,
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
                        484
                    ],
                    "universalIdentifier": [
                        484
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
                301,
                {
                    "input": [
                        305,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                292,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                615
            ],
            "findWorkspaceFromInviteHash": [
                613,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                620
            ],
            "frontComponent": [
                263,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                263
            ],
            "getAddressDetails": [
                386,
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
                419
            ],
            "getApprovedAccessDomains": [
                64
            ],
            "getAutoCompleteAddress": [
                71,
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
                289,
                {
                    "input": [
                        305,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                142,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                218
            ],
            "getInviteSuggestions": [
                288
            ],
            "getJobs": [
                292,
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
                        305,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                370,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                370,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                373,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                373,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                369,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        372
                    ]
                }
            ],
            "getPermissionFlags": [
                380
            ],
            "getPublicWorkspaceDataByDomain": [
                394,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                395,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                100
            ],
            "getRole": [
                419,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                419
            ],
            "getSSOIdentityProviders": [
                260
            ],
            "getToolIndex": [
                474
            ],
            "getToolInputSchema": [
                289,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                563,
                {
                    "input": [
                        564
                    ]
                }
            ],
            "getView": [
                590,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                593,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                594,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                594,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                593,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                595,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                596,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                596,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                595,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                599,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                599,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                602,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                602,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                590,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        604,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                618
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
                294,
                {
                    "input": [
                        295,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                91
            ],
            "messageSuppressions": [
                328,
                {
                    "input": [
                        261,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                334,
                {
                    "input": [
                        337,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                339
            ],
            "mostlyEmptyFieldMetadataIds": [
                484,
                {
                    "objectMetadataId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                110,
                {
                    "connectedAccountId": [
                        484
                    ]
                }
            ],
            "myConnectedAccounts": [
                141
            ],
            "myMessageChannels": [
                316,
                {
                    "connectedAccountId": [
                        484
                    ]
                }
            ],
            "myMessageFolders": [
                323,
                {
                    "messageChannelId": [
                        484
                    ]
                }
            ],
            "myUserApplicationVariables": [
                623
            ],
            "navigationMenuItem": [
                345,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                345
            ],
            "object": [
                348,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                358
            ],
            "objects": [
                349,
                {
                    "filter": [
                        352,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        186,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                383,
                {
                    "input": [
                        384,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                118,
                {
                    "input": [
                        387,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                310,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                309,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                401,
                {
                    "targets": [
                        411,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                406,
                {
                    "target": [
                        411,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                459,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                459
            ],
            "timelineActivityTypes": [
                470
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                483,
                {
                    "userId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                487
            ],
            "usageLimits": [
                566
            ],
            "usageQuotaDefinitions": [
                570
            ],
            "usageQuotaScopeConsumption": [
                572,
                {
                    "input": [
                        573,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                574
            ],
            "validatePasswordResetToken": [
                584,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                585,
                {
                    "objectMetadataId": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                606,
                {
                    "id": [
                        484,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                606
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                484
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
                484
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
                484
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
                484
            ],
            "permissions": [
                400
            ],
            "recordId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                484
            ],
            "workspaceMemberId": [
                484
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
                402
            ],
            "generalAccessLevel": [
                402
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                400
            ],
            "roles": [
                409
            ],
            "shares": [
                407
            ],
            "sharingMode": [
                408
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                402
            ],
            "id": [
                10
            ],
            "principalId": [
                484
            ],
            "principalRoleId": [
                484
            ],
            "principalType": [
                404
            ],
            "rowCause": [
                405
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
                484
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
                608
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
                484
            ],
            "recordId": [
                484
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
                348
            ],
            "targetFieldMetadata": [
                243
            ],
            "targetObjectMetadata": [
                348
            ],
            "type": [
                413
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
                484
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
                250
            ],
            "icon": [
                1
            ],
            "id": [
                484
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                356
            ],
            "permissionFlags": [
                420
            ],
            "rowLevelPermissionPredicateGroups": [
                423
            ],
            "rowLevelPermissionPredicates": [
                422
            ],
            "universalIdentifier": [
                484
            ],
            "workspaceMembers": [
                622
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
                484
            ],
            "roleId": [
                484
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
                427
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
                289
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
                425
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
                484
            ],
            "logicalOperator": [
                425
            ],
            "objectMetadataId": [
                484
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                484
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
                484
            ],
            "id": [
                484
            ],
            "operand": [
                427
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                484
            ],
            "subFieldName": [
                1
            ],
            "value": [
                289
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
                430
            ],
            "messages": [
                430
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                484
            ],
            "thread": [
                433
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                484
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
                429
            ],
            "content": [
                1
            ],
            "role": [
                431
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
                289
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                484
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
                484
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                436
            ],
            "type": [
                272
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                484
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                436
            ],
            "type": [
                272
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
                188
            ],
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                484
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                484
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
                440
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
                289
            ],
            "workspaceMemberId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                484
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
                620
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
                188
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                118
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
                289
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                484
            ],
            "createdAt": [
                188
            ],
            "frontComponentId": [
                484
            ],
            "icon": [
                1
            ],
            "id": [
                484
            ],
            "position": [
                11
            ],
            "scope": [
                453
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
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
                484
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
                484
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                436
            ],
            "type": [
                272
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                67
            ],
            "workspace": [
                632
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
                484
            ],
            "content": [
                1
            ],
            "createdAt": [
                188
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                188
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                418
            ],
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                630
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
                398,
                {
                    "input": [
                        172,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                306,
                {
                    "input": [
                        307,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        484,
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
                468
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
                608
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
                484
            ],
            "createdAt": [
                188
            ],
            "emit": [
                471
            ],
            "frontComponentUniversalIdentifier": [
                484
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                484
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                484
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                484
            ],
            "on": [
                1
            ],
            "through": [
                472
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                484
            ],
            "relationFieldUniversalIdentifier": [
                484
            ],
            "triggerFieldUniversalIdentifiers": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                608
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
                289
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
                67
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                188
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
                68
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
                188
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                484
            ],
            "gt": [
                484
            ],
            "gte": [
                484
            ],
            "iLike": [
                484
            ],
            "in": [
                484
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                484
            ],
            "lt": [
                484
            ],
            "lte": [
                484
            ],
            "neq": [
                484
            ],
            "notILike": [
                484
            ],
            "notIn": [
                484
            ],
            "notLike": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                188
            ],
            "description": [
                1
            ],
            "id": [
                484
            ],
            "name": [
                1
            ],
            "updatedAt": [
                188
            ],
            "visibility": [
                488
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
                484
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                289
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
                289
            ],
            "roleId": [
                484
            ],
            "triggers": [
                289
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
                484
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
                484
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                322
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
                494
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
                496
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
                484
            ],
            "update": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                111
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                484
            ],
            "availabilityType": [
                138
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
                484
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                484
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                289
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
                289
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                484
            ],
            "options": [
                289
            ],
            "settings": [
                289
            ],
            "translations": [
                335
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
                484
            ],
            "update": [
                503
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
                484
            ],
            "update": [
                506
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                289
            ],
            "databaseEventTriggerSettings": [
                289
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                289
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
                289
            ],
            "workflowActionTriggerSettings": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                484
            ],
            "update": [
                508
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                317
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
                324
            ],
            "visibility": [
                322
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                484
            ],
            "update": [
                510
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
                484
            ],
            "update": [
                510
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
                484
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
                484
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
                484
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
                484
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
                355
            ],
            "readability": [
                333
            ],
            "sharingReach": [
                363
            ],
            "shortcut": [
                1
            ],
            "translations": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                484
            ],
            "update": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                484
            ],
            "update": [
                512
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                484
            ],
            "update": [
                513
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
                484
            ],
            "type": [
                372
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
                371
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
                484
            ],
            "layoutMode": [
                371
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                521
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
                289
            ],
            "configuration": [
                289
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                484
            ],
            "pageLayoutTabId": [
                484
            ],
            "position": [
                289
            ],
            "title": [
                1
            ],
            "type": [
                609
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
                289
            ],
            "configuration": [
                289
            ],
            "id": [
                484
            ],
            "objectMetadataId": [
                484
            ],
            "pageLayoutTabId": [
                484
            ],
            "position": [
                289
            ],
            "title": [
                1
            ],
            "type": [
                609
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
                484
            ],
            "tabs": [
                519
            ],
            "type": [
                372
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                484
            ],
            "update": [
                524
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
                484
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
                484
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                335
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
                488
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                484
            ],
            "payload": [
                176
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                484
            ],
            "update": [
                530
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
                484
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
                484
            ],
            "update": [
                532
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
                484
            ],
            "update": [
                534
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                484
            ],
            "logicalOperator": [
                597
            ],
            "parentViewFilterGroupId": [
                484
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                484
            ],
            "update": [
                537
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                484
            ],
            "operand": [
                598
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                484
            ],
            "subFieldName": [
                1
            ],
            "value": [
                289
            ],
            "viewFilterGroupId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                484
            ],
            "update": [
                539
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                484
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
                484
            ],
            "calendarFieldMetadataId": [
                484
            ],
            "calendarLayout": [
                591
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                484
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                484
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                484
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                601
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                604
            ],
            "visibility": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                484
            ],
            "update": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                603
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
                484
            ],
            "update": [
                544
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
                289
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                484
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
                619
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                289
            ],
            "workspaceMemberId": [
                484
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                484
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                550
            ],
            "id": [
                484
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
                550
            ],
            "groups": [
                551
            ],
            "widgetId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                357
            ],
            "roleId": [
                484
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                484
            ],
            "predicateGroups": [
                424
            ],
            "predicates": [
                426
            ],
            "roleId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                423
            ],
            "predicates": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                561
            ],
            "viewFields": [
                558
            ],
            "viewFilterGroups": [
                559
            ],
            "viewFilters": [
                560
            ],
            "viewSorts": [
                562
            ],
            "widgetId": [
                484
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
                484
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
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                484
            ],
            "logicalOperator": [
                597
            ],
            "parentViewFilterGroupId": [
                484
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
                484
            ],
            "id": [
                484
            ],
            "operand": [
                598
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                484
            ],
            "subFieldName": [
                1
            ],
            "value": [
                289
            ],
            "viewFilterGroupId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                484
            ],
            "calendarFieldMetadataId": [
                484
            ],
            "calendarLayout": [
                591
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                484
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                484
            ],
            "openRecordIn": [
                601
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                603
            ],
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                188
            ],
            "periodStart": [
                188
            ],
            "timeSeries": [
                576
            ],
            "usageByApplication": [
                565
            ],
            "usageByModel": [
                565
            ],
            "usageByOperationType": [
                565
            ],
            "usageByUser": [
                565
            ],
            "userDailyUsage": [
                578
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                568
            ],
            "periodEnd": [
                188
            ],
            "periodStart": [
                188
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
                82
            ],
            "createdAt": [
                188
            ],
            "id": [
                484
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                82
            ],
            "operationType": [
                568
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                575
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                577
            ],
            "updatedAt": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                577
            ],
            "operationType": [
                568
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                567
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                571
            ],
            "resourceType": [
                575
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                569
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
                568
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                577
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                82
            ],
            "periodEnd": [
                188
            ],
            "periodStart": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                568
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                575
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                577
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                82
            ],
            "id": [
                484
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                82
            ],
            "operationType": [
                568
            ],
            "periodEnd": [
                188
            ],
            "periodStart": [
                188
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                82
            ],
            "resourceType": [
                575
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
                577
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
                576
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
                73
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                188
            ],
            "currentUserWorkspace": [
                582
            ],
            "currentWorkspace": [
                613
            ],
            "deletedAt": [
                188
            ],
            "deletedWorkspaceMembers": [
                201
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
                484
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
                364
            ],
            "previousOnboardingStatus": [
                364
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                188
            ],
            "userVars": [
                290
            ],
            "userWorkspaces": [
                582
            ],
            "workspaceMember": [
                622
            ],
            "workspaceMembers": [
                622
            ],
            "workspaces": [
                582
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
                289
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
                188
            ],
            "expiresAt": [
                188
            ],
            "id": [
                484
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
                188
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "id": [
                484
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                356
            ],
            "objectsPermissions": [
                356
            ],
            "permissionFlags": [
                381
            ],
            "twoFactorAuthenticationMethodSummary": [
                480
            ],
            "updatedAt": [
                188
            ],
            "user": [
                579
            ],
            "userId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                484
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
                484
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
                484
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                484
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
                67
            ],
            "workspaceUrls": [
                631
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
                484
            ],
            "calendarEndFieldMetadataId": [
                484
            ],
            "calendarFieldMetadataId": [
                484
            ],
            "calendarLayout": [
                591
            ],
            "createdAt": [
                188
            ],
            "createdByUserWorkspaceId": [
                484
            ],
            "deletedAt": [
                188
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                484
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
                484
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                600
            ],
            "mainGroupByFieldMetadataId": [
                484
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                484
            ],
            "openRecordIn": [
                601
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                604
            ],
            "universalIdentifier": [
                484
            ],
            "updatedAt": [
                188
            ],
            "viewFieldGroups": [
                594
            ],
            "viewFields": [
                593
            ],
            "viewFilterGroups": [
                596
            ],
            "viewFilters": [
                595
            ],
            "viewGroups": [
                599
            ],
            "viewSorts": [
                602
            ],
            "visibility": [
                605
            ],
            "workspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                608
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
                484
            ],
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
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
                484
            ],
            "updatedAt": [
                188
            ],
            "viewFieldGroupId": [
                484
            ],
            "viewId": [
                484
            ],
            "workspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "id": [
                484
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
                188
            ],
            "viewFields": [
                593
            ],
            "viewId": [
                484
            ],
            "workspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
            ],
            "operand": [
                598
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                484
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                188
            ],
            "value": [
                289
            ],
            "viewFilterGroupId": [
                484
            ],
            "viewId": [
                484
            ],
            "workspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "id": [
                484
            ],
            "logicalOperator": [
                597
            ],
            "parentViewFilterGroupId": [
                484
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                188
            ],
            "viewId": [
                484
            ],
            "workspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "fieldValue": [
                1
            ],
            "id": [
                484
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "updatedAt": [
                188
            ],
            "viewId": [
                484
            ],
            "workspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "direction": [
                603
            ],
            "fieldMetadataId": [
                484
            ],
            "id": [
                484
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                188
            ],
            "viewId": [
                484
            ],
            "workspaceId": [
                484
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
                484
            ],
            "createdAt": [
                188
            ],
            "deletedAt": [
                188
            ],
            "description": [
                1
            ],
            "id": [
                484
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
                188
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
                76
            ],
            "on_CalendarConfiguration": [
                115
            ],
            "on_CallRecordingSummaryConfiguration": [
                116
            ],
            "on_CallRecordingTranscriptConfiguration": [
                117
            ],
            "on_ChatConfiguration": [
                125
            ],
            "on_ChatThreadsConfiguration": [
                128
            ],
            "on_EmailThreadConfiguration": [
                217
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
                273
            ],
            "on_LineChartConfiguration": [
                293
            ],
            "on_MessageCampaignBodyConfiguration": [
                314
            ],
            "on_MessageCampaignDetailsConfiguration": [
                315
            ],
            "on_NotesConfiguration": [
                347
            ],
            "on_PieChartConfiguration": [
                382
            ],
            "on_RecordTableConfiguration": [
                410
            ],
            "on_StandaloneRichTextConfiguration": [
                460
            ],
            "on_TasksConfiguration": [
                469
            ],
            "on_TimelineConfiguration": [
                473
            ],
            "on_ViewConfiguration": [
                592
            ],
            "on_WorkflowConfiguration": [
                610
            ],
            "on_WorkflowRunConfiguration": [
                611
            ],
            "on_WorkflowVersionConfiguration": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                614
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
                289
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                84
            ],
            "billingEntitlements": [
                86
            ],
            "billingSubscriptions": [
                102
            ],
            "createdAt": [
                188
            ],
            "currentBillingSubscription": [
                102
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                419
            ],
            "deletedAt": [
                188
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
                484
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
                484
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
                188
            ],
            "viewFields": [
                593
            ],
            "viewFilterGroups": [
                596
            ],
            "viewFilters": [
                595
            ],
            "viewGroups": [
                599
            ],
            "viewSorts": [
                602
            ],
            "views": [
                590
            ],
            "workspaceCustomApplication": [
                36
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                619
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                631
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
                289
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                616
            ],
            "personEnrichment": [
                289
            ],
            "personOutcome": [
                629
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
                188
            ],
            "id": [
                484
            ],
            "roleId": [
                484
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
                624
            ],
            "id": [
                484
            ],
            "locale": [
                1
            ],
            "name": [
                265
            ],
            "numberFormat": [
                625
            ],
            "openRecordIn": [
                367
            ],
            "roles": [
                419
            ],
            "timeFormat": [
                626
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
                484
            ],
            "userWorkspaceId": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                484
            ],
            "variables": [
                580
            ],
            "workspaceMemberId": [
                484
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
                289
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
                484
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
                484
            ],
            "workspaceUrls": [
                631
            ],
            "__typename": [
                1
            ]
        }
    }
}