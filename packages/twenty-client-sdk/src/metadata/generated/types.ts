export default {
    "scalars": [
        1,
        4,
        6,
        8,
        10,
        11,
        13,
        16,
        17,
        23,
        25,
        27,
        30,
        32,
        39,
        51,
        59,
        61,
        67,
        79,
        83,
        84,
        86,
        91,
        96,
        102,
        112,
        115,
        116,
        117,
        118,
        126,
        128,
        142,
        147,
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
        275,
        277,
        287,
        294,
        295,
        296,
        307,
        309,
        322,
        323,
        324,
        325,
        326,
        327,
        329,
        330,
        331,
        334,
        335,
        337,
        338,
        341,
        343,
        347,
        351,
        360,
        367,
        368,
        369,
        372,
        376,
        377,
        382,
        386,
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
        495,
        497,
        499,
        560,
        580,
        587,
        589,
        603,
        609,
        610,
        612,
        613,
        615,
        616,
        617,
        620,
        621,
        626,
        628,
        631,
        636,
        637,
        638,
        641,
        642
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
                495
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
                495
            ],
            "triggers": [
                294
            ],
            "updatedAt": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                495
            ],
            "name": [
                1
            ],
            "visibility": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelSummary": {
            "channelId": [
                495
            ],
            "hasUnreadOpen": [
                4
            ],
            "openCount": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "AgentChatChannelThreadIds": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                4
            ],
            "threadIds": [
                495
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatChannelVisibility": {},
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
                16
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                8
            ],
            "totalInputCredits": [
                17
            ],
            "totalInputTokens": [
                8
            ],
            "totalOutputCredits": [
                17
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
        "AgentChatThreadParticipant": {
            "archivedAt": [
                193
            ],
            "id": [
                495
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
                495
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
                193
            ],
            "id": [
                495
            ],
            "parts": [
                21
            ],
            "processedAt": [
                193
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
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
                193
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
                17
            ],
            "endedAt": [
                193
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
                193
            ],
            "status": [
                23
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
                25
            ],
            "configurationType": [
                620
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
                128
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
                86
            ],
            "kind": [
                1
            ],
            "limitValue": [
                86
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
                29
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
                17
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
                495
            ],
            "name": [
                1
            ],
            "revokedAt": [
                193
            ],
            "role": [
                424
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
                495
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
            "handle": [
                1
            ],
            "id": [
                16
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
                39
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
                41
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
                495
            ],
            "role": [
                331
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
                63
            ],
            "applicationRegistrationId": [
                495
            ],
            "applicationVariables": [
                66
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
                141
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
                268
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
                306
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
                353
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
                193
            ],
            "id": [
                495
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
                193
            ],
            "authFailedAt": [
                193
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                398
            ],
            "connectionProviderId": [
                495
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
                495
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
            "scopes": [
                1
            ],
            "updatedAt": [
                193
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
                47
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
                49
            ],
            "coverage": [
                50
            ],
            "files": [
                52
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
                61
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
                51
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
                57
            ],
            "description": [
                1
            ],
            "status": [
                59
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
                193
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
                61
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
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                8
            ],
            "versionDistribution": [
                601
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
                61
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
                294
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
                71
            ],
            "applicationRefreshToken": [
                71
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
                294
            ],
            "scope": [
                67
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
                440
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
                71
            ],
            "refreshToken": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                72
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
                439
            ],
            "workspaceUrls": [
                643
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                76
            ],
            "availableWorkspacesForSignUp": [
                76
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                77
            ],
            "tokens": [
                72
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
                25
            ],
            "axisNameDisplay": [
                79
            ],
            "color": [
                1
            ],
            "configurationType": [
                620
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
                83
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                84
            ],
            "numberFormat": [
                128
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                367
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
                275
            ],
            "rangeMax": [
                17
            ],
            "rangeMin": [
                17
            ],
            "secondaryAxisGroupByDateGranularity": [
                367
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
                83
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
                84
            ],
            "series": [
                85
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
                110
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
                106
            ],
            "currentBillingSubscription": [
                106
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
                91
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
                103
            ],
            "name": [
                1
            ],
            "prices": [
                97
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
                103
            ],
            "name": [
                1
            ],
            "prices": [
                98
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
                92
            ],
            "meteredProducts": [
                93
            ],
            "planKey": [
                96
            ],
            "resourceCreditProducts": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                17
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                112
            ],
            "recurringInterval": [
                470
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                112
            ],
            "recurringInterval": [
                470
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                99
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceTier": {
            "flatAmount": [
                17
            ],
            "unitAmount": [
                17
            ],
            "upTo": [
                17
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
                103
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
                103
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                92
            ],
            "on_BillingMeteredProduct": [
                93
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
                96
            ],
            "priceUsageBased": [
                112
            ],
            "productKey": [
                102
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "grantedCredits": [
                17
            ],
            "periodEnd": [
                193
            ],
            "periodStart": [
                193
            ],
            "productKey": [
                102
            ],
            "rolloverCredits": [
                17
            ],
            "totalGrantedCredits": [
                17
            ],
            "unitPriceCents": [
                17
            ],
            "usedCredits": [
                17
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
                107
            ],
            "cancelAt": [
                193
            ],
            "currentPeriodEnd": [
                193
            ],
            "id": [
                495
            ],
            "interval": [
                470
            ],
            "metadata": [
                294
            ],
            "phases": [
                108
            ],
            "status": [
                471
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                101
            ],
            "creditAmount": [
                17
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                495
            ],
            "quantity": [
                17
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                17
            ],
            "items": [
                109
            ],
            "start_date": [
                17
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
                17
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                17
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
                106
            ],
            "currentBillingSubscription": [
                106
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
                115
            ],
            "createdAt": [
                193
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
                116
            ],
            "syncStageStartedAt": [
                193
            ],
            "syncStatus": [
                117
            ],
            "syncedAt": [
                193
            ],
            "throttleFailureCount": [
                17
            ],
            "updatedAt": [
                193
            ],
            "visibility": [
                118
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
                620
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                620
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
                126
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
                620
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
                131
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
                620
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                17
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
                17
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
                17
            ],
            "maxScoreLevels": [
                17
            ],
            "medianLatencyMs": [
                17
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                17
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
                17
            ],
            "costPerTask": [
                17
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
                17
            ],
            "intelligenceIndex": [
                17
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
                17
            ],
            "modelFamily": [
                347
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                349
            ],
            "outputCostPerMillionTokens": [
                17
            ],
            "outputTokensPerSecond": [
                17
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
                27
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                135
            ],
            "aiModelTiers": [
                137
            ],
            "aiModels": [
                136
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                33
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                70
            ],
            "billing": [
                87
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                125
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
                139
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
                30
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
                142
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
                193
            ],
            "engineComponentKey": [
                227
            ],
            "frontComponent": [
                268
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
                143
            ],
            "position": [
                17
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                193
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
                359
            ],
            "on_PathCommandMenuItemPayload": [
                384
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                53
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
                495
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
                398
            ],
            "connectionProviderId": [
                495
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
                495
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
            "scopes": [
                1
            ],
            "updatedAt": [
                193
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
                280
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
                220
            ],
            "host": [
                1
            ],
            "password": [
                1
            ],
            "port": [
                17
            ],
            "username": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentChatChannelInput": {
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "memberIds": [
                495
            ],
            "name": [
                1
            ],
            "visibility": [
                11
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
                495
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
                327
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                54
            ],
            "targets": [
                56
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                60
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
                142
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
                227
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
                294
            ],
            "position": [
                17
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
                321
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
                495
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
                165
            ],
            "indexType": [
                287
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
                495
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
                17
            ],
            "toolTriggerSettings": [
                294
            ],
            "universalIdentifier": [
                495
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
                17
            ],
            "targetObjectMetadataId": [
                495
            ],
            "targetRecordId": [
                495
            ],
            "type": [
                351
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
                163
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                166
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                170
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
                377
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                376
            ],
            "pageLayoutId": [
                495
            ],
            "position": [
                17
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
                495
            ],
            "pageLayoutTabId": [
                495
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                621
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
                294
            ],
            "objectMetadataId": [
                495
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
                86
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                580
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                587
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                589
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
                17
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
                25
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
                17
            ],
            "size": [
                17
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
                609
            ],
            "parentViewFilterGroupId": [
                495
            ],
            "positionInViewFilterGroup": [
                17
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
                610
            ],
            "positionInViewFilterGroup": [
                17
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
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
                17
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
                603
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
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                495
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                612
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
                613
            ],
            "position": [
                17
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                616
            ],
            "visibility": [
                617
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                615
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
                147
            ],
            "before": [
                147
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
                270
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
                495
            ],
            "pageLayoutId": [
                495
            ],
            "position": [
                17
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
                17
            ],
            "name": [
                1
            ],
            "position": [
                17
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
                441
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
                495
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
                148
            ],
            "IMAP": [
                148
            ],
            "SMTP": [
                148
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
                620
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
                495
            ],
            "status": [
                224
            ],
            "tenantStatus": [
                225
            ],
            "unsubscribeHostnameStatus": [
                497
            ],
            "updatedAt": [
                193
            ],
            "verificationRecords": [
                598
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
                620
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
                229
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
                294
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
                336
            ],
            "objectRecordEventsWithQueryIds": [
                366
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
                495
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
                495
            ],
            "createdAt": [
                193
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
                417
            ],
            "name": [
                1
            ],
            "object": [
                353
            ],
            "objectMetadataId": [
                495
            ],
            "options": [
                294
            ],
            "relation": [
                417
            ],
            "settings": [
                294
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
                343
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                620
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
                373
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                147
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
                496
            ],
            "isActive": [
                113
            ],
            "isSystem": [
                113
            ],
            "isUIEditable": [
                113
            ],
            "isUIReadOnly": [
                113
            ],
            "objectMetadataId": [
                496
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
                620
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                620
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
                495
            ],
            "path": [
                1
            ],
            "size": [
                17
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
                193
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
                193
            ],
            "id": [
                495
            ],
            "path": [
                1
            ],
            "size": [
                17
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
                620
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
                441
            ],
            "type": [
                277
            ],
            "workspace": [
                640
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
                334
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
                620
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
                65
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
                193
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
                193
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
                620
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
                17
            ],
            "columnSpan": [
                17
            ],
            "row": [
                17
            ],
            "rowSpan": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                620
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
                220
            ],
            "host": [
                1
            ],
            "port": [
                17
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
                71
            ],
            "workspace": [
                644
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
                495
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                147
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
                193
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "order": [
                17
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
                286
            ],
            "id": [
                496
            ],
            "isCustom": [
                113
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
                495
            ],
            "messages": [
                40
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
                17
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                17
            ],
            "jobId": [
                1
            ],
            "progress": [
                8
            ],
            "startedAt": [
                17
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
                495
            ],
            "aggregateOperation": [
                25
            ],
            "axisNameDisplay": [
                79
            ],
            "color": [
                1
            ],
            "configurationType": [
                620
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
                128
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                367
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
                275
            ],
            "rangeMax": [
                17
            ],
            "rangeMin": [
                17
            ],
            "secondaryAxisGroupByDateGranularity": [
                367
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
                17
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
                17
            ],
            "lng": [
                17
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
                193
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
                17
            ],
            "toolTriggerSettings": [
                294
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                193
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
                17
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
                16
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
                71
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
                294
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
                316
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                61
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
                317
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                318
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
                620
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                145
            ],
            "connectedAccountId": [
                495
            ],
            "contactAutoCreationPolicy": [
                322
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
                495
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                329
            ],
            "pendingGroupEmailsAction": [
                323
            ],
            "syncStage": [
                324
            ],
            "syncStageStartedAt": [
                193
            ],
            "syncStatus": [
                325
            ],
            "syncedAt": [
                193
            ],
            "throttleFailureCount": [
                17
            ],
            "throttleRetryAfter": [
                193
            ],
            "type": [
                326
            ],
            "updatedAt": [
                193
            ],
            "visibility": [
                327
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
                330
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
                495
            ],
            "reason": [
                334
            ],
            "source": [
                335
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
                332
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
                365
            ],
            "recordId": [
                1
            ],
            "type": [
                337
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
                341
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
                140
            ],
            "objectMetadataItems": [
                345
            ],
            "views": [
                346
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
                612
            ],
            "objectMetadataId": [
                495
            ],
            "type": [
                616
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                625,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatChannelMembers": [
                4,
                {
                    "channelId": [
                        495,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        495,
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
                74,
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
                124,
                {
                    "input": [
                        123,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                111
            ],
            "cancelSwitchBillingPlan": [
                111
            ],
            "cancelSwitchResourceCreditPrice": [
                111
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
                105,
                {
                    "plan": [
                        96,
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
                60,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                60,
                {
                    "fileId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                144,
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
                371,
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
            "createAgentChatChannel": [
                5,
                {
                    "input": [
                        149,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                34,
                {
                    "input": [
                        151,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                321,
                {
                    "input": [
                        152,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                153,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        55,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                154,
                {
                    "input": [
                        155,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                68,
                {
                    "input": [
                        156,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                94
            ],
            "createCalendarEvent": [
                158,
                {
                    "input": [
                        157,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                15,
                {
                    "channelId": [
                        495
                    ]
                }
            ],
            "createCommandMenuItem": [
                141,
                {
                    "input": [
                        159,
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
                161,
                {
                    "input": [
                        160,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                223,
                {
                    "input": [
                        162,
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
                        17,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                268,
                {
                    "input": [
                        164,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                350,
                {
                    "inputs": [
                        169,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                606,
                {
                    "inputs": [
                        183,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                605,
                {
                    "inputs": [
                        184,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                611,
                {
                    "inputs": [
                        187,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                332,
                {
                    "input": [
                        168,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                350,
                {
                    "input": [
                        169,
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
                        17,
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
                31,
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
                        294
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
                        150,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                248,
                {
                    "input": [
                        171,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                283,
                {
                    "input": [
                        172,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                306,
                {
                    "input": [
                        167,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                353,
                {
                    "input": [
                        173,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                424,
                {
                    "createRoleInput": [
                        178,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                374,
                {
                    "input": [
                        174,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                375,
                {
                    "input": [
                        175,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                378,
                {
                    "input": [
                        176,
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
                        179,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                94,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        96,
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
                498,
                {
                    "input": [
                        180,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                578,
                {
                    "input": [
                        181,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                597,
                {
                    "input": [
                        182,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                602,
                {
                    "input": [
                        188,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                605,
                {
                    "input": [
                        184,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                606,
                {
                    "input": [
                        183,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                607,
                {
                    "input": [
                        186,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                608,
                {
                    "input": [
                        185,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                611,
                {
                    "input": [
                        187,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                614,
                {
                    "input": [
                        189,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                618,
                {
                    "input": [
                        190,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                464,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        495,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        495
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
                        39
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                321,
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
                        194,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                141,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                145,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                625
            ],
            "deleteEmailGroupChannel": [
                321,
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
                268,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                350,
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
                350,
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
                        19,
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
                283,
                {
                    "input": [
                        196,
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
                353,
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
                198,
                {
                    "input": [
                        199,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                464,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                200,
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
                591
            ],
            "deleteUserFromWorkspace": [
                594,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                597,
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
                605,
                {
                    "input": [
                        202,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                606,
                {
                    "input": [
                        201,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                607,
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
                611,
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
                618,
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
                605,
                {
                    "input": [
                        208,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                606,
                {
                    "input": [
                        207,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                607,
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
                611,
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
                145,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                215,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                216,
                {
                    "id": [
                        495,
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
                        495
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                89
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
                629
            ],
            "executeOneLogicFunction": [
                308,
                {
                    "input": [
                        245,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                36,
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
                65,
                {
                    "applicationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                71
            ],
            "generateTransientToken": [
                480
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
                73,
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
                73,
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
                73,
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
                370
            ],
            "grantApplicationCapabilities": [
                44,
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
                42,
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
            "joinAgentChatChannel": [
                4,
                {
                    "channelId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "leaveAgentChatChannel": [
                4,
                {
                    "channelId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsDoneInChannel": [
                4,
                {
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        495
                    ],
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                233
            ],
            "removeAgentChatChannelMember": [
                4,
                {
                    "channelId": [
                        495,
                        "UUID!"
                    ],
                    "memberWorkspaceMemberId": [
                        495,
                        "UUID!"
                    ]
                }
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                65,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                73,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "reopenAgentChatThreadInChannel": [
                4,
                {
                    "threadId": [
                        495,
                        "UUID!"
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
                141,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                374,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                378,
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
                        495,
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                8
            ],
            "revokeApiKey": [
                34,
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
                58,
                {
                    "applicationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                279,
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
                        495
                    ]
                }
            ],
            "sendChatMessage": [
                444,
                {
                    "browsingContext": [
                        294
                    ],
                    "fileAttachments": [
                        260,
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
                        495
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
                38,
                {
                    "input": [
                        456,
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
                111,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                78,
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
                78,
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
                371,
                {
                    "isAutoSkipped": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "snoozeAgentChatThreadInChannel": [
                4,
                {
                    "snoozedUntil": [
                        193,
                        "DateTime!"
                    ],
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                127,
                {
                    "connectedAccountId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                466,
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                467
            ],
            "switchBillingPlan": [
                111
            ],
            "switchSubscriptionInterval": [
                111
            ],
            "syncApplication": [
                639,
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
                31,
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
                        32,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                60,
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
            "updateAgentChatChannel": [
                5,
                {
                    "channelId": [
                        495,
                        "UUID!"
                    ],
                    "input": [
                        500,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                18,
                {
                    "action": [
                        13,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        193
                    ],
                    "threadIds": [
                        495,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                34,
                {
                    "input": [
                        502,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                321,
                {
                    "input": [
                        503,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                42,
                {
                    "id": [
                        495,
                        "UUID!"
                    ],
                    "input": [
                        504,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                60,
                {
                    "input": [
                        505,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                64,
                {
                    "input": [
                        507,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                114,
                {
                    "input": [
                        509,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                141,
                {
                    "input": [
                        511,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                321,
                {
                    "input": [
                        512,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                268,
                {
                    "input": [
                        514,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                246,
                {
                    "input": [
                        516,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                350,
                {
                    "inputs": [
                        527,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                353,
                {
                    "inputs": [
                        528,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                611,
                {
                    "inputs": [
                        550,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                321,
                {
                    "input": [
                        519,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                328,
                {
                    "input": [
                        521,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                328,
                {
                    "input": [
                        523,
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
                350,
                {
                    "input": [
                        527,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        501,
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
                248,
                {
                    "input": [
                        526,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        517,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                353,
                {
                    "input": [
                        528,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                424,
                {
                    "updateRoleInput": [
                        535,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                374,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        529,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        530,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                378,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        532,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                374,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        534,
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
                464,
                {
                    "input": [
                        537,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                475,
                {
                    "input": [
                        538,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                498,
                {
                    "input": [
                        539,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                578,
                {
                    "input": [
                        540,
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
                597,
                {
                    "input": [
                        541,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                602,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        552,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                605,
                {
                    "input": [
                        545,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                606,
                {
                    "input": [
                        543,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                607,
                {
                    "input": [
                        548,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                608,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        547,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                611,
                {
                    "input": [
                        550,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                614,
                {
                    "input": [
                        553,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                618,
                {
                    "input": [
                        555,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                625,
                {
                    "data": [
                        558,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                625,
                {
                    "data": [
                        557,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                634,
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
                        559,
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
                60,
                {
                    "file": [
                        560,
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
                        560,
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
                        560,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                263,
                {
                    "file": [
                        560,
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
                        560,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                263,
                {
                    "file": [
                        560,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                255,
                {
                    "upsertFieldPermissionsInput": [
                        561,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                602,
                {
                    "input": [
                        564,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                361,
                {
                    "upsertObjectPermissionsInput": [
                        565,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                425,
                {
                    "upsertPermissionFlagsInput": [
                        566,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                568,
                {
                    "input": [
                        567,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                602,
                {
                    "input": [
                        569,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                68,
                {
                    "input": [
                        595,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                599,
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
                78,
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
                600,
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
                193
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
                17
            ],
            "targetObjectMetadataId": [
                495
            ],
            "targetRecordId": [
                495
            ],
            "targetRecordIdentifier": [
                404
            ],
            "type": [
                351
            ],
            "updatedAt": [
                193
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
                620
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
                193
            ],
            "description": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                356,
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
                495
            ],
            "imageIdentifierFieldMetadataId": [
                495
            ],
            "indexMetadataList": [
                283
            ],
            "indexMetadatas": [
                358,
                {
                    "filter": [
                        286,
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
                360
            ],
            "readability": [
                338
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                495
            ],
            "searchFieldMetadataList": [
                443
            ],
            "sharingReach": [
                368
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
                343
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                355
            ],
            "pageInfo": [
                373
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                147
            ],
            "node": [
                353
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
                373
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                357
            ],
            "id": [
                496
            ],
            "isActive": [
                113
            ],
            "isRemote": [
                113
            ],
            "isSearchable": [
                113
            ],
            "isSystem": [
                113
            ],
            "isUICreatable": [
                113
            ],
            "isUIEditable": [
                113
            ],
            "isUIReadOnly": [
                113
            ],
            "or": [
                357
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
                284
            ],
            "pageInfo": [
                373
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
                294
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
                192
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                365
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
                364
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
                369
            ],
            "previousOnboardingStatus": [
                369
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
                147
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                147
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
                193
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                495
            ],
            "deletedAt": [
                193
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
                375
            ],
            "type": [
                377
            ],
            "universalIdentifier": [
                495
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
                495
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
                376
            ],
            "pageLayoutId": [
                495
            ],
            "position": [
                17
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                193
            ],
            "widgets": [
                378
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
                294
            ],
            "configuration": [
                619
            ],
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
            ],
            "gridPosition": [
                276
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
                381
            ],
            "title": [
                1
            ],
            "type": [
                621
            ],
            "universalIdentifier": [
                495
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
                376
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
                376
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
                379
            ],
            "on_PageLayoutWidgetGridPosition": [
                380
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                383
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                382
            ],
            "index": [
                8
            ],
            "layoutMode": [
                376
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
                193
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
                193
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
                25
            ],
            "color": [
                1
            ],
            "configurationType": [
                620
            ],
            "dateGranularity": [
                367
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
                128
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
                390
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
                17
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
                220
            ],
            "host": [
                1
            ],
            "port": [
                17
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
                193
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
                247
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
                69
            ],
            "authProviders": [
                70
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
                643
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
            "agentChatChannelSummaries": [
                7
            ],
            "agentChatChannelThreadIds": [
                9,
                {
                    "after": [
                        1
                    ],
                    "assignment": [
                        6
                    ],
                    "channelId": [
                        495,
                        "UUID!"
                    ],
                    "first": [
                        8
                    ],
                    "status": [
                        10
                    ]
                }
            ],
            "agentChatOpenThreadsSummary": [
                14
            ],
            "agentRuns": [
                22,
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
                26
            ],
            "apiKey": [
                34,
                {
                    "input": [
                        271,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                34
            ],
            "appConnection": [
                37,
                {
                    "id": [
                        16,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                37,
                {
                    "filter": [
                        303
                    ]
                }
            ],
            "appKeyValue": [
                38,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        39
                    ]
                }
            ],
            "appMessageChannels": [
                321,
                {
                    "filter": [
                        304
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                45,
                {
                    "applicationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                46,
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
                442,
                {
                    "applicationId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                81,
                {
                    "input": [
                        82,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                105,
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
                20,
                {
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                130,
                {
                    "threadId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                15,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                133,
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
                633,
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
                141,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                141
            ],
            "currentUser": [
                591
            ],
            "currentUserApplicationAuthorizations": [
                43
            ],
            "currentUserSessions": [
                593
            ],
            "currentWorkspace": [
                625
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
                48,
                {
                    "universalIdentifier": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                248,
                {
                    "id": [
                        495,
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
                393,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                60,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                64,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                134,
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
                60
            ],
            "findManyApplications": [
                42
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
                395
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
                        19,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                42,
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
                60,
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
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUpgradeApplicationJobStatus": [
                297,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                627
            ],
            "findWorkspaceFromInviteHash": [
                625,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                632
            ],
            "frontComponent": [
                268,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                268
            ],
            "getAddressDetails": [
                391,
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
                28
            ],
            "getApiKeyRoles": [
                424
            ],
            "getApprovedAccessDomains": [
                68
            ],
            "getAutoCompleteAddress": [
                75,
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
                146,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                223
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
                374,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                375,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                375,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                378,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                378,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                374,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        377
                    ]
                }
            ],
            "getPermissionFlags": [
                385
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
                        495,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                104
            ],
            "getRole": [
                424,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                424
            ],
            "getSSOIdentityProviders": [
                265
            ],
            "getToolIndex": [
                479
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
                575,
                {
                    "input": [
                        576
                    ]
                }
            ],
            "getView": [
                602,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                605,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                606,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                606,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                605,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                607,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                608,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                608,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                607,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                611,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                611,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                614,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                614,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                602,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        616,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                630
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
                95
            ],
            "messageSuppressions": [
                333,
                {
                    "input": [
                        266,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                339,
                {
                    "input": [
                        342,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                344
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
                114,
                {
                    "connectedAccountId": [
                        495
                    ]
                }
            ],
            "myConnectedAccounts": [
                145
            ],
            "myMessageChannels": [
                321,
                {
                    "connectedAccountId": [
                        495
                    ]
                }
            ],
            "myMessageFolders": [
                328,
                {
                    "messageChannelId": [
                        495
                    ]
                }
            ],
            "myUserApplicationVariables": [
                635
            ],
            "navigationMenuItem": [
                350,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                350
            ],
            "object": [
                353,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                363
            ],
            "objects": [
                354,
                {
                    "filter": [
                        357,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        191,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                388,
                {
                    "input": [
                        389,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                122,
                {
                    "input": [
                        392,
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
                        495,
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
                578
            ],
            "usageQuotaDefinitions": [
                582
            ],
            "usageQuotaScopeConsumption": [
                584,
                {
                    "input": [
                        585,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                586
            ],
            "validatePasswordResetToken": [
                596,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                597,
                {
                    "objectMetadataId": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                618,
                {
                    "id": [
                        495,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                618
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
                405
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
                16
            ],
            "principalId": [
                495
            ],
            "principalRoleId": [
                495
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
                620
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
                248
            ],
            "sourceObjectMetadata": [
                353
            ],
            "targetFieldMetadata": [
                248
            ],
            "targetObjectMetadata": [
                353
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
                16
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
                35
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
                495
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                361
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
                495
            ],
            "workspaceMembers": [
                634
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
                432
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                17
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
                430
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                17
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
                430
            ],
            "objectMetadataId": [
                495
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                495
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                17
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
                432
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                17
            ],
            "rowLevelPermissionPredicateGroupId": [
                495
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
                435
            ],
            "messages": [
                435
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                495
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
                294
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
                441
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
                495
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
                193
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "position": [
                17
            ],
            "tsVectorFieldMetadataId": [
                495
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
                294
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
                632
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
                122
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
                17
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
                39
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
                495
            ],
            "createdAt": [
                193
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
                17
            ],
            "scope": [
                458
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                495
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
                441
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
                71
            ],
            "workspace": [
                644
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
                495
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
                193
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
                620
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                642
            ],
            "thread": [
                15
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
                403,
                {
                    "input": [
                        177,
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
                12,
                {
                    "threadId": [
                        495,
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
                620
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
                193
            ],
            "emit": [
                476
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
                193
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
                477
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
                620
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
                71
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
                72
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
                193
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
                193
            ],
            "visibility": [
                499
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopicVisibility": {},
        "UpdateAgentChatChannelInput": {
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "name": [
                1
            ],
            "visibility": [
                11
            ],
            "__typename": [
                1
            ]
        },
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
                495
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
                327
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
                506
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
                508
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
                510
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                115
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                118
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
                142
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
                17
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
                495
            ],
            "options": [
                294
            ],
            "settings": [
                294
            ],
            "translations": [
                340
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
                515
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
                518
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
                17
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
                495
            ],
            "update": [
                520
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                322
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
                329
            ],
            "visibility": [
                327
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
                522
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
                522
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
                17
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
                360
            ],
            "readability": [
                338
            ],
            "sharingReach": [
                368
            ],
            "shortcut": [
                1
            ],
            "translations": [
                340
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
                513
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
                524
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
                525
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
                377
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
                376
            ],
            "position": [
                17
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
                376
            ],
            "position": [
                17
            ],
            "title": [
                1
            ],
            "widgets": [
                533
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
                495
            ],
            "pageLayoutTabId": [
                495
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                621
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
                495
            ],
            "objectMetadataId": [
                495
            ],
            "pageLayoutTabId": [
                495
            ],
            "position": [
                294
            ],
            "title": [
                1
            ],
            "type": [
                621
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
                531
            ],
            "type": [
                377
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
                536
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
                340
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
                181
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
                542
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
                544
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
                17
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
                546
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                25
            ],
            "isVisible": [
                4
            ],
            "position": [
                17
            ],
            "size": [
                17
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
                609
            ],
            "parentViewFilterGroupId": [
                495
            ],
            "positionInViewFilterGroup": [
                17
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
                549
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
                610
            ],
            "positionInViewFilterGroup": [
                17
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
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
                551
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
                17
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
                603
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
                25
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
                613
            ],
            "position": [
                17
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                616
            ],
            "visibility": [
                617
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
                554
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                615
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
                556
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
                27
            ],
            "aiChatModelTier": [
                27
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
                495
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                17
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
                17
            ],
            "workspaceDiscoverability": [
                631
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
                495
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
                17
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
                562
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
                17
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                562
            ],
            "groups": [
                563
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
                362
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
                429
            ],
            "predicates": [
                431
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
                573
            ],
            "viewFields": [
                570
            ],
            "viewFilterGroups": [
                571
            ],
            "viewFilters": [
                572
            ],
            "viewSorts": [
                574
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
                25
            ],
            "fieldMetadataId": [
                495
            ],
            "isVisible": [
                4
            ],
            "position": [
                17
            ],
            "size": [
                17
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
                609
            ],
            "parentViewFilterGroupId": [
                495
            ],
            "positionInViewFilterGroup": [
                17
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
                610
            ],
            "positionInViewFilterGroup": [
                17
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "value": [
                294
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
                603
            ],
            "kanbanAggregateOperation": [
                25
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
                613
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                616
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                615
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
                193
            ],
            "periodStart": [
                193
            ],
            "timeSeries": [
                588
            ],
            "usageByApplication": [
                577
            ],
            "usageByModel": [
                577
            ],
            "usageByOperationType": [
                577
            ],
            "usageByUser": [
                577
            ],
            "userDailyUsage": [
                590
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                580
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
                17
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
                86
            ],
            "createdAt": [
                193
            ],
            "id": [
                495
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                580
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                587
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                589
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
                589
            ],
            "operationType": [
                580
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                579
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                583
            ],
            "resourceType": [
                587
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                581
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
                580
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                589
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                86
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
                580
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                587
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                589
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                86
            ],
            "id": [
                495
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                580
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
                86
            ],
            "resourceType": [
                587
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
                589
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                17
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
                588
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
                77
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
                594
            ],
            "currentWorkspace": [
                625
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
                369
            ],
            "previousOnboardingStatus": [
                369
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                193
            ],
            "userVars": [
                295
            ],
            "userWorkspaces": [
                594
            ],
            "workspaceMember": [
                634
            ],
            "workspaceMembers": [
                634
            ],
            "workspaces": [
                594
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
                193
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
                193
            ],
            "deletedAt": [
                193
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
                361
            ],
            "objectsPermissions": [
                361
            ],
            "permissionFlags": [
                386
            ],
            "twoFactorAuthenticationMethodSummary": [
                491
            ],
            "updatedAt": [
                193
            ],
            "user": [
                591
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
                17
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
                71
            ],
            "workspaceUrls": [
                643
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
                603
            ],
            "createdAt": [
                193
            ],
            "createdByUserWorkspaceId": [
                495
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
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                495
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                612
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
                613
            ],
            "position": [
                17
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                616
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                193
            ],
            "viewFieldGroups": [
                606
            ],
            "viewFields": [
                605
            ],
            "viewFilterGroups": [
                608
            ],
            "viewFilters": [
                607
            ],
            "viewGroups": [
                611
            ],
            "viewSorts": [
                614
            ],
            "visibility": [
                617
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
                620
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                25
            ],
            "applicationId": [
                495
            ],
            "createdAt": [
                193
            ],
            "deletedAt": [
                193
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
                17
            ],
            "size": [
                17
            ],
            "universalIdentifier": [
                495
            ],
            "updatedAt": [
                193
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
                193
            ],
            "deletedAt": [
                193
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
                17
            ],
            "updatedAt": [
                193
            ],
            "viewFields": [
                605
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
                193
            ],
            "deletedAt": [
                193
            ],
            "fieldMetadataId": [
                495
            ],
            "id": [
                495
            ],
            "operand": [
                610
            ],
            "positionInViewFilterGroup": [
                17
            ],
            "relationTargetFieldMetadataId": [
                495
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                193
            ],
            "value": [
                294
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
                193
            ],
            "deletedAt": [
                193
            ],
            "id": [
                495
            ],
            "logicalOperator": [
                609
            ],
            "parentViewFilterGroupId": [
                495
            ],
            "positionInViewFilterGroup": [
                17
            ],
            "updatedAt": [
                193
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
                193
            ],
            "deletedAt": [
                193
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
                17
            ],
            "updatedAt": [
                193
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
                193
            ],
            "deletedAt": [
                193
            ],
            "direction": [
                615
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
                193
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
                193
            ],
            "deletedAt": [
                193
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
                193
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                24
            ],
            "on_BarChartConfiguration": [
                80
            ],
            "on_CalendarConfiguration": [
                119
            ],
            "on_CallRecordingSummaryConfiguration": [
                120
            ],
            "on_CallRecordingTranscriptConfiguration": [
                121
            ],
            "on_ChatConfiguration": [
                129
            ],
            "on_ChatThreadsConfiguration": [
                132
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
                278
            ],
            "on_LineChartConfiguration": [
                298
            ],
            "on_MessageCampaignBodyConfiguration": [
                319
            ],
            "on_MessageCampaignDetailsConfiguration": [
                320
            ],
            "on_NotesConfiguration": [
                352
            ],
            "on_PieChartConfiguration": [
                387
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
                604
            ],
            "on_WorkflowConfiguration": [
                622
            ],
            "on_WorkflowRunConfiguration": [
                623
            ],
            "on_WorkflowVersionConfiguration": [
                624
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                620
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                626
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                27
            ],
            "aiChatModelTier": [
                27
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
                88
            ],
            "billingEntitlements": [
                90
            ],
            "billingSubscriptions": [
                106
            ],
            "createdAt": [
                193
            ],
            "currentBillingSubscription": [
                106
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
                193
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                17
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
                495
            ],
            "installedApplications": [
                42
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
                17
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                17
            ],
            "updatedAt": [
                193
            ],
            "viewFields": [
                605
            ],
            "viewFilterGroups": [
                608
            ],
            "viewFilters": [
                607
            ],
            "viewGroups": [
                611
            ],
            "viewSorts": [
                614
            ],
            "views": [
                602
            ],
            "workspaceCustomApplication": [
                42
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                631
            ],
            "workspaceMembersCount": [
                17
            ],
            "workspaceUrls": [
                643
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
                628
            ],
            "personEnrichment": [
                294
            ],
            "personOutcome": [
                641
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
                636
            ],
            "id": [
                495
            ],
            "locale": [
                1
            ],
            "name": [
                270
            ],
            "numberFormat": [
                637
            ],
            "openRecordIn": [
                372
            ],
            "roles": [
                424
            ],
            "timeFormat": [
                638
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
                592
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
                643
            ],
            "__typename": [
                1
            ]
        }
    }
}