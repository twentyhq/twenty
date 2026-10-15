export default {
    "scalars": [
        1,
        4,
        6,
        8,
        10,
        11,
        18,
        20,
        22,
        25,
        27,
        34,
        46,
        54,
        56,
        62,
        74,
        78,
        79,
        81,
        86,
        91,
        97,
        102,
        108,
        111,
        112,
        113,
        114,
        122,
        124,
        138,
        143,
        145,
        188,
        189,
        216,
        220,
        221,
        223,
        233,
        239,
        243,
        247,
        250,
        257,
        272,
        274,
        284,
        291,
        292,
        293,
        304,
        306,
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
        405,
        407,
        408,
        411,
        416,
        428,
        430,
        434,
        439,
        456,
        468,
        469,
        471,
        495,
        497,
        499,
        559,
        579,
        586,
        588,
        602,
        608,
        609,
        611,
        612,
        614,
        615,
        616,
        619,
        620,
        625,
        627,
        630,
        635,
        636,
        637,
        640,
        641
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
                291
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
                495
            ],
            "createdAt": [
                189
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                291
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
                291
            ],
            "roleId": [
                495
            ],
            "triggers": [
                291
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                291
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
                189
            ],
            "deletedAt": [
                189
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
                189
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                189
            ],
            "id": [
                495
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                189
            ],
            "lastReadAt": [
                189
            ],
            "snoozedUntil": [
                189
            ],
            "threadId": [
                495
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                495
            ],
            "createdAt": [
                189
            ],
            "id": [
                495
            ],
            "parts": [
                15
            ],
            "processedAt": [
                189
            ],
            "reactions": [
                16
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                495
            ],
            "senderWorkspaceMemberId": [
                495
            ],
            "status": [
                1
            ],
            "threadId": [
                495
            ],
            "turnId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                189
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                495
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                495
            ],
            "messageId": [
                495
            ],
            "orderIndex": [
                8
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                291
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
                291
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                291
            ],
            "type": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessageReactionSummary": {
            "emoji": [
                1
            ],
            "workspaceMemberIds": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                189
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
                189
            ],
            "errorMessage": [
                1
            ],
            "id": [
                495
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
                189
            ],
            "status": [
                18
            ],
            "threadId": [
                495
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
                495
            ],
            "aggregateOperation": [
                20
            ],
            "configurationType": [
                619
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                291
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
                400
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
                189
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
                24
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
                189
            ],
            "expiresAt": [
                189
            ],
            "id": [
                495
            ],
            "name": [
                1
            ],
            "revokedAt": [
                189
            ],
            "role": [
                422
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                189
            ],
            "id": [
                495
            ],
            "name": [
                1
            ],
            "revokedAt": [
                189
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
                34
            ],
            "value": [
                291
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
                36
            ],
            "receivedAt": [
                189
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
                495
            ],
            "role": [
                329
            ],
            "workspaceMemberId": [
                495
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
                58
            ],
            "applicationRegistrationId": [
                495
            ],
            "applicationVariables": [
                61
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                291
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                137
            ],
            "createdAt": [
                189
            ],
            "defaultLogicFunctionRole": [
                422
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                264
            ],
            "healthCheckLogicFunctionId": [
                495
            ],
            "id": [
                495
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                303
            ],
            "logoFileId": [
                495
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
                495
            ],
            "settingsCustomTabFrontComponentId": [
                495
            ],
            "settingsMenuItems": [
                455
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                495
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                189
            ],
            "id": [
                495
            ],
            "lastAuthorizedAt": [
                189
            ],
            "lastUsedAt": [
                189
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                495
            ],
            "archivedAt": [
                189
            ],
            "authFailedAt": [
                189
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                396
            ],
            "connectionProviderId": [
                495
            ],
            "createdAt": [
                189
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                495
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                189
            ],
            "lastSignedInAt": [
                189
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
                189
            ],
            "userWorkspaceId": [
                495
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
                495
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                42
            ],
            "scope": [
                145
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
                44
            ],
            "coverage": [
                45
            ],
            "files": [
                47
            ],
            "manifest": [
                291
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
                56
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
                46
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
                495
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
                257
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
                257
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
                189
            ],
            "fileFolder": [
                257
            ],
            "fileId": [
                495
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
                52
            ],
            "description": [
                1
            ],
            "status": [
                54
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
                189
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                495
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
                495
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                56
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                189
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
                600
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                495
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                56
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                189
            ],
            "description": [
                1
            ],
            "id": [
                495
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
                291
            ],
            "type": [
                1
            ],
            "updatedAt": [
                189
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
        "ApplicationVariable": {
            "description": [
                1
            ],
            "id": [
                495
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
                291
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
                189
            ],
            "domain": [
                1
            ],
            "id": [
                495
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
                438
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                189
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
                495
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
                437
            ],
            "workspaceUrls": [
                642
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
                495
            ],
            "aggregateOperation": [
                20
            ],
            "axisNameDisplay": [
                74
            ],
            "color": [
                1
            ],
            "configurationType": [
                619
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
                291
            ],
            "firstDayOfTheWeek": [
                8
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
                124
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                365
            ],
            "primaryAxisGroupByFieldMetadataId": [
                495
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                272
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
                495
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                272
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
                291
            ],
            "formattedToRawLookup": [
                291
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
                291
            ],
            "objectMetadataId": [
                495
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
                495
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
                469
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
            "downgradePlanKeys": [
                91
            ],
            "isSellable": [
                4
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
            "upgradePlanKeys": [
                91
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
                468
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
                468
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
                108
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
                11
            ],
            "periodEnd": [
                189
            ],
            "periodStart": [
                189
            ],
            "productKey": [
                97
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
                189
            ],
            "collectionMethod": [
                102
            ],
            "currentPeriodEnd": [
                189
            ],
            "id": [
                495
            ],
            "interval": [
                468
            ],
            "metadata": [
                291
            ],
            "phases": [
                104
            ],
            "status": [
                469
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                96
            ],
            "creditAmount": [
                11
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                495
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
                495
            ],
            "contactAutoCreationPolicy": [
                111
            ],
            "createdAt": [
                189
            ],
            "handle": [
                1
            ],
            "id": [
                495
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
                189
            ],
            "syncStatus": [
                113
            ],
            "syncedAt": [
                189
            ],
            "throttleFailureCount": [
                11
            ],
            "updatedAt": [
                189
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
                619
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                619
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
                619
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                291
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
                619
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
                22
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
                28
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
                394
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                453
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                470
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                189
            ],
            "link": [
                1
            ],
            "startAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                25
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
                495
            ],
            "availabilityObjectMetadataId": [
                495
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
                495
            ],
            "createdAt": [
                189
            ],
            "engineComponentKey": [
                223
            ],
            "frontComponent": [
                264
            ],
            "frontComponentId": [
                495
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                495
            ],
            "pageLayoutId": [
                495
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
                495
            ],
            "updatedAt": [
                189
            ],
            "workflowVersionId": [
                495
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
                48
            ],
            "files": [
                255
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                495
            ],
            "archivedAt": [
                189
            ],
            "authFailedAt": [
                189
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                396
            ],
            "connectionProviderId": [
                495
            ],
            "createdAt": [
                189
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                495
            ],
            "lastCredentialsRefreshedAt": [
                189
            ],
            "lastSignedInAt": [
                189
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
                189
            ],
            "userWorkspaceId": [
                495
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
                277
            ],
            "handle": [
                1
            ],
            "id": [
                495
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                216
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
        "ConnectionProviderScope": {},
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
                291
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
                291
            ],
            "roleId": [
                495
            ],
            "triggers": [
                291
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                495
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
                49
            ],
            "targets": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                55
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
                495
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
                495
            ],
            "engineComponentKey": [
                223
            ],
            "frontComponentId": [
                495
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
                495
            ],
            "pageLayoutId": [
                495
            ],
            "payload": [
                291
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                495
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
                291
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
                291
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                495
            ],
            "options": [
                291
            ],
            "relationCreationPayload": [
                291
            ],
            "settings": [
                291
            ],
            "type": [
                250
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
                495
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
                495
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
                161
            ],
            "indexType": [
                284
            ],
            "objectMetadataId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                291
            ],
            "databaseEventTriggerSettings": [
                291
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                291
            ],
            "id": [
                495
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                291
            ],
            "source": [
                291
            ],
            "timeoutSeconds": [
                11
            ],
            "toolTriggerSettings": [
                291
            ],
            "universalIdentifier": [
                495
            ],
            "workflowActionTriggerSettings": [
                291
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
                495
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
                495
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                495
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                495
            ],
            "targetRecordId": [
                495
            ],
            "type": [
                349
            ],
            "userWorkspaceId": [
                495
            ],
            "viewId": [
                495
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
                291
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
                159
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                162
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                166
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
                495
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
                495
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
                291
            ],
            "objectMetadataId": [
                495
            ],
            "pageLayoutTabId": [
                495
            ],
            "position": [
                291
            ],
            "title": [
                1
            ],
            "type": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                495
            ],
            "filter": [
                291
            ],
            "objectMetadataId": [
                495
            ],
            "orderBy": [
                291
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
                495
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
                499
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
                579
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                586
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                588
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
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                20
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
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
                495
            ],
            "viewId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                495
            ],
            "logicalOperator": [
                608
            ],
            "parentViewFilterGroupId": [
                495
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "operand": [
                609
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "value": [
                291
            ],
            "viewFilterGroupId": [
                495
            ],
            "viewId": [
                495
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
                495
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                495
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
                495
            ],
            "calendarFieldMetadataId": [
                495
            ],
            "calendarLayout": [
                602
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                495
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                611
            ],
            "mainGroupByFieldMetadataId": [
                495
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                495
            ],
            "openRecordIn": [
                612
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                615
            ],
            "visibility": [
                616
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                614
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                495
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
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                495
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
                495
            ],
            "name": [
                267
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                495
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
                495
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                209
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
                495
            ],
            "pageLayoutId": [
                495
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
                495
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
                495
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                439
            ],
            "type": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                495
            ],
            "status": [
                439
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
                619
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                189
            ],
            "domain": [
                1
            ],
            "id": [
                495
            ],
            "status": [
                220
            ],
            "tenantStatus": [
                221
            ],
            "unsubscribeHostnameStatus": [
                497
            ],
            "updatedAt": [
                189
            ],
            "verificationRecords": [
                597
            ],
            "verifiedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                619
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
                291
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
                291
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
                225
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                291
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
                189
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
                189
            ],
            "currentPeriodEnd": [
                189
            ],
            "expiresAt": [
                189
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
                189
            ],
            "start": [
                189
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
                233
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
                231
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                232
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
                234
            ],
            "first": [
                8
            ],
            "table": [
                239
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                235
            ],
            "records": [
                238
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
                291
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                189
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
                294
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                495
            ],
            "payload": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                243
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
                495
            ],
            "createdAt": [
                189
            ],
            "defaultValue": [
                291
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                495
            ],
            "morphRelations": [
                415
            ],
            "name": [
                1
            ],
            "object": [
                351
            ],
            "objectMetadataId": [
                495
            ],
            "options": [
                291
            ],
            "relation": [
                415
            ],
            "settings": [
                291
            ],
            "type": [
                250
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                189
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
                619
            ],
            "fieldDisplayMode": [
                247
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
                248
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
                143
            ],
            "node": [
                244
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                249
            ],
            "id": [
                496
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
                496
            ],
            "or": [
                249
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
                495
            ],
            "id": [
                495
            ],
            "objectMetadataId": [
                495
            ],
            "roleId": [
                495
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
                495
            ],
            "objectMetadataId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                619
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
                189
            ],
            "id": [
                495
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
                495
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
                189
            ],
            "fileId": [
                495
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
                189
            ],
            "id": [
                495
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
                619
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                495
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                439
            ],
            "type": [
                274
            ],
            "workspace": [
                639
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                619
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
                495
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                60
            ],
            "applicationVariables": [
                291
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
                189
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                495
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
                495
            ],
            "updatedAt": [
                189
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                266
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                619
            ],
            "frontComponentId": [
                495
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                495
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
                495
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
                495
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
                495
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
                495
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
                619
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
                278
            ],
            "IMAP": [
                278
            ],
            "SMTP": [
                278
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
                216
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
                66
            ],
            "workspace": [
                643
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                189
            ],
            "id": [
                495
            ],
            "indexFieldMetadataList": [
                282
            ],
            "indexType": [
                284
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
                189
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
                280
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                189
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "order": [
                11
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                283
            ],
            "id": [
                496
            ],
            "isCustom": [
                109
            ],
            "or": [
                283
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                495
            ],
            "messages": [
                35
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                287
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
                495
            ],
            "messageThreadId": [
                495
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
                293
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                495
            ],
            "aggregateOperation": [
                20
            ],
            "axisNameDisplay": [
                74
            ],
            "color": [
                1
            ],
            "configurationType": [
                619
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
                291
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
                365
            ],
            "primaryAxisGroupByFieldMetadataId": [
                495
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                272
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
                495
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                272
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
                291
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                299
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
                291
            ],
            "objectMetadataId": [
                495
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
                298
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
                495
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
                495
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                189
            ],
            "cronTriggerSettings": [
                291
            ],
            "databaseEventTriggerSettings": [
                291
            ],
            "description": [
                1
            ],
            "executionMode": [
                304
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                291
            ],
            "id": [
                495
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
                291
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                189
            ],
            "workflowActionTriggerSettings": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                291
            ],
            "duration": [
                11
            ],
            "error": [
                291
            ],
            "logs": [
                1
            ],
            "status": [
                306
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                495
            ],
            "applicationUniversalIdentifier": [
                495
            ],
            "id": [
                495
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                495
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
                291
            ],
            "name": [
                1
            ],
            "objects": [
                313
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                314
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                56
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
                315
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                316
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
                619
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                619
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
                495
            ],
            "contactAutoCreationPolicy": [
                320
            ],
            "createdAt": [
                189
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
                495
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
                189
            ],
            "syncStatus": [
                323
            ],
            "syncedAt": [
                189
            ],
            "throttleFailureCount": [
                11
            ],
            "throttleRetryAfter": [
                189
            ],
            "type": [
                324
            ],
            "updatedAt": [
                189
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
                189
            ],
            "externalId": [
                1
            ],
            "id": [
                495
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                495
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
                189
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
                189
            ],
            "emailAddress": [
                1
            ],
            "id": [
                495
            ],
            "reason": [
                332
            ],
            "source": [
                333
            ],
            "unsubscribeTopicId": [
                495
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
                495
            ],
            "property": [
                1
            ],
            "provenance": [
                339
            ],
            "recordId": [
                495
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
                495
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                495
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
                495
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
                495
            ],
            "key": [
                611
            ],
            "objectMetadataId": [
                495
            ],
            "type": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                462,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                624,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                16,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        495,
                        "UUID!"
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
                        495
                    ],
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        495,
                        "UUID!"
                    ],
                    "roleId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        495,
                        "UUID!"
                    ],
                    "roleId": [
                        495,
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
                210
            ],
            "checkPublicDomainValidRecords": [
                210,
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
                        468,
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
                55,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                55,
                {
                    "fileId": [
                        495,
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
                        495,
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
                259,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                259,
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
                259,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                259,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApiKey": [
                29,
                {
                    "input": [
                        147,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                319,
                {
                    "input": [
                        148,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                149,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        50,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                150,
                {
                    "input": [
                        151,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                63,
                {
                    "input": [
                        152,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                89
            ],
            "createCalendarEvent": [
                154,
                {
                    "input": [
                        153,
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
                        155,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                208,
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
                157,
                {
                    "input": [
                        156,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                219,
                {
                    "input": [
                        158,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                258,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        257,
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
                264,
                {
                    "input": [
                        160,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                348,
                {
                    "inputs": [
                        165,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                605,
                {
                    "inputs": [
                        179,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                604,
                {
                    "inputs": [
                        180,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                610,
                {
                    "inputs": [
                        183,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                330,
                {
                    "input": [
                        164,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                348,
                {
                    "input": [
                        165,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                258,
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
                459,
                {
                    "input": [
                        457,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                26,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        495,
                        "UUID!"
                    ],
                    "properties": [
                        291
                    ],
                    "recordId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        146,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                244,
                {
                    "input": [
                        167,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                280,
                {
                    "input": [
                        168,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                303,
                {
                    "input": [
                        163,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                351,
                {
                    "input": [
                        169,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                422,
                {
                    "createRoleInput": [
                        174,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                372,
                {
                    "input": [
                        170,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                373,
                {
                    "input": [
                        171,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                376,
                {
                    "input": [
                        172,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                393,
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
                459,
                {
                    "input": [
                        458,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                462,
                {
                    "input": [
                        175,
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
                        468,
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
                498,
                {
                    "input": [
                        176,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                577,
                {
                    "input": [
                        177,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                596,
                {
                    "input": [
                        178,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                601,
                {
                    "input": [
                        184,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                604,
                {
                    "input": [
                        180,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                605,
                {
                    "input": [
                        179,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                606,
                {
                    "input": [
                        182,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                607,
                {
                    "input": [
                        181,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                610,
                {
                    "input": [
                        183,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                613,
                {
                    "input": [
                        185,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                617,
                {
                    "input": [
                        186,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                462,
                {
                    "id": [
                        495,
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
                        34
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                319,
                {
                    "id": [
                        495,
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
                        190,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                137,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                141,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                624
            ],
            "deleteEmailGroupChannel": [
                319,
                {
                    "id": [
                        495,
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
                264,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                348,
                {
                    "ids": [
                        495,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                348,
                {
                    "id": [
                        495,
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
                244,
                {
                    "input": [
                        191,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                280,
                {
                    "input": [
                        192,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                303,
                {
                    "input": [
                        307,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                351,
                {
                    "input": [
                        193,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        495,
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                194,
                {
                    "input": [
                        195,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                462,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                196,
                {
                    "twoFactorAuthenticationMethodId": [
                        495,
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                590
            ],
            "deleteUserFromWorkspace": [
                593,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                596,
                {
                    "id": [
                        495,
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
                604,
                {
                    "input": [
                        198,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                605,
                {
                    "input": [
                        197,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                606,
                {
                    "input": [
                        199,
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
                610,
                {
                    "input": [
                        200,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        201,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                617,
                {
                    "id": [
                        495,
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
                604,
                {
                    "input": [
                        204,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                605,
                {
                    "input": [
                        203,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                606,
                {
                    "input": [
                        205,
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
                610,
                {
                    "input": [
                        206,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        207,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                141,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                211,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                212,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                213,
                {
                    "input": [
                        214,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                217,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        495
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                84
            ],
            "enqueueJob": [
                226,
                {
                    "input": [
                        224,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                228,
                {
                    "input": [
                        227,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                628
            ],
            "executeOneLogicFunction": [
                305,
                {
                    "input": [
                        241,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                31,
                {
                    "apiKeyId": [
                        495,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                60,
                {
                    "applicationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                66
            ],
            "generateTransientToken": [
                478
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                492,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        495,
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
                493,
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
                269,
                {
                    "input": [
                        270,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                310,
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
                39,
                {
                    "input": [
                        271,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                279,
                {
                    "userId": [
                        495,
                        "UUID!"
                    ],
                    "workspaceId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                286,
                {
                    "input": [
                        285,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                288,
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
                288
            ],
            "installApplication": [
                37,
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
                229
            ],
            "removeAgentChatMessageReaction": [
                16,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        417,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                409,
                {
                    "principal": [
                        406,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        414,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                60,
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
                        418,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                419,
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
                449,
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
                        495,
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
                473,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                442,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                8
            ],
            "revokeApiKey": [
                29,
                {
                    "input": [
                        420,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                424,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                435,
                {
                    "input": [
                        431,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                53,
                {
                    "applicationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                276,
                {
                    "connectionParameters": [
                        215,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        495
                    ]
                }
            ],
            "sendChatMessage": [
                442,
                {
                    "browsingContext": [
                        291
                    ],
                    "fileAttachments": [
                        256,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        495,
                        "[UUID!]"
                    ],
                    "messageId": [
                        495,
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                445,
                {
                    "input": [
                        444,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                448,
                {
                    "input": [
                        447,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                449,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        495
                    ]
                }
            ],
            "sendMessageCampaign": [
                451,
                {
                    "input": [
                        450,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                446,
                {
                    "input": [
                        452,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                33,
                {
                    "input": [
                        454,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                229,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                409,
                {
                    "accessLevel": [
                        405,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        414,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                409,
                {
                    "accessLevel": [
                        405,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        406,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        414,
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
                460,
                {
                    "input": [
                        461
                    ]
                }
            ],
            "signUpInWorkspace": [
                460,
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
                        495
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
                123,
                {
                    "connectedAccountId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                464,
                {
                    "companyContext": [
                        291
                    ],
                    "personContext": [
                        291
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                465
            ],
            "switchBillingPlan": [
                107,
                {
                    "plan": [
                        91
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                107
            ],
            "syncApplication": [
                638,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        291,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                26,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        291
                    ],
                    "type": [
                        27,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                55,
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
                480,
                {
                    "input": [
                        479,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                484,
                {
                    "input": [
                        481,
                        "TriggerInstallApplicationInput!"
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
            "triggerUninstallApplication": [
                488,
                {
                    "input": [
                        485,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                487,
                {
                    "input": [
                        486,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                490,
                {
                    "input": [
                        489,
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
                        189
                    ],
                    "threadIds": [
                        495,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                29,
                {
                    "input": [
                        501,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                319,
                {
                    "input": [
                        502,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                37,
                {
                    "id": [
                        495,
                        "UUID!"
                    ],
                    "input": [
                        503,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                55,
                {
                    "input": [
                        504,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                59,
                {
                    "input": [
                        506,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                110,
                {
                    "input": [
                        508,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                137,
                {
                    "input": [
                        510,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                319,
                {
                    "input": [
                        511,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                264,
                {
                    "input": [
                        513,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                242,
                {
                    "input": [
                        515,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                348,
                {
                    "inputs": [
                        526,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                351,
                {
                    "inputs": [
                        527,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                610,
                {
                    "inputs": [
                        549,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                319,
                {
                    "input": [
                        518,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                326,
                {
                    "input": [
                        520,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                326,
                {
                    "input": [
                        522,
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
                        526,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        500,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        495
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
                244,
                {
                    "input": [
                        525,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        516,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                351,
                {
                    "input": [
                        527,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                422,
                {
                    "updateRoleInput": [
                        534,
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
                        528,
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
                        529,
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
                        531,
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
                        533,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                289,
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
                462,
                {
                    "input": [
                        536,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                473,
                {
                    "input": [
                        537,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                498,
                {
                    "input": [
                        538,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                577,
                {
                    "input": [
                        539,
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
                596,
                {
                    "input": [
                        540,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                601,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        551,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                604,
                {
                    "input": [
                        544,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                605,
                {
                    "input": [
                        542,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                606,
                {
                    "input": [
                        547,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                607,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        546,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                610,
                {
                    "input": [
                        549,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                613,
                {
                    "input": [
                        552,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                617,
                {
                    "input": [
                        554,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                624,
                {
                    "data": [
                        557,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                624,
                {
                    "data": [
                        556,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                633,
                {
                    "roleId": [
                        495,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        558,
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
                55,
                {
                    "file": [
                        559,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                255,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        559,
                        "Upload!"
                    ],
                    "fileFolder": [
                        257,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                259,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        559,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                259,
                {
                    "file": [
                        559,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                259,
                {
                    "file": [
                        559,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                259,
                {
                    "file": [
                        559,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                251,
                {
                    "upsertFieldPermissionsInput": [
                        560,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                601,
                {
                    "input": [
                        563,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                359,
                {
                    "upsertObjectPermissionsInput": [
                        564,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                423,
                {
                    "upsertPermissionFlagsInput": [
                        565,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                567,
                {
                    "input": [
                        566,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                601,
                {
                    "input": [
                        568,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                63,
                {
                    "input": [
                        594,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                598,
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
                219,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                599,
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
                495
            ],
            "color": [
                1
            ],
            "createdAt": [
                189
            ],
            "folderId": [
                495
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                495
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                495
            ],
            "targetRecordId": [
                495
            ],
            "targetRecordIdentifier": [
                402
            ],
            "type": [
                349
            ],
            "updatedAt": [
                189
            ],
            "userWorkspaceId": [
                495
            ],
            "viewId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                495
            ],
            "color": [
                1
            ],
            "createdAt": [
                189
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
                        249,
                        "FieldFilter!"
                    ],
                    "paging": [
                        187,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                244
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "imageIdentifierFieldMetadataId": [
                495
            ],
            "indexMetadataList": [
                280
            ],
            "indexMetadatas": [
                356,
                {
                    "filter": [
                        283,
                        "IndexFilter!"
                    ],
                    "paging": [
                        187,
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
                495
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
                495
            ],
            "searchFieldMetadataList": [
                441
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
                189
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
                143
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
                248
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
                496
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
                355
            ],
            "universalIdentifier": [
                496
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                281
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
                495
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
                495
            ],
            "restrictedFields": [
                291
            ],
            "rowLevelPermissionPredicateGroups": [
                426
            ],
            "rowLevelPermissionPredicates": [
                425
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
                495
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
                188
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
                291
            ],
            "before": [
                291
            ],
            "diff": [
                291
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
                495
            ],
            "createdAt": [
                189
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                495
            ],
            "deletedAt": [
                189
            ],
            "id": [
                495
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
                495
            ],
            "tabs": [
                373
            ],
            "type": [
                375
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                495
            ],
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                495
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                189
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
                495
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                291
            ],
            "configuration": [
                618
            ],
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "gridPosition": [
                273
            ],
            "id": [
                495
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
                495
            ],
            "pageLayoutTabId": [
                495
            ],
            "position": [
                379
            ],
            "title": [
                1
            ],
            "type": [
                620
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                189
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
                495
            ],
            "createdAt": [
                189
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                495
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                495
            ],
            "aggregateOperation": [
                20
            ],
            "color": [
                1
            ],
            "configurationType": [
                619
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
                291
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupByFieldMetadataId": [
                495
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
                272
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
                291
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
                291
            ],
            "objectMetadataId": [
                495
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
                302
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
                495
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
                216
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
                495
            ],
            "createdAt": [
                189
            ],
            "domain": [
                1
            ],
            "id": [
                495
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
                243
            ],
            "metadata": [
                395
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
                392
            ],
            "IMAP": [
                392
            ],
            "SMTP": [
                392
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
                495
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                642
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
                495
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
                17,
                {
                    "agentId": [
                        495,
                        "UUID!"
                    ],
                    "limit": [
                        8,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                21
            ],
            "apiKey": [
                29,
                {
                    "input": [
                        268,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                29
            ],
            "appConnection": [
                32,
                {
                    "id": [
                        10,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                32,
                {
                    "filter": [
                        300
                    ]
                }
            ],
            "appKeyValue": [
                33,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        34
                    ]
                }
            ],
            "appMessageChannels": [
                319,
                {
                    "filter": [
                        301
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                40,
                {
                    "applicationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                41,
                {
                    "applicationId": [
                        495,
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
                440,
                {
                    "applicationId": [
                        495,
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
                495,
                {
                    "calendarEventId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                126,
                {
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        495,
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
                632,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                466,
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                137
            ],
            "currentUser": [
                590
            ],
            "currentUserApplicationAuthorizations": [
                38
            ],
            "currentUserSessions": [
                592
            ],
            "currentWorkspace": [
                624
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
                230
            ],
            "eventLogs": [
                237,
                {
                    "input": [
                        236,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                43,
                {
                    "universalIdentifier": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                244,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                246,
                {
                    "filter": [
                        249,
                        "FieldFilter!"
                    ],
                    "paging": [
                        187,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                391,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                55,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                59,
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
                294,
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
                55
            ],
            "findManyApplications": [
                37
            ],
            "findManyLogicFunctions": [
                303
            ],
            "findManyMarketplaceApps": [
                311,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                393
            ],
            "findMarketplaceAppDetail": [
                312,
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
                37,
                {
                    "id": [
                        495
                    ],
                    "universalIdentifier": [
                        495
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                303,
                {
                    "input": [
                        307,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                294,
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
                294,
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
                626
            ],
            "findWorkspaceFromInviteHash": [
                624,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                631
            ],
            "frontComponent": [
                264,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                264
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
                23
            ],
            "getApiKeyRoles": [
                422
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
                291,
                {
                    "input": [
                        307,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                142,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                219
            ],
            "getInviteSuggestions": [
                290
            ],
            "getJobs": [
                294,
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
                        307,
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
                397,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                398,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                99
            ],
            "getRole": [
                422,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                422
            ],
            "getSSOIdentityProviders": [
                261
            ],
            "getToolIndex": [
                477
            ],
            "getToolInputSchema": [
                291,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                574,
                {
                    "input": [
                        575
                    ]
                }
            ],
            "getView": [
                601,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                604,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                605,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                605,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                604,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                606,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                607,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                607,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                606,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                610,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                610,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                613,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                613,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                601,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        615,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                629
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
                296,
                {
                    "input": [
                        297,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                90
            ],
            "messageSuppressions": [
                331,
                {
                    "input": [
                        262,
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
                495,
                {
                    "objectMetadataId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                110,
                {
                    "connectedAccountId": [
                        495
                    ]
                }
            ],
            "myConnectedAccounts": [
                141
            ],
            "myMessageChannels": [
                319,
                {
                    "connectedAccountId": [
                        495
                    ]
                }
            ],
            "myMessageFolders": [
                326,
                {
                    "messageChannelId": [
                        495
                    ]
                }
            ],
            "myUserApplicationVariables": [
                634
            ],
            "navigationMenuItem": [
                348,
                {
                    "id": [
                        495,
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
                        495,
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
                        187,
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
                118,
                {
                    "input": [
                        390,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                312,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                311,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                404,
                {
                    "targets": [
                        414,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                409,
                {
                    "target": [
                        414,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                462,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                462
            ],
            "timelineActivityTypes": [
                473
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                494,
                {
                    "userId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                498
            ],
            "usageLimits": [
                577
            ],
            "usageQuotaDefinitions": [
                581
            ],
            "usageQuotaScopeConsumption": [
                583,
                {
                    "input": [
                        584,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                585
            ],
            "validatePasswordResetToken": [
                595,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                596,
                {
                    "objectMetadataId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                617,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                617
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                495
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
                495
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
                495
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
                495
            ],
            "permissions": [
                403
            ],
            "recordId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                495
            ],
            "workspaceMemberId": [
                495
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
                405
            ],
            "generalAccessLevel": [
                405
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                403
            ],
            "roles": [
                412
            ],
            "shares": [
                410
            ],
            "sharingMode": [
                411
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                405
            ],
            "id": [
                10
            ],
            "principalId": [
                495
            ],
            "principalRoleId": [
                495
            ],
            "principalType": [
                407
            ],
            "rowCause": [
                408
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
                495
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
                619
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
                495
            ],
            "recordId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                244
            ],
            "sourceObjectMetadata": [
                351
            ],
            "targetFieldMetadata": [
                244
            ],
            "targetObjectMetadata": [
                351
            ],
            "type": [
                416
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
                495
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
                30
            ],
            "applicationId": [
                495
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
                251
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                423
            ],
            "rowLevelPermissionPredicateGroups": [
                426
            ],
            "rowLevelPermissionPredicates": [
                425
            ],
            "universalIdentifier": [
                495
            ],
            "workspaceMembers": [
                633
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
                495
            ],
            "roleId": [
                495
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
                430
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
                291
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
                428
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
                495
            ],
            "logicalOperator": [
                428
            ],
            "objectMetadataId": [
                495
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                495
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
                495
            ],
            "id": [
                495
            ],
            "operand": [
                430
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "value": [
                291
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
                433
            ],
            "messages": [
                433
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                291
            ],
            "runAsWorkspaceMemberId": [
                495
            ],
            "thread": [
                436
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                495
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
                432
            ],
            "content": [
                1
            ],
            "role": [
                434
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
                291
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                495
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
                495
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                439
            ],
            "type": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                495
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                439
            ],
            "type": [
                274
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
                189
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                495
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                495
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
                443
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
                291
            ],
            "workspaceMemberIds": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                495
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
                631
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
                189
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
                34
            ],
            "value": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                495
            ],
            "createdAt": [
                189
            ],
            "frontComponentId": [
                495
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "position": [
                11
            ],
            "scope": [
                456
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                189
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
                495
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
                495
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                439
            ],
            "type": [
                274
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
                643
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
                495
            ],
            "content": [
                1
            ],
            "createdAt": [
                189
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                189
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                421
            ],
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                641
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
                238,
                {
                    "fieldFilters": [
                        232,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        239,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                401,
                {
                    "input": [
                        173,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                308,
                {
                    "input": [
                        309,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                240,
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
                471
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
                619
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
                495
            ],
            "createdAt": [
                189
            ],
            "emit": [
                474
            ],
            "frontComponentUniversalIdentifier": [
                495
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                495
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                495
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                495
            ],
            "on": [
                1
            ],
            "through": [
                475
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                495
            ],
            "relationFieldUniversalIdentifier": [
                495
            ],
            "triggerFieldUniversalIdentifiers": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                619
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
                291
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
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                495
            ],
            "personFilter": [
                291
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                189
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
                189
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                495
            ],
            "gt": [
                495
            ],
            "gte": [
                495
            ],
            "iLike": [
                495
            ],
            "in": [
                495
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                495
            ],
            "lt": [
                495
            ],
            "lte": [
                495
            ],
            "neq": [
                495
            ],
            "notILike": [
                495
            ],
            "notIn": [
                495
            ],
            "notLike": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                189
            ],
            "description": [
                1
            ],
            "id": [
                495
            ],
            "name": [
                1
            ],
            "updatedAt": [
                189
            ],
            "visibility": [
                499
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
                495
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                291
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
                291
            ],
            "roleId": [
                495
            ],
            "triggers": [
                291
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
                495
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
                495
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
                505
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
                507
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
                495
            ],
            "update": [
                509
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
                495
            ],
            "availabilityType": [
                138
            ],
            "engineComponentKey": [
                223
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                291
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
                291
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                495
            ],
            "options": [
                291
            ],
            "settings": [
                291
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
                495
            ],
            "update": [
                514
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
                495
            ],
            "update": [
                517
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                291
            ],
            "databaseEventTriggerSettings": [
                291
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                291
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
                291
            ],
            "workflowActionTriggerSettings": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                495
            ],
            "update": [
                519
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
                495
            ],
            "update": [
                521
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
                495
            ],
            "update": [
                521
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
                495
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
                495
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
                495
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
                495
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
                495
            ],
            "update": [
                512
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                495
            ],
            "update": [
                523
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                495
            ],
            "update": [
                524
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
                495
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
                495
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
                532
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
                291
            ],
            "configuration": [
                291
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                495
            ],
            "pageLayoutTabId": [
                495
            ],
            "position": [
                291
            ],
            "title": [
                1
            ],
            "type": [
                620
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
                291
            ],
            "configuration": [
                291
            ],
            "id": [
                495
            ],
            "objectMetadataId": [
                495
            ],
            "pageLayoutTabId": [
                495
            ],
            "position": [
                291
            ],
            "title": [
                1
            ],
            "type": [
                620
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
                495
            ],
            "tabs": [
                530
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
                495
            ],
            "update": [
                535
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
                495
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
                495
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
                499
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                495
            ],
            "payload": [
                177
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                495
            ],
            "update": [
                541
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
                495
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
                495
            ],
            "update": [
                543
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
                495
            ],
            "update": [
                545
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                20
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                495
            ],
            "logicalOperator": [
                608
            ],
            "parentViewFilterGroupId": [
                495
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                495
            ],
            "update": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                495
            ],
            "operand": [
                609
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "value": [
                291
            ],
            "viewFilterGroupId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                495
            ],
            "update": [
                550
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                495
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
                495
            ],
            "calendarFieldMetadataId": [
                495
            ],
            "calendarLayout": [
                602
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                495
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                495
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                612
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                615
            ],
            "visibility": [
                616
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                495
            ],
            "update": [
                553
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                614
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
                495
            ],
            "update": [
                555
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
                22
            ],
            "aiChatModelTier": [
                22
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                291
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                495
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
                630
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                291
            ],
            "workspaceMemberId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                252
            ],
            "roleId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                495
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                561
            ],
            "id": [
                495
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
                561
            ],
            "groups": [
                562
            ],
            "widgetId": [
                495
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
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                495
            ],
            "predicateGroups": [
                427
            ],
            "predicates": [
                429
            ],
            "roleId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                426
            ],
            "predicates": [
                425
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                572
            ],
            "viewFields": [
                569
            ],
            "viewFilterGroups": [
                570
            ],
            "viewFilters": [
                571
            ],
            "viewSorts": [
                573
            ],
            "widgetId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                20
            ],
            "fieldMetadataId": [
                495
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
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                495
            ],
            "logicalOperator": [
                608
            ],
            "parentViewFilterGroupId": [
                495
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
                495
            ],
            "id": [
                495
            ],
            "operand": [
                609
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "value": [
                291
            ],
            "viewFilterGroupId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                495
            ],
            "calendarFieldMetadataId": [
                495
            ],
            "calendarLayout": [
                602
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                495
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                495
            ],
            "openRecordIn": [
                612
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                615
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                614
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                189
            ],
            "periodStart": [
                189
            ],
            "timeSeries": [
                587
            ],
            "usageByApplication": [
                576
            ],
            "usageByModel": [
                576
            ],
            "usageByOperationType": [
                576
            ],
            "usageByUser": [
                576
            ],
            "userDailyUsage": [
                589
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                579
            ],
            "periodEnd": [
                189
            ],
            "periodStart": [
                189
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
                81
            ],
            "createdAt": [
                189
            ],
            "id": [
                495
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                81
            ],
            "operationType": [
                579
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                586
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                588
            ],
            "updatedAt": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                588
            ],
            "operationType": [
                579
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                578
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                582
            ],
            "resourceType": [
                586
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                580
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
                579
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                588
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
                189
            ],
            "periodStart": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                579
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                586
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                588
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
                495
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                81
            ],
            "operationType": [
                579
            ],
            "periodEnd": [
                189
            ],
            "periodStart": [
                189
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                81
            ],
            "resourceType": [
                586
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
                588
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
                587
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
                189
            ],
            "currentUserWorkspace": [
                593
            ],
            "currentWorkspace": [
                624
            ],
            "deletedAt": [
                189
            ],
            "deletedWorkspaceMembers": [
                202
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
                495
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
                189
            ],
            "userVars": [
                292
            ],
            "userWorkspaces": [
                593
            ],
            "workspaceMember": [
                633
            ],
            "workspaceMembers": [
                633
            ],
            "workspaces": [
                593
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
                291
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
                189
            ],
            "expiresAt": [
                189
            ],
            "id": [
                495
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
                189
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "id": [
                495
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
                491
            ],
            "updatedAt": [
                189
            ],
            "user": [
                590
            ],
            "userId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                495
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
                495
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
                495
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                495
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
                66
            ],
            "workspaceUrls": [
                642
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
                495
            ],
            "calendarEndFieldMetadataId": [
                495
            ],
            "calendarFieldMetadataId": [
                495
            ],
            "calendarLayout": [
                602
            ],
            "createdAt": [
                189
            ],
            "createdByUserWorkspaceId": [
                495
            ],
            "deletedAt": [
                189
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                495
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
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                495
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                611
            ],
            "mainGroupByFieldMetadataId": [
                495
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                495
            ],
            "openRecordIn": [
                612
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                615
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                189
            ],
            "viewFieldGroups": [
                605
            ],
            "viewFields": [
                604
            ],
            "viewFilterGroups": [
                607
            ],
            "viewFilters": [
                606
            ],
            "viewGroups": [
                610
            ],
            "viewSorts": [
                613
            ],
            "visibility": [
                616
            ],
            "workspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                20
            ],
            "applicationId": [
                495
            ],
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
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
                495
            ],
            "updatedAt": [
                189
            ],
            "viewFieldGroupId": [
                495
            ],
            "viewId": [
                495
            ],
            "workspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "id": [
                495
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
                189
            ],
            "viewFields": [
                604
            ],
            "viewId": [
                495
            ],
            "workspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "operand": [
                609
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                189
            ],
            "value": [
                291
            ],
            "viewFilterGroupId": [
                495
            ],
            "viewId": [
                495
            ],
            "workspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "id": [
                495
            ],
            "logicalOperator": [
                608
            ],
            "parentViewFilterGroupId": [
                495
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                189
            ],
            "viewId": [
                495
            ],
            "workspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "fieldValue": [
                1
            ],
            "id": [
                495
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "updatedAt": [
                189
            ],
            "viewId": [
                495
            ],
            "workspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "direction": [
                614
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                189
            ],
            "viewId": [
                495
            ],
            "workspaceId": [
                495
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
                495
            ],
            "createdAt": [
                189
            ],
            "deletedAt": [
                189
            ],
            "description": [
                1
            ],
            "id": [
                495
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
                189
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                19
            ],
            "on_BarChartConfiguration": [
                75
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
                218
            ],
            "on_EmailsConfiguration": [
                222
            ],
            "on_FieldConfiguration": [
                245
            ],
            "on_FieldRichTextConfiguration": [
                253
            ],
            "on_FieldsConfiguration": [
                254
            ],
            "on_FilesConfiguration": [
                260
            ],
            "on_FormFieldConfiguration": [
                263
            ],
            "on_FrontComponentConfiguration": [
                265
            ],
            "on_IframeConfiguration": [
                275
            ],
            "on_LineChartConfiguration": [
                295
            ],
            "on_MessageCampaignBodyConfiguration": [
                317
            ],
            "on_MessageCampaignDetailsConfiguration": [
                318
            ],
            "on_NotesConfiguration": [
                350
            ],
            "on_PieChartConfiguration": [
                385
            ],
            "on_RecordTableConfiguration": [
                413
            ],
            "on_StandaloneRichTextConfiguration": [
                463
            ],
            "on_TasksConfiguration": [
                472
            ],
            "on_TimelineConfiguration": [
                476
            ],
            "on_ViewConfiguration": [
                603
            ],
            "on_WorkflowConfiguration": [
                621
            ],
            "on_WorkflowRunConfiguration": [
                622
            ],
            "on_WorkflowVersionConfiguration": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                625
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                22
            ],
            "aiChatModelTier": [
                22
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                291
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
                189
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
                422
            ],
            "deletedAt": [
                189
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
                242
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                495
            ],
            "installedApplications": [
                37
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
                495
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
                189
            ],
            "viewFields": [
                604
            ],
            "viewFilterGroups": [
                607
            ],
            "viewFilters": [
                606
            ],
            "viewGroups": [
                610
            ],
            "viewSorts": [
                613
            ],
            "views": [
                601
            ],
            "workspaceCustomApplication": [
                37
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                630
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                642
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
                291
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                627
            ],
            "personEnrichment": [
                291
            ],
            "personOutcome": [
                640
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
                189
            ],
            "id": [
                495
            ],
            "roleId": [
                495
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
                635
            ],
            "id": [
                495
            ],
            "locale": [
                1
            ],
            "name": [
                267
            ],
            "numberFormat": [
                636
            ],
            "openRecordIn": [
                370
            ],
            "roles": [
                422
            ],
            "timeFormat": [
                637
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
                495
            ],
            "userWorkspaceId": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                495
            ],
            "variables": [
                591
            ],
            "workspaceMemberId": [
                495
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
                291
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
                495
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
                495
            ],
            "workspaceUrls": [
                642
            ],
            "__typename": [
                1
            ]
        }
    }
}