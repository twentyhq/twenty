export default {
    "scalars": [
        1,
        4,
        6,
        8,
        10,
        11,
        12,
        19,
        21,
        23,
        26,
        28,
        35,
        47,
        55,
        58,
        64,
        76,
        80,
        81,
        83,
        88,
        93,
        99,
        104,
        110,
        113,
        114,
        115,
        116,
        124,
        126,
        140,
        144,
        146,
        148,
        192,
        193,
        220,
        224,
        225,
        227,
        237,
        243,
        247,
        251,
        254,
        261,
        276,
        278,
        288,
        295,
        296,
        297,
        308,
        310,
        325,
        326,
        327,
        328,
        329,
        330,
        332,
        333,
        334,
        337,
        338,
        340,
        341,
        344,
        346,
        350,
        354,
        363,
        370,
        371,
        372,
        375,
        379,
        380,
        385,
        389,
        412,
        414,
        415,
        418,
        423,
        435,
        437,
        441,
        446,
        463,
        475,
        476,
        478,
        502,
        504,
        506,
        566,
        586,
        593,
        595,
        599,
        610,
        616,
        617,
        619,
        620,
        622,
        623,
        624,
        627,
        628,
        633,
        635,
        638,
        643,
        644,
        645,
        648,
        649
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
                502
            ],
            "createdAt": [
                193
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                502
            ],
            "triggers": [
                295
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
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
                193
            ],
            "deletedAt": [
                193
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadFilterStatus": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                193
            ],
            "id": [
                502
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                193
            ],
            "lastReadAt": [
                193
            ],
            "snoozedUntil": [
                193
            ],
            "threadId": [
                502
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                502
            ],
            "createdAt": [
                193
            ],
            "id": [
                502
            ],
            "parts": [
                16
            ],
            "processedAt": [
                193
            ],
            "reactions": [
                17
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                502
            ],
            "senderWorkspaceMemberId": [
                502
            ],
            "status": [
                1
            ],
            "threadId": [
                502
            ],
            "turnId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                193
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                502
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                502
            ],
            "messageId": [
                502
            ],
            "orderIndex": [
                8
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
        "AgentMessageReactionSummary": {
            "agentIds": [
                502
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                193
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
                193
            ],
            "errorMessage": [
                1
            ],
            "id": [
                502
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
                193
            ],
            "status": [
                19
            ],
            "threadId": [
                502
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
                502
            ],
            "aggregateOperation": [
                21
            ],
            "configurationType": [
                627
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
                8
            ],
            "label": [
                1
            ],
            "numberFormat": [
                126
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                407
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
                83
            ],
            "kind": [
                1
            ],
            "limitValue": [
                83
            ],
            "periodEnd": [
                193
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
                25
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
                193
            ],
            "expiresAt": [
                193
            ],
            "id": [
                502
            ],
            "name": [
                1
            ],
            "revokedAt": [
                193
            ],
            "role": [
                429
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                193
            ],
            "id": [
                502
            ],
            "name": [
                1
            ],
            "revokedAt": [
                193
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
            "scope": [
                144
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
                35
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
                37
            ],
            "receivedAt": [
                193
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
                502
            ],
            "role": [
                334
            ],
            "workspaceMemberId": [
                502
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
                60
            ],
            "applicationRegistrationId": [
                502
            ],
            "applicationVariables": [
                63
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
                139
            ],
            "createdAt": [
                193
            ],
            "defaultLogicFunctionRole": [
                429
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                268
            ],
            "healthCheckLogicFunctionId": [
                502
            ],
            "id": [
                502
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                307
            ],
            "logoFileId": [
                502
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                356
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                502
            ],
            "settingsCustomTabFrontComponentId": [
                502
            ],
            "settingsMenuItems": [
                462
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                502
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                193
            ],
            "id": [
                502
            ],
            "lastAuthorizedAt": [
                193
            ],
            "lastUsedAt": [
                193
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                502
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                502
            ],
            "archivedAt": [
                193
            ],
            "authFailedAt": [
                193
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                403
            ],
            "connectionProviderId": [
                502
            ],
            "createdAt": [
                193
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                502
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                193
            ],
            "lastSignedInAt": [
                193
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                144
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                193
            ],
            "userWorkspaceId": [
                502
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
                502
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                43
            ],
            "scope": [
                148
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
                45
            ],
            "coverage": [
                46
            ],
            "files": [
                48
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
                58
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
                47
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
                502
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
                261
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
                261
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
                193
            ],
            "fileFolder": [
                261
            ],
            "fileId": [
                502
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
                53
            ],
            "description": [
                1
            ],
            "status": [
                55
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationHealthStatus": {},
        "ApplicationPreferences": {
            "applicationId": [
                502
            ],
            "settingsMenuItems": [
                462
            ],
            "variables": [
                598
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                193
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                502
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
                502
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                58
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                193
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
            "autoUpdateEnabled": [
                8
            ],
            "creditsUsedBreakdown": [
                190
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                8
            ],
            "totalCreditsUsed": [
                11
            ],
            "versionDistribution": [
                608
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                502
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                58
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                193
            ],
            "description": [
                1
            ],
            "id": [
                502
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
                193
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
                68
            ],
            "applicationRefreshToken": [
                68
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
                502
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
                64
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
                193
            ],
            "domain": [
                1
            ],
            "id": [
                502
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
                445
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                193
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
                68
            ],
            "refreshToken": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                69
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
                502
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
                444
            ],
            "workspaceUrls": [
                650
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                73
            ],
            "availableWorkspacesForSignUp": [
                73
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                74
            ],
            "tokens": [
                69
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                502
            ],
            "aggregateOperation": [
                21
            ],
            "axisNameDisplay": [
                76
            ],
            "color": [
                1
            ],
            "configurationType": [
                627
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
                8
            ],
            "groupMode": [
                80
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                81
            ],
            "numberFormat": [
                126
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                370
            ],
            "primaryAxisGroupByFieldMetadataId": [
                502
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
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                370
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                502
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
                80
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
                81
            ],
            "series": [
                82
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
                502
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
                108
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
                502
            ],
            "userCreditsFallback": [
                599
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
                103
            ],
            "currentBillingSubscription": [
                103
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                476
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                88
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
                100
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
        "BillingMeteredProduct": {
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                100
            ],
            "name": [
                1
            ],
            "prices": [
                95
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
                89
            ],
            "downgradePlanKeys": [
                93
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                90
            ],
            "planKey": [
                93
            ],
            "resourceCreditProducts": [
                89
            ],
            "upgradePlanKeys": [
                93
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
                110
            ],
            "recurringInterval": [
                475
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
                110
            ],
            "recurringInterval": [
                475
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                96
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
                100
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
                100
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                89
            ],
            "on_BillingMeteredProduct": [
                90
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
                93
            ],
            "priceUsageBased": [
                110
            ],
            "productKey": [
                99
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                193
            ],
            "periodStart": [
                193
            ],
            "productKey": [
                99
            ],
            "unitPriceCents": [
                11
            ],
            "userCreditsUsed": [
                11
            ],
            "workspaceCreditsExtraGranted": [
                11
            ],
            "workspaceCreditsGranted": [
                11
            ],
            "workspaceCreditsGrantedForSeats": [
                11
            ],
            "workspaceCreditsSeats": [
                8
            ],
            "workspaceCreditsTotalGranted": [
                11
            ],
            "workspaceCreditsUsed": [
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
                105
            ],
            "cancelAt": [
                193
            ],
            "collectionMethod": [
                104
            ],
            "currentPeriodEnd": [
                193
            ],
            "id": [
                502
            ],
            "interval": [
                475
            ],
            "metadata": [
                295
            ],
            "phases": [
                106
            ],
            "status": [
                476
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                98
            ],
            "creditAmount": [
                11
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                502
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
                107
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
                103
            ],
            "currentBillingSubscription": [
                103
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
                502
            ],
            "contactAutoCreationPolicy": [
                113
            ],
            "createdAt": [
                193
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                502
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                114
            ],
            "syncStageStartedAt": [
                193
            ],
            "syncStatus": [
                115
            ],
            "syncedAt": [
                193
            ],
            "throttleFailureCount": [
                11
            ],
            "updatedAt": [
                193
            ],
            "visibility": [
                116
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
                627
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                627
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
                124
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
                627
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
                129
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
                627
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
                350
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                352
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
                23
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                133
            ],
            "aiModelTiers": [
                135
            ],
            "aiModels": [
                134
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                29
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                67
            ],
            "billing": [
                84
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                123
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
                137
            ],
            "publicFeatureFlags": [
                401
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                460
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                193
            ],
            "link": [
                1
            ],
            "startAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                26
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
                502
            ],
            "availabilityObjectMetadataId": [
                502
            ],
            "availabilityType": [
                140
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                502
            ],
            "createdAt": [
                193
            ],
            "engineComponentKey": [
                227
            ],
            "frontComponent": [
                268
            ],
            "frontComponentId": [
                502
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                502
            ],
            "pageLayoutId": [
                502
            ],
            "payload": [
                141
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
            ],
            "workflowVersionId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                362
            ],
            "on_PathCommandMenuItemPayload": [
                387
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                49
            ],
            "files": [
                259
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                502
            ],
            "archivedAt": [
                193
            ],
            "authFailedAt": [
                193
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                403
            ],
            "connectionProviderId": [
                502
            ],
            "createdAt": [
                193
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                502
            ],
            "lastCredentialsRefreshedAt": [
                193
            ],
            "lastSignedInAt": [
                193
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                144
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                193
            ],
            "userWorkspaceId": [
                502
            ],
            "visibility": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountScope": {},
        "ConnectedImapSmtpCaldavAccount": {
            "connectionParameters": [
                281
            ],
            "handle": [
                1
            ],
            "id": [
                502
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                220
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
                502
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                502
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                50
            ],
            "targets": [
                52
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                57
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
                502
            ],
            "availabilityType": [
                140
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                502
            ],
            "engineComponentKey": [
                227
            ],
            "frontComponentId": [
                502
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
                502
            ],
            "pageLayoutId": [
                502
            ],
            "payload": [
                295
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                502
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
                324
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
                502
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
                254
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
                502
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
                502
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
                164
            ],
            "indexType": [
                288
            ],
            "objectMetadataId": [
                502
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
                502
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
                11
            ],
            "toolTriggerSettings": [
                295
            ],
            "universalIdentifier": [
                502
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
                502
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
                502
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                502
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                502
            ],
            "targetRecordId": [
                502
            ],
            "type": [
                354
            ],
            "userWorkspaceId": [
                502
            ],
            "viewId": [
                502
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
                162
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                165
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                169
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
                502
            ],
            "type": [
                380
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                379
            ],
            "pageLayoutId": [
                502
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
                295
            ],
            "objectMetadataId": [
                502
            ],
            "pageLayoutTabId": [
                502
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                628
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                502
            ],
            "filter": [
                295
            ],
            "objectMetadataId": [
                502
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
                502
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
                506
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                83
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                83
            ],
            "operationType": [
                586
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                593
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                595
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
                502
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                502
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                21
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
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
                502
            ],
            "viewId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                502
            ],
            "logicalOperator": [
                616
            ],
            "parentViewFilterGroupId": [
                502
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
            ],
            "operand": [
                617
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                502
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                502
            ],
            "viewId": [
                502
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
                502
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                502
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
                502
            ],
            "calendarFieldMetadataId": [
                502
            ],
            "calendarLayout": [
                610
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                21
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                502
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                619
            ],
            "mainGroupByFieldMetadataId": [
                502
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                502
            ],
            "openRecordIn": [
                620
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                623
            ],
            "visibility": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                622
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                502
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
                502
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
        "CreditUsedItem": {
            "creditsUsed": [
                11
            ],
            "label": [
                1
            ],
            "operation": [
                586
            ],
            "resource": [
                593
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                146
            ],
            "before": [
                146
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                502
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                502
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
                502
            ],
            "name": [
                271
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                502
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
                502
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                213
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
                502
            ],
            "pageLayoutId": [
                502
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
                502
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
                502
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                446
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
                502
            ],
            "status": [
                446
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                147
            ],
            "IMAP": [
                147
            ],
            "SMTP": [
                147
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
                627
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                193
            ],
            "domain": [
                1
            ],
            "id": [
                502
            ],
            "status": [
                224
            ],
            "tenantStatus": [
                225
            ],
            "unsubscribeHostnameStatus": [
                504
            ],
            "updatedAt": [
                193
            ],
            "verificationRecords": [
                605
            ],
            "verifiedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                627
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
                295
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
                8
            ],
            "jobs": [
                229
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                295
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
                193
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
                193
            ],
            "currentPeriodEnd": [
                193
            ],
            "expiresAt": [
                193
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
                193
            ],
            "start": [
                193
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
                237
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
                235
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                236
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
                238
            ],
            "first": [
                8
            ],
            "table": [
                243
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                239
            ],
            "records": [
                242
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
                295
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                193
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
                339
            ],
            "objectRecordEventsWithQueryIds": [
                369
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
                502
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
                247
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
                502
            ],
            "createdAt": [
                193
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
                502
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
                502
            ],
            "morphRelations": [
                422
            ],
            "name": [
                1
            ],
            "object": [
                356
            ],
            "objectMetadataId": [
                502
            ],
            "options": [
                295
            ],
            "relation": [
                422
            ],
            "settings": [
                295
            ],
            "type": [
                254
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                193
            ],
            "writability": [
                346
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                627
            ],
            "fieldDisplayMode": [
                251
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
                252
            ],
            "pageInfo": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                146
            ],
            "node": [
                248
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                253
            ],
            "id": [
                503
            ],
            "isActive": [
                111
            ],
            "isSystem": [
                111
            ],
            "isUIEditable": [
                111
            ],
            "isUIReadOnly": [
                111
            ],
            "objectMetadataId": [
                503
            ],
            "or": [
                253
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
                502
            ],
            "id": [
                502
            ],
            "objectMetadataId": [
                502
            ],
            "roleId": [
                502
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
                502
            ],
            "objectMetadataId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                627
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
                193
            ],
            "id": [
                502
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
                502
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
                193
            ],
            "fileId": [
                502
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
                193
            ],
            "id": [
                502
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
                627
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                502
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                446
            ],
            "type": [
                278
            ],
            "workspace": [
                647
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
                337
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                627
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
                502
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                62
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
                193
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                502
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
                502
            ],
            "updatedAt": [
                193
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                270
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                627
            ],
            "frontComponentId": [
                502
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                502
            ],
            "pageLayoutType": [
                380
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
                502
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
                502
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
                502
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
                502
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
                627
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
                220
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
                68
            ],
            "workspace": [
                651
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                193
            ],
            "id": [
                502
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                146
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
                193
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
            ],
            "order": [
                11
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                193
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
                503
            ],
            "isCustom": [
                111
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
                502
            ],
            "messages": [
                36
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
                502
            ],
            "messageThreadId": [
                502
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
                297
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                502
            ],
            "aggregateOperation": [
                21
            ],
            "axisNameDisplay": [
                76
            ],
            "color": [
                1
            ],
            "configurationType": [
                627
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
                8
            ],
            "isCumulative": [
                4
            ],
            "isStacked": [
                4
            ],
            "numberFormat": [
                126
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                370
            ],
            "primaryAxisGroupByFieldMetadataId": [
                502
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
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                370
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                502
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
                502
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
            "scope": [
                144
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
                502
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
                502
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                193
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
                502
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
                295
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
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
                11
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                502
            ],
            "applicationUniversalIdentifier": [
                502
            ],
            "id": [
                502
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                68
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
                295
            ],
            "name": [
                1
            ],
            "objects": [
                317
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                318
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                58
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
                319
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                320
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
                627
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignSendBlockerDTO": {
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
        "MessageChannel": {
            "connectedAccount": [
                143
            ],
            "connectedAccountId": [
                502
            ],
            "contactAutoCreationPolicy": [
                325
            ],
            "createdAt": [
                193
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
                502
            ],
            "importProgress": [
                8
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                332
            ],
            "pendingGroupEmailsAction": [
                326
            ],
            "syncStage": [
                327
            ],
            "syncStageStartedAt": [
                193
            ],
            "syncStatus": [
                328
            ],
            "syncedAt": [
                193
            ],
            "throttleFailureCount": [
                11
            ],
            "throttleRetryAfter": [
                193
            ],
            "type": [
                329
            ],
            "updatedAt": [
                193
            ],
            "visibility": [
                330
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
                193
            ],
            "externalId": [
                1
            ],
            "id": [
                502
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                502
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                333
            ],
            "updatedAt": [
                193
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
                193
            ],
            "emailAddress": [
                1
            ],
            "id": [
                502
            ],
            "reason": [
                337
            ],
            "source": [
                338
            ],
            "unsubscribeTopicId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                335
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
                368
            ],
            "recordId": [
                1
            ],
            "type": [
                340
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
                502
            ],
            "property": [
                1
            ],
            "provenance": [
                344
            ],
            "recordId": [
                502
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
                502
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                138
            ],
            "objectMetadataItems": [
                348
            ],
            "views": [
                349
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
                502
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
                502
            ],
            "key": [
                619
            ],
            "objectMetadataId": [
                502
            ],
            "type": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                469,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                632,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                17,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        502,
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
                        502
                    ],
                    "threadId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        502,
                        "UUID!"
                    ],
                    "roleId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        502,
                        "UUID!"
                    ],
                    "roleId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "authorizeApp": [
                71,
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
                122,
                {
                    "input": [
                        121,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                109
            ],
            "cancelSwitchBillingPlan": [
                109
            ],
            "cancelSwitchResourceCreditPrice": [
                109
            ],
            "checkCustomDomainValidRecords": [
                214
            ],
            "checkPublicDomainValidRecords": [
                214,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                102,
                {
                    "plan": [
                        93,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        475,
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
                57,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                57,
                {
                    "fileId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                142,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        502,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                374,
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
                263,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                263,
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
                263,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                263,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApiKey": [
                30,
                {
                    "input": [
                        150,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                324,
                {
                    "input": [
                        151,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                152,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        51,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                153,
                {
                    "input": [
                        154,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                65,
                {
                    "input": [
                        155,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                91
            ],
            "createCalendarEvent": [
                157,
                {
                    "input": [
                        156,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                9
            ],
            "createCommandMenuItem": [
                139,
                {
                    "input": [
                        158,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                212,
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
                160,
                {
                    "input": [
                        159,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                223,
                {
                    "input": [
                        161,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                262,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        261,
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
                268,
                {
                    "input": [
                        163,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                353,
                {
                    "inputs": [
                        168,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                613,
                {
                    "inputs": [
                        182,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                612,
                {
                    "inputs": [
                        183,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                618,
                {
                    "inputs": [
                        186,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                335,
                {
                    "input": [
                        167,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                353,
                {
                    "input": [
                        168,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                262,
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
                466,
                {
                    "input": [
                        464,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                27,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        502,
                        "UUID!"
                    ],
                    "properties": [
                        295
                    ],
                    "recordId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        149,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                248,
                {
                    "input": [
                        170,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                284,
                {
                    "input": [
                        171,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                307,
                {
                    "input": [
                        166,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                356,
                {
                    "input": [
                        172,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                429,
                {
                    "createRoleInput": [
                        177,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                377,
                {
                    "input": [
                        173,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                378,
                {
                    "input": [
                        174,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                381,
                {
                    "input": [
                        175,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                400,
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
                466,
                {
                    "input": [
                        465,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                469,
                {
                    "input": [
                        178,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                91,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        93,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        475,
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
                505,
                {
                    "input": [
                        179,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                584,
                {
                    "input": [
                        180,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                604,
                {
                    "input": [
                        181,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                609,
                {
                    "input": [
                        187,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                612,
                {
                    "input": [
                        183,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                613,
                {
                    "input": [
                        182,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                614,
                {
                    "input": [
                        185,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                615,
                {
                    "input": [
                        184,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                618,
                {
                    "input": [
                        186,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                621,
                {
                    "input": [
                        188,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                625,
                {
                    "input": [
                        189,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                469,
                {
                    "id": [
                        502,
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
                        35
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                324,
                {
                    "id": [
                        502,
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
                        194,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                139,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                143,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                632
            ],
            "deleteEmailGroupChannel": [
                324,
                {
                    "id": [
                        502,
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
                268,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                353,
                {
                    "ids": [
                        502,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                353,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                3,
                {
                    "input": [
                        14,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                248,
                {
                    "input": [
                        195,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                284,
                {
                    "input": [
                        196,
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
                356,
                {
                    "input": [
                        197,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        502,
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
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                198,
                {
                    "input": [
                        199,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                469,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                200,
                {
                    "twoFactorAuthenticationMethodId": [
                        502,
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
                        502,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                597
            ],
            "deleteUserFromWorkspace": [
                601,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                604,
                {
                    "id": [
                        502,
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
                612,
                {
                    "input": [
                        202,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                613,
                {
                    "input": [
                        201,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                614,
                {
                    "input": [
                        203,
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
                618,
                {
                    "input": [
                        204,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        205,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                625,
                {
                    "id": [
                        502,
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
                612,
                {
                    "input": [
                        208,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                613,
                {
                    "input": [
                        207,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                614,
                {
                    "input": [
                        209,
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
                618,
                {
                    "input": [
                        210,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        211,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                143,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                215,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                216,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                217,
                {
                    "input": [
                        218,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                221,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        502
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                86
            ],
            "enqueueJob": [
                230,
                {
                    "input": [
                        228,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                232,
                {
                    "input": [
                        231,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                636
            ],
            "executeOneLogicFunction": [
                309,
                {
                    "input": [
                        245,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                32,
                {
                    "apiKeyId": [
                        502,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                62,
                {
                    "applicationId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                68
            ],
            "generateTransientToken": [
                485
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                499,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                70,
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
                70,
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
                70,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                500,
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
                373
            ],
            "grantApplicationCapabilities": [
                40,
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
                        502,
                        "UUID!"
                    ],
                    "workspaceId": [
                        502,
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
                38,
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
                233
            ],
            "removeAgentChatMessageReaction": [
                17,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        424,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                416,
                {
                    "principal": [
                        413,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        421,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                62,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                70,
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
                        425,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                426,
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
                456,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                139,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                378,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                381,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                480,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                449,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                8
            ],
            "revokeApiKey": [
                30,
                {
                    "input": [
                        427,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                431,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                442,
                {
                    "input": [
                        438,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                54,
                {
                    "applicationId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                280,
                {
                    "connectionParameters": [
                        219,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        502
                    ]
                }
            ],
            "sendChatMessage": [
                449,
                {
                    "browsingContext": [
                        295
                    ],
                    "fileAttachments": [
                        260,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        502,
                        "[UUID!]"
                    ],
                    "messageId": [
                        502,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "shouldAssistantReply": [
                        4
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "threadId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                452,
                {
                    "input": [
                        451,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                455,
                {
                    "input": [
                        454,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                456,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        502
                    ]
                }
            ],
            "sendMessageCampaign": [
                458,
                {
                    "input": [
                        457,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                453,
                {
                    "input": [
                        459,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                34,
                {
                    "input": [
                        461,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                233,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                416,
                {
                    "accessLevel": [
                        412,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        421,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                416,
                {
                    "accessLevel": [
                        412,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        413,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        421,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                109,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                75,
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
                75,
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
                467,
                {
                    "input": [
                        468
                    ]
                }
            ],
            "signUpInWorkspace": [
                467,
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
                        502
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
                374,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "startChannelSync": [
                125,
                {
                    "connectedAccountId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                471,
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
                        502,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                472
            ],
            "switchBillingPlan": [
                109,
                {
                    "plan": [
                        93
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                109
            ],
            "syncApplication": [
                646,
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
                27,
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
                        28,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                57,
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
                487,
                {
                    "input": [
                        486,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                491,
                {
                    "input": [
                        488,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                490,
                {
                    "input": [
                        489,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                495,
                {
                    "input": [
                        492,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                494,
                {
                    "input": [
                        493,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                497,
                {
                    "input": [
                        496,
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
                13,
                {
                    "action": [
                        6,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        193
                    ],
                    "threadIds": [
                        502,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxStateInFilterStatus": [
                13,
                {
                    "action": [
                        6,
                        "AgentChatInboxAction!"
                    ],
                    "excludedThreadIds": [
                        502,
                        "[UUID!]!"
                    ],
                    "filterStatus": [
                        12,
                        "AgentChatThreadFilterStatus!"
                    ],
                    "snoozedUntil": [
                        193
                    ]
                }
            ],
            "updateApiKey": [
                30,
                {
                    "input": [
                        508,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                324,
                {
                    "input": [
                        509,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                38,
                {
                    "id": [
                        502,
                        "UUID!"
                    ],
                    "input": [
                        510,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                57,
                {
                    "input": [
                        511,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                61,
                {
                    "input": [
                        513,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                112,
                {
                    "input": [
                        515,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                139,
                {
                    "input": [
                        517,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                324,
                {
                    "input": [
                        518,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                268,
                {
                    "input": [
                        520,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                246,
                {
                    "input": [
                        522,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                353,
                {
                    "inputs": [
                        533,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                356,
                {
                    "inputs": [
                        534,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                618,
                {
                    "inputs": [
                        556,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                324,
                {
                    "input": [
                        525,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                331,
                {
                    "input": [
                        527,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                331,
                {
                    "input": [
                        529,
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
                353,
                {
                    "input": [
                        533,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        507,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        502
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
                248,
                {
                    "input": [
                        532,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        523,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                356,
                {
                    "input": [
                        534,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                429,
                {
                    "updateRoleInput": [
                        541,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        535,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                378,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        536,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                381,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        538,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        540,
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
                469,
                {
                    "input": [
                        543,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                480,
                {
                    "input": [
                        544,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                505,
                {
                    "input": [
                        545,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                584,
                {
                    "input": [
                        546,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                85,
                {
                    "userCreditsFallback": [
                        599,
                        "UserCreditsFallback!"
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
                604,
                {
                    "input": [
                        547,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        558,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                612,
                {
                    "input": [
                        551,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                613,
                {
                    "input": [
                        549,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                614,
                {
                    "input": [
                        554,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                615,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        553,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                618,
                {
                    "input": [
                        556,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                621,
                {
                    "input": [
                        559,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                625,
                {
                    "input": [
                        561,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                632,
                {
                    "data": [
                        564,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                632,
                {
                    "data": [
                        563,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                641,
                {
                    "roleId": [
                        502,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        565,
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
                57,
                {
                    "file": [
                        566,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                259,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        566,
                        "Upload!"
                    ],
                    "fileFolder": [
                        261,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                263,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        566,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                263,
                {
                    "file": [
                        566,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                263,
                {
                    "file": [
                        566,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                263,
                {
                    "file": [
                        566,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                255,
                {
                    "upsertFieldPermissionsInput": [
                        567,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                609,
                {
                    "input": [
                        570,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                364,
                {
                    "upsertObjectPermissionsInput": [
                        571,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                430,
                {
                    "upsertPermissionFlagsInput": [
                        572,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                574,
                {
                    "input": [
                        573,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                609,
                {
                    "input": [
                        575,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                65,
                {
                    "input": [
                        602,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                606,
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
                75,
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
                223,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                607,
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
                502
            ],
            "color": [
                1
            ],
            "createdAt": [
                193
            ],
            "folderId": [
                502
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                502
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                502
            ],
            "targetRecordId": [
                502
            ],
            "targetRecordIdentifier": [
                409
            ],
            "type": [
                354
            ],
            "updatedAt": [
                193
            ],
            "userWorkspaceId": [
                502
            ],
            "viewId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                502
            ],
            "color": [
                1
            ],
            "createdAt": [
                193
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                359,
                {
                    "filter": [
                        253,
                        "FieldFilter!"
                    ],
                    "paging": [
                        191,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                248
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "imageIdentifierFieldMetadataId": [
                502
            ],
            "indexMetadataList": [
                284
            ],
            "indexMetadatas": [
                361,
                {
                    "filter": [
                        287,
                        "IndexFilter!"
                    ],
                    "paging": [
                        191,
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
                502
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
                363
            ],
            "readability": [
                341
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                502
            ],
            "searchFieldMetadataList": [
                448
            ],
            "sharingReach": [
                371
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                193
            ],
            "writability": [
                346
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                358
            ],
            "pageInfo": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                146
            ],
            "node": [
                356
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                252
            ],
            "pageInfo": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                360
            ],
            "id": [
                503
            ],
            "isActive": [
                111
            ],
            "isRemote": [
                111
            ],
            "isSearchable": [
                111
            ],
            "isSystem": [
                111
            ],
            "isUICreatable": [
                111
            ],
            "isUIEditable": [
                111
            ],
            "isUIReadOnly": [
                111
            ],
            "or": [
                360
            ],
            "universalIdentifier": [
                503
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
                376
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                502
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
                502
            ],
            "restrictedFields": [
                295
            ],
            "rowLevelPermissionPredicateGroups": [
                433
            ],
            "rowLevelPermissionPredicates": [
                432
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
                502
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
                192
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                368
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
                367
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
                372
            ],
            "previousOnboardingStatus": [
                372
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
                146
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                146
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                502
            ],
            "createdAt": [
                193
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                502
            ],
            "deletedAt": [
                193
            ],
            "id": [
                502
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
                502
            ],
            "tabs": [
                378
            ],
            "type": [
                380
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                502
            ],
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                379
            ],
            "pageLayoutId": [
                502
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
            ],
            "widgets": [
                381
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                502
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                295
            ],
            "configuration": [
                626
            ],
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "gridPosition": [
                277
            ],
            "id": [
                502
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
                502
            ],
            "pageLayoutTabId": [
                502
            ],
            "position": [
                384
            ],
            "title": [
                1
            ],
            "type": [
                628
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                379
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
                379
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
                382
            ],
            "on_PageLayoutWidgetGridPosition": [
                383
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                386
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                385
            ],
            "index": [
                8
            ],
            "layoutMode": [
                379
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
                502
            ],
            "createdAt": [
                193
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                502
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                502
            ],
            "aggregateOperation": [
                21
            ],
            "color": [
                1
            ],
            "configurationType": [
                627
            ],
            "dateGranularity": [
                370
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
                8
            ],
            "groupByFieldMetadataId": [
                502
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
                126
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
                393
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
                502
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
        "PreviewMessageCampaignSendInput": {
            "campaignId": [
                1
            ],
            "scheduledAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                120
            ],
            "blockers": [
                323
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                502
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
                220
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
                502
            ],
            "createdAt": [
                193
            ],
            "domain": [
                1
            ],
            "id": [
                502
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
                247
            ],
            "metadata": [
                402
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
                399
            ],
            "IMAP": [
                399
            ],
            "SMTP": [
                399
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                66
            ],
            "authProviders": [
                67
            ],
            "displayName": [
                1
            ],
            "id": [
                502
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                650
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
                502
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
                18,
                {
                    "agentId": [
                        502,
                        "UUID!"
                    ],
                    "limit": [
                        8,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                22
            ],
            "apiKey": [
                30,
                {
                    "input": [
                        272,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                30
            ],
            "appConnection": [
                33,
                {
                    "id": [
                        10,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                33,
                {
                    "filter": [
                        304
                    ]
                }
            ],
            "appKeyValue": [
                34,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        35
                    ]
                }
            ],
            "appMessageChannels": [
                324,
                {
                    "filter": [
                        305
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                41,
                {
                    "applicationId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                42,
                {
                    "applicationId": [
                        502,
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
                447,
                {
                    "applicationId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                78,
                {
                    "input": [
                        79,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                102,
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
                502,
                {
                    "calendarEventId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                15,
                {
                    "threadId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                128,
                {
                    "threadId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                131,
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
                640,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                473,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                139,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                139
            ],
            "currentUser": [
                597
            ],
            "currentUserApplicationAuthorizations": [
                39
            ],
            "currentUserSessions": [
                600
            ],
            "currentWorkspace": [
                632
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
                234
            ],
            "eventLogs": [
                241,
                {
                    "input": [
                        240,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                44,
                {
                    "universalIdentifier": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                248,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                250,
                {
                    "filter": [
                        253,
                        "FieldFilter!"
                    ],
                    "paging": [
                        191,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                398,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                57,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        193
                    ],
                    "periodStart": [
                        193
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                61,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                132,
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
                57
            ],
            "findManyApplications": [
                38
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
                400
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
                        14,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                38,
                {
                    "id": [
                        502
                    ],
                    "universalIdentifier": [
                        502
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                57,
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
                298,
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
                634
            ],
            "findWorkspaceFromInviteHash": [
                632,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                639
            ],
            "frontComponent": [
                268,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                268
            ],
            "getAddressDetails": [
                394,
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
                24
            ],
            "getApiKeyRoles": [
                429
            ],
            "getApprovedAccessDomains": [
                65
            ],
            "getAutoCompleteAddress": [
                72,
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
                145,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                223
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
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                378,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                378,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                381,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                381,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                377,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        380
                    ]
                }
            ],
            "getPermissionFlags": [
                388
            ],
            "getPublicWorkspaceDataByDomain": [
                404,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                405,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                101
            ],
            "getRole": [
                429,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                429
            ],
            "getSSOIdentityProviders": [
                265
            ],
            "getToolIndex": [
                484
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
                581,
                {
                    "input": [
                        582
                    ]
                }
            ],
            "getView": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                612,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                613,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                613,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                612,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                614,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                615,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                615,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                614,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                618,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                618,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                621,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                621,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                609,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        623,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                637
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
                92
            ],
            "messageSuppressions": [
                336,
                {
                    "input": [
                        266,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                342,
                {
                    "input": [
                        345,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                347
            ],
            "mostlyEmptyFieldMetadataIds": [
                502,
                {
                    "objectMetadataId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                56
            ],
            "myCalendarChannels": [
                112,
                {
                    "connectedAccountId": [
                        502
                    ]
                }
            ],
            "myConnectedAccounts": [
                143
            ],
            "myMessageChannels": [
                324,
                {
                    "connectedAccountId": [
                        502
                    ]
                }
            ],
            "myMessageFolders": [
                331,
                {
                    "messageChannelId": [
                        502
                    ]
                }
            ],
            "myUserApplicationVariables": [
                642
            ],
            "navigationMenuItem": [
                353,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                353
            ],
            "object": [
                356,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                366
            ],
            "objects": [
                357,
                {
                    "filter": [
                        360,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        191,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                391,
                {
                    "input": [
                        392,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                120,
                {
                    "input": [
                        395,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                397,
                {
                    "input": [
                        396,
                        "PreviewMessageCampaignSendInput!"
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
                411,
                {
                    "targets": [
                        421,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                416,
                {
                    "target": [
                        421,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                469,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                469
            ],
            "timelineActivityTypes": [
                480
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                501,
                {
                    "userId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                505
            ],
            "usageLimits": [
                584
            ],
            "usageQuotaDefinitions": [
                588
            ],
            "usageQuotaScopeConsumption": [
                590,
                {
                    "input": [
                        591,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                592
            ],
            "validatePasswordResetToken": [
                603,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                604,
                {
                    "objectMetadataId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                625,
                {
                    "id": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                625
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                502
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
                502
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
                502
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
                502
            ],
            "permissions": [
                410
            ],
            "recordId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                502
            ],
            "workspaceMemberId": [
                502
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
                412
            ],
            "generalAccessLevel": [
                412
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                410
            ],
            "roles": [
                419
            ],
            "shares": [
                417
            ],
            "sharingMode": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                412
            ],
            "id": [
                10
            ],
            "principalId": [
                502
            ],
            "principalRoleId": [
                502
            ],
            "principalType": [
                414
            ],
            "rowCause": [
                415
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
                502
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
                627
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
                502
            ],
            "recordId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                248
            ],
            "sourceObjectMetadata": [
                356
            ],
            "targetFieldMetadata": [
                248
            ],
            "targetObjectMetadata": [
                356
            ],
            "type": [
                423
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
                502
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
                31
            ],
            "applicationId": [
                502
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
                255
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                364
            ],
            "permissionFlags": [
                430
            ],
            "rowLevelPermissionPredicateGroups": [
                433
            ],
            "rowLevelPermissionPredicates": [
                432
            ],
            "universalIdentifier": [
                502
            ],
            "workspaceMembers": [
                641
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
                502
            ],
            "roleId": [
                502
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
                437
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
                435
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
                502
            ],
            "logicalOperator": [
                435
            ],
            "objectMetadataId": [
                502
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                502
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
                502
            ],
            "id": [
                502
            ],
            "operand": [
                437
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                502
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
                440
            ],
            "messages": [
                440
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                295
            ],
            "runAsWorkspaceMemberId": [
                502
            ],
            "thread": [
                443
            ],
            "waitForCompletion": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                502
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
                439
            ],
            "content": [
                1
            ],
            "role": [
                441
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
                295
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                502
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
                502
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                446
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
                502
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                446
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
                193
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                502
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                502
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
                450
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
            "workspaceMemberIds": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                502
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
                639
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                120
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
                35
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
                502
            ],
            "createdAt": [
                193
            ],
            "frontComponentId": [
                502
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "position": [
                11
            ],
            "scope": [
                463
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
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
                502
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
                502
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                446
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
                68
            ],
            "workspace": [
                651
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
                502
            ],
            "content": [
                1
            ],
            "createdAt": [
                193
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                428
            ],
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                649
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
                242,
                {
                    "fieldFilters": [
                        236,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        243,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                408,
                {
                    "input": [
                        176,
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
                5,
                {
                    "threadId": [
                        502,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                244,
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
                478
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
                627
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
                502
            ],
            "createdAt": [
                193
            ],
            "emit": [
                481
            ],
            "frontComponentUniversalIdentifier": [
                502
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                502
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                502
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                502
            ],
            "on": [
                1
            ],
            "through": [
                482
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                502
            ],
            "relationFieldUniversalIdentifier": [
                502
            ],
            "triggerFieldUniversalIdentifiers": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                627
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
                68
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                502
            ],
            "personFilter": [
                295
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                193
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
                69
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                502
            ],
            "gt": [
                502
            ],
            "gte": [
                502
            ],
            "iLike": [
                502
            ],
            "in": [
                502
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                502
            ],
            "lt": [
                502
            ],
            "lte": [
                502
            ],
            "neq": [
                502
            ],
            "notILike": [
                502
            ],
            "notIn": [
                502
            ],
            "notLike": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                193
            ],
            "description": [
                1
            ],
            "id": [
                502
            ],
            "name": [
                1
            ],
            "updatedAt": [
                193
            ],
            "visibility": [
                506
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
                502
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
                502
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
                502
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
                502
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                330
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
                512
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
                514
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
                502
            ],
            "update": [
                516
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                113
            ],
            "excludePrivateEvents": [
                4
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                116
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                502
            ],
            "availabilityType": [
                140
            ],
            "engineComponentKey": [
                227
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                502
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
                502
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
                502
            ],
            "options": [
                295
            ],
            "settings": [
                295
            ],
            "translations": [
                343
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
                502
            ],
            "update": [
                521
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
                502
            ],
            "update": [
                524
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
                11
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
                502
            ],
            "update": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                325
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
                332
            ],
            "visibility": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                502
            ],
            "update": [
                528
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
                502
            ],
            "update": [
                528
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
                502
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
                502
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
                502
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
                502
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
                363
            ],
            "readability": [
                341
            ],
            "sharingReach": [
                371
            ],
            "shortcut": [
                1
            ],
            "translations": [
                343
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                502
            ],
            "update": [
                519
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                502
            ],
            "update": [
                530
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                502
            ],
            "update": [
                531
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
                502
            ],
            "type": [
                380
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
                379
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
                502
            ],
            "layoutMode": [
                379
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                539
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
                502
            ],
            "pageLayoutTabId": [
                502
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                628
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
                502
            ],
            "objectMetadataId": [
                502
            ],
            "pageLayoutTabId": [
                502
            ],
            "position": [
                295
            ],
            "title": [
                1
            ],
            "type": [
                628
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
                502
            ],
            "tabs": [
                537
            ],
            "type": [
                380
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                502
            ],
            "update": [
                542
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
                502
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
                502
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                343
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
                506
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                502
            ],
            "payload": [
                180
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                502
            ],
            "update": [
                548
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
                502
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
                502
            ],
            "update": [
                550
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
                502
            ],
            "update": [
                552
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                21
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                502
            ],
            "logicalOperator": [
                616
            ],
            "parentViewFilterGroupId": [
                502
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                502
            ],
            "update": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                502
            ],
            "operand": [
                617
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                502
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                502
            ],
            "update": [
                557
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                502
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
                502
            ],
            "calendarFieldMetadataId": [
                502
            ],
            "calendarLayout": [
                610
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                502
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                21
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                502
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                502
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                620
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                623
            ],
            "visibility": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                502
            ],
            "update": [
                560
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                622
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
                502
            ],
            "update": [
                562
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
                23
            ],
            "aiChatModelTier": [
                23
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
                502
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
                638
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                256
            ],
            "roleId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                502
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                568
            ],
            "id": [
                502
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
                568
            ],
            "groups": [
                569
            ],
            "widgetId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                365
            ],
            "roleId": [
                502
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                502
            ],
            "predicateGroups": [
                434
            ],
            "predicates": [
                436
            ],
            "roleId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                433
            ],
            "predicates": [
                432
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                579
            ],
            "viewFields": [
                576
            ],
            "viewFilterGroups": [
                577
            ],
            "viewFilters": [
                578
            ],
            "viewSorts": [
                580
            ],
            "widgetId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                21
            ],
            "fieldMetadataId": [
                502
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                502
            ],
            "logicalOperator": [
                616
            ],
            "parentViewFilterGroupId": [
                502
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
                502
            ],
            "id": [
                502
            ],
            "operand": [
                617
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                502
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                502
            ],
            "calendarFieldMetadataId": [
                502
            ],
            "calendarLayout": [
                610
            ],
            "kanbanAggregateOperation": [
                21
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                502
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                502
            ],
            "openRecordIn": [
                620
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                622
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                193
            ],
            "periodStart": [
                193
            ],
            "timeSeries": [
                594
            ],
            "usageByApplication": [
                583
            ],
            "usageByModel": [
                583
            ],
            "usageByOperationType": [
                583
            ],
            "usageByUser": [
                583
            ],
            "userDailyUsage": [
                596
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                586
            ],
            "periodEnd": [
                193
            ],
            "periodStart": [
                193
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
            "userCreditsUsed": [
                11
            ],
            "workspaceCreditsUsed": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimit": {
            "burstValue": [
                83
            ],
            "createdAt": [
                193
            ],
            "id": [
                502
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                83
            ],
            "operationType": [
                586
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                593
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                595
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                595
            ],
            "operationType": [
                586
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                585
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                589
            ],
            "resourceType": [
                593
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                587
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
                586
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                595
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                83
            ],
            "periodEnd": [
                193
            ],
            "periodStart": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                586
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                593
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                595
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                83
            ],
            "id": [
                502
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                83
            ],
            "operationType": [
                586
            ],
            "periodEnd": [
                193
            ],
            "periodStart": [
                193
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                83
            ],
            "resourceType": [
                593
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
                595
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
            "workspaceCreditsUsed": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                594
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
                74
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                193
            ],
            "currentUserWorkspace": [
                601
            ],
            "currentWorkspace": [
                632
            ],
            "deletedAt": [
                193
            ],
            "deletedWorkspaceMembers": [
                206
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
                502
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
                372
            ],
            "previousOnboardingStatus": [
                372
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                193
            ],
            "userVars": [
                296
            ],
            "userWorkspaces": [
                601
            ],
            "workspaceMember": [
                641
            ],
            "workspaceMembers": [
                641
            ],
            "workspaces": [
                601
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
        "UserCreditsFallback": {},
        "UserSession": {
            "authProvider": [
                1
            ],
            "createdAt": [
                193
            ],
            "expiresAt": [
                193
            ],
            "id": [
                502
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
                193
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "id": [
                502
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                364
            ],
            "objectsPermissions": [
                364
            ],
            "permissionFlags": [
                389
            ],
            "twoFactorAuthenticationMethodSummary": [
                498
            ],
            "updatedAt": [
                193
            ],
            "user": [
                597
            ],
            "userId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                502
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
                502
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
                502
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                502
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
                68
            ],
            "workspaceUrls": [
                650
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
                502
            ],
            "calendarEndFieldMetadataId": [
                502
            ],
            "calendarFieldMetadataId": [
                502
            ],
            "calendarLayout": [
                610
            ],
            "createdAt": [
                193
            ],
            "createdByUserWorkspaceId": [
                502
            ],
            "deletedAt": [
                193
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                502
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
                21
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                502
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                619
            ],
            "mainGroupByFieldMetadataId": [
                502
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                502
            ],
            "openRecordIn": [
                620
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                623
            ],
            "universalIdentifier": [
                502
            ],
            "updatedAt": [
                193
            ],
            "viewFieldGroups": [
                613
            ],
            "viewFields": [
                612
            ],
            "viewFilterGroups": [
                615
            ],
            "viewFilters": [
                614
            ],
            "viewGroups": [
                618
            ],
            "viewSorts": [
                621
            ],
            "visibility": [
                624
            ],
            "workspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                21
            ],
            "applicationId": [
                502
            ],
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
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
                502
            ],
            "updatedAt": [
                193
            ],
            "viewFieldGroupId": [
                502
            ],
            "viewId": [
                502
            ],
            "workspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "id": [
                502
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
                193
            ],
            "viewFields": [
                612
            ],
            "viewId": [
                502
            ],
            "workspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
            ],
            "operand": [
                617
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                502
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                193
            ],
            "value": [
                295
            ],
            "viewFilterGroupId": [
                502
            ],
            "viewId": [
                502
            ],
            "workspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "id": [
                502
            ],
            "logicalOperator": [
                616
            ],
            "parentViewFilterGroupId": [
                502
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                193
            ],
            "viewId": [
                502
            ],
            "workspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "fieldValue": [
                1
            ],
            "id": [
                502
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "updatedAt": [
                193
            ],
            "viewId": [
                502
            ],
            "workspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "direction": [
                622
            ],
            "fieldMetadataId": [
                502
            ],
            "id": [
                502
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                193
            ],
            "viewId": [
                502
            ],
            "workspaceId": [
                502
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
                502
            ],
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "description": [
                1
            ],
            "id": [
                502
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                20
            ],
            "on_BarChartConfiguration": [
                77
            ],
            "on_CalendarConfiguration": [
                117
            ],
            "on_CallRecordingSummaryConfiguration": [
                118
            ],
            "on_CallRecordingTranscriptConfiguration": [
                119
            ],
            "on_ChatConfiguration": [
                127
            ],
            "on_ChatThreadsConfiguration": [
                130
            ],
            "on_EmailThreadConfiguration": [
                222
            ],
            "on_EmailsConfiguration": [
                226
            ],
            "on_FieldConfiguration": [
                249
            ],
            "on_FieldRichTextConfiguration": [
                257
            ],
            "on_FieldsConfiguration": [
                258
            ],
            "on_FilesConfiguration": [
                264
            ],
            "on_FormFieldConfiguration": [
                267
            ],
            "on_FrontComponentConfiguration": [
                269
            ],
            "on_IframeConfiguration": [
                279
            ],
            "on_LineChartConfiguration": [
                299
            ],
            "on_MessageCampaignBodyConfiguration": [
                321
            ],
            "on_MessageCampaignDetailsConfiguration": [
                322
            ],
            "on_NotesConfiguration": [
                355
            ],
            "on_PieChartConfiguration": [
                390
            ],
            "on_RecordTableConfiguration": [
                420
            ],
            "on_StandaloneRichTextConfiguration": [
                470
            ],
            "on_TasksConfiguration": [
                479
            ],
            "on_TimelineConfiguration": [
                483
            ],
            "on_ViewConfiguration": [
                611
            ],
            "on_WorkflowConfiguration": [
                629
            ],
            "on_WorkflowRunConfiguration": [
                630
            ],
            "on_WorkflowVersionConfiguration": [
                631
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                633
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                23
            ],
            "aiChatModelTier": [
                23
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
                85
            ],
            "billingEntitlements": [
                87
            ],
            "billingSubscriptions": [
                103
            ],
            "createdAt": [
                193
            ],
            "currentBillingSubscription": [
                103
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                429
            ],
            "deletedAt": [
                193
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
                246
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                502
            ],
            "installedApplications": [
                38
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
                502
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
                193
            ],
            "viewFields": [
                612
            ],
            "viewFilterGroups": [
                615
            ],
            "viewFilters": [
                614
            ],
            "viewGroups": [
                618
            ],
            "viewSorts": [
                621
            ],
            "views": [
                609
            ],
            "workspaceCustomApplication": [
                38
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                638
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                650
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
                295
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                635
            ],
            "personEnrichment": [
                295
            ],
            "personOutcome": [
                648
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
                193
            ],
            "id": [
                502
            ],
            "roleId": [
                502
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
                643
            ],
            "id": [
                502
            ],
            "locale": [
                1
            ],
            "name": [
                271
            ],
            "numberFormat": [
                644
            ],
            "openRecordIn": [
                375
            ],
            "roles": [
                429
            ],
            "timeFormat": [
                645
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
                502
            ],
            "userWorkspaceId": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                502
            ],
            "variables": [
                598
            ],
            "workspaceMemberId": [
                502
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
                502
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
                502
            ],
            "workspaceUrls": [
                650
            ],
            "__typename": [
                1
            ]
        }
    }
}