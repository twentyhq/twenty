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
        62,
        74,
        78,
        79,
        81,
        86,
        91,
        97,
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
        221,
        231,
        237,
        241,
        245,
        248,
        255,
        269,
        271,
        281,
        288,
        289,
        290,
        301,
        303,
        316,
        317,
        318,
        319,
        320,
        321,
        323,
        324,
        325,
        328,
        329,
        331,
        332,
        335,
        337,
        341,
        345,
        354,
        361,
        362,
        363,
        366,
        370,
        371,
        376,
        380,
        401,
        403,
        404,
        407,
        412,
        424,
        426,
        430,
        435,
        452,
        464,
        465,
        467,
        483,
        485,
        487,
        547,
        567,
        574,
        576,
        590,
        596,
        597,
        599,
        600,
        602,
        603,
        604,
        607,
        608,
        613,
        615,
        618,
        623,
        624,
        625,
        628,
        629
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
                288
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
                483
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
                483
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
                288
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
                288
            ],
            "roleId": [
                483
            ],
            "triggers": [
                288
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
                288
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
                187
            ],
            "deletedAt": [
                187
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
                483
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
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                483
            ],
            "createdAt": [
                187
            ],
            "id": [
                483
            ],
            "parts": [
                14
            ],
            "processedAt": [
                187
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                483
            ],
            "status": [
                1
            ],
            "threadId": [
                483
            ],
            "turnId": [
                483
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
                483
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                483
            ],
            "messageId": [
                483
            ],
            "orderIndex": [
                7
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                288
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
                288
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                288
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
                10
            ],
            "endedAt": [
                187
            ],
            "errorMessage": [
                1
            ],
            "id": [
                483
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
                187
            ],
            "status": [
                16
            ],
            "threadId": [
                483
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
                483
            ],
            "aggregateOperation": [
                18
            ],
            "configurationType": [
                607
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                288
            ],
            "firstDayOfTheWeek": [
                7
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
                396
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
                81
            ],
            "kind": [
                1
            ],
            "limitValue": [
                81
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
                187
            ],
            "expiresAt": [
                187
            ],
            "id": [
                483
            ],
            "name": [
                1
            ],
            "revokedAt": [
                187
            ],
            "role": [
                418
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
                483
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
                288
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
                483
            ],
            "role": [
                325
            ],
            "workspaceMemberId": [
                483
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
                483
            ],
            "applicationVariables": [
                61
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                288
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                136
            ],
            "defaultLogicFunctionRole": [
                418
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                262
            ],
            "healthCheckLogicFunctionId": [
                483
            ],
            "id": [
                483
            ],
            "logicFunctions": [
                300
            ],
            "logoFileId": [
                483
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                347
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                483
            ],
            "settingsCustomTabFrontComponentId": [
                483
            ],
            "settingsMenuItems": [
                451
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                483
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
                483
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
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                483
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
                392
            ],
            "connectionProviderId": [
                483
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
                483
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
                483
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
                483
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
                288
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
                483
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
                255
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
                255
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
                187
            ],
            "fileFolder": [
                255
            ],
            "fileId": [
                483
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
                187
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                483
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
                483
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
                187
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
                588
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                483
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
                187
            ],
            "description": [
                1
            ],
            "id": [
                483
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
                288
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
                66
            ],
            "applicationRefreshToken": [
                66
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
                60
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
                483
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
                288
            ],
            "scope": [
                62
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
                483
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
                434
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
                66
            ],
            "refreshToken": [
                66
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                67
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
                483
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
                433
            ],
            "workspaceUrls": [
                630
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                71
            ],
            "availableWorkspacesForSignUp": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                72
            ],
            "tokens": [
                67
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                483
            ],
            "aggregateOperation": [
                18
            ],
            "axisNameDisplay": [
                74
            ],
            "color": [
                1
            ],
            "configurationType": [
                607
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
                288
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupMode": [
                78
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                79
            ],
            "numberFormat": [
                123
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                361
            ],
            "primaryAxisGroupByFieldMetadataId": [
                483
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                269
            ],
            "rangeMax": [
                10
            ],
            "rangeMin": [
                10
            ],
            "secondaryAxisGroupByDateGranularity": [
                361
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                483
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                269
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
                288
            ],
            "formattedToRawLookup": [
                288
            ],
            "groupMode": [
                78
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
                79
            ],
            "series": [
                80
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
                288
            ],
            "objectMetadataId": [
                483
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
                483
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
                101
            ],
            "currentBillingSubscription": [
                101
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                465
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                86
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
                98
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
        "BillingMeteredProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                98
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
                87
            ],
            "meteredProducts": [
                88
            ],
            "planKey": [
                91
            ],
            "resourceCreditProducts": [
                87
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
                107
            ],
            "recurringInterval": [
                464
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
                107
            ],
            "recurringInterval": [
                464
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                94
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
                98
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
                98
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                87
            ],
            "on_BillingMeteredProduct": [
                88
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
                91
            ],
            "priceUsageBased": [
                107
            ],
            "productKey": [
                97
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
                187
            ],
            "periodStart": [
                187
            ],
            "productKey": [
                97
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
                102
            ],
            "cancelAt": [
                187
            ],
            "currentPeriodEnd": [
                187
            ],
            "id": [
                483
            ],
            "interval": [
                464
            ],
            "metadata": [
                288
            ],
            "phases": [
                103
            ],
            "status": [
                465
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                96
            ],
            "creditAmount": [
                10
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                483
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
                104
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
                101
            ],
            "currentBillingSubscription": [
                101
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
                483
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
                483
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
                10
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
                607
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                607
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
                607
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                288
            ],
            "error": [
                126
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
                607
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
                341
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                343
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
                26
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                65
            ],
            "billing": [
                82
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
                390
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                449
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                466
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
                483
            ],
            "availabilityObjectMetadataId": [
                483
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
                483
            ],
            "createdAt": [
                187
            ],
            "engineComponentKey": [
                221
            ],
            "frontComponent": [
                262
            ],
            "frontComponentId": [
                483
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                483
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
                483
            ],
            "pageLayoutId": [
                483
            ],
            "payload": [
                138
            ],
            "position": [
                10
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                483
            ],
            "updatedAt": [
                187
            ],
            "workflowVersionId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                353
            ],
            "on_PathCommandMenuItemPayload": [
                378
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
                253
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                483
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
                392
            ],
            "connectionProviderId": [
                483
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
                483
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
                483
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
                274
            ],
            "handle": [
                1
            ],
            "id": [
                483
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                483
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
                288
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
                288
            ],
            "roleId": [
                483
            ],
            "triggers": [
                288
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                483
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                321
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
                483
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
                483
            ],
            "engineComponentKey": [
                221
            ],
            "frontComponentId": [
                483
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
                483
            ],
            "pageLayoutId": [
                483
            ],
            "payload": [
                288
            ],
            "position": [
                10
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                483
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
                315
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
                288
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
                288
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                483
            ],
            "options": [
                288
            ],
            "relationCreationPayload": [
                288
            ],
            "settings": [
                288
            ],
            "type": [
                248
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
                483
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
                483
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
                281
            ],
            "objectMetadataId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                288
            ],
            "databaseEventTriggerSettings": [
                288
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                288
            ],
            "id": [
                483
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                288
            ],
            "source": [
                288
            ],
            "timeoutSeconds": [
                10
            ],
            "toolTriggerSettings": [
                288
            ],
            "universalIdentifier": [
                483
            ],
            "workflowActionTriggerSettings": [
                288
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
                483
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
                483
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                483
            ],
            "position": [
                10
            ],
            "targetObjectMetadataId": [
                483
            ],
            "targetRecordId": [
                483
            ],
            "type": [
                345
            ],
            "userWorkspaceId": [
                483
            ],
            "viewId": [
                483
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
                288
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
                483
            ],
            "type": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                370
            ],
            "pageLayoutId": [
                483
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
                288
            ],
            "objectMetadataId": [
                483
            ],
            "pageLayoutTabId": [
                483
            ],
            "position": [
                288
            ],
            "title": [
                1
            ],
            "type": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                483
            ],
            "filter": [
                288
            ],
            "objectMetadataId": [
                483
            ],
            "orderBy": [
                288
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
                483
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                81
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                81
            ],
            "operationType": [
                567
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                574
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                576
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
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                483
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
                483
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
                483
            ],
            "id": [
                483
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
                483
            ],
            "viewId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                483
            ],
            "logicalOperator": [
                596
            ],
            "parentViewFilterGroupId": [
                483
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "viewId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                483
            ],
            "id": [
                483
            ],
            "operand": [
                597
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                483
            ],
            "subFieldName": [
                1
            ],
            "value": [
                288
            ],
            "viewFilterGroupId": [
                483
            ],
            "viewId": [
                483
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
                483
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "viewId": [
                483
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
                483
            ],
            "calendarFieldMetadataId": [
                483
            ],
            "calendarLayout": [
                590
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                18
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                483
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                599
            ],
            "mainGroupByFieldMetadataId": [
                483
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                483
            ],
            "openRecordIn": [
                600
            ],
            "position": [
                10
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                603
            ],
            "visibility": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                602
            ],
            "fieldMetadataId": [
                483
            ],
            "id": [
                483
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                483
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
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                483
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
                483
            ],
            "name": [
                264
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                483
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
                483
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
                483
            ],
            "pageLayoutId": [
                483
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
                483
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
                483
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                435
            ],
            "type": [
                271
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                483
            ],
            "status": [
                435
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
                607
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
                483
            ],
            "status": [
                218
            ],
            "tenantStatus": [
                219
            ],
            "unsubscribeHostnameStatus": [
                485
            ],
            "updatedAt": [
                187
            ],
            "verificationRecords": [
                585
            ],
            "verifiedAt": [
                187
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                607
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
                288
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
                288
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
                223
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                288
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
                231
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
                229
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                230
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
                232
            ],
            "first": [
                7
            ],
            "table": [
                237
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                233
            ],
            "records": [
                236
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
                288
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
                330
            ],
            "objectRecordEventsWithQueryIds": [
                360
            ],
            "queueJobEvents": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                483
            ],
            "payload": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                241
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
                483
            ],
            "createdAt": [
                187
            ],
            "defaultValue": [
                288
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                483
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
                483
            ],
            "morphRelations": [
                411
            ],
            "name": [
                1
            ],
            "object": [
                347
            ],
            "objectMetadataId": [
                483
            ],
            "options": [
                288
            ],
            "relation": [
                411
            ],
            "settings": [
                288
            ],
            "type": [
                248
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                187
            ],
            "writability": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                607
            ],
            "fieldDisplayMode": [
                245
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
                246
            ],
            "pageInfo": [
                367
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
                242
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                247
            ],
            "id": [
                484
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
                484
            ],
            "or": [
                247
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
                483
            ],
            "id": [
                483
            ],
            "objectMetadataId": [
                483
            ],
            "roleId": [
                483
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
                483
            ],
            "objectMetadataId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                607
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
                483
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
                483
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
                483
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
                483
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
                607
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                483
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                435
            ],
            "type": [
                271
            ],
            "workspace": [
                627
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
                328
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                607
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
                483
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                58
            ],
            "applicationVariables": [
                288
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
                483
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
                483
            ],
            "updatedAt": [
                187
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
                607
            ],
            "frontComponentId": [
                483
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                483
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
                483
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
                483
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
                483
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
                483
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
                607
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
                275
            ],
            "IMAP": [
                275
            ],
            "SMTP": [
                275
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
                66
            ],
            "workspace": [
                631
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
                483
            ],
            "indexFieldMetadataList": [
                279
            ],
            "indexType": [
                281
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
                277
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
                483
            ],
            "id": [
                483
            ],
            "order": [
                10
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
                280
            ],
            "id": [
                484
            ],
            "isCustom": [
                108
            ],
            "or": [
                280
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                483
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
                284
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
                483
            ],
            "messageThreadId": [
                483
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
                290
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                483
            ],
            "aggregateOperation": [
                18
            ],
            "axisNameDisplay": [
                74
            ],
            "color": [
                1
            ],
            "configurationType": [
                607
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
                288
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
                123
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                361
            ],
            "primaryAxisGroupByFieldMetadataId": [
                483
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                269
            ],
            "rangeMax": [
                10
            ],
            "rangeMin": [
                10
            ],
            "secondaryAxisGroupByDateGranularity": [
                361
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                483
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                269
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
                288
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                296
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
                288
            ],
            "objectMetadataId": [
                483
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
                295
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
                483
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
                483
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                187
            ],
            "cronTriggerSettings": [
                288
            ],
            "databaseEventTriggerSettings": [
                288
            ],
            "description": [
                1
            ],
            "executionMode": [
                301
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                288
            ],
            "id": [
                483
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
                288
            ],
            "universalIdentifier": [
                483
            ],
            "updatedAt": [
                187
            ],
            "workflowActionTriggerSettings": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                288
            ],
            "duration": [
                10
            ],
            "error": [
                288
            ],
            "logs": [
                1
            ],
            "status": [
                303
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                483
            ],
            "applicationUniversalIdentifier": [
                483
            ],
            "id": [
                483
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                66
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
                288
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
                310
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
                311
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                312
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
                607
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                607
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
                483
            ],
            "contactAutoCreationPolicy": [
                316
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
                483
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                323
            ],
            "pendingGroupEmailsAction": [
                317
            ],
            "syncStage": [
                318
            ],
            "syncStageStartedAt": [
                187
            ],
            "syncStatus": [
                319
            ],
            "syncedAt": [
                187
            ],
            "throttleFailureCount": [
                10
            ],
            "throttleRetryAfter": [
                187
            ],
            "type": [
                320
            ],
            "updatedAt": [
                187
            ],
            "visibility": [
                321
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
                483
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                483
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                324
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
                483
            ],
            "reason": [
                328
            ],
            "source": [
                329
            ],
            "unsubscribeTopicId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                326
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
                359
            ],
            "recordId": [
                1
            ],
            "type": [
                331
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
                483
            ],
            "property": [
                1
            ],
            "provenance": [
                335
            ],
            "recordId": [
                483
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
                483
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                483
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
                339
            ],
            "views": [
                340
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
                483
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
                483
            ],
            "key": [
                599
            ],
            "objectMetadataId": [
                483
            ],
            "type": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                458,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                612,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                483,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        483,
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
                11,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        483
                    ],
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        483,
                        "UUID!"
                    ],
                    "roleId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        483,
                        "UUID!"
                    ],
                    "roleId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                69,
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
                100,
                {
                    "plan": [
                        91,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        464,
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
                        483,
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
                        483,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                365,
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
                257,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                257,
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
                257,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                257,
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
                        145,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                315,
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
                        48,
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
                63,
                {
                    "input": [
                        150,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                89
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
                8
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
                256,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        255,
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
                262,
                {
                    "input": [
                        158,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                344,
                {
                    "inputs": [
                        163,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                593,
                {
                    "inputs": [
                        177,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                592,
                {
                    "inputs": [
                        178,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                598,
                {
                    "inputs": [
                        181,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                326,
                {
                    "input": [
                        162,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                344,
                {
                    "input": [
                        163,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                256,
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
                455,
                {
                    "input": [
                        453,
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
                        483,
                        "UUID!"
                    ],
                    "properties": [
                        288
                    ],
                    "recordId": [
                        483,
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
                242,
                {
                    "input": [
                        165,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                277,
                {
                    "input": [
                        166,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                300,
                {
                    "input": [
                        161,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                347,
                {
                    "input": [
                        167,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                418,
                {
                    "createRoleInput": [
                        172,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                368,
                {
                    "input": [
                        168,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                369,
                {
                    "input": [
                        169,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                372,
                {
                    "input": [
                        170,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                389,
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
                455,
                {
                    "input": [
                        454,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                458,
                {
                    "input": [
                        173,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                89,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        91,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        464,
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
                486,
                {
                    "input": [
                        174,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                565,
                {
                    "input": [
                        175,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                584,
                {
                    "input": [
                        176,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                589,
                {
                    "input": [
                        182,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                592,
                {
                    "input": [
                        178,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                593,
                {
                    "input": [
                        177,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                594,
                {
                    "input": [
                        180,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                595,
                {
                    "input": [
                        179,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                598,
                {
                    "input": [
                        181,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                601,
                {
                    "input": [
                        183,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                605,
                {
                    "input": [
                        184,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                458,
                {
                    "id": [
                        483,
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
                315,
                {
                    "id": [
                        483,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                140,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                612
            ],
            "deleteEmailGroupChannel": [
                315,
                {
                    "id": [
                        483,
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
                262,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                344,
                {
                    "ids": [
                        483,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                344,
                {
                    "id": [
                        483,
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
                242,
                {
                    "input": [
                        189,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                277,
                {
                    "input": [
                        190,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                300,
                {
                    "input": [
                        304,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                347,
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
                        483,
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
                        483,
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
                458,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                194,
                {
                    "twoFactorAuthenticationMethodId": [
                        483,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                578
            ],
            "deleteUserFromWorkspace": [
                581,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                584,
                {
                    "id": [
                        483,
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
                592,
                {
                    "input": [
                        196,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                593,
                {
                    "input": [
                        195,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                594,
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
                598,
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
                605,
                {
                    "id": [
                        483,
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
                592,
                {
                    "input": [
                        202,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                593,
                {
                    "input": [
                        201,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                594,
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
                598,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                209,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                210,
                {
                    "id": [
                        483,
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
                        483
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                84
            ],
            "enqueueJob": [
                224,
                {
                    "input": [
                        222,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                226,
                {
                    "input": [
                        225,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                616
            ],
            "executeOneLogicFunction": [
                302,
                {
                    "input": [
                        239,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                29,
                {
                    "apiKeyId": [
                        483,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                66
            ],
            "generateTransientToken": [
                474
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                480,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                68,
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
                68,
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
                68,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                481,
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
                266,
                {
                    "input": [
                        267,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                307,
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
                364
            ],
            "grantApplicationCapabilities": [
                37,
                {
                    "input": [
                        268,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                276,
                {
                    "userId": [
                        483,
                        "UUID!"
                    ],
                    "workspaceId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                283,
                {
                    "input": [
                        282,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                285,
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
                285
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                11,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                11,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                227
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        413,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                405,
                {
                    "principal": [
                        402,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        410,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        483,
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
                68,
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
                        414,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                415,
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
                445,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                368,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                372,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                469,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                438,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        483,
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
                        416,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                420,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                431,
                {
                    "input": [
                        427,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                51,
                {
                    "applicationId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                273,
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
                        483
                    ]
                }
            ],
            "sendChatMessage": [
                438,
                {
                    "browsingContext": [
                        288
                    ],
                    "fileAttachments": [
                        254,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        483,
                        "[UUID!]"
                    ],
                    "messageId": [
                        483,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                441,
                {
                    "input": [
                        440,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                444,
                {
                    "input": [
                        443,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                445,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        483
                    ]
                }
            ],
            "sendMessageCampaign": [
                447,
                {
                    "input": [
                        446,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                442,
                {
                    "input": [
                        448,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                31,
                {
                    "input": [
                        450,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                227,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                405,
                {
                    "accessLevel": [
                        401,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        410,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                405,
                {
                    "accessLevel": [
                        401,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        402,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        410,
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
                73,
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
                73,
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
                456,
                {
                    "input": [
                        457
                    ]
                }
            ],
            "signUpInWorkspace": [
                456,
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
                        483
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
                365,
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
                        187,
                        "DateTime!"
                    ],
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                122,
                {
                    "connectedAccountId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                460,
                {
                    "companyContext": [
                        288
                    ],
                    "personContext": [
                        288
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                461
            ],
            "subscribeToAgentChatThread": [
                11,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "switchBillingPlan": [
                106
            ],
            "switchSubscriptionInterval": [
                106
            ],
            "syncApplication": [
                626,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        288,
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
                        288
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
                476,
                {
                    "input": [
                        475,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                478,
                {
                    "input": [
                        477,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "updateApiKey": [
                27,
                {
                    "input": [
                        489,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                315,
                {
                    "input": [
                        490,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                35,
                {
                    "id": [
                        483,
                        "UUID!"
                    ],
                    "input": [
                        491,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                53,
                {
                    "input": [
                        492,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                57,
                {
                    "input": [
                        494,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                109,
                {
                    "input": [
                        496,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                136,
                {
                    "input": [
                        498,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                315,
                {
                    "input": [
                        499,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                262,
                {
                    "input": [
                        501,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                240,
                {
                    "input": [
                        503,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                344,
                {
                    "inputs": [
                        514,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                347,
                {
                    "inputs": [
                        515,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                598,
                {
                    "inputs": [
                        537,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                315,
                {
                    "input": [
                        506,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                322,
                {
                    "input": [
                        508,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                322,
                {
                    "input": [
                        510,
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
                344,
                {
                    "input": [
                        514,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        488,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        483
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
                242,
                {
                    "input": [
                        513,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        504,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                347,
                {
                    "input": [
                        515,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                418,
                {
                    "updateRoleInput": [
                        522,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                368,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        516,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        517,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                372,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        519,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                368,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        521,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                286,
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
                458,
                {
                    "input": [
                        524,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                469,
                {
                    "input": [
                        525,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                486,
                {
                    "input": [
                        526,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                565,
                {
                    "input": [
                        527,
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
                584,
                {
                    "input": [
                        528,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                589,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        539,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                592,
                {
                    "input": [
                        532,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                593,
                {
                    "input": [
                        530,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                594,
                {
                    "input": [
                        535,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                595,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        534,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                598,
                {
                    "input": [
                        537,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                601,
                {
                    "input": [
                        540,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                605,
                {
                    "input": [
                        542,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                612,
                {
                    "data": [
                        545,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                612,
                {
                    "data": [
                        544,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                621,
                {
                    "roleId": [
                        483,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        546,
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
                53,
                {
                    "file": [
                        547,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                253,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        547,
                        "Upload!"
                    ],
                    "fileFolder": [
                        255,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                257,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        547,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                257,
                {
                    "file": [
                        547,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                257,
                {
                    "file": [
                        547,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                257,
                {
                    "file": [
                        547,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                249,
                {
                    "upsertFieldPermissionsInput": [
                        548,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                589,
                {
                    "input": [
                        551,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                355,
                {
                    "upsertObjectPermissionsInput": [
                        552,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                419,
                {
                    "upsertPermissionFlagsInput": [
                        553,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                555,
                {
                    "input": [
                        554,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                589,
                {
                    "input": [
                        556,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                63,
                {
                    "input": [
                        582,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                586,
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
                73,
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
                587,
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
                483
            ],
            "color": [
                1
            ],
            "createdAt": [
                187
            ],
            "folderId": [
                483
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                483
            ],
            "position": [
                10
            ],
            "targetObjectMetadataId": [
                483
            ],
            "targetRecordId": [
                483
            ],
            "targetRecordIdentifier": [
                398
            ],
            "type": [
                345
            ],
            "updatedAt": [
                187
            ],
            "userWorkspaceId": [
                483
            ],
            "viewId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                483
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
                350,
                {
                    "filter": [
                        247,
                        "FieldFilter!"
                    ],
                    "paging": [
                        185,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                242
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "imageIdentifierFieldMetadataId": [
                483
            ],
            "indexMetadataList": [
                277
            ],
            "indexMetadatas": [
                352,
                {
                    "filter": [
                        280,
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
                483
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
                354
            ],
            "readability": [
                332
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                483
            ],
            "searchFieldMetadataList": [
                437
            ],
            "sharingReach": [
                362
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
                337
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                349
            ],
            "pageInfo": [
                367
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
                347
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                246
            ],
            "pageInfo": [
                367
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                351
            ],
            "id": [
                484
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
                351
            ],
            "universalIdentifier": [
                484
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                278
            ],
            "pageInfo": [
                367
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                483
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
                483
            ],
            "restrictedFields": [
                288
            ],
            "rowLevelPermissionPredicateGroups": [
                422
            ],
            "rowLevelPermissionPredicates": [
                421
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
                483
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
                186
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                359
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
                288
            ],
            "before": [
                288
            ],
            "diff": [
                288
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
                358
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
                363
            ],
            "previousOnboardingStatus": [
                363
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
                483
            ],
            "createdAt": [
                187
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                483
            ],
            "deletedAt": [
                187
            ],
            "id": [
                483
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
                483
            ],
            "tabs": [
                369
            ],
            "type": [
                371
            ],
            "universalIdentifier": [
                483
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
                483
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
                483
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
                370
            ],
            "pageLayoutId": [
                483
            ],
            "position": [
                10
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                483
            ],
            "updatedAt": [
                187
            ],
            "widgets": [
                372
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                483
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                288
            ],
            "configuration": [
                606
            ],
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "gridPosition": [
                270
            ],
            "id": [
                483
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
                483
            ],
            "pageLayoutTabId": [
                483
            ],
            "position": [
                375
            ],
            "title": [
                1
            ],
            "type": [
                608
            ],
            "universalIdentifier": [
                483
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
                370
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
                370
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
                373
            ],
            "on_PageLayoutWidgetGridPosition": [
                374
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                377
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                376
            ],
            "index": [
                7
            ],
            "layoutMode": [
                370
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
                483
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
                483
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
                483
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
                483
            ],
            "aggregateOperation": [
                18
            ],
            "color": [
                1
            ],
            "configurationType": [
                607
            ],
            "dateGranularity": [
                361
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
                288
            ],
            "firstDayOfTheWeek": [
                7
            ],
            "groupByFieldMetadataId": [
                483
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
                269
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
                384
            ],
            "formattedToRawLookup": [
                288
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
                288
            ],
            "objectMetadataId": [
                483
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
                299
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
                483
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
                483
            ],
            "createdAt": [
                187
            ],
            "domain": [
                1
            ],
            "id": [
                483
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
                241
            ],
            "metadata": [
                391
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
                388
            ],
            "IMAP": [
                388
            ],
            "SMTP": [
                388
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                64
            ],
            "authProviders": [
                65
            ],
            "displayName": [
                1
            ],
            "id": [
                483
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                630
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
                483
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
                        483,
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
                        265,
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
                        297
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
                315,
                {
                    "filter": [
                        298
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                38,
                {
                    "applicationId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                39,
                {
                    "applicationId": [
                        483,
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
                436,
                {
                    "applicationId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "applicationUpgradeRoleGrants": [
                59,
                {
                    "applicationId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                76,
                {
                    "input": [
                        77,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                100,
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
                483,
                {
                    "calendarEventId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                13,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                125,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                8,
                {
                    "id": [
                        483,
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
                620,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                462,
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
                        483,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                136
            ],
            "currentUser": [
                578
            ],
            "currentUserApplicationAuthorizations": [
                36
            ],
            "currentUserSessions": [
                580
            ],
            "currentWorkspace": [
                612
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
                228
            ],
            "eventLogs": [
                235,
                {
                    "input": [
                        234,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                41,
                {
                    "universalIdentifier": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                242,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                244,
                {
                    "filter": [
                        247,
                        "FieldFilter!"
                    ],
                    "paging": [
                        185,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                387,
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
                291,
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
                300
            ],
            "findManyMarketplaceApps": [
                308,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                389
            ],
            "findMarketplaceAppDetail": [
                309,
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
                        483
                    ],
                    "universalIdentifier": [
                        483
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
                300,
                {
                    "input": [
                        304,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                291,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                614
            ],
            "findWorkspaceFromInviteHash": [
                612,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                619
            ],
            "frontComponent": [
                262,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                262
            ],
            "getAddressDetails": [
                385,
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
                418
            ],
            "getApprovedAccessDomains": [
                63
            ],
            "getAutoCompleteAddress": [
                70,
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
                288,
                {
                    "input": [
                        304,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                141,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                217
            ],
            "getInviteSuggestions": [
                287
            ],
            "getJobs": [
                291,
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
                        304,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                368,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                369,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                369,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                372,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                372,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                368,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        371
                    ]
                }
            ],
            "getPermissionFlags": [
                379
            ],
            "getPublicWorkspaceDataByDomain": [
                393,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                394,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                99
            ],
            "getRole": [
                418,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                418
            ],
            "getSSOIdentityProviders": [
                259
            ],
            "getToolIndex": [
                473
            ],
            "getToolInputSchema": [
                288,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                562,
                {
                    "input": [
                        563
                    ]
                }
            ],
            "getView": [
                589,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                592,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                593,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                593,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                592,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                594,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                595,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                595,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                594,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                598,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                598,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                601,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                601,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                589,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        603,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                617
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
                293,
                {
                    "input": [
                        294,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                90
            ],
            "messageSuppressions": [
                327,
                {
                    "input": [
                        260,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                333,
                {
                    "input": [
                        336,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                338
            ],
            "mostlyEmptyFieldMetadataIds": [
                483,
                {
                    "objectMetadataId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                109,
                {
                    "connectedAccountId": [
                        483
                    ]
                }
            ],
            "myConnectedAccounts": [
                140
            ],
            "myMessageChannels": [
                315,
                {
                    "connectedAccountId": [
                        483
                    ]
                }
            ],
            "myMessageFolders": [
                322,
                {
                    "messageChannelId": [
                        483
                    ]
                }
            ],
            "myUserApplicationVariables": [
                622
            ],
            "navigationMenuItem": [
                344,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                344
            ],
            "object": [
                347,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                357
            ],
            "objects": [
                348,
                {
                    "filter": [
                        351,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        185,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                382,
                {
                    "input": [
                        383,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                117,
                {
                    "input": [
                        386,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                309,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                308,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                400,
                {
                    "targets": [
                        410,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                405,
                {
                    "target": [
                        410,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                458,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                458
            ],
            "timelineActivityTypes": [
                469
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                482,
                {
                    "userId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                486
            ],
            "usageLimits": [
                565
            ],
            "usageQuotaDefinitions": [
                569
            ],
            "usageQuotaScopeConsumption": [
                571,
                {
                    "input": [
                        572,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                573
            ],
            "validatePasswordResetToken": [
                583,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                584,
                {
                    "objectMetadataId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                605,
                {
                    "id": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                605
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                483
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
                483
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
                483
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
                483
            ],
            "permissions": [
                399
            ],
            "recordId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                483
            ],
            "workspaceMemberId": [
                483
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
                401
            ],
            "generalAccessLevel": [
                401
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                399
            ],
            "roles": [
                408
            ],
            "shares": [
                406
            ],
            "sharingMode": [
                407
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                401
            ],
            "id": [
                9
            ],
            "principalId": [
                483
            ],
            "principalRoleId": [
                483
            ],
            "principalType": [
                403
            ],
            "rowCause": [
                404
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
                483
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
                607
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
                483
            ],
            "recordId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                242
            ],
            "sourceObjectMetadata": [
                347
            ],
            "targetFieldMetadata": [
                242
            ],
            "targetObjectMetadata": [
                347
            ],
            "type": [
                412
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
                483
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
                249
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                355
            ],
            "permissionFlags": [
                419
            ],
            "rowLevelPermissionPredicateGroups": [
                422
            ],
            "rowLevelPermissionPredicates": [
                421
            ],
            "universalIdentifier": [
                483
            ],
            "workspaceMembers": [
                621
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
                483
            ],
            "roleId": [
                483
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
                426
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
                288
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
                424
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
                483
            ],
            "logicalOperator": [
                424
            ],
            "objectMetadataId": [
                483
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                483
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
                483
            ],
            "id": [
                483
            ],
            "operand": [
                426
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                10
            ],
            "rowLevelPermissionPredicateGroupId": [
                483
            ],
            "subFieldName": [
                1
            ],
            "value": [
                288
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
                429
            ],
            "messages": [
                429
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                483
            ],
            "thread": [
                432
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                483
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
                428
            ],
            "content": [
                1
            ],
            "role": [
                430
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
                288
            ],
            "success": [
                4
            ],
            "threadId": [
                483
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
                483
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                435
            ],
            "type": [
                271
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                483
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                435
            ],
            "type": [
                271
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
                483
            ],
            "id": [
                483
            ],
            "position": [
                10
            ],
            "tsVectorFieldMetadataId": [
                483
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
                483
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
                439
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
                288
            ],
            "workspaceMemberId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                483
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
                619
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
                288
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                483
            ],
            "createdAt": [
                187
            ],
            "frontComponentId": [
                483
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "position": [
                10
            ],
            "scope": [
                452
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                483
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
                483
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
                483
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                435
            ],
            "type": [
                271
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                66
            ],
            "workspace": [
                631
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
                483
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
                483
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
                417
            ],
            "configurationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                629
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
                236,
                {
                    "fieldFilters": [
                        230,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        237,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                397,
                {
                    "input": [
                        171,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                305,
                {
                    "input": [
                        306,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        483,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                238,
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
                467
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
                607
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
                483
            ],
            "createdAt": [
                187
            ],
            "emit": [
                470
            ],
            "frontComponentUniversalIdentifier": [
                483
            ],
            "icon": [
                1
            ],
            "id": [
                483
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
                483
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                483
            ],
            "universalIdentifier": [
                483
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
                483
            ],
            "on": [
                1
            ],
            "through": [
                471
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                483
            ],
            "relationFieldUniversalIdentifier": [
                483
            ],
            "triggerFieldUniversalIdentifiers": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                607
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
                288
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
                66
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
                483
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
                67
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
                483
            ],
            "gt": [
                483
            ],
            "gte": [
                483
            ],
            "iLike": [
                483
            ],
            "in": [
                483
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                483
            ],
            "lt": [
                483
            ],
            "lte": [
                483
            ],
            "neq": [
                483
            ],
            "notILike": [
                483
            ],
            "notIn": [
                483
            ],
            "notLike": [
                483
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
                483
            ],
            "name": [
                1
            ],
            "updatedAt": [
                187
            ],
            "visibility": [
                487
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
                483
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                288
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
                288
            ],
            "roleId": [
                483
            ],
            "triggers": [
                288
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
                483
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
                483
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                321
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
                493
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
                495
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
                483
            ],
            "update": [
                497
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
                483
            ],
            "availabilityType": [
                137
            ],
            "engineComponentKey": [
                221
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                288
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
                288
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                483
            ],
            "options": [
                288
            ],
            "settings": [
                288
            ],
            "translations": [
                334
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
                483
            ],
            "update": [
                502
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
                483
            ],
            "update": [
                505
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                288
            ],
            "databaseEventTriggerSettings": [
                288
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                288
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
                288
            ],
            "workflowActionTriggerSettings": [
                288
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                483
            ],
            "update": [
                507
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                316
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
                323
            ],
            "visibility": [
                321
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                483
            ],
            "update": [
                509
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
                483
            ],
            "update": [
                509
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
                483
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
                483
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
                483
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
                483
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
                354
            ],
            "readability": [
                332
            ],
            "sharingReach": [
                362
            ],
            "shortcut": [
                1
            ],
            "translations": [
                334
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                483
            ],
            "update": [
                500
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                483
            ],
            "update": [
                511
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                483
            ],
            "update": [
                512
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
                483
            ],
            "type": [
                371
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
                370
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
                483
            ],
            "layoutMode": [
                370
            ],
            "position": [
                10
            ],
            "title": [
                1
            ],
            "widgets": [
                520
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
                288
            ],
            "configuration": [
                288
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                483
            ],
            "pageLayoutTabId": [
                483
            ],
            "position": [
                288
            ],
            "title": [
                1
            ],
            "type": [
                608
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
                288
            ],
            "configuration": [
                288
            ],
            "id": [
                483
            ],
            "objectMetadataId": [
                483
            ],
            "pageLayoutTabId": [
                483
            ],
            "position": [
                288
            ],
            "title": [
                1
            ],
            "type": [
                608
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
                483
            ],
            "tabs": [
                518
            ],
            "type": [
                371
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                483
            ],
            "update": [
                523
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
                483
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
                483
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                334
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
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                483
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
                483
            ],
            "update": [
                529
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
                483
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
                483
            ],
            "update": [
                531
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
                483
            ],
            "update": [
                533
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                483
            ],
            "logicalOperator": [
                596
            ],
            "parentViewFilterGroupId": [
                483
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "viewId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                483
            ],
            "update": [
                536
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                483
            ],
            "operand": [
                597
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                483
            ],
            "subFieldName": [
                1
            ],
            "value": [
                288
            ],
            "viewFilterGroupId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                483
            ],
            "update": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                483
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
                483
            ],
            "calendarFieldMetadataId": [
                483
            ],
            "calendarLayout": [
                590
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                483
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                18
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                483
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                483
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                600
            ],
            "position": [
                10
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                603
            ],
            "visibility": [
                604
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                483
            ],
            "update": [
                541
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                602
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
                483
            ],
            "update": [
                543
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
                288
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                483
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
                618
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                288
            ],
            "workspaceMemberId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                250
            ],
            "roleId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                483
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "viewFieldId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                549
            ],
            "id": [
                483
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
                549
            ],
            "groups": [
                550
            ],
            "widgetId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                356
            ],
            "roleId": [
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                483
            ],
            "predicateGroups": [
                423
            ],
            "predicates": [
                425
            ],
            "roleId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                422
            ],
            "predicates": [
                421
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                560
            ],
            "viewFields": [
                557
            ],
            "viewFilterGroups": [
                558
            ],
            "viewFilters": [
                559
            ],
            "viewSorts": [
                561
            ],
            "widgetId": [
                483
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
                483
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
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                483
            ],
            "logicalOperator": [
                596
            ],
            "parentViewFilterGroupId": [
                483
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
                483
            ],
            "id": [
                483
            ],
            "operand": [
                597
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                483
            ],
            "subFieldName": [
                1
            ],
            "value": [
                288
            ],
            "viewFilterGroupId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                483
            ],
            "calendarFieldMetadataId": [
                483
            ],
            "calendarLayout": [
                590
            ],
            "kanbanAggregateOperation": [
                18
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                483
            ],
            "kanbanColumnWidth": [
                7
            ],
            "mainGroupByFieldMetadataId": [
                483
            ],
            "openRecordIn": [
                600
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                603
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                602
            ],
            "fieldMetadataId": [
                483
            ],
            "id": [
                483
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
                575
            ],
            "usageByApplication": [
                564
            ],
            "usageByModel": [
                564
            ],
            "usageByOperationType": [
                564
            ],
            "usageByUser": [
                564
            ],
            "userDailyUsage": [
                577
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                567
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
                81
            ],
            "createdAt": [
                187
            ],
            "id": [
                483
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                81
            ],
            "operationType": [
                567
            ],
            "periodCount": [
                7
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                574
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                576
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
                576
            ],
            "operationType": [
                567
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                566
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                570
            ],
            "resourceType": [
                574
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                568
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
                567
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                576
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                81
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
                567
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                574
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                576
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                81
            ],
            "id": [
                483
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                81
            ],
            "operationType": [
                567
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
                81
            ],
            "resourceType": [
                574
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
                576
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
                575
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
                72
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
                581
            ],
            "currentWorkspace": [
                612
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
                483
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
                363
            ],
            "previousOnboardingStatus": [
                363
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                187
            ],
            "userVars": [
                289
            ],
            "userWorkspaces": [
                581
            ],
            "workspaceMember": [
                621
            ],
            "workspaceMembers": [
                621
            ],
            "workspaces": [
                581
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
                288
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
                483
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
                483
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
                483
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                355
            ],
            "objectsPermissions": [
                355
            ],
            "permissionFlags": [
                380
            ],
            "twoFactorAuthenticationMethodSummary": [
                479
            ],
            "updatedAt": [
                187
            ],
            "user": [
                578
            ],
            "userId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                483
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
                483
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
                483
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                483
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
                483
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
                66
            ],
            "workspaceUrls": [
                630
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
                483
            ],
            "calendarEndFieldMetadataId": [
                483
            ],
            "calendarFieldMetadataId": [
                483
            ],
            "calendarLayout": [
                590
            ],
            "createdAt": [
                187
            ],
            "createdByUserWorkspaceId": [
                483
            ],
            "deletedAt": [
                187
            ],
            "groupLoadLimit": [
                7
            ],
            "icon": [
                1
            ],
            "id": [
                483
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
                483
            ],
            "kanbanColumnWidth": [
                7
            ],
            "key": [
                599
            ],
            "mainGroupByFieldMetadataId": [
                483
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                483
            ],
            "openRecordIn": [
                600
            ],
            "position": [
                10
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                603
            ],
            "universalIdentifier": [
                483
            ],
            "updatedAt": [
                187
            ],
            "viewFieldGroups": [
                593
            ],
            "viewFields": [
                592
            ],
            "viewFilterGroups": [
                595
            ],
            "viewFilters": [
                594
            ],
            "viewGroups": [
                598
            ],
            "viewSorts": [
                601
            ],
            "visibility": [
                604
            ],
            "workspaceId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                607
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
                483
            ],
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "fieldMetadataId": [
                483
            ],
            "id": [
                483
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
                483
            ],
            "updatedAt": [
                187
            ],
            "viewFieldGroupId": [
                483
            ],
            "viewId": [
                483
            ],
            "workspaceId": [
                483
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
                483
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
                187
            ],
            "viewFields": [
                592
            ],
            "viewId": [
                483
            ],
            "workspaceId": [
                483
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
                483
            ],
            "id": [
                483
            ],
            "operand": [
                597
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "relationTargetFieldMetadataId": [
                483
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                187
            ],
            "value": [
                288
            ],
            "viewFilterGroupId": [
                483
            ],
            "viewId": [
                483
            ],
            "workspaceId": [
                483
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
                483
            ],
            "logicalOperator": [
                596
            ],
            "parentViewFilterGroupId": [
                483
            ],
            "positionInViewFilterGroup": [
                10
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                483
            ],
            "workspaceId": [
                483
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
                483
            ],
            "isVisible": [
                4
            ],
            "position": [
                10
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                483
            ],
            "workspaceId": [
                483
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
                602
            ],
            "fieldMetadataId": [
                483
            ],
            "id": [
                483
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                483
            ],
            "workspaceId": [
                483
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
                483
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
                483
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
                17
            ],
            "on_BarChartConfiguration": [
                75
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
                220
            ],
            "on_FieldConfiguration": [
                243
            ],
            "on_FieldRichTextConfiguration": [
                251
            ],
            "on_FieldsConfiguration": [
                252
            ],
            "on_FilesConfiguration": [
                258
            ],
            "on_FormFieldConfiguration": [
                261
            ],
            "on_FrontComponentConfiguration": [
                263
            ],
            "on_IframeConfiguration": [
                272
            ],
            "on_LineChartConfiguration": [
                292
            ],
            "on_MessageCampaignBodyConfiguration": [
                313
            ],
            "on_MessageCampaignDetailsConfiguration": [
                314
            ],
            "on_NotesConfiguration": [
                346
            ],
            "on_PieChartConfiguration": [
                381
            ],
            "on_RecordTableConfiguration": [
                409
            ],
            "on_StandaloneRichTextConfiguration": [
                459
            ],
            "on_TasksConfiguration": [
                468
            ],
            "on_TimelineConfiguration": [
                472
            ],
            "on_ViewConfiguration": [
                591
            ],
            "on_WorkflowConfiguration": [
                609
            ],
            "on_WorkflowRunConfiguration": [
                610
            ],
            "on_WorkflowVersionConfiguration": [
                611
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                607
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                613
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
                288
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                83
            ],
            "billingEntitlements": [
                85
            ],
            "billingSubscriptions": [
                101
            ],
            "createdAt": [
                187
            ],
            "currentBillingSubscription": [
                101
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                418
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
                10
            ],
            "featureFlags": [
                240
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                483
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
                483
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
                187
            ],
            "viewFields": [
                592
            ],
            "viewFilterGroups": [
                595
            ],
            "viewFilters": [
                594
            ],
            "viewGroups": [
                598
            ],
            "viewSorts": [
                601
            ],
            "views": [
                589
            ],
            "workspaceCustomApplication": [
                35
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                618
            ],
            "workspaceMembersCount": [
                10
            ],
            "workspaceUrls": [
                630
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
                288
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                615
            ],
            "personEnrichment": [
                288
            ],
            "personOutcome": [
                628
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
                483
            ],
            "roleId": [
                483
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
                623
            ],
            "id": [
                483
            ],
            "locale": [
                1
            ],
            "name": [
                264
            ],
            "numberFormat": [
                624
            ],
            "openRecordIn": [
                366
            ],
            "roles": [
                418
            ],
            "timeFormat": [
                625
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
                483
            ],
            "userWorkspaceId": [
                483
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                483
            ],
            "variables": [
                579
            ],
            "workspaceMemberId": [
                483
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
                288
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
                483
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
                483
            ],
            "workspaceUrls": [
                630
            ],
            "__typename": [
                1
            ]
        }
    }
}