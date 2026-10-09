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
        56,
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
        489,
        491,
        493,
        553,
        573,
        580,
        582,
        596,
        602,
        603,
        605,
        606,
        608,
        609,
        610,
        613,
        614,
        619,
        621,
        624,
        629,
        630,
        631,
        634,
        635
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
                489
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
                489
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
                489
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
                489
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                489
            ],
            "createdAt": [
                187
            ],
            "id": [
                489
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
                489
            ],
            "status": [
                1
            ],
            "threadId": [
                489
            ],
            "turnId": [
                489
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
                489
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                489
            ],
            "messageId": [
                489
            ],
            "orderIndex": [
                8
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
                11
            ],
            "endedAt": [
                187
            ],
            "errorMessage": [
                1
            ],
            "id": [
                489
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
                489
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
                489
            ],
            "aggregateOperation": [
                19
            ],
            "configurationType": [
                613
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
                489
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
                489
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
                489
            ],
            "role": [
                325
            ],
            "workspaceMemberId": [
                489
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
                489
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
                489
            ],
            "id": [
                489
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                300
            ],
            "logoFileId": [
                489
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
                489
            ],
            "settingsCustomTabFrontComponentId": [
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                489
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
                489
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                489
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
                489
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
                489
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
                489
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
                489
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
                489
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
                255
            ],
            "fileId": [
                489
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
        "ApplicationPreferences": {
            "applicationId": [
                489
            ],
            "settingsMenuItems": [
                451
            ],
            "variables": [
                585
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                187
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                489
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
                489
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
                594
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                489
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
                187
            ],
            "description": [
                1
            ],
            "id": [
                489
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
        "ApplicationVariable": {
            "description": [
                1
            ],
            "id": [
                489
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
                489
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
                489
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
                636
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
                489
            ],
            "aggregateOperation": [
                19
            ],
            "axisNameDisplay": [
                74
            ],
            "color": [
                1
            ],
            "configurationType": [
                613
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
                123
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                361
            ],
            "primaryAxisGroupByFieldMetadataId": [
                489
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
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                361
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                489
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
                489
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
                489
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
                11
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
                11
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
            "currentPeriodEnd": [
                187
            ],
            "id": [
                489
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
                11
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                489
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
                489
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
                489
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
                613
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                613
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
                613
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
                613
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
            "serverUrl": [
                1
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
                489
            ],
            "availabilityObjectMetadataId": [
                489
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
                489
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
                489
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                489
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
                489
            ],
            "pageLayoutId": [
                489
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
                489
            ],
            "updatedAt": [
                187
            ],
            "workflowVersionId": [
                489
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
                47
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
                489
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
                489
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
                489
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
                489
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
                489
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                489
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                489
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
                489
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
                489
            ],
            "engineComponentKey": [
                221
            ],
            "frontComponentId": [
                489
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
                489
            ],
            "pageLayoutId": [
                489
            ],
            "payload": [
                288
            ],
            "position": [
                11
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                489
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
                489
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
                489
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
                489
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
                489
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
                489
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
                11
            ],
            "toolTriggerSettings": [
                288
            ],
            "universalIdentifier": [
                489
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
                489
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
                489
            ],
            "icon": [
                1
            ],
            "id": [
                489
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                489
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                489
            ],
            "targetRecordId": [
                489
            ],
            "type": [
                345
            ],
            "userWorkspaceId": [
                489
            ],
            "viewId": [
                489
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
                489
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
                489
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
                288
            ],
            "objectMetadataId": [
                489
            ],
            "pageLayoutTabId": [
                489
            ],
            "position": [
                288
            ],
            "title": [
                1
            ],
            "type": [
                614
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                489
            ],
            "filter": [
                288
            ],
            "objectMetadataId": [
                489
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
                489
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
                493
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
                573
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                580
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                582
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                489
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
                489
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
                489
            ],
            "id": [
                489
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
                489
            ],
            "viewId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                489
            ],
            "logicalOperator": [
                602
            ],
            "parentViewFilterGroupId": [
                489
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                489
            ],
            "id": [
                489
            ],
            "operand": [
                603
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                489
            ],
            "subFieldName": [
                1
            ],
            "value": [
                288
            ],
            "viewFilterGroupId": [
                489
            ],
            "viewId": [
                489
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
                489
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewId": [
                489
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
                489
            ],
            "calendarFieldMetadataId": [
                489
            ],
            "calendarLayout": [
                596
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                489
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                489
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                605
            ],
            "mainGroupByFieldMetadataId": [
                489
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                489
            ],
            "openRecordIn": [
                606
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                609
            ],
            "visibility": [
                610
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                608
            ],
            "fieldMetadataId": [
                489
            ],
            "id": [
                489
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                489
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                489
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
                489
            ],
            "name": [
                264
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                489
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
                489
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
                489
            ],
            "pageLayoutId": [
                489
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
                489
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
                489
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
                489
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
                613
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
                489
            ],
            "status": [
                218
            ],
            "tenantStatus": [
                219
            ],
            "unsubscribeHostnameStatus": [
                491
            ],
            "updatedAt": [
                187
            ],
            "verificationRecords": [
                591
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
                613
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
                288
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
                8
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
                8
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
                489
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
                489
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
                489
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
                489
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
                489
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
                613
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
                490
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
                490
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
                489
            ],
            "id": [
                489
            ],
            "objectMetadataId": [
                489
            ],
            "roleId": [
                489
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
                489
            ],
            "objectMetadataId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                613
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
                489
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
                489
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
                489
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
                489
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
                613
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                489
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
                633
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
                328
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                613
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
                489
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                60
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
                489
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
                489
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
                613
            ],
            "frontComponentId": [
                489
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                489
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
                489
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
                489
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
                489
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
                489
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
                613
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
                637
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
                489
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
                489
            ],
            "id": [
                489
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
                280
            ],
            "id": [
                490
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
                489
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
                489
            ],
            "messageThreadId": [
                489
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
                290
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                489
            ],
            "aggregateOperation": [
                19
            ],
            "axisNameDisplay": [
                74
            ],
            "color": [
                1
            ],
            "configurationType": [
                613
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
                361
            ],
            "primaryAxisGroupByFieldMetadataId": [
                489
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
                11
            ],
            "rangeMin": [
                11
            ],
            "secondaryAxisGroupByDateGranularity": [
                361
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                489
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
                489
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
                489
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
                489
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
                489
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
                288
            ],
            "universalIdentifier": [
                489
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
                11
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                489
            ],
            "applicationUniversalIdentifier": [
                489
            ],
            "id": [
                489
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                489
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
                613
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                613
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
                489
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
                489
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
                11
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
                489
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                489
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
                489
            ],
            "reason": [
                328
            ],
            "source": [
                329
            ],
            "unsubscribeTopicId": [
                489
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
                489
            ],
            "property": [
                1
            ],
            "provenance": [
                335
            ],
            "recordId": [
                489
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
                489
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                489
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
                489
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
                489
            ],
            "key": [
                605
            ],
            "objectMetadataId": [
                489
            ],
            "type": [
                609
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                618,
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
                        489
                    ],
                    "threadId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        489,
                        "UUID!"
                    ],
                    "roleId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        489,
                        "UUID!"
                    ],
                    "roleId": [
                        489,
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
                        489,
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
                        489,
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
                28,
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
                        11,
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
                599,
                {
                    "inputs": [
                        177,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                598,
                {
                    "inputs": [
                        178,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                604,
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
                455,
                {
                    "input": [
                        453,
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
                        489,
                        "UUID!"
                    ],
                    "properties": [
                        288
                    ],
                    "recordId": [
                        489,
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
                492,
                {
                    "input": [
                        174,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                571,
                {
                    "input": [
                        175,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                590,
                {
                    "input": [
                        176,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                595,
                {
                    "input": [
                        182,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                598,
                {
                    "input": [
                        178,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                599,
                {
                    "input": [
                        177,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                600,
                {
                    "input": [
                        180,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                601,
                {
                    "input": [
                        179,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                604,
                {
                    "input": [
                        181,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                607,
                {
                    "input": [
                        183,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                611,
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
                        489,
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
                315,
                {
                    "id": [
                        489,
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                140,
                {
                    "id": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                618
            ],
            "deleteEmailGroupChannel": [
                315,
                {
                    "id": [
                        489,
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                344,
                {
                    "ids": [
                        489,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                344,
                {
                    "id": [
                        489,
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
                        489,
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
                        489,
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                194,
                {
                    "twoFactorAuthenticationMethodId": [
                        489,
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                584
            ],
            "deleteUserFromWorkspace": [
                587,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                590,
                {
                    "id": [
                        489,
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
                598,
                {
                    "input": [
                        196,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                599,
                {
                    "input": [
                        195,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                600,
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
                604,
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
                611,
                {
                    "id": [
                        489,
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
                598,
                {
                    "input": [
                        202,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                599,
                {
                    "input": [
                        201,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                600,
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
                604,
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                209,
                {
                    "id": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                210,
                {
                    "id": [
                        489,
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
                        489
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
                622
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
                30,
                {
                    "apiKeyId": [
                        489,
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
                        489,
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
                486,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        489,
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
                487,
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
                38,
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
                        489,
                        "UUID!"
                    ],
                    "workspaceId": [
                        489,
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
                        489,
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
                        489,
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
                        489,
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
                        489,
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
                        416,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        489,
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
                52,
                {
                    "applicationId": [
                        489,
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
                        489
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
                        489,
                        "[UUID!]"
                    ],
                    "messageId": [
                        489,
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
                        489,
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
                        489
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
                32,
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
                        489
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
            "startChannelSync": [
                122,
                {
                    "connectedAccountId": [
                        489,
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                461
            ],
            "switchBillingPlan": [
                106
            ],
            "switchSubscriptionInterval": [
                106
            ],
            "syncApplication": [
                632,
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
                25,
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
                        26,
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
            "triggerInstallApplication": [
                478,
                {
                    "input": [
                        475,
                        "TriggerInstallApplicationInput!"
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
            "triggerUninstallApplication": [
                482,
                {
                    "input": [
                        479,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                481,
                {
                    "input": [
                        480,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                484,
                {
                    "input": [
                        483,
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
                        489,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                28,
                {
                    "input": [
                        495,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                315,
                {
                    "input": [
                        496,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                36,
                {
                    "id": [
                        489,
                        "UUID!"
                    ],
                    "input": [
                        497,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                55,
                {
                    "input": [
                        498,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                59,
                {
                    "input": [
                        500,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                109,
                {
                    "input": [
                        502,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                136,
                {
                    "input": [
                        504,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                315,
                {
                    "input": [
                        505,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                262,
                {
                    "input": [
                        507,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                240,
                {
                    "input": [
                        509,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                344,
                {
                    "inputs": [
                        520,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                347,
                {
                    "inputs": [
                        521,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                604,
                {
                    "inputs": [
                        543,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMessageChannel": [
                315,
                {
                    "input": [
                        512,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                322,
                {
                    "input": [
                        514,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                322,
                {
                    "input": [
                        516,
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
                        520,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        494,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        489
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
                        519,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        510,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                347,
                {
                    "input": [
                        521,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                418,
                {
                    "updateRoleInput": [
                        528,
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
                        522,
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
                        523,
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
                        525,
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
                        527,
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
                        530,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                469,
                {
                    "input": [
                        531,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                492,
                {
                    "input": [
                        532,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                571,
                {
                    "input": [
                        533,
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
                590,
                {
                    "input": [
                        534,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                595,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        545,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                598,
                {
                    "input": [
                        538,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                599,
                {
                    "input": [
                        536,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                600,
                {
                    "input": [
                        541,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                601,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        540,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                604,
                {
                    "input": [
                        543,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                607,
                {
                    "input": [
                        546,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                611,
                {
                    "input": [
                        548,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                618,
                {
                    "data": [
                        551,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                618,
                {
                    "data": [
                        550,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                627,
                {
                    "roleId": [
                        489,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        552,
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
                        553,
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
                        553,
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
                        553,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                257,
                {
                    "file": [
                        553,
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
                        553,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                257,
                {
                    "file": [
                        553,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                249,
                {
                    "upsertFieldPermissionsInput": [
                        554,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                595,
                {
                    "input": [
                        557,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                355,
                {
                    "upsertObjectPermissionsInput": [
                        558,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                419,
                {
                    "upsertPermissionFlagsInput": [
                        559,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                561,
                {
                    "input": [
                        560,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                595,
                {
                    "input": [
                        562,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                63,
                {
                    "input": [
                        588,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                592,
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
                593,
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
                489
            ],
            "color": [
                1
            ],
            "createdAt": [
                187
            ],
            "folderId": [
                489
            ],
            "icon": [
                1
            ],
            "id": [
                489
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "pageLayoutId": [
                489
            ],
            "position": [
                11
            ],
            "targetObjectMetadataId": [
                489
            ],
            "targetRecordId": [
                489
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
                489
            ],
            "viewId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                489
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
                489
            ],
            "imageIdentifierFieldMetadataId": [
                489
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
                489
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
                489
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
                490
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
                490
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
                489
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
                489
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
                489
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
                489
            ],
            "createdAt": [
                187
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                489
            ],
            "deletedAt": [
                187
            ],
            "id": [
                489
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
                489
            ],
            "tabs": [
                369
            ],
            "type": [
                371
            ],
            "universalIdentifier": [
                489
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
                489
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
                489
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
                489
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                489
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
                489
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                288
            ],
            "configuration": [
                612
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
                489
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
                489
            ],
            "pageLayoutTabId": [
                489
            ],
            "position": [
                375
            ],
            "title": [
                1
            ],
            "type": [
                614
            ],
            "universalIdentifier": [
                489
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
                8
            ],
            "columnSpan": [
                8
            ],
            "layoutMode": [
                370
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
                8
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
                489
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
                489
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
                489
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
                489
            ],
            "aggregateOperation": [
                19
            ],
            "color": [
                1
            ],
            "configurationType": [
                613
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
                8
            ],
            "groupByFieldMetadataId": [
                489
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
                489
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
                489
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
                489
            ],
            "createdAt": [
                187
            ],
            "domain": [
                1
            ],
            "id": [
                489
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
                489
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                636
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
                489
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
                        489,
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
                        265,
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
                        297
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
                315,
                {
                    "filter": [
                        298
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                39,
                {
                    "applicationId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                40,
                {
                    "applicationId": [
                        489,
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
                        489,
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
                489,
                {
                    "calendarEventId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                14,
                {
                    "threadId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                125,
                {
                    "threadId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                9,
                {
                    "id": [
                        489,
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
                626,
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
                        489,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                136
            ],
            "currentUser": [
                584
            ],
            "currentUserApplicationAuthorizations": [
                37
            ],
            "currentUserSessions": [
                586
            ],
            "currentWorkspace": [
                618
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
                42,
                {
                    "universalIdentifier": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                242,
                {
                    "id": [
                        489,
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
                55
            ],
            "findManyApplications": [
                36
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
                        13,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                36,
                {
                    "id": [
                        489
                    ],
                    "universalIdentifier": [
                        489
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
            "findUpgradeApplicationJobStatus": [
                291,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                620
            ],
            "findWorkspaceFromInviteHash": [
                618,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                625
            ],
            "frontComponent": [
                262,
                {
                    "id": [
                        489,
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
                22
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
                        489,
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
                        489,
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
                        489,
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
                568,
                {
                    "input": [
                        569
                    ]
                }
            ],
            "getView": [
                595,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                598,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                599,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                599,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                598,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                600,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                601,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                601,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                600,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                604,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                604,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                607,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                607,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                595,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        609,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                623
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
                489,
                {
                    "objectMetadataId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                54
            ],
            "myCalendarChannels": [
                109,
                {
                    "connectedAccountId": [
                        489
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
                        489
                    ]
                }
            ],
            "myMessageFolders": [
                322,
                {
                    "messageChannelId": [
                        489
                    ]
                }
            ],
            "myUserApplicationVariables": [
                628
            ],
            "navigationMenuItem": [
                344,
                {
                    "id": [
                        489,
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
                        489,
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
                        489,
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
                488,
                {
                    "userId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                492
            ],
            "usageLimits": [
                571
            ],
            "usageQuotaDefinitions": [
                575
            ],
            "usageQuotaScopeConsumption": [
                577,
                {
                    "input": [
                        578,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                579
            ],
            "validatePasswordResetToken": [
                589,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                590,
                {
                    "objectMetadataId": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                611,
                {
                    "id": [
                        489,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                611
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                489
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
                489
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
                489
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
                489
            ],
            "permissions": [
                399
            ],
            "recordId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                489
            ],
            "workspaceMemberId": [
                489
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
                10
            ],
            "principalId": [
                489
            ],
            "principalRoleId": [
                489
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
                489
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
                613
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
                489
            ],
            "recordId": [
                489
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
                489
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
                249
            ],
            "icon": [
                1
            ],
            "id": [
                489
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
                489
            ],
            "workspaceMembers": [
                627
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
                489
            ],
            "roleId": [
                489
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
                489
            ],
            "logicalOperator": [
                424
            ],
            "objectMetadataId": [
                489
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                489
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
                489
            ],
            "id": [
                489
            ],
            "operand": [
                426
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
            ],
            "rowLevelPermissionPredicateGroupId": [
                489
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
                489
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
                489
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
            "result": [
                288
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                489
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
                489
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
                489
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
                489
            ],
            "id": [
                489
            ],
            "position": [
                11
            ],
            "tsVectorFieldMetadataId": [
                489
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
                489
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
            "workspaceMemberIds": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                489
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
                625
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
                288
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                489
            ],
            "createdAt": [
                187
            ],
            "frontComponentId": [
                489
            ],
            "icon": [
                1
            ],
            "id": [
                489
            ],
            "position": [
                11
            ],
            "scope": [
                452
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                489
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
                489
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
                489
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
                637
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
                489
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
                489
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
                613
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                635
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
                        489,
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
                613
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
                489
            ],
            "createdAt": [
                187
            ],
            "emit": [
                470
            ],
            "frontComponentUniversalIdentifier": [
                489
            ],
            "icon": [
                1
            ],
            "id": [
                489
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
                489
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                489
            ],
            "universalIdentifier": [
                489
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
                489
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
                489
            ],
            "relationFieldUniversalIdentifier": [
                489
            ],
            "triggerFieldUniversalIdentifiers": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                613
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
                489
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
                489
            ],
            "gt": [
                489
            ],
            "gte": [
                489
            ],
            "iLike": [
                489
            ],
            "in": [
                489
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                489
            ],
            "lt": [
                489
            ],
            "lte": [
                489
            ],
            "neq": [
                489
            ],
            "notILike": [
                489
            ],
            "notIn": [
                489
            ],
            "notLike": [
                489
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
                489
            ],
            "name": [
                1
            ],
            "updatedAt": [
                187
            ],
            "visibility": [
                493
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
                489
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
                489
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
                489
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
                489
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
                499
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
                501
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
                489
            ],
            "update": [
                503
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
                489
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
                489
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                489
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
                489
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
                489
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
                489
            ],
            "update": [
                508
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
                489
            ],
            "update": [
                511
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
                11
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
                489
            ],
            "update": [
                513
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
                489
            ],
            "update": [
                515
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
                489
            ],
            "update": [
                515
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
                489
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
                489
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
                489
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
                489
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
                489
            ],
            "update": [
                506
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                489
            ],
            "update": [
                517
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                489
            ],
            "update": [
                518
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
                489
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
                489
            ],
            "layoutMode": [
                370
            ],
            "position": [
                11
            ],
            "title": [
                1
            ],
            "widgets": [
                526
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
                489
            ],
            "pageLayoutTabId": [
                489
            ],
            "position": [
                288
            ],
            "title": [
                1
            ],
            "type": [
                614
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
                489
            ],
            "objectMetadataId": [
                489
            ],
            "pageLayoutTabId": [
                489
            ],
            "position": [
                288
            ],
            "title": [
                1
            ],
            "type": [
                614
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
                489
            ],
            "tabs": [
                524
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
                489
            ],
            "update": [
                529
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
                489
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
                489
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
                493
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                489
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
                489
            ],
            "update": [
                535
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
                489
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
                489
            ],
            "update": [
                537
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
                489
            ],
            "update": [
                539
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                489
            ],
            "logicalOperator": [
                602
            ],
            "parentViewFilterGroupId": [
                489
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "viewId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                489
            ],
            "update": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                489
            ],
            "operand": [
                603
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                489
            ],
            "subFieldName": [
                1
            ],
            "value": [
                288
            ],
            "viewFilterGroupId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                489
            ],
            "update": [
                544
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                489
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
                489
            ],
            "calendarFieldMetadataId": [
                489
            ],
            "calendarLayout": [
                596
            ],
            "groupLoadLimit": [
                8
            ],
            "icon": [
                1
            ],
            "id": [
                489
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                489
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                489
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                606
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                609
            ],
            "visibility": [
                610
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                489
            ],
            "update": [
                547
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                608
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
                489
            ],
            "update": [
                549
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
                288
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                489
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
                624
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                489
            ],
            "isVisible": [
                4
            ],
            "position": [
                11
            ],
            "viewFieldId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                555
            ],
            "id": [
                489
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
                555
            ],
            "groups": [
                556
            ],
            "widgetId": [
                489
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "objectMetadataId": [
                489
            ],
            "predicateGroups": [
                423
            ],
            "predicates": [
                425
            ],
            "roleId": [
                489
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
                566
            ],
            "viewFields": [
                563
            ],
            "viewFilterGroups": [
                564
            ],
            "viewFilters": [
                565
            ],
            "viewSorts": [
                567
            ],
            "widgetId": [
                489
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
                489
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
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                489
            ],
            "logicalOperator": [
                602
            ],
            "parentViewFilterGroupId": [
                489
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
                489
            ],
            "id": [
                489
            ],
            "operand": [
                603
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                489
            ],
            "subFieldName": [
                1
            ],
            "value": [
                288
            ],
            "viewFilterGroupId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                489
            ],
            "calendarFieldMetadataId": [
                489
            ],
            "calendarLayout": [
                596
            ],
            "kanbanAggregateOperation": [
                19
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                489
            ],
            "kanbanColumnWidth": [
                8
            ],
            "mainGroupByFieldMetadataId": [
                489
            ],
            "openRecordIn": [
                606
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                609
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                608
            ],
            "fieldMetadataId": [
                489
            ],
            "id": [
                489
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
                581
            ],
            "usageByApplication": [
                570
            ],
            "usageByModel": [
                570
            ],
            "usageByOperationType": [
                570
            ],
            "usageByUser": [
                570
            ],
            "userDailyUsage": [
                583
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                573
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
                81
            ],
            "createdAt": [
                187
            ],
            "id": [
                489
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                81
            ],
            "operationType": [
                573
            ],
            "periodCount": [
                8
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                580
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                582
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
                582
            ],
            "operationType": [
                573
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                572
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                576
            ],
            "resourceType": [
                580
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                574
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
                573
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                582
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
                573
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                580
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                582
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
                489
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                81
            ],
            "operationType": [
                573
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
                580
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
                582
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
                581
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
                587
            ],
            "currentWorkspace": [
                618
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
                489
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
                587
            ],
            "workspaceMember": [
                627
            ],
            "workspaceMembers": [
                627
            ],
            "workspaces": [
                587
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
                489
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
                489
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
                489
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
                485
            ],
            "updatedAt": [
                187
            ],
            "user": [
                584
            ],
            "userId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                489
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
                489
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
                489
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                489
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
                489
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
                636
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
                489
            ],
            "calendarEndFieldMetadataId": [
                489
            ],
            "calendarFieldMetadataId": [
                489
            ],
            "calendarLayout": [
                596
            ],
            "createdAt": [
                187
            ],
            "createdByUserWorkspaceId": [
                489
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
                489
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
                489
            ],
            "kanbanColumnWidth": [
                8
            ],
            "key": [
                605
            ],
            "mainGroupByFieldMetadataId": [
                489
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                489
            ],
            "openRecordIn": [
                606
            ],
            "position": [
                11
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                609
            ],
            "universalIdentifier": [
                489
            ],
            "updatedAt": [
                187
            ],
            "viewFieldGroups": [
                599
            ],
            "viewFields": [
                598
            ],
            "viewFilterGroups": [
                601
            ],
            "viewFilters": [
                600
            ],
            "viewGroups": [
                604
            ],
            "viewSorts": [
                607
            ],
            "visibility": [
                610
            ],
            "workspaceId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                613
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
                489
            ],
            "createdAt": [
                187
            ],
            "deletedAt": [
                187
            ],
            "fieldMetadataId": [
                489
            ],
            "id": [
                489
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
                489
            ],
            "updatedAt": [
                187
            ],
            "viewFieldGroupId": [
                489
            ],
            "viewId": [
                489
            ],
            "workspaceId": [
                489
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
                489
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
                598
            ],
            "viewId": [
                489
            ],
            "workspaceId": [
                489
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
                489
            ],
            "id": [
                489
            ],
            "operand": [
                603
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "relationTargetFieldMetadataId": [
                489
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
                489
            ],
            "viewId": [
                489
            ],
            "workspaceId": [
                489
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
                489
            ],
            "logicalOperator": [
                602
            ],
            "parentViewFilterGroupId": [
                489
            ],
            "positionInViewFilterGroup": [
                11
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                489
            ],
            "workspaceId": [
                489
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
                489
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
                489
            ],
            "workspaceId": [
                489
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
                608
            ],
            "fieldMetadataId": [
                489
            ],
            "id": [
                489
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                187
            ],
            "viewId": [
                489
            ],
            "workspaceId": [
                489
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
                489
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
                489
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
                597
            ],
            "on_WorkflowConfiguration": [
                615
            ],
            "on_WorkflowRunConfiguration": [
                616
            ],
            "on_WorkflowVersionConfiguration": [
                617
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                613
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                619
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
                11
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
                489
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
                489
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
                598
            ],
            "viewFilterGroups": [
                601
            ],
            "viewFilters": [
                600
            ],
            "viewGroups": [
                604
            ],
            "viewSorts": [
                607
            ],
            "views": [
                595
            ],
            "workspaceCustomApplication": [
                36
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                624
            ],
            "workspaceMembersCount": [
                11
            ],
            "workspaceUrls": [
                636
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
                288
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                621
            ],
            "personEnrichment": [
                288
            ],
            "personOutcome": [
                634
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
                489
            ],
            "roleId": [
                489
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
                629
            ],
            "id": [
                489
            ],
            "locale": [
                1
            ],
            "name": [
                264
            ],
            "numberFormat": [
                630
            ],
            "openRecordIn": [
                366
            ],
            "roles": [
                418
            ],
            "timeFormat": [
                631
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
                489
            ],
            "userWorkspaceId": [
                489
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                489
            ],
            "variables": [
                585
            ],
            "workspaceMemberId": [
                489
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
                489
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
                489
            ],
            "workspaceUrls": [
                636
            ],
            "__typename": [
                1
            ]
        }
    }
}