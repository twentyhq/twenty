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
        57,
        63,
        75,
        79,
        80,
        82,
        87,
        92,
        98,
        103,
        109,
        112,
        113,
        114,
        115,
        123,
        125,
        139,
        143,
        145,
        147,
        191,
        192,
        219,
        223,
        224,
        226,
        236,
        242,
        246,
        250,
        253,
        260,
        275,
        277,
        287,
        294,
        295,
        296,
        307,
        309,
        324,
        325,
        326,
        327,
        328,
        329,
        331,
        332,
        333,
        336,
        337,
        339,
        340,
        343,
        345,
        349,
        353,
        362,
        369,
        370,
        371,
        374,
        378,
        379,
        384,
        388,
        411,
        413,
        414,
        417,
        422,
        434,
        436,
        440,
        445,
        462,
        474,
        475,
        477,
        501,
        503,
        505,
        565,
        585,
        592,
        594,
        598,
        609,
        615,
        616,
        618,
        619,
        621,
        622,
        623,
        626,
        627,
        632,
        634,
        637,
        642,
        643,
        644,
        647,
        648
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
                294
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
                501
            ],
            "createdAt": [
                192
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                294
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
                294
            ],
            "roleId": [
                501
            ],
            "triggers": [
                294
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatEvent": {
            "event": [
                294
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
                192
            ],
            "deletedAt": [
                192
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
                192
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                192
            ],
            "id": [
                501
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                192
            ],
            "lastReadAt": [
                192
            ],
            "snoozedUntil": [
                192
            ],
            "threadId": [
                501
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                501
            ],
            "createdAt": [
                192
            ],
            "id": [
                501
            ],
            "parts": [
                15
            ],
            "processedAt": [
                192
            ],
            "reactions": [
                16
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
                501
            ],
            "senderWorkspaceMemberId": [
                501
            ],
            "status": [
                1
            ],
            "threadId": [
                501
            ],
            "turnId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                192
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                501
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                501
            ],
            "messageId": [
                501
            ],
            "orderIndex": [
                8
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                294
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
                294
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                294
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
                501
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "createdAt": [
                192
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
                192
            ],
            "errorMessage": [
                1
            ],
            "id": [
                501
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
                192
            ],
            "status": [
                18
            ],
            "threadId": [
                501
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
                501
            ],
            "aggregateOperation": [
                20
            ],
            "configurationType": [
                626
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                294
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "label": [
                1
            ],
            "numberFormat": [
                125
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                406
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
                192
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
                192
            ],
            "expiresAt": [
                192
            ],
            "id": [
                501
            ],
            "name": [
                1
            ],
            "revokedAt": [
                192
            ],
            "role": [
                428
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                192
            ],
            "id": [
                501
            ],
            "name": [
                1
            ],
            "revokedAt": [
                192
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
                143
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
                294
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
                192
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
                501
            ],
            "role": [
                333
            ],
            "workspaceMemberId": [
                501
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
                59
            ],
            "applicationRegistrationId": [
                501
            ],
            "applicationVariables": [
                62
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                294
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                138
            ],
            "createdAt": [
                192
            ],
            "defaultLogicFunctionRole": [
                428
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                267
            ],
            "healthCheckLogicFunctionId": [
                501
            ],
            "id": [
                501
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                306
            ],
            "logoFileId": [
                501
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                355
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                501
            ],
            "settingsCustomTabFrontComponentId": [
                501
            ],
            "settingsMenuItems": [
                461
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                501
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                192
            ],
            "id": [
                501
            ],
            "lastAuthorizedAt": [
                192
            ],
            "lastUsedAt": [
                192
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                501
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                501
            ],
            "archivedAt": [
                192
            ],
            "authFailedAt": [
                192
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                402
            ],
            "connectionProviderId": [
                501
            ],
            "createdAt": [
                192
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                501
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                192
            ],
            "lastSignedInAt": [
                192
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                143
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                192
            ],
            "userWorkspaceId": [
                501
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
                501
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
                147
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
                294
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
                57
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
                501
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
                260
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
                260
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
                192
            ],
            "fileFolder": [
                260
            ],
            "fileId": [
                501
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
        "ApplicationPreferences": {
            "applicationId": [
                501
            ],
            "settingsMenuItems": [
                461
            ],
            "variables": [
                597
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                192
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                501
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
                501
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                57
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                192
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
                189
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
                607
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                501
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                57
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                192
            ],
            "description": [
                1
            ],
            "id": [
                501
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
                294
            ],
            "type": [
                1
            ],
            "updatedAt": [
                192
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
        "ApplicationVariable": {
            "description": [
                1
            ],
            "id": [
                501
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
                294
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
                192
            ],
            "domain": [
                1
            ],
            "id": [
                501
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
                444
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                192
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
                501
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
                443
            ],
            "workspaceUrls": [
                649
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
                501
            ],
            "aggregateOperation": [
                20
            ],
            "axisNameDisplay": [
                75
            ],
            "color": [
                1
            ],
            "configurationType": [
                626
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
                294
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
                125
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                369
            ],
            "primaryAxisGroupByFieldMetadataId": [
                501
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                275
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                369
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                501
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                275
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
                294
            ],
            "formattedToRawLookup": [
                294
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
                294
            ],
            "objectMetadataId": [
                501
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
                107
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
                501
            ],
            "userCreditsFallback": [
                598
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
                475
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
            "downgradePlanKeys": [
                92
            ],
            "isSellable": [
                4
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
            "upgradePlanKeys": [
                92
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
                109
            ],
            "recurringInterval": [
                474
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
                109
            ],
            "recurringInterval": [
                474
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
                109
            ],
            "productKey": [
                98
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                192
            ],
            "periodStart": [
                192
            ],
            "productKey": [
                98
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
                104
            ],
            "cancelAt": [
                192
            ],
            "collectionMethod": [
                103
            ],
            "currentPeriodEnd": [
                192
            ],
            "id": [
                501
            ],
            "interval": [
                474
            ],
            "metadata": [
                294
            ],
            "phases": [
                105
            ],
            "status": [
                475
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
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
                501
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
                106
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
                501
            ],
            "contactAutoCreationPolicy": [
                112
            ],
            "createdAt": [
                192
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                501
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                113
            ],
            "syncStageStartedAt": [
                192
            ],
            "syncStatus": [
                114
            ],
            "syncedAt": [
                192
            ],
            "throttleFailureCount": [
                11
            ],
            "updatedAt": [
                192
            ],
            "visibility": [
                115
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
                626
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                626
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
                123
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
                626
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                294
            ],
            "error": [
                128
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
                626
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
                349
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                351
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
                132
            ],
            "aiModelTiers": [
                134
            ],
            "aiModels": [
                133
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
                122
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
                136
            ],
            "publicFeatureFlags": [
                400
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                459
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                476
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                192
            ],
            "link": [
                1
            ],
            "startAt": [
                192
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
                501
            ],
            "availabilityObjectMetadataId": [
                501
            ],
            "availabilityType": [
                139
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                501
            ],
            "createdAt": [
                192
            ],
            "engineComponentKey": [
                226
            ],
            "frontComponent": [
                267
            ],
            "frontComponentId": [
                501
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                501
            ],
            "pageLayoutId": [
                501
            ],
            "payload": [
                140
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
            ],
            "workflowVersionId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                361
            ],
            "on_PathCommandMenuItemPayload": [
                386
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
                258
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                501
            ],
            "archivedAt": [
                192
            ],
            "authFailedAt": [
                192
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                402
            ],
            "connectionProviderId": [
                501
            ],
            "createdAt": [
                192
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                501
            ],
            "lastCredentialsRefreshedAt": [
                192
            ],
            "lastSignedInAt": [
                192
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                143
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                192
            ],
            "userWorkspaceId": [
                501
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
                280
            ],
            "handle": [
                1
            ],
            "id": [
                501
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                219
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
                294
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
                294
            ],
            "roleId": [
                501
            ],
            "triggers": [
                294
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                501
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                329
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
                56
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
                501
            ],
            "availabilityType": [
                139
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                501
            ],
            "engineComponentKey": [
                226
            ],
            "frontComponentId": [
                501
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
                501
            ],
            "pageLayoutId": [
                501
            ],
            "payload": [
                294
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                501
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
                323
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
                294
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
                294
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                501
            ],
            "options": [
                294
            ],
            "relationCreationPayload": [
                294
            ],
            "settings": [
                294
            ],
            "type": [
                253
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
                501
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
                501
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
                163
            ],
            "indexType": [
                287
            ],
            "objectMetadataId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                294
            ],
            "databaseEventTriggerSettings": [
                294
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                294
            ],
            "id": [
                501
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                294
            ],
            "source": [
                294
            ],
            "timeoutSeconds": [
                11
            ],
            "toolTriggerSettings": [
                294
            ],
            "universalIdentifier": [
                501
            ],
            "workflowActionTriggerSettings": [
                294
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
                501
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
                501
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                501
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                501
            ],
            "targetRecordId": [
                501
            ],
            "type": [
                353
            ],
            "userWorkspaceId": [
                501
            ],
            "viewId": [
                501
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
                294
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
                161
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                164
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                168
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
                501
            ],
            "type": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                378
            ],
            "pageLayoutId": [
                501
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
                294
            ],
            "objectMetadataId": [
                501
            ],
            "pageLayoutTabId": [
                501
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                501
            ],
            "filter": [
                294
            ],
            "objectMetadataId": [
                501
            ],
            "orderBy": [
                294
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
                501
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
                505
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
                585
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                592
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                594
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
                501
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                501
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
                501
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
                501
            ],
            "id": [
                501
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
                501
            ],
            "viewId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                501
            ],
            "logicalOperator": [
                615
            ],
            "parentViewFilterGroupId": [
                501
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
            ],
            "operand": [
                616
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                501
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
            ],
            "viewFilterGroupId": [
                501
            ],
            "viewId": [
                501
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
                501
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                501
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
                501
            ],
            "calendarFieldMetadataId": [
                501
            ],
            "calendarLayout": [
                609
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                501
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                618
            ],
            "mainGroupByFieldMetadataId": [
                501
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                501
            ],
            "openRecordIn": [
                619
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                622
            ],
            "visibility": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                621
            ],
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                501
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
                501
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
                585
            ],
            "resource": [
                592
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                145
            ],
            "before": [
                145
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                501
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                501
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
                501
            ],
            "name": [
                270
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                501
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
                501
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                212
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
                501
            ],
            "pageLayoutId": [
                501
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
                501
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
                501
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                445
            ],
            "type": [
                277
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                501
            ],
            "status": [
                445
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                146
            ],
            "IMAP": [
                146
            ],
            "SMTP": [
                146
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
                626
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                192
            ],
            "domain": [
                1
            ],
            "id": [
                501
            ],
            "status": [
                223
            ],
            "tenantStatus": [
                224
            ],
            "unsubscribeHostnameStatus": [
                503
            ],
            "updatedAt": [
                192
            ],
            "verificationRecords": [
                604
            ],
            "verifiedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                626
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
                294
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
                294
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
                228
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                294
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
                192
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
                192
            ],
            "currentPeriodEnd": [
                192
            ],
            "expiresAt": [
                192
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
                192
            ],
            "start": [
                192
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
                236
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
                234
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                235
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
                237
            ],
            "first": [
                8
            ],
            "table": [
                242
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                238
            ],
            "records": [
                241
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
                294
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                192
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
                338
            ],
            "objectRecordEventsWithQueryIds": [
                368
            ],
            "queueJobEvents": [
                297
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                501
            ],
            "payload": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                246
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
                501
            ],
            "createdAt": [
                192
            ],
            "defaultValue": [
                294
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                501
            ],
            "morphRelations": [
                421
            ],
            "name": [
                1
            ],
            "object": [
                355
            ],
            "objectMetadataId": [
                501
            ],
            "options": [
                294
            ],
            "relation": [
                421
            ],
            "settings": [
                294
            ],
            "type": [
                253
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                192
            ],
            "writability": [
                345
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                626
            ],
            "fieldDisplayMode": [
                250
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
                251
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                145
            ],
            "node": [
                247
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                252
            ],
            "id": [
                502
            ],
            "isActive": [
                110
            ],
            "isSystem": [
                110
            ],
            "isUIEditable": [
                110
            ],
            "isUIReadOnly": [
                110
            ],
            "objectMetadataId": [
                502
            ],
            "or": [
                252
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
                501
            ],
            "id": [
                501
            ],
            "objectMetadataId": [
                501
            ],
            "roleId": [
                501
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
                501
            ],
            "objectMetadataId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                626
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
                192
            ],
            "id": [
                501
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
                501
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
                192
            ],
            "fileId": [
                501
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
                192
            ],
            "id": [
                501
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
                626
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                501
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                445
            ],
            "type": [
                277
            ],
            "workspace": [
                646
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
                336
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                626
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
                501
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                61
            ],
            "applicationVariables": [
                294
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
                192
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                501
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
                501
            ],
            "updatedAt": [
                192
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                626
            ],
            "frontComponentId": [
                501
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                501
            ],
            "pageLayoutType": [
                379
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
                501
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
                501
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
                501
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
                501
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
                626
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
                281
            ],
            "IMAP": [
                281
            ],
            "SMTP": [
                281
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
                219
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
                650
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                192
            ],
            "id": [
                501
            ],
            "indexFieldMetadataList": [
                285
            ],
            "indexType": [
                287
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
                192
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                145
            ],
            "node": [
                283
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                192
            ],
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
            ],
            "order": [
                11
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                286
            ],
            "id": [
                502
            ],
            "isCustom": [
                110
            ],
            "or": [
                286
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                501
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
                290
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
                501
            ],
            "messageThreadId": [
                501
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
                296
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                501
            ],
            "aggregateOperation": [
                20
            ],
            "axisNameDisplay": [
                75
            ],
            "color": [
                1
            ],
            "configurationType": [
                626
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
                294
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
                125
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                369
            ],
            "primaryAxisGroupByFieldMetadataId": [
                501
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                275
            ],
            "rangeMax": [
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                369
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                501
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                275
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
                294
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                302
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
                294
            ],
            "objectMetadataId": [
                501
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
                301
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
                143
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
                501
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
                501
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                192
            ],
            "cronTriggerSettings": [
                294
            ],
            "databaseEventTriggerSettings": [
                294
            ],
            "description": [
                1
            ],
            "executionMode": [
                307
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                294
            ],
            "id": [
                501
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
                294
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
            ],
            "workflowActionTriggerSettings": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                294
            ],
            "duration": [
                11
            ],
            "error": [
                294
            ],
            "logs": [
                1
            ],
            "status": [
                309
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                501
            ],
            "applicationUniversalIdentifier": [
                501
            ],
            "id": [
                501
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                501
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
                294
            ],
            "name": [
                1
            ],
            "objects": [
                316
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "roles": [
                317
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                57
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
                318
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                319
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
                626
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                626
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
                142
            ],
            "connectedAccountId": [
                501
            ],
            "contactAutoCreationPolicy": [
                324
            ],
            "createdAt": [
                192
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
                501
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
                331
            ],
            "pendingGroupEmailsAction": [
                325
            ],
            "syncStage": [
                326
            ],
            "syncStageStartedAt": [
                192
            ],
            "syncStatus": [
                327
            ],
            "syncedAt": [
                192
            ],
            "throttleFailureCount": [
                11
            ],
            "throttleRetryAfter": [
                192
            ],
            "type": [
                328
            ],
            "updatedAt": [
                192
            ],
            "visibility": [
                329
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
                192
            ],
            "externalId": [
                1
            ],
            "id": [
                501
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                501
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                332
            ],
            "updatedAt": [
                192
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
                192
            ],
            "emailAddress": [
                1
            ],
            "id": [
                501
            ],
            "reason": [
                336
            ],
            "source": [
                337
            ],
            "unsubscribeTopicId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                334
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
                367
            ],
            "recordId": [
                1
            ],
            "type": [
                339
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
                501
            ],
            "property": [
                1
            ],
            "provenance": [
                343
            ],
            "recordId": [
                501
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
                501
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "MetadataWritability": {},
        "MinimalMetadata": {
            "collectionHashes": [
                137
            ],
            "objectMetadataItems": [
                347
            ],
            "views": [
                348
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
                501
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
                501
            ],
            "key": [
                618
            ],
            "objectMetadataId": [
                501
            ],
            "type": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                468,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                631,
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
                        501,
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
                        501
                    ],
                    "threadId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        501,
                        "UUID!"
                    ],
                    "roleId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        501,
                        "UUID!"
                    ],
                    "roleId": [
                        501,
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
                121,
                {
                    "input": [
                        120,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                108
            ],
            "cancelSwitchBillingPlan": [
                108
            ],
            "cancelSwitchResourceCreditPrice": [
                108
            ],
            "checkCustomDomainValidRecords": [
                213
            ],
            "checkPublicDomainValidRecords": [
                213,
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
                        474,
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
                56,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                56,
                {
                    "fileId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                141,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        501,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                373,
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
                262,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                262,
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
                262,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                262,
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
                        149,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                323,
                {
                    "input": [
                        150,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                151,
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
                152,
                {
                    "input": [
                        153,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                64,
                {
                    "input": [
                        154,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                90
            ],
            "createCalendarEvent": [
                156,
                {
                    "input": [
                        155,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                9
            ],
            "createCommandMenuItem": [
                138,
                {
                    "input": [
                        157,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                211,
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
                159,
                {
                    "input": [
                        158,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                222,
                {
                    "input": [
                        160,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                261,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        260,
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
                267,
                {
                    "input": [
                        162,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                352,
                {
                    "inputs": [
                        167,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                612,
                {
                    "inputs": [
                        181,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                611,
                {
                    "inputs": [
                        182,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                617,
                {
                    "inputs": [
                        185,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                334,
                {
                    "input": [
                        166,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                352,
                {
                    "input": [
                        167,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                261,
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
                465,
                {
                    "input": [
                        463,
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
                        501,
                        "UUID!"
                    ],
                    "properties": [
                        294
                    ],
                    "recordId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        148,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                247,
                {
                    "input": [
                        169,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                283,
                {
                    "input": [
                        170,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                306,
                {
                    "input": [
                        165,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                355,
                {
                    "input": [
                        171,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                428,
                {
                    "createRoleInput": [
                        176,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                376,
                {
                    "input": [
                        172,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                377,
                {
                    "input": [
                        173,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                380,
                {
                    "input": [
                        174,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                399,
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
                465,
                {
                    "input": [
                        464,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                468,
                {
                    "input": [
                        177,
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
                        474,
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
                504,
                {
                    "input": [
                        178,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                583,
                {
                    "input": [
                        179,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                603,
                {
                    "input": [
                        180,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                608,
                {
                    "input": [
                        186,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                611,
                {
                    "input": [
                        182,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                612,
                {
                    "input": [
                        181,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                613,
                {
                    "input": [
                        184,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                614,
                {
                    "input": [
                        183,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                617,
                {
                    "input": [
                        185,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                620,
                {
                    "input": [
                        187,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                624,
                {
                    "input": [
                        188,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                468,
                {
                    "id": [
                        501,
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
                323,
                {
                    "id": [
                        501,
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
                        193,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                138,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                142,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                631
            ],
            "deleteEmailGroupChannel": [
                323,
                {
                    "id": [
                        501,
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
                267,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                352,
                {
                    "ids": [
                        501,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                352,
                {
                    "id": [
                        501,
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
                247,
                {
                    "input": [
                        194,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                283,
                {
                    "input": [
                        195,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                306,
                {
                    "input": [
                        310,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                355,
                {
                    "input": [
                        196,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        501,
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
                        501,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                197,
                {
                    "input": [
                        198,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                468,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                199,
                {
                    "twoFactorAuthenticationMethodId": [
                        501,
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
                        501,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                596
            ],
            "deleteUserFromWorkspace": [
                600,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                603,
                {
                    "id": [
                        501,
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
                611,
                {
                    "input": [
                        201,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                612,
                {
                    "input": [
                        200,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                613,
                {
                    "input": [
                        202,
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
                617,
                {
                    "input": [
                        203,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        204,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                624,
                {
                    "id": [
                        501,
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
                611,
                {
                    "input": [
                        207,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                612,
                {
                    "input": [
                        206,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                613,
                {
                    "input": [
                        208,
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
                617,
                {
                    "input": [
                        209,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        210,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                142,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                214,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                215,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                216,
                {
                    "input": [
                        217,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                220,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        501
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                85
            ],
            "enqueueJob": [
                229,
                {
                    "input": [
                        227,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                231,
                {
                    "input": [
                        230,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                635
            ],
            "executeOneLogicFunction": [
                308,
                {
                    "input": [
                        244,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                31,
                {
                    "apiKeyId": [
                        501,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                61,
                {
                    "applicationId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                67
            ],
            "generateTransientToken": [
                484
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                498,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        501,
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
                499,
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
                272,
                {
                    "input": [
                        273,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                313,
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
                372
            ],
            "grantApplicationCapabilities": [
                39,
                {
                    "input": [
                        274,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                282,
                {
                    "userId": [
                        501,
                        "UUID!"
                    ],
                    "workspaceId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                289,
                {
                    "input": [
                        288,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                291,
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
                291
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
                232
            ],
            "removeAgentChatMessageReaction": [
                16,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        423,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                415,
                {
                    "principal": [
                        412,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        420,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                61,
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
                        424,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                425,
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
                455,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                138,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                479,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                448,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        501,
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
                        426,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                430,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                441,
                {
                    "input": [
                        437,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                53,
                {
                    "applicationId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                279,
                {
                    "connectionParameters": [
                        218,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        501
                    ]
                }
            ],
            "sendChatMessage": [
                448,
                {
                    "browsingContext": [
                        294
                    ],
                    "fileAttachments": [
                        259,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        501,
                        "[UUID!]"
                    ],
                    "messageId": [
                        501,
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
                        501,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                451,
                {
                    "input": [
                        450,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                454,
                {
                    "input": [
                        453,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                455,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        501
                    ]
                }
            ],
            "sendMessageCampaign": [
                457,
                {
                    "input": [
                        456,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                452,
                {
                    "input": [
                        458,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                33,
                {
                    "input": [
                        460,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                232,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                415,
                {
                    "accessLevel": [
                        411,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        420,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                415,
                {
                    "accessLevel": [
                        411,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        412,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        420,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                108,
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
                466,
                {
                    "input": [
                        467
                    ]
                }
            ],
            "signUpInWorkspace": [
                466,
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
                        501
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
                373,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "startChannelSync": [
                124,
                {
                    "connectedAccountId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                470,
                {
                    "companyContext": [
                        294
                    ],
                    "personContext": [
                        294
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                471
            ],
            "switchBillingPlan": [
                108,
                {
                    "plan": [
                        92
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                108
            ],
            "syncApplication": [
                645,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        294,
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
                        294
                    ],
                    "type": [
                        27,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                56,
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
                486,
                {
                    "input": [
                        485,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                490,
                {
                    "input": [
                        487,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                489,
                {
                    "input": [
                        488,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                494,
                {
                    "input": [
                        491,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                493,
                {
                    "input": [
                        492,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                496,
                {
                    "input": [
                        495,
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
                        192
                    ],
                    "threadIds": [
                        501,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                29,
                {
                    "input": [
                        507,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                323,
                {
                    "input": [
                        508,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                37,
                {
                    "id": [
                        501,
                        "UUID!"
                    ],
                    "input": [
                        509,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                56,
                {
                    "input": [
                        510,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                60,
                {
                    "input": [
                        512,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                111,
                {
                    "input": [
                        514,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                138,
                {
                    "input": [
                        516,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                323,
                {
                    "input": [
                        517,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                267,
                {
                    "input": [
                        519,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                245,
                {
                    "input": [
                        521,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                352,
                {
                    "inputs": [
                        532,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                355,
                {
                    "inputs": [
                        533,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                617,
                {
                    "inputs": [
                        555,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                323,
                {
                    "input": [
                        524,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                330,
                {
                    "input": [
                        526,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                330,
                {
                    "input": [
                        528,
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
                352,
                {
                    "input": [
                        532,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        506,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        501
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
                247,
                {
                    "input": [
                        531,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        522,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                355,
                {
                    "input": [
                        533,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                428,
                {
                    "updateRoleInput": [
                        540,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        534,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        535,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        537,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        539,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                292,
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
                468,
                {
                    "input": [
                        542,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                479,
                {
                    "input": [
                        543,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                504,
                {
                    "input": [
                        544,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                583,
                {
                    "input": [
                        545,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                84,
                {
                    "userCreditsFallback": [
                        598,
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
                603,
                {
                    "input": [
                        546,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                608,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        557,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                611,
                {
                    "input": [
                        550,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                612,
                {
                    "input": [
                        548,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                613,
                {
                    "input": [
                        553,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                614,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        552,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                617,
                {
                    "input": [
                        555,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                620,
                {
                    "input": [
                        558,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                624,
                {
                    "input": [
                        560,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                631,
                {
                    "data": [
                        563,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                631,
                {
                    "data": [
                        562,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                640,
                {
                    "roleId": [
                        501,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        564,
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
                56,
                {
                    "file": [
                        565,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                258,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        565,
                        "Upload!"
                    ],
                    "fileFolder": [
                        260,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                262,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        565,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                262,
                {
                    "file": [
                        565,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                262,
                {
                    "file": [
                        565,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                262,
                {
                    "file": [
                        565,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                254,
                {
                    "upsertFieldPermissionsInput": [
                        566,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                608,
                {
                    "input": [
                        569,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                363,
                {
                    "upsertObjectPermissionsInput": [
                        570,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                429,
                {
                    "upsertPermissionFlagsInput": [
                        571,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                573,
                {
                    "input": [
                        572,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                608,
                {
                    "input": [
                        574,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                64,
                {
                    "input": [
                        601,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                605,
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
                222,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                606,
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
                501
            ],
            "color": [
                1
            ],
            "createdAt": [
                192
            ],
            "folderId": [
                501
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                501
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                501
            ],
            "targetRecordId": [
                501
            ],
            "targetRecordIdentifier": [
                408
            ],
            "type": [
                353
            ],
            "updatedAt": [
                192
            ],
            "userWorkspaceId": [
                501
            ],
            "viewId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                501
            ],
            "color": [
                1
            ],
            "createdAt": [
                192
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                358,
                {
                    "filter": [
                        252,
                        "FieldFilter!"
                    ],
                    "paging": [
                        190,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                247
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "imageIdentifierFieldMetadataId": [
                501
            ],
            "indexMetadataList": [
                283
            ],
            "indexMetadatas": [
                360,
                {
                    "filter": [
                        286,
                        "IndexFilter!"
                    ],
                    "paging": [
                        190,
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
                501
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
                362
            ],
            "readability": [
                340
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                501
            ],
            "searchFieldMetadataList": [
                447
            ],
            "sharingReach": [
                370
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                192
            ],
            "writability": [
                345
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                357
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                145
            ],
            "node": [
                355
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                251
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                359
            ],
            "id": [
                502
            ],
            "isActive": [
                110
            ],
            "isRemote": [
                110
            ],
            "isSearchable": [
                110
            ],
            "isSystem": [
                110
            ],
            "isUICreatable": [
                110
            ],
            "isUIEditable": [
                110
            ],
            "isUIReadOnly": [
                110
            ],
            "or": [
                359
            ],
            "universalIdentifier": [
                502
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                284
            ],
            "pageInfo": [
                375
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                501
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
                501
            ],
            "restrictedFields": [
                294
            ],
            "rowLevelPermissionPredicateGroups": [
                432
            ],
            "rowLevelPermissionPredicates": [
                431
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
                501
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
                191
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                367
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
                294
            ],
            "before": [
                294
            ],
            "diff": [
                294
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
                366
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
                371
            ],
            "previousOnboardingStatus": [
                371
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
                145
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                145
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                501
            ],
            "createdAt": [
                192
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                501
            ],
            "deletedAt": [
                192
            ],
            "id": [
                501
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
                501
            ],
            "tabs": [
                377
            ],
            "type": [
                379
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                501
            ],
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                378
            ],
            "pageLayoutId": [
                501
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
            ],
            "widgets": [
                380
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                501
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                294
            ],
            "configuration": [
                625
            ],
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "gridPosition": [
                276
            ],
            "id": [
                501
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
                501
            ],
            "pageLayoutTabId": [
                501
            ],
            "position": [
                383
            ],
            "title": [
                1
            ],
            "type": [
                627
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                378
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
                378
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
                381
            ],
            "on_PageLayoutWidgetGridPosition": [
                382
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                385
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                384
            ],
            "index": [
                8
            ],
            "layoutMode": [
                378
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
                501
            ],
            "createdAt": [
                192
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                501
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                501
            ],
            "aggregateOperation": [
                20
            ],
            "color": [
                1
            ],
            "configurationType": [
                626
            ],
            "dateGranularity": [
                369
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
                294
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupByFieldMetadataId": [
                501
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
                125
            ],
            "orderBy": [
                275
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
                392
            ],
            "formattedToRawLookup": [
                294
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
                294
            ],
            "objectMetadataId": [
                501
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
                305
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
                192
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                119
            ],
            "blockers": [
                322
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                501
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
                219
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
                501
            ],
            "createdAt": [
                192
            ],
            "domain": [
                1
            ],
            "id": [
                501
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
                246
            ],
            "metadata": [
                401
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
                398
            ],
            "IMAP": [
                398
            ],
            "SMTP": [
                398
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
                501
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                649
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
                501
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
                        501,
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
                        271,
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
                        303
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
                323,
                {
                    "filter": [
                        304
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                40,
                {
                    "applicationId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                41,
                {
                    "applicationId": [
                        501,
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
                446,
                {
                    "applicationId": [
                        501,
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
                501,
                {
                    "calendarEventId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                127,
                {
                    "threadId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                130,
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
                639,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                472,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                138,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                138
            ],
            "currentUser": [
                596
            ],
            "currentUserApplicationAuthorizations": [
                38
            ],
            "currentUserSessions": [
                599
            ],
            "currentWorkspace": [
                631
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
                233
            ],
            "eventLogs": [
                240,
                {
                    "input": [
                        239,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                43,
                {
                    "universalIdentifier": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                247,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                249,
                {
                    "filter": [
                        252,
                        "FieldFilter!"
                    ],
                    "paging": [
                        190,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                397,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                56,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                58,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        192
                    ],
                    "periodStart": [
                        192
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                60,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                131,
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
                297,
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
                56
            ],
            "findManyApplications": [
                37
            ],
            "findManyLogicFunctions": [
                306
            ],
            "findManyMarketplaceApps": [
                314,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                399
            ],
            "findMarketplaceAppDetail": [
                315,
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
                        501
                    ],
                    "universalIdentifier": [
                        501
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                56,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                306,
                {
                    "input": [
                        310,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                297,
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
                297,
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
                633
            ],
            "findWorkspaceFromInviteHash": [
                631,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                638
            ],
            "frontComponent": [
                267,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                267
            ],
            "getAddressDetails": [
                393,
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
                428
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
                294,
                {
                    "input": [
                        310,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                144,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                222
            ],
            "getInviteSuggestions": [
                293
            ],
            "getJobs": [
                297,
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
                        310,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                377,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                377,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                380,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                380,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                376,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        379
                    ]
                }
            ],
            "getPermissionFlags": [
                387
            ],
            "getPublicWorkspaceDataByDomain": [
                403,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                404,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                100
            ],
            "getRole": [
                428,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                428
            ],
            "getSSOIdentityProviders": [
                264
            ],
            "getToolIndex": [
                483
            ],
            "getToolInputSchema": [
                294,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                580,
                {
                    "input": [
                        581
                    ]
                }
            ],
            "getView": [
                608,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                611,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                612,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                612,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                611,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                613,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                614,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                614,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                613,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                617,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                617,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                620,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                620,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                608,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        622,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                636
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
                299,
                {
                    "input": [
                        300,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                91
            ],
            "messageSuppressions": [
                335,
                {
                    "input": [
                        265,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                341,
                {
                    "input": [
                        344,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                346
            ],
            "mostlyEmptyFieldMetadataIds": [
                501,
                {
                    "objectMetadataId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                55
            ],
            "myCalendarChannels": [
                111,
                {
                    "connectedAccountId": [
                        501
                    ]
                }
            ],
            "myConnectedAccounts": [
                142
            ],
            "myMessageChannels": [
                323,
                {
                    "connectedAccountId": [
                        501
                    ]
                }
            ],
            "myMessageFolders": [
                330,
                {
                    "messageChannelId": [
                        501
                    ]
                }
            ],
            "myUserApplicationVariables": [
                641
            ],
            "navigationMenuItem": [
                352,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                352
            ],
            "object": [
                355,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                365
            ],
            "objects": [
                356,
                {
                    "filter": [
                        359,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        190,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                390,
                {
                    "input": [
                        391,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                119,
                {
                    "input": [
                        394,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                396,
                {
                    "input": [
                        395,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                315,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                314,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                410,
                {
                    "targets": [
                        420,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                415,
                {
                    "target": [
                        420,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                468,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                468
            ],
            "timelineActivityTypes": [
                479
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                500,
                {
                    "userId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                504
            ],
            "usageLimits": [
                583
            ],
            "usageQuotaDefinitions": [
                587
            ],
            "usageQuotaScopeConsumption": [
                589,
                {
                    "input": [
                        590,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                591
            ],
            "validatePasswordResetToken": [
                602,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                603,
                {
                    "objectMetadataId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                624,
                {
                    "id": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                501
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
                501
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
                501
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
                501
            ],
            "permissions": [
                409
            ],
            "recordId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                501
            ],
            "workspaceMemberId": [
                501
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
                411
            ],
            "generalAccessLevel": [
                411
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                409
            ],
            "roles": [
                418
            ],
            "shares": [
                416
            ],
            "sharingMode": [
                417
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                411
            ],
            "id": [
                10
            ],
            "principalId": [
                501
            ],
            "principalRoleId": [
                501
            ],
            "principalType": [
                413
            ],
            "rowCause": [
                414
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
                501
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
                626
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
                501
            ],
            "recordId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                247
            ],
            "sourceObjectMetadata": [
                355
            ],
            "targetFieldMetadata": [
                247
            ],
            "targetObjectMetadata": [
                355
            ],
            "type": [
                422
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
                501
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
                501
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
                254
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                363
            ],
            "permissionFlags": [
                429
            ],
            "rowLevelPermissionPredicateGroups": [
                432
            ],
            "rowLevelPermissionPredicates": [
                431
            ],
            "universalIdentifier": [
                501
            ],
            "workspaceMembers": [
                640
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
                501
            ],
            "roleId": [
                501
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
                436
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
                294
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
                434
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
                501
            ],
            "logicalOperator": [
                434
            ],
            "objectMetadataId": [
                501
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                501
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
                501
            ],
            "id": [
                501
            ],
            "operand": [
                436
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                501
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
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
                439
            ],
            "messages": [
                439
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                294
            ],
            "runAsWorkspaceMemberId": [
                501
            ],
            "thread": [
                442
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
                501
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
                438
            ],
            "content": [
                1
            ],
            "role": [
                440
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
                294
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                501
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
                501
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                445
            ],
            "type": [
                277
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                501
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                445
            ],
            "type": [
                277
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
                192
            ],
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                501
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                501
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
                449
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
                294
            ],
            "workspaceMemberIds": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                501
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
                638
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
                192
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                119
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
                294
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                501
            ],
            "createdAt": [
                192
            ],
            "frontComponentId": [
                501
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "position": [
                11
            ],
            "scope": [
                462
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
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
                501
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
                501
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                445
            ],
            "type": [
                277
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
                650
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
                501
            ],
            "content": [
                1
            ],
            "createdAt": [
                192
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                192
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                427
            ],
            "configurationType": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                648
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
                241,
                {
                    "fieldFilters": [
                        235,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        242,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                407,
                {
                    "input": [
                        175,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                311,
                {
                    "input": [
                        312,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                5,
                {
                    "threadId": [
                        501,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                243,
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
                477
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
                626
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
                501
            ],
            "createdAt": [
                192
            ],
            "emit": [
                480
            ],
            "frontComponentUniversalIdentifier": [
                501
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                501
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                501
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                501
            ],
            "on": [
                1
            ],
            "through": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                501
            ],
            "relationFieldUniversalIdentifier": [
                501
            ],
            "triggerFieldUniversalIdentifiers": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                626
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
                294
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
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                501
            ],
            "personFilter": [
                294
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                192
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
                192
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                501
            ],
            "gt": [
                501
            ],
            "gte": [
                501
            ],
            "iLike": [
                501
            ],
            "in": [
                501
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                501
            ],
            "lt": [
                501
            ],
            "lte": [
                501
            ],
            "neq": [
                501
            ],
            "notILike": [
                501
            ],
            "notIn": [
                501
            ],
            "notLike": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                192
            ],
            "description": [
                1
            ],
            "id": [
                501
            ],
            "name": [
                1
            ],
            "updatedAt": [
                192
            ],
            "visibility": [
                505
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
                501
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                294
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
                294
            ],
            "roleId": [
                501
            ],
            "triggers": [
                294
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
                501
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
                501
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                329
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
                511
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
                513
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
                501
            ],
            "update": [
                515
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                112
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
                115
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityObjectMetadataId": [
                501
            ],
            "availabilityType": [
                139
            ],
            "engineComponentKey": [
                226
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                501
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                294
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
                294
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                501
            ],
            "options": [
                294
            ],
            "settings": [
                294
            ],
            "translations": [
                342
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
                501
            ],
            "update": [
                520
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
                501
            ],
            "update": [
                523
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                294
            ],
            "databaseEventTriggerSettings": [
                294
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                294
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
                294
            ],
            "workflowActionTriggerSettings": [
                294
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                501
            ],
            "update": [
                525
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                324
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
                331
            ],
            "visibility": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                501
            ],
            "update": [
                527
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
                501
            ],
            "update": [
                527
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
                501
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
                501
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
                501
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
                501
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
                362
            ],
            "readability": [
                340
            ],
            "sharingReach": [
                370
            ],
            "shortcut": [
                1
            ],
            "translations": [
                342
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                501
            ],
            "update": [
                518
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                501
            ],
            "update": [
                529
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                501
            ],
            "update": [
                530
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
                501
            ],
            "type": [
                379
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
                378
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
                501
            ],
            "layoutMode": [
                378
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                538
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
                294
            ],
            "configuration": [
                294
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                501
            ],
            "pageLayoutTabId": [
                501
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                627
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
                294
            ],
            "configuration": [
                294
            ],
            "id": [
                501
            ],
            "objectMetadataId": [
                501
            ],
            "pageLayoutTabId": [
                501
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                627
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
                501
            ],
            "tabs": [
                536
            ],
            "type": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                501
            ],
            "update": [
                541
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
                501
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
                501
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                342
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
                505
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                501
            ],
            "payload": [
                179
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                501
            ],
            "update": [
                547
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
                501
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
                501
            ],
            "update": [
                549
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
                501
            ],
            "update": [
                551
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                501
            ],
            "logicalOperator": [
                615
            ],
            "parentViewFilterGroupId": [
                501
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                501
            ],
            "update": [
                554
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                501
            ],
            "operand": [
                616
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                501
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
            ],
            "viewFilterGroupId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                501
            ],
            "update": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                501
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
                501
            ],
            "calendarFieldMetadataId": [
                501
            ],
            "calendarLayout": [
                609
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                501
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                501
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                501
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                619
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                622
            ],
            "visibility": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                501
            ],
            "update": [
                559
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                621
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
                501
            ],
            "update": [
                561
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
                294
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                501
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
                637
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                294
            ],
            "workspaceMemberId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                255
            ],
            "roleId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                501
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                567
            ],
            "id": [
                501
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
                567
            ],
            "groups": [
                568
            ],
            "widgetId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                364
            ],
            "roleId": [
                501
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                501
            ],
            "predicateGroups": [
                433
            ],
            "predicates": [
                435
            ],
            "roleId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                432
            ],
            "predicates": [
                431
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                578
            ],
            "viewFields": [
                575
            ],
            "viewFilterGroups": [
                576
            ],
            "viewFilters": [
                577
            ],
            "viewSorts": [
                579
            ],
            "widgetId": [
                501
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
                501
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
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                501
            ],
            "logicalOperator": [
                615
            ],
            "parentViewFilterGroupId": [
                501
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
                501
            ],
            "id": [
                501
            ],
            "operand": [
                616
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                501
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
            ],
            "viewFilterGroupId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                501
            ],
            "calendarFieldMetadataId": [
                501
            ],
            "calendarLayout": [
                609
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                501
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                501
            ],
            "openRecordIn": [
                619
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                621
            ],
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                192
            ],
            "periodStart": [
                192
            ],
            "timeSeries": [
                593
            ],
            "usageByApplication": [
                582
            ],
            "usageByModel": [
                582
            ],
            "usageByOperationType": [
                582
            ],
            "usageByUser": [
                582
            ],
            "userDailyUsage": [
                595
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                585
            ],
            "periodEnd": [
                192
            ],
            "periodStart": [
                192
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
                82
            ],
            "createdAt": [
                192
            ],
            "id": [
                501
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                82
            ],
            "operationType": [
                585
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                592
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                594
            ],
            "updatedAt": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                594
            ],
            "operationType": [
                585
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                584
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                588
            ],
            "resourceType": [
                592
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                586
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
                585
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                594
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
                192
            ],
            "periodStart": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                585
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                592
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                594
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
                501
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                82
            ],
            "operationType": [
                585
            ],
            "periodEnd": [
                192
            ],
            "periodStart": [
                192
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                82
            ],
            "resourceType": [
                592
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
                594
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
                593
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
                192
            ],
            "currentUserWorkspace": [
                600
            ],
            "currentWorkspace": [
                631
            ],
            "deletedAt": [
                192
            ],
            "deletedWorkspaceMembers": [
                205
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
                501
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
                371
            ],
            "previousOnboardingStatus": [
                371
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                192
            ],
            "userVars": [
                295
            ],
            "userWorkspaces": [
                600
            ],
            "workspaceMember": [
                640
            ],
            "workspaceMembers": [
                640
            ],
            "workspaces": [
                600
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
                294
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
                192
            ],
            "expiresAt": [
                192
            ],
            "id": [
                501
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
                192
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "id": [
                501
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                363
            ],
            "objectsPermissions": [
                363
            ],
            "permissionFlags": [
                388
            ],
            "twoFactorAuthenticationMethodSummary": [
                497
            ],
            "updatedAt": [
                192
            ],
            "user": [
                596
            ],
            "userId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                501
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
                501
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
                501
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                501
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
                649
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
                501
            ],
            "calendarEndFieldMetadataId": [
                501
            ],
            "calendarFieldMetadataId": [
                501
            ],
            "calendarLayout": [
                609
            ],
            "createdAt": [
                192
            ],
            "createdByUserWorkspaceId": [
                501
            ],
            "deletedAt": [
                192
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                501
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
                501
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                618
            ],
            "mainGroupByFieldMetadataId": [
                501
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                501
            ],
            "openRecordIn": [
                619
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                622
            ],
            "universalIdentifier": [
                501
            ],
            "updatedAt": [
                192
            ],
            "viewFieldGroups": [
                612
            ],
            "viewFields": [
                611
            ],
            "viewFilterGroups": [
                614
            ],
            "viewFilters": [
                613
            ],
            "viewGroups": [
                617
            ],
            "viewSorts": [
                620
            ],
            "visibility": [
                623
            ],
            "workspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                626
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
                501
            ],
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
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
                501
            ],
            "updatedAt": [
                192
            ],
            "viewFieldGroupId": [
                501
            ],
            "viewId": [
                501
            ],
            "workspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "id": [
                501
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
                192
            ],
            "viewFields": [
                611
            ],
            "viewId": [
                501
            ],
            "workspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
            ],
            "operand": [
                616
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                501
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                192
            ],
            "value": [
                294
            ],
            "viewFilterGroupId": [
                501
            ],
            "viewId": [
                501
            ],
            "workspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "id": [
                501
            ],
            "logicalOperator": [
                615
            ],
            "parentViewFilterGroupId": [
                501
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                192
            ],
            "viewId": [
                501
            ],
            "workspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "fieldValue": [
                1
            ],
            "id": [
                501
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "updatedAt": [
                192
            ],
            "viewId": [
                501
            ],
            "workspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "direction": [
                621
            ],
            "fieldMetadataId": [
                501
            ],
            "id": [
                501
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                192
            ],
            "viewId": [
                501
            ],
            "workspaceId": [
                501
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
                501
            ],
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "description": [
                1
            ],
            "id": [
                501
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
                192
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
                76
            ],
            "on_CalendarConfiguration": [
                116
            ],
            "on_CallRecordingSummaryConfiguration": [
                117
            ],
            "on_CallRecordingTranscriptConfiguration": [
                118
            ],
            "on_ChatConfiguration": [
                126
            ],
            "on_ChatThreadsConfiguration": [
                129
            ],
            "on_EmailThreadConfiguration": [
                221
            ],
            "on_EmailsConfiguration": [
                225
            ],
            "on_FieldConfiguration": [
                248
            ],
            "on_FieldRichTextConfiguration": [
                256
            ],
            "on_FieldsConfiguration": [
                257
            ],
            "on_FilesConfiguration": [
                263
            ],
            "on_FormFieldConfiguration": [
                266
            ],
            "on_FrontComponentConfiguration": [
                268
            ],
            "on_IframeConfiguration": [
                278
            ],
            "on_LineChartConfiguration": [
                298
            ],
            "on_MessageCampaignBodyConfiguration": [
                320
            ],
            "on_MessageCampaignDetailsConfiguration": [
                321
            ],
            "on_NotesConfiguration": [
                354
            ],
            "on_PieChartConfiguration": [
                389
            ],
            "on_RecordTableConfiguration": [
                419
            ],
            "on_StandaloneRichTextConfiguration": [
                469
            ],
            "on_TasksConfiguration": [
                478
            ],
            "on_TimelineConfiguration": [
                482
            ],
            "on_ViewConfiguration": [
                610
            ],
            "on_WorkflowConfiguration": [
                628
            ],
            "on_WorkflowRunConfiguration": [
                629
            ],
            "on_WorkflowVersionConfiguration": [
                630
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                632
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
                294
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
                192
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
                428
            ],
            "deletedAt": [
                192
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
                245
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                501
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
                501
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
                192
            ],
            "viewFields": [
                611
            ],
            "viewFilterGroups": [
                614
            ],
            "viewFilters": [
                613
            ],
            "viewGroups": [
                617
            ],
            "viewSorts": [
                620
            ],
            "views": [
                608
            ],
            "workspaceCustomApplication": [
                37
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                637
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                649
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
                294
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                634
            ],
            "personEnrichment": [
                294
            ],
            "personOutcome": [
                647
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
                192
            ],
            "id": [
                501
            ],
            "roleId": [
                501
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
                642
            ],
            "id": [
                501
            ],
            "locale": [
                1
            ],
            "name": [
                270
            ],
            "numberFormat": [
                643
            ],
            "openRecordIn": [
                374
            ],
            "roles": [
                428
            ],
            "timeFormat": [
                644
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
                501
            ],
            "userWorkspaceId": [
                501
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                501
            ],
            "variables": [
                597
            ],
            "workspaceMemberId": [
                501
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
                294
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
                501
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
                501
            ],
            "workspaceUrls": [
                649
            ],
            "__typename": [
                1
            ]
        }
    }
}