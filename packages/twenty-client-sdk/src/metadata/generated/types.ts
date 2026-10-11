export default {
    "scalars": [
        1,
        4,
        6,
        8,
        12,
        13,
        15,
        18,
        19,
        25,
        27,
        29,
        32,
        34,
        41,
        53,
        61,
        63,
        69,
        81,
        85,
        86,
        88,
        93,
        98,
        104,
        114,
        117,
        118,
        119,
        120,
        128,
        130,
        144,
        149,
        194,
        195,
        222,
        226,
        227,
        229,
        239,
        245,
        249,
        253,
        256,
        263,
        277,
        279,
        289,
        296,
        297,
        298,
        309,
        311,
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
        409,
        411,
        412,
        415,
        420,
        432,
        434,
        438,
        443,
        460,
        472,
        473,
        475,
        497,
        499,
        501,
        562,
        582,
        589,
        591,
        605,
        611,
        612,
        614,
        615,
        617,
        618,
        619,
        622,
        623,
        628,
        630,
        633,
        638,
        639,
        640,
        643,
        644
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
                296
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
                195
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
                296
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
                296
            ],
            "roleId": [
                497
            ],
            "triggers": [
                296
            ],
            "updatedAt": [
                195
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
                497
            ],
            "name": [
                1
            ],
            "roleIds": [
                497
            ],
            "visibility": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelListItem": {
            "canLeave": [
                4
            ],
            "canManage": [
                4
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                497
            ],
            "isMember": [
                4
            ],
            "isSystem": [
                4
            ],
            "memberCount": [
                8
            ],
            "name": [
                1
            ],
            "roleIds": [
                497
            ],
            "visibility": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "AgentChatChannelRole": {
            "icon": [
                1
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
        "AgentChatChannelSummary": {
            "channelId": [
                497
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
        "AgentChatChannelThreadIds": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                4
            ],
            "threadIds": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatChannelVisibility": {},
        "AgentChatEvent": {
            "event": [
                296
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
                195
            ],
            "deletedAt": [
                195
            ],
            "id": [
                18
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                8
            ],
            "totalInputCredits": [
                19
            ],
            "totalInputTokens": [
                8
            ],
            "totalOutputCredits": [
                19
            ],
            "totalOutputTokens": [
                8
            ],
            "updatedAt": [
                195
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "Float": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                195
            ],
            "id": [
                497
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                195
            ],
            "lastReadAt": [
                195
            ],
            "snoozedUntil": [
                195
            ],
            "threadId": [
                497
            ],
            "updatedAt": [
                195
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
                195
            ],
            "id": [
                497
            ],
            "parts": [
                23
            ],
            "processedAt": [
                195
            ],
            "role": [
                1
            ],
            "senderUserWorkspaceId": [
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
                195
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
                296
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
                296
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                296
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
                195
            ],
            "creatorName": [
                1
            ],
            "creatorSource": [
                1
            ],
            "credits": [
                19
            ],
            "endedAt": [
                195
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
                195
            ],
            "status": [
                25
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
                27
            ],
            "configurationType": [
                622
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                296
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "label": [
                1
            ],
            "numberFormat": [
                130
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                404
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
                88
            ],
            "kind": [
                1
            ],
            "limitValue": [
                88
            ],
            "periodEnd": [
                195
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
                31
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "ApiKey": {
            "createdAt": [
                195
            ],
            "expiresAt": [
                195
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "revokedAt": [
                195
            ],
            "role": [
                426
            ],
            "updatedAt": [
                195
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                195
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "revokedAt": [
                195
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
                18
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
                41
            ],
            "value": [
                296
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
                43
            ],
            "receivedAt": [
                195
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
                333
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
                65
            ],
            "applicationRegistrationId": [
                497
            ],
            "applicationVariables": [
                68
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                296
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                143
            ],
            "defaultLogicFunctionRole": [
                426
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                270
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
                308
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
                355
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
                459
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
                195
            ],
            "id": [
                497
            ],
            "lastAuthorizedAt": [
                195
            ],
            "lastUsedAt": [
                195
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
                195
            ],
            "authFailedAt": [
                195
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                400
            ],
            "connectionProviderId": [
                497
            ],
            "createdAt": [
                195
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
                195
            ],
            "lastSignedInAt": [
                195
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
                195
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
                49
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
                51
            ],
            "coverage": [
                52
            ],
            "files": [
                54
            ],
            "manifest": [
                296
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
                63
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
                53
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
                263
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
                263
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
                195
            ],
            "fileFolder": [
                263
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
                59
            ],
            "description": [
                1
            ],
            "status": [
                61
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
                195
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
                63
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                195
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
                603
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
                63
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                195
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
                296
            ],
            "type": [
                1
            ],
            "updatedAt": [
                195
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
                73
            ],
            "applicationRefreshToken": [
                73
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
                296
            ],
            "scope": [
                69
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
                195
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
                442
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                195
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
                73
            ],
            "refreshToken": [
                73
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                74
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
                441
            ],
            "workspaceUrls": [
                645
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                78
            ],
            "availableWorkspacesForSignUp": [
                78
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                79
            ],
            "tokens": [
                74
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
                27
            ],
            "axisNameDisplay": [
                81
            ],
            "color": [
                1
            ],
            "configurationType": [
                622
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
                296
            ],
            "firstDayOfTheWeek": [
                8
            ],
            "groupMode": [
                85
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                86
            ],
            "numberFormat": [
                130
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                369
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
                277
            ],
            "rangeMax": [
                19
            ],
            "rangeMin": [
                19
            ],
            "secondaryAxisGroupByDateGranularity": [
                369
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
                277
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
                296
            ],
            "formattedToRawLookup": [
                296
            ],
            "groupMode": [
                85
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
                86
            ],
            "series": [
                87
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
                296
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
                112
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
                108
            ],
            "currentBillingSubscription": [
                108
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                93
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
                105
            ],
            "name": [
                1
            ],
            "prices": [
                99
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
                105
            ],
            "name": [
                1
            ],
            "prices": [
                100
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
                94
            ],
            "meteredProducts": [
                95
            ],
            "planKey": [
                98
            ],
            "resourceCreditProducts": [
                94
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                19
            ],
            "isSellable": [
                4
            ],
            "priceUsageType": [
                114
            ],
            "recurringInterval": [
                472
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "priceUsageType": [
                114
            ],
            "recurringInterval": [
                472
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                101
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceTier": {
            "flatAmount": [
                19
            ],
            "unitAmount": [
                19
            ],
            "upTo": [
                19
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
                105
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
                105
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                94
            ],
            "on_BillingMeteredProduct": [
                95
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
                98
            ],
            "priceUsageBased": [
                114
            ],
            "productKey": [
                104
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "grantedCredits": [
                19
            ],
            "periodEnd": [
                195
            ],
            "periodStart": [
                195
            ],
            "productKey": [
                104
            ],
            "rolloverCredits": [
                19
            ],
            "totalGrantedCredits": [
                19
            ],
            "unitPriceCents": [
                19
            ],
            "usedCredits": [
                19
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
                109
            ],
            "cancelAt": [
                195
            ],
            "currentPeriodEnd": [
                195
            ],
            "id": [
                497
            ],
            "interval": [
                472
            ],
            "metadata": [
                296
            ],
            "phases": [
                110
            ],
            "status": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "billingProduct": [
                103
            ],
            "creditAmount": [
                19
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                497
            ],
            "quantity": [
                19
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                19
            ],
            "items": [
                111
            ],
            "start_date": [
                19
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                19
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
                108
            ],
            "currentBillingSubscription": [
                108
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
                117
            ],
            "createdAt": [
                195
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
                118
            ],
            "syncStageStartedAt": [
                195
            ],
            "syncStatus": [
                119
            ],
            "syncedAt": [
                195
            ],
            "throttleFailureCount": [
                19
            ],
            "updatedAt": [
                195
            ],
            "visibility": [
                120
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
                622
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                622
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
                128
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
                622
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                296
            ],
            "error": [
                133
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
                622
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                19
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
                19
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
                19
            ],
            "maxScoreLevels": [
                19
            ],
            "medianLatencyMs": [
                19
            ],
            "modelId": [
                1
            ],
            "outputCostPerMillionTokens": [
                19
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
                19
            ],
            "costPerTask": [
                19
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
                19
            ],
            "intelligenceIndex": [
                19
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
                19
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
                19
            ],
            "outputTokensPerSecond": [
                19
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
                29
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                137
            ],
            "aiModelTiers": [
                139
            ],
            "aiModels": [
                138
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                35
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                72
            ],
            "billing": [
                89
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                127
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
                141
            ],
            "publicFeatureFlags": [
                398
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                457
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                474
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                195
            ],
            "link": [
                1
            ],
            "startAt": [
                195
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                32
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
                144
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
                195
            ],
            "engineComponentKey": [
                229
            ],
            "frontComponent": [
                270
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
                145
            ],
            "position": [
                19
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
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
                55
            ],
            "files": [
                261
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
                195
            ],
            "authFailedAt": [
                195
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                400
            ],
            "connectionProviderId": [
                497
            ],
            "createdAt": [
                195
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
                195
            ],
            "lastSignedInAt": [
                195
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
                195
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
                282
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
                222
            ],
            "host": [
                1
            ],
            "password": [
                1
            ],
            "port": [
                19
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
                497
            ],
            "name": [
                1
            ],
            "roleIds": [
                497
            ],
            "visibility": [
                13
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
                296
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
                296
            ],
            "roleId": [
                497
            ],
            "triggers": [
                296
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
                329
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                56
            ],
            "targets": [
                58
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                62
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
                144
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
                229
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
                296
            ],
            "position": [
                19
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
                296
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
                296
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                497
            ],
            "options": [
                296
            ],
            "relationCreationPayload": [
                296
            ],
            "settings": [
                296
            ],
            "type": [
                256
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
                167
            ],
            "indexType": [
                289
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
                296
            ],
            "databaseEventTriggerSettings": [
                296
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                296
            ],
            "id": [
                497
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                296
            ],
            "source": [
                296
            ],
            "timeoutSeconds": [
                19
            ],
            "toolTriggerSettings": [
                296
            ],
            "universalIdentifier": [
                497
            ],
            "workflowActionTriggerSettings": [
                296
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
                19
            ],
            "targetObjectMetadataId": [
                497
            ],
            "targetRecordId": [
                497
            ],
            "type": [
                353
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
                296
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
                165
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                168
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                172
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
                497
            ],
            "position": [
                19
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
                296
            ],
            "objectMetadataId": [
                497
            ],
            "pageLayoutTabId": [
                497
            ],
            "position": [
                296
            ],
            "title": [
                1
            ],
            "type": [
                623
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
                296
            ],
            "objectMetadataId": [
                497
            ],
            "orderBy": [
                296
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
                88
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                88
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
                19
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
                27
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
                19
            ],
            "size": [
                19
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
                611
            ],
            "parentViewFilterGroupId": [
                497
            ],
            "positionInViewFilterGroup": [
                19
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
                612
            ],
            "positionInViewFilterGroup": [
                19
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
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
                19
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
                605
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
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                497
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                614
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
                615
            ],
            "position": [
                19
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                618
            ],
            "visibility": [
                619
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                617
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
                149
            ],
            "before": [
                149
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
                272
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
                215
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
                19
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
                19
            ],
            "name": [
                1
            ],
            "position": [
                19
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
                443
            ],
            "type": [
                279
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
                443
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                150
            ],
            "IMAP": [
                150
            ],
            "SMTP": [
                150
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
                622
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                195
            ],
            "domain": [
                1
            ],
            "id": [
                497
            ],
            "status": [
                226
            ],
            "tenantStatus": [
                227
            ],
            "unsubscribeHostnameStatus": [
                499
            ],
            "updatedAt": [
                195
            ],
            "verificationRecords": [
                600
            ],
            "verifiedAt": [
                195
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                622
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
                296
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
                296
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
                231
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                296
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
                195
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
                195
            ],
            "currentPeriodEnd": [
                195
            ],
            "expiresAt": [
                195
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
                195
            ],
            "start": [
                195
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
                239
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
                237
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                238
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
                240
            ],
            "first": [
                8
            ],
            "table": [
                245
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                241
            ],
            "records": [
                244
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
                296
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                195
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
                299
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
                296
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                249
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
                195
            ],
            "defaultValue": [
                296
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
                419
            ],
            "name": [
                1
            ],
            "object": [
                355
            ],
            "objectMetadataId": [
                497
            ],
            "options": [
                296
            ],
            "relation": [
                419
            ],
            "settings": [
                296
            ],
            "type": [
                256
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                195
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
                622
            ],
            "fieldDisplayMode": [
                253
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
                254
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
                149
            ],
            "node": [
                250
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                255
            ],
            "id": [
                498
            ],
            "isActive": [
                115
            ],
            "isSystem": [
                115
            ],
            "isUIEditable": [
                115
            ],
            "isUIReadOnly": [
                115
            ],
            "objectMetadataId": [
                498
            ],
            "or": [
                255
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
                622
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                622
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
                195
            ],
            "id": [
                497
            ],
            "path": [
                1
            ],
            "size": [
                19
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
                195
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
                195
            ],
            "id": [
                497
            ],
            "path": [
                1
            ],
            "size": [
                19
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
                622
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
                443
            ],
            "type": [
                279
            ],
            "workspace": [
                642
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                622
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
                67
            ],
            "applicationVariables": [
                296
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
                195
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
                195
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
                622
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
                19
            ],
            "columnSpan": [
                19
            ],
            "row": [
                19
            ],
            "rowSpan": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                622
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
                283
            ],
            "IMAP": [
                283
            ],
            "SMTP": [
                283
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
                222
            ],
            "host": [
                1
            ],
            "port": [
                19
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
                73
            ],
            "workspace": [
                646
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "createdAt": [
                195
            ],
            "id": [
                497
            ],
            "indexFieldMetadataList": [
                287
            ],
            "indexType": [
                289
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
                195
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                149
            ],
            "node": [
                285
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                195
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "order": [
                19
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                195
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                288
            ],
            "id": [
                498
            ],
            "isCustom": [
                115
            ],
            "or": [
                288
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
                42
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                292
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
                19
            ],
            "failedReason": [
                1
            ],
            "finishedAt": [
                19
            ],
            "jobId": [
                1
            ],
            "progress": [
                8
            ],
            "startedAt": [
                19
            ],
            "state": [
                298
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
                27
            ],
            "axisNameDisplay": [
                81
            ],
            "color": [
                1
            ],
            "configurationType": [
                622
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
                296
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
                130
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                369
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
                277
            ],
            "rangeMax": [
                19
            ],
            "rangeMin": [
                19
            ],
            "secondaryAxisGroupByDateGranularity": [
                369
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
                277
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
                296
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                304
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
                296
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "data": [
                303
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
                19
            ],
            "lng": [
                19
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
                195
            ],
            "cronTriggerSettings": [
                296
            ],
            "databaseEventTriggerSettings": [
                296
            ],
            "description": [
                1
            ],
            "executionMode": [
                309
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                296
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
                19
            ],
            "toolTriggerSettings": [
                296
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
            ],
            "workflowActionTriggerSettings": [
                296
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                296
            ],
            "duration": [
                19
            ],
            "error": [
                296
            ],
            "logs": [
                1
            ],
            "status": [
                311
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                18
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
                73
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
                296
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
                318
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                63
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
                622
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                147
            ],
            "connectedAccountId": [
                497
            ],
            "contactAutoCreationPolicy": [
                324
            ],
            "createdAt": [
                195
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
                331
            ],
            "pendingGroupEmailsAction": [
                325
            ],
            "syncStage": [
                326
            ],
            "syncStageStartedAt": [
                195
            ],
            "syncStatus": [
                327
            ],
            "syncedAt": [
                195
            ],
            "throttleFailureCount": [
                19
            ],
            "throttleRetryAfter": [
                195
            ],
            "type": [
                328
            ],
            "updatedAt": [
                195
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
                195
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
                332
            ],
            "updatedAt": [
                195
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
                195
            ],
            "emailAddress": [
                1
            ],
            "id": [
                497
            ],
            "reason": [
                336
            ],
            "source": [
                337
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
                497
            ],
            "property": [
                1
            ],
            "provenance": [
                343
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
                142
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
                614
            ],
            "objectMetadataId": [
                497
            ],
            "type": [
                618
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                466,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                627,
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
                        497,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        497,
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
                76,
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
                126,
                {
                    "input": [
                        125,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                113
            ],
            "cancelSwitchBillingPlan": [
                113
            ],
            "cancelSwitchResourceCreditPrice": [
                113
            ],
            "checkCustomDomainValidRecords": [
                216
            ],
            "checkPublicDomainValidRecords": [
                216,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                107,
                {
                    "plan": [
                        98,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        472,
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
                62,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                62,
                {
                    "fileId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                146,
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
                265,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                265,
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
                265,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                265,
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
                        151,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                36,
                {
                    "input": [
                        153,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                323,
                {
                    "input": [
                        154,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                155,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        57,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                156,
                {
                    "input": [
                        157,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                70,
                {
                    "input": [
                        158,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                96
            ],
            "createCalendarEvent": [
                160,
                {
                    "input": [
                        159,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                17,
                {
                    "channelId": [
                        497
                    ]
                }
            ],
            "createCommandMenuItem": [
                143,
                {
                    "input": [
                        161,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                214,
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
                163,
                {
                    "input": [
                        162,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                225,
                {
                    "input": [
                        164,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                264,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        263,
                        "FileFolder!"
                    ],
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        19,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                270,
                {
                    "input": [
                        166,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                352,
                {
                    "inputs": [
                        171,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                608,
                {
                    "inputs": [
                        185,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                607,
                {
                    "inputs": [
                        186,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                613,
                {
                    "inputs": [
                        189,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMessageSuppression": [
                334,
                {
                    "input": [
                        170,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                352,
                {
                    "input": [
                        171,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                264,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        19,
                        "Float!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                463,
                {
                    "input": [
                        461,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                33,
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
                        296
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
                        152,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                250,
                {
                    "input": [
                        173,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                285,
                {
                    "input": [
                        174,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                308,
                {
                    "input": [
                        169,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                355,
                {
                    "input": [
                        175,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                426,
                {
                    "createRoleInput": [
                        180,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                376,
                {
                    "input": [
                        176,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                377,
                {
                    "input": [
                        177,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                380,
                {
                    "input": [
                        178,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                397,
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
                463,
                {
                    "input": [
                        462,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                466,
                {
                    "input": [
                        181,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                96,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        98,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        472,
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
                        182,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                580,
                {
                    "input": [
                        183,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                599,
                {
                    "input": [
                        184,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                604,
                {
                    "input": [
                        190,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                607,
                {
                    "input": [
                        186,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                608,
                {
                    "input": [
                        185,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                609,
                {
                    "input": [
                        188,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                610,
                {
                    "input": [
                        187,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                613,
                {
                    "input": [
                        189,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                616,
                {
                    "input": [
                        191,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                620,
                {
                    "input": [
                        192,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                466,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        497,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        497
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
                        41
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                323,
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
                        196,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                143,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                147,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                627
            ],
            "deleteEmailGroupChannel": [
                323,
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
                270,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                352,
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
                352,
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
                        21,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                250,
                {
                    "input": [
                        197,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                285,
                {
                    "input": [
                        198,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                308,
                {
                    "input": [
                        312,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                355,
                {
                    "input": [
                        199,
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
                200,
                {
                    "input": [
                        201,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                466,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                202,
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
                593
            ],
            "deleteUserFromWorkspace": [
                596,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                599,
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
                607,
                {
                    "input": [
                        204,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                608,
                {
                    "input": [
                        203,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                609,
                {
                    "input": [
                        205,
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
                613,
                {
                    "input": [
                        206,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        207,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                620,
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
                607,
                {
                    "input": [
                        210,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                608,
                {
                    "input": [
                        209,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                609,
                {
                    "input": [
                        211,
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
                613,
                {
                    "input": [
                        212,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        213,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                147,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                217,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                218,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                219,
                {
                    "input": [
                        220,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                223,
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
                91
            ],
            "enqueueJob": [
                232,
                {
                    "input": [
                        230,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                234,
                {
                    "input": [
                        233,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                631
            ],
            "executeOneLogicFunction": [
                310,
                {
                    "input": [
                        247,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                38,
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
                67,
                {
                    "applicationId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                73
            ],
            "generateTransientToken": [
                482
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
                75,
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
                75,
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
                75,
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
                274,
                {
                    "input": [
                        275,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                315,
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
                46,
                {
                    "input": [
                        276,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                284,
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
                291,
                {
                    "input": [
                        290,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                293,
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
                293
            ],
            "installApplication": [
                44,
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
                        497,
                        "UUID!"
                    ]
                }
            ],
            "leaveAgentChatChannel": [
                4,
                {
                    "channelId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsDoneInChannel": [
                4,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        497
                    ],
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                235
            ],
            "removeAgentChatChannelMember": [
                4,
                {
                    "channelId": [
                        497,
                        "UUID!"
                    ],
                    "memberWorkspaceMemberId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        421,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                413,
                {
                    "principal": [
                        410,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        418,
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
                67,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                75,
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
                        497,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        422,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                423,
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
                453,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                143,
                {
                    "id": [
                        497,
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
                477,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                446,
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
                36,
                {
                    "input": [
                        424,
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
                428,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                439,
                {
                    "input": [
                        435,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                60,
                {
                    "applicationId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                281,
                {
                    "connectionParameters": [
                        221,
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
                446,
                {
                    "browsingContext": [
                        296
                    ],
                    "channelId": [
                        497
                    ],
                    "fileAttachments": [
                        262,
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
                449,
                {
                    "input": [
                        448,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                452,
                {
                    "input": [
                        451,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                453,
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
                455,
                {
                    "input": [
                        454,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                450,
                {
                    "input": [
                        456,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                40,
                {
                    "input": [
                        458,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                235,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                413,
                {
                    "accessLevel": [
                        409,
                        "RecordShareAccessLevel!"
                    ],
                    "target": [
                        418,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                413,
                {
                    "accessLevel": [
                        409,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        410,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        418,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                113,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                80,
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
                80,
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
                464,
                {
                    "input": [
                        465
                    ]
                }
            ],
            "signUpInWorkspace": [
                464,
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
                373,
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
                        195,
                        "DateTime!"
                    ],
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                129,
                {
                    "connectedAccountId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                468,
                {
                    "companyContext": [
                        296
                    ],
                    "personContext": [
                        296
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
                469
            ],
            "switchBillingPlan": [
                113
            ],
            "switchSubscriptionInterval": [
                113
            ],
            "syncApplication": [
                641,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        296,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "trackAnalytics": [
                33,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        296
                    ],
                    "type": [
                        34,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                62,
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
            "updateAgentChatChannel": [
                5,
                {
                    "channelId": [
                        497,
                        "UUID!"
                    ],
                    "input": [
                        502,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                20,
                {
                    "action": [
                        15,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        195
                    ],
                    "threadIds": [
                        497,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                36,
                {
                    "input": [
                        504,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                323,
                {
                    "input": [
                        505,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                44,
                {
                    "id": [
                        497,
                        "UUID!"
                    ],
                    "input": [
                        506,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                62,
                {
                    "input": [
                        507,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                66,
                {
                    "input": [
                        509,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                116,
                {
                    "input": [
                        511,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                143,
                {
                    "input": [
                        513,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                323,
                {
                    "input": [
                        514,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                270,
                {
                    "input": [
                        516,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                248,
                {
                    "input": [
                        518,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                352,
                {
                    "inputs": [
                        529,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                355,
                {
                    "inputs": [
                        530,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                613,
                {
                    "inputs": [
                        552,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                323,
                {
                    "input": [
                        521,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                330,
                {
                    "input": [
                        523,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                330,
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
                352,
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
                250,
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
                355,
                {
                    "input": [
                        530,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                426,
                {
                    "updateRoleInput": [
                        537,
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
                        531,
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
                        532,
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
                        534,
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
                        536,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                294,
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
                466,
                {
                    "input": [
                        539,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                477,
                {
                    "input": [
                        540,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                500,
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
                599,
                {
                    "input": [
                        543,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                604,
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
                607,
                {
                    "input": [
                        547,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                608,
                {
                    "input": [
                        545,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                609,
                {
                    "input": [
                        550,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                610,
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
                613,
                {
                    "input": [
                        552,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                616,
                {
                    "input": [
                        555,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                620,
                {
                    "input": [
                        557,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                627,
                {
                    "data": [
                        560,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                627,
                {
                    "data": [
                        559,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                636,
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
                62,
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
                261,
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
                        263,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                265,
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
                265,
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
                265,
                {
                    "file": [
                        562,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                265,
                {
                    "file": [
                        562,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                257,
                {
                    "upsertFieldPermissionsInput": [
                        563,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                604,
                {
                    "input": [
                        566,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                363,
                {
                    "upsertObjectPermissionsInput": [
                        567,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                427,
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
                604,
                {
                    "input": [
                        571,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                70,
                {
                    "input": [
                        597,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                601,
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
                80,
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
                225,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                602,
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
                195
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
                19
            ],
            "targetObjectMetadataId": [
                497
            ],
            "targetRecordId": [
                497
            ],
            "targetRecordIdentifier": [
                406
            ],
            "type": [
                353
            ],
            "updatedAt": [
                195
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
                622
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
                195
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
                        255,
                        "FieldFilter!"
                    ],
                    "paging": [
                        193,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                250
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
                285
            ],
            "indexMetadatas": [
                360,
                {
                    "filter": [
                        288,
                        "IndexFilter!"
                    ],
                    "paging": [
                        193,
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
                362
            ],
            "readability": [
                340
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                497
            ],
            "searchFieldMetadataList": [
                445
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
                195
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
                149
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
                254
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
                498
            ],
            "isActive": [
                115
            ],
            "isRemote": [
                115
            ],
            "isSearchable": [
                115
            ],
            "isSystem": [
                115
            ],
            "isUICreatable": [
                115
            ],
            "isUIEditable": [
                115
            ],
            "isUIReadOnly": [
                115
            ],
            "or": [
                359
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
                286
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
                296
            ],
            "rowLevelPermissionPredicateGroups": [
                430
            ],
            "rowLevelPermissionPredicates": [
                429
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
                194
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
                296
            ],
            "before": [
                296
            ],
            "diff": [
                296
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
                149
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                149
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
                195
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                497
            ],
            "deletedAt": [
                195
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
                377
            ],
            "type": [
                379
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
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
                195
            ],
            "deletedAt": [
                195
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
                378
            ],
            "pageLayoutId": [
                497
            ],
            "position": [
                19
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
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
                497
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                296
            ],
            "configuration": [
                621
            ],
            "createdAt": [
                195
            ],
            "deletedAt": [
                195
            ],
            "gridPosition": [
                278
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
                383
            ],
            "title": [
                1
            ],
            "type": [
                623
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
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
                497
            ],
            "createdAt": [
                195
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
                195
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
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                622
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
                296
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
                130
            ],
            "orderBy": [
                277
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
                296
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
                296
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
                19
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
                307
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
                222
            ],
            "host": [
                1
            ],
            "port": [
                19
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
                195
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
                249
            ],
            "metadata": [
                399
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
                396
            ],
            "IMAP": [
                396
            ],
            "SMTP": [
                396
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                71
            ],
            "authProviders": [
                72
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
                645
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
            "agentChatChannelRoles": [
                9
            ],
            "agentChatChannelSummaries": [
                10
            ],
            "agentChatChannelThreadIds": [
                11,
                {
                    "after": [
                        1
                    ],
                    "assignment": [
                        6
                    ],
                    "channelId": [
                        497,
                        "UUID!"
                    ],
                    "first": [
                        8
                    ],
                    "status": [
                        12
                    ]
                }
            ],
            "agentChatChannels": [
                7
            ],
            "agentChatOpenThreadsSummary": [
                16
            ],
            "agentRuns": [
                24,
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
                28
            ],
            "apiKey": [
                36,
                {
                    "input": [
                        273,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                36
            ],
            "appConnection": [
                39,
                {
                    "id": [
                        18,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                39,
                {
                    "filter": [
                        305
                    ]
                }
            ],
            "appKeyValue": [
                40,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        41
                    ]
                }
            ],
            "appMessageChannels": [
                323,
                {
                    "filter": [
                        306
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                47,
                {
                    "applicationId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                48,
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
                444,
                {
                    "applicationId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                83,
                {
                    "input": [
                        84,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                107,
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
                22,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                132,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                17,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                135,
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
                635,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                470,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                143,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                143
            ],
            "currentUser": [
                593
            ],
            "currentUserApplicationAuthorizations": [
                45
            ],
            "currentUserSessions": [
                595
            ],
            "currentWorkspace": [
                627
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
                236
            ],
            "eventLogs": [
                243,
                {
                    "input": [
                        242,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                50,
                {
                    "universalIdentifier": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                250,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                252,
                {
                    "filter": [
                        255,
                        "FieldFilter!"
                    ],
                    "paging": [
                        193,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                395,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                62,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                64,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                66,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                136,
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
                299,
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
                62
            ],
            "findManyApplications": [
                44
            ],
            "findManyLogicFunctions": [
                308
            ],
            "findManyMarketplaceApps": [
                316,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                397
            ],
            "findMarketplaceAppDetail": [
                317,
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
                        21,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                44,
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
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                308,
                {
                    "input": [
                        312,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                299,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUpgradeApplicationJobStatus": [
                299,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                629
            ],
            "findWorkspaceFromInviteHash": [
                627,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                634
            ],
            "frontComponent": [
                270,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                270
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
                30
            ],
            "getApiKeyRoles": [
                426
            ],
            "getApprovedAccessDomains": [
                70
            ],
            "getAutoCompleteAddress": [
                77,
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
                296,
                {
                    "input": [
                        312,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                148,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                225
            ],
            "getInviteSuggestions": [
                295
            ],
            "getJobs": [
                299,
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
                        312,
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
                401,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                402,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                106
            ],
            "getRole": [
                426,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                426
            ],
            "getSSOIdentityProviders": [
                267
            ],
            "getToolIndex": [
                481
            ],
            "getToolInputSchema": [
                296,
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
                604,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                607,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                608,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                608,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                607,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                609,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                610,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                610,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                609,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                613,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                613,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                616,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                616,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                604,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        618,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                632
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
                301,
                {
                    "input": [
                        302,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                97
            ],
            "messageSuppressions": [
                335,
                {
                    "input": [
                        268,
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
                497,
                {
                    "objectMetadataId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "myCalendarChannels": [
                116,
                {
                    "connectedAccountId": [
                        497
                    ]
                }
            ],
            "myConnectedAccounts": [
                147
            ],
            "myMessageChannels": [
                323,
                {
                    "connectedAccountId": [
                        497
                    ]
                }
            ],
            "myMessageFolders": [
                330,
                {
                    "messageChannelId": [
                        497
                    ]
                }
            ],
            "myUserApplicationVariables": [
                637
            ],
            "navigationMenuItem": [
                352,
                {
                    "id": [
                        497,
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
                        497,
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
                        193,
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
                124,
                {
                    "input": [
                        394,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                317,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                316,
                {
                    "isVetted": [
                        4,
                        "Boolean!"
                    ]
                }
            ],
            "recordPermissions": [
                408,
                {
                    "targets": [
                        418,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                413,
                {
                    "target": [
                        418,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "skill": [
                466,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                466
            ],
            "timelineActivityTypes": [
                477
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
                598,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                599,
                {
                    "objectMetadataId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                620,
                {
                    "id": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                620
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
                407
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
                409
            ],
            "generalAccessLevel": [
                409
            ],
            "hasManagedGeneralAccess": [
                4
            ],
            "permissions": [
                407
            ],
            "roles": [
                416
            ],
            "shares": [
                414
            ],
            "sharingMode": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                409
            ],
            "id": [
                18
            ],
            "principalId": [
                497
            ],
            "principalRoleId": [
                497
            ],
            "principalType": [
                411
            ],
            "rowCause": [
                412
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
                622
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
                250
            ],
            "sourceObjectMetadata": [
                355
            ],
            "targetFieldMetadata": [
                250
            ],
            "targetObjectMetadata": [
                355
            ],
            "type": [
                420
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
                18
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
                37
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
                257
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
                363
            ],
            "permissionFlags": [
                427
            ],
            "rowLevelPermissionPredicateGroups": [
                430
            ],
            "rowLevelPermissionPredicates": [
                429
            ],
            "universalIdentifier": [
                497
            ],
            "workspaceMembers": [
                636
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
                434
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                19
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
                296
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
                432
            ],
            "objectMetadataId": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                19
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
                432
            ],
            "objectMetadataId": [
                497
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                497
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                19
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
                434
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                19
            ],
            "rowLevelPermissionPredicateGroupId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
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
                437
            ],
            "messages": [
                437
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                497
            ],
            "thread": [
                440
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
                436
            ],
            "content": [
                1
            ],
            "role": [
                438
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
                296
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
                443
            ],
            "type": [
                279
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
                443
            ],
            "type": [
                279
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
                195
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "position": [
                19
            ],
            "tsVectorFieldMetadataId": [
                497
            ],
            "updatedAt": [
                195
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
                447
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
                296
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
                634
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
                195
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                124
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
                19
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
                41
            ],
            "value": [
                296
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
                195
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
                19
            ],
            "scope": [
                460
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
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
                443
            ],
            "type": [
                279
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                73
            ],
            "workspace": [
                646
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
                497
            ],
            "content": [
                1
            ],
            "createdAt": [
                195
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
                195
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                425
            ],
            "configurationType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                644
            ],
            "thread": [
                17
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
                244,
                {
                    "fieldFilters": [
                        238,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        245,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                405,
                {
                    "input": [
                        179,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                313,
                {
                    "input": [
                        314,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "threadId": [
                        497,
                        "UUID!"
                    ]
                }
            ],
            "onEventSubscription": [
                246,
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
                475
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
                622
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
                195
            ],
            "emit": [
                478
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
                195
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
                479
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
                622
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
                296
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
                73
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
                195
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
                74
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
                195
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
                195
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
                195
            ],
            "visibility": [
                501
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
            "roleIds": [
                497
            ],
            "visibility": [
                13
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
                497
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                296
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
                296
            ],
            "roleId": [
                497
            ],
            "triggers": [
                296
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
                497
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
                117
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "visibility": [
                120
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
                144
            ],
            "engineComponentKey": [
                229
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
                19
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
                296
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
                296
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                497
            ],
            "options": [
                296
            ],
            "settings": [
                296
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
                497
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
                497
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
                296
            ],
            "databaseEventTriggerSettings": [
                296
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                296
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
                19
            ],
            "toolTriggerSettings": [
                296
            ],
            "workflowActionTriggerSettings": [
                296
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
                522
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
                497
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
                497
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
                19
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
                497
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
                497
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
                497
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
                497
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
                19
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
                378
            ],
            "position": [
                19
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
                296
            ],
            "configuration": [
                296
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
                296
            ],
            "title": [
                1
            ],
            "type": [
                623
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
                296
            ],
            "configuration": [
                296
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
                296
            ],
            "title": [
                1
            ],
            "type": [
                623
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
                533
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
                497
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
                183
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
                19
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
                548
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                27
            ],
            "isVisible": [
                4
            ],
            "position": [
                19
            ],
            "size": [
                19
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
                611
            ],
            "parentViewFilterGroupId": [
                497
            ],
            "positionInViewFilterGroup": [
                19
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
                551
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
                612
            ],
            "positionInViewFilterGroup": [
                19
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
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
                553
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
                19
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
                605
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
                27
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
                615
            ],
            "position": [
                19
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                618
            ],
            "visibility": [
                619
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
                556
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                617
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
                29
            ],
            "aiChatModelTier": [
                29
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                296
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
                19
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
                19
            ],
            "workspaceDiscoverability": [
                633
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                296
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
                258
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
                19
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
                564
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
                19
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
                497
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
                431
            ],
            "predicates": [
                433
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
                430
            ],
            "predicates": [
                429
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
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                27
            ],
            "fieldMetadataId": [
                497
            ],
            "isVisible": [
                4
            ],
            "position": [
                19
            ],
            "size": [
                19
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
                611
            ],
            "parentViewFilterGroupId": [
                497
            ],
            "positionInViewFilterGroup": [
                19
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
                612
            ],
            "positionInViewFilterGroup": [
                19
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "value": [
                296
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
                605
            ],
            "kanbanAggregateOperation": [
                27
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
                615
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                618
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                617
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
                195
            ],
            "periodStart": [
                195
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
                195
            ],
            "periodStart": [
                195
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
                19
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
                88
            ],
            "createdAt": [
                195
            ],
            "id": [
                497
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                88
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
                195
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
                88
            ],
            "periodEnd": [
                195
            ],
            "periodStart": [
                195
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
                88
            ],
            "id": [
                497
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                88
            ],
            "operationType": [
                582
            ],
            "periodEnd": [
                195
            ],
            "periodStart": [
                195
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                88
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
                19
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
                79
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                195
            ],
            "currentUserWorkspace": [
                596
            ],
            "currentWorkspace": [
                627
            ],
            "deletedAt": [
                195
            ],
            "deletedWorkspaceMembers": [
                208
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
                371
            ],
            "previousOnboardingStatus": [
                371
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                195
            ],
            "userVars": [
                297
            ],
            "userWorkspaces": [
                596
            ],
            "workspaceMember": [
                636
            ],
            "workspaceMembers": [
                636
            ],
            "workspaces": [
                596
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
                296
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
                195
            ],
            "expiresAt": [
                195
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
                195
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
                195
            ],
            "deletedAt": [
                195
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
                363
            ],
            "objectsPermissions": [
                363
            ],
            "permissionFlags": [
                388
            ],
            "twoFactorAuthenticationMethodSummary": [
                493
            ],
            "updatedAt": [
                195
            ],
            "user": [
                593
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
                19
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
                73
            ],
            "workspaceUrls": [
                645
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
                605
            ],
            "createdAt": [
                195
            ],
            "createdByUserWorkspaceId": [
                497
            ],
            "deletedAt": [
                195
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
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                497
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                614
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
                615
            ],
            "position": [
                19
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                618
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
            ],
            "viewFieldGroups": [
                608
            ],
            "viewFields": [
                607
            ],
            "viewFilterGroups": [
                610
            ],
            "viewFilters": [
                609
            ],
            "viewGroups": [
                613
            ],
            "viewSorts": [
                616
            ],
            "visibility": [
                619
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
                622
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                27
            ],
            "applicationId": [
                497
            ],
            "createdAt": [
                195
            ],
            "deletedAt": [
                195
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
                19
            ],
            "size": [
                19
            ],
            "universalIdentifier": [
                497
            ],
            "updatedAt": [
                195
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
                195
            ],
            "deletedAt": [
                195
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
                19
            ],
            "updatedAt": [
                195
            ],
            "viewFields": [
                607
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
                195
            ],
            "deletedAt": [
                195
            ],
            "fieldMetadataId": [
                497
            ],
            "id": [
                497
            ],
            "operand": [
                612
            ],
            "positionInViewFilterGroup": [
                19
            ],
            "relationTargetFieldMetadataId": [
                497
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                195
            ],
            "value": [
                296
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
                195
            ],
            "deletedAt": [
                195
            ],
            "id": [
                497
            ],
            "logicalOperator": [
                611
            ],
            "parentViewFilterGroupId": [
                497
            ],
            "positionInViewFilterGroup": [
                19
            ],
            "updatedAt": [
                195
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
                195
            ],
            "deletedAt": [
                195
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
                19
            ],
            "updatedAt": [
                195
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
                195
            ],
            "deletedAt": [
                195
            ],
            "direction": [
                617
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
                195
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
                195
            ],
            "deletedAt": [
                195
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
                195
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                26
            ],
            "on_BarChartConfiguration": [
                82
            ],
            "on_CalendarConfiguration": [
                121
            ],
            "on_CallRecordingSummaryConfiguration": [
                122
            ],
            "on_CallRecordingTranscriptConfiguration": [
                123
            ],
            "on_ChatConfiguration": [
                131
            ],
            "on_ChatThreadsConfiguration": [
                134
            ],
            "on_EmailThreadConfiguration": [
                224
            ],
            "on_EmailsConfiguration": [
                228
            ],
            "on_FieldConfiguration": [
                251
            ],
            "on_FieldRichTextConfiguration": [
                259
            ],
            "on_FieldsConfiguration": [
                260
            ],
            "on_FilesConfiguration": [
                266
            ],
            "on_FormFieldConfiguration": [
                269
            ],
            "on_FrontComponentConfiguration": [
                271
            ],
            "on_IframeConfiguration": [
                280
            ],
            "on_LineChartConfiguration": [
                300
            ],
            "on_MessageCampaignBodyConfiguration": [
                321
            ],
            "on_MessageCampaignDetailsConfiguration": [
                322
            ],
            "on_NotesConfiguration": [
                354
            ],
            "on_PieChartConfiguration": [
                389
            ],
            "on_RecordTableConfiguration": [
                417
            ],
            "on_StandaloneRichTextConfiguration": [
                467
            ],
            "on_TasksConfiguration": [
                476
            ],
            "on_TimelineConfiguration": [
                480
            ],
            "on_ViewConfiguration": [
                606
            ],
            "on_WorkflowConfiguration": [
                624
            ],
            "on_WorkflowRunConfiguration": [
                625
            ],
            "on_WorkflowVersionConfiguration": [
                626
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                622
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                628
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                29
            ],
            "aiChatModelTier": [
                29
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                296
            ],
            "allowImpersonation": [
                4
            ],
            "allowedIframeOrigins": [
                1
            ],
            "billingCustomer": [
                90
            ],
            "billingEntitlements": [
                92
            ],
            "billingSubscriptions": [
                108
            ],
            "createdAt": [
                195
            ],
            "currentBillingSubscription": [
                108
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                426
            ],
            "deletedAt": [
                195
            ],
            "displayName": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "eventLogRetentionDays": [
                19
            ],
            "featureFlags": [
                248
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
                44
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
                19
            ],
            "subdomain": [
                1
            ],
            "trashRetentionDays": [
                19
            ],
            "updatedAt": [
                195
            ],
            "viewFields": [
                607
            ],
            "viewFilterGroups": [
                610
            ],
            "viewFilters": [
                609
            ],
            "viewGroups": [
                613
            ],
            "viewSorts": [
                616
            ],
            "views": [
                604
            ],
            "workspaceCustomApplication": [
                44
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                633
            ],
            "workspaceMembersCount": [
                19
            ],
            "workspaceUrls": [
                645
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
                296
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                630
            ],
            "personEnrichment": [
                296
            ],
            "personOutcome": [
                643
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
                195
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
                638
            ],
            "id": [
                497
            ],
            "locale": [
                1
            ],
            "name": [
                272
            ],
            "numberFormat": [
                639
            ],
            "openRecordIn": [
                374
            ],
            "roles": [
                426
            ],
            "timeFormat": [
                640
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
                594
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
                296
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
                645
            ],
            "__typename": [
                1
            ]
        }
    }
}