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
        269,
        281,
        287,
        291,
        295,
        298,
        305,
        322,
        324,
        330,
        332,
        345,
        352,
        353,
        354,
        366,
        368,
        386,
        387,
        388,
        389,
        390,
        391,
        393,
        394,
        395,
        398,
        399,
        401,
        404,
        409,
        413,
        422,
        429,
        431,
        434,
        438,
        439,
        444,
        448,
        472,
        474,
        475,
        483,
        494,
        495,
        504,
        509,
        531,
        545,
        546,
        548,
        550,
        576,
        578,
        580,
        648,
        669,
        676,
        678,
        682,
        693,
        707,
        708,
        710,
        711,
        712,
        714,
        715,
        718,
        719,
        720,
        725,
        727,
        730,
        736,
        737,
        738,
        741,
        742
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
                576
            ],
            "workspaceMemberIds": [
                576
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
                352
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
                576
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
                576
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
                352
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
                352
            ],
            "roleId": [
                576
            ],
            "triggers": [
                352
            ],
            "universalIdentifier": [
                576
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
                576
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
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
                576
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
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                352
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
                576
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
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                576
            ],
            "createdAt": [
                233
            ],
            "id": [
                576
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
                576
            ],
            "senderWorkspaceMemberId": [
                576
            ],
            "status": [
                4
            ],
            "threadId": [
                576
            ],
            "turnId": [
                576
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
                576
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                576
            ],
            "messageId": [
                576
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                352
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
                352
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                352
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
                576
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                576
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
                576
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
                576
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
                576
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
                576
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
                576
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
                576
            ],
            "aggregateOperation": [
                33
            ],
            "configurationType": [
                718
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                352
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
                467
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
                576
            ],
            "name": [
                4
            ],
            "revokedAt": [
                233
            ],
            "role": [
                489
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
                576
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
                352
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                576
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
                576
            ],
            "role": [
                395
            ],
            "workspaceMemberId": [
                576
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
                576
            ],
            "applicationVariables": [
                99
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                352
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
                489
            ],
            "defaultRoleId": [
                4
            ],
            "description": [
                4
            ],
            "frontComponents": [
                312
            ],
            "grantRoleId": [
                576
            ],
            "grantedIframeMediaPermissions": [
                334
            ],
            "healthCheckLogicFunctionId": [
                576
            ],
            "id": [
                576
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                365
            ],
            "logoFileId": [
                576
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                415
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                576
            ],
            "requestedIframeMediaPermissions": [
                334
            ],
            "requestedRoleId": [
                576
            ],
            "runHealthCheckOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                576
            ],
            "settingsMenuItems": [
                530
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                576
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
                576
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
                576
            ],
            "workspaceId": [
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                576
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
                463
            ],
            "connectionProviderId": [
                576
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
                576
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
                576
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
                576
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
                576
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
                352
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
                576
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
                305
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
                305
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
                305
            ],
            "fileId": [
                576
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
                576
            ],
            "connectionProviders": [
                69
            ],
            "settingsMenuItems": [
                530
            ],
            "variables": [
                681
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
                576
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
                576
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
                691
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                576
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
                576
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
                352
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
                576
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
                352
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
                576
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
                576
            ],
            "workspaceMemberIds": [
                576
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
                508
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
                576
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
                507
            ],
            "workspaceUrls": [
                743
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
                576
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
                718
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
                352
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
                429
            ],
            "primaryAxisGroupByFieldMetadataId": [
                576
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                330
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                429
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                576
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                330
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
                352
            ],
            "formattedToRawLookup": [
                352
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
                352
            ],
            "objectMetadataId": [
                576
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
                576
            ],
            "stripeCustomerEmail": [
                4
            ],
            "userCreditsFallback": [
                682
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
                546
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
                545
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
                576
            ],
            "interval": [
                545
            ],
            "metadata": [
                352
            ],
            "phases": [
                140
            ],
            "status": [
                546
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
                132
            ],
            "creditAmount": [
                9
            ],
            "hasReachedCurrentPeriodCap": [
                1
            ],
            "id": [
                576
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
                576
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
                576
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
                718
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
                718
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                718
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
                718
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                352
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
                718
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
                409
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                411
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
                461
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                528
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                547
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
                576
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                576
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
                576
            ],
            "createdAt": [
                233
            ],
            "engineComponentKey": [
                269
            ],
            "frontComponent": [
                312
            ],
            "frontComponentId": [
                576
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "pageLayoutId": [
                576
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
                576
            ],
            "updatedAt": [
                233
            ],
            "workflowVersionId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                421
            ],
            "on_PathCommandMenuItemPayload": [
                446
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
                303
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
                576
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                576
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
                463
            ],
            "connectionProviderId": [
                576
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
                576
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
                576
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
                337
            ],
            "handle": [
                4
            ],
            "id": [
                576
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                576
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
                576
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
                352
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
                352
            ],
            "roleId": [
                576
            ],
            "triggers": [
                352
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                576
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                576
            ],
            "participantHandleFieldUniversalIdentifier": [
                576
            ],
            "visibility": [
                391
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
                576
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
                576
            ],
            "engineComponentKey": [
                269
            ],
            "frontComponentId": [
                576
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
                576
            ],
            "pageLayoutId": [
                576
            ],
            "payload": [
                352
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                576
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
                385
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
                352
            ],
            "description": [
                4
            ],
            "formula": [
                352
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
                352
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                576
            ],
            "options": [
                352
            ],
            "relationCreationPayload": [
                352
            ],
            "settings": [
                352
            ],
            "type": [
                298
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
                576
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
                576
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
                345
            ],
            "objectMetadataId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                352
            ],
            "databaseEventTriggerSettings": [
                352
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                352
            ],
            "id": [
                576
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                352
            ],
            "source": [
                352
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                352
            ],
            "universalIdentifier": [
                576
            ],
            "workflowActionTriggerSettings": [
                352
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                576
            ],
            "id": [
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                576
            ],
            "agentId": [
                576
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "folderId": [
                576
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "parentId": [
                576
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                576
            ],
            "targetRecordId": [
                576
            ],
            "type": [
                413
            ],
            "userWorkspaceId": [
                576
            ],
            "viewId": [
                576
            ],
            "visibleItemLimit": [
                2
            ],
            "workflowId": [
                576
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
                352
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
                576
            ],
            "type": [
                439
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                438
            ],
            "pageLayoutId": [
                576
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
                352
            ],
            "configuration": [
                352
            ],
            "objectMetadataId": [
                576
            ],
            "pageLayoutTabId": [
                576
            ],
            "position": [
                352
            ],
            "title": [
                4
            ],
            "type": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                576
            ],
            "filter": [
                352
            ],
            "objectMetadataId": [
                576
            ],
            "orderBy": [
                352
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                576
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                576
            ],
            "secondFieldMetadataId": [
                576
            ],
            "thirdFieldMetadataId": [
                576
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
                576
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
                580
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
                669
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                676
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                678
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
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                576
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
                576
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
                576
            ],
            "id": [
                576
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
                702
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                576
            ],
            "viewId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                576
            ],
            "logicalOperator": [
                707
            ],
            "parentViewFilterGroupId": [
                576
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                576
            ],
            "id": [
                576
            ],
            "operand": [
                708
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "value": [
                352
            ],
            "viewFilterGroupId": [
                576
            ],
            "viewId": [
                576
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
                576
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewId": [
                576
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
                576
            ],
            "calendarFieldMetadataId": [
                576
            ],
            "calendarLayout": [
                693
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                710
            ],
            "listPinnedFieldMetadataId": [
                576
            ],
            "mainGroupByFieldMetadataId": [
                576
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                576
            ],
            "openRecordIn": [
                711
            ],
            "position": [
                9
            ],
            "presetFilter": [
                712
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                714
            ],
            "fieldMetadataId": [
                576
            ],
            "id": [
                576
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                576
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
                576
            ],
            "operations": [
                4
            ],
            "roleId": [
                576
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
                669
            ],
            "resource": [
                676
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                576
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
                576
            ],
            "name": [
                315
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                576
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
                576
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
                576
            ],
            "pageLayoutId": [
                576
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
                576
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
                576
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                509
            ],
            "type": [
                332
            ],
            "__typename": [
                4
            ]
        },
        "EditSsoInput": {
            "id": [
                576
            ],
            "status": [
                509
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
                718
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
                576
            ],
            "status": [
                264
            ],
            "tenantStatus": [
                265
            ],
            "unsubscribeHostnameStatus": [
                578
            ],
            "updatedAt": [
                233
            ],
            "verificationRecords": [
                688
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
                718
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
                352
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
                352
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
                352
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
                271
            ],
            "limiter": [
                274
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                352
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
                276
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
                281
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
                279
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                280
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
                282
            ],
            "first": [
                2
            ],
            "table": [
                287
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                283
            ],
            "records": [
                286
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
                352
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
                400
            ],
            "objectRecordEventsWithQueryIds": [
                428
            ],
            "queueJobEvents": [
                355
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                576
            ],
            "payload": [
                352
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                291
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
                576
            ],
            "createdAt": [
                233
            ],
            "defaultValue": [
                352
            ],
            "description": [
                4
            ],
            "disabledFieldPermissionActions": [
                4
            ],
            "formula": [
                352
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "morphRelations": [
                482
            ],
            "name": [
                4
            ],
            "object": [
                415
            ],
            "objectMetadataId": [
                576
            ],
            "options": [
                352
            ],
            "relation": [
                482
            ],
            "settings": [
                352
            ],
            "type": [
                298
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
                718
            ],
            "fieldDisplayMode": [
                295
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
                296
            ],
            "pageInfo": [
                435
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
                292
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                297
            ],
            "id": [
                577
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
                577
            ],
            "or": [
                297
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
                576
            ],
            "id": [
                576
            ],
            "objectMetadataId": [
                576
            ],
            "roleId": [
                576
            ],
            "rowLevelPermissionPredicateGroupId": [
                576
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
                576
            ],
            "objectMetadataId": [
                576
            ],
            "rowLevelPermissionPredicateGroupId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                718
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                718
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
                576
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
                576
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
                576
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
                576
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
                718
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                576
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                509
            ],
            "type": [
                332
            ],
            "workspace": [
                740
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
                398
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                718
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
                334
            ],
            "applicationId": [
                576
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                98
            ],
            "applicationVariables": [
                352
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
                576
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
                576
            ],
            "updatedAt": [
                233
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                314
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                718
            ],
            "frontComponentId": [
                576
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                576
            ],
            "pageLayoutType": [
                439
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
                503
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                352
            ],
            "runId": [
                576
            ],
            "scope": [
                352
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
                352
            ],
            "runId": [
                576
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
                576
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
                576
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
                576
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
                322
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                322
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                323
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                322
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
                324
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
                327
            ],
            "stepActionKey": [
                322
            ],
            "trigger": [
                328
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
                720
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
                576
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
                718
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
                338
            ],
            "IMAP": [
                338
            ],
            "SMTP": [
                338
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
                744
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
                576
            ],
            "threadId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                576
            ],
            "createdAt": [
                233
            ],
            "id": [
                576
            ],
            "indexFieldMetadataList": [
                343
            ],
            "indexType": [
                345
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
                341
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
                576
            ],
            "id": [
                576
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
                344
            ],
            "id": [
                577
            ],
            "isCustom": [
                144
            ],
            "or": [
                344
            ],
            "__typename": [
                4
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                576
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
                348
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
                576
            ],
            "messageThreadId": [
                576
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
                354
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                576
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
                718
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
                352
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
                429
            ],
            "primaryAxisGroupByFieldMetadataId": [
                576
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                330
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                429
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                576
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                330
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
                352
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                360
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
                352
            ],
            "objectMetadataId": [
                576
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
                359
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                576
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
                576
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                233
            ],
            "cronTriggerSettings": [
                352
            ],
            "databaseEventTriggerSettings": [
                352
            ],
            "description": [
                4
            ],
            "executionMode": [
                366
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                352
            ],
            "id": [
                576
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
                352
            ],
            "universalIdentifier": [
                576
            ],
            "updatedAt": [
                233
            ],
            "workflowActionTriggerSettings": [
                352
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                352
            ],
            "duration": [
                9
            ],
            "error": [
                352
            ],
            "logs": [
                4
            ],
            "status": [
                368
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                576
            ],
            "applicationUniversalIdentifier": [
                576
            ],
            "id": [
                576
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                576
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
                576
            ],
            "messageThreadId": [
                576
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
                352
            ],
            "name": [
                4
            ],
            "objects": [
                376
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                334
            ],
            "roles": [
                377
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
                378
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                379
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
                576
            ],
            "connectionProviderId": [
                576
            ],
            "createdAt": [
                233
            ],
            "id": [
                576
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
                381
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
                352
            ],
            "description": [
                4
            ],
            "inputSchema": [
                352
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
                718
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                718
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
                180
            ],
            "connectedAccountId": [
                576
            ],
            "contactAutoCreationPolicy": [
                386
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
                576
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
                393
            ],
            "messagingProviderUniversalIdentifier": [
                576
            ],
            "participantHandleFieldUniversalIdentifier": [
                576
            ],
            "pendingGroupEmailsAction": [
                387
            ],
            "syncStage": [
                388
            ],
            "syncStageStartedAt": [
                233
            ],
            "syncStatus": [
                389
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
                390
            ],
            "updatedAt": [
                233
            ],
            "visibility": [
                391
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
                576
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                576
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                394
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
                576
            ],
            "reason": [
                398
            ],
            "source": [
                399
            ],
            "unsubscribeTopicId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                396
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
                427
            ],
            "recordId": [
                4
            ],
            "type": [
                401
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
                576
            ],
            "property": [
                4
            ],
            "provenance": [
                404
            ],
            "recordId": [
                576
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
                576
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                576
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
                407
            ],
            "views": [
                408
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
                576
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
            "icon": [
                4
            ],
            "id": [
                576
            ],
            "isActive": [
                1
            ],
            "isPrivate": [
                1
            ],
            "key": [
                710
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                576
            ],
            "position": [
                9
            ],
            "type": [
                715
            ],
            "universalIdentifier": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                537,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                724,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                576,
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
                        576,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        335,
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
                        576
                    ],
                    "threadId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        576,
                        "UUID!"
                    ],
                    "roleId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        576,
                        "UUID!"
                    ],
                    "roleId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                1,
                {
                    "input": [
                        340,
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
                        545,
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
                        576,
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
                        576,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeFileUpload": [
                307,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                307,
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
                307,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                307,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "connectApplicationWithApiKey": [
                576,
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
                385,
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
                        576
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
                306,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        305,
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
                312,
                {
                    "input": [
                        201,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                412,
                {
                    "inputs": [
                        207,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                696,
                {
                    "inputs": [
                        222,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                695,
                {
                    "inputs": [
                        223,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                709,
                {
                    "inputs": [
                        226,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                380,
                {
                    "input": [
                        205,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                396,
                {
                    "input": [
                        206,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                412,
                {
                    "input": [
                        207,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                306,
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
                534,
                {
                    "input": [
                        532,
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
                        576,
                        "UUID!"
                    ],
                    "properties": [
                        352
                    ],
                    "recordId": [
                        576,
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
                292,
                {
                    "input": [
                        209,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                341,
                {
                    "input": [
                        210,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                365,
                {
                    "input": [
                        204,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                415,
                {
                    "input": [
                        211,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                489,
                {
                    "createRoleInput": [
                        217,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                436,
                {
                    "input": [
                        212,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                437,
                {
                    "input": [
                        213,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                440,
                {
                    "input": [
                        214,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                460,
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
                481,
                {
                    "input": [
                        216,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                534,
                {
                    "input": [
                        533,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                537,
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
                        545,
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
                579,
                {
                    "input": [
                        219,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                667,
                {
                    "input": [
                        220,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                687,
                {
                    "input": [
                        221,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                692,
                {
                    "input": [
                        227,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                695,
                {
                    "input": [
                        223,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                696,
                {
                    "input": [
                        222,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                705,
                {
                    "input": [
                        225,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                706,
                {
                    "input": [
                        224,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                709,
                {
                    "input": [
                        226,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                713,
                {
                    "input": [
                        228,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                716,
                {
                    "input": [
                        229,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                537,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        576,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        576
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
                385,
                {
                    "id": [
                        576,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                180,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                724
            ],
            "deleteEmailGroupChannel": [
                385,
                {
                    "id": [
                        576,
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
                312,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                412,
                {
                    "ids": [
                        576,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                380,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                412,
                {
                    "id": [
                        576,
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
                292,
                {
                    "input": [
                        235,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                341,
                {
                    "input": [
                        236,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                365,
                {
                    "input": [
                        369,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                415,
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
                        576,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                481,
                {
                    "id": [
                        576,
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
                537,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                240,
                {
                    "twoFactorAuthenticationMethodId": [
                        576,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                680
            ],
            "deleteUserFromWorkspace": [
                684,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                687,
                {
                    "id": [
                        576,
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
                695,
                {
                    "input": [
                        242,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                696,
                {
                    "input": [
                        241,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                705,
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
                709,
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
                716,
                {
                    "id": [
                        576,
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
                695,
                {
                    "input": [
                        248,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                696,
                {
                    "input": [
                        247,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                705,
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
                709,
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
                        340,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                180,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                255,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                256,
                {
                    "id": [
                        576,
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
                        576
                    ]
                }
            ],
            "emitAppEvent": [
                268,
                {
                    "input": [
                        267,
                        "EmitAppEventInput!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                123
            ],
            "enqueueJob": [
                272,
                {
                    "input": [
                        270,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                275,
                {
                    "input": [
                        273,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                728
            ],
            "executeOneLogicFunction": [
                367,
                {
                    "input": [
                        289,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                317,
                {
                    "input": [
                        316,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                51,
                {
                    "apiKeyId": [
                        576,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                105
            ],
            "generateTransientToken": [
                557
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                571,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                573,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        576,
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
                574,
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
                319,
                {
                    "input": [
                        320,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                372,
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
                432
            ],
            "grantApplicationCapabilities": [
                66,
                {
                    "input": [
                        329,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                339,
                {
                    "userId": [
                        576,
                        "UUID!"
                    ],
                    "workspaceId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                347,
                {
                    "input": [
                        346,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                349,
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
                349
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        373,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        576
                    ],
                    "threadId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                576,
                {
                    "workspaceMemberId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                325,
                {
                    "stepActionKey": [
                        322,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                277
            ],
            "removeAgentChatMessageReaction": [
                26,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        484,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                476,
                {
                    "principal": [
                        473,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        480,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        576,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        485,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                486,
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
                524,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                436,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                440,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                552,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                516,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        576,
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
                        487,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                491,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                505,
                {
                    "input": [
                        501,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                336,
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
                        576
                    ]
                }
            ],
            "sendAppChannelMessage": [
                515,
                {
                    "input": [
                        514,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                516,
                {
                    "browsingContext": [
                        352
                    ],
                    "channelId": [
                        576
                    ],
                    "fileAttachments": [
                        304,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        1
                    ],
                    "isAssistantParticipant": [
                        1
                    ],
                    "mentionedWorkspaceMemberIds": [
                        576,
                        "[UUID!]"
                    ],
                    "messageId": [
                        576,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        576,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                519,
                {
                    "input": [
                        518,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                523,
                {
                    "input": [
                        522,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                524,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        576
                    ]
                }
            ],
            "sendMessageCampaign": [
                526,
                {
                    "input": [
                        525,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                521,
                {
                    "input": [
                        527,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                53,
                {
                    "input": [
                        529,
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
                277,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                476,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        480,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                476,
                {
                    "accessLevel": [
                        472,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        473,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        480,
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
                535,
                {
                    "input": [
                        536
                    ]
                }
            ],
            "signUpInWorkspace": [
                535,
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
                        576
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
                433,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "startAppChannelConversation": [
                515,
                {
                    "input": [
                        539,
                        "StartAppChannelConversationInput!"
                    ]
                }
            ],
            "startChannelSync": [
                161,
                {
                    "connectedAccountId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                540,
                {
                    "companyContext": [
                        352
                    ],
                    "personContext": [
                        352
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        541,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                542
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
                392,
                {
                    "input": [
                        549,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                739,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        352,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                380,
                {
                    "id": [
                        576,
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
                        352
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
                559,
                {
                    "input": [
                        558,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                563,
                {
                    "input": [
                        560,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                562,
                {
                    "input": [
                        561,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                567,
                {
                    "input": [
                        564,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                566,
                {
                    "input": [
                        565,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                569,
                {
                    "input": [
                        568,
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
                        576,
                        "UUID!"
                    ],
                    "input": [
                        581,
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
                        576,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                49,
                {
                    "input": [
                        583,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                385,
                {
                    "input": [
                        584,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                59,
                {
                    "id": [
                        576,
                        "UUID!"
                    ],
                    "input": [
                        585,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                93,
                {
                    "input": [
                        586,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                97,
                {
                    "input": [
                        588,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                145,
                {
                    "input": [
                        590,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                175,
                {
                    "input": [
                        592,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                385,
                {
                    "input": [
                        593,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                312,
                {
                    "input": [
                        595,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                321,
                {
                    "input": [
                        597,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateInboxNotificationSettings": [
                684,
                {
                    "input": [
                        598,
                        "UpdateInboxNotificationSettingsInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                290,
                {
                    "input": [
                        599,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                412,
                {
                    "inputs": [
                        612,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                415,
                {
                    "inputs": [
                        613,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                709,
                {
                    "inputs": [
                        637,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                380,
                {
                    "input": [
                        602,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                385,
                {
                    "input": [
                        604,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                392,
                {
                    "input": [
                        606,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                392,
                {
                    "input": [
                        608,
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
                412,
                {
                    "input": [
                        612,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                7,
                {
                    "input": [
                        582,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        576
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
                292,
                {
                    "input": [
                        611,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        600,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                415,
                {
                    "input": [
                        613,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                489,
                {
                    "updateRoleInput": [
                        621,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                436,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        614,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        615,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                440,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        617,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                436,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        619,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                350,
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
                481,
                {
                    "input": [
                        620,
                        "UpdateRelatedRecordPathInput!"
                    ]
                }
            ],
            "updateSkill": [
                537,
                {
                    "input": [
                        623,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTabPresence": [
                1,
                {
                    "input": [
                        624,
                        "UpdateTabPresenceInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                552,
                {
                    "input": [
                        625,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                579,
                {
                    "input": [
                        626,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                667,
                {
                    "input": [
                        627,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                122,
                {
                    "userCreditsFallback": [
                        682,
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
                687,
                {
                    "input": [
                        628,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                692,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        639,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                695,
                {
                    "input": [
                        632,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                696,
                {
                    "input": [
                        630,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                705,
                {
                    "input": [
                        635,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                706,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        634,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                709,
                {
                    "input": [
                        637,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                713,
                {
                    "input": [
                        640,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                716,
                {
                    "input": [
                        642,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                724,
                {
                    "data": [
                        646,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                724,
                {
                    "data": [
                        644,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                724,
                {
                    "data": [
                        645,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                734,
                {
                    "roleId": [
                        576,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        647,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                93,
                {
                    "file": [
                        648,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                303,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        648,
                        "Upload!"
                    ],
                    "fileFolder": [
                        305,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                307,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        648,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                307,
                {
                    "file": [
                        648,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                307,
                {
                    "file": [
                        648,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                307,
                {
                    "file": [
                        648,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                299,
                {
                    "upsertFieldPermissionsInput": [
                        649,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                692,
                {
                    "input": [
                        652,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                423,
                {
                    "upsertObjectPermissionsInput": [
                        653,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                490,
                {
                    "upsertPermissionFlagsInput": [
                        654,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                656,
                {
                    "input": [
                        655,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                692,
                {
                    "input": [
                        657,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "upsertWebPushSubscription": [
                1,
                {
                    "input": [
                        663,
                        "UpsertWebPushSubscriptionInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                101,
                {
                    "input": [
                        685,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                689,
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
                690,
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
                576
            ],
            "agentId": [
                576
            ],
            "applicationId": [
                576
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
                576
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "parentId": [
                576
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                576
            ],
            "targetRecordId": [
                576
            ],
            "targetRecordIdentifier": [
                469
            ],
            "type": [
                413
            ],
            "universalIdentifier": [
                576
            ],
            "updatedAt": [
                233
            ],
            "userWorkspaceId": [
                576
            ],
            "viewId": [
                576
            ],
            "visibleItemLimit": [
                2
            ],
            "workflowId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                718
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                576
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
                418,
                {
                    "filter": [
                        297,
                        "FieldFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                292
            ],
            "icon": [
                4
            ],
            "id": [
                576
            ],
            "imageIdentifierFieldMetadataId": [
                576
            ],
            "indexMetadataList": [
                341
            ],
            "indexMetadatas": [
                420,
                {
                    "filter": [
                        344,
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
                576
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
                422
            ],
            "searchFieldMetadataList": [
                511
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
                417
            ],
            "pageInfo": [
                435
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
                415
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                296
            ],
            "pageInfo": [
                435
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                419
            ],
            "id": [
                577
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
                419
            ],
            "universalIdentifier": [
                577
            ],
            "__typename": [
                4
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                342
            ],
            "pageInfo": [
                435
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                576
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
                576
            ],
            "restrictedFields": [
                352
            ],
            "rowLevelPermissionPredicateGroups": [
                493
            ],
            "rowLevelPermissionPredicates": [
                492
            ],
            "uneditableFields": [
                576
            ],
            "unreadableFields": [
                576
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
                576
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
                427
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
                352
            ],
            "before": [
                352
            ],
            "diff": [
                352
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
                426
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
                576
            ],
            "restrictedFields": [
                352
            ],
            "rowLevelRecordsPermissions": [
                500
            ],
            "uneditableFields": [
                576
            ],
            "unreadableFields": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                431
            ],
            "previousOnboardingStatus": [
                431
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
                576
            ],
            "createdAt": [
                233
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                576
            ],
            "deletedAt": [
                233
            ],
            "id": [
                576
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
                576
            ],
            "tabs": [
                437
            ],
            "type": [
                439
            ],
            "universalIdentifier": [
                576
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
                576
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
                576
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
                438
            ],
            "pageLayoutId": [
                576
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                576
            ],
            "updatedAt": [
                233
            ],
            "widgets": [
                440
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                334
            ],
            "applicationId": [
                576
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailability": [
                352
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                352
            ],
            "configuration": [
                717
            ],
            "createdAt": [
                233
            ],
            "deletedAt": [
                233
            ],
            "gridPosition": [
                331
            ],
            "id": [
                576
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
                576
            ],
            "pageLayoutTabId": [
                576
            ],
            "position": [
                443
            ],
            "title": [
                4
            ],
            "type": [
                719
            ],
            "universalIdentifier": [
                576
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
                438
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
                438
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
                441
            ],
            "on_PageLayoutWidgetGridPosition": [
                442
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                445
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                444
            ],
            "index": [
                2
            ],
            "layoutMode": [
                438
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
                576
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
                576
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
                576
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
                576
            ],
            "aggregateOperation": [
                33
            ],
            "color": [
                4
            ],
            "configurationType": [
                718
            ],
            "dateGranularity": [
                429
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
                352
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                576
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
                330
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
                452
            ],
            "formattedToRawLookup": [
                352
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
                352
            ],
            "objectMetadataId": [
                576
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
                364
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
                384
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                576
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
                576
            ],
            "handle": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "createdAt": [
                233
            ],
            "domain": [
                4
            ],
            "id": [
                576
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
                291
            ],
            "metadata": [
                462
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
                459
            ],
            "IMAP": [
                459
            ],
            "SMTP": [
                459
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
                576
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                743
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
                576
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
                        576,
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
                        576,
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
                        576,
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
                        318,
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
                        361
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
                385,
                {
                    "filter": [
                        362
                    ]
                }
            ],
            "appMessageFolders": [
                392,
                {
                    "filter": [
                        363
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                67,
                {
                    "applicationId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                69,
                {
                    "applicationId": [
                        576,
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
                510,
                {
                    "applicationId": [
                        576,
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
                458
            ],
            "callRecordingIdForCalendarEvent": [
                576,
                {
                    "calendarEventId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                24,
                {
                    "agentUniversalIdentifier": [
                        576
                    ],
                    "threadId": [
                        576
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
                        576
                    ],
                    "threadId": [
                        576
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
                        576,
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
                733,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                543,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                175
            ],
            "currentUser": [
                680
            ],
            "currentUserApplicationAuthorizations": [
                60
            ],
            "currentUserSessions": [
                683
            ],
            "currentWorkspace": [
                724
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
                278
            ],
            "eventLogs": [
                285,
                {
                    "input": [
                        284,
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
                        576,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                292,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                294,
                {
                    "filter": [
                        297,
                        "FieldFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                457,
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
                355,
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
                365
            ],
            "findManyMarketplaceApps": [
                374,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                460
            ],
            "findMarketplaceAppDetail": [
                375,
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
                        576
                    ],
                    "universalIdentifier": [
                        576
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
                365,
                {
                    "input": [
                        369,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                355,
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
                355,
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
                726
            ],
            "findWorkspaceFromInviteHash": [
                731,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                732
            ],
            "frontComponent": [
                312,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                312
            ],
            "getAddressDetails": [
                453,
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
                489
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
                352,
                {
                    "input": [
                        369,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                182,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                263
            ],
            "getInviteSuggestions": [
                351
            ],
            "getJobs": [
                355,
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
                        369,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                436,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                437,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                437,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                440,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                440,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                436,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        439
                    ]
                }
            ],
            "getPermissionFlags": [
                447
            ],
            "getPublicWorkspaceDataByDomain": [
                464,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                465,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                135
            ],
            "getRole": [
                489,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                489
            ],
            "getSSOIdentityProviders": [
                309
            ],
            "getToolIndex": [
                556
            ],
            "getToolInputSchema": [
                352,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                664,
                {
                    "input": [
                        665
                    ]
                }
            ],
            "getView": [
                692,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                695,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                696,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                696,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                695,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                705,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                706,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                706,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                705,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                709,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                709,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                713,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                713,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                692,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        715,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                729
            ],
            "gettingStartedProgress": [
                321
            ],
            "gettingStartedWorkflowPreviews": [
                326
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
                357,
                {
                    "input": [
                        358,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                129
            ],
            "mcpServer": [
                380,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                380
            ],
            "messageSuppressions": [
                397,
                {
                    "input": [
                        310,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                402,
                {
                    "input": [
                        405,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                406
            ],
            "mostlyEmptyFieldMetadataIds": [
                576,
                {
                    "objectMetadataId": [
                        576,
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
                        576
                    ]
                }
            ],
            "myConnectedAccounts": [
                180
            ],
            "myMessageChannels": [
                385,
                {
                    "connectedAccountId": [
                        576
                    ]
                }
            ],
            "myMessageFolders": [
                392,
                {
                    "messageChannelId": [
                        576
                    ]
                }
            ],
            "myUserApplicationVariables": [
                735
            ],
            "navigationMenuItem": [
                412,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                412
            ],
            "object": [
                415,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                425
            ],
            "objects": [
                416,
                {
                    "filter": [
                        419,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "onlineWorkspaceMemberIds": [
                576
            ],
            "pieChartData": [
                450,
                {
                    "input": [
                        451,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                156,
                {
                    "input": [
                        454,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                456,
                {
                    "input": [
                        455,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                375,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                374
            ],
            "recordPermissions": [
                471,
                {
                    "targets": [
                        480,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                476,
                {
                    "target": [
                        480,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                481
            ],
            "skill": [
                537,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                537
            ],
            "timelineActivityTypes": [
                552
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                570
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                575,
                {
                    "userId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                579
            ],
            "usageLimits": [
                667
            ],
            "usageQuotaDefinitions": [
                671
            ],
            "usageQuotaScopeConsumption": [
                673,
                {
                    "input": [
                        674,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                675
            ],
            "validatePasswordResetToken": [
                686,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                687,
                {
                    "objectMetadataId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                687,
                {
                    "fieldMetadataId": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                716,
                {
                    "id": [
                        576,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                716
            ],
            "workspaceApplicationAuthorizations": [
                60,
                {
                    "applicationId": [
                        576
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
                576
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
                576
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
                576
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
                576
            ],
            "permissions": [
                470
            ],
            "recordId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                576
            ],
            "workspaceMemberId": [
                576
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
                470
            ],
            "roles": [
                478
            ],
            "shares": [
                477
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                472
            ],
            "id": [
                20
            ],
            "principalId": [
                576
            ],
            "principalRoleId": [
                576
            ],
            "principalType": [
                474
            ],
            "rowCause": [
                475
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
                576
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
                718
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
                576
            ],
            "recordId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                576
            ],
            "id": [
                576
            ],
            "isActive": [
                1
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                576
            ],
            "secondFieldMetadataId": [
                576
            ],
            "thirdFieldMetadataId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                292
            ],
            "sourceObjectMetadata": [
                415
            ],
            "targetFieldMetadata": [
                292
            ],
            "targetObjectMetadata": [
                415
            ],
            "type": [
                483
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
                576
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
                576
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
                299
            ],
            "icon": [
                4
            ],
            "id": [
                576
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                423
            ],
            "permissionFlags": [
                490
            ],
            "rowLevelPermissionFieldPermissions": [
                299
            ],
            "rowLevelPermissionPredicateGroups": [
                493
            ],
            "rowLevelPermissionPredicates": [
                492
            ],
            "rowLevelPermissionRules": [
                496
            ],
            "universalIdentifier": [
                576
            ],
            "workspaceMembers": [
                734
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
                576
            ],
            "roleId": [
                576
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
                495
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
                352
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
                494
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
                576
            ],
            "objectMetadataId": [
                576
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
                576
            ],
            "predicateGroups": [
                498
            ],
            "predicates": [
                499
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                576
            ],
            "logicalOperator": [
                494
            ],
            "position": [
                9
            ],
            "predicateGroups": [
                498
            ],
            "predicates": [
                499
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                576
            ],
            "id": [
                576
            ],
            "operand": [
                495
            ],
            "position": [
                9
            ],
            "relationFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "value": [
                352
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
                576
            ],
            "workspaceMemberRelationFilterFieldMetadataId": [
                576
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
                493
            ],
            "predicates": [
                492
            ],
            "ruleId": [
                576
            ],
            "uneditableFields": [
                576
            ],
            "unreadableFields": [
                576
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
                503
            ],
            "messages": [
                503
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                352
            ],
            "runAsWorkspaceMemberId": [
                576
            ],
            "thread": [
                506
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
                576
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
                502
            ],
            "content": [
                4
            ],
            "role": [
                504
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
                352
            ],
            "runId": [
                576
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                576
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
                576
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                509
            ],
            "type": [
                332
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                576
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                509
            ],
            "type": [
                332
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
                576
            ],
            "id": [
                576
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                576
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
                576
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
                512
            ],
            "email": [
                513
            ],
            "idempotencyKey": [
                576
            ],
            "messageChannelId": [
                576
            ],
            "messageThreadId": [
                576
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
                576
            ],
            "messageThreadId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                576
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                576
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
                517
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
                520
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
                576
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
                352
            ],
            "toolCalls": [
                352
            ],
            "workspaceMemberIds": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                576
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
                732
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
                352
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                576
            ],
            "createdAt": [
                233
            ],
            "frontComponentId": [
                576
            ],
            "icon": [
                4
            ],
            "id": [
                576
            ],
            "position": [
                9
            ],
            "scope": [
                531
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                576
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
                576
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
                576
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                509
            ],
            "type": [
                332
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
                744
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
                576
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
                576
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
                488
            ],
            "configurationType": [
                718
            ],
            "__typename": [
                4
            ]
        },
        "StartAppChannelConversationInput": {
            "idempotencyKey": [
                576
            ],
            "messageChannelId": [
                576
            ],
            "personId": [
                576
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
                742
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
                576
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
                286,
                {
                    "fieldFilters": [
                        280,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        287,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                468,
                {
                    "input": [
                        215,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                370,
                {
                    "input": [
                        371,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                16,
                {
                    "agentUniversalIdentifier": [
                        576
                    ],
                    "runId": [
                        576
                    ],
                    "threadId": [
                        576
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "onEventSubscription": [
                288,
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
                548
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "TabPresenceStatus": {},
        "TasksConfiguration": {
            "configurationType": [
                718
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
                576
            ],
            "createdAt": [
                233
            ],
            "emit": [
                553
            ],
            "frontComponentUniversalIdentifier": [
                576
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                576
            ],
            "universalIdentifier": [
                576
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
                576
            ],
            "on": [
                4
            ],
            "through": [
                554
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                576
            ],
            "relationFieldUniversalIdentifier": [
                576
            ],
            "triggerFieldUniversalIdentifiers": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                718
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
                352
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
                576
            ],
            "personFilter": [
                352
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
                576
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
                576
            ],
            "gt": [
                576
            ],
            "gte": [
                576
            ],
            "iLike": [
                576
            ],
            "in": [
                576
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                576
            ],
            "lt": [
                576
            ],
            "lte": [
                576
            ],
            "neq": [
                576
            ],
            "notILike": [
                576
            ],
            "notIn": [
                576
            ],
            "notLike": [
                576
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
                576
            ],
            "name": [
                4
            ],
            "updatedAt": [
                233
            ],
            "visibility": [
                580
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
                576
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
                576
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
                352
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
                352
            ],
            "roleId": [
                576
            ],
            "triggers": [
                352
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
                576
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
                576
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                576
            ],
            "visibility": [
                391
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
                587
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
                589
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
                576
            ],
            "update": [
                591
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
                576
            ],
            "availabilityType": [
                176
            ],
            "engineComponentKey": [
                269
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                576
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                352
            ],
            "description": [
                4
            ],
            "formula": [
                352
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
                352
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                576
            ],
            "options": [
                352
            ],
            "settings": [
                352
            ],
            "translations": [
                403
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
                576
            ],
            "update": [
                596
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
                322
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                322
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
                576
            ],
            "update": [
                601
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                352
            ],
            "databaseEventTriggerSettings": [
                352
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                352
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
                352
            ],
            "workflowActionTriggerSettings": [
                352
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                576
            ],
            "update": [
                603
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                576
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
                576
            ],
            "update": [
                605
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                386
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
                393
            ],
            "visibility": [
                391
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                576
            ],
            "update": [
                607
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
                576
            ],
            "update": [
                607
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
                576
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
                576
            ],
            "parentId": [
                576
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
                576
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
                576
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
                422
            ],
            "shortcut": [
                4
            ],
            "translations": [
                403
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                576
            ],
            "update": [
                594
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                576
            ],
            "update": [
                609
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                576
            ],
            "update": [
                610
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
                576
            ],
            "type": [
                439
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
                438
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
                576
            ],
            "layoutMode": [
                438
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "widgets": [
                618
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "conditionalAvailability": [
                352
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                352
            ],
            "configuration": [
                352
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                576
            ],
            "pageLayoutTabId": [
                576
            ],
            "position": [
                352
            ],
            "title": [
                4
            ],
            "type": [
                719
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "conditionalAvailability": [
                352
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                352
            ],
            "configuration": [
                352
            ],
            "id": [
                576
            ],
            "objectMetadataId": [
                576
            ],
            "pageLayoutTabId": [
                576
            ],
            "position": [
                352
            ],
            "title": [
                4
            ],
            "type": [
                719
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
                576
            ],
            "tabs": [
                616
            ],
            "type": [
                439
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRelatedRecordPathInput": {
            "id": [
                576
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
                576
            ],
            "update": [
                622
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
                576
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
                550
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
                576
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                403
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
                580
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                576
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
                576
            ],
            "update": [
                629
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
                576
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
                576
            ],
            "update": [
                631
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
                576
            ],
            "update": [
                633
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
                702
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                576
            ],
            "logicalOperator": [
                707
            ],
            "parentViewFilterGroupId": [
                576
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                576
            ],
            "update": [
                636
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                576
            ],
            "operand": [
                708
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "value": [
                352
            ],
            "viewFilterGroupId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                576
            ],
            "update": [
                638
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                576
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
                576
            ],
            "calendarFieldMetadataId": [
                576
            ],
            "calendarLayout": [
                693
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "kanbanColumnWidth": [
                2
            ],
            "listPinnedFieldMetadataId": [
                576
            ],
            "mainGroupByFieldMetadataId": [
                576
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                711
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
                403
            ],
            "type": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                576
            ],
            "update": [
                641
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                714
            ],
            "relationTargetFieldMetadataId": [
                576
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
                576
            ],
            "update": [
                643
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
                576
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
                352
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                576
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
                730
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                352
            ],
            "workspaceMemberId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                300
            ],
            "roleId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                576
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                650
            ],
            "id": [
                576
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
                650
            ],
            "groups": [
                651
            ],
            "widgetId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                424
            ],
            "roleId": [
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                576
            ],
            "roleId": [
                576
            ],
            "rules": [
                497
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                493
            ],
            "predicates": [
                492
            ],
            "rules": [
                496
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                661
            ],
            "viewFields": [
                658
            ],
            "viewFilterGroups": [
                659
            ],
            "viewFilters": [
                660
            ],
            "viewSorts": [
                662
            ],
            "widgetId": [
                576
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
                576
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
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                576
            ],
            "logicalOperator": [
                707
            ],
            "parentViewFilterGroupId": [
                576
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
                576
            ],
            "id": [
                576
            ],
            "operand": [
                708
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "value": [
                352
            ],
            "viewFilterGroupId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                576
            ],
            "calendarFieldMetadataId": [
                576
            ],
            "calendarLayout": [
                693
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                576
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                576
            ],
            "openRecordIn": [
                711
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                715
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                714
            ],
            "fieldMetadataId": [
                576
            ],
            "id": [
                576
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
                677
            ],
            "usageByApplication": [
                666
            ],
            "usageByModel": [
                666
            ],
            "usageByOperationType": [
                666
            ],
            "usageByUser": [
                666
            ],
            "userDailyUsage": [
                679
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                669
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
                576
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                669
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                676
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                678
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
                678
            ],
            "operationType": [
                669
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                668
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                672
            ],
            "resourceType": [
                676
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                670
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
                669
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                678
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
                669
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                676
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                678
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
                576
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                669
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
                676
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
                678
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
                677
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
                684
            ],
            "currentWorkspace": [
                724
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
                576
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
                431
            ],
            "previousOnboardingStatus": [
                431
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                233
            ],
            "userVars": [
                353
            ],
            "userWorkspaces": [
                684
            ],
            "workspaceMember": [
                734
            ],
            "workspaceMembers": [
                734
            ],
            "workspaces": [
                684
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
                352
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
                576
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
                576
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
                576
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
                430
            ],
            "permissionFlags": [
                448
            ],
            "twoFactorAuthenticationMethodSummary": [
                572
            ],
            "updatedAt": [
                233
            ],
            "user": [
                680
            ],
            "userId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                576
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
                576
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
                576
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
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
                743
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
                576
            ],
            "calendarEndFieldMetadataId": [
                576
            ],
            "calendarFieldMetadataId": [
                576
            ],
            "calendarLayout": [
                693
            ],
            "createdAt": [
                233
            ],
            "createdByUserWorkspaceId": [
                576
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                576
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
                576
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                710
            ],
            "listPinnedFieldMetadataId": [
                576
            ],
            "mainGroupByFieldMetadataId": [
                576
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                576
            ],
            "openRecordIn": [
                711
            ],
            "position": [
                9
            ],
            "presetFilter": [
                712
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                715
            ],
            "universalIdentifier": [
                576
            ],
            "updatedAt": [
                233
            ],
            "viewFieldGroups": [
                696
            ],
            "viewFields": [
                695
            ],
            "viewFilterGroups": [
                706
            ],
            "viewFilters": [
                705
            ],
            "viewGroups": [
                709
            ],
            "viewSorts": [
                713
            ],
            "workspaceId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                718
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
                576
            ],
            "createdAt": [
                233
            ],
            "fieldMetadataId": [
                576
            ],
            "id": [
                576
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
                697
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "size": [
                9
            ],
            "universalIdentifier": [
                576
            ],
            "updatedAt": [
                233
            ],
            "viewFieldGroupId": [
                576
            ],
            "viewId": [
                576
            ],
            "workspaceId": [
                576
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
                576
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
                695
            ],
            "viewId": [
                576
            ],
            "workspaceId": [
                576
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
                699
            ],
            "filters": [
                698
            ],
            "limit": [
                2
            ],
            "sorts": [
                703
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilter": {
            "fieldMetadataId": [
                576
            ],
            "filterGroupId": [
                576
            ],
            "id": [
                576
            ],
            "operand": [
                708
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "value": [
                352
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroup": {
            "id": [
                576
            ],
            "logicalOperator": [
                707
            ],
            "parentFilterGroupId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroupInput": {
            "id": [
                576
            ],
            "logicalOperator": [
                707
            ],
            "parentFilterGroupId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterInput": {
            "fieldMetadataId": [
                576
            ],
            "filterGroupId": [
                576
            ],
            "id": [
                576
            ],
            "operand": [
                708
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "value": [
                352
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
                700
            ],
            "filters": [
                701
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
        "ViewFieldRelationScopeSort": {
            "direction": [
                714
            ],
            "fieldMetadataId": [
                576
            ],
            "relationTargetFieldMetadataId": [
                576
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
                714
            ],
            "fieldMetadataId": [
                576
            ],
            "relationTargetFieldMetadataId": [
                576
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
                576
            ],
            "id": [
                576
            ],
            "operand": [
                708
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                233
            ],
            "value": [
                352
            ],
            "viewFilterGroupId": [
                576
            ],
            "viewId": [
                576
            ],
            "workspaceId": [
                576
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
                576
            ],
            "logicalOperator": [
                707
            ],
            "parentViewFilterGroupId": [
                576
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                233
            ],
            "viewId": [
                576
            ],
            "workspaceId": [
                576
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
                576
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
                576
            ],
            "workspaceId": [
                576
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
                714
            ],
            "fieldMetadataId": [
                576
            ],
            "id": [
                576
            ],
            "relationTargetFieldMetadataId": [
                576
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                233
            ],
            "viewId": [
                576
            ],
            "workspaceId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "ViewSortDirection": {},
        "ViewType": {},
        "Webhook": {
            "applicationId": [
                576
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
                576
            ],
            "operations": [
                4
            ],
            "role": [
                489
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
                293
            ],
            "on_FieldRichTextConfiguration": [
                301
            ],
            "on_FieldsConfiguration": [
                302
            ],
            "on_FilesConfiguration": [
                308
            ],
            "on_FormFieldConfiguration": [
                311
            ],
            "on_FrontComponentConfiguration": [
                313
            ],
            "on_IframeConfiguration": [
                333
            ],
            "on_LineChartConfiguration": [
                356
            ],
            "on_MessageCampaignBodyConfiguration": [
                382
            ],
            "on_MessageCampaignDetailsConfiguration": [
                383
            ],
            "on_NotesConfiguration": [
                414
            ],
            "on_PieChartConfiguration": [
                449
            ],
            "on_RecordTableConfiguration": [
                479
            ],
            "on_StandaloneRichTextConfiguration": [
                538
            ],
            "on_TasksConfiguration": [
                551
            ],
            "on_TimelineConfiguration": [
                555
            ],
            "on_ViewConfiguration": [
                694
            ],
            "on_WorkflowConfiguration": [
                721
            ],
            "on_WorkflowRunConfiguration": [
                722
            ],
            "on_WorkflowVersionConfiguration": [
                723
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
                718
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                718
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                718
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                725
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
                352
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
                489
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
                290
            ],
            "hasValidEnterpriseValidityToken": [
                1
            ],
            "hasValidSignedEnterpriseKey": [
                1
            ],
            "id": [
                576
            ],
            "iframeMediaPermissions": [
                334
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
                576
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
                695
            ],
            "viewFilterGroups": [
                706
            ],
            "viewFilters": [
                705
            ],
            "viewGroups": [
                709
            ],
            "viewSorts": [
                713
            ],
            "views": [
                692
            ],
            "workspaceCustomApplication": [
                59
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                730
            ],
            "workspaceMembersCount": [
                9
            ],
            "workspaceUrls": [
                743
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
                352
            ],
            "outcome": [
                727
            ],
            "personEnrichment": [
                352
            ],
            "personOutcome": [
                741
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
                576
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
                576
            ],
            "roleId": [
                576
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
                736
            ],
            "id": [
                576
            ],
            "locale": [
                4
            ],
            "name": [
                315
            ],
            "numberFormat": [
                737
            ],
            "openRecordIn": [
                434
            ],
            "roles": [
                489
            ],
            "timeFormat": [
                738
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
                576
            ],
            "userWorkspaceId": [
                576
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                576
            ],
            "variables": [
                681
            ],
            "workspaceMemberId": [
                576
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
                352
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
                576
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
                576
            ],
            "workspaceUrls": [
                743
            ],
            "__typename": [
                4
            ]
        }
    }
}