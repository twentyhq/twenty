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
        323,
        324,
        325,
        326,
        327,
        328,
        330,
        331,
        332,
        335,
        336,
        338,
        339,
        342,
        344,
        348,
        352,
        361,
        368,
        369,
        370,
        373,
        377,
        378,
        383,
        387,
        408,
        410,
        411,
        414,
        419,
        431,
        433,
        437,
        442,
        459,
        471,
        472,
        474,
        498,
        500,
        502,
        562,
        582,
        589,
        591,
        595,
        606,
        612,
        613,
        615,
        616,
        618,
        619,
        620,
        623,
        624,
        629,
        631,
        634,
        639,
        640,
        641,
        644,
        645
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
                498
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
                498
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
                498
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
                498
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
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                498
            ],
            "createdAt": [
                192
            ],
            "id": [
                498
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
                498
            ],
            "senderWorkspaceMemberId": [
                498
            ],
            "status": [
                1
            ],
            "threadId": [
                498
            ],
            "turnId": [
                498
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
                498
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                498
            ],
            "messageId": [
                498
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
                498
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                498
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
                498
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
                498
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
                498
            ],
            "aggregateOperation": [
                20
            ],
            "configurationType": [
                623
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
                403
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
                498
            ],
            "name": [
                1
            ],
            "revokedAt": [
                192
            ],
            "role": [
                425
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
                498
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
                498
            ],
            "role": [
                332
            ],
            "workspaceMemberId": [
                498
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
                498
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
                425
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
                498
            ],
            "id": [
                498
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                306
            ],
            "logoFileId": [
                498
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                354
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                498
            ],
            "settingsCustomTabFrontComponentId": [
                498
            ],
            "settingsMenuItems": [
                458
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                498
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
                498
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
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                498
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
                399
            ],
            "connectionProviderId": [
                498
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
                498
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
                498
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
                498
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
                498
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
                498
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
                498
            ],
            "settingsMenuItems": [
                458
            ],
            "variables": [
                594
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
                498
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
                498
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
                604
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                498
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
                498
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
                498
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
                498
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
                441
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
                498
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
                440
            ],
            "workspaceUrls": [
                646
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
                498
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
                623
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
                368
            ],
            "primaryAxisGroupByFieldMetadataId": [
                498
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
                368
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                498
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
                498
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
                498
            ],
            "userCreditsFallback": [
                595
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
                472
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
                471
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
                471
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
                498
            ],
            "interval": [
                471
            ],
            "metadata": [
                294
            ],
            "phases": [
                105
            ],
            "status": [
                472
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
                498
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
                498
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
                498
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
                623
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                623
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
                623
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
                623
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
                348
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                350
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
                397
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                456
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                473
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
                498
            ],
            "availabilityObjectMetadataId": [
                498
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
                498
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
                498
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                498
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
                498
            ],
            "pageLayoutId": [
                498
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
                498
            ],
            "updatedAt": [
                192
            ],
            "workflowVersionId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                360
            ],
            "on_PathCommandMenuItemPayload": [
                385
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
                498
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
                399
            ],
            "connectionProviderId": [
                498
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
                498
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
                498
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
                498
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                498
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
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                498
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                328
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
                498
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
                498
            ],
            "engineComponentKey": [
                226
            ],
            "frontComponentId": [
                498
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
                498
            ],
            "pageLayoutId": [
                498
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
                498
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
                322
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
                498
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
                498
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
                498
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
                498
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
                498
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
                498
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
                498
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
                498
            ],
            "icon": [
                1
            ],
            "id": [
                498
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                498
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                498
            ],
            "targetRecordId": [
                498
            ],
            "type": [
                352
            ],
            "userWorkspaceId": [
                498
            ],
            "viewId": [
                498
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
                498
            ],
            "type": [
                378
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                377
            ],
            "pageLayoutId": [
                498
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
                498
            ],
            "pageLayoutTabId": [
                498
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                498
            ],
            "filter": [
                294
            ],
            "objectMetadataId": [
                498
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
                498
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
                502
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
                582
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                589
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                591
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
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                498
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
                498
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
                498
            ],
            "id": [
                498
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
                498
            ],
            "viewId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                498
            ],
            "logicalOperator": [
                612
            ],
            "parentViewFilterGroupId": [
                498
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                498
            ],
            "id": [
                498
            ],
            "operand": [
                613
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                498
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
            ],
            "viewFilterGroupId": [
                498
            ],
            "viewId": [
                498
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
                498
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                498
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
                498
            ],
            "calendarFieldMetadataId": [
                498
            ],
            "calendarLayout": [
                606
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                498
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                498
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                615
            ],
            "mainGroupByFieldMetadataId": [
                498
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                498
            ],
            "openRecordIn": [
                616
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                619
            ],
            "visibility": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                618
            ],
            "fieldMetadataId": [
                498
            ],
            "id": [
                498
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                498
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
                498
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
                582
            ],
            "resource": [
                589
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                498
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
                498
            ],
            "name": [
                270
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                498
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
                498
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
                498
            ],
            "pageLayoutId": [
                498
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
                498
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
                498
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
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
                498
            ],
            "status": [
                442
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
                623
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
                498
            ],
            "status": [
                223
            ],
            "tenantStatus": [
                224
            ],
            "unsubscribeHostnameStatus": [
                500
            ],
            "updatedAt": [
                192
            ],
            "verificationRecords": [
                601
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
                623
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
                337
            ],
            "objectRecordEventsWithQueryIds": [
                367
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
                498
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
                498
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
                498
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
                498
            ],
            "morphRelations": [
                418
            ],
            "name": [
                1
            ],
            "object": [
                354
            ],
            "objectMetadataId": [
                498
            ],
            "options": [
                294
            ],
            "relation": [
                418
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
                344
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                623
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
                374
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
                499
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
                499
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
                498
            ],
            "id": [
                498
            ],
            "objectMetadataId": [
                498
            ],
            "roleId": [
                498
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
                498
            ],
            "objectMetadataId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                623
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
                498
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
                498
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
                498
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
                498
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
                623
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                498
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
            ],
            "type": [
                277
            ],
            "workspace": [
                643
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
                335
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                623
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
                498
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
                498
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
                498
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
                623
            ],
            "frontComponentId": [
                498
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                498
            ],
            "pageLayoutType": [
                378
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
                498
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
                498
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
                498
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
                498
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
                623
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
                647
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
                498
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
                498
            ],
            "id": [
                498
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
                499
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
                498
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
                498
            ],
            "messageThreadId": [
                498
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
                498
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
                623
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
                368
            ],
            "primaryAxisGroupByFieldMetadataId": [
                498
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
                368
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                498
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
                498
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
                498
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
                498
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
                498
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
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                498
            ],
            "applicationUniversalIdentifier": [
                498
            ],
            "id": [
                498
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                498
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
                623
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                623
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
                498
            ],
            "contactAutoCreationPolicy": [
                323
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
                498
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
                330
            ],
            "pendingGroupEmailsAction": [
                324
            ],
            "syncStage": [
                325
            ],
            "syncStageStartedAt": [
                192
            ],
            "syncStatus": [
                326
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
                327
            ],
            "updatedAt": [
                192
            ],
            "visibility": [
                328
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
                498
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                498
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                331
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
                498
            ],
            "reason": [
                335
            ],
            "source": [
                336
            ],
            "unsubscribeTopicId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                333
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
                366
            ],
            "recordId": [
                1
            ],
            "type": [
                338
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
                498
            ],
            "property": [
                1
            ],
            "provenance": [
                342
            ],
            "recordId": [
                498
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
                498
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                498
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
                346
            ],
            "views": [
                347
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
                498
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
                498
            ],
            "key": [
                615
            ],
            "objectMetadataId": [
                498
            ],
            "type": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                465,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                628,
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
                        498,
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
                        498
                    ],
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        498,
                        "UUID!"
                    ],
                    "roleId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        498,
                        "UUID!"
                    ],
                    "roleId": [
                        498,
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
                        471,
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
                        498,
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
                        498,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                372,
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
                322,
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
                351,
                {
                    "inputs": [
                        167,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                609,
                {
                    "inputs": [
                        181,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                608,
                {
                    "inputs": [
                        182,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                614,
                {
                    "inputs": [
                        185,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                333,
                {
                    "input": [
                        166,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                351,
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
                462,
                {
                    "input": [
                        460,
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
                        498,
                        "UUID!"
                    ],
                    "properties": [
                        294
                    ],
                    "recordId": [
                        498,
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
                354,
                {
                    "input": [
                        171,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                425,
                {
                    "createRoleInput": [
                        176,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                375,
                {
                    "input": [
                        172,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                376,
                {
                    "input": [
                        173,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                379,
                {
                    "input": [
                        174,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                396,
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
                462,
                {
                    "input": [
                        461,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                465,
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
                        471,
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
                501,
                {
                    "input": [
                        178,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                580,
                {
                    "input": [
                        179,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                600,
                {
                    "input": [
                        180,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                605,
                {
                    "input": [
                        186,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                608,
                {
                    "input": [
                        182,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                609,
                {
                    "input": [
                        181,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                610,
                {
                    "input": [
                        184,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                611,
                {
                    "input": [
                        183,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                614,
                {
                    "input": [
                        185,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                617,
                {
                    "input": [
                        187,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                621,
                {
                    "input": [
                        188,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                465,
                {
                    "id": [
                        498,
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
                322,
                {
                    "id": [
                        498,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                142,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                628
            ],
            "deleteEmailGroupChannel": [
                322,
                {
                    "id": [
                        498,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                351,
                {
                    "ids": [
                        498,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                351,
                {
                    "id": [
                        498,
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
                354,
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
                        498,
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
                        498,
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
                465,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                199,
                {
                    "twoFactorAuthenticationMethodId": [
                        498,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                593
            ],
            "deleteUserFromWorkspace": [
                597,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                600,
                {
                    "id": [
                        498,
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
                608,
                {
                    "input": [
                        201,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                609,
                {
                    "input": [
                        200,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                610,
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
                614,
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
                621,
                {
                    "id": [
                        498,
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
                608,
                {
                    "input": [
                        207,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                609,
                {
                    "input": [
                        206,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                610,
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
                614,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                214,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                215,
                {
                    "id": [
                        498,
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
                        498
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
                632
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
                        498,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                67
            ],
            "generateTransientToken": [
                481
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                495,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        498,
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
                496,
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
                371
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
                        498,
                        "UUID!"
                    ],
                    "workspaceId": [
                        498,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        420,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                412,
                {
                    "principal": [
                        409,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        417,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        498,
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
                        421,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                422,
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
                452,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                379,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                476,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                445,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        498,
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
                        423,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                427,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                438,
                {
                    "input": [
                        434,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                53,
                {
                    "applicationId": [
                        498,
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
                        498
                    ]
                }
            ],
            "sendChatMessage": [
                445,
                {
                    "browsingContext": [
                        294
                    ],
                    "fileAttachments": [
                        259,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        498,
                        "[UUID!]"
                    ],
                    "messageId": [
                        498,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                448,
                {
                    "input": [
                        447,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                451,
                {
                    "input": [
                        450,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                452,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        498
                    ]
                }
            ],
            "sendMessageCampaign": [
                454,
                {
                    "input": [
                        453,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                449,
                {
                    "input": [
                        455,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                33,
                {
                    "input": [
                        457,
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
                412,
                {
                    "accessLevel": [
                        408,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        417,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                412,
                {
                    "accessLevel": [
                        408,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        409,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        417,
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
                463,
                {
                    "input": [
                        464
                    ]
                }
            ],
            "signUpInWorkspace": [
                463,
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
                        498
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
                372,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                467,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                468
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
                642,
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
                483,
                {
                    "input": [
                        482,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                487,
                {
                    "input": [
                        484,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                486,
                {
                    "input": [
                        485,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                491,
                {
                    "input": [
                        488,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                490,
                {
                    "input": [
                        489,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                493,
                {
                    "input": [
                        492,
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
                        498,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                29,
                {
                    "input": [
                        504,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                322,
                {
                    "input": [
                        505,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                37,
                {
                    "id": [
                        498,
                        "UUID!"
                    ],
                    "input": [
                        506,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                56,
                {
                    "input": [
                        507,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                60,
                {
                    "input": [
                        509,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                111,
                {
                    "input": [
                        511,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                138,
                {
                    "input": [
                        513,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                322,
                {
                    "input": [
                        514,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                267,
                {
                    "input": [
                        516,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                245,
                {
                    "input": [
                        518,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                351,
                {
                    "inputs": [
                        529,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                354,
                {
                    "inputs": [
                        530,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                614,
                {
                    "inputs": [
                        552,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                322,
                {
                    "input": [
                        521,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                329,
                {
                    "input": [
                        523,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                329,
                {
                    "input": [
                        525,
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
                351,
                {
                    "input": [
                        529,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        503,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        498
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
                        528,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        519,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                354,
                {
                    "input": [
                        530,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                425,
                {
                    "updateRoleInput": [
                        537,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        531,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        532,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                379,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        534,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        536,
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
                465,
                {
                    "input": [
                        539,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                476,
                {
                    "input": [
                        540,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                501,
                {
                    "input": [
                        541,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                580,
                {
                    "input": [
                        542,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                84,
                {
                    "userCreditsFallback": [
                        595,
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
                600,
                {
                    "input": [
                        543,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                605,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        554,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                608,
                {
                    "input": [
                        547,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                609,
                {
                    "input": [
                        545,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                610,
                {
                    "input": [
                        550,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                611,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        549,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                614,
                {
                    "input": [
                        552,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                617,
                {
                    "input": [
                        555,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                621,
                {
                    "input": [
                        557,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                628,
                {
                    "data": [
                        560,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                628,
                {
                    "data": [
                        559,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                637,
                {
                    "roleId": [
                        498,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        561,
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
                        562,
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
                        562,
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
                        562,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                262,
                {
                    "file": [
                        562,
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
                        562,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                262,
                {
                    "file": [
                        562,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                254,
                {
                    "upsertFieldPermissionsInput": [
                        563,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                605,
                {
                    "input": [
                        566,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                362,
                {
                    "upsertObjectPermissionsInput": [
                        567,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                426,
                {
                    "upsertPermissionFlagsInput": [
                        568,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                570,
                {
                    "input": [
                        569,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                605,
                {
                    "input": [
                        571,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                64,
                {
                    "input": [
                        598,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                602,
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
                603,
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
                498
            ],
            "color": [
                1
            ],
            "createdAt": [
                192
            ],
            "folderId": [
                498
            ],
            "icon": [
                1
            ],
            "id": [
                498
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                498
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                498
            ],
            "targetRecordId": [
                498
            ],
            "targetRecordIdentifier": [
                405
            ],
            "type": [
                352
            ],
            "updatedAt": [
                192
            ],
            "userWorkspaceId": [
                498
            ],
            "viewId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                498
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
                357,
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
                498
            ],
            "imageIdentifierFieldMetadataId": [
                498
            ],
            "indexMetadataList": [
                283
            ],
            "indexMetadatas": [
                359,
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
                498
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
                361
            ],
            "readability": [
                339
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                498
            ],
            "searchFieldMetadataList": [
                444
            ],
            "sharingReach": [
                369
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
                344
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                356
            ],
            "pageInfo": [
                374
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
                354
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
                374
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                358
            ],
            "id": [
                499
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
                358
            ],
            "universalIdentifier": [
                499
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
                374
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                498
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
                498
            ],
            "restrictedFields": [
                294
            ],
            "rowLevelPermissionPredicateGroups": [
                429
            ],
            "rowLevelPermissionPredicates": [
                428
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
                498
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
                366
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
                365
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
                370
            ],
            "previousOnboardingStatus": [
                370
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
                498
            ],
            "createdAt": [
                192
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                498
            ],
            "deletedAt": [
                192
            ],
            "id": [
                498
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
                498
            ],
            "tabs": [
                376
            ],
            "type": [
                378
            ],
            "universalIdentifier": [
                498
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
                498
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
                498
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
                377
            ],
            "pageLayoutId": [
                498
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                498
            ],
            "updatedAt": [
                192
            ],
            "widgets": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationId": [
                498
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                294
            ],
            "configuration": [
                622
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
                498
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
                498
            ],
            "pageLayoutTabId": [
                498
            ],
            "position": [
                382
            ],
            "title": [
                1
            ],
            "type": [
                624
            ],
            "universalIdentifier": [
                498
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
                377
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
                377
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
                380
            ],
            "on_PageLayoutWidgetGridPosition": [
                381
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                384
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                383
            ],
            "index": [
                8
            ],
            "layoutMode": [
                377
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
                498
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
                498
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
                498
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
                498
            ],
            "aggregateOperation": [
                20
            ],
            "color": [
                1
            ],
            "configurationType": [
                623
            ],
            "dateGranularity": [
                368
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
                498
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
                391
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
                498
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
        "PublicApplicationRegistration": {
            "id": [
                498
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
                498
            ],
            "createdAt": [
                192
            ],
            "domain": [
                1
            ],
            "id": [
                498
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
                398
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
                395
            ],
            "IMAP": [
                395
            ],
            "SMTP": [
                395
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
                498
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                646
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
                498
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
                        498,
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
                322,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                41,
                {
                    "applicationId": [
                        498,
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
                443,
                {
                    "applicationId": [
                        498,
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
                498,
                {
                    "calendarEventId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                127,
                {
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        498,
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
                636,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                469,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                138
            ],
            "currentUser": [
                593
            ],
            "currentUserApplicationAuthorizations": [
                38
            ],
            "currentUserSessions": [
                596
            ],
            "currentWorkspace": [
                628
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                247,
                {
                    "id": [
                        498,
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
                394,
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
                396
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
                        498
                    ],
                    "universalIdentifier": [
                        498
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
                630
            ],
            "findWorkspaceFromInviteHash": [
                628,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                635
            ],
            "frontComponent": [
                267,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                267
            ],
            "getAddressDetails": [
                392,
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
                425
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
                        498,
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
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                376,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                376,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                379,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                379,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                375,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        378
                    ]
                }
            ],
            "getPermissionFlags": [
                386
            ],
            "getPublicWorkspaceDataByDomain": [
                400,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                401,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                100
            ],
            "getRole": [
                425,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                425
            ],
            "getSSOIdentityProviders": [
                264
            ],
            "getToolIndex": [
                480
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
                577,
                {
                    "input": [
                        578
                    ]
                }
            ],
            "getView": [
                605,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                608,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                609,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                608,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                610,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                611,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                611,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                610,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                614,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                614,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                617,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                617,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                605,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        619,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                633
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
                334,
                {
                    "input": [
                        265,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                340,
                {
                    "input": [
                        343,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                345
            ],
            "mostlyEmptyFieldMetadataIds": [
                498,
                {
                    "objectMetadataId": [
                        498,
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
                        498
                    ]
                }
            ],
            "myConnectedAccounts": [
                142
            ],
            "myMessageChannels": [
                322,
                {
                    "connectedAccountId": [
                        498
                    ]
                }
            ],
            "myMessageFolders": [
                329,
                {
                    "messageChannelId": [
                        498
                    ]
                }
            ],
            "myUserApplicationVariables": [
                638
            ],
            "navigationMenuItem": [
                351,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                351
            ],
            "object": [
                354,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                364
            ],
            "objects": [
                355,
                {
                    "filter": [
                        358,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        190,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                389,
                {
                    "input": [
                        390,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                119,
                {
                    "input": [
                        393,
                        "PreviewMessageCampaignAudienceInput!"
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
                407,
                {
                    "targets": [
                        417,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                412,
                {
                    "target": [
                        417,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                465,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                465
            ],
            "timelineActivityTypes": [
                476
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                497,
                {
                    "userId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                501
            ],
            "usageLimits": [
                580
            ],
            "usageQuotaDefinitions": [
                584
            ],
            "usageQuotaScopeConsumption": [
                586,
                {
                    "input": [
                        587,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                588
            ],
            "validatePasswordResetToken": [
                599,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                600,
                {
                    "objectMetadataId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                621,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                621
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                498
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
                498
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
                498
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
                498
            ],
            "permissions": [
                406
            ],
            "recordId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                498
            ],
            "workspaceMemberId": [
                498
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
                408
            ],
            "generalAccessLevel": [
                408
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                406
            ],
            "roles": [
                415
            ],
            "shares": [
                413
            ],
            "sharingMode": [
                414
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                408
            ],
            "id": [
                10
            ],
            "principalId": [
                498
            ],
            "principalRoleId": [
                498
            ],
            "principalType": [
                410
            ],
            "rowCause": [
                411
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
                498
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
                623
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
                498
            ],
            "recordId": [
                498
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
                354
            ],
            "targetFieldMetadata": [
                247
            ],
            "targetObjectMetadata": [
                354
            ],
            "type": [
                419
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
                498
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
                498
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
                498
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                362
            ],
            "permissionFlags": [
                426
            ],
            "rowLevelPermissionPredicateGroups": [
                429
            ],
            "rowLevelPermissionPredicates": [
                428
            ],
            "universalIdentifier": [
                498
            ],
            "workspaceMembers": [
                637
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
                498
            ],
            "roleId": [
                498
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
                433
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
                431
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
                498
            ],
            "logicalOperator": [
                431
            ],
            "objectMetadataId": [
                498
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                498
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
                498
            ],
            "id": [
                498
            ],
            "operand": [
                433
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                498
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
                436
            ],
            "messages": [
                436
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                294
            ],
            "runAsWorkspaceMemberId": [
                498
            ],
            "thread": [
                439
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
                498
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
                435
            ],
            "content": [
                1
            ],
            "role": [
                437
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
                498
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
                498
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
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
                498
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
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
                498
            ],
            "id": [
                498
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                498
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
                498
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
                446
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                498
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
                635
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
                498
            ],
            "createdAt": [
                192
            ],
            "frontComponentId": [
                498
            ],
            "icon": [
                1
            ],
            "id": [
                498
            ],
            "position": [
                11
            ],
            "scope": [
                459
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                498
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
                498
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
                498
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                442
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
                647
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
                498
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
                498
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
                424
            ],
            "configurationType": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                645
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
                404,
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
                        498,
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
                474
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
                623
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
                498
            ],
            "createdAt": [
                192
            ],
            "emit": [
                477
            ],
            "frontComponentUniversalIdentifier": [
                498
            ],
            "icon": [
                1
            ],
            "id": [
                498
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
                498
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                498
            ],
            "universalIdentifier": [
                498
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
                498
            ],
            "on": [
                1
            ],
            "through": [
                478
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                498
            ],
            "relationFieldUniversalIdentifier": [
                498
            ],
            "triggerFieldUniversalIdentifiers": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                623
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
                498
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
                498
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
                498
            ],
            "gt": [
                498
            ],
            "gte": [
                498
            ],
            "iLike": [
                498
            ],
            "in": [
                498
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                498
            ],
            "lt": [
                498
            ],
            "lte": [
                498
            ],
            "neq": [
                498
            ],
            "notILike": [
                498
            ],
            "notIn": [
                498
            ],
            "notLike": [
                498
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
                498
            ],
            "name": [
                1
            ],
            "updatedAt": [
                192
            ],
            "visibility": [
                502
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
                498
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
                498
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
                498
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
                498
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                328
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
                508
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
                510
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
                498
            ],
            "update": [
                512
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
                498
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
                498
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                498
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
                498
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
                498
            ],
            "options": [
                294
            ],
            "settings": [
                294
            ],
            "translations": [
                341
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
                498
            ],
            "update": [
                517
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
                498
            ],
            "update": [
                520
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
                498
            ],
            "update": [
                522
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                323
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
                330
            ],
            "visibility": [
                328
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                498
            ],
            "update": [
                524
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
                498
            ],
            "update": [
                524
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
                498
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
                498
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
                498
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
                498
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
                361
            ],
            "readability": [
                339
            ],
            "sharingReach": [
                369
            ],
            "shortcut": [
                1
            ],
            "translations": [
                341
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                498
            ],
            "update": [
                515
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                498
            ],
            "update": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                498
            ],
            "update": [
                527
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
                498
            ],
            "type": [
                378
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
                377
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
                498
            ],
            "layoutMode": [
                377
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                535
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
                498
            ],
            "pageLayoutTabId": [
                498
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                624
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
                498
            ],
            "objectMetadataId": [
                498
            ],
            "pageLayoutTabId": [
                498
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                624
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
                498
            ],
            "tabs": [
                533
            ],
            "type": [
                378
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                498
            ],
            "update": [
                538
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
                498
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
                498
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                341
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                498
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
                498
            ],
            "update": [
                544
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
                498
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
                498
            ],
            "update": [
                546
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
                498
            ],
            "update": [
                548
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                498
            ],
            "logicalOperator": [
                612
            ],
            "parentViewFilterGroupId": [
                498
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                498
            ],
            "update": [
                551
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                498
            ],
            "operand": [
                613
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                498
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
            ],
            "viewFilterGroupId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                498
            ],
            "update": [
                553
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                498
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
                498
            ],
            "calendarFieldMetadataId": [
                498
            ],
            "calendarLayout": [
                606
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                498
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                498
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                498
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                616
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                619
            ],
            "visibility": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                498
            ],
            "update": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                618
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
                498
            ],
            "update": [
                558
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
                498
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
                634
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
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                498
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                564
            ],
            "id": [
                498
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
                564
            ],
            "groups": [
                565
            ],
            "widgetId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                363
            ],
            "roleId": [
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                498
            ],
            "predicateGroups": [
                430
            ],
            "predicates": [
                432
            ],
            "roleId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                429
            ],
            "predicates": [
                428
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                575
            ],
            "viewFields": [
                572
            ],
            "viewFilterGroups": [
                573
            ],
            "viewFilters": [
                574
            ],
            "viewSorts": [
                576
            ],
            "widgetId": [
                498
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
                498
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                498
            ],
            "logicalOperator": [
                612
            ],
            "parentViewFilterGroupId": [
                498
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
                498
            ],
            "id": [
                498
            ],
            "operand": [
                613
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                498
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
            ],
            "viewFilterGroupId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                498
            ],
            "calendarFieldMetadataId": [
                498
            ],
            "calendarLayout": [
                606
            ],
            "kanbanAggregateOperation": [
                20
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                498
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                498
            ],
            "openRecordIn": [
                616
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                618
            ],
            "fieldMetadataId": [
                498
            ],
            "id": [
                498
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
                590
            ],
            "usageByApplication": [
                579
            ],
            "usageByModel": [
                579
            ],
            "usageByOperationType": [
                579
            ],
            "usageByUser": [
                579
            ],
            "userDailyUsage": [
                592
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                582
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
                498
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                82
            ],
            "operationType": [
                582
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                589
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                591
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
                591
            ],
            "operationType": [
                582
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                581
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                585
            ],
            "resourceType": [
                589
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                583
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
                582
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                591
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
                582
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                589
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                591
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
                498
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                82
            ],
            "operationType": [
                582
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
                589
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
                591
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
                590
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
                597
            ],
            "currentWorkspace": [
                628
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
                498
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
                370
            ],
            "previousOnboardingStatus": [
                370
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
                597
            ],
            "workspaceMember": [
                637
            ],
            "workspaceMembers": [
                637
            ],
            "workspaces": [
                597
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
                498
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
                498
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
                498
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectPermissions": [
                362
            ],
            "objectsPermissions": [
                362
            ],
            "permissionFlags": [
                387
            ],
            "twoFactorAuthenticationMethodSummary": [
                494
            ],
            "updatedAt": [
                192
            ],
            "user": [
                593
            ],
            "userId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                498
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
                498
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
                498
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                498
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
                498
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
                646
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
                498
            ],
            "calendarEndFieldMetadataId": [
                498
            ],
            "calendarFieldMetadataId": [
                498
            ],
            "calendarLayout": [
                606
            ],
            "createdAt": [
                192
            ],
            "createdByUserWorkspaceId": [
                498
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
                498
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
                498
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                615
            ],
            "mainGroupByFieldMetadataId": [
                498
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                498
            ],
            "openRecordIn": [
                616
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                619
            ],
            "universalIdentifier": [
                498
            ],
            "updatedAt": [
                192
            ],
            "viewFieldGroups": [
                609
            ],
            "viewFields": [
                608
            ],
            "viewFilterGroups": [
                611
            ],
            "viewFilters": [
                610
            ],
            "viewGroups": [
                614
            ],
            "viewSorts": [
                617
            ],
            "visibility": [
                620
            ],
            "workspaceId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                623
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
                498
            ],
            "createdAt": [
                192
            ],
            "deletedAt": [
                192
            ],
            "fieldMetadataId": [
                498
            ],
            "id": [
                498
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
                498
            ],
            "updatedAt": [
                192
            ],
            "viewFieldGroupId": [
                498
            ],
            "viewId": [
                498
            ],
            "workspaceId": [
                498
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
                498
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
                608
            ],
            "viewId": [
                498
            ],
            "workspaceId": [
                498
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
                498
            ],
            "id": [
                498
            ],
            "operand": [
                613
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                498
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
                498
            ],
            "viewId": [
                498
            ],
            "workspaceId": [
                498
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
                498
            ],
            "logicalOperator": [
                612
            ],
            "parentViewFilterGroupId": [
                498
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                192
            ],
            "viewId": [
                498
            ],
            "workspaceId": [
                498
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
                498
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
                498
            ],
            "workspaceId": [
                498
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
                618
            ],
            "fieldMetadataId": [
                498
            ],
            "id": [
                498
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                192
            ],
            "viewId": [
                498
            ],
            "workspaceId": [
                498
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
                498
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
                498
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
                353
            ],
            "on_PieChartConfiguration": [
                388
            ],
            "on_RecordTableConfiguration": [
                416
            ],
            "on_StandaloneRichTextConfiguration": [
                466
            ],
            "on_TasksConfiguration": [
                475
            ],
            "on_TimelineConfiguration": [
                479
            ],
            "on_ViewConfiguration": [
                607
            ],
            "on_WorkflowConfiguration": [
                625
            ],
            "on_WorkflowRunConfiguration": [
                626
            ],
            "on_WorkflowVersionConfiguration": [
                627
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                623
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                629
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
                425
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
                498
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
                498
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
                608
            ],
            "viewFilterGroups": [
                611
            ],
            "viewFilters": [
                610
            ],
            "viewGroups": [
                614
            ],
            "viewSorts": [
                617
            ],
            "views": [
                605
            ],
            "workspaceCustomApplication": [
                37
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                634
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                646
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
                631
            ],
            "personEnrichment": [
                294
            ],
            "personOutcome": [
                644
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
                498
            ],
            "roleId": [
                498
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
                639
            ],
            "id": [
                498
            ],
            "locale": [
                1
            ],
            "name": [
                270
            ],
            "numberFormat": [
                640
            ],
            "openRecordIn": [
                373
            ],
            "roles": [
                425
            ],
            "timeFormat": [
                641
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
                498
            ],
            "userWorkspaceId": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                498
            ],
            "variables": [
                594
            ],
            "workspaceMemberId": [
                498
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
                498
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
                498
            ],
            "workspaceUrls": [
                646
            ],
            "__typename": [
                1
            ]
        }
    }
}