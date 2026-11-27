export default {
    "scalars": [
        1,
        2,
        4,
        9,
        10,
        13,
        15,
        17,
        20,
        31,
        33,
        34,
        41,
        45,
        47,
        54,
        62,
        63,
        64,
        65,
        76,
        84,
        94,
        100,
        113,
        117,
        118,
        120,
        125,
        130,
        133,
        138,
        146,
        147,
        148,
        149,
        151,
        153,
        160,
        162,
        176,
        181,
        183,
        185,
        232,
        233,
        260,
        264,
        265,
        267,
        278,
        284,
        288,
        292,
        295,
        302,
        319,
        321,
        327,
        329,
        342,
        349,
        350,
        351,
        363,
        365,
        383,
        384,
        385,
        386,
        387,
        388,
        390,
        391,
        392,
        395,
        396,
        398,
        401,
        406,
        410,
        419,
        426,
        428,
        431,
        435,
        436,
        441,
        445,
        469,
        471,
        472,
        480,
        491,
        492,
        501,
        506,
        528,
        541,
        542,
        544,
        546,
        572,
        574,
        576,
        644,
        665,
        672,
        674,
        678,
        689,
        703,
        704,
        706,
        707,
        708,
        710,
        711,
        712,
        715,
        716,
        717,
        722,
        724,
        727,
        733,
        734,
        735,
        738,
        739
    ],
    "types": {
        "AccessGroupPropagationProgress": {
            "isInProgress": [
                1
            ],
            "remainingRecordCount": [
                2
            ],
            "totalRecordCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "Boolean": {},
        "Int": {},
        "ActivateWorkspaceInput": {
            "displayName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "String": {},
        "AddAgentChatThreadParticipantsInput": {
            "threadId": [
                572
            ],
            "workspaceMemberIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "AddQuerySubscriptionInput": {
            "eventStreamId": [
                4
            ],
            "operationSignature": [
                349
            ],
            "queryId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Agent": {
            "applicationId": [
                572
            ],
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "createdAt": [
                233
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isCustom": [
                1
            ],
            "isPrivate": [
                1
            ],
            "isSystem": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                349
            ],
            "modelId": [
                4
            ],
            "name": [
                4
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                349
            ],
            "roleId": [
                572
            ],
            "triggers": [
                349
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannel": {
            "applicationId": [
                572
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isAccessible": [
                1
            ],
            "isCustom": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                9
            ],
            "roleIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "Float": {},
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelRole": {
            "canAccessAllAgentChatChannels": [
                1
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelSummary": {
            "assignedCount": [
                2
            ],
            "assignedToMeCount": [
                2
            ],
            "channelId": [
                572
            ],
            "doneCount": [
                2
            ],
            "hasUnreadAssignedToMe": [
                1
            ],
            "hasUnreadOpen": [
                1
            ],
            "mentionedCount": [
                2
            ],
            "needsInputCount": [
                2
            ],
            "openCount": [
                2
            ],
            "snoozedCount": [
                2
            ],
            "unassignedCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadFilter": {},
        "AgentChatChannelThreadIds": {
            "endCursor": [
                4
            ],
            "hasNextPage": [
                1
            ],
            "threadIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                349
            ],
            "threadId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatInboxAction": {},
        "AgentChatOpenThreadsSummary": {
            "assignedThreadCount": [
                2
            ],
            "assignedToMeThreadCount": [
                2
            ],
            "hasUnreadAssignedThread": [
                1
            ],
            "hasUnreadMentionThread": [
                1
            ],
            "hasUnreadOpenThread": [
                1
            ],
            "mentionThreadCount": [
                2
            ],
            "needsInputThreadCount": [
                2
            ],
            "openThreadCount": [
                2
            ],
            "unassignedThreadCount": [
                2
            ],
            "unreadOpenThreadCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatThread": {
            "contextWindowTokens": [
                2
            ],
            "conversationSize": [
                2
            ],
            "createdAt": [
                233
            ],
            "deletedAt": [
                233
            ],
            "id": [
                20
            ],
            "isAssistantParticipant": [
                1
            ],
            "title": [
                4
            ],
            "totalCacheReadTokens": [
                2
            ],
            "totalInputCredits": [
                9
            ],
            "totalInputTokens": [
                2
            ],
            "totalOutputCredits": [
                9
            ],
            "totalOutputTokens": [
                2
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                233
            ],
            "id": [
                572
            ],
            "isSubscribed": [
                1
            ],
            "lastMentionedAt": [
                233
            ],
            "lastReadAt": [
                233
            ],
            "mentionsResolvedAt": [
                233
            ],
            "snoozedUntil": [
                233
            ],
            "threadId": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "AgentDailyRunCount": {
            "completedRunCount": [
                2
            ],
            "credits": [
                9
            ],
            "day": [
                4
            ],
            "failedRunCount": [
                2
            ],
            "otherRunCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentIdInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                572
            ],
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "isBuiltInAssistant": [
                1
            ],
            "parts": [
                25
            ],
            "processedAt": [
                233
            ],
            "reactions": [
                26
            ],
            "role": [
                4
            ],
            "senderApplicationId": [
                572
            ],
            "senderUserWorkspaceId": [
                572
            ],
            "senderWorkspaceMemberId": [
                572
            ],
            "status": [
                4
            ],
            "threadId": [
                572
            ],
            "turnId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                233
            ],
            "errorMessage": [
                4
            ],
            "fileFilename": [
                4
            ],
            "fileId": [
                572
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                572
            ],
            "messageId": [
                572
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                349
            ],
            "reasoningContent": [
                4
            ],
            "sourceDocumentFilename": [
                4
            ],
            "sourceDocumentMediaType": [
                4
            ],
            "sourceDocumentSourceId": [
                4
            ],
            "sourceDocumentTitle": [
                4
            ],
            "sourceUrlSourceId": [
                4
            ],
            "sourceUrlTitle": [
                4
            ],
            "sourceUrlUrl": [
                4
            ],
            "state": [
                4
            ],
            "textContent": [
                4
            ],
            "toolCallId": [
                4
            ],
            "toolInput": [
                349
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                349
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessageReactionSummary": {
            "agentIds": [
                572
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "AgentRecentRun": {
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "status": [
                31
            ],
            "__typename": [
                4
            ]
        },
        "AgentRun": {
            "canReadThread": [
                1
            ],
            "createdAt": [
                233
            ],
            "creatorName": [
                4
            ],
            "creatorSource": [
                4
            ],
            "credits": [
                9
            ],
            "endedAt": [
                233
            ],
            "errorMessage": [
                4
            ],
            "id": [
                572
            ],
            "input": [
                4
            ],
            "inputTokens": [
                2
            ],
            "modelId": [
                4
            ],
            "outputTokens": [
                2
            ],
            "reply": [
                4
            ],
            "startedAt": [
                233
            ],
            "status": [
                31
            ],
            "threadId": [
                572
            ],
            "threadTitle": [
                4
            ],
            "toolNames": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AgentRunInsights": {
            "agentId": [
                572
            ],
            "averageDurationInMs": [
                9
            ],
            "credits": [
                9
            ],
            "dailyRunCounts": [
                22
            ],
            "runCount": [
                2
            ],
            "tokenCount": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "AgentRunSummary": {
            "agentId": [
                572
            ],
            "recentRuns": [
                27
            ],
            "runCountLast14Days": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AgentTurnStatus": {},
        "AggregateChartConfiguration": {
            "aggregateFieldMetadataId": [
                572
            ],
            "aggregateOperation": [
                33
            ],
            "configurationType": [
                715
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                349
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "label": [
                4
            ],
            "numberFormat": [
                162
            ],
            "prefix": [
                4
            ],
            "ratioAggregateConfig": [
                464
            ],
            "suffix": [
                4
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AggregateOperations": {},
        "AiChatAssistantMode": {},
        "AiChatAssistantProfile": {
            "avatarColor": [
                4
            ],
            "avatarFace": [
                4
            ],
            "avatarShape": [
                4
            ],
            "displayName": [
                4
            ],
            "isAvatarAnimated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AiChatAssistantProfileInput": {
            "avatarColor": [
                4
            ],
            "avatarFace": [
                4
            ],
            "avatarShape": [
                4
            ],
            "displayName": [
                4
            ],
            "isAvatarAnimated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AiChatUsage": {
            "consumedValue": [
                120
            ],
            "kind": [
                4
            ],
            "limitValue": [
                120
            ],
            "periodEnd": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                120
            ],
            "limitValue": [
                120
            ],
            "periodEnd": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "AiDataPolicy": {
            "isProductImprovementDataSharingEnabled": [
                1
            ],
            "isZeroDataRetentionRequired": [
                1
            ],
            "requiredDataResidencyRegion": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AiDataPolicyInput": {
            "isProductImprovementDataSharingEnabled": [
                1
            ],
            "isZeroDataRetentionRequired": [
                1
            ],
            "requiredDataResidencyRegion": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AiModelTier": {},
        "AiRunUsage": {
            "inputTokens": [
                2
            ],
            "outputTokens": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                2
            ],
            "sections": [
                44
            ],
            "__typename": [
                4
            ]
        },
        "AiSystemPromptSection": {
            "content": [
                4
            ],
            "estimatedTokenCount": [
                2
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AllMetadataName": {},
        "Analytics": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AnalyticsType": {},
        "ApiConfig": {
            "mutationMaximumAffectedRecords": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "ApiKey": {
            "createdAt": [
                233
            ],
            "expiresAt": [
                233
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "revokedAt": [
                233
            ],
            "role": [
                486
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                233
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "revokedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyToken": {
            "token": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppConnection": {
            "accessToken": [
                4
            ],
            "authFailedAt": [
                4
            ],
            "authFailedReason": [
                4
            ],
            "externalAccountId": [
                4
            ],
            "handle": [
                4
            ],
            "id": [
                20
            ],
            "name": [
                4
            ],
            "providerName": [
                4
            ],
            "providerType": [
                4
            ],
            "scope": [
                181
            ],
            "scopes": [
                4
            ],
            "userWorkspaceId": [
                4
            ],
            "visibility": [
                4
            ],
            "workspaceMemberId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValue": {
            "key": [
                4
            ],
            "scope": [
                54
            ],
            "value": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                572
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppMessageFolderInput": {
            "externalId": [
                4
            ],
            "isSynced": [
                1
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppMessageInput": {
            "attachments": [
                55
            ],
            "externalId": [
                4
            ],
            "folderExternalIds": [
                4
            ],
            "participants": [
                58
            ],
            "receivedAt": [
                233
            ],
            "subject": [
                4
            ],
            "text": [
                4
            ],
            "threadExternalId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AppMessageParticipantInput": {
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "personId": [
                572
            ],
            "role": [
                392
            ],
            "workspaceMemberId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "Application": {
            "agents": [
                7
            ],
            "applicationRegistration": [
                96
            ],
            "applicationRegistrationId": [
                572
            ],
            "applicationVariables": [
                99
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                349
            ],
            "canBeUninstalled": [
                1
            ],
            "commandMenuItems": [
                175
            ],
            "content": [
                71
            ],
            "createdAt": [
                233
            ],
            "defaultLogicFunctionRole": [
                486
            ],
            "defaultRoleId": [
                4
            ],
            "description": [
                4
            ],
            "frontComponents": [
                309
            ],
            "grantRoleId": [
                572
            ],
            "grantedIframeMediaPermissions": [
                331
            ],
            "healthCheckLogicFunctionId": [
                572
            ],
            "id": [
                572
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                362
            ],
            "logoFileId": [
                572
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                412
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                572
            ],
            "requestedIframeMediaPermissions": [
                331
            ],
            "requestedRoleId": [
                572
            ],
            "runHealthCheckOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                572
            ],
            "settingsMenuItems": [
                527
            ],
            "universalIdentifier": [
                4
            ],
            "version": [
                4
            ],
            "yarnLockChecksum": [
                4
            ],
            "yarnLockFileId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                572
            ],
            "applicationLogoUrl": [
                4
            ],
            "applicationName": [
                4
            ],
            "applicationUniversalIdentifier": [
                4
            ],
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "lastAuthorizedAt": [
                233
            ],
            "lastUsedAt": [
                233
            ],
            "marketplaceAppUniversalIdentifier": [
                4
            ],
            "scopes": [
                4
            ],
            "userId": [
                572
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationBillingPrice": {
            "amountCents": [
                2
            ],
            "billingPeriod": [
                63
            ],
            "currency": [
                62
            ],
            "label": [
                4
            ],
            "per": [
                65
            ],
            "type": [
                64
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationBillingPriceCurrency": {},
        "ApplicationBillingPricePeriod": {},
        "ApplicationBillingPriceType": {},
        "ApplicationBillingPriceUnit": {},
        "ApplicationCapabilityGrant": {
            "grantedCapabilities": [
                4
            ],
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                572
            ],
            "archivedAt": [
                233
            ],
            "authFailedAt": [
                233
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                460
            ],
            "connectionProviderId": [
                572
            ],
            "createdAt": [
                233
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                572
            ],
            "isOwnedByCurrentUser": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                233
            ],
            "lastSignedInAt": [
                233
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                181
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                233
            ],
            "userWorkspaceId": [
                572
            ],
            "visibility": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedMemberCount": {
            "applicationId": [
                572
            ],
            "connectedMemberCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectionProvider": {
            "allowMultipleConnections": [
                1
            ],
            "applicationId": [
                4
            ],
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "oauth": [
                70
            ],
            "scope": [
                185
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectionProviderOAuthConfig": {
            "isClientCredentialsConfigured": [
                1
            ],
            "scopes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationContent": {
            "agents": [
                72
            ],
            "commandMenuItems": [
                72
            ],
            "connectionProviders": [
                72
            ],
            "fields": [
                72
            ],
            "frontComponents": [
                72
            ],
            "indexes": [
                72
            ],
            "logicFunctions": [
                72
            ],
            "mcpServers": [
                72
            ],
            "navigationMenuItems": [
                72
            ],
            "objects": [
                72
            ],
            "pageLayoutTabs": [
                72
            ],
            "pageLayouts": [
                72
            ],
            "permissionFlags": [
                72
            ],
            "publicAssets": [
                72
            ],
            "roles": [
                72
            ],
            "skills": [
                72
            ],
            "translations": [
                72
            ],
            "viewFields": [
                72
            ],
            "views": [
                72
            ],
            "workflows": [
                72
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationContentItem": {
            "color": [
                4
            ],
            "count": [
                2
            ],
            "description": [
                4
            ],
            "fieldUniversalIdentifier": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                4
            ],
            "label": [
                4
            ],
            "objectUniversalIdentifier": [
                4
            ],
            "parentLabel": [
                4
            ],
            "parentUniversalIdentifier": [
                4
            ],
            "position": [
                9
            ],
            "tag": [
                4
            ],
            "timeoutSeconds": [
                2
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExport": {
            "application": [
                74
            ],
            "coverage": [
                75
            ],
            "files": [
                77
            ],
            "manifest": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExportApplication": {
            "displayName": [
                4
            ],
            "sourceType": [
                94
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExportCoverageEntry": {
            "metadataName": [
                4
            ],
            "reason": [
                4
            ],
            "status": [
                76
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationExportCoverageStatus": {},
        "ApplicationExportFile": {
            "content": [
                4
            ],
            "encoding": [
                4
            ],
            "folder": [
                4
            ],
            "path": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileCompletionError": {
            "fileId": [
                572
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileUploadError": {
            "fileFolder": [
                302
            ],
            "filePath": [
                4
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileUploadRequestInput": {
            "fileFolder": [
                302
            ],
            "filePath": [
                4
            ],
            "size": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationFileUploadTarget": {
            "contentType": [
                4
            ],
            "expiresAt": [
                233
            ],
            "fileFolder": [
                302
            ],
            "fileId": [
                572
            ],
            "filePath": [
                4
            ],
            "uploadUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationHealthCheckAction": {
            "label": [
                4
            ],
            "location": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationHealthCheckResult": {
            "action": [
                82
            ],
            "description": [
                4
            ],
            "status": [
                84
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationHealthStatus": {},
        "ApplicationMonitoring": {
            "activity": [
                86
            ],
            "bucketSizeInSeconds": [
                2
            ],
            "creditUsage": [
                87
            ],
            "creditsUsed": [
                9
            ],
            "failedRunCount": [
                2
            ],
            "functions": [
                88
            ],
            "issues": [
                89
            ],
            "lifecycle": [
                90
            ],
            "lifecycleFailureCount": [
                2
            ],
            "lookbackInHours": [
                2
            ],
            "periodEnd": [
                233
            ],
            "periodStart": [
                233
            ],
            "rateLimitEventCount": [
                2
            ],
            "runCount": [
                2
            ],
            "versions": [
                91
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                233
            ],
            "errorCount": [
                2
            ],
            "rateLimitedJobCount": [
                2
            ],
            "rateLimitedRequestCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringCreditBucket": {
            "bucketStart": [
                233
            ],
            "creditsUsed": [
                9
            ],
            "operationLabel": [
                4
            ],
            "operationType": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringFunction": {
            "failedRunCount": [
                2
            ],
            "logicFunctionName": [
                4
            ],
            "p95DurationMs": [
                9
            ],
            "runCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringIssue": {
            "affectedInstallCount": [
                2
            ],
            "errorCode": [
                4
            ],
            "eventCount": [
                2
            ],
            "lastSeenAt": [
                233
            ],
            "level": [
                4
            ],
            "logicFunctionName": [
                4
            ],
            "source": [
                4
            ],
            "versions": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringLifecycleBucket": {
            "bucketStart": [
                233
            ],
            "failedCount": [
                2
            ],
            "installCount": [
                2
            ],
            "uninstallCount": [
                2
            ],
            "upgradeCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringVersion": {
            "activeInstallCount": [
                2
            ],
            "failedRunCount": [
                2
            ],
            "runCount": [
                2
            ],
            "version": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationPreferences": {
            "applicationId": [
                572
            ],
            "connectionProviders": [
                69
            ],
            "settingsMenuItems": [
                527
            ],
            "variables": [
                677
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                233
            ],
            "galleryImagesUrls": [
                4
            ],
            "id": [
                572
            ],
            "isConfigured": [
                1
            ],
            "isListed": [
                1
            ],
            "isPreInstalled": [
                1
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "oAuthClientId": [
                4
            ],
            "oAuthRedirectUris": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "ownerWorkspaceId": [
                572
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                94
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                2
            ],
            "autoUpdateEnabled": [
                2
            ],
            "creditsUsedBreakdown": [
                230
            ],
            "mostInstalledVersion": [
                4
            ],
            "suspendedInstalls": [
                2
            ],
            "totalCreditsUsed": [
                9
            ],
            "versionDistribution": [
                687
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                572
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "sourceType": [
                94
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                233
            ],
            "description": [
                4
            ],
            "id": [
                572
            ],
            "isDeprecated": [
                1
            ],
            "isFilled": [
                1
            ],
            "isRequired": [
                1
            ],
            "isSecret": [
                1
            ],
            "key": [
                4
            ],
            "options": [
                349
            ],
            "type": [
                4
            ],
            "updatedAt": [
                233
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationTokenPair": {
            "applicationAccessToken": [
                105
            ],
            "applicationRefreshToken": [
                105
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationVariable": {
            "description": [
                4
            ],
            "id": [
                572
            ],
            "isDeprecated": [
                1
            ],
            "isRequired": [
                1
            ],
            "isSecret": [
                1
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "options": [
                349
            ],
            "scope": [
                100
            ],
            "type": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationVariableScope": {},
        "ApprovedAccessDomain": {
            "createdAt": [
                233
            ],
            "domain": [
                4
            ],
            "id": [
                572
            ],
            "isValidated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ArchiveInboxThreadInput": {
            "threadId": [
                572
            ],
            "workspaceMemberIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "AuthBypassProviders": {
            "google": [
                1
            ],
            "microsoft": [
                1
            ],
            "password": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "AuthProviders": {
            "google": [
                1
            ],
            "magicLink": [
                1
            ],
            "microsoft": [
                1
            ],
            "password": [
                1
            ],
            "sso": [
                505
            ],
            "__typename": [
                4
            ]
        },
        "AuthToken": {
            "expiresAt": [
                233
            ],
            "token": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                105
            ],
            "refreshToken": [
                105
            ],
            "__typename": [
                4
            ]
        },
        "AuthTokens": {
            "tokens": [
                106
            ],
            "__typename": [
                4
            ]
        },
        "AuthorizeApp": {
            "redirectUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AutocompleteResult": {
            "placeId": [
                4
            ],
            "text": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspace": {
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "inviteHash": [
                4
            ],
            "loginToken": [
                4
            ],
            "logo": [
                4
            ],
            "personalInviteToken": [
                4
            ],
            "sso": [
                504
            ],
            "workspaceUrls": [
                740
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                110
            ],
            "availableWorkspacesForSignUp": [
                110
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                111
            ],
            "tokens": [
                106
            ],
            "__typename": [
                4
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                572
            ],
            "aggregateOperation": [
                33
            ],
            "axisNameDisplay": [
                113
            ],
            "color": [
                4
            ],
            "configurationType": [
                715
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "displayLegend": [
                1
            ],
            "filter": [
                349
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupMode": [
                117
            ],
            "isCumulative": [
                1
            ],
            "layout": [
                118
            ],
            "numberFormat": [
                162
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                426
            ],
            "primaryAxisGroupByFieldMetadataId": [
                572
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                327
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                426
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                572
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                327
            ],
            "splitMultiValueFields": [
                1
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BarChartData": {
            "data": [
                349
            ],
            "formattedToRawLookup": [
                349
            ],
            "groupMode": [
                117
            ],
            "hasTooManyGroups": [
                1
            ],
            "indexBy": [
                4
            ],
            "keys": [
                4
            ],
            "layout": [
                118
            ],
            "series": [
                119
            ],
            "showDataLabels": [
                1
            ],
            "showLegend": [
                1
            ],
            "xAxisLabel": [
                4
            ],
            "yAxisLabel": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BarChartDataInput": {
            "configuration": [
                349
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "BarChartSeries": {
            "key": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BigInt": {},
        "Billing": {
            "billingUrl": [
                4
            ],
            "isBillingEnabled": [
                1
            ],
            "stripePublishableKey": [
                4
            ],
            "trialPeriods": [
                142
            ],
            "__typename": [
                4
            ]
        },
        "BillingCustomer": {
            "hasPaymentMethod": [
                1
            ],
            "id": [
                572
            ],
            "userCreditsFallback": [
                678
            ],
            "__typename": [
                4
            ]
        },
        "BillingEndTrialPeriod": {
            "billingPortalUrl": [
                4
            ],
            "billingSubscriptions": [
                137
            ],
            "currentBillingSubscription": [
                137
            ],
            "hasPaymentMethod": [
                1
            ],
            "status": [
                542
            ],
            "__typename": [
                4
            ]
        },
        "BillingEntitlement": {
            "key": [
                125
            ],
            "value": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "BillingEntitlementKey": {},
        "BillingLicensedProduct": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                134
            ],
            "name": [
                4
            ],
            "prices": [
                131
            ],
            "__typename": [
                4
            ]
        },
        "BillingPartnerCode": {
            "isEditable": [
                1
            ],
            "partnerCode": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingPaymentIntent": {
            "clientSecret": [
                4
            ],
            "paymentIntentType": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingPlan": {
            "baseProducts": [
                126
            ],
            "downgradePlanKeys": [
                130
            ],
            "isCheckoutDefault": [
                1
            ],
            "isSellable": [
                1
            ],
            "planKey": [
                130
            ],
            "resourceCreditProducts": [
                126
            ],
            "upgradePlanKeys": [
                130
            ],
            "__typename": [
                4
            ]
        },
        "BillingPlanKey": {},
        "BillingPriceLicensed": {
            "creditAmount": [
                9
            ],
            "isSellable": [
                1
            ],
            "recurringInterval": [
                541
            ],
            "stripePriceId": [
                4
            ],
            "unitAmount": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "BillingProduct": {
            "description": [
                4
            ],
            "images": [
                4
            ],
            "metadata": [
                134
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingProductKey": {},
        "BillingProductMetadata": {
            "isLegacy": [
                4
            ],
            "planKey": [
                130
            ],
            "productKey": [
                133
            ],
            "__typename": [
                4
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                233
            ],
            "periodStart": [
                233
            ],
            "productKey": [
                133
            ],
            "unitPriceCents": [
                9
            ],
            "userCreditsUsed": [
                9
            ],
            "workspaceCreditsExtraGranted": [
                9
            ],
            "workspaceCreditsGranted": [
                9
            ],
            "workspaceCreditsGrantedForSeats": [
                9
            ],
            "workspaceCreditsSeats": [
                2
            ],
            "workspaceCreditsTotalGranted": [
                9
            ],
            "workspaceCreditsUsed": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "BillingSession": {
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscription": {
            "billingSubscriptionItems": [
                139
            ],
            "cancelAt": [
                233
            ],
            "collectionMethod": [
                138
            ],
            "currentPeriodEnd": [
                233
            ],
            "hasUserCredits": [
                1
            ],
            "id": [
                572
            ],
            "interval": [
                541
            ],
            "metadata": [
                349
            ],
            "phases": [
                140
            ],
            "status": [
                542
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                132
            ],
            "creditAmount": [
                9
            ],
            "hasReachedCurrentPeriodCap": [
                1
            ],
            "id": [
                572
            ],
            "quantity": [
                9
            ],
            "stripePriceId": [
                4
            ],
            "unitAmount": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "end_date": [
                9
            ],
            "items": [
                141
            ],
            "start_date": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscriptionSchedulePhaseItem": {
            "price": [
                4
            ],
            "quantity": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                9
            ],
            "isCreditCardRequired": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "BillingUpdate": {
            "billingSubscriptions": [
                137
            ],
            "currentBillingSubscription": [
                137
            ],
            "__typename": [
                4
            ]
        },
        "BooleanFieldComparison": {
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "CalendarChannel": {
            "connectedAccount": [
                180
            ],
            "connectedAccountId": [
                572
            ],
            "contactAutoCreationPolicy": [
                146
            ],
            "createdAt": [
                233
            ],
            "excludePrivateEvents": [
                1
            ],
            "handle": [
                4
            ],
            "id": [
                572
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "syncStage": [
                147
            ],
            "syncStageStartedAt": [
                233
            ],
            "syncStatus": [
                148
            ],
            "syncedAt": [
                233
            ],
            "throttleFailureCount": [
                9
            ],
            "updatedAt": [
                233
            ],
            "visibility": [
                149
            ],
            "__typename": [
                4
            ]
        },
        "CalendarChannelContactAutoCreationPolicy": {},
        "CalendarChannelSyncStage": {},
        "CalendarChannelSyncStatus": {},
        "CalendarChannelVisibility": {},
        "CalendarConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "CalendarEventRecurrenceFrequency": {},
        "CalendarEventRecurrenceInput": {
            "daysOfWeek": [
                153
            ],
            "endDate": [
                4
            ],
            "endOccurrenceCount": [
                2
            ],
            "frequency": [
                151
            ],
            "interval": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "CalendarEventRecurrenceWeekday": {},
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "duplicateEmails": [
                2
            ],
            "globallyUnsubscribed": [
                2
            ],
            "hardSuppressed": [
                2
            ],
            "sendable": [
                2
            ],
            "topicUnsubscribed": [
                2
            ],
            "totalMembers": [
                2
            ],
            "trackingRefused": [
                2
            ],
            "withoutEmail": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "CancelMessageCampaignInput": {
            "campaignId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CancelMessageCampaignOutputDTO": {
            "campaignId": [
                4
            ],
            "canceledMessageCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "Captcha": {
            "provider": [
                160
            ],
            "siteKey": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CaptchaDriverType": {},
        "ChannelSyncSuccess": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ChartNumberFormat": {},
        "ChatConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                349
            ],
            "error": [
                165
            ],
            "maxSeq": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamError": {
            "code": [
                4
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ChatThreadsConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "CheckUserExist": {
            "availableWorkspacesCount": [
                9
            ],
            "exists": [
                1
            ],
            "isEmailVerified": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ClaimableApplicationRegistration": {
            "author": [
                4
            ],
            "description": [
                4
            ],
            "id": [
                4
            ],
            "isOwned": [
                1
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ClientAiEvaluationModelConfig": {
            "description": [
                4
            ],
            "inputCostPerMillionTokens": [
                9
            ],
            "isAvailable": [
                1
            ],
            "isDeprecated": [
                1
            ],
            "label": [
                4
            ],
            "maxCriteriaPerQuestion": [
                9
            ],
            "maxScoreLevels": [
                9
            ],
            "medianLatencyMs": [
                9
            ],
            "modelId": [
                4
            ],
            "outputCostPerMillionTokens": [
                9
            ],
            "providerLabel": [
                4
            ],
            "supportedQuestionTypes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ClientAiModelConfig": {
            "contextWindowTokens": [
                9
            ],
            "costPerTask": [
                9
            ],
            "dataResidency": [
                4
            ],
            "effort": [
                4
            ],
            "efforts": [
                4
            ],
            "inputCostPerMillionTokens": [
                9
            ],
            "intelligenceIndex": [
                9
            ],
            "isBenchmarkInherited": [
                1
            ],
            "isDeprecated": [
                1
            ],
            "label": [
                4
            ],
            "maxOutputTokens": [
                9
            ],
            "modelFamily": [
                406
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                408
            ],
            "outputCostPerMillionTokens": [
                9
            ],
            "outputTokensPerSecond": [
                9
            ],
            "providerLabel": [
                4
            ],
            "providerName": [
                4
            ],
            "sdkPackage": [
                4
            ],
            "zeroDataRetention": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ClientAiModelTierConfig": {
            "isZeroDataRetentionRequired": [
                1
            ],
            "modelId": [
                4
            ],
            "requiredDataResidencyRegion": [
                4
            ],
            "tier": [
                41
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                169
            ],
            "aiModelTiers": [
                171
            ],
            "aiModels": [
                170
            ],
            "allowRequestsToTwentyIcons": [
                1
            ],
            "analyticsEnabled": [
                1
            ],
            "api": [
                48
            ],
            "appVersion": [
                4
            ],
            "authProviders": [
                104
            ],
            "billing": [
                121
            ],
            "calendarBookingPageId": [
                4
            ],
            "canManageFeatureFlags": [
                1
            ],
            "captcha": [
                159
            ],
            "defaultSubdomain": [
                4
            ],
            "enterpriseInstanceType": [
                4
            ],
            "frontDomain": [
                4
            ],
            "isAttachmentPreviewEnabled": [
                1
            ],
            "isBookCallOnboardingStepEnabled": [
                1
            ],
            "isClickHouseConfigured": [
                1
            ],
            "isCloudflareIntegrationEnabled": [
                1
            ],
            "isCompanyEnrichmentEnabled": [
                1
            ],
            "isConfigVariablesInDbEnabled": [
                1
            ],
            "isCookieSessionEnabled": [
                1
            ],
            "isEmailVerificationRequired": [
                1
            ],
            "isEmailingDomainInDemoMode": [
                1
            ],
            "isGoogleCalendarEnabled": [
                1
            ],
            "isGoogleMessagingEnabled": [
                1
            ],
            "isImapSmtpCaldavEnabled": [
                1
            ],
            "isMicrosoftCalendarEnabled": [
                1
            ],
            "isMicrosoftMessagingEnabled": [
                1
            ],
            "isMultiWorkspaceEnabled": [
                1
            ],
            "isOnboardingAiChatEnabled": [
                1
            ],
            "isWorkspaceSchemaDDLLocked": [
                1
            ],
            "maintenance": [
                173
            ],
            "publicFeatureFlags": [
                458
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                525
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                543
            ],
            "webPushVapidPublicKey": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                233
            ],
            "link": [
                4
            ],
            "startAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "CollectionHash": {
            "collectionName": [
                45
            ],
            "hash": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItem": {
            "applicationId": [
                572
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                572
            ],
            "availabilityType": [
                176
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                572
            ],
            "createdAt": [
                233
            ],
            "engineComponentKey": [
                267
            ],
            "frontComponent": [
                309
            ],
            "frontComponentId": [
                572
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "navigationTargetObjectMetadataId": [
                572
            ],
            "pageLayoutId": [
                572
            ],
            "payload": [
                177
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "workflowVersionId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                418
            ],
            "on_PathCommandMenuItemPayload": [
                443
            ],
            "__typename": [
                4
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                78
            ],
            "files": [
                300
            ],
            "__typename": [
                4
            ]
        },
        "ConnectApplicationWithApiKeyInput": {
            "apiKey": [
                4
            ],
            "applicationId": [
                572
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                572
            ],
            "archivedAt": [
                233
            ],
            "authFailedAt": [
                233
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                460
            ],
            "connectionProviderId": [
                572
            ],
            "createdAt": [
                233
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                572
            ],
            "lastCredentialsRefreshedAt": [
                233
            ],
            "lastSignedInAt": [
                233
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                181
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                233
            ],
            "userWorkspaceId": [
                572
            ],
            "visibility": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountScope": {},
        "ConnectedImapSmtpCaldavAccount": {
            "connectionParameters": [
                334
            ],
            "handle": [
                4
            ],
            "id": [
                572
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                260
            ],
            "host": [
                4
            ],
            "password": [
                4
            ],
            "port": [
                9
            ],
            "username": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ConnectionProviderScope": {},
        "CreateAgentChatChannelInput": {
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "name": [
                4
            ],
            "roleIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateAgentInput": {
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "isPrivate": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                349
            ],
            "modelId": [
                4
            ],
            "name": [
                4
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                349
            ],
            "roleId": [
                572
            ],
            "triggers": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "CreateApiKeyInput": {
            "expiresAt": [
                4
            ],
            "name": [
                4
            ],
            "revokedAt": [
                4
            ],
            "roleId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                572
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                572
            ],
            "participantHandleFieldUniversalIdentifier": [
                572
            ],
            "visibility": [
                388
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                79
            ],
            "targets": [
                81
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                93
            ],
            "clientSecret": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationRegistrationInput": {
            "name": [
                4
            ],
            "oAuthRedirectUris": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateApprovedAccessDomainInput": {
            "domain": [
                4
            ],
            "email": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateCalendarEventInput": {
            "addConferencing": [
                1
            ],
            "attendees": [
                4
            ],
            "connectedAccountId": [
                4
            ],
            "description": [
                4
            ],
            "endsAt": [
                4
            ],
            "isFullDay": [
                1
            ],
            "location": [
                4
            ],
            "recurrence": [
                152
            ],
            "sendInvitations": [
                1
            ],
            "startsAt": [
                4
            ],
            "timeZone": [
                4
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateCalendarEventOutput": {
            "calendarEventId": [
                4
            ],
            "conferenceLink": [
                4
            ],
            "error": [
                4
            ],
            "iCalUid": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "CreateCommandMenuItemInput": {
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                572
            ],
            "availabilityType": [
                176
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                572
            ],
            "engineComponentKey": [
                267
            ],
            "frontComponentId": [
                572
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "navigationTargetObjectMetadataId": [
                572
            ],
            "pageLayoutId": [
                572
            ],
            "payload": [
                349
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateEmailGroupChannelInput": {
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateEmailGroupChannelOutput": {
            "forwardingAddress": [
                4
            ],
            "messageChannel": [
                382
            ],
            "__typename": [
                4
            ]
        },
        "CreateEmailingDomainInput": {
            "domain": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateFieldInput": {
            "defaultValue": [
                349
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isNullable": [
                1
            ],
            "isRemoteCreation": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "isUnique": [
                1
            ],
            "label": [
                4
            ],
            "morphRelationsCreationPayload": [
                349
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "options": [
                349
            ],
            "relationCreationPayload": [
                349
            ],
            "settings": [
                349
            ],
            "type": [
                295
            ],
            "__typename": [
                4
            ]
        },
        "CreateFrontComponentInput": {
            "builtComponentChecksum": [
                4
            ],
            "builtComponentPath": [
                4
            ],
            "componentName": [
                4
            ],
            "description": [
                4
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "sourceComponentPath": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateIndexFieldInput": {
            "fieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateIndexInput": {
            "fields": [
                202
            ],
            "indexType": [
                342
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                349
            ],
            "databaseEventTriggerSettings": [
                349
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                349
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                349
            ],
            "source": [
                349
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                349
            ],
            "universalIdentifier": [
                572
            ],
            "workflowActionTriggerSettings": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                572
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "signInScope": [
                185
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateMessageSuppressionInput": {
            "emailAddress": [
                4
            ],
            "unsubscribeTopicId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                572
            ],
            "agentId": [
                572
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "folderId": [
                572
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "link": [
                4
            ],
            "name": [
                4
            ],
            "nativePageKey": [
                4
            ],
            "pageLayoutId": [
                572
            ],
            "parentId": [
                572
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                572
            ],
            "targetRecordId": [
                572
            ],
            "type": [
                410
            ],
            "userWorkspaceId": [
                572
            ],
            "viewId": [
                572
            ],
            "workflowId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateObjectInput": {
            "color": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isRemote": [
                1
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "primaryKeyColumnType": [
                4
            ],
            "primaryKeyFieldMetadataSettings": [
                349
            ],
            "shortcut": [
                4
            ],
            "skipNameField": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneFieldMetadataInput": {
            "field": [
                200
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                203
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                208
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutInput": {
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "type": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                435
            ],
            "pageLayoutId": [
                572
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutWidgetInput": {
            "conditionalAvailability": [
                349
            ],
            "configuration": [
                349
            ],
            "objectMetadataId": [
                572
            ],
            "pageLayoutTabId": [
                572
            ],
            "position": [
                349
            ],
            "title": [
                4
            ],
            "type": [
                716
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                572
            ],
            "filter": [
                349
            ],
            "objectMetadataId": [
                572
            ],
            "orderBy": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                572
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                572
            ],
            "secondFieldMetadataId": [
                572
            ],
            "thirdFieldMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateRoleInput": {
            "canAccessAllAgentChatChannels": [
                1
            ],
            "canAccessAllTools": [
                1
            ],
            "canBeAssignedToAgents": [
                1
            ],
            "canBeAssignedToApiKeys": [
                1
            ],
            "canBeAssignedToUsers": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateSkillInput": {
            "content": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreateUnsubscribeTopicInput": {
            "description": [
                4
            ],
            "name": [
                4
            ],
            "visibility": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                120
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                665
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                672
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                674
            ],
            "__typename": [
                4
            ]
        },
        "CreateValidationRuleInput": {
            "description": [
                4
            ],
            "errorFieldMetadataId": [
                572
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "message": [
                4
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                572
            ],
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                9
            ],
            "viewId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldInput": {
            "aggregateOperation": [
                33
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "isCanonical": [
                1
            ],
            "isVisible": [
                1
            ],
            "label": [
                4
            ],
            "position": [
                9
            ],
            "relationScope": [
                698
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                572
            ],
            "viewId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                572
            ],
            "logicalOperator": [
                703
            ],
            "parentViewFilterGroupId": [
                572
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "operand": [
                704
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "value": [
                349
            ],
            "viewFilterGroupId": [
                572
            ],
            "viewId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewGroupInput": {
            "fieldValue": [
                4
            ],
            "id": [
                572
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewInput": {
            "anyFieldFilterValue": [
                4
            ],
            "calendarEndFieldMetadataId": [
                572
            ],
            "calendarFieldMetadataId": [
                572
            ],
            "calendarLayout": [
                689
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isCompact": [
                1
            ],
            "isPrivate": [
                1
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                572
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                706
            ],
            "mainGroupByFieldMetadataId": [
                572
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "openRecordIn": [
                707
            ],
            "position": [
                9
            ],
            "presetFilter": [
                708
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                711
            ],
            "visibility": [
                712
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                710
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "CreateWebhookInput": {
            "description": [
                4
            ],
            "id": [
                572
            ],
            "operations": [
                4
            ],
            "roleId": [
                572
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "CreditUsedItem": {
            "creditsUsed": [
                9
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "operation": [
                665
            ],
            "resource": [
                672
            ],
            "__typename": [
                4
            ]
        },
        "CursorPaging": {
            "after": [
                183
            ],
            "before": [
                183
            ],
            "first": [
                2
            ],
            "last": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "DatabaseEventAction": {},
        "DateTime": {},
        "DeleteApprovedAccessDomainInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldGroupInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DeletedWorkspaceMember": {
            "avatarUrl": [
                4
            ],
            "id": [
                572
            ],
            "name": [
                312
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "DevelopmentApplication": {
            "id": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "DomainRecord": {
            "key": [
                4
            ],
            "status": [
                4
            ],
            "type": [
                4
            ],
            "validationType": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "DomainValidRecords": {
            "domain": [
                4
            ],
            "id": [
                572
            ],
            "isCustomDomainEnabled": [
                1
            ],
            "records": [
                253
            ],
            "__typename": [
                4
            ]
        },
        "DuplicatedDashboard": {
            "createdAt": [
                4
            ],
            "id": [
                572
            ],
            "pageLayoutId": [
                572
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "DuplicatedMessageList": {
            "createdAt": [
                4
            ],
            "description": [
                4
            ],
            "id": [
                572
            ],
            "memberCount": [
                9
            ],
            "name": [
                4
            ],
            "position": [
                9
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EditSso": {
            "id": [
                572
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                506
            ],
            "type": [
                329
            ],
            "__typename": [
                4
            ]
        },
        "EditSsoInput": {
            "id": [
                572
            ],
            "status": [
                506
            ],
            "__typename": [
                4
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                184
            ],
            "IMAP": [
                184
            ],
            "SMTP": [
                184
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EmailConnectionSecurity": {},
        "EmailPasswordResetLink": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                233
            ],
            "domain": [
                4
            ],
            "id": [
                572
            ],
            "status": [
                264
            ],
            "tenantStatus": [
                265
            ],
            "unsubscribeHostnameStatus": [
                574
            ],
            "updatedAt": [
                233
            ],
            "verificationRecords": [
                684
            ],
            "verifiedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "EngineComponentKey": {},
        "EnqueueJobInput": {
            "delayMs": [
                2
            ],
            "jobId": [
                4
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payload": [
                349
            ],
            "retryLimit": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobItemInput": {
            "jobId": [
                4
            ],
            "payload": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobResult": {
            "enqueued": [
                1
            ],
            "jobId": [
                4
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobsInput": {
            "delayMs": [
                2
            ],
            "jobs": [
                269
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                349
            ],
            "retryLimit": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobsResult": {
            "availableBytes": [
                9
            ],
            "enqueued": [
                1
            ],
            "enqueuedJobsCount": [
                2
            ],
            "jobIds": [
                4
            ],
            "jobs": [
                273
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EnqueuedJob": {
            "jobId": [
                4
            ],
            "sizeBytes": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EnterpriseLicenseInfoDTO": {
            "expiresAt": [
                233
            ],
            "isValid": [
                1
            ],
            "licensee": [
                4
            ],
            "subscriptionId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EnterpriseSubscriptionStatusDTO": {
            "cancelAt": [
                233
            ],
            "currentPeriodEnd": [
                233
            ],
            "expiresAt": [
                233
            ],
            "isCancellationScheduled": [
                1
            ],
            "licensee": [
                4
            ],
            "status": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogDateRangeInput": {
            "end": [
                233
            ],
            "start": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "EventLogFieldFilterInput": {
            "field": [
                4
            ],
            "operand": [
                278
            ],
            "values": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogFilterOperand": {},
        "EventLogFiltersInput": {
            "dateRange": [
                276
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                277
            ],
            "objectMetadataId": [
                4
            ],
            "recordId": [
                4
            ],
            "userWorkspaceId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogPageInfo": {
            "endCursor": [
                4
            ],
            "hasNextPage": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryInput": {
            "after": [
                4
            ],
            "filters": [
                279
            ],
            "first": [
                2
            ],
            "table": [
                284
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                280
            ],
            "records": [
                283
            ],
            "totalCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EventLogRecord": {
            "event": [
                4
            ],
            "isCustom": [
                1
            ],
            "objectMetadataId": [
                4
            ],
            "properties": [
                349
            ],
            "recordId": [
                4
            ],
            "timestamp": [
                233
            ],
            "userId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "EventLogTable": {},
        "EventSubscription": {
            "eventStreamId": [
                4
            ],
            "metadataEvents": [
                397
            ],
            "objectRecordEventsWithQueryIds": [
                425
            ],
            "queueJobEvents": [
                352
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                572
            ],
            "payload": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                288
            ],
            "value": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlagKey": {},
        "Field": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "defaultValue": [
                349
            ],
            "description": [
                4
            ],
            "disabledFieldPermissionActions": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isNullable": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "isUnique": [
                1
            ],
            "label": [
                4
            ],
            "morphId": [
                572
            ],
            "morphRelations": [
                479
            ],
            "name": [
                4
            ],
            "object": [
                412
            ],
            "objectMetadataId": [
                572
            ],
            "options": [
                349
            ],
            "relation": [
                479
            ],
            "settings": [
                349
            ],
            "type": [
                295
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                715
            ],
            "fieldDisplayMode": [
                292
            ],
            "fieldMetadataId": [
                4
            ],
            "isUIEditable": [
                1
            ],
            "nestedRelationFieldMetadataId": [
                4
            ],
            "viewId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FieldConnection": {
            "edges": [
                293
            ],
            "pageInfo": [
                432
            ],
            "__typename": [
                4
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                183
            ],
            "node": [
                289
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                294
            ],
            "id": [
                573
            ],
            "isActive": [
                144
            ],
            "isSystem": [
                144
            ],
            "isUIEditable": [
                144
            ],
            "isUIReadOnly": [
                144
            ],
            "objectMetadataId": [
                573
            ],
            "or": [
                294
            ],
            "__typename": [
                4
            ]
        },
        "FieldMetadataType": {},
        "FieldPermission": {
            "canReadFieldValue": [
                1
            ],
            "canUpdateFieldValue": [
                1
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "objectMetadataId": [
                572
            ],
            "roleId": [
                572
            ],
            "rowLevelPermissionPredicateGroupId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "FieldPermissionInput": {
            "canReadFieldValue": [
                1
            ],
            "canUpdateFieldValue": [
                1
            ],
            "fieldMetadataId": [
                572
            ],
            "objectMetadataId": [
                572
            ],
            "rowLevelPermissionPredicateGroupId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                715
            ],
            "newFieldDefaultVisibility": [
                1
            ],
            "shouldAllowUserToSeeHiddenFields": [
                1
            ],
            "viewId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "File": {
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "path": [
                4
            ],
            "size": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "FileAttachmentInput": {
            "filename": [
                4
            ],
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "FileFolder": {},
        "FileUploadTarget": {
            "contentType": [
                4
            ],
            "expiresAt": [
                233
            ],
            "fileId": [
                572
            ],
            "uploadUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FileWithSignedUrl": {
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "path": [
                4
            ],
            "size": [
                9
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                572
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                506
            ],
            "type": [
                329
            ],
            "workspace": [
                737
            ],
            "__typename": [
                4
            ]
        },
        "FindMessageSuppressionsInput": {
            "limit": [
                2
            ],
            "offset": [
                2
            ],
            "reason": [
                395
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                715
            ],
            "fieldMetadataId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponent": {
            "applicationGrantedCapabilities": [
                4
            ],
            "applicationGrantedIframeMediaPermissions": [
                331
            ],
            "applicationId": [
                572
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                98
            ],
            "applicationVariables": [
                349
            ],
            "builtComponentChecksum": [
                4
            ],
            "builtComponentPath": [
                4
            ],
            "componentName": [
                4
            ],
            "createdAt": [
                233
            ],
            "description": [
                4
            ],
            "frontComponentSharedDependenciesChecksum": [
                4
            ],
            "id": [
                572
            ],
            "isHeadless": [
                1
            ],
            "name": [
                4
            ],
            "sourceComponentPath": [
                4
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                311
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                715
            ],
            "frontComponentId": [
                572
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                572
            ],
            "pageLayoutType": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "FullName": {
            "firstName": [
                4
            ],
            "lastName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GenerateInput": {
            "input": [
                500
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                349
            ],
            "runId": [
                572
            ],
            "scope": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "GenerateResult": {
            "error": [
                4
            ],
            "object": [
                349
            ],
            "runId": [
                572
            ],
            "success": [
                1
            ],
            "text": [
                4
            ],
            "usage": [
                42
            ],
            "__typename": [
                4
            ]
        },
        "GetApiKeyInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "GetAuthorizationUrlForSSO": {
            "authorizationURL": [
                4
            ],
            "id": [
                572
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GetAuthorizationUrlForSSOInput": {
            "identityProviderId": [
                572
            ],
            "workspaceInviteHash": [
                4
            ],
            "workspacePersonalInviteToken": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedProgress": {
            "completedStepActionKeys": [
                319
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                319
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                320
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                319
            ],
            "description": [
                4
            ],
            "doneChatThreadId": [
                4
            ],
            "doneDescription": [
                4
            ],
            "doneTitle": [
                4
            ],
            "doneWorkflowId": [
                4
            ],
            "icon": [
                4
            ],
            "iconColor": [
                4
            ],
            "kind": [
                321
            ],
            "prompt": [
                4
            ],
            "promptLabel": [
                4
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepKind": {},
        "GettingStartedWorkflow": {
            "versionId": [
                4
            ],
            "workflowId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedWorkflowPreview": {
            "actions": [
                324
            ],
            "stepActionKey": [
                319
            ],
            "trigger": [
                325
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedWorkflowPreviewAction": {
            "title": [
                4
            ],
            "type": [
                717
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedWorkflowPreviewTrigger": {
            "databaseEventAction": [
                4
            ],
            "title": [
                4
            ],
            "type": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GrantApplicationCapabilitiesInput": {
            "applicationId": [
                572
            ],
            "capabilities": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "GraphOrderBy": {},
        "GridPosition": {
            "column": [
                9
            ],
            "columnSpan": [
                9
            ],
            "row": [
                9
            ],
            "rowSpan": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "IdentityProviderType": {},
        "IframeConfiguration": {
            "configurationType": [
                715
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "IframeMediaPermission": {
            "camera": [
                1
            ],
            "microphone": [
                1
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "IframeMediaPermissionInput": {
            "camera": [
                1
            ],
            "microphone": [
                1
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "connectedAccountId": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "ImapSmtpCaldavPublicConnectionParameters": {
            "CALDAV": [
                335
            ],
            "IMAP": [
                335
            ],
            "SMTP": [
                335
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ImapSmtpCaldavPublicConnectionParams": {
            "connectionSecurity": [
                260
            ],
            "host": [
                4
            ],
            "port": [
                9
            ],
            "username": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Impersonate": {
            "loginToken": [
                105
            ],
            "workspace": [
                741
            ],
            "__typename": [
                4
            ]
        },
        "InboxThreadRecordInput": {
            "objectNameSingular": [
                4
            ],
            "recordId": [
                572
            ],
            "threadId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "indexFieldMetadataList": [
                340
            ],
            "indexType": [
                342
            ],
            "indexWhereClause": [
                4
            ],
            "isCustom": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "isUnique": [
                1
            ],
            "name": [
                4
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "IndexEdge": {
            "cursor": [
                183
            ],
            "node": [
                338
            ],
            "__typename": [
                4
            ]
        },
        "IndexField": {
            "createdAt": [
                233
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "order": [
                9
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "IndexFilter": {
            "and": [
                341
            ],
            "id": [
                573
            ],
            "isCustom": [
                144
            ],
            "or": [
                341
            ],
            "__typename": [
                4
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                572
            ],
            "messages": [
                57
            ],
            "__typename": [
                4
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                345
            ],
            "__typename": [
                4
            ]
        },
        "IngestedAppMessage": {
            "externalId": [
                4
            ],
            "hasAttachments": [
                1
            ],
            "messageId": [
                572
            ],
            "messageThreadId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "InitiateTwoFactorAuthenticationProvisioning": {
            "uri": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "InvalidatePassword": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "InviteSuggestion": {
            "displayName": [
                4
            ],
            "email": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "JSON": {},
        "JSONObject": {},
        "JobState": {},
        "JobStatus": {
            "attemptsMade": [
                2
            ],
            "enqueuedAt": [
                9
            ],
            "failedReason": [
                4
            ],
            "finishedAt": [
                9
            ],
            "jobId": [
                4
            ],
            "progress": [
                2
            ],
            "startedAt": [
                9
            ],
            "state": [
                351
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                572
            ],
            "aggregateOperation": [
                33
            ],
            "axisNameDisplay": [
                113
            ],
            "color": [
                4
            ],
            "configurationType": [
                715
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "displayLegend": [
                1
            ],
            "filter": [
                349
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "isCumulative": [
                1
            ],
            "isStacked": [
                1
            ],
            "numberFormat": [
                162
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                426
            ],
            "primaryAxisGroupByFieldMetadataId": [
                572
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                327
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                426
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                572
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                327
            ],
            "splitMultiValueFields": [
                1
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "LineChartData": {
            "formattedToRawLookup": [
                349
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                357
            ],
            "showDataLabels": [
                1
            ],
            "showLegend": [
                1
            ],
            "xAxisLabel": [
                4
            ],
            "yAxisLabel": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "LineChartDataInput": {
            "configuration": [
                349
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "LineChartDataPoint": {
            "x": [
                4
            ],
            "y": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "LineChartSeries": {
            "data": [
                356
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ListAppConnectionsInput": {
            "providerName": [
                4
            ],
            "scope": [
                181
            ],
            "userWorkspaceId": [
                4
            ],
            "visibility": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageChannelsInput": {
            "connectedAccountId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "Location": {
            "lat": [
                9
            ],
            "lng": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunction": {
            "applicationId": [
                572
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                233
            ],
            "cronTriggerSettings": [
                349
            ],
            "databaseEventTriggerSettings": [
                349
            ],
            "description": [
                4
            ],
            "executionMode": [
                363
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                349
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "runtime": [
                4
            ],
            "sourceHandlerPath": [
                4
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                349
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "workflowActionTriggerSettings": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                349
            ],
            "duration": [
                9
            ],
            "error": [
                349
            ],
            "logs": [
                4
            ],
            "status": [
                365
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionIdInput": {
            "id": [
                20
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogs": {
            "logs": [
                4
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                572
            ],
            "applicationUniversalIdentifier": [
                572
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "LoginToken": {
            "loginToken": [
                105
            ],
            "__typename": [
                4
            ]
        },
        "MarkAppChannelThreadAsReadInput": {
            "messageChannelId": [
                572
            ],
            "messageThreadId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceApp": {
            "author": [
                4
            ],
            "category": [
                4
            ],
            "connectUrl": [
                4
            ],
            "description": [
                4
            ],
            "hasMcpServers": [
                1
            ],
            "id": [
                4
            ],
            "isListed": [
                1
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppDetail": {
            "aboutDescription": [
                4
            ],
            "author": [
                4
            ],
            "billingPrices": [
                61
            ],
            "billsCredits": [
                1
            ],
            "category": [
                4
            ],
            "connectUrl": [
                4
            ],
            "content": [
                71
            ],
            "defaultRoleUniversalIdentifier": [
                4
            ],
            "description": [
                4
            ],
            "emailSupport": [
                4
            ],
            "galleryImages": [
                4
            ],
            "id": [
                4
            ],
            "installCount": [
                2
            ],
            "isListed": [
                1
            ],
            "issueReportUrl": [
                4
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "manifest": [
                349
            ],
            "name": [
                4
            ],
            "objects": [
                373
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                331
            ],
            "roles": [
                374
            ],
            "screenshots": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                94
            ],
            "termsUrl": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "websiteUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppObject": {
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppRole": {
            "canAccessAllTools": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "fieldPermissions": [
                375
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                376
            ],
            "permissionFlagUniversalIdentifiers": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppRoleFieldPermission": {
            "canReadFieldValue": [
                1
            ],
            "canUpdateFieldValue": [
                1
            ],
            "fieldUniversalIdentifier": [
                4
            ],
            "objectUniversalIdentifier": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MarketplaceAppRoleObjectPermission": {
            "canDestroyObjectRecords": [
                1
            ],
            "canReadObjectRecords": [
                1
            ],
            "canSoftDeleteObjectRecords": [
                1
            ],
            "canUpdateObjectRecords": [
                1
            ],
            "objectUniversalIdentifier": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "McpServer": {
            "applicationId": [
                572
            ],
            "connectionProviderId": [
                572
            ],
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "signInScope": [
                185
            ],
            "tools": [
                378
            ],
            "toolsSyncError": [
                4
            ],
            "toolsSyncedAt": [
                233
            ],
            "updatedAt": [
                233
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "McpServerTool": {
            "annotations": [
                349
            ],
            "description": [
                4
            ],
            "inputSchema": [
                349
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignSendBlockerDTO": {
            "code": [
                4
            ],
            "message": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MessageChannel": {
            "connectedAccount": [
                180
            ],
            "connectedAccountId": [
                572
            ],
            "contactAutoCreationPolicy": [
                383
            ],
            "createdAt": [
                233
            ],
            "displayName": [
                4
            ],
            "excludeGroupEmails": [
                1
            ],
            "excludeNonProfessionalEmails": [
                1
            ],
            "handle": [
                4
            ],
            "id": [
                572
            ],
            "importProgress": [
                2
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "messageFolderImportPolicy": [
                390
            ],
            "messagingProviderUniversalIdentifier": [
                572
            ],
            "participantHandleFieldUniversalIdentifier": [
                572
            ],
            "pendingGroupEmailsAction": [
                384
            ],
            "syncStage": [
                385
            ],
            "syncStageStartedAt": [
                233
            ],
            "syncStatus": [
                386
            ],
            "syncedAt": [
                233
            ],
            "throttleFailureCount": [
                9
            ],
            "throttleRetryAfter": [
                233
            ],
            "type": [
                387
            ],
            "updatedAt": [
                233
            ],
            "visibility": [
                388
            ],
            "__typename": [
                4
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
                233
            ],
            "externalId": [
                4
            ],
            "id": [
                572
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                572
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                391
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "MessageFolderImportPolicy": {},
        "MessageFolderPendingSyncAction": {},
        "MessageParticipantRole": {},
        "MessageSuppression": {
            "createdAt": [
                233
            ],
            "emailAddress": [
                4
            ],
            "id": [
                572
            ],
            "reason": [
                395
            ],
            "source": [
                396
            ],
            "unsubscribeTopicId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                393
            ],
            "totalCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionReason": {},
        "MessageSuppressionSource": {},
        "MetadataEvent": {
            "metadataName": [
                4
            ],
            "properties": [
                424
            ],
            "recordId": [
                4
            ],
            "type": [
                398
            ],
            "updatedCollectionHash": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MetadataEventAction": {},
        "MetadataTranslation": {
            "canonicalValue": [
                4
            ],
            "locale": [
                4
            ],
            "metadataName": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "property": [
                4
            ],
            "provenance": [
                401
            ],
            "recordId": [
                572
            ],
            "sourceValue": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MetadataTranslationOverrideInput": {
            "locale": [
                4
            ],
            "property": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MetadataTranslationProvenance": {},
        "MetadataTranslationsInput": {
            "fieldMetadataId": [
                572
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                174
            ],
            "objectMetadataItems": [
                404
            ],
            "views": [
                405
            ],
            "__typename": [
                4
            ]
        },
        "MinimalObjectMetadata": {
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isRemote": [
                1
            ],
            "isSystem": [
                1
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "MinimalView": {
            "id": [
                572
            ],
            "key": [
                706
            ],
            "objectMetadataId": [
                572
            ],
            "type": [
                711
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                534,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                721,
                {
                    "data": [
                        3,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                26,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                572,
                {
                    "input": [
                        5,
                        "AddAgentChatThreadParticipantsInput!"
                    ]
                }
            ],
            "addQueryToEventStream": [
                1,
                {
                    "input": [
                        6,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "approveApplicationIframeMediaPermissions": [
                59,
                {
                    "applicationId": [
                        572,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        332,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "archiveInboxThread": [
                1,
                {
                    "input": [
                        102,
                        "ArchiveInboxThreadInput!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                1,
                {
                    "assigneeWorkspaceMemberId": [
                        572
                    ],
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        572,
                        "UUID!"
                    ],
                    "roleId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        572,
                        "UUID!"
                    ],
                    "roleId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                1,
                {
                    "input": [
                        337,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                108,
                {
                    "clientId": [
                        4,
                        "String!"
                    ],
                    "codeChallenge": [
                        4
                    ],
                    "issuer": [
                        4
                    ],
                    "redirectUrl": [
                        4,
                        "String!"
                    ],
                    "resource": [
                        4
                    ],
                    "scope": [
                        4
                    ],
                    "state": [
                        4
                    ]
                }
            ],
            "cancelMessageCampaign": [
                158,
                {
                    "input": [
                        157,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                143
            ],
            "cancelSwitchBillingPlan": [
                143
            ],
            "cancelSwitchResourceCreditPrice": [
                143
            ],
            "checkCustomDomainValidRecords": [
                254
            ],
            "checkPublicDomainValidRecords": [
                254,
                {
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                136,
                {
                    "plan": [
                        130,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        541,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        1,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        4
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                93,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                93,
                {
                    "fileId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                178,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "fileIds": [
                        572,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                430,
                {
                    "hasBookedCall": [
                        1,
                        "Boolean!"
                    ],
                    "isAutoSkipped": [
                        1,
                        "Boolean!"
                    ]
                }
            ],
            "completeFileUpload": [
                304,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                304,
                {
                    "fileId": [
                        4,
                        "String!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceLogoUpload": [
                304,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                304,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "connectApplicationWithApiKey": [
                572,
                {
                    "input": [
                        179,
                        "ConnectApplicationWithApiKeyInput!"
                    ]
                }
            ],
            "createAgentChatChannel": [
                8,
                {
                    "input": [
                        186,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                49,
                {
                    "input": [
                        188,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                382,
                {
                    "input": [
                        189,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                190,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "files": [
                        80,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                191,
                {
                    "input": [
                        192,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                101,
                {
                    "input": [
                        193,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                128
            ],
            "createCalendarEvent": [
                195,
                {
                    "input": [
                        194,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                19,
                {
                    "channelId": [
                        572
                    ]
                }
            ],
            "createCommandMenuItem": [
                175,
                {
                    "input": [
                        196,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                252,
                {
                    "name": [
                        4,
                        "String!"
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                198,
                {
                    "input": [
                        197,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                263,
                {
                    "input": [
                        199,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                303,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        302,
                        "FileFolder!"
                    ],
                    "filename": [
                        4,
                        "String!"
                    ],
                    "size": [
                        9,
                        "Float!"
                    ]
                }
            ],
            "createFrontComponent": [
                309,
                {
                    "input": [
                        201,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                409,
                {
                    "inputs": [
                        207,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                692,
                {
                    "inputs": [
                        222,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                691,
                {
                    "inputs": [
                        223,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                705,
                {
                    "inputs": [
                        226,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                377,
                {
                    "input": [
                        205,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                393,
                {
                    "input": [
                        206,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                409,
                {
                    "input": [
                        207,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                303,
                {
                    "filename": [
                        4,
                        "String!"
                    ],
                    "size": [
                        9,
                        "Float!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                531,
                {
                    "input": [
                        529,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                46,
                {
                    "event": [
                        4,
                        "String!"
                    ],
                    "objectMetadataId": [
                        572,
                        "UUID!"
                    ],
                    "properties": [
                        349
                    ],
                    "recordId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                7,
                {
                    "input": [
                        187,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                289,
                {
                    "input": [
                        209,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                338,
                {
                    "input": [
                        210,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                362,
                {
                    "input": [
                        204,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                412,
                {
                    "input": [
                        211,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                486,
                {
                    "createRoleInput": [
                        217,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                433,
                {
                    "input": [
                        212,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                434,
                {
                    "input": [
                        213,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                437,
                {
                    "input": [
                        214,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                457,
                {
                    "applicationId": [
                        4,
                        "String!"
                    ],
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "createRelatedRecordPath": [
                478,
                {
                    "input": [
                        216,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                531,
                {
                    "input": [
                        530,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                534,
                {
                    "input": [
                        218,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                128,
                {
                    "idempotencyKey": [
                        4,
                        "String!"
                    ],
                    "plan": [
                        130,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        541,
                        "SubscriptionInterval!"
                    ],
                    "requirePaymentMethod": [
                        1,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        4
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                575,
                {
                    "input": [
                        219,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                663,
                {
                    "input": [
                        220,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                683,
                {
                    "input": [
                        221,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                688,
                {
                    "input": [
                        227,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                691,
                {
                    "input": [
                        223,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                692,
                {
                    "input": [
                        222,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                701,
                {
                    "input": [
                        225,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                702,
                {
                    "input": [
                        224,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                705,
                {
                    "input": [
                        226,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                709,
                {
                    "input": [
                        228,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                713,
                {
                    "input": [
                        229,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                534,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        572,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        572
                    ]
                }
            ],
            "deleteAppKeyValue": [
                1,
                {
                    "key": [
                        4,
                        "String!"
                    ],
                    "scope": [
                        54
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                382,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                1,
                {
                    "input": [
                        234,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                175,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                180,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                721
            ],
            "deleteEmailGroupChannel": [
                382,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                309,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                409,
                {
                    "ids": [
                        572,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                377,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                409,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                7,
                {
                    "input": [
                        23,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                289,
                {
                    "input": [
                        235,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                338,
                {
                    "input": [
                        236,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                362,
                {
                    "input": [
                        366,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                412,
                {
                    "input": [
                        237,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                4,
                {
                    "roleId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deletePublicDomain": [
                1,
                {
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                1,
                {
                    "messageId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                478,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                238,
                {
                    "input": [
                        239,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                534,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                240,
                {
                    "twoFactorAuthenticationMethodId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteUnsubscribeTopic": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteUsageLimit": [
                1,
                {
                    "usageLimitId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                676
            ],
            "deleteUserFromWorkspace": [
                680,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                683,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteView": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteViewField": [
                691,
                {
                    "input": [
                        242,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                692,
                {
                    "input": [
                        241,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                701,
                {
                    "input": [
                        243,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteViewGroup": [
                705,
                {
                    "input": [
                        244,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                1,
                {
                    "input": [
                        245,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                713,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "deleteWorkspaceInvitation": [
                4,
                {
                    "appTokenId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayout": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyViewField": [
                691,
                {
                    "input": [
                        248,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                692,
                {
                    "input": [
                        247,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                701,
                {
                    "input": [
                        249,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                1,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "destroyViewGroup": [
                705,
                {
                    "input": [
                        250,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                1,
                {
                    "input": [
                        251,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                1,
                {
                    "input": [
                        337,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                180,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                255,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                256,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                257,
                {
                    "input": [
                        258,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                261,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "workspaceId": [
                        572
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                123
            ],
            "enqueueJob": [
                270,
                {
                    "input": [
                        268,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                272,
                {
                    "input": [
                        271,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                725
            ],
            "executeOneLogicFunction": [
                364,
                {
                    "input": [
                        286,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                314,
                {
                    "input": [
                        313,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                51,
                {
                    "apiKeyId": [
                        572,
                        "UUID!"
                    ],
                    "expiresAt": [
                        4,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                98,
                {
                    "applicationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                105
            ],
            "generateTransientToken": [
                553
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                567,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                569,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                107,
                {
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromOTP": [
                107,
                {
                    "captchaToken": [
                        4
                    ],
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ],
                    "otp": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromSSOExchangeToken": [
                107,
                {
                    "ssoExchangeToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                570,
                {
                    "captchaToken": [
                        4
                    ],
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ],
                    "recoveryCode": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                316,
                {
                    "input": [
                        317,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                369,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "origin": [
                        4,
                        "String!"
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "goBackToPreviousOnboardingStep": [
                429
            ],
            "grantApplicationCapabilities": [
                66,
                {
                    "input": [
                        326,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                336,
                {
                    "userId": [
                        572,
                        "UUID!"
                    ],
                    "workspaceId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                344,
                {
                    "input": [
                        343,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                346,
                {
                    "loginToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "initiateOTPProvisioningForAuthenticatedUser": [
                346
            ],
            "installApplication": [
                59,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ],
                    "version": [
                        4
                    ]
                }
            ],
            "installMarketplaceApp": [
                1,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ],
                    "version": [
                        4
                    ]
                }
            ],
            "markAgentChatThreadAsDoneInChannel": [
                1,
                {
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        370,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        572
                    ],
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                572,
                {
                    "workspaceMemberId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                322,
                {
                    "stepActionKey": [
                        319,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                274
            ],
            "removeAgentChatMessageReaction": [
                26,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        481,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                473,
                {
                    "principal": [
                        470,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        477,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                98,
                {
                    "applicationRefreshToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                107,
                {
                    "appToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "reopenAgentChatThreadInChannel": [
                1,
                {
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        482,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                483,
                {
                    "affiliatePartnerName": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resendWorkspaceInvitation": [
                521,
                {
                    "appTokenId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetAiChatAssistantProfile": [
                35
            ],
            "resetCommandMenuItem": [
                175,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                434,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                433,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                548,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                513,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                2
            ],
            "revokeApiKey": [
                49,
                {
                    "input": [
                        484,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                488,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                502,
                {
                    "input": [
                        498,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                333,
                {
                    "connectionParameters": [
                        259,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        4,
                        "String!"
                    ],
                    "id": [
                        572
                    ]
                }
            ],
            "sendAppChannelMessage": [
                512,
                {
                    "input": [
                        511,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                513,
                {
                    "browsingContext": [
                        349
                    ],
                    "channelId": [
                        572
                    ],
                    "fileAttachments": [
                        301,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        1
                    ],
                    "isAssistantParticipant": [
                        1
                    ],
                    "mentionedWorkspaceMemberIds": [
                        572,
                        "[UUID!]"
                    ],
                    "messageId": [
                        572,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        572,
                        "[UUID!]"
                    ],
                    "shouldAssistantReply": [
                        1
                    ],
                    "text": [
                        4,
                        "String!"
                    ],
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                516,
                {
                    "input": [
                        515,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                520,
                {
                    "input": [
                        519,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                521,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        572
                    ]
                }
            ],
            "sendMessageCampaign": [
                523,
                {
                    "input": [
                        522,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                518,
                {
                    "input": [
                        524,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                53,
                {
                    "input": [
                        526,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                127,
                {
                    "partnerCode": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                274,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                473,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        477,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                473,
                {
                    "accessLevel": [
                        469,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        470,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        477,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                143,
                {
                    "priceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                112,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "signOut": [
                1,
                {
                    "refreshToken": [
                        4
                    ]
                }
            ],
            "signUp": [
                112,
                {
                    "affiliatePartnerName": [
                        4
                    ],
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "signUpInNewWorkspace": [
                532,
                {
                    "input": [
                        533
                    ]
                }
            ],
            "signUpInWorkspace": [
                532,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "locale": [
                        4
                    ],
                    "password": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ],
                    "workspaceId": [
                        572
                    ],
                    "workspaceInviteHash": [
                        4
                    ],
                    "workspacePersonalInviteToken": [
                        4
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                430,
                {
                    "isAutoSkipped": [
                        1,
                        "Boolean!"
                    ]
                }
            ],
            "snoozeAgentChatThreadInChannel": [
                1,
                {
                    "snoozedUntil": [
                        233,
                        "DateTime!"
                    ],
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                161,
                {
                    "connectedAccountId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                536,
                {
                    "companyContext": [
                        349
                    ],
                    "personContext": [
                        349
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        537,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                538
            ],
            "switchBillingPlan": [
                143,
                {
                    "plan": [
                        130
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                143
            ],
            "syncAppMessageFolders": [
                389,
                {
                    "input": [
                        545,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                736,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        349,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                377,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                46,
                {
                    "event": [
                        4
                    ],
                    "name": [
                        4
                    ],
                    "properties": [
                        349
                    ],
                    "type": [
                        47,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                93,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ],
                    "targetWorkspaceSubdomain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "triggerAddPeopleToMessageListJob": [
                555,
                {
                    "input": [
                        554,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                559,
                {
                    "input": [
                        556,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                558,
                {
                    "input": [
                        557,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                563,
                {
                    "input": [
                        560,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                562,
                {
                    "input": [
                        561,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                565,
                {
                    "input": [
                        564,
                        "TriggerUpgradeApplicationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                1,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateAgentChatChannel": [
                8,
                {
                    "channelId": [
                        572,
                        "UUID!"
                    ],
                    "input": [
                        577,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                21,
                {
                    "action": [
                        17,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        233
                    ],
                    "threadIds": [
                        572,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                49,
                {
                    "input": [
                        579,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                382,
                {
                    "input": [
                        580,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                59,
                {
                    "id": [
                        572,
                        "UUID!"
                    ],
                    "input": [
                        581,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                93,
                {
                    "input": [
                        582,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                97,
                {
                    "input": [
                        584,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                145,
                {
                    "input": [
                        586,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                175,
                {
                    "input": [
                        588,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                382,
                {
                    "input": [
                        589,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                309,
                {
                    "input": [
                        591,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                318,
                {
                    "input": [
                        593,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateInboxNotificationSettings": [
                680,
                {
                    "input": [
                        594,
                        "UpdateInboxNotificationSettingsInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                287,
                {
                    "input": [
                        595,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                409,
                {
                    "inputs": [
                        608,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                412,
                {
                    "inputs": [
                        609,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                705,
                {
                    "inputs": [
                        633,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                377,
                {
                    "input": [
                        598,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                382,
                {
                    "input": [
                        600,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                389,
                {
                    "input": [
                        602,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                389,
                {
                    "input": [
                        604,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateMyUserApplicationVariable": [
                1,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "key": [
                        4,
                        "String!"
                    ],
                    "value": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                409,
                {
                    "input": [
                        608,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                7,
                {
                    "input": [
                        578,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        572
                    ],
                    "key": [
                        4,
                        "String!"
                    ],
                    "value": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateOneField": [
                289,
                {
                    "input": [
                        607,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        596,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                412,
                {
                    "input": [
                        609,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                486,
                {
                    "updateRoleInput": [
                        617,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                433,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        610,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                434,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        611,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        613,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                433,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        615,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                347,
                {
                    "newPassword": [
                        4,
                        "String!"
                    ],
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "updateRelatedRecordPath": [
                478,
                {
                    "input": [
                        616,
                        "UpdateRelatedRecordPathInput!"
                    ]
                }
            ],
            "updateSkill": [
                534,
                {
                    "input": [
                        619,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTabPresence": [
                1,
                {
                    "input": [
                        620,
                        "UpdateTabPresenceInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                548,
                {
                    "input": [
                        621,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                575,
                {
                    "input": [
                        622,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                663,
                {
                    "input": [
                        623,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                122,
                {
                    "userCreditsFallback": [
                        678,
                        "UserCreditsFallback!"
                    ]
                }
            ],
            "updateUserEmail": [
                1,
                {
                    "newEmail": [
                        4,
                        "String!"
                    ],
                    "verifyEmailRedirectPath": [
                        4
                    ]
                }
            ],
            "updateValidationRule": [
                683,
                {
                    "input": [
                        624,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                688,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        635,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                691,
                {
                    "input": [
                        628,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                692,
                {
                    "input": [
                        626,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                701,
                {
                    "input": [
                        631,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                702,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        630,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                705,
                {
                    "input": [
                        633,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                709,
                {
                    "input": [
                        636,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                713,
                {
                    "input": [
                        638,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                721,
                {
                    "data": [
                        642,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                721,
                {
                    "data": [
                        640,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                721,
                {
                    "data": [
                        641,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                731,
                {
                    "roleId": [
                        572,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        643,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                93,
                {
                    "file": [
                        644,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                300,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        644,
                        "Upload!"
                    ],
                    "fileFolder": [
                        302,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                304,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        644,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                304,
                {
                    "file": [
                        644,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                304,
                {
                    "file": [
                        644,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                304,
                {
                    "file": [
                        644,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                296,
                {
                    "upsertFieldPermissionsInput": [
                        645,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                688,
                {
                    "input": [
                        648,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                420,
                {
                    "upsertObjectPermissionsInput": [
                        649,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                487,
                {
                    "upsertPermissionFlagsInput": [
                        650,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                652,
                {
                    "input": [
                        651,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                688,
                {
                    "input": [
                        653,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "upsertWebPushSubscription": [
                1,
                {
                    "input": [
                        659,
                        "UpsertWebPushSubscriptionInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                101,
                {
                    "input": [
                        681,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                685,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "emailVerificationToken": [
                        4,
                        "String!"
                    ],
                    "origin": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyEmailAndGetWorkspaceAgnosticToken": [
                112,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "emailVerificationToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                263,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                686,
                {
                    "otp": [
                        4,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                4
            ]
        },
        "NativeModelCapabilities": {
            "twitterSearch": [
                1
            ],
            "webSearch": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItem": {
            "agentChatChannelId": [
                572
            ],
            "agentId": [
                572
            ],
            "applicationId": [
                572
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "createdAt": [
                233
            ],
            "folderId": [
                572
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "link": [
                4
            ],
            "name": [
                4
            ],
            "nativePageKey": [
                4
            ],
            "pageLayoutId": [
                572
            ],
            "parentId": [
                572
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                572
            ],
            "targetRecordId": [
                572
            ],
            "targetRecordIdentifier": [
                466
            ],
            "type": [
                410
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "userWorkspaceId": [
                572
            ],
            "viewId": [
                572
            ],
            "workflowId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                572
            ],
            "color": [
                4
            ],
            "createdAt": [
                233
            ],
            "description": [
                4
            ],
            "disabledObjectPermissionActions": [
                4
            ],
            "duplicateCriteria": [
                4
            ],
            "fields": [
                415,
                {
                    "filter": [
                        294,
                        "FieldFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                289
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "imageIdentifierFieldMetadataId": [
                572
            ],
            "indexMetadataList": [
                338
            ],
            "indexMetadatas": [
                417,
                {
                    "filter": [
                        341,
                        "IndexFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isRemote": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isUICreatable": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "labelIdentifierFieldMetadataId": [
                572
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "openRecordIn": [
                419
            ],
            "searchFieldMetadataList": [
                508
            ],
            "shortcut": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "ObjectConnection": {
            "edges": [
                414
            ],
            "pageInfo": [
                432
            ],
            "__typename": [
                4
            ]
        },
        "ObjectEdge": {
            "cursor": [
                183
            ],
            "node": [
                412
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                293
            ],
            "pageInfo": [
                432
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                416
            ],
            "id": [
                573
            ],
            "isActive": [
                144
            ],
            "isRemote": [
                144
            ],
            "isSearchable": [
                144
            ],
            "isSystem": [
                144
            ],
            "isUICreatable": [
                144
            ],
            "isUIEditable": [
                144
            ],
            "isUIReadOnly": [
                144
            ],
            "or": [
                416
            ],
            "universalIdentifier": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                339
            ],
            "pageInfo": [
                432
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ObjectOpenRecordIn": {},
        "ObjectPermission": {
            "canDestroyObjectRecords": [
                1
            ],
            "canReadObjectRecords": [
                1
            ],
            "canSoftDeleteObjectRecords": [
                1
            ],
            "canUpdateObjectRecords": [
                1
            ],
            "objectMetadataId": [
                572
            ],
            "restrictedFields": [
                349
            ],
            "rowLevelPermissionPredicateGroups": [
                490
            ],
            "rowLevelPermissionPredicates": [
                489
            ],
            "uneditableFields": [
                572
            ],
            "unreadableFields": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ObjectPermissionInput": {
            "canDestroyObjectRecords": [
                1
            ],
            "canReadObjectRecords": [
                1
            ],
            "canSoftDeleteObjectRecords": [
                1
            ],
            "canUpdateObjectRecords": [
                1
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordCount": {
            "objectNamePlural": [
                4
            ],
            "totalCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordEvent": {
            "action": [
                232
            ],
            "objectNameSingular": [
                4
            ],
            "properties": [
                424
            ],
            "recordId": [
                4
            ],
            "userId": [
                4
            ],
            "workspaceMemberId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordEventProperties": {
            "after": [
                349
            ],
            "before": [
                349
            ],
            "diff": [
                349
            ],
            "updatedFields": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordEventWithQueryIds": {
            "objectRecordEvent": [
                423
            ],
            "queryIds": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "ObjectRecordsPermissions": {
            "canCreateAllRecords": [
                1
            ],
            "canDestroyAllRecords": [
                1
            ],
            "canReadAllRecords": [
                1
            ],
            "canReadSomeRecords": [
                1
            ],
            "canSoftDeleteAllRecords": [
                1
            ],
            "canUpdateAllRecords": [
                1
            ],
            "objectMetadataId": [
                572
            ],
            "restrictedFields": [
                349
            ],
            "rowLevelRecordsPermissions": [
                497
            ],
            "uneditableFields": [
                572
            ],
            "unreadableFields": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                428
            ],
            "previousOnboardingStatus": [
                428
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "OpenRecordIn": {},
        "PageInfo": {
            "endCursor": [
                183
            ],
            "hasNextPage": [
                1
            ],
            "hasPreviousPage": [
                1
            ],
            "startCursor": [
                183
            ],
            "__typename": [
                4
            ]
        },
        "PageLayout": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                572
            ],
            "deletedAt": [
                233
            ],
            "id": [
                572
            ],
            "isFirstTabPinned": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "tabs": [
                434
            ],
            "type": [
                436
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "deletedAt": [
                233
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "layoutMode": [
                435
            ],
            "pageLayoutId": [
                572
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "widgets": [
                437
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                331
            ],
            "applicationId": [
                572
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailability": [
                349
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                349
            ],
            "configuration": [
                714
            ],
            "createdAt": [
                233
            ],
            "deletedAt": [
                233
            ],
            "gridPosition": [
                328
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "objectMetadataId": [
                572
            ],
            "pageLayoutTabId": [
                572
            ],
            "position": [
                440
            ],
            "title": [
                4
            ],
            "type": [
                716
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                435
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "column": [
                2
            ],
            "columnSpan": [
                2
            ],
            "layoutMode": [
                435
            ],
            "row": [
                2
            ],
            "rowSpan": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetCanvasPosition": [
                438
            ],
            "on_PageLayoutWidgetGridPosition": [
                439
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                442
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                441
            ],
            "index": [
                2
            ],
            "layoutMode": [
                435
            ],
            "__typename": [
                4
            ]
        },
        "PathCommandMenuItemPayload": {
            "path": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PermissionFlag": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "permissionType": [
                4
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                572
            ],
            "aggregateOperation": [
                33
            ],
            "color": [
                4
            ],
            "configurationType": [
                715
            ],
            "dateGranularity": [
                426
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "displayLegend": [
                1
            ],
            "filter": [
                349
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                572
            ],
            "groupBySubFieldName": [
                4
            ],
            "hideEmptyCategory": [
                1
            ],
            "manualSortOrder": [
                4
            ],
            "numberFormat": [
                162
            ],
            "orderBy": [
                327
            ],
            "showCenterMetric": [
                1
            ],
            "splitMultiValueFields": [
                1
            ],
            "timezone": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PieChartData": {
            "data": [
                449
            ],
            "formattedToRawLookup": [
                349
            ],
            "hasTooManyGroups": [
                1
            ],
            "showCenterMetric": [
                1
            ],
            "showDataLabels": [
                1
            ],
            "showLegend": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "PieChartDataInput": {
            "configuration": [
                349
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "PieChartDataItem": {
            "key": [
                4
            ],
            "value": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "PlaceDetailsResult": {
            "city": [
                4
            ],
            "country": [
                4
            ],
            "location": [
                361
            ],
            "postcode": [
                4
            ],
            "state": [
                4
            ],
            "street": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignAudienceInput": {
            "listId": [
                4
            ],
            "unsubscribeTopicId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignSendInput": {
            "campaignId": [
                4
            ],
            "scheduledAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                156
            ],
            "blockers": [
                381
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                572
            ],
            "isClaimingVerifiedClientName": [
                1
            ],
            "isVerified": [
                1
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "websiteUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PublicCalendarChannel": {
            "connectedAccount": [
                180
            ],
            "connectedAccountId": [
                572
            ],
            "handle": [
                4
            ],
            "id": [
                572
            ],
            "visibility": [
                149
            ],
            "__typename": [
                4
            ]
        },
        "PublicConnectionParametersOutput": {
            "connectionSecurity": [
                260
            ],
            "host": [
                4
            ],
            "port": [
                9
            ],
            "username": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PublicDomain": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "domain": [
                4
            ],
            "id": [
                572
            ],
            "isValidated": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "PublicFeatureFlag": {
            "key": [
                288
            ],
            "metadata": [
                459
            ],
            "__typename": [
                4
            ]
        },
        "PublicFeatureFlagMetadata": {
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "imagePath": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "PublicImapSmtpCaldavConnectionParameters": {
            "CALDAV": [
                456
            ],
            "IMAP": [
                456
            ],
            "SMTP": [
                456
            ],
            "__typename": [
                4
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                103
            ],
            "authProviders": [
                104
            ],
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                740
            ],
            "__typename": [
                4
            ]
        },
        "PublicWorkspaceDataSummary": {
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "logo": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Query": {
            "accessGroupPropagationProgress": [
                0
            ],
            "agentChatChannelRoles": [
                11
            ],
            "agentChatChannelSummaries": [
                12
            ],
            "agentChatChannelThreadIds": [
                14,
                {
                    "after": [
                        4
                    ],
                    "assignment": [
                        10
                    ],
                    "channelId": [
                        572,
                        "UUID!"
                    ],
                    "filter": [
                        13
                    ],
                    "first": [
                        2
                    ],
                    "status": [
                        15
                    ]
                }
            ],
            "agentChatChannels": [
                8
            ],
            "agentChatOpenThreadsSummary": [
                18
            ],
            "agentRunInsights": [
                29,
                {
                    "agentId": [
                        572,
                        "UUID!"
                    ],
                    "timeZone": [
                        4,
                        "String!"
                    ]
                }
            ],
            "agentRunSummaries": [
                30
            ],
            "agentRuns": [
                28,
                {
                    "agentId": [
                        572,
                        "UUID!"
                    ],
                    "limit": [
                        2,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                37
            ],
            "aiChatUserCreditsUsage": [
                38
            ],
            "apiKey": [
                49,
                {
                    "input": [
                        315,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                49
            ],
            "appConnection": [
                52,
                {
                    "id": [
                        20,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                52,
                {
                    "filter": [
                        358
                    ]
                }
            ],
            "appKeyValue": [
                53,
                {
                    "key": [
                        4,
                        "String!"
                    ],
                    "scope": [
                        54
                    ]
                }
            ],
            "appMessageChannels": [
                382,
                {
                    "filter": [
                        359
                    ]
                }
            ],
            "appMessageFolders": [
                389,
                {
                    "filter": [
                        360
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                67,
                {
                    "applicationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                69,
                {
                    "applicationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "applicationCoreGraphqlSchema": [
                4,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "applicationRegistrationTarballUrl": [
                4,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "applicationSdkClientChecksums": [
                507,
                {
                    "applicationId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                115,
                {
                    "input": [
                        116,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                127
            ],
            "billingPlans": [
                129
            ],
            "billingPortalSession": [
                136,
                {
                    "forPaymentMethodUpdate": [
                        1
                    ],
                    "returnUrlPath": [
                        4
                    ]
                }
            ],
            "calendarChannels": [
                455
            ],
            "callRecordingIdForCalendarEvent": [
                572,
                {
                    "calendarEventId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                24,
                {
                    "agentUniversalIdentifier": [
                        572
                    ],
                    "threadId": [
                        572
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                164,
                {
                    "agentUniversalIdentifier": [
                        572
                    ],
                    "threadId": [
                        572
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "chatThread": [
                19,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                167,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceInviteHashIsValid": [
                730,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                539,
                {
                    "subdomain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                175,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                175
            ],
            "currentUser": [
                676
            ],
            "currentUserApplicationAuthorizations": [
                60
            ],
            "currentUserSessions": [
                679
            ],
            "currentWorkspace": [
                721
            ],
            "enterpriseCheckoutSession": [
                4,
                {
                    "billingInterval": [
                        4
                    ]
                }
            ],
            "enterprisePortalSession": [
                4,
                {
                    "returnUrlPath": [
                        4
                    ]
                }
            ],
            "enterpriseSubscriptionStatus": [
                275
            ],
            "eventLogs": [
                282,
                {
                    "input": [
                        281,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                73,
                {
                    "shouldIncludeDependencies": [
                        1
                    ],
                    "shouldIncludeLogicFunctionSources": [
                        1
                    ],
                    "shouldIncludePublicAssets": [
                        1
                    ],
                    "shouldIncludeSourceDependencies": [
                        1
                    ],
                    "shouldIncludeSourceFiles": [
                        1
                    ],
                    "universalIdentifier": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                289,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                291,
                {
                    "filter": [
                        294,
                        "FieldFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                454,
                {
                    "clientId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                93,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                85,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        233
                    ],
                    "periodStart": [
                        233
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                95,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        233
                    ],
                    "periodStart": [
                        233
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                97,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                168,
                {
                    "sourcePackage": [
                        4
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "findInstallApplicationJobStatus": [
                352,
                {
                    "jobId": [
                        4
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findManyAgents": [
                7
            ],
            "findManyApplicationRegistrations": [
                93
            ],
            "findManyApplications": [
                59
            ],
            "findManyLogicFunctions": [
                362
            ],
            "findManyMarketplaceApps": [
                371,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                457
            ],
            "findMarketplaceAppDetail": [
                372,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findOneAgent": [
                7,
                {
                    "input": [
                        23,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                59,
                {
                    "id": [
                        572
                    ],
                    "universalIdentifier": [
                        572
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                93,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                362,
                {
                    "input": [
                        366,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                352,
                {
                    "jobId": [
                        4
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findUpgradeApplicationJobStatus": [
                352,
                {
                    "jobId": [
                        4
                    ],
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                723
            ],
            "findWorkspaceFromInviteHash": [
                728,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                729
            ],
            "frontComponent": [
                309,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                309
            ],
            "getAddressDetails": [
                450,
                {
                    "placeId": [
                        4,
                        "String!"
                    ],
                    "token": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                43
            ],
            "getApiKeyRoles": [
                486
            ],
            "getApprovedAccessDomains": [
                101
            ],
            "getAutoCompleteAddress": [
                109,
                {
                    "address": [
                        4,
                        "String!"
                    ],
                    "country": [
                        4
                    ],
                    "isFieldCity": [
                        1
                    ],
                    "token": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAvailablePackages": [
                349,
                {
                    "input": [
                        366,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                182,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                263
            ],
            "getInviteSuggestions": [
                348
            ],
            "getJobs": [
                352,
                {
                    "jobIds": [
                        4,
                        "[String!]!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                4,
                {
                    "input": [
                        366,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                433,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                434,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                434,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                437,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                433,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        436
                    ]
                }
            ],
            "getPermissionFlags": [
                444
            ],
            "getPublicWorkspaceDataByDomain": [
                461,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                462,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                135
            ],
            "getRole": [
                486,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                486
            ],
            "getSSOIdentityProviders": [
                306
            ],
            "getToolIndex": [
                552
            ],
            "getToolInputSchema": [
                349,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                660,
                {
                    "input": [
                        661
                    ]
                }
            ],
            "getView": [
                688,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                691,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                692,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                692,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                691,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                701,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                702,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                702,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                701,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                705,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                705,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                709,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                709,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                688,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        711,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                726
            ],
            "gettingStartedProgress": [
                318
            ],
            "gettingStartedWorkflowPreviews": [
                323
            ],
            "githubClaimAuthorizationUrl": [
                4,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "isApplicationStopped": [
                1,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "lineChartData": [
                354,
                {
                    "input": [
                        355,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                129
            ],
            "mcpServer": [
                377,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                377
            ],
            "messageSuppressions": [
                394,
                {
                    "input": [
                        307,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                399,
                {
                    "input": [
                        402,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                403
            ],
            "mostlyEmptyFieldMetadataIds": [
                572,
                {
                    "objectMetadataId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                92
            ],
            "myCalendarChannels": [
                145,
                {
                    "connectedAccountId": [
                        572
                    ]
                }
            ],
            "myConnectedAccounts": [
                180
            ],
            "myMessageChannels": [
                382,
                {
                    "connectedAccountId": [
                        572
                    ]
                }
            ],
            "myMessageFolders": [
                389,
                {
                    "messageChannelId": [
                        572
                    ]
                }
            ],
            "myUserApplicationVariables": [
                732
            ],
            "navigationMenuItem": [
                409,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                409
            ],
            "object": [
                412,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                422
            ],
            "objects": [
                413,
                {
                    "filter": [
                        416,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "onlineWorkspaceMemberIds": [
                572
            ],
            "pieChartData": [
                447,
                {
                    "input": [
                        448,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                156,
                {
                    "input": [
                        451,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                453,
                {
                    "input": [
                        452,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                372,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                371
            ],
            "recordPermissions": [
                468,
                {
                    "targets": [
                        477,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                473,
                {
                    "target": [
                        477,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                478
            ],
            "skill": [
                534,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                534
            ],
            "timelineActivityTypes": [
                548
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                566
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                571,
                {
                    "userId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                575
            ],
            "usageLimits": [
                663
            ],
            "usageQuotaDefinitions": [
                667
            ],
            "usageQuotaScopeConsumption": [
                669,
                {
                    "input": [
                        670,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                671
            ],
            "validatePasswordResetToken": [
                682,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                683,
                {
                    "objectMetadataId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                683,
                {
                    "fieldMetadataId": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                713,
                {
                    "id": [
                        572,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                713
            ],
            "workspaceApplicationAuthorizations": [
                60,
                {
                    "applicationId": [
                        572
                    ]
                }
            ],
            "workspaceApplicationConnectedMemberCounts": [
                68
            ],
            "__typename": [
                4
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                572
            ],
            "optionValue": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordExport": {
            "downloadPath": [
                4
            ],
            "errorMessage": [
                4
            ],
            "filename": [
                4
            ],
            "id": [
                572
            ],
            "progress": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "RecordIdentifier": {
            "id": [
                572
            ],
            "imageIdentifier": [
                4
            ],
            "labelIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordPermissionsDTO": {
            "canDelete": [
                1
            ],
            "canRead": [
                1
            ],
            "canSoftDelete": [
                1
            ],
            "canUpdate": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "RecordPermissionsResult": {
            "objectMetadataId": [
                572
            ],
            "permissions": [
                467
            ],
            "recordId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                572
            ],
            "workspaceMemberId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharePrincipalType": {},
        "RecordShareRowCause": {},
        "RecordSharingDTO": {
            "canManageSharing": [
                1
            ],
            "hasManagedGeneralAccess": [
                1
            ],
            "isPrivate": [
                1
            ],
            "isShareable": [
                1
            ],
            "permissions": [
                467
            ],
            "roles": [
                475
            ],
            "shares": [
                474
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                469
            ],
            "id": [
                20
            ],
            "principalId": [
                572
            ],
            "principalRoleId": [
                572
            ],
            "principalType": [
                471
            ],
            "rowCause": [
                472
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingRoleDTO": {
            "canRead": [
                1
            ],
            "canUpdate": [
                1
            ],
            "id": [
                572
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                715
            ],
            "isUIEditable": [
                1
            ],
            "recordLimit": [
                2
            ],
            "viewId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RecordTargetInput": {
            "objectMetadataId": [
                572
            ],
            "recordId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                572
            ],
            "secondFieldMetadataId": [
                572
            ],
            "thirdFieldMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                289
            ],
            "sourceObjectMetadata": [
                412
            ],
            "targetFieldMetadata": [
                289
            ],
            "targetObjectMetadata": [
                412
            ],
            "type": [
                480
            ],
            "__typename": [
                4
            ]
        },
        "RelationType": {},
        "RemoveQueryFromEventStreamInput": {
            "eventStreamId": [
                4
            ],
            "queryId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ReportAppConnectionAuthFailureInput": {
            "id": [
                20
            ],
            "reason": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ResendEmailVerificationToken": {
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "RevokeApiKeyInput": {
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RichTextBody": {
            "blocknote": [
                4
            ],
            "markdown": [
                4
            ],
            "tiptap": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Role": {
            "agents": [
                7
            ],
            "apiKeys": [
                50
            ],
            "applicationId": [
                572
            ],
            "canAccessAllAgentChatChannels": [
                1
            ],
            "canAccessAllTools": [
                1
            ],
            "canBeAssignedToAgents": [
                1
            ],
            "canBeAssignedToApiKeys": [
                1
            ],
            "canBeAssignedToUsers": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "fieldPermissions": [
                296
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                420
            ],
            "permissionFlags": [
                487
            ],
            "rowLevelPermissionFieldPermissions": [
                296
            ],
            "rowLevelPermissionPredicateGroups": [
                490
            ],
            "rowLevelPermissionPredicates": [
                489
            ],
            "rowLevelPermissionRules": [
                493
            ],
            "universalIdentifier": [
                572
            ],
            "workspaceMembers": [
                731
            ],
            "__typename": [
                4
            ]
        },
        "RolePermissionFlag": {
            "flag": [
                4
            ],
            "id": [
                572
            ],
            "roleId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RotateClientSecret": {
            "clientSecret": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicate": {
            "fieldMetadataId": [
                4
            ],
            "id": [
                4
            ],
            "objectMetadataId": [
                4
            ],
            "operand": [
                492
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
            ],
            "relationFieldMetadataId": [
                4
            ],
            "roleId": [
                4
            ],
            "rowLevelPermissionPredicateGroupId": [
                4
            ],
            "rowLevelPermissionRuleId": [
                4
            ],
            "subFieldName": [
                4
            ],
            "value": [
                349
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFilterFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFilterValues": [
                4
            ],
            "workspaceMemberSubFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicateGroup": {
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "id": [
                4
            ],
            "logicalOperator": [
                491
            ],
            "objectMetadataId": [
                4
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                4
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                9
            ],
            "roleId": [
                4
            ],
            "rowLevelPermissionRuleId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicateOperand": {},
        "RowLevelPermissionRule": {
            "canCreateRecords": [
                1
            ],
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "id": [
                572
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRuleInput": {
            "canCreateRecords": [
                1
            ],
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "id": [
                572
            ],
            "predicateGroups": [
                495
            ],
            "predicates": [
                496
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                572
            ],
            "logicalOperator": [
                491
            ],
            "position": [
                9
            ],
            "predicateGroups": [
                495
            ],
            "predicates": [
                496
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "operand": [
                492
            ],
            "position": [
                9
            ],
            "relationFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "value": [
                349
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
                572
            ],
            "workspaceMemberRelationFilterFieldMetadataId": [
                572
            ],
            "workspaceMemberRelationFilterValues": [
                4
            ],
            "workspaceMemberSubFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelRecordsPermissions": {
            "canCreateRecords": [
                1
            ],
            "canDestroyRecords": [
                1
            ],
            "canReadRecords": [
                1
            ],
            "canSoftDeleteRecords": [
                1
            ],
            "canUpdateRecords": [
                1
            ],
            "predicateGroups": [
                490
            ],
            "predicates": [
                489
            ],
            "ruleId": [
                572
            ],
            "uneditableFields": [
                572
            ],
            "unreadableFields": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentInput": {
            "additionalInstructions": [
                4
            ],
            "agentUniversalIdentifier": [
                4
            ],
            "input": [
                500
            ],
            "messages": [
                500
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                349
            ],
            "runAsWorkspaceMemberId": [
                572
            ],
            "thread": [
                503
            ],
            "waitForCompletion": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                572
            ],
            "filename": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentMessageInput": {
            "attachments": [
                499
            ],
            "content": [
                4
            ],
            "role": [
                501
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentMessageRole": {},
        "RunAgentResult": {
            "error": [
                4
            ],
            "result": [
                349
            ],
            "runId": [
                572
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "RunAgentThreadInput": {
            "key": [
                4
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SSOConnection": {
            "id": [
                572
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                506
            ],
            "type": [
                329
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                572
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                506
            ],
            "type": [
                329
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProviderStatus": {},
        "SdkClientChecksums": {
            "core": [
                4
            ],
            "metadata": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SearchField": {
            "createdAt": [
                233
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageAttachmentInput": {
            "id": [
                572
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageEmailInput": {
            "bcc": [
                4
            ],
            "body": [
                4
            ],
            "cc": [
                4
            ],
            "inReplyTo": [
                4
            ],
            "subject": [
                4
            ],
            "to": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageInput": {
            "attachments": [
                509
            ],
            "email": [
                510
            ],
            "idempotencyKey": [
                572
            ],
            "messageChannelId": [
                572
            ],
            "messageThreadId": [
                572
            ],
            "text": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageOutput": {
            "messageId": [
                572
            ],
            "messageThreadId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                572
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                572
            ],
            "streamId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailAttachmentInput": {
            "id": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailInput": {
            "bcc": [
                4
            ],
            "body": [
                4
            ],
            "cc": [
                4
            ],
            "connectedAccountId": [
                4
            ],
            "draftMessageId": [
                4
            ],
            "files": [
                514
            ],
            "fromHandle": [
                4
            ],
            "inReplyTo": [
                4
            ],
            "subject": [
                4
            ],
            "targetRecord": [
                517
            ],
            "to": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailOutput": {
            "error": [
                4
            ],
            "messageThreadId": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailTargetRecordInput": {
            "objectNameSingular": [
                4
            ],
            "recordId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "SendEmailViaDomainOutput": {
            "messageId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageInput": {
            "idempotencyKey": [
                4
            ],
            "text": [
                4
            ],
            "threadKey": [
                4
            ],
            "title": [
                4
            ],
            "toolCall": [
                349
            ],
            "workspaceMemberIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "SendInvitations": {
            "errors": [
                4
            ],
            "result": [
                729
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignInput": {
            "campaignId": [
                4
            ],
            "scheduledAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                156
            ],
            "campaignId": [
                4
            ],
            "queuedCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignTestInput": {
            "body": [
                4
            ],
            "fromAddress": [
                4
            ],
            "subject": [
                4
            ],
            "toAddress": [
                4
            ],
            "unsubscribeTopicId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Sentry": {
            "dsn": [
                4
            ],
            "environment": [
                4
            ],
            "release": [
                4
            ],
            "tracesSampleRate": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "SetAppKeyValueInput": {
            "key": [
                4
            ],
            "scope": [
                54
            ],
            "value": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "frontComponentId": [
                572
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "position": [
                9
            ],
            "scope": [
                528
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItemScope": {},
        "SetupOIDCSsoInput": {
            "clientID": [
                4
            ],
            "clientSecret": [
                4
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SetupSAMLSsoInput": {
            "certificate": [
                4
            ],
            "fingerprint": [
                4
            ],
            "id": [
                572
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "ssoURL": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SetupSso": {
            "id": [
                572
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                506
            ],
            "type": [
                329
            ],
            "__typename": [
                4
            ]
        },
        "SignUp": {
            "loginToken": [
                105
            ],
            "workspace": [
                741
            ],
            "__typename": [
                4
            ]
        },
        "SignUpInNewWorkspaceInput": {
            "affiliatePartnerName": [
                4
            ],
            "captchaToken": [
                4
            ],
            "displayName": [
                4
            ],
            "subdomain": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Skill": {
            "applicationId": [
                572
            ],
            "content": [
                4
            ],
            "createdAt": [
                233
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isCustom": [
                1
            ],
            "isSystem": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                485
            ],
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                739
            ],
            "thread": [
                19
            ],
            "__typename": [
                4
            ]
        },
        "StopGenerateInput": {
            "runId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "StopImpersonation": {
            "canRestoreImpersonatorSession": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "SubdomainAvailabilityDTO": {
            "available": [
                1
            ],
            "isValid": [
                1
            ],
            "suggestedSubdomain": [
                4
            ],
            "suggestedSubdomains": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "Subscription": {
            "eventLogsLive": [
                283,
                {
                    "fieldFilters": [
                        277,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        284,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                465,
                {
                    "input": [
                        215,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                367,
                {
                    "input": [
                        368,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                16,
                {
                    "agentUniversalIdentifier": [
                        572
                    ],
                    "runId": [
                        572
                    ],
                    "threadId": [
                        572
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "onEventSubscription": [
                285,
                {
                    "eventStreamId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                4
            ]
        },
        "SubscriptionInterval": {},
        "SubscriptionStatus": {},
        "Support": {
            "supportDriver": [
                544
            ],
            "supportFrontChatId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "SupportDriver": {},
        "SyncAppMessageFoldersInput": {
            "folders": [
                56
            ],
            "messageChannelId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "TabPresenceStatus": {},
        "TasksConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityType": {
            "action": [
                4
            ],
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "emit": [
                549
            ],
            "frontComponentUniversalIdentifier": [
                572
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "objectUniversalIdentifier": [
                572
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                572
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                572
            ],
            "on": [
                4
            ],
            "through": [
                550
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                572
            ],
            "relationFieldUniversalIdentifier": [
                572
            ],
            "triggerFieldUniversalIdentifiers": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "ToolIndexEntry": {
            "category": [
                4
            ],
            "description": [
                4
            ],
            "frontComponentId": [
                4
            ],
            "icon": [
                4
            ],
            "inputSchema": [
                349
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "objectName": [
                4
            ],
            "widgetName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TransientToken": {
            "transientToken": [
                105
            ],
            "__typename": [
                4
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                572
            ],
            "personFilter": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "TriggerAddPeopleToMessageListJobResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationJobInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationJobResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerInstallApplicationResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationJobInput": {
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationJobResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUninstallApplicationResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUpgradeApplicationInput": {
            "targetVersion": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TriggerUpgradeApplicationResult": {
            "jobId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationBackupCodeStatus": {
            "remainingBackupCodeCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationBackupCodes": {
            "backupCodes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationMethodSummary": {
            "status": [
                4
            ],
            "strategy": [
                4
            ],
            "twoFactorAuthenticationMethodId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                233
            ],
            "recoveryCode": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryCodeRedemption": {
            "isTwoFactorAuthenticationReset": [
                1
            ],
            "provisioningUri": [
                4
            ],
            "tokens": [
                106
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryStatus": {
            "hasVerifiedTwoFactorAuthenticationMethod": [
                1
            ],
            "isAwaitingRecoveryEnrollment": [
                1
            ],
            "pendingRecoveryCodeExpiresAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                572
            ],
            "gt": [
                572
            ],
            "gte": [
                572
            ],
            "iLike": [
                572
            ],
            "in": [
                572
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                572
            ],
            "lt": [
                572
            ],
            "lte": [
                572
            ],
            "neq": [
                572
            ],
            "notILike": [
                572
            ],
            "notIn": [
                572
            ],
            "notLike": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                233
            ],
            "description": [
                4
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "updatedAt": [
                233
            ],
            "visibility": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UnsubscribeTopicVisibility": {},
        "UpdateAgentChatChannelInput": {
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "name": [
                4
            ],
            "position": [
                9
            ],
            "roleIds": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpdateAgentInput": {
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isPrivate": [
                1
            ],
            "label": [
                4
            ],
            "modelConfiguration": [
                349
            ],
            "modelId": [
                4
            ],
            "name": [
                4
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                349
            ],
            "roleId": [
                572
            ],
            "triggers": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApiKeyInput": {
            "expiresAt": [
                4
            ],
            "id": [
                572
            ],
            "name": [
                4
            ],
            "revokedAt": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateAppMessageChannelInput": {
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                572
            ],
            "visibility": [
                388
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationInput": {
            "autoUpgrade": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationInput": {
            "id": [
                4
            ],
            "update": [
                583
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationPayload": {
            "name": [
                4
            ],
            "oAuthRedirectUris": [
                4
            ],
            "oAuthScopes": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationVariableInput": {
            "id": [
                4
            ],
            "update": [
                585
            ],
            "__typename": [
                4
            ]
        },
        "UpdateApplicationRegistrationVariablePayload": {
            "description": [
                4
            ],
            "resetValue": [
                1
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCalendarChannelInput": {
            "id": [
                572
            ],
            "update": [
                587
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                146
            ],
            "excludePrivateEvents": [
                1
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "visibility": [
                149
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                572
            ],
            "availabilityType": [
                176
            ],
            "engineComponentKey": [
                267
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                572
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateEmailGroupChannelInput": {
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                349
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "isAuditLogged": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isNullable": [
                1
            ],
            "isSearchable": [
                1
            ],
            "isSystem": [
                1
            ],
            "isUIEditable": [
                1
            ],
            "isUIReadOnly": [
                1
            ],
            "isUnique": [
                1
            ],
            "label": [
                4
            ],
            "morphRelationsUpdatePayload": [
                349
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "options": [
                349
            ],
            "settings": [
                349
            ],
            "translations": [
                400
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFrontComponentInput": {
            "id": [
                572
            ],
            "update": [
                592
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFrontComponentInputUpdates": {
            "description": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateGettingStartedInput": {
            "completedStepActionKey": [
                319
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                319
            ],
            "snoozedUntil": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateInboxNotificationSettingsInput": {
            "inboxNotificationLevel": [
                4
            ],
            "isInboxNotificationPreviewEnabled": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLabPublicFeatureFlagInput": {
            "publicFeatureFlag": [
                4
            ],
            "value": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                572
            ],
            "update": [
                597
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                349
            ],
            "databaseEventTriggerSettings": [
                349
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                349
            ],
            "name": [
                4
            ],
            "sourceHandlerCode": [
                4
            ],
            "sourceHandlerPath": [
                4
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                349
            ],
            "workflowActionTriggerSettings": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                572
            ],
            "update": [
                599
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                572
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "signInScope": [
                185
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                572
            ],
            "update": [
                601
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                383
            ],
            "excludeGroupEmails": [
                1
            ],
            "excludeNonProfessionalEmails": [
                1
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "messageFolderImportPolicy": [
                390
            ],
            "visibility": [
                388
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                572
            ],
            "update": [
                603
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFoldersInput": {
            "ids": [
                572
            ],
            "update": [
                603
            ],
            "__typename": [
                4
            ]
        },
        "UpdateNavigationMenuItemInput": {
            "color": [
                4
            ],
            "folderId": [
                572
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "link": [
                4
            ],
            "name": [
                4
            ],
            "pageLayoutId": [
                572
            ],
            "parentId": [
                572
            ],
            "position": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "UpdateObjectPayload": {
            "color": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "imageIdentifierFieldMetadataId": [
                572
            ],
            "isActive": [
                1
            ],
            "isLabelSyncedWithName": [
                1
            ],
            "isSearchable": [
                1
            ],
            "labelIdentifierFieldMetadataId": [
                572
            ],
            "labelPlural": [
                4
            ],
            "labelSingular": [
                4
            ],
            "namePlural": [
                4
            ],
            "nameSingular": [
                4
            ],
            "openRecordIn": [
                419
            ],
            "shortcut": [
                4
            ],
            "translations": [
                400
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                572
            ],
            "update": [
                590
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                572
            ],
            "update": [
                605
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                572
            ],
            "update": [
                606
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutInput": {
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "type": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutTabInput": {
            "icon": [
                4
            ],
            "layoutMode": [
                435
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutTabWithWidgetsInput": {
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "layoutMode": [
                435
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "widgets": [
                614
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "conditionalAvailability": [
                349
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                349
            ],
            "configuration": [
                349
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                572
            ],
            "pageLayoutTabId": [
                572
            ],
            "position": [
                349
            ],
            "title": [
                4
            ],
            "type": [
                716
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "conditionalAvailability": [
                349
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                349
            ],
            "configuration": [
                349
            ],
            "id": [
                572
            ],
            "objectMetadataId": [
                572
            ],
            "pageLayoutTabId": [
                572
            ],
            "position": [
                349
            ],
            "title": [
                4
            ],
            "type": [
                716
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWithTabsInput": {
            "isFirstTabPinned": [
                1
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "tabs": [
                612
            ],
            "type": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRelatedRecordPathInput": {
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isInherent": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRoleInput": {
            "id": [
                572
            ],
            "update": [
                618
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRolePayload": {
            "canAccessAllAgentChatChannels": [
                1
            ],
            "canAccessAllTools": [
                1
            ],
            "canBeAssignedToAgents": [
                1
            ],
            "canBeAssignedToApiKeys": [
                1
            ],
            "canBeAssignedToUsers": [
                1
            ],
            "canDestroyAllObjectRecords": [
                1
            ],
            "canReadAllObjectRecords": [
                1
            ],
            "canSoftDeleteAllObjectRecords": [
                1
            ],
            "canUpdateAllObjectRecords": [
                1
            ],
            "canUpdateAllSettings": [
                1
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateSkillInput": {
            "content": [
                4
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateTabPresenceInput": {
            "status": [
                546
            ],
            "tabId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateTimelineActivityTypeInput": {
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                400
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUnsubscribeTopicInput": {
            "description": [
                4
            ],
            "id": [
                4
            ],
            "name": [
                4
            ],
            "visibility": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                572
            ],
            "payload": [
                220
            ],
            "__typename": [
                4
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                572
            ],
            "update": [
                625
            ],
            "__typename": [
                4
            ]
        },
        "UpdateValidationRuleInputUpdates": {
            "description": [
                4
            ],
            "errorFieldMetadataId": [
                572
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "isActive": [
                1
            ],
            "message": [
                4
            ],
            "name": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldGroupInput": {
            "id": [
                572
            ],
            "update": [
                627
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldGroupInputUpdates": {
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                572
            ],
            "update": [
                629
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "aggregateOperation": [
                33
            ],
            "isVisible": [
                1
            ],
            "label": [
                4
            ],
            "position": [
                9
            ],
            "relationScope": [
                698
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                572
            ],
            "logicalOperator": [
                703
            ],
            "parentViewFilterGroupId": [
                572
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                572
            ],
            "update": [
                632
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                572
            ],
            "operand": [
                704
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "value": [
                349
            ],
            "viewFilterGroupId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                572
            ],
            "update": [
                634
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                572
            ],
            "fieldValue": [
                4
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewInput": {
            "anyFieldFilterValue": [
                4
            ],
            "calendarEndFieldMetadataId": [
                572
            ],
            "calendarFieldMetadataId": [
                572
            ],
            "calendarLayout": [
                689
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isCompact": [
                1
            ],
            "isPrivate": [
                1
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                572
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                572
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                707
            ],
            "position": [
                9
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "translations": [
                400
            ],
            "type": [
                711
            ],
            "visibility": [
                712
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                572
            ],
            "update": [
                637
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                710
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWebhookInput": {
            "id": [
                572
            ],
            "update": [
                639
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWebhookInputUpdates": {
            "description": [
                4
            ],
            "operations": [
                4
            ],
            "roleId": [
                572
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceAllowedEmbeddingOriginsInput": {
            "operation": [
                4
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceIframeMediaPermissionsInput": {
            "camera": [
                1
            ],
            "microphone": [
                1
            ],
            "origin": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceInput": {
            "aiAdditionalInstructions": [
                4
            ],
            "aiAgentModelTier": [
                41
            ],
            "aiChatAssistantProfile": [
                36
            ],
            "aiChatDirectMessageAssistantMode": [
                34
            ],
            "aiChatInboxAssistantMode": [
                34
            ],
            "aiChatModelTier": [
                41
            ],
            "aiDataPolicy": [
                40
            ],
            "aiEvaluationModelId": [
                4
            ],
            "aiModelIdByTier": [
                349
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                572
            ],
            "displayName": [
                4
            ],
            "editableProfileFields": [
                4
            ],
            "eventLogRetentionDays": [
                9
            ],
            "inviteHash": [
                4
            ],
            "isAutoModelSelectionEnabled": [
                1
            ],
            "isCampaignClickTrackingEnabled": [
                1
            ],
            "isCampaignOpenTrackingEnabled": [
                1
            ],
            "isGoogleAuthBypassEnabled": [
                1
            ],
            "isGoogleAuthEnabled": [
                1
            ],
            "isInternalImportEnabled": [
                1
            ],
            "isInternalMessagesImportEnabled": [
                1
            ],
            "isMicrosoftAuthBypassEnabled": [
                1
            ],
            "isMicrosoftAuthEnabled": [
                1
            ],
            "isPasswordAuthBypassEnabled": [
                1
            ],
            "isPasswordAuthEnabled": [
                1
            ],
            "isPublicInviteLinkEnabled": [
                1
            ],
            "isTwoFactorAuthenticationEnforced": [
                1
            ],
            "logo": [
                4
            ],
            "subdomain": [
                4
            ],
            "trashRetentionDays": [
                9
            ],
            "workspaceDiscoverability": [
                727
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                349
            ],
            "workspaceMemberId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                297
            ],
            "roleId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                572
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                646
            ],
            "id": [
                572
            ],
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetInput": {
            "fields": [
                646
            ],
            "groups": [
                647
            ],
            "widgetId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                421
            ],
            "roleId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertPermissionFlagsInput": {
            "permissionFlagKeys": [
                4
            ],
            "roleId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                572
            ],
            "roleId": [
                572
            ],
            "rules": [
                494
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                490
            ],
            "predicates": [
                489
            ],
            "rules": [
                493
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                657
            ],
            "viewFields": [
                654
            ],
            "viewFilterGroups": [
                655
            ],
            "viewFilters": [
                656
            ],
            "viewSorts": [
                658
            ],
            "widgetId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "aggregateOperation": [
                33
            ],
            "fieldMetadataId": [
                572
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "size": [
                9
            ],
            "viewFieldId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                572
            ],
            "logicalOperator": [
                703
            ],
            "parentViewFilterGroupId": [
                572
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "operand": [
                704
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "value": [
                349
            ],
            "viewFilterGroupId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                572
            ],
            "calendarFieldMetadataId": [
                572
            ],
            "calendarLayout": [
                689
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                572
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                572
            ],
            "openRecordIn": [
                707
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                711
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                710
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UpsertWebPushSubscriptionInput": {
            "browserAuthSecret": [
                4
            ],
            "browserPublicKey": [
                4
            ],
            "endpoint": [
                4
            ],
            "vapidPublicKey": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                233
            ],
            "periodStart": [
                233
            ],
            "timeSeries": [
                673
            ],
            "usageByApplication": [
                662
            ],
            "usageByModel": [
                662
            ],
            "usageByOperationType": [
                662
            ],
            "usageByUser": [
                662
            ],
            "userDailyUsage": [
                675
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                665
            ],
            "periodEnd": [
                233
            ],
            "periodStart": [
                233
            ],
            "userWorkspaceId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UsageBreakdownItem": {
            "creditsUsed": [
                9
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "userCreditsUsed": [
                9
            ],
            "workspaceCreditsUsed": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimit": {
            "burstValue": [
                120
            ],
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                665
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                672
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                674
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                674
            ],
            "operationType": [
                665
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                664
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                668
            ],
            "resourceType": [
                672
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                666
            ],
            "hasAllowancePeriod": [
                1
            ],
            "isIntraWorkspaceLimitEntitled": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaOperatorOnlyScope": {
            "operationType": [
                665
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                674
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                120
            ],
            "periodEnd": [
                233
            ],
            "periodStart": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                665
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                672
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                674
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                120
            ],
            "id": [
                572
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                665
            ],
            "periodEnd": [
                233
            ],
            "periodStart": [
                233
            ],
            "periodUnit": [
                4
            ],
            "remainingValue": [
                120
            ],
            "resourceType": [
                672
            ],
            "spenderId": [
                4
            ],
            "spenderLabel": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                674
            ],
            "__typename": [
                4
            ]
        },
        "UsageResourceType": {},
        "UsageTimeSeries": {
            "creditsUsed": [
                9
            ],
            "date": [
                4
            ],
            "workspaceCreditsUsed": [
                9
            ],
            "__typename": [
                4
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                673
            ],
            "userWorkspaceId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "User": {
            "availableWorkspaces": [
                111
            ],
            "canAccessFullAdminPanel": [
                1
            ],
            "canImpersonate": [
                1
            ],
            "createdAt": [
                233
            ],
            "currentUserWorkspace": [
                680
            ],
            "currentWorkspace": [
                721
            ],
            "deletedAt": [
                233
            ],
            "deletedWorkspaceMembers": [
                246
            ],
            "disabled": [
                1
            ],
            "email": [
                4
            ],
            "firstName": [
                4
            ],
            "hasPassword": [
                1
            ],
            "id": [
                572
            ],
            "isEmailVerified": [
                1
            ],
            "isWorkspaceCreator": [
                1
            ],
            "lastName": [
                4
            ],
            "locale": [
                4
            ],
            "onboardingStatus": [
                428
            ],
            "previousOnboardingStatus": [
                428
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                233
            ],
            "userVars": [
                350
            ],
            "userWorkspaces": [
                680
            ],
            "workspaceMember": [
                731
            ],
            "workspaceMembers": [
                731
            ],
            "workspaces": [
                680
            ],
            "__typename": [
                4
            ]
        },
        "UserApplicationVariableValue": {
            "description": [
                4
            ],
            "isDeprecated": [
                1
            ],
            "isRequired": [
                1
            ],
            "isSecret": [
                1
            ],
            "key": [
                4
            ],
            "label": [
                4
            ],
            "options": [
                349
            ],
            "type": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "UserCreditsFallback": {},
        "UserSession": {
            "authProvider": [
                4
            ],
            "city": [
                4
            ],
            "country": [
                4
            ],
            "createdAt": [
                233
            ],
            "expiresAt": [
                233
            ],
            "id": [
                572
            ],
            "ipAddress": [
                4
            ],
            "isCurrent": [
                1
            ],
            "isImpersonating": [
                1
            ],
            "lastActiveAt": [
                233
            ],
            "region": [
                4
            ],
            "userAgent": [
                4
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                233
            ],
            "deletedAt": [
                233
            ],
            "id": [
                572
            ],
            "inboxNotificationLevel": [
                4
            ],
            "isImpersonating": [
                1
            ],
            "isInboxNotificationPreviewEnabled": [
                1
            ],
            "locale": [
                4
            ],
            "objectRecordsPermissions": [
                427
            ],
            "permissionFlags": [
                445
            ],
            "twoFactorAuthenticationMethodSummary": [
                568
            ],
            "updatedAt": [
                233
            ],
            "user": [
                676
            ],
            "userId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                572
            ],
            "validationToken": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ValidatePasswordResetToken": {
            "email": [
                4
            ],
            "hasPassword": [
                1
            ],
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ValidationRule": {
            "description": [
                4
            ],
            "errorFieldMetadataId": [
                572
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "message": [
                4
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "VerificationRecord": {
            "key": [
                4
            ],
            "priority": [
                9
            ],
            "status": [
                4
            ],
            "type": [
                4
            ],
            "value": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "VerifyEmailAndGetLoginToken": {
            "loginToken": [
                105
            ],
            "workspaceUrls": [
                740
            ],
            "__typename": [
                4
            ]
        },
        "VerifyTwoFactorAuthenticationMethod": {
            "backupCodes": [
                4
            ],
            "success": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "VersionDistributionEntry": {
            "count": [
                2
            ],
            "version": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "View": {
            "anyFieldFilterValue": [
                4
            ],
            "applicationId": [
                572
            ],
            "calendarEndFieldMetadataId": [
                572
            ],
            "calendarFieldMetadataId": [
                572
            ],
            "calendarLayout": [
                689
            ],
            "createdAt": [
                233
            ],
            "createdByUserWorkspaceId": [
                572
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isCompact": [
                1
            ],
            "isCustom": [
                1
            ],
            "isPrivate": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                572
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                706
            ],
            "mainGroupByFieldMetadataId": [
                572
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                572
            ],
            "openRecordIn": [
                707
            ],
            "position": [
                9
            ],
            "presetFilter": [
                708
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                711
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "viewFieldGroups": [
                692
            ],
            "viewFields": [
                691
            ],
            "viewFilterGroups": [
                702
            ],
            "viewFilters": [
                701
            ],
            "viewGroups": [
                705
            ],
            "viewSorts": [
                709
            ],
            "visibility": [
                712
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "ViewField": {
            "aggregateOperation": [
                33
            ],
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isCanonical": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isSystemSideEffect": [
                1
            ],
            "isVisible": [
                1
            ],
            "label": [
                4
            ],
            "position": [
                9
            ],
            "relationScope": [
                693
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "size": [
                9
            ],
            "universalIdentifier": [
                572
            ],
            "updatedAt": [
                233
            ],
            "viewFieldGroupId": [
                572
            ],
            "viewId": [
                572
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "isActive": [
                1
            ],
            "isOverridden": [
                1
            ],
            "isVisible": [
                1
            ],
            "name": [
                4
            ],
            "position": [
                9
            ],
            "updatedAt": [
                233
            ],
            "viewFields": [
                691
            ],
            "viewId": [
                572
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScope": {
            "aggregateOperation": [
                33
            ],
            "filterGroups": [
                695
            ],
            "filters": [
                694
            ],
            "limit": [
                2
            ],
            "sorts": [
                699
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilter": {
            "fieldMetadataId": [
                572
            ],
            "filterGroupId": [
                572
            ],
            "id": [
                572
            ],
            "operand": [
                704
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "value": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroup": {
            "id": [
                572
            ],
            "logicalOperator": [
                703
            ],
            "parentFilterGroupId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroupInput": {
            "id": [
                572
            ],
            "logicalOperator": [
                703
            ],
            "parentFilterGroupId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterInput": {
            "fieldMetadataId": [
                572
            ],
            "filterGroupId": [
                572
            ],
            "id": [
                572
            ],
            "operand": [
                704
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "value": [
                349
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeInput": {
            "aggregateOperation": [
                33
            ],
            "filterGroups": [
                696
            ],
            "filters": [
                697
            ],
            "limit": [
                2
            ],
            "sorts": [
                700
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeSort": {
            "direction": [
                710
            ],
            "fieldMetadataId": [
                572
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeSortInput": {
            "direction": [
                710
            ],
            "fieldMetadataId": [
                572
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilter": {
            "createdAt": [
                233
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "operand": [
                704
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                233
            ],
            "value": [
                349
            ],
            "viewFilterGroupId": [
                572
            ],
            "viewId": [
                572
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                233
            ],
            "id": [
                572
            ],
            "logicalOperator": [
                703
            ],
            "parentViewFilterGroupId": [
                572
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                233
            ],
            "viewId": [
                572
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                233
            ],
            "fieldValue": [
                4
            ],
            "id": [
                572
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "updatedAt": [
                233
            ],
            "viewId": [
                572
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewPresetFilter": {},
        "ViewSort": {
            "createdAt": [
                233
            ],
            "direction": [
                710
            ],
            "fieldMetadataId": [
                572
            ],
            "id": [
                572
            ],
            "relationTargetFieldMetadataId": [
                572
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                233
            ],
            "viewId": [
                572
            ],
            "workspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "ViewSortDirection": {},
        "ViewType": {},
        "ViewVisibility": {},
        "Webhook": {
            "applicationId": [
                572
            ],
            "createdAt": [
                233
            ],
            "deletedAt": [
                233
            ],
            "description": [
                4
            ],
            "id": [
                572
            ],
            "operations": [
                4
            ],
            "role": [
                486
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "updatedAt": [
                233
            ],
            "__typename": [
                4
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                32
            ],
            "on_BarChartConfiguration": [
                114
            ],
            "on_CalendarConfiguration": [
                150
            ],
            "on_CallRecordingSummaryConfiguration": [
                154
            ],
            "on_CallRecordingTranscriptConfiguration": [
                155
            ],
            "on_ChatConfiguration": [
                163
            ],
            "on_ChatThreadsConfiguration": [
                166
            ],
            "on_EmailThreadConfiguration": [
                262
            ],
            "on_EmailsConfiguration": [
                266
            ],
            "on_FieldConfiguration": [
                290
            ],
            "on_FieldRichTextConfiguration": [
                298
            ],
            "on_FieldsConfiguration": [
                299
            ],
            "on_FilesConfiguration": [
                305
            ],
            "on_FormFieldConfiguration": [
                308
            ],
            "on_FrontComponentConfiguration": [
                310
            ],
            "on_IframeConfiguration": [
                330
            ],
            "on_LineChartConfiguration": [
                353
            ],
            "on_MessageCampaignBodyConfiguration": [
                379
            ],
            "on_MessageCampaignDetailsConfiguration": [
                380
            ],
            "on_NotesConfiguration": [
                411
            ],
            "on_PieChartConfiguration": [
                446
            ],
            "on_RecordTableConfiguration": [
                476
            ],
            "on_StandaloneRichTextConfiguration": [
                535
            ],
            "on_TasksConfiguration": [
                547
            ],
            "on_TimelineConfiguration": [
                551
            ],
            "on_ViewConfiguration": [
                690
            ],
            "on_WorkflowConfiguration": [
                718
            ],
            "on_WorkflowRunConfiguration": [
                719
            ],
            "on_WorkflowVersionConfiguration": [
                720
            ],
            "__typename": [
                4
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowActionType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                722
            ],
            "aiAdditionalInstructions": [
                4
            ],
            "aiAgentModelTier": [
                41
            ],
            "aiChatAssistantProfile": [
                35
            ],
            "aiChatDirectMessageAssistantMode": [
                34
            ],
            "aiChatInboxAssistantMode": [
                34
            ],
            "aiChatModelTier": [
                41
            ],
            "aiDataPolicy": [
                39
            ],
            "aiEvaluationModelId": [
                4
            ],
            "aiModelIdByTier": [
                349
            ],
            "allowImpersonation": [
                1
            ],
            "allowedEmbeddingOrigins": [
                4
            ],
            "billingCustomer": [
                122
            ],
            "billingEntitlements": [
                124
            ],
            "billingSubscriptions": [
                137
            ],
            "createdAt": [
                233
            ],
            "currentBillingSubscription": [
                137
            ],
            "customDomain": [
                4
            ],
            "databaseSchema": [
                4
            ],
            "defaultRole": [
                486
            ],
            "deletedAt": [
                233
            ],
            "displayName": [
                4
            ],
            "editableProfileFields": [
                4
            ],
            "eventLogRetentionDays": [
                9
            ],
            "featureFlags": [
                287
            ],
            "hasValidEnterpriseValidityToken": [
                1
            ],
            "hasValidSignedEnterpriseKey": [
                1
            ],
            "id": [
                572
            ],
            "iframeMediaPermissions": [
                331
            ],
            "installedApplications": [
                59
            ],
            "inviteHash": [
                4
            ],
            "isAutoModelSelectionEnabled": [
                1
            ],
            "isCampaignClickTrackingEnabled": [
                1
            ],
            "isCampaignOpenTrackingEnabled": [
                1
            ],
            "isCustomDomainEnabled": [
                1
            ],
            "isGoogleAuthBypassEnabled": [
                1
            ],
            "isGoogleAuthEnabled": [
                1
            ],
            "isInternalImportEnabled": [
                1
            ],
            "isInternalMessagesImportEnabled": [
                1
            ],
            "isMicrosoftAuthBypassEnabled": [
                1
            ],
            "isMicrosoftAuthEnabled": [
                1
            ],
            "isPasswordAuthBypassEnabled": [
                1
            ],
            "isPasswordAuthEnabled": [
                1
            ],
            "isPublicInviteLinkEnabled": [
                1
            ],
            "isTrialAvailable": [
                1
            ],
            "isTwoFactorAuthenticationEnforced": [
                1
            ],
            "logo": [
                4
            ],
            "logoFileId": [
                572
            ],
            "metadataVersion": [
                9
            ],
            "subdomain": [
                4
            ],
            "trashRetentionDays": [
                9
            ],
            "updatedAt": [
                233
            ],
            "viewFields": [
                691
            ],
            "viewFilterGroups": [
                702
            ],
            "viewFilters": [
                701
            ],
            "viewGroups": [
                705
            ],
            "viewSorts": [
                709
            ],
            "views": [
                688
            ],
            "workspaceCustomApplication": [
                59
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                727
            ],
            "workspaceMembersCount": [
                9
            ],
            "workspaceUrls": [
                740
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceActivationStatus": {},
        "WorkspaceAiStats": {
            "conversationsCount": [
                2
            ],
            "skillsCount": [
                2
            ],
            "toolsCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "WorkspaceCompanyEnrichmentResult": {
            "enrichment": [
                349
            ],
            "isBookCallOnboardingStepPending": [
                1
            ],
            "outcome": [
                724
            ],
            "personEnrichment": [
                349
            ],
            "personOutcome": [
                738
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceCreationDefaultsDTO": {
            "displayName": [
                4
            ],
            "subdomain": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceDiscoverability": {},
        "WorkspaceFromInviteHash": {
            "allowImpersonation": [
                1
            ],
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "logo": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceInvitation": {
            "email": [
                4
            ],
            "expiresAt": [
                233
            ],
            "id": [
                572
            ],
            "roleId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                1
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMember": {
            "avatarUrl": [
                4
            ],
            "calendarStartDay": [
                2
            ],
            "colorScheme": [
                4
            ],
            "dateFormat": [
                733
            ],
            "id": [
                572
            ],
            "locale": [
                4
            ],
            "name": [
                312
            ],
            "numberFormat": [
                734
            ],
            "openRecordIn": [
                431
            ],
            "roles": [
                486
            ],
            "timeFormat": [
                735
            ],
            "timeZone": [
                4
            ],
            "uiScale": [
                4
            ],
            "userEmail": [
                4
            ],
            "userId": [
                572
            ],
            "userWorkspaceId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                572
            ],
            "variables": [
                677
            ],
            "workspaceMemberId": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberDateFormatEnum": {},
        "WorkspaceMemberNumberFormatEnum": {},
        "WorkspaceMemberTimeFormatEnum": {},
        "WorkspaceMigration": {
            "actions": [
                349
            ],
            "applicationUniversalIdentifier": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceNameAndId": {
            "displayName": [
                4
            ],
            "id": [
                572
            ],
            "__typename": [
                4
            ]
        },
        "WorkspacePersonEnrichmentOutcome": {},
        "WorkspaceSetupChatOutcome": {},
        "WorkspaceUrls": {
            "customUrl": [
                4
            ],
            "subdomainUrl": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceUrlsAndId": {
            "id": [
                572
            ],
            "workspaceUrls": [
                740
            ],
            "__typename": [
                4
            ]
        }
    }
}