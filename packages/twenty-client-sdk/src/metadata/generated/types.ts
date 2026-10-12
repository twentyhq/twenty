export default {
    "scalars": [
        1,
        4,
        6,
        7,
        10,
        12,
        14,
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
        107,
        113,
        116,
        117,
        118,
        119,
        127,
        129,
        143,
        148,
        193,
        194,
        221,
        225,
        226,
        228,
        238,
        244,
        248,
        252,
        255,
        262,
        276,
        278,
        288,
        295,
        296,
        297,
        308,
        310,
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
        563,
        583,
        590,
        592,
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
                498
            ],
            "createdAt": [
                194
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
                498
            ],
            "triggers": [
                295
            ],
            "updatedAt": [
                194
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
                498
            ],
            "isAccessible": [
                4
            ],
            "isCustom": [
                4
            ],
            "isOpenToEveryone": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "roleIds": [
                498
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelRole": {
            "icon": [
                1
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
        "AgentChatChannelSummary": {
            "channelId": [
                498
            ],
            "hasUnreadOpen": [
                4
            ],
            "openCount": [
                10
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
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
                10
            ],
            "openThreadCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThread": {
            "contextWindowTokens": [
                10
            ],
            "conversationSize": [
                10
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "id": [
                17
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                10
            ],
            "totalInputCredits": [
                6
            ],
            "totalInputTokens": [
                10
            ],
            "totalOutputCredits": [
                6
            ],
            "totalOutputTokens": [
                10
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                194
            ],
            "id": [
                498
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                194
            ],
            "lastReadAt": [
                194
            ],
            "snoozedUntil": [
                194
            ],
            "threadId": [
                498
            ],
            "updatedAt": [
                194
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
                194
            ],
            "id": [
                498
            ],
            "parts": [
                21
            ],
            "processedAt": [
                194
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
                194
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
                10
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
        "AgentRun": {
            "createdAt": [
                194
            ],
            "creatorName": [
                1
            ],
            "creatorSource": [
                1
            ],
            "credits": [
                6
            ],
            "endedAt": [
                194
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
                10
            ],
            "modelId": [
                1
            ],
            "outputTokens": [
                10
            ],
            "reply": [
                1
            ],
            "startedAt": [
                194
            ],
            "status": [
                23
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
                25
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
                295
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                129
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
                86
            ],
            "kind": [
                1
            ],
            "limitValue": [
                86
            ],
            "periodEnd": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                10
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
                10
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "ApiKey": {
            "createdAt": [
                194
            ],
            "expiresAt": [
                194
            ],
            "id": [
                498
            ],
            "name": [
                1
            ],
            "revokedAt": [
                194
            ],
            "role": [
                425
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                194
            ],
            "id": [
                498
            ],
            "name": [
                1
            ],
            "revokedAt": [
                194
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
                17
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
                41
            ],
            "receivedAt": [
                194
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
                63
            ],
            "applicationRegistrationId": [
                498
            ],
            "applicationVariables": [
                66
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
                142
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
                269
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
                307
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
                194
            ],
            "id": [
                498
            ],
            "lastAuthorizedAt": [
                194
            ],
            "lastUsedAt": [
                194
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
                194
            ],
            "authFailedAt": [
                194
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
                194
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
                194
            ],
            "lastSignedInAt": [
                194
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
                194
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
                262
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
                262
            ],
            "filePath": [
                1
            ],
            "size": [
                10
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
                194
            ],
            "fileFolder": [
                262
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
                194
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
                61
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                10
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                10
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
                61
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                194
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
                295
            ],
            "type": [
                1
            ],
            "updatedAt": [
                194
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
                295
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
                194
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
                194
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
                498
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
                295
            ],
            "firstDayOfTheWeek": [
                10
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
                129
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
                276
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
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
                295
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
                111
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
                472
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
                6
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                113
            ],
            "recurringInterval": [
                471
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                113
            ],
            "recurringInterval": [
                471
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
                6
            ],
            "unitAmount": [
                6
            ],
            "upTo": [
                6
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
                113
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
                6
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
            ],
            "productKey": [
                102
            ],
            "rolloverCredits": [
                6
            ],
            "totalGrantedCredits": [
                6
            ],
            "unitPriceCents": [
                6
            ],
            "usedCredits": [
                6
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
                108
            ],
            "cancelAt": [
                194
            ],
            "collectionMethod": [
                107
            ],
            "currentPeriodEnd": [
                194
            ],
            "id": [
                498
            ],
            "interval": [
                471
            ],
            "metadata": [
                295
            ],
            "phases": [
                109
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
                101
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                498
            ],
            "quantity": [
                6
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                6
            ],
            "items": [
                110
            ],
            "start_date": [
                6
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                6
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
                498
            ],
            "contactAutoCreationPolicy": [
                116
            ],
            "createdAt": [
                194
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
                117
            ],
            "syncStageStartedAt": [
                194
            ],
            "syncStatus": [
                118
            ],
            "syncedAt": [
                194
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                194
            ],
            "visibility": [
                119
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
                10
            ],
            "globallyUnsubscribed": [
                10
            ],
            "hardSuppressed": [
                10
            ],
            "sendable": [
                10
            ],
            "topicUnsubscribed": [
                10
            ],
            "totalMembers": [
                10
            ],
            "trackingRefused": [
                10
            ],
            "withoutEmail": [
                10
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                127
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
                295
            ],
            "error": [
                132
            ],
            "maxSeq": [
                10
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
                6
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
                6
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
                6
            ],
            "maxScoreLevels": [
                6
            ],
            "medianLatencyMs": [
                6
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                6
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
                6
            ],
            "costPerTask": [
                6
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
                6
            ],
            "intelligenceIndex": [
                6
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
                6
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
                6
            ],
            "outputTokensPerSecond": [
                6
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
                136
            ],
            "aiModelTiers": [
                138
            ],
            "aiModels": [
                137
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
                126
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
                140
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
                194
            ],
            "link": [
                1
            ],
            "startAt": [
                194
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
                498
            ],
            "availabilityObjectMetadataId": [
                498
            ],
            "availabilityType": [
                143
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
                194
            ],
            "engineComponentKey": [
                228
            ],
            "frontComponent": [
                269
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
                144
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                498
            ],
            "updatedAt": [
                194
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
                53
            ],
            "files": [
                260
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
                194
            ],
            "authFailedAt": [
                194
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
                194
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
                194
            ],
            "lastSignedInAt": [
                194
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
                194
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
        "ConnectedImapSmtpCaldavAccount": {
            "connectionParameters": [
                281
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
                221
            ],
            "host": [
                1
            ],
            "password": [
                1
            ],
            "port": [
                6
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
            "isOpenToEveryone": [
                4
            ],
            "name": [
                1
            ],
            "roleIds": [
                498
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
                498
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
                498
            ],
            "availabilityType": [
                143
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
                228
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
                295
            ],
            "position": [
                6
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
                498
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
                255
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
                166
            ],
            "indexType": [
                288
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
                498
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
                6
            ],
            "toolTriggerSettings": [
                295
            ],
            "universalIdentifier": [
                498
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
                6
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
                164
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                167
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                171
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
                6
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
                498
            ],
            "pageLayoutTabId": [
                498
            ],
            "position": [
                295
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
                295
            ],
            "objectMetadataId": [
                498
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
                86
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                583
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                590
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                592
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
                6
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
                25
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
                6
            ],
            "size": [
                6
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
                6
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
                6
            ],
            "relationTargetFieldMetadataId": [
                498
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
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
                6
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
                10
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
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                498
            ],
            "kanbanColumnWidth": [
                10
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
                6
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
        "CursorPaging": {
            "after": [
                148
            ],
            "before": [
                148
            ],
            "first": [
                10
            ],
            "last": [
                10
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
                271
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
                214
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
                6
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
                6
            ],
            "name": [
                1
            ],
            "position": [
                6
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
                278
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
                149
            ],
            "IMAP": [
                149
            ],
            "SMTP": [
                149
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
                194
            ],
            "domain": [
                1
            ],
            "id": [
                498
            ],
            "status": [
                225
            ],
            "tenantStatus": [
                226
            ],
            "unsubscribeHostnameStatus": [
                500
            ],
            "updatedAt": [
                194
            ],
            "verificationRecords": [
                601
            ],
            "verifiedAt": [
                194
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
                10
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
                10
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
                10
            ],
            "jobs": [
                230
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                295
            ],
            "retryLimit": [
                10
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
                10
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
                194
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
                194
            ],
            "currentPeriodEnd": [
                194
            ],
            "expiresAt": [
                194
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
                194
            ],
            "start": [
                194
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
                238
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
                236
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                237
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
                239
            ],
            "first": [
                10
            ],
            "table": [
                244
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                240
            ],
            "records": [
                243
            ],
            "totalCount": [
                10
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
                194
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
                298
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
                295
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                248
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
                194
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
                295
            ],
            "relation": [
                418
            ],
            "settings": [
                295
            ],
            "type": [
                255
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                194
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
                252
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
                253
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
                148
            ],
            "node": [
                249
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                254
            ],
            "id": [
                499
            ],
            "isActive": [
                114
            ],
            "isSystem": [
                114
            ],
            "isUIEditable": [
                114
            ],
            "isUIReadOnly": [
                114
            ],
            "objectMetadataId": [
                499
            ],
            "or": [
                254
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
                194
            ],
            "id": [
                498
            ],
            "path": [
                1
            ],
            "size": [
                6
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
                194
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
                194
            ],
            "id": [
                498
            ],
            "path": [
                1
            ],
            "size": [
                6
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
                278
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
                10
            ],
            "offset": [
                10
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
                65
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
                194
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
                194
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
                6
            ],
            "columnSpan": [
                6
            ],
            "row": [
                6
            ],
            "rowSpan": [
                6
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
                221
            ],
            "host": [
                1
            ],
            "port": [
                6
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
                647
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                194
            ],
            "id": [
                498
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                148
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
                194
            ],
            "fieldMetadataId": [
                498
            ],
            "id": [
                498
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
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
                499
            ],
            "isCustom": [
                114
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
                498
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
                10
            ],
            "enqueuedAt": [
                6
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                6
            ],
            "jobId": [
                1
            ],
            "progress": [
                10
            ],
            "startedAt": [
                6
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
                498
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
                295
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "isCumulative": [
                4
            ],
            "isStacked": [
                4
            ],
            "numberFormat": [
                129
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
                276
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
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
                6
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
                6
            ],
            "lng": [
                6
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
                194
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
                6
            ],
            "toolTriggerSettings": [
                295
            ],
            "universalIdentifier": [
                498
            ],
            "updatedAt": [
                194
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
                6
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
                17
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
                10
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
                146
            ],
            "connectedAccountId": [
                498
            ],
            "contactAutoCreationPolicy": [
                323
            ],
            "createdAt": [
                194
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
                194
            ],
            "syncStatus": [
                326
            ],
            "syncedAt": [
                194
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                194
            ],
            "type": [
                327
            ],
            "updatedAt": [
                194
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
                194
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
                194
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
                194
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
                10
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
                141
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
                125,
                {
                    "input": [
                        124,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                112
            ],
            "cancelSwitchBillingPlan": [
                112
            ],
            "cancelSwitchResourceCreditPrice": [
                112
            ],
            "checkCustomDomainValidRecords": [
                215
            ],
            "checkPublicDomainValidRecords": [
                215,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                145,
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
                264,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                264,
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
                264,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                264,
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
                        150,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                34,
                {
                    "input": [
                        152,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                322,
                {
                    "input": [
                        153,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                154,
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
                155,
                {
                    "input": [
                        156,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                68,
                {
                    "input": [
                        157,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                94
            ],
            "createCalendarEvent": [
                159,
                {
                    "input": [
                        158,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                16,
                {
                    "channelId": [
                        498
                    ]
                }
            ],
            "createCommandMenuItem": [
                142,
                {
                    "input": [
                        160,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                213,
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
                162,
                {
                    "input": [
                        161,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                224,
                {
                    "input": [
                        163,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                263,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        262,
                        "FileFolder!"
                    ],
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        6,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                269,
                {
                    "input": [
                        165,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                351,
                {
                    "inputs": [
                        170,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                609,
                {
                    "inputs": [
                        184,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                608,
                {
                    "inputs": [
                        185,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                614,
                {
                    "inputs": [
                        188,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                333,
                {
                    "input": [
                        169,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                351,
                {
                    "input": [
                        170,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                263,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        6,
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
                31,
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
                        295
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
                        151,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                249,
                {
                    "input": [
                        172,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                284,
                {
                    "input": [
                        173,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                307,
                {
                    "input": [
                        168,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                354,
                {
                    "input": [
                        174,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                425,
                {
                    "createRoleInput": [
                        179,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                375,
                {
                    "input": [
                        175,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                376,
                {
                    "input": [
                        176,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                379,
                {
                    "input": [
                        177,
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
                        180,
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
                        181,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                581,
                {
                    "input": [
                        182,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                600,
                {
                    "input": [
                        183,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                605,
                {
                    "input": [
                        189,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                608,
                {
                    "input": [
                        185,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                609,
                {
                    "input": [
                        184,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                610,
                {
                    "input": [
                        187,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                611,
                {
                    "input": [
                        186,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                614,
                {
                    "input": [
                        188,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                617,
                {
                    "input": [
                        190,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                621,
                {
                    "input": [
                        191,
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
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        498,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        498
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
                        195,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                142,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                146,
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
                269,
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
                        19,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                249,
                {
                    "input": [
                        196,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                284,
                {
                    "input": [
                        197,
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
                354,
                {
                    "input": [
                        198,
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
                199,
                {
                    "input": [
                        200,
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
                201,
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
                594
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
                        203,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                609,
                {
                    "input": [
                        202,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                610,
                {
                    "input": [
                        204,
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
                        205,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        206,
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
                        209,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                609,
                {
                    "input": [
                        208,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                610,
                {
                    "input": [
                        210,
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
                        211,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        212,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                146,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                216,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                217,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                218,
                {
                    "input": [
                        219,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                222,
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
                89
            ],
            "enqueueJob": [
                231,
                {
                    "input": [
                        229,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                233,
                {
                    "input": [
                        232,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                632
            ],
            "executeOneLogicFunction": [
                309,
                {
                    "input": [
                        246,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                36,
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
                65,
                {
                    "applicationId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                71
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
                371
            ],
            "grantApplicationCapabilities": [
                44,
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
            "markAgentChatThreadAsDoneInChannel": [
                4,
                {
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        498
                    ],
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                234
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
                        498,
                        "UUID!"
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
                142,
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
                10
            ],
            "revokeApiKey": [
                34,
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
                58,
                {
                    "applicationId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                280,
                {
                    "connectionParameters": [
                        220,
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
                        295
                    ],
                    "channelId": [
                        498
                    ],
                    "fileAttachments": [
                        261,
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
                38,
                {
                    "input": [
                        457,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                234,
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
                112,
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
            "snoozeAgentChatThreadInChannel": [
                4,
                {
                    "snoozedUntil": [
                        194,
                        "DateTime!"
                    ],
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                128,
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
                        498,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                468
            ],
            "switchBillingPlan": [
                112
            ],
            "switchSubscriptionInterval": [
                112
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
                        295,
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
                        295
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
            "updateAgentChatChannel": [
                5,
                {
                    "channelId": [
                        498,
                        "UUID!"
                    ],
                    "input": [
                        503,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                18,
                {
                    "action": [
                        14,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        194
                    ],
                    "threadIds": [
                        498,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                34,
                {
                    "input": [
                        505,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                322,
                {
                    "input": [
                        506,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                42,
                {
                    "id": [
                        498,
                        "UUID!"
                    ],
                    "input": [
                        507,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                60,
                {
                    "input": [
                        508,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                64,
                {
                    "input": [
                        510,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                115,
                {
                    "input": [
                        512,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                142,
                {
                    "input": [
                        514,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                322,
                {
                    "input": [
                        515,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                269,
                {
                    "input": [
                        517,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                247,
                {
                    "input": [
                        519,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                351,
                {
                    "inputs": [
                        530,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                354,
                {
                    "inputs": [
                        531,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                614,
                {
                    "inputs": [
                        553,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                322,
                {
                    "input": [
                        522,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                329,
                {
                    "input": [
                        524,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                329,
                {
                    "input": [
                        526,
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
                        530,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        504,
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
                249,
                {
                    "input": [
                        529,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        520,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                354,
                {
                    "input": [
                        531,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                425,
                {
                    "updateRoleInput": [
                        538,
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
                        532,
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
                        533,
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
                        535,
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
                        537,
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
                465,
                {
                    "input": [
                        540,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                476,
                {
                    "input": [
                        541,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                501,
                {
                    "input": [
                        542,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                581,
                {
                    "input": [
                        543,
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
                600,
                {
                    "input": [
                        544,
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
                        555,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                608,
                {
                    "input": [
                        548,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                609,
                {
                    "input": [
                        546,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                610,
                {
                    "input": [
                        551,
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
                        550,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                614,
                {
                    "input": [
                        553,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                617,
                {
                    "input": [
                        556,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                621,
                {
                    "input": [
                        558,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                628,
                {
                    "data": [
                        561,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                628,
                {
                    "data": [
                        560,
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
                        562,
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
                        563,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                260,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        563,
                        "Upload!"
                    ],
                    "fileFolder": [
                        262,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                264,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        563,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                264,
                {
                    "file": [
                        563,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                264,
                {
                    "file": [
                        563,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                264,
                {
                    "file": [
                        563,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                256,
                {
                    "upsertFieldPermissionsInput": [
                        564,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                605,
                {
                    "input": [
                        567,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                362,
                {
                    "upsertObjectPermissionsInput": [
                        568,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                426,
                {
                    "upsertPermissionFlagsInput": [
                        569,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                571,
                {
                    "input": [
                        570,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                605,
                {
                    "input": [
                        572,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                68,
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
                224,
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
                194
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
                6
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
                194
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
                194
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
                        254,
                        "FieldFilter!"
                    ],
                    "paging": [
                        192,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                249
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
                284
            ],
            "indexMetadatas": [
                359,
                {
                    "filter": [
                        287,
                        "IndexFilter!"
                    ],
                    "paging": [
                        192,
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
                194
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
                148
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
                253
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
                114
            ],
            "isRemote": [
                114
            ],
            "isSearchable": [
                114
            ],
            "isSystem": [
                114
            ],
            "isUICreatable": [
                114
            ],
            "isUIEditable": [
                114
            ],
            "isUIReadOnly": [
                114
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
                285
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
                295
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordEvent": {
            "action": [
                193
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
                148
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                148
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
                194
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                498
            ],
            "deletedAt": [
                194
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
                194
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
                194
            ],
            "deletedAt": [
                194
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
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                498
            ],
            "updatedAt": [
                194
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
                295
            ],
            "configuration": [
                622
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
            ],
            "gridPosition": [
                277
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
                194
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
                10
            ],
            "columnSpan": [
                10
            ],
            "layoutMode": [
                377
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
                10
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
                194
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
                194
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
                25
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
                295
            ],
            "firstDayOfTheWeek": [
                10
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
                129
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
                391
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
                6
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
                221
            ],
            "host": [
                1
            ],
            "port": [
                6
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
                194
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
                248
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
                69
            ],
            "authProviders": [
                70
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
            "agentChatChannelRoles": [
                8
            ],
            "agentChatChannelSummaries": [
                9
            ],
            "agentChatChannelThreadIds": [
                11,
                {
                    "after": [
                        1
                    ],
                    "assignment": [
                        7
                    ],
                    "channelId": [
                        498,
                        "UUID!"
                    ],
                    "first": [
                        10
                    ],
                    "status": [
                        12
                    ]
                }
            ],
            "agentChatChannels": [
                5
            ],
            "agentChatOpenThreadsSummary": [
                15
            ],
            "agentRuns": [
                22,
                {
                    "agentId": [
                        498,
                        "UUID!"
                    ],
                    "limit": [
                        10,
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
                        272,
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
                        17,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                37,
                {
                    "filter": [
                        304
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
                322,
                {
                    "filter": [
                        305
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                45,
                {
                    "applicationId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                46,
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
                498,
                {
                    "calendarEventId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                20,
                {
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                131,
                {
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                16,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                134,
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
                142,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                142
            ],
            "currentUser": [
                594
            ],
            "currentUserApplicationAuthorizations": [
                43
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
                235
            ],
            "eventLogs": [
                242,
                {
                    "input": [
                        241,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                48,
                {
                    "universalIdentifier": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                249,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                251,
                {
                    "filter": [
                        254,
                        "FieldFilter!"
                    ],
                    "paging": [
                        192,
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
                135,
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
                396
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
                        19,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                42,
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
                60,
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
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUpgradeApplicationJobStatus": [
                298,
                {
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
                269,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                269
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
                28
            ],
            "getApiKeyRoles": [
                425
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
                295,
                {
                    "input": [
                        311,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                147,
                {
                    "id": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                224
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
                104
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
                266
            ],
            "getToolIndex": [
                480
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
                578,
                {
                    "input": [
                        579
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
                300,
                {
                    "input": [
                        301,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                95
            ],
            "messageSuppressions": [
                334,
                {
                    "input": [
                        267,
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
            "myCalendarChannels": [
                115,
                {
                    "connectedAccountId": [
                        498
                    ]
                }
            ],
            "myConnectedAccounts": [
                146
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
                        192,
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
                123,
                {
                    "input": [
                        393,
                        "PreviewMessageCampaignAudienceInput!"
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
                581
            ],
            "usageQuotaDefinitions": [
                585
            ],
            "usageQuotaScopeConsumption": [
                587,
                {
                    "input": [
                        588,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                589
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
                10
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
                17
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
                10
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
                249
            ],
            "sourceObjectMetadata": [
                354
            ],
            "targetFieldMetadata": [
                249
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
                17
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
                256
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
                6
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
                431
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
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
                6
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
                6
            ],
            "rowLevelPermissionPredicateGroupId": [
                498
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
                436
            ],
            "messages": [
                436
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                498
            ],
            "thread": [
                439
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
                295
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
                278
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
                194
            ],
            "fieldMetadataId": [
                498
            ],
            "id": [
                498
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                498
            ],
            "updatedAt": [
                194
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
                295
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
                194
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                123
            ],
            "campaignId": [
                1
            ],
            "queuedCount": [
                10
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
                6
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
                295
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
                194
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
                6
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
                194
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
                278
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
                194
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
                194
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
                16
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
                243,
                {
                    "fieldFilters": [
                        237,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        244,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                404,
                {
                    "input": [
                        178,
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
                13,
                {
                    "threadId": [
                        498,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                245,
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
                194
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
                194
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
                71
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
                498
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                194
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
                194
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
                194
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
                194
            ],
            "visibility": [
                502
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
            "isOpenToEveryone": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "roleIds": [
                498
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
                498
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
                498
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
                509
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
                511
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
                513
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                116
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                119
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
                143
            ],
            "engineComponentKey": [
                228
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
                6
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
                498
            ],
            "options": [
                295
            ],
            "settings": [
                295
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
                518
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
                521
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
                6
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
                498
            ],
            "update": [
                523
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
                525
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
                525
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
                6
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
                516
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
                527
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
                528
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
                6
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
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                536
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
                498
            ],
            "pageLayoutTabId": [
                498
            ],
            "position": [
                295
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
                295
            ],
            "configuration": [
                295
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
                295
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
                534
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
                539
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
                182
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
                545
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
                547
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
                6
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
                549
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
                6
            ],
            "size": [
                6
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
                6
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
                552
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
                6
            ],
            "relationTargetFieldMetadataId": [
                498
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
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
                554
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
                6
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
                10
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
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                498
            ],
            "kanbanColumnWidth": [
                10
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
                6
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
                557
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
                559
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
                295
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
                6
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
                6
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
                295
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
                257
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
                6
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
                565
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                565
            ],
            "groups": [
                566
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
                576
            ],
            "viewFields": [
                573
            ],
            "viewFilterGroups": [
                574
            ],
            "viewFilters": [
                575
            ],
            "viewSorts": [
                577
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
                25
            ],
            "fieldMetadataId": [
                498
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "size": [
                6
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
                6
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
                6
            ],
            "relationTargetFieldMetadataId": [
                498
            ],
            "subFieldName": [
                1
            ],
            "value": [
                295
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
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                498
            ],
            "kanbanColumnWidth": [
                10
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
                194
            ],
            "periodStart": [
                194
            ],
            "timeSeries": [
                591
            ],
            "usageByApplication": [
                580
            ],
            "usageByModel": [
                580
            ],
            "usageByOperationType": [
                580
            ],
            "usageByUser": [
                580
            ],
            "userDailyUsage": [
                593
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                583
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
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
                6
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
                194
            ],
            "id": [
                498
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                583
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                590
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                592
            ],
            "updatedAt": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                592
            ],
            "operationType": [
                583
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                582
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                586
            ],
            "resourceType": [
                590
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                584
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
                583
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                592
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
                194
            ],
            "periodStart": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                583
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                590
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                592
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
                498
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                86
            ],
            "operationType": [
                583
            ],
            "periodEnd": [
                194
            ],
            "periodStart": [
                194
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                86
            ],
            "resourceType": [
                590
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
                592
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                6
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
                591
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
                194
            ],
            "currentUserWorkspace": [
                597
            ],
            "currentWorkspace": [
                628
            ],
            "deletedAt": [
                194
            ],
            "deletedWorkspaceMembers": [
                207
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
                194
            ],
            "userVars": [
                296
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
        "UserSession": {
            "authProvider": [
                1
            ],
            "createdAt": [
                194
            ],
            "expiresAt": [
                194
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
                194
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
                194
            ],
            "deletedAt": [
                194
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
                194
            ],
            "user": [
                594
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
                6
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
                10
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
                194
            ],
            "createdByUserWorkspaceId": [
                498
            ],
            "deletedAt": [
                194
            ],
            "groupLoadLimit": [
                10
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
                25
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                498
            ],
            "kanbanColumnWidth": [
                10
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
                6
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
                194
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
                25
            ],
            "applicationId": [
                498
            ],
            "createdAt": [
                194
            ],
            "deletedAt": [
                194
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
                6
            ],
            "size": [
                6
            ],
            "universalIdentifier": [
                498
            ],
            "updatedAt": [
                194
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
                194
            ],
            "deletedAt": [
                194
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
                6
            ],
            "updatedAt": [
                194
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
                194
            ],
            "deletedAt": [
                194
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
                6
            ],
            "relationTargetFieldMetadataId": [
                498
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                194
            ],
            "value": [
                295
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
                194
            ],
            "deletedAt": [
                194
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
                6
            ],
            "updatedAt": [
                194
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
                194
            ],
            "deletedAt": [
                194
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
                6
            ],
            "updatedAt": [
                194
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
                194
            ],
            "deletedAt": [
                194
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
                194
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
                194
            ],
            "deletedAt": [
                194
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
                194
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
                120
            ],
            "on_CallRecordingSummaryConfiguration": [
                121
            ],
            "on_CallRecordingTranscriptConfiguration": [
                122
            ],
            "on_ChatConfiguration": [
                130
            ],
            "on_ChatThreadsConfiguration": [
                133
            ],
            "on_EmailThreadConfiguration": [
                223
            ],
            "on_EmailsConfiguration": [
                227
            ],
            "on_FieldConfiguration": [
                250
            ],
            "on_FieldRichTextConfiguration": [
                258
            ],
            "on_FieldsConfiguration": [
                259
            ],
            "on_FilesConfiguration": [
                265
            ],
            "on_FormFieldConfiguration": [
                268
            ],
            "on_FrontComponentConfiguration": [
                270
            ],
            "on_IframeConfiguration": [
                279
            ],
            "on_LineChartConfiguration": [
                299
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
                27
            ],
            "aiChatModelTier": [
                27
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
                88
            ],
            "billingEntitlements": [
                90
            ],
            "billingSubscriptions": [
                106
            ],
            "createdAt": [
                194
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
                425
            ],
            "deletedAt": [
                194
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                6
            ],
            "featureFlags": [
                247
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
                498
            ],
            "metadataVersion": [
                6
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                6
            ],
            "updatedAt": [
                194
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
                42
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                634
            ],
            "workspaceMembersCount": [
                6
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
                10
            ],
            "skillsCount": [
                10
            ],
            "toolsCount": [
                10
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
                631
            ],
            "personEnrichment": [
                295
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
                194
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
                10
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
                271
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
                595
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