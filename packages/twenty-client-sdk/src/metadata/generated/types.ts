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
        77,
        85,
        95,
        101,
        114,
        118,
        119,
        121,
        126,
        131,
        134,
        139,
        147,
        148,
        149,
        150,
        152,
        154,
        161,
        163,
        177,
        182,
        184,
        186,
        233,
        234,
        261,
        265,
        266,
        270,
        282,
        288,
        292,
        296,
        299,
        306,
        323,
        325,
        331,
        333,
        346,
        353,
        354,
        355,
        367,
        369,
        387,
        388,
        389,
        390,
        391,
        392,
        394,
        395,
        396,
        399,
        400,
        402,
        405,
        410,
        414,
        423,
        430,
        432,
        435,
        439,
        440,
        445,
        449,
        473,
        475,
        476,
        484,
        495,
        496,
        505,
        510,
        532,
        546,
        547,
        549,
        551,
        577,
        579,
        581,
        649,
        670,
        677,
        679,
        683,
        694,
        708,
        709,
        711,
        712,
        713,
        715,
        716,
        719,
        720,
        721,
        726,
        728,
        731,
        737,
        738,
        739,
        742,
        743
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
                577
            ],
            "workspaceMemberIds": [
                577
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
                353
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
                577
            ],
            "avatarColor": [
                4
            ],
            "avatarShape": [
                4
            ],
            "createdAt": [
                234
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                353
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
                353
            ],
            "roleId": [
                577
            ],
            "triggers": [
                353
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannel": {
            "applicationId": [
                577
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
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
                577
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
                577
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                353
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
                234
            ],
            "deletedAt": [
                234
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
                234
            ],
            "__typename": [
                4
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                234
            ],
            "id": [
                577
            ],
            "isSubscribed": [
                1
            ],
            "lastMentionedAt": [
                234
            ],
            "lastReadAt": [
                234
            ],
            "mentionsResolvedAt": [
                234
            ],
            "snoozedUntil": [
                234
            ],
            "threadId": [
                577
            ],
            "updatedAt": [
                234
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                577
            ],
            "createdAt": [
                234
            ],
            "id": [
                577
            ],
            "isBuiltInAssistant": [
                1
            ],
            "parts": [
                25
            ],
            "processedAt": [
                234
            ],
            "reactions": [
                26
            ],
            "role": [
                4
            ],
            "senderApplicationId": [
                577
            ],
            "senderWorkspaceMemberId": [
                577
            ],
            "status": [
                4
            ],
            "threadId": [
                577
            ],
            "turnId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                234
            ],
            "errorMessage": [
                4
            ],
            "fileFilename": [
                4
            ],
            "fileId": [
                577
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                577
            ],
            "messageId": [
                577
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                353
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
                353
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                353
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
                577
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "AgentRecentRun": {
            "createdAt": [
                234
            ],
            "id": [
                577
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
                234
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
                234
            ],
            "errorMessage": [
                4
            ],
            "id": [
                577
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
                234
            ],
            "status": [
                31
            ],
            "threadId": [
                577
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
                577
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
                577
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
                577
            ],
            "aggregateOperation": [
                33
            ],
            "configurationType": [
                719
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                353
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "label": [
                4
            ],
            "numberFormat": [
                163
            ],
            "prefix": [
                4
            ],
            "ratioAggregateConfig": [
                468
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
                121
            ],
            "kind": [
                4
            ],
            "limitValue": [
                121
            ],
            "periodEnd": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                121
            ],
            "limitValue": [
                121
            ],
            "periodEnd": [
                234
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
                234
            ],
            "expiresAt": [
                234
            ],
            "id": [
                577
            ],
            "name": [
                4
            ],
            "revokedAt": [
                234
            ],
            "role": [
                490
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                234
            ],
            "id": [
                577
            ],
            "name": [
                4
            ],
            "revokedAt": [
                234
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
                182
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
                353
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                577
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
                234
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
                577
            ],
            "role": [
                396
            ],
            "workspaceMemberId": [
                577
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
                97
            ],
            "applicationRegistrationId": [
                577
            ],
            "applicationVariables": [
                100
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                353
            ],
            "canBeUninstalled": [
                1
            ],
            "commandMenuItems": [
                176
            ],
            "content": [
                72
            ],
            "createdAt": [
                234
            ],
            "defaultLogicFunctionRole": [
                490
            ],
            "defaultRoleId": [
                4
            ],
            "description": [
                4
            ],
            "frontComponents": [
                313
            ],
            "grantRoleId": [
                577
            ],
            "grantedIframeMediaPermissions": [
                335
            ],
            "healthCheckLogicFunctionId": [
                577
            ],
            "id": [
                577
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                366
            ],
            "logoFileId": [
                577
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                416
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                577
            ],
            "requestedIframeMediaPermissions": [
                335
            ],
            "requestedRoleId": [
                577
            ],
            "runHealthCheckOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                577
            ],
            "settingsMenuItems": [
                531
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                577
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
                234
            ],
            "id": [
                577
            ],
            "lastAuthorizedAt": [
                234
            ],
            "lastUsedAt": [
                234
            ],
            "marketplaceAppUniversalIdentifier": [
                4
            ],
            "scopes": [
                4
            ],
            "userId": [
                577
            ],
            "workspaceId": [
                577
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                577
            ],
            "archivedAt": [
                234
            ],
            "authFailedAt": [
                234
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                464
            ],
            "connectionProviderId": [
                577
            ],
            "createdAt": [
                234
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                577
            ],
            "isOwnedByCurrentUser": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                234
            ],
            "lastSignedInAt": [
                234
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                182
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                234
            ],
            "userWorkspaceId": [
                577
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
                577
            ],
            "connectedMemberCount": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectionProvider": {
            "applicationId": [
                4
            ],
            "displayName": [
                4
            ],
            "id": [
                577
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
                186
            ],
            "type": [
                4
            ],
            "via": [
                71
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
        "ApplicationConnectionProviderVia": {
            "description": [
                4
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "url": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationContent": {
            "agents": [
                73
            ],
            "commandMenuItems": [
                73
            ],
            "connectionProviders": [
                73
            ],
            "fields": [
                73
            ],
            "frontComponents": [
                73
            ],
            "indexes": [
                73
            ],
            "logicFunctions": [
                73
            ],
            "mcpServers": [
                73
            ],
            "navigationMenuItems": [
                73
            ],
            "objects": [
                73
            ],
            "pageLayoutTabs": [
                73
            ],
            "pageLayouts": [
                73
            ],
            "permissionFlags": [
                73
            ],
            "publicAssets": [
                73
            ],
            "roles": [
                73
            ],
            "skills": [
                73
            ],
            "translations": [
                73
            ],
            "viewFields": [
                73
            ],
            "views": [
                73
            ],
            "workflows": [
                73
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
                75
            ],
            "coverage": [
                76
            ],
            "files": [
                78
            ],
            "manifest": [
                353
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
                95
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
                77
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
                577
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
                306
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
                306
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
                234
            ],
            "fileFolder": [
                306
            ],
            "fileId": [
                577
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
                83
            ],
            "description": [
                4
            ],
            "status": [
                85
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
                87
            ],
            "bucketSizeInSeconds": [
                2
            ],
            "creditUsage": [
                88
            ],
            "creditsUsed": [
                9
            ],
            "failedRunCount": [
                2
            ],
            "functions": [
                89
            ],
            "issues": [
                90
            ],
            "lifecycle": [
                91
            ],
            "lifecycleFailureCount": [
                2
            ],
            "lookbackInHours": [
                2
            ],
            "periodEnd": [
                234
            ],
            "periodStart": [
                234
            ],
            "rateLimitEventCount": [
                2
            ],
            "runCount": [
                2
            ],
            "versions": [
                92
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                234
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
                234
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
                234
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
                234
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
                577
            ],
            "connectionProviders": [
                69
            ],
            "settingsMenuItems": [
                531
            ],
            "variables": [
                682
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                234
            ],
            "galleryImagesUrls": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                95
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                234
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
                231
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
                692
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                577
            ],
            "latestAvailableVersion": [
                4
            ],
            "logoUrl": [
                4
            ],
            "sourceType": [
                95
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                234
            ],
            "description": [
                4
            ],
            "id": [
                577
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
                353
            ],
            "type": [
                4
            ],
            "updatedAt": [
                234
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
                106
            ],
            "applicationRefreshToken": [
                106
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
                577
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
                353
            ],
            "scope": [
                101
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
                234
            ],
            "domain": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "workspaceMemberIds": [
                577
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
                509
            ],
            "__typename": [
                4
            ]
        },
        "AuthToken": {
            "expiresAt": [
                234
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
                106
            ],
            "refreshToken": [
                106
            ],
            "__typename": [
                4
            ]
        },
        "AuthTokens": {
            "tokens": [
                107
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
                577
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
                508
            ],
            "workspaceUrls": [
                744
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                111
            ],
            "availableWorkspacesForSignUp": [
                111
            ],
            "__typename": [
                4
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                112
            ],
            "tokens": [
                107
            ],
            "__typename": [
                4
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                577
            ],
            "aggregateOperation": [
                33
            ],
            "axisNameDisplay": [
                114
            ],
            "color": [
                4
            ],
            "configurationType": [
                719
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
                353
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupMode": [
                118
            ],
            "isCumulative": [
                1
            ],
            "layout": [
                119
            ],
            "numberFormat": [
                163
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                430
            ],
            "primaryAxisGroupByFieldMetadataId": [
                577
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                331
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                430
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                577
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                331
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
                353
            ],
            "formattedToRawLookup": [
                353
            ],
            "groupMode": [
                118
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
                119
            ],
            "series": [
                120
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
                353
            ],
            "objectMetadataId": [
                577
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
                143
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
                577
            ],
            "stripeCustomerEmail": [
                4
            ],
            "userCreditsFallback": [
                683
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
                138
            ],
            "currentBillingSubscription": [
                138
            ],
            "hasPaymentMethod": [
                1
            ],
            "status": [
                547
            ],
            "__typename": [
                4
            ]
        },
        "BillingEntitlement": {
            "key": [
                126
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
                135
            ],
            "name": [
                4
            ],
            "prices": [
                132
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
                127
            ],
            "downgradePlanKeys": [
                131
            ],
            "isCheckoutDefault": [
                1
            ],
            "isSellable": [
                1
            ],
            "planKey": [
                131
            ],
            "resourceCreditProducts": [
                127
            ],
            "upgradePlanKeys": [
                131
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
                546
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
                135
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
                131
            ],
            "productKey": [
                134
            ],
            "__typename": [
                4
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                234
            ],
            "periodStart": [
                234
            ],
            "productKey": [
                134
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
                140
            ],
            "cancelAt": [
                234
            ],
            "collectionMethod": [
                139
            ],
            "currentPeriodEnd": [
                234
            ],
            "hasUserCredits": [
                1
            ],
            "id": [
                577
            ],
            "interval": [
                546
            ],
            "metadata": [
                353
            ],
            "phases": [
                141
            ],
            "status": [
                547
            ],
            "__typename": [
                4
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "applicationLogoUrl": [
                4
            ],
            "applicationName": [
                4
            ],
            "applicationPricePer": [
                65
            ],
            "billingProduct": [
                133
            ],
            "creditAmount": [
                9
            ],
            "hasReachedCurrentPeriodCap": [
                1
            ],
            "id": [
                577
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
                142
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
                138
            ],
            "currentBillingSubscription": [
                138
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
                181
            ],
            "connectedAccountId": [
                577
            ],
            "contactAutoCreationPolicy": [
                147
            ],
            "createdAt": [
                234
            ],
            "excludePrivateEvents": [
                1
            ],
            "handle": [
                4
            ],
            "id": [
                577
            ],
            "isContactAutoCreationEnabled": [
                1
            ],
            "isSyncEnabled": [
                1
            ],
            "syncStage": [
                148
            ],
            "syncStageStartedAt": [
                234
            ],
            "syncStatus": [
                149
            ],
            "syncedAt": [
                234
            ],
            "throttleFailureCount": [
                9
            ],
            "updatedAt": [
                234
            ],
            "visibility": [
                150
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
                719
            ],
            "__typename": [
                4
            ]
        },
        "CalendarEventRecurrenceFrequency": {},
        "CalendarEventRecurrenceInput": {
            "daysOfWeek": [
                154
            ],
            "endDate": [
                4
            ],
            "endOccurrenceCount": [
                2
            ],
            "frequency": [
                152
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
                719
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                719
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
                161
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
                719
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                353
            ],
            "error": [
                166
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
                719
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
                410
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                412
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
                170
            ],
            "aiModelTiers": [
                172
            ],
            "aiModels": [
                171
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
                105
            ],
            "billing": [
                122
            ],
            "calendarBookingPageId": [
                4
            ],
            "canManageFeatureFlags": [
                1
            ],
            "captcha": [
                160
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
                174
            ],
            "publicFeatureFlags": [
                462
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                529
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                548
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
                234
            ],
            "link": [
                4
            ],
            "startAt": [
                234
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
                577
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                577
            ],
            "availabilityType": [
                177
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                577
            ],
            "createdAt": [
                234
            ],
            "engineComponentKey": [
                270
            ],
            "frontComponent": [
                313
            ],
            "frontComponentId": [
                577
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "pageLayoutId": [
                577
            ],
            "payload": [
                178
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "workflowVersionId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                422
            ],
            "on_PathCommandMenuItemPayload": [
                447
            ],
            "__typename": [
                4
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                79
            ],
            "files": [
                304
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
                577
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                577
            ],
            "archivedAt": [
                234
            ],
            "authFailedAt": [
                234
            ],
            "authFailedReason": [
                4
            ],
            "connectionParameters": [
                464
            ],
            "connectionProviderId": [
                577
            ],
            "createdAt": [
                234
            ],
            "handle": [
                4
            ],
            "handleAliases": [
                4
            ],
            "id": [
                577
            ],
            "lastCredentialsRefreshedAt": [
                234
            ],
            "lastSignedInAt": [
                234
            ],
            "name": [
                4
            ],
            "provider": [
                4
            ],
            "scope": [
                182
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                234
            ],
            "userWorkspaceId": [
                577
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
                338
            ],
            "handle": [
                4
            ],
            "id": [
                577
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                261
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
                577
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
                353
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
                353
            ],
            "roleId": [
                577
            ],
            "triggers": [
                353
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                577
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                577
            ],
            "participantHandleFieldUniversalIdentifier": [
                577
            ],
            "visibility": [
                392
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                80
            ],
            "targets": [
                82
            ],
            "__typename": [
                4
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                94
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
                153
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
                577
            ],
            "availabilityType": [
                177
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalPinnedExpression": [
                4
            ],
            "coreWorkflowVersionId": [
                577
            ],
            "engineComponentKey": [
                270
            ],
            "frontComponentId": [
                577
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
                577
            ],
            "pageLayoutId": [
                577
            ],
            "payload": [
                353
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                577
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
                386
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
                353
            ],
            "description": [
                4
            ],
            "formula": [
                353
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
                353
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                577
            ],
            "options": [
                353
            ],
            "relationCreationPayload": [
                353
            ],
            "settings": [
                353
            ],
            "type": [
                299
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
                577
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
                577
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
                203
            ],
            "indexType": [
                346
            ],
            "objectMetadataId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                353
            ],
            "databaseEventTriggerSettings": [
                353
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                353
            ],
            "id": [
                577
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                353
            ],
            "source": [
                353
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                353
            ],
            "universalIdentifier": [
                577
            ],
            "workflowActionTriggerSettings": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                577
            ],
            "id": [
                577
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
                186
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                577
            ],
            "agentId": [
                577
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "folderId": [
                577
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "parentId": [
                577
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                577
            ],
            "targetRecordId": [
                577
            ],
            "type": [
                414
            ],
            "userWorkspaceId": [
                577
            ],
            "viewId": [
                577
            ],
            "visibleItemLimit": [
                2
            ],
            "workflowId": [
                577
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
                353
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
                201
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                204
            ],
            "__typename": [
                4
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                209
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
                577
            ],
            "type": [
                440
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                439
            ],
            "pageLayoutId": [
                577
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
                353
            ],
            "configuration": [
                353
            ],
            "objectMetadataId": [
                577
            ],
            "pageLayoutTabId": [
                577
            ],
            "position": [
                353
            ],
            "title": [
                4
            ],
            "type": [
                720
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                577
            ],
            "filter": [
                353
            ],
            "objectMetadataId": [
                577
            ],
            "orderBy": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                577
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                577
            ],
            "secondFieldMetadataId": [
                577
            ],
            "thirdFieldMetadataId": [
                577
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
                577
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                121
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                121
            ],
            "operationType": [
                670
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                677
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                679
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
                577
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                577
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
                577
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
                577
            ],
            "id": [
                577
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
                703
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                577
            ],
            "viewId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                577
            ],
            "logicalOperator": [
                708
            ],
            "parentViewFilterGroupId": [
                577
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "operand": [
                709
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "value": [
                353
            ],
            "viewFilterGroupId": [
                577
            ],
            "viewId": [
                577
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
                577
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewId": [
                577
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
                577
            ],
            "calendarFieldMetadataId": [
                577
            ],
            "calendarLayout": [
                694
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                711
            ],
            "listPinnedFieldMetadataId": [
                577
            ],
            "mainGroupByFieldMetadataId": [
                577
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                577
            ],
            "openRecordIn": [
                712
            ],
            "position": [
                9
            ],
            "presetFilter": [
                713
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                716
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                715
            ],
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                577
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
                577
            ],
            "operations": [
                4
            ],
            "roleId": [
                577
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
                670
            ],
            "resource": [
                677
            ],
            "__typename": [
                4
            ]
        },
        "CursorPaging": {
            "after": [
                184
            ],
            "before": [
                184
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                577
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                577
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
                577
            ],
            "name": [
                316
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                577
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
                577
            ],
            "isCustomDomainEnabled": [
                1
            ],
            "records": [
                254
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
                577
            ],
            "pageLayoutId": [
                577
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
                577
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
                577
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                510
            ],
            "type": [
                333
            ],
            "__typename": [
                4
            ]
        },
        "EditSsoInput": {
            "id": [
                577
            ],
            "status": [
                510
            ],
            "__typename": [
                4
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                185
            ],
            "IMAP": [
                185
            ],
            "SMTP": [
                185
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
                719
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                234
            ],
            "domain": [
                4
            ],
            "id": [
                577
            ],
            "status": [
                265
            ],
            "tenantStatus": [
                266
            ],
            "unsubscribeHostnameStatus": [
                579
            ],
            "updatedAt": [
                234
            ],
            "verificationRecords": [
                689
            ],
            "verifiedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "EmitAppEventInput": {
            "event": [
                4
            ],
            "eventUniversalIdentifier": [
                4
            ],
            "id": [
                4
            ],
            "properties": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "EmitAppEventOutput": {
            "id": [
                4
            ],
            "occurredAt": [
                4
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
                353
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
                353
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
                272
            ],
            "limiter": [
                275
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                353
            ],
            "retryLimit": [
                2
            ],
            "__typename": [
                4
            ]
        },
        "EnqueueJobsLimiterInput": {
            "durationMs": [
                2
            ],
            "max": [
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
                277
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
            "scheduledAt": [
                9
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
                234
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
                234
            ],
            "currentPeriodEnd": [
                234
            ],
            "expiresAt": [
                234
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
                234
            ],
            "start": [
                234
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
                282
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
                280
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                281
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
                283
            ],
            "first": [
                2
            ],
            "table": [
                288
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                284
            ],
            "records": [
                287
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
                353
            ],
            "recordId": [
                4
            ],
            "timestamp": [
                234
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
                401
            ],
            "objectRecordEventsWithQueryIds": [
                429
            ],
            "queueJobEvents": [
                356
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                577
            ],
            "payload": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                292
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
                577
            ],
            "createdAt": [
                234
            ],
            "defaultValue": [
                353
            ],
            "description": [
                4
            ],
            "disabledFieldPermissionActions": [
                4
            ],
            "formula": [
                353
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "morphRelations": [
                483
            ],
            "name": [
                4
            ],
            "object": [
                416
            ],
            "objectMetadataId": [
                577
            ],
            "options": [
                353
            ],
            "relation": [
                483
            ],
            "settings": [
                353
            ],
            "type": [
                299
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                719
            ],
            "fieldDisplayMode": [
                296
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
                297
            ],
            "pageInfo": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                184
            ],
            "node": [
                293
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                298
            ],
            "id": [
                578
            ],
            "isActive": [
                145
            ],
            "isSystem": [
                145
            ],
            "isUIEditable": [
                145
            ],
            "isUIReadOnly": [
                145
            ],
            "objectMetadataId": [
                578
            ],
            "or": [
                298
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
                577
            ],
            "id": [
                577
            ],
            "objectMetadataId": [
                577
            ],
            "roleId": [
                577
            ],
            "rowLevelPermissionPredicateGroupId": [
                577
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
                577
            ],
            "objectMetadataId": [
                577
            ],
            "rowLevelPermissionPredicateGroupId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                719
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
                234
            ],
            "id": [
                577
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
                577
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
                234
            ],
            "fileId": [
                577
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
                234
            ],
            "id": [
                577
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
                719
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                577
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                510
            ],
            "type": [
                333
            ],
            "workspace": [
                741
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
                399
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                719
            ],
            "fieldMetadataId": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponent": {
            "applicationFunctionsBaseUrl": [
                4
            ],
            "applicationGrantedCapabilities": [
                4
            ],
            "applicationGrantedIframeMediaPermissions": [
                335
            ],
            "applicationId": [
                577
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                99
            ],
            "applicationVariables": [
                353
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
                234
            ],
            "description": [
                4
            ],
            "frontComponentSharedDependenciesChecksum": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "updatedAt": [
                234
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                315
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                719
            ],
            "frontComponentId": [
                577
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                577
            ],
            "pageLayoutType": [
                440
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
                504
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                353
            ],
            "runId": [
                577
            ],
            "scope": [
                353
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
                353
            ],
            "runId": [
                577
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
                577
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
                577
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
                577
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
                323
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                323
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                324
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                323
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
                325
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
                328
            ],
            "stepActionKey": [
                323
            ],
            "trigger": [
                329
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
                721
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
                577
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
                719
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
                339
            ],
            "IMAP": [
                339
            ],
            "SMTP": [
                339
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
                261
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
                106
            ],
            "workspace": [
                745
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
                577
            ],
            "threadId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                577
            ],
            "createdAt": [
                234
            ],
            "id": [
                577
            ],
            "indexFieldMetadataList": [
                344
            ],
            "indexType": [
                346
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
                234
            ],
            "__typename": [
                4
            ]
        },
        "IndexEdge": {
            "cursor": [
                184
            ],
            "node": [
                342
            ],
            "__typename": [
                4
            ]
        },
        "IndexField": {
            "createdAt": [
                234
            ],
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "order": [
                9
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "IndexFilter": {
            "and": [
                345
            ],
            "id": [
                578
            ],
            "isCustom": [
                145
            ],
            "or": [
                345
            ],
            "__typename": [
                4
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                577
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
                349
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
                577
            ],
            "messageThreadId": [
                577
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
            "scheduledAt": [
                9
            ],
            "startedAt": [
                9
            ],
            "state": [
                355
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                577
            ],
            "aggregateOperation": [
                33
            ],
            "axisNameDisplay": [
                114
            ],
            "color": [
                4
            ],
            "configurationType": [
                719
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
                353
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
                163
            ],
            "omitNullValues": [
                1
            ],
            "primaryAxisDateGranularity": [
                430
            ],
            "primaryAxisGroupByFieldMetadataId": [
                577
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                331
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                430
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                577
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                331
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
                353
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                361
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
                353
            ],
            "objectMetadataId": [
                577
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
                360
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
                182
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                577
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
                577
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                234
            ],
            "cronTriggerSettings": [
                353
            ],
            "databaseEventTriggerSettings": [
                353
            ],
            "description": [
                4
            ],
            "executionMode": [
                367
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                353
            ],
            "id": [
                577
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
                353
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "workflowActionTriggerSettings": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                353
            ],
            "duration": [
                9
            ],
            "error": [
                353
            ],
            "logs": [
                4
            ],
            "status": [
                369
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                577
            ],
            "applicationUniversalIdentifier": [
                577
            ],
            "id": [
                577
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "LoginToken": {
            "loginToken": [
                106
            ],
            "__typename": [
                4
            ]
        },
        "MarkAppChannelThreadAsReadInput": {
            "messageChannelId": [
                577
            ],
            "messageThreadId": [
                577
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
                72
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
                353
            ],
            "name": [
                4
            ],
            "objects": [
                377
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                335
            ],
            "roles": [
                378
            ],
            "screenshots": [
                4
            ],
            "sourcePackage": [
                4
            ],
            "sourceType": [
                95
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
                379
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                380
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
                577
            ],
            "connectionProviderId": [
                577
            ],
            "createdAt": [
                234
            ],
            "id": [
                577
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
                186
            ],
            "tools": [
                382
            ],
            "toolsSyncError": [
                4
            ],
            "toolsSyncedAt": [
                234
            ],
            "updatedAt": [
                234
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
                353
            ],
            "description": [
                4
            ],
            "inputSchema": [
                353
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
                719
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                719
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
            "canStartConversation": [
                1
            ],
            "connectedAccount": [
                181
            ],
            "connectedAccountId": [
                577
            ],
            "contactAutoCreationPolicy": [
                387
            ],
            "createdAt": [
                234
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
                577
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
                394
            ],
            "messagingProviderUniversalIdentifier": [
                577
            ],
            "participantHandleFieldUniversalIdentifier": [
                577
            ],
            "pendingGroupEmailsAction": [
                388
            ],
            "syncStage": [
                389
            ],
            "syncStageStartedAt": [
                234
            ],
            "syncStatus": [
                390
            ],
            "syncedAt": [
                234
            ],
            "throttleFailureCount": [
                9
            ],
            "throttleRetryAfter": [
                234
            ],
            "type": [
                391
            ],
            "updatedAt": [
                234
            ],
            "visibility": [
                392
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
                234
            ],
            "externalId": [
                4
            ],
            "id": [
                577
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                577
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                395
            ],
            "updatedAt": [
                234
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
                234
            ],
            "emailAddress": [
                4
            ],
            "id": [
                577
            ],
            "reason": [
                399
            ],
            "source": [
                400
            ],
            "unsubscribeTopicId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                397
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
                428
            ],
            "recordId": [
                4
            ],
            "type": [
                402
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
                577
            ],
            "property": [
                4
            ],
            "provenance": [
                405
            ],
            "recordId": [
                577
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
                577
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                175
            ],
            "objectMetadataItems": [
                408
            ],
            "views": [
                409
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
                577
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
                577
            ],
            "key": [
                711
            ],
            "objectMetadataId": [
                577
            ],
            "type": [
                716
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                538,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                725,
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                577,
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
                        577,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        336,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "archiveInboxThread": [
                1,
                {
                    "input": [
                        103,
                        "ArchiveInboxThreadInput!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                1,
                {
                    "assigneeWorkspaceMemberId": [
                        577
                    ],
                    "threadId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        577,
                        "UUID!"
                    ],
                    "roleId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        577,
                        "UUID!"
                    ],
                    "roleId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                1,
                {
                    "input": [
                        341,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                109,
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
                159,
                {
                    "input": [
                        158,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                144
            ],
            "cancelSwitchBillingPlan": [
                144
            ],
            "cancelSwitchResourceCreditPrice": [
                144
            ],
            "checkCustomDomainValidRecords": [
                255
            ],
            "checkPublicDomainValidRecords": [
                255,
                {
                    "domain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                137,
                {
                    "plan": [
                        131,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        546,
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
                94,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                94,
                {
                    "fileId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                179,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "fileIds": [
                        577,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeFileUpload": [
                308,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                308,
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
                308,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                308,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "connectApplicationWithApiKey": [
                577,
                {
                    "input": [
                        180,
                        "ConnectApplicationWithApiKeyInput!"
                    ]
                }
            ],
            "createAgentChatChannel": [
                8,
                {
                    "input": [
                        187,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                49,
                {
                    "input": [
                        189,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                386,
                {
                    "input": [
                        190,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                191,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "files": [
                        81,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                192,
                {
                    "input": [
                        193,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                102,
                {
                    "input": [
                        194,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                129
            ],
            "createCalendarEvent": [
                196,
                {
                    "input": [
                        195,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                19,
                {
                    "channelId": [
                        577
                    ]
                }
            ],
            "createCommandMenuItem": [
                176,
                {
                    "input": [
                        197,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                253,
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
                199,
                {
                    "input": [
                        198,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                264,
                {
                    "input": [
                        200,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                307,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        306,
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
                313,
                {
                    "input": [
                        202,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                413,
                {
                    "inputs": [
                        208,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                697,
                {
                    "inputs": [
                        223,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                696,
                {
                    "inputs": [
                        224,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                710,
                {
                    "inputs": [
                        227,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                381,
                {
                    "input": [
                        206,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                397,
                {
                    "input": [
                        207,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                413,
                {
                    "input": [
                        208,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                307,
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
                535,
                {
                    "input": [
                        533,
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
                        577,
                        "UUID!"
                    ],
                    "properties": [
                        353
                    ],
                    "recordId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                7,
                {
                    "input": [
                        188,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                293,
                {
                    "input": [
                        210,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                342,
                {
                    "input": [
                        211,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                366,
                {
                    "input": [
                        205,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                416,
                {
                    "input": [
                        212,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                490,
                {
                    "createRoleInput": [
                        218,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                437,
                {
                    "input": [
                        213,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                438,
                {
                    "input": [
                        214,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                441,
                {
                    "input": [
                        215,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                461,
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
                482,
                {
                    "input": [
                        217,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                535,
                {
                    "input": [
                        534,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                538,
                {
                    "input": [
                        219,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                129,
                {
                    "idempotencyKey": [
                        4,
                        "String!"
                    ],
                    "plan": [
                        131,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        546,
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
                580,
                {
                    "input": [
                        220,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                668,
                {
                    "input": [
                        221,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                688,
                {
                    "input": [
                        222,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                693,
                {
                    "input": [
                        228,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                696,
                {
                    "input": [
                        224,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                697,
                {
                    "input": [
                        223,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                706,
                {
                    "input": [
                        226,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                707,
                {
                    "input": [
                        225,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                710,
                {
                    "input": [
                        227,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                714,
                {
                    "input": [
                        229,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                717,
                {
                    "input": [
                        230,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                538,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        577,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        577
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
                386,
                {
                    "id": [
                        577,
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
                        235,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                176,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                181,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                725
            ],
            "deleteEmailGroupChannel": [
                386,
                {
                    "id": [
                        577,
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
                313,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                413,
                {
                    "ids": [
                        577,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                381,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                413,
                {
                    "id": [
                        577,
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
                293,
                {
                    "input": [
                        236,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                342,
                {
                    "input": [
                        237,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                366,
                {
                    "input": [
                        370,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                416,
                {
                    "input": [
                        238,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                4,
                {
                    "roleId": [
                        577,
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                482,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                239,
                {
                    "input": [
                        240,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                538,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                241,
                {
                    "twoFactorAuthenticationMethodId": [
                        577,
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                681
            ],
            "deleteUserFromWorkspace": [
                685,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                688,
                {
                    "id": [
                        577,
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
                696,
                {
                    "input": [
                        243,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                697,
                {
                    "input": [
                        242,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                706,
                {
                    "input": [
                        244,
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
                710,
                {
                    "input": [
                        245,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                1,
                {
                    "input": [
                        246,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                717,
                {
                    "id": [
                        577,
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
                696,
                {
                    "input": [
                        249,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                697,
                {
                    "input": [
                        248,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                706,
                {
                    "input": [
                        250,
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
                710,
                {
                    "input": [
                        251,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                1,
                {
                    "input": [
                        252,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                1,
                {
                    "input": [
                        341,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                181,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                256,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                257,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                258,
                {
                    "input": [
                        259,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                262,
                {
                    "captchaToken": [
                        4
                    ],
                    "email": [
                        4,
                        "String!"
                    ],
                    "workspaceId": [
                        577
                    ]
                }
            ],
            "emitAppEvent": [
                269,
                {
                    "input": [
                        268,
                        "EmitAppEventInput!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                124
            ],
            "enqueueJob": [
                273,
                {
                    "input": [
                        271,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                276,
                {
                    "input": [
                        274,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                729
            ],
            "executeOneLogicFunction": [
                368,
                {
                    "input": [
                        290,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                318,
                {
                    "input": [
                        317,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                51,
                {
                    "apiKeyId": [
                        577,
                        "UUID!"
                    ],
                    "expiresAt": [
                        4,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                99,
                {
                    "applicationId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                106
            ],
            "generateTransientToken": [
                558
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                572,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                574,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                108,
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
                108,
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
                108,
                {
                    "ssoExchangeToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                575,
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
                320,
                {
                    "input": [
                        321,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                373,
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
                433
            ],
            "grantApplicationCapabilities": [
                66,
                {
                    "input": [
                        330,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                340,
                {
                    "userId": [
                        577,
                        "UUID!"
                    ],
                    "workspaceId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                348,
                {
                    "input": [
                        347,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                350,
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
                350
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        374,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        577
                    ],
                    "threadId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                577,
                {
                    "workspaceMemberId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                326,
                {
                    "stepActionKey": [
                        323,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                278
            ],
            "removeAgentChatMessageReaction": [
                26,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        485,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                477,
                {
                    "principal": [
                        474,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        481,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                99,
                {
                    "applicationRefreshToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                108,
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        486,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                487,
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
                525,
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
                176,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                438,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                441,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                553,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                517,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        577,
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
                        488,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                492,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                506,
                {
                    "input": [
                        502,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                84,
                {
                    "applicationId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                84,
                {
                    "applicationId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                337,
                {
                    "connectionParameters": [
                        260,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        4,
                        "String!"
                    ],
                    "id": [
                        577
                    ]
                }
            ],
            "sendAppChannelMessage": [
                516,
                {
                    "input": [
                        515,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                517,
                {
                    "browsingContext": [
                        353
                    ],
                    "channelId": [
                        577
                    ],
                    "fileAttachments": [
                        305,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        1
                    ],
                    "isAssistantParticipant": [
                        1
                    ],
                    "mentionedWorkspaceMemberIds": [
                        577,
                        "[UUID!]"
                    ],
                    "messageId": [
                        577,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        577,
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                520,
                {
                    "input": [
                        519,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                524,
                {
                    "input": [
                        523,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                525,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        577
                    ]
                }
            ],
            "sendMessageCampaign": [
                527,
                {
                    "input": [
                        526,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                522,
                {
                    "input": [
                        528,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                53,
                {
                    "input": [
                        530,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                128,
                {
                    "partnerCode": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                278,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                477,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        481,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                477,
                {
                    "accessLevel": [
                        473,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        474,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        481,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                144,
                {
                    "priceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                113,
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
                113,
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
                536,
                {
                    "input": [
                        537
                    ]
                }
            ],
            "signUpInWorkspace": [
                536,
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
                        577
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
                434,
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
                        234,
                        "DateTime!"
                    ],
                    "threadId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "startAppChannelConversation": [
                516,
                {
                    "input": [
                        540,
                        "StartAppChannelConversationInput!"
                    ]
                }
            ],
            "startChannelSync": [
                162,
                {
                    "connectedAccountId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                541,
                {
                    "companyContext": [
                        353
                    ],
                    "personContext": [
                        353
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        542,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                543
            ],
            "switchBillingPlan": [
                144,
                {
                    "plan": [
                        131
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                144
            ],
            "syncAppMessageFolders": [
                393,
                {
                    "input": [
                        550,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                740,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        353,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                381,
                {
                    "id": [
                        577,
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
                        353
                    ],
                    "type": [
                        47,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                94,
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
                560,
                {
                    "input": [
                        559,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                564,
                {
                    "input": [
                        561,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                563,
                {
                    "input": [
                        562,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                568,
                {
                    "input": [
                        565,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                567,
                {
                    "input": [
                        566,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                570,
                {
                    "input": [
                        569,
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
                        577,
                        "UUID!"
                    ],
                    "input": [
                        582,
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
                        234
                    ],
                    "threadIds": [
                        577,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                49,
                {
                    "input": [
                        584,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                386,
                {
                    "input": [
                        585,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                59,
                {
                    "id": [
                        577,
                        "UUID!"
                    ],
                    "input": [
                        586,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                94,
                {
                    "input": [
                        587,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                98,
                {
                    "input": [
                        589,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                146,
                {
                    "input": [
                        591,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                176,
                {
                    "input": [
                        593,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                386,
                {
                    "input": [
                        594,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                313,
                {
                    "input": [
                        596,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                322,
                {
                    "input": [
                        598,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateInboxNotificationSettings": [
                685,
                {
                    "input": [
                        599,
                        "UpdateInboxNotificationSettingsInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                291,
                {
                    "input": [
                        600,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                413,
                {
                    "inputs": [
                        613,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                416,
                {
                    "inputs": [
                        614,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                710,
                {
                    "inputs": [
                        638,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                381,
                {
                    "input": [
                        603,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                386,
                {
                    "input": [
                        605,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                393,
                {
                    "input": [
                        607,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                393,
                {
                    "input": [
                        609,
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
                413,
                {
                    "input": [
                        613,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                7,
                {
                    "input": [
                        583,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        577
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
                293,
                {
                    "input": [
                        612,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        601,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                416,
                {
                    "input": [
                        614,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                490,
                {
                    "updateRoleInput": [
                        622,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        615,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                438,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        616,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                441,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        618,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        620,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                351,
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
                482,
                {
                    "input": [
                        621,
                        "UpdateRelatedRecordPathInput!"
                    ]
                }
            ],
            "updateSkill": [
                538,
                {
                    "input": [
                        624,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTabPresence": [
                1,
                {
                    "input": [
                        625,
                        "UpdateTabPresenceInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                553,
                {
                    "input": [
                        626,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                580,
                {
                    "input": [
                        627,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                668,
                {
                    "input": [
                        628,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                123,
                {
                    "userCreditsFallback": [
                        683,
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
                688,
                {
                    "input": [
                        629,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                693,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        640,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                696,
                {
                    "input": [
                        633,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                697,
                {
                    "input": [
                        631,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                706,
                {
                    "input": [
                        636,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                707,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        635,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                710,
                {
                    "input": [
                        638,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                714,
                {
                    "input": [
                        641,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                717,
                {
                    "input": [
                        643,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                725,
                {
                    "data": [
                        647,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                725,
                {
                    "data": [
                        645,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                725,
                {
                    "data": [
                        646,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                735,
                {
                    "roleId": [
                        577,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        648,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                94,
                {
                    "file": [
                        649,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                304,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        649,
                        "Upload!"
                    ],
                    "fileFolder": [
                        306,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                308,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        649,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                308,
                {
                    "file": [
                        649,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                308,
                {
                    "file": [
                        649,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                308,
                {
                    "file": [
                        649,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                300,
                {
                    "upsertFieldPermissionsInput": [
                        650,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                693,
                {
                    "input": [
                        653,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                424,
                {
                    "upsertObjectPermissionsInput": [
                        654,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                491,
                {
                    "upsertPermissionFlagsInput": [
                        655,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                657,
                {
                    "input": [
                        656,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                693,
                {
                    "input": [
                        658,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "upsertWebPushSubscription": [
                1,
                {
                    "input": [
                        664,
                        "UpsertWebPushSubscriptionInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                102,
                {
                    "input": [
                        686,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                690,
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
                113,
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
                264,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                691,
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
                577
            ],
            "agentId": [
                577
            ],
            "applicationId": [
                577
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "createdAt": [
                234
            ],
            "folderId": [
                577
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "parentId": [
                577
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                577
            ],
            "targetRecordId": [
                577
            ],
            "targetRecordIdentifier": [
                470
            ],
            "type": [
                414
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "userWorkspaceId": [
                577
            ],
            "viewId": [
                577
            ],
            "visibleItemLimit": [
                2
            ],
            "workflowId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                577
            ],
            "color": [
                4
            ],
            "createdAt": [
                234
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
                419,
                {
                    "filter": [
                        298,
                        "FieldFilter!"
                    ],
                    "paging": [
                        232,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                293
            ],
            "icon": [
                4
            ],
            "id": [
                577
            ],
            "imageIdentifierFieldMetadataId": [
                577
            ],
            "indexMetadataList": [
                342
            ],
            "indexMetadatas": [
                421,
                {
                    "filter": [
                        345,
                        "IndexFilter!"
                    ],
                    "paging": [
                        232,
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
                577
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
                423
            ],
            "searchFieldMetadataList": [
                512
            ],
            "shortcut": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "ObjectConnection": {
            "edges": [
                418
            ],
            "pageInfo": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "ObjectEdge": {
            "cursor": [
                184
            ],
            "node": [
                416
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                297
            ],
            "pageInfo": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                420
            ],
            "id": [
                578
            ],
            "isActive": [
                145
            ],
            "isRemote": [
                145
            ],
            "isSearchable": [
                145
            ],
            "isSystem": [
                145
            ],
            "isUICreatable": [
                145
            ],
            "isUIEditable": [
                145
            ],
            "isUIReadOnly": [
                145
            ],
            "or": [
                420
            ],
            "universalIdentifier": [
                578
            ],
            "__typename": [
                4
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                343
            ],
            "pageInfo": [
                436
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                577
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
                577
            ],
            "restrictedFields": [
                353
            ],
            "rowLevelPermissionPredicateGroups": [
                494
            ],
            "rowLevelPermissionPredicates": [
                493
            ],
            "uneditableFields": [
                577
            ],
            "unreadableFields": [
                577
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
                577
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
                233
            ],
            "objectNameSingular": [
                4
            ],
            "properties": [
                428
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
                353
            ],
            "before": [
                353
            ],
            "diff": [
                353
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
                427
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
                577
            ],
            "restrictedFields": [
                353
            ],
            "rowLevelRecordsPermissions": [
                501
            ],
            "uneditableFields": [
                577
            ],
            "unreadableFields": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                432
            ],
            "previousOnboardingStatus": [
                432
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
                184
            ],
            "hasNextPage": [
                1
            ],
            "hasPreviousPage": [
                1
            ],
            "startCursor": [
                184
            ],
            "__typename": [
                4
            ]
        },
        "PageLayout": {
            "applicationId": [
                577
            ],
            "createdAt": [
                234
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                577
            ],
            "deletedAt": [
                234
            ],
            "id": [
                577
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
                577
            ],
            "tabs": [
                438
            ],
            "type": [
                440
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                577
            ],
            "createdAt": [
                234
            ],
            "deletedAt": [
                234
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                439
            ],
            "pageLayoutId": [
                577
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "widgets": [
                441
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                335
            ],
            "applicationId": [
                577
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailability": [
                353
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                353
            ],
            "configuration": [
                718
            ],
            "createdAt": [
                234
            ],
            "deletedAt": [
                234
            ],
            "gridPosition": [
                332
            ],
            "id": [
                577
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
                577
            ],
            "pageLayoutTabId": [
                577
            ],
            "position": [
                444
            ],
            "title": [
                4
            ],
            "type": [
                720
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                439
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
                439
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
                442
            ],
            "on_PageLayoutWidgetGridPosition": [
                443
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                446
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                445
            ],
            "index": [
                2
            ],
            "layoutMode": [
                439
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
                577
            ],
            "createdAt": [
                234
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                577
            ],
            "aggregateOperation": [
                33
            ],
            "color": [
                4
            ],
            "configurationType": [
                719
            ],
            "dateGranularity": [
                430
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
                353
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                577
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
                163
            ],
            "orderBy": [
                331
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
                453
            ],
            "formattedToRawLookup": [
                353
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
                353
            ],
            "objectMetadataId": [
                577
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
                365
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
                234
            ],
            "__typename": [
                4
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                157
            ],
            "blockers": [
                385
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                577
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
                181
            ],
            "connectedAccountId": [
                577
            ],
            "handle": [
                4
            ],
            "id": [
                577
            ],
            "visibility": [
                150
            ],
            "__typename": [
                4
            ]
        },
        "PublicConnectionParametersOutput": {
            "connectionSecurity": [
                261
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
                577
            ],
            "createdAt": [
                234
            ],
            "domain": [
                4
            ],
            "id": [
                577
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
                292
            ],
            "metadata": [
                463
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
                460
            ],
            "IMAP": [
                460
            ],
            "SMTP": [
                460
            ],
            "__typename": [
                4
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                104
            ],
            "authProviders": [
                105
            ],
            "displayName": [
                4
            ],
            "id": [
                577
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                744
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
                577
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
                        577,
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
                        577,
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
                        577,
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
                        319,
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
                        362
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
                386,
                {
                    "filter": [
                        363
                    ]
                }
            ],
            "appMessageFolders": [
                393,
                {
                    "filter": [
                        364
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                67,
                {
                    "applicationId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                69,
                {
                    "applicationId": [
                        577,
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
                511,
                {
                    "applicationId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                116,
                {
                    "input": [
                        117,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                128
            ],
            "billingPlans": [
                130
            ],
            "billingPortalSession": [
                137,
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
                459
            ],
            "callRecordingIdForCalendarEvent": [
                577,
                {
                    "calendarEventId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                24,
                {
                    "agentUniversalIdentifier": [
                        577
                    ],
                    "threadId": [
                        577
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                165,
                {
                    "agentUniversalIdentifier": [
                        577
                    ],
                    "threadId": [
                        577
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                168,
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
                734,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                544,
                {
                    "subdomain": [
                        4,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                176,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                176
            ],
            "currentUser": [
                681
            ],
            "currentUserApplicationAuthorizations": [
                60
            ],
            "currentUserSessions": [
                684
            ],
            "currentWorkspace": [
                725
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
                279
            ],
            "eventLogs": [
                286,
                {
                    "input": [
                        285,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                74,
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
                        577,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                293,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                295,
                {
                    "filter": [
                        298,
                        "FieldFilter!"
                    ],
                    "paging": [
                        232,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                458,
                {
                    "clientId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                94,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                86,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        234
                    ],
                    "periodStart": [
                        234
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                96,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "periodEnd": [
                        234
                    ],
                    "periodStart": [
                        234
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                98,
                {
                    "applicationRegistrationId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                169,
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
                356,
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
                94
            ],
            "findManyApplications": [
                59
            ],
            "findManyLogicFunctions": [
                366
            ],
            "findManyMarketplaceApps": [
                375,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                461
            ],
            "findMarketplaceAppDetail": [
                376,
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
                        577
                    ],
                    "universalIdentifier": [
                        577
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                94,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                366,
                {
                    "input": [
                        370,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                356,
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
                356,
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
                727
            ],
            "findWorkspaceFromInviteHash": [
                732,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                733
            ],
            "frontComponent": [
                313,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                313
            ],
            "getAddressDetails": [
                454,
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
                490
            ],
            "getApprovedAccessDomains": [
                102
            ],
            "getAutoCompleteAddress": [
                110,
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
                353,
                {
                    "input": [
                        370,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                183,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                264
            ],
            "getInviteSuggestions": [
                352
            ],
            "getJobs": [
                356,
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
                        370,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                438,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                438,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                441,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                441,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                437,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        440
                    ]
                }
            ],
            "getPermissionFlags": [
                448
            ],
            "getPublicWorkspaceDataByDomain": [
                465,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                466,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                136
            ],
            "getRole": [
                490,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                490
            ],
            "getSSOIdentityProviders": [
                310
            ],
            "getToolIndex": [
                557
            ],
            "getToolInputSchema": [
                353,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                665,
                {
                    "input": [
                        666
                    ]
                }
            ],
            "getView": [
                693,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                696,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                697,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                697,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                696,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                706,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                707,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                707,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                706,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                710,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                710,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                714,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                714,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                693,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        716,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                730
            ],
            "gettingStartedProgress": [
                322
            ],
            "gettingStartedWorkflowPreviews": [
                327
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
                358,
                {
                    "input": [
                        359,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                130
            ],
            "mcpServer": [
                381,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                381
            ],
            "messageSuppressions": [
                398,
                {
                    "input": [
                        311,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                403,
                {
                    "input": [
                        406,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                407
            ],
            "mostlyEmptyFieldMetadataIds": [
                577,
                {
                    "objectMetadataId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                93
            ],
            "myCalendarChannels": [
                146,
                {
                    "connectedAccountId": [
                        577
                    ]
                }
            ],
            "myConnectedAccounts": [
                181
            ],
            "myMessageChannels": [
                386,
                {
                    "connectedAccountId": [
                        577
                    ]
                }
            ],
            "myMessageFolders": [
                393,
                {
                    "messageChannelId": [
                        577
                    ]
                }
            ],
            "myUserApplicationVariables": [
                736
            ],
            "navigationMenuItem": [
                413,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                413
            ],
            "object": [
                416,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                426
            ],
            "objects": [
                417,
                {
                    "filter": [
                        420,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        232,
                        "CursorPaging!"
                    ]
                }
            ],
            "onlineWorkspaceMemberIds": [
                577
            ],
            "pieChartData": [
                451,
                {
                    "input": [
                        452,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                157,
                {
                    "input": [
                        455,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                457,
                {
                    "input": [
                        456,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                376,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                375
            ],
            "recordPermissions": [
                472,
                {
                    "targets": [
                        481,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                477,
                {
                    "target": [
                        481,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                482
            ],
            "skill": [
                538,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                538
            ],
            "timelineActivityTypes": [
                553
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                571
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                576,
                {
                    "userId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                580
            ],
            "usageLimits": [
                668
            ],
            "usageQuotaDefinitions": [
                672
            ],
            "usageQuotaScopeConsumption": [
                674,
                {
                    "input": [
                        675,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                676
            ],
            "validatePasswordResetToken": [
                687,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                688,
                {
                    "objectMetadataId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                688,
                {
                    "fieldMetadataId": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                717,
                {
                    "id": [
                        577,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                717
            ],
            "workspaceApplicationAuthorizations": [
                60,
                {
                    "applicationId": [
                        577
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
                577
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
                577
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
                577
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
                577
            ],
            "permissions": [
                471
            ],
            "recordId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                577
            ],
            "workspaceMemberId": [
                577
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
                471
            ],
            "roles": [
                479
            ],
            "shares": [
                478
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                473
            ],
            "id": [
                20
            ],
            "principalId": [
                577
            ],
            "principalRoleId": [
                577
            ],
            "principalType": [
                475
            ],
            "rowCause": [
                476
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
                577
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
                719
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
                577
            ],
            "recordId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "isActive": [
                1
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                577
            ],
            "secondFieldMetadataId": [
                577
            ],
            "thirdFieldMetadataId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                293
            ],
            "sourceObjectMetadata": [
                416
            ],
            "targetFieldMetadata": [
                293
            ],
            "targetObjectMetadata": [
                416
            ],
            "type": [
                484
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
                577
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
                577
            ],
            "areRecordPermissionsEditable": [
                1
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
                300
            ],
            "icon": [
                4
            ],
            "id": [
                577
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                424
            ],
            "permissionFlags": [
                491
            ],
            "rowLevelPermissionFieldPermissions": [
                300
            ],
            "rowLevelPermissionPredicateGroups": [
                494
            ],
            "rowLevelPermissionPredicates": [
                493
            ],
            "rowLevelPermissionRules": [
                497
            ],
            "universalIdentifier": [
                577
            ],
            "workspaceMembers": [
                735
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
                577
            ],
            "roleId": [
                577
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
                496
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
                353
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
                495
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
                577
            ],
            "objectMetadataId": [
                577
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
                577
            ],
            "predicateGroups": [
                499
            ],
            "predicates": [
                500
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                577
            ],
            "logicalOperator": [
                495
            ],
            "position": [
                9
            ],
            "predicateGroups": [
                499
            ],
            "predicates": [
                500
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "operand": [
                496
            ],
            "position": [
                9
            ],
            "relationFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "value": [
                353
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
                577
            ],
            "workspaceMemberRelationFilterFieldMetadataId": [
                577
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
                494
            ],
            "predicates": [
                493
            ],
            "ruleId": [
                577
            ],
            "uneditableFields": [
                577
            ],
            "unreadableFields": [
                577
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
                504
            ],
            "messages": [
                504
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                353
            ],
            "runAsWorkspaceMemberId": [
                577
            ],
            "thread": [
                507
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
                577
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
                503
            ],
            "content": [
                4
            ],
            "role": [
                505
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
                353
            ],
            "runId": [
                577
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                577
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
                577
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                510
            ],
            "type": [
                333
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                577
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                510
            ],
            "type": [
                333
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
                234
            ],
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                577
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "SendAppChannelMessageAttachmentInput": {
            "id": [
                577
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
                513
            ],
            "email": [
                514
            ],
            "idempotencyKey": [
                577
            ],
            "messageChannelId": [
                577
            ],
            "messageThreadId": [
                577
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
                577
            ],
            "messageThreadId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                577
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                577
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
                518
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
                521
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
                577
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
                353
            ],
            "toolCalls": [
                353
            ],
            "workspaceMemberIds": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                577
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
                733
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
                234
            ],
            "__typename": [
                4
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                157
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
                353
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                577
            ],
            "createdAt": [
                234
            ],
            "frontComponentId": [
                577
            ],
            "icon": [
                4
            ],
            "id": [
                577
            ],
            "position": [
                9
            ],
            "scope": [
                532
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
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
                577
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
                577
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                510
            ],
            "type": [
                333
            ],
            "__typename": [
                4
            ]
        },
        "SignUp": {
            "loginToken": [
                106
            ],
            "workspace": [
                745
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
                577
            ],
            "content": [
                4
            ],
            "createdAt": [
                234
            ],
            "description": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                234
            ],
            "__typename": [
                4
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                489
            ],
            "configurationType": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "StartAppChannelConversationInput": {
            "idempotencyKey": [
                577
            ],
            "messageChannelId": [
                577
            ],
            "personId": [
                577
            ],
            "text": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                743
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
                577
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
                287,
                {
                    "fieldFilters": [
                        281,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        288,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                469,
                {
                    "input": [
                        216,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                371,
                {
                    "input": [
                        372,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                16,
                {
                    "agentUniversalIdentifier": [
                        577
                    ],
                    "runId": [
                        577
                    ],
                    "threadId": [
                        577
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "onEventSubscription": [
                289,
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
                549
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "TabPresenceStatus": {},
        "TasksConfiguration": {
            "configurationType": [
                719
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
                577
            ],
            "createdAt": [
                234
            ],
            "emit": [
                554
            ],
            "frontComponentUniversalIdentifier": [
                577
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                577
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                577
            ],
            "on": [
                4
            ],
            "through": [
                555
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                577
            ],
            "relationFieldUniversalIdentifier": [
                577
            ],
            "triggerFieldUniversalIdentifiers": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                719
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
                353
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
                106
            ],
            "__typename": [
                4
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                577
            ],
            "personFilter": [
                353
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                234
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
                107
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
                234
            ],
            "__typename": [
                4
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                577
            ],
            "gt": [
                577
            ],
            "gte": [
                577
            ],
            "iLike": [
                577
            ],
            "in": [
                577
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                577
            ],
            "lt": [
                577
            ],
            "lte": [
                577
            ],
            "neq": [
                577
            ],
            "notILike": [
                577
            ],
            "notIn": [
                577
            ],
            "notLike": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                234
            ],
            "description": [
                4
            ],
            "id": [
                577
            ],
            "name": [
                4
            ],
            "updatedAt": [
                234
            ],
            "visibility": [
                581
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
                577
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
                577
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
                353
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
                353
            ],
            "roleId": [
                577
            ],
            "triggers": [
                353
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
                577
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
                577
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                577
            ],
            "visibility": [
                392
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
                588
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
                590
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
                577
            ],
            "update": [
                592
            ],
            "__typename": [
                4
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                147
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
                150
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
                577
            ],
            "availabilityType": [
                177
            ],
            "engineComponentKey": [
                270
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                577
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                577
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                353
            ],
            "description": [
                4
            ],
            "formula": [
                353
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
                353
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                577
            ],
            "options": [
                353
            ],
            "settings": [
                353
            ],
            "translations": [
                404
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
                577
            ],
            "update": [
                597
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
                323
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                323
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
                577
            ],
            "update": [
                602
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                353
            ],
            "databaseEventTriggerSettings": [
                353
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                353
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
                353
            ],
            "workflowActionTriggerSettings": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                577
            ],
            "update": [
                604
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                577
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
                186
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
                577
            ],
            "update": [
                606
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                387
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
                394
            ],
            "visibility": [
                392
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                577
            ],
            "update": [
                608
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
                577
            ],
            "update": [
                608
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
                577
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
                577
            ],
            "parentId": [
                577
            ],
            "position": [
                9
            ],
            "visibleItemLimit": [
                2
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
                577
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
                577
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
                423
            ],
            "shortcut": [
                4
            ],
            "translations": [
                404
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                577
            ],
            "update": [
                595
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                577
            ],
            "update": [
                610
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                577
            ],
            "update": [
                611
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
                577
            ],
            "type": [
                440
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
                439
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
                577
            ],
            "layoutMode": [
                439
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "widgets": [
                619
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "conditionalAvailability": [
                353
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                353
            ],
            "configuration": [
                353
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                577
            ],
            "pageLayoutTabId": [
                577
            ],
            "position": [
                353
            ],
            "title": [
                4
            ],
            "type": [
                720
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "conditionalAvailability": [
                353
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                353
            ],
            "configuration": [
                353
            ],
            "id": [
                577
            ],
            "objectMetadataId": [
                577
            ],
            "pageLayoutTabId": [
                577
            ],
            "position": [
                353
            ],
            "title": [
                4
            ],
            "type": [
                720
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
                577
            ],
            "tabs": [
                617
            ],
            "type": [
                440
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRelatedRecordPathInput": {
            "id": [
                577
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
                577
            ],
            "update": [
                623
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
                577
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
                551
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
                577
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                404
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                577
            ],
            "payload": [
                221
            ],
            "__typename": [
                4
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                577
            ],
            "update": [
                630
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
                577
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
                577
            ],
            "update": [
                632
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
                577
            ],
            "update": [
                634
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
                703
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                577
            ],
            "logicalOperator": [
                708
            ],
            "parentViewFilterGroupId": [
                577
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                577
            ],
            "update": [
                637
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                577
            ],
            "operand": [
                709
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "value": [
                353
            ],
            "viewFilterGroupId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                577
            ],
            "update": [
                639
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                577
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
                577
            ],
            "calendarFieldMetadataId": [
                577
            ],
            "calendarLayout": [
                694
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "kanbanColumnWidth": [
                2
            ],
            "listPinnedFieldMetadataId": [
                577
            ],
            "mainGroupByFieldMetadataId": [
                577
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                712
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
                404
            ],
            "type": [
                716
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                577
            ],
            "update": [
                642
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                715
            ],
            "relationTargetFieldMetadataId": [
                577
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
                577
            ],
            "update": [
                644
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
                577
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
                353
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                577
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
                731
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                353
            ],
            "workspaceMemberId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                301
            ],
            "roleId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                577
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                651
            ],
            "id": [
                577
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
                651
            ],
            "groups": [
                652
            ],
            "widgetId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                425
            ],
            "roleId": [
                577
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                577
            ],
            "roleId": [
                577
            ],
            "rules": [
                498
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                494
            ],
            "predicates": [
                493
            ],
            "rules": [
                497
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                662
            ],
            "viewFields": [
                659
            ],
            "viewFilterGroups": [
                660
            ],
            "viewFilters": [
                661
            ],
            "viewSorts": [
                663
            ],
            "widgetId": [
                577
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
                577
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                577
            ],
            "logicalOperator": [
                708
            ],
            "parentViewFilterGroupId": [
                577
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
                577
            ],
            "id": [
                577
            ],
            "operand": [
                709
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "value": [
                353
            ],
            "viewFilterGroupId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                577
            ],
            "calendarFieldMetadataId": [
                577
            ],
            "calendarLayout": [
                694
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                577
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                577
            ],
            "openRecordIn": [
                712
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                716
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                715
            ],
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
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
                234
            ],
            "periodStart": [
                234
            ],
            "timeSeries": [
                678
            ],
            "usageByApplication": [
                667
            ],
            "usageByModel": [
                667
            ],
            "usageByOperationType": [
                667
            ],
            "usageByUser": [
                667
            ],
            "userDailyUsage": [
                680
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                670
            ],
            "periodEnd": [
                234
            ],
            "periodStart": [
                234
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
                121
            ],
            "createdAt": [
                234
            ],
            "id": [
                577
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                121
            ],
            "operationType": [
                670
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                677
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                679
            ],
            "updatedAt": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                679
            ],
            "operationType": [
                670
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                669
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                673
            ],
            "resourceType": [
                677
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                671
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
                670
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                679
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                121
            ],
            "periodEnd": [
                234
            ],
            "periodStart": [
                234
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                670
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                677
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                679
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                121
            ],
            "id": [
                577
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                121
            ],
            "operationType": [
                670
            ],
            "periodEnd": [
                234
            ],
            "periodStart": [
                234
            ],
            "periodUnit": [
                4
            ],
            "remainingValue": [
                121
            ],
            "resourceType": [
                677
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
                679
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
                678
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
                112
            ],
            "canAccessFullAdminPanel": [
                1
            ],
            "canImpersonate": [
                1
            ],
            "createdAt": [
                234
            ],
            "currentUserWorkspace": [
                685
            ],
            "currentWorkspace": [
                725
            ],
            "deletedAt": [
                234
            ],
            "deletedWorkspaceMembers": [
                247
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
                577
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
                432
            ],
            "previousOnboardingStatus": [
                432
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                234
            ],
            "userVars": [
                354
            ],
            "userWorkspaces": [
                685
            ],
            "workspaceMember": [
                735
            ],
            "workspaceMembers": [
                735
            ],
            "workspaces": [
                685
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
                353
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
                234
            ],
            "expiresAt": [
                234
            ],
            "id": [
                577
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
                234
            ],
            "region": [
                4
            ],
            "userAgent": [
                4
            ],
            "workspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                234
            ],
            "deletedAt": [
                234
            ],
            "id": [
                577
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
                431
            ],
            "permissionFlags": [
                449
            ],
            "twoFactorAuthenticationMethodSummary": [
                573
            ],
            "updatedAt": [
                234
            ],
            "user": [
                681
            ],
            "userId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                577
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
                577
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
                577
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
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
                106
            ],
            "workspaceUrls": [
                744
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
                577
            ],
            "calendarEndFieldMetadataId": [
                577
            ],
            "calendarFieldMetadataId": [
                577
            ],
            "calendarLayout": [
                694
            ],
            "createdAt": [
                234
            ],
            "createdByUserWorkspaceId": [
                577
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                577
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
                577
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                711
            ],
            "listPinnedFieldMetadataId": [
                577
            ],
            "mainGroupByFieldMetadataId": [
                577
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                577
            ],
            "openRecordIn": [
                712
            ],
            "position": [
                9
            ],
            "presetFilter": [
                713
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                716
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "viewFieldGroups": [
                697
            ],
            "viewFields": [
                696
            ],
            "viewFilterGroups": [
                707
            ],
            "viewFilters": [
                706
            ],
            "viewGroups": [
                710
            ],
            "viewSorts": [
                714
            ],
            "workspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                719
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
                577
            ],
            "createdAt": [
                234
            ],
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
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
                698
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "size": [
                9
            ],
            "universalIdentifier": [
                577
            ],
            "updatedAt": [
                234
            ],
            "viewFieldGroupId": [
                577
            ],
            "viewId": [
                577
            ],
            "workspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                234
            ],
            "id": [
                577
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
                234
            ],
            "viewFields": [
                696
            ],
            "viewId": [
                577
            ],
            "workspaceId": [
                577
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
                700
            ],
            "filters": [
                699
            ],
            "limit": [
                2
            ],
            "sorts": [
                704
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilter": {
            "fieldMetadataId": [
                577
            ],
            "filterGroupId": [
                577
            ],
            "id": [
                577
            ],
            "operand": [
                709
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "value": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroup": {
            "id": [
                577
            ],
            "logicalOperator": [
                708
            ],
            "parentFilterGroupId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroupInput": {
            "id": [
                577
            ],
            "logicalOperator": [
                708
            ],
            "parentFilterGroupId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterInput": {
            "fieldMetadataId": [
                577
            ],
            "filterGroupId": [
                577
            ],
            "id": [
                577
            ],
            "operand": [
                709
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "value": [
                353
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
                701
            ],
            "filters": [
                702
            ],
            "limit": [
                2
            ],
            "sorts": [
                705
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeSort": {
            "direction": [
                715
            ],
            "fieldMetadataId": [
                577
            ],
            "relationTargetFieldMetadataId": [
                577
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
                715
            ],
            "fieldMetadataId": [
                577
            ],
            "relationTargetFieldMetadataId": [
                577
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
                234
            ],
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "operand": [
                709
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                234
            ],
            "value": [
                353
            ],
            "viewFilterGroupId": [
                577
            ],
            "viewId": [
                577
            ],
            "workspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                234
            ],
            "id": [
                577
            ],
            "logicalOperator": [
                708
            ],
            "parentViewFilterGroupId": [
                577
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                234
            ],
            "viewId": [
                577
            ],
            "workspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                234
            ],
            "fieldValue": [
                4
            ],
            "id": [
                577
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "updatedAt": [
                234
            ],
            "viewId": [
                577
            ],
            "workspaceId": [
                577
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
                234
            ],
            "direction": [
                715
            ],
            "fieldMetadataId": [
                577
            ],
            "id": [
                577
            ],
            "relationTargetFieldMetadataId": [
                577
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                234
            ],
            "viewId": [
                577
            ],
            "workspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ViewSortDirection": {},
        "ViewType": {},
        "Webhook": {
            "applicationId": [
                577
            ],
            "createdAt": [
                234
            ],
            "deletedAt": [
                234
            ],
            "description": [
                4
            ],
            "id": [
                577
            ],
            "operations": [
                4
            ],
            "role": [
                490
            ],
            "secret": [
                4
            ],
            "targetUrl": [
                4
            ],
            "updatedAt": [
                234
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
                115
            ],
            "on_CalendarConfiguration": [
                151
            ],
            "on_CallRecordingSummaryConfiguration": [
                155
            ],
            "on_CallRecordingTranscriptConfiguration": [
                156
            ],
            "on_ChatConfiguration": [
                164
            ],
            "on_ChatThreadsConfiguration": [
                167
            ],
            "on_EmailThreadConfiguration": [
                263
            ],
            "on_EmailsConfiguration": [
                267
            ],
            "on_FieldConfiguration": [
                294
            ],
            "on_FieldRichTextConfiguration": [
                302
            ],
            "on_FieldsConfiguration": [
                303
            ],
            "on_FilesConfiguration": [
                309
            ],
            "on_FormFieldConfiguration": [
                312
            ],
            "on_FrontComponentConfiguration": [
                314
            ],
            "on_IframeConfiguration": [
                334
            ],
            "on_LineChartConfiguration": [
                357
            ],
            "on_MessageCampaignBodyConfiguration": [
                383
            ],
            "on_MessageCampaignDetailsConfiguration": [
                384
            ],
            "on_NotesConfiguration": [
                415
            ],
            "on_PieChartConfiguration": [
                450
            ],
            "on_RecordTableConfiguration": [
                480
            ],
            "on_StandaloneRichTextConfiguration": [
                539
            ],
            "on_TasksConfiguration": [
                552
            ],
            "on_TimelineConfiguration": [
                556
            ],
            "on_ViewConfiguration": [
                695
            ],
            "on_WorkflowConfiguration": [
                722
            ],
            "on_WorkflowRunConfiguration": [
                723
            ],
            "on_WorkflowVersionConfiguration": [
                724
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
                719
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                726
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
                353
            ],
            "allowImpersonation": [
                1
            ],
            "allowedEmbeddingOrigins": [
                4
            ],
            "billingCustomer": [
                123
            ],
            "billingEntitlements": [
                125
            ],
            "billingSubscriptions": [
                138
            ],
            "createdAt": [
                234
            ],
            "currentBillingSubscription": [
                138
            ],
            "customDomain": [
                4
            ],
            "databaseSchema": [
                4
            ],
            "defaultRole": [
                490
            ],
            "deletedAt": [
                234
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
                291
            ],
            "hasValidEnterpriseValidityToken": [
                1
            ],
            "hasValidSignedEnterpriseKey": [
                1
            ],
            "id": [
                577
            ],
            "iframeMediaPermissions": [
                335
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
                577
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
                234
            ],
            "viewFields": [
                696
            ],
            "viewFilterGroups": [
                707
            ],
            "viewFilters": [
                706
            ],
            "viewGroups": [
                710
            ],
            "viewSorts": [
                714
            ],
            "views": [
                693
            ],
            "workspaceCustomApplication": [
                59
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                731
            ],
            "workspaceMembersCount": [
                9
            ],
            "workspaceUrls": [
                744
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
                353
            ],
            "outcome": [
                728
            ],
            "personEnrichment": [
                353
            ],
            "personOutcome": [
                742
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
                577
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
                234
            ],
            "id": [
                577
            ],
            "roleId": [
                577
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
                737
            ],
            "id": [
                577
            ],
            "locale": [
                4
            ],
            "name": [
                316
            ],
            "numberFormat": [
                738
            ],
            "openRecordIn": [
                435
            ],
            "roles": [
                490
            ],
            "timeFormat": [
                739
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
                577
            ],
            "userWorkspaceId": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                577
            ],
            "variables": [
                682
            ],
            "workspaceMemberId": [
                577
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
                353
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
                577
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
                577
            ],
            "workspaceUrls": [
                744
            ],
            "__typename": [
                4
            ]
        }
    }
}