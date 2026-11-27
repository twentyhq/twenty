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
        351,
        352,
        356,
        357,
        358,
        370,
        372,
        390,
        391,
        392,
        393,
        394,
        395,
        397,
        398,
        399,
        402,
        403,
        405,
        408,
        413,
        417,
        426,
        433,
        435,
        438,
        442,
        443,
        448,
        452,
        476,
        478,
        479,
        487,
        498,
        499,
        508,
        513,
        535,
        550,
        551,
        553,
        555,
        581,
        583,
        585,
        653,
        674,
        681,
        683,
        687,
        698,
        712,
        713,
        715,
        716,
        717,
        719,
        720,
        723,
        724,
        725,
        730,
        732,
        735,
        741,
        742,
        743,
        746,
        747
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
                581
            ],
            "workspaceMemberIds": [
                581
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
                356
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
                581
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
                581
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
                356
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
                356
            ],
            "roleId": [
                581
            ],
            "triggers": [
                356
            ],
            "universalIdentifier": [
                581
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
                581
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
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
                581
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
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                356
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
                581
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
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                581
            ],
            "createdAt": [
                234
            ],
            "id": [
                581
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
                581
            ],
            "senderWorkspaceMemberId": [
                581
            ],
            "status": [
                4
            ],
            "threadId": [
                581
            ],
            "turnId": [
                581
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
                581
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                581
            ],
            "messageId": [
                581
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                356
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
                356
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                356
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
                581
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                581
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
                581
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
                581
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
                581
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
                581
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
                581
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
                581
            ],
            "aggregateOperation": [
                33
            ],
            "configurationType": [
                723
            ],
            "description": [
                4
            ],
            "displayDataLabel": [
                1
            ],
            "filter": [
                356
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
                471
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
                234
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
                581
            ],
            "name": [
                4
            ],
            "revokedAt": [
                234
            ],
            "role": [
                493
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
                581
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
                356
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                581
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
                581
            ],
            "role": [
                399
            ],
            "workspaceMemberId": [
                581
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
                581
            ],
            "applicationVariables": [
                99
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                356
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
                234
            ],
            "defaultLogicFunctionRole": [
                493
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
                581
            ],
            "grantedIframeMediaPermissions": [
                335
            ],
            "healthCheckLogicFunctionId": [
                581
            ],
            "id": [
                581
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                369
            ],
            "logoFileId": [
                581
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                419
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                581
            ],
            "requestedIframeMediaPermissions": [
                335
            ],
            "requestedRoleId": [
                581
            ],
            "runHealthCheckOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                581
            ],
            "settingsMenuItems": [
                534
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                581
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
                581
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
                581
            ],
            "workspaceId": [
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                581
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
                467
            ],
            "connectionProviderId": [
                581
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
                581
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
                181
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                234
            ],
            "userWorkspaceId": [
                581
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
                581
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
                581
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
                356
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
                581
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
                581
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
                91
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
                581
            ],
            "connectionProviders": [
                69
            ],
            "settingsMenuItems": [
                534
            ],
            "variables": [
                686
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
                581
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
                581
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
                696
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                581
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
                234
            ],
            "description": [
                4
            ],
            "id": [
                581
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
                356
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
                581
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
                356
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
                234
            ],
            "domain": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "workspaceMemberIds": [
                581
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
                512
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
                581
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
                511
            ],
            "workspaceUrls": [
                748
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
                581
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
                723
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
                356
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
                433
            ],
            "primaryAxisGroupByFieldMetadataId": [
                581
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
                433
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                581
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
                356
            ],
            "formattedToRawLookup": [
                356
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
                356
            ],
            "objectMetadataId": [
                581
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
                581
            ],
            "stripeCustomerEmail": [
                4
            ],
            "userCreditsFallback": [
                687
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
                551
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
                550
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
                234
            ],
            "periodStart": [
                234
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
                234
            ],
            "collectionMethod": [
                138
            ],
            "currentPeriodEnd": [
                234
            ],
            "hasUserCredits": [
                1
            ],
            "id": [
                581
            ],
            "interval": [
                550
            ],
            "metadata": [
                356
            ],
            "phases": [
                140
            ],
            "status": [
                551
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
                581
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
                581
            ],
            "contactAutoCreationPolicy": [
                146
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
                581
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
                234
            ],
            "syncStatus": [
                148
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
                723
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
                723
            ],
            "__typename": [
                4
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                723
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
                723
            ],
            "__typename": [
                4
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                356
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
                723
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
                413
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                415
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
                465
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                532
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                552
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
                581
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                581
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
                581
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
                581
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "pageLayoutId": [
                581
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
                581
            ],
            "updatedAt": [
                234
            ],
            "workflowVersionId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                425
            ],
            "on_PathCommandMenuItemPayload": [
                450
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
                581
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                581
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
                467
            ],
            "connectionProviderId": [
                581
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
                581
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
                181
            ],
            "scopes": [
                4
            ],
            "updatedAt": [
                234
            ],
            "userWorkspaceId": [
                581
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
                581
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                581
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
        "ContinueInteractiveConnectionInput": {
            "action": [
                351
            ],
            "flowId": [
                581
            ],
            "values": [
                356
            ],
            "__typename": [
                4
            ]
        },
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
                581
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
                356
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
                356
            ],
            "roleId": [
                581
            ],
            "triggers": [
                356
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                581
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                581
            ],
            "participantHandleFieldUniversalIdentifier": [
                581
            ],
            "visibility": [
                395
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
                581
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
                581
            ],
            "engineComponentKey": [
                270
            ],
            "frontComponentId": [
                581
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
                581
            ],
            "pageLayoutId": [
                581
            ],
            "payload": [
                356
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                581
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
                389
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
                356
            ],
            "description": [
                4
            ],
            "formula": [
                356
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
                356
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                581
            ],
            "options": [
                356
            ],
            "relationCreationPayload": [
                356
            ],
            "settings": [
                356
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
                581
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
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                356
            ],
            "databaseEventTriggerSettings": [
                356
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                356
            ],
            "id": [
                581
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                356
            ],
            "source": [
                356
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                356
            ],
            "universalIdentifier": [
                581
            ],
            "workflowActionTriggerSettings": [
                356
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                581
            ],
            "id": [
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                581
            ],
            "agentId": [
                581
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "folderId": [
                581
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "parentId": [
                581
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                581
            ],
            "targetRecordId": [
                581
            ],
            "type": [
                417
            ],
            "userWorkspaceId": [
                581
            ],
            "viewId": [
                581
            ],
            "visibleItemLimit": [
                2
            ],
            "workflowId": [
                581
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
                356
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
                581
            ],
            "type": [
                443
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                442
            ],
            "pageLayoutId": [
                581
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
                356
            ],
            "configuration": [
                356
            ],
            "objectMetadataId": [
                581
            ],
            "pageLayoutTabId": [
                581
            ],
            "position": [
                356
            ],
            "title": [
                4
            ],
            "type": [
                724
            ],
            "__typename": [
                4
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                581
            ],
            "filter": [
                356
            ],
            "objectMetadataId": [
                581
            ],
            "orderBy": [
                356
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                581
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                581
            ],
            "secondFieldMetadataId": [
                581
            ],
            "thirdFieldMetadataId": [
                581
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
                581
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
                585
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
                674
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                681
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                683
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
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                581
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
                581
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
                581
            ],
            "id": [
                581
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
                707
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                581
            ],
            "viewId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                581
            ],
            "logicalOperator": [
                712
            ],
            "parentViewFilterGroupId": [
                581
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                581
            ],
            "id": [
                581
            ],
            "operand": [
                713
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "value": [
                356
            ],
            "viewFilterGroupId": [
                581
            ],
            "viewId": [
                581
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
                581
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewId": [
                581
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
                581
            ],
            "calendarFieldMetadataId": [
                581
            ],
            "calendarLayout": [
                698
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                715
            ],
            "listPinnedFieldMetadataId": [
                581
            ],
            "mainGroupByFieldMetadataId": [
                581
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                581
            ],
            "openRecordIn": [
                716
            ],
            "position": [
                9
            ],
            "presetFilter": [
                717
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                720
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                719
            ],
            "fieldMetadataId": [
                581
            ],
            "id": [
                581
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                581
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
                581
            ],
            "operations": [
                4
            ],
            "roleId": [
                581
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
                674
            ],
            "resource": [
                681
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                581
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
                581
            ],
            "name": [
                316
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                581
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
                581
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
                581
            ],
            "pageLayoutId": [
                581
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
                581
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
                581
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                513
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
                581
            ],
            "status": [
                513
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
                723
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
                581
            ],
            "status": [
                265
            ],
            "tenantStatus": [
                266
            ],
            "unsubscribeHostnameStatus": [
                583
            ],
            "updatedAt": [
                234
            ],
            "verificationRecords": [
                693
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
                723
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
                356
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
                356
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
                356
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
                356
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
                356
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
                404
            ],
            "objectRecordEventsWithQueryIds": [
                432
            ],
            "queueJobEvents": [
                359
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                581
            ],
            "payload": [
                356
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
                581
            ],
            "createdAt": [
                234
            ],
            "defaultValue": [
                356
            ],
            "description": [
                4
            ],
            "disabledFieldPermissionActions": [
                4
            ],
            "formula": [
                356
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "morphRelations": [
                486
            ],
            "name": [
                4
            ],
            "object": [
                419
            ],
            "objectMetadataId": [
                581
            ],
            "options": [
                356
            ],
            "relation": [
                486
            ],
            "settings": [
                356
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
                723
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
                439
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
                582
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
                582
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
                581
            ],
            "id": [
                581
            ],
            "objectMetadataId": [
                581
            ],
            "roleId": [
                581
            ],
            "rowLevelPermissionPredicateGroupId": [
                581
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
                581
            ],
            "objectMetadataId": [
                581
            ],
            "rowLevelPermissionPredicateGroupId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                723
            ],
            "__typename": [
                4
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                723
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
                581
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
                581
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
                581
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
                581
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
                723
            ],
            "__typename": [
                4
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                581
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                513
            ],
            "type": [
                333
            ],
            "workspace": [
                745
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
                402
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                723
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
                581
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                98
            ],
            "applicationVariables": [
                356
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
                581
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
                581
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
                723
            ],
            "frontComponentId": [
                581
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                581
            ],
            "pageLayoutType": [
                443
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
                507
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                356
            ],
            "runId": [
                581
            ],
            "scope": [
                356
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
                356
            ],
            "runId": [
                581
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
                581
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
                581
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
                581
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
                725
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
                581
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
                723
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
                105
            ],
            "workspace": [
                749
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
                581
            ],
            "threadId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                581
            ],
            "createdAt": [
                234
            ],
            "id": [
                581
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
                183
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
                581
            ],
            "id": [
                581
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
                582
            ],
            "isCustom": [
                144
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
                581
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
                581
            ],
            "messageThreadId": [
                581
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
        "InteractiveConnectionAction": {},
        "InteractiveConnectionStatus": {},
        "InteractiveConnectionStep": {
            "connectedAccountId": [
                581
            ],
            "flowId": [
                581
            ],
            "screen": [
                356
            ],
            "status": [
                352
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
                358
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                581
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
                723
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
                356
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
                433
            ],
            "primaryAxisGroupByFieldMetadataId": [
                581
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
                433
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                581
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
                356
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                364
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
                356
            ],
            "objectMetadataId": [
                581
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
                363
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                581
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
                581
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                234
            ],
            "cronTriggerSettings": [
                356
            ],
            "databaseEventTriggerSettings": [
                356
            ],
            "description": [
                4
            ],
            "executionMode": [
                370
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                356
            ],
            "id": [
                581
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
                356
            ],
            "universalIdentifier": [
                581
            ],
            "updatedAt": [
                234
            ],
            "workflowActionTriggerSettings": [
                356
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                356
            ],
            "duration": [
                9
            ],
            "error": [
                356
            ],
            "logs": [
                4
            ],
            "status": [
                372
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                581
            ],
            "applicationUniversalIdentifier": [
                581
            ],
            "id": [
                581
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                581
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
                581
            ],
            "messageThreadId": [
                581
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
                356
            ],
            "name": [
                4
            ],
            "objects": [
                380
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
                381
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
                382
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                383
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
                581
            ],
            "connectionProviderId": [
                581
            ],
            "createdAt": [
                234
            ],
            "id": [
                581
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
                385
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
                356
            ],
            "description": [
                4
            ],
            "inputSchema": [
                356
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
                723
            ],
            "__typename": [
                4
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                723
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
                581
            ],
            "contactAutoCreationPolicy": [
                390
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
                581
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
                397
            ],
            "messagingProviderUniversalIdentifier": [
                581
            ],
            "participantHandleFieldUniversalIdentifier": [
                581
            ],
            "pendingGroupEmailsAction": [
                391
            ],
            "syncStage": [
                392
            ],
            "syncStageStartedAt": [
                234
            ],
            "syncStatus": [
                393
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
                394
            ],
            "updatedAt": [
                234
            ],
            "visibility": [
                395
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
                581
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                581
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                398
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
                581
            ],
            "reason": [
                402
            ],
            "source": [
                403
            ],
            "unsubscribeTopicId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                400
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
                431
            ],
            "recordId": [
                4
            ],
            "type": [
                405
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
                581
            ],
            "property": [
                4
            ],
            "provenance": [
                408
            ],
            "recordId": [
                581
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
                581
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                581
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
                411
            ],
            "views": [
                412
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
                581
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
                581
            ],
            "key": [
                715
            ],
            "objectMetadataId": [
                581
            ],
            "type": [
                720
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                541,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                729,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                581,
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
                        581,
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
                        102,
                        "ArchiveInboxThreadInput!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                1,
                {
                    "assigneeWorkspaceMemberId": [
                        581
                    ],
                    "threadId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        581,
                        "UUID!"
                    ],
                    "roleId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        581,
                        "UUID!"
                    ],
                    "roleId": [
                        581,
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
                136,
                {
                    "plan": [
                        130,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        550,
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
                        581,
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
                        581,
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
                581,
                {
                    "input": [
                        179,
                        "ConnectApplicationWithApiKeyInput!"
                    ]
                }
            ],
            "continueInteractiveConnection": [
                353,
                {
                    "input": [
                        186,
                        "ContinueInteractiveConnectionInput!"
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
                389,
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
                        80,
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
                101,
                {
                    "input": [
                        194,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                128
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
                        581
                    ]
                }
            ],
            "createCommandMenuItem": [
                175,
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
                416,
                {
                    "inputs": [
                        208,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                701,
                {
                    "inputs": [
                        223,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                700,
                {
                    "inputs": [
                        224,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                714,
                {
                    "inputs": [
                        227,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                384,
                {
                    "input": [
                        206,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                400,
                {
                    "input": [
                        207,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                416,
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
                538,
                {
                    "input": [
                        536,
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
                        581,
                        "UUID!"
                    ],
                    "properties": [
                        356
                    ],
                    "recordId": [
                        581,
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
                369,
                {
                    "input": [
                        205,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                419,
                {
                    "input": [
                        212,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                493,
                {
                    "createRoleInput": [
                        218,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                440,
                {
                    "input": [
                        213,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                441,
                {
                    "input": [
                        214,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                444,
                {
                    "input": [
                        215,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                464,
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
                485,
                {
                    "input": [
                        217,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                538,
                {
                    "input": [
                        537,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                541,
                {
                    "input": [
                        219,
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
                        550,
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
                584,
                {
                    "input": [
                        220,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                672,
                {
                    "input": [
                        221,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                692,
                {
                    "input": [
                        222,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                697,
                {
                    "input": [
                        228,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                700,
                {
                    "input": [
                        224,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                701,
                {
                    "input": [
                        223,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                710,
                {
                    "input": [
                        226,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                711,
                {
                    "input": [
                        225,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                714,
                {
                    "input": [
                        227,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                718,
                {
                    "input": [
                        229,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                721,
                {
                    "input": [
                        230,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                541,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        581,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        581
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
                389,
                {
                    "id": [
                        581,
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
                175,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                180,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                729
            ],
            "deleteEmailGroupChannel": [
                389,
                {
                    "id": [
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                416,
                {
                    "ids": [
                        581,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                384,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                416,
                {
                    "id": [
                        581,
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
                369,
                {
                    "input": [
                        373,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                419,
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
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                485,
                {
                    "id": [
                        581,
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
                541,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                241,
                {
                    "twoFactorAuthenticationMethodId": [
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                685
            ],
            "deleteUserFromWorkspace": [
                689,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                692,
                {
                    "id": [
                        581,
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
                700,
                {
                    "input": [
                        243,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                701,
                {
                    "input": [
                        242,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                710,
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
                714,
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
                721,
                {
                    "id": [
                        581,
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
                700,
                {
                    "input": [
                        249,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                701,
                {
                    "input": [
                        248,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                710,
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
                714,
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
                180,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                256,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                257,
                {
                    "id": [
                        581,
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
                        581
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
                123
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
                733
            ],
            "executeOneLogicFunction": [
                371,
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
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                105
            ],
            "generateTransientToken": [
                562
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                576,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                578,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        581,
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
                579,
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
                376,
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
                436
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
                        581,
                        "UUID!"
                    ],
                    "workspaceId": [
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        377,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        581
                    ],
                    "threadId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                581,
                {
                    "workspaceMemberId": [
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        488,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                480,
                {
                    "principal": [
                        477,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        484,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        489,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                490,
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
                528,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                441,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                440,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                444,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                557,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                520,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        581,
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
                        491,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                495,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                509,
                {
                    "input": [
                        505,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        581,
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
                        581
                    ]
                }
            ],
            "sendAppChannelMessage": [
                519,
                {
                    "input": [
                        518,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                520,
                {
                    "browsingContext": [
                        356
                    ],
                    "channelId": [
                        581
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
                        581,
                        "[UUID!]"
                    ],
                    "messageId": [
                        581,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        581,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                523,
                {
                    "input": [
                        522,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                527,
                {
                    "input": [
                        526,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                528,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        581
                    ]
                }
            ],
            "sendMessageCampaign": [
                530,
                {
                    "input": [
                        529,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                525,
                {
                    "input": [
                        531,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                53,
                {
                    "input": [
                        533,
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
                278,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                480,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        484,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                480,
                {
                    "accessLevel": [
                        476,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        477,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        484,
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
                539,
                {
                    "input": [
                        540
                    ]
                }
            ],
            "signUpInWorkspace": [
                539,
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
                        581
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
                437,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "startAppChannelConversation": [
                519,
                {
                    "input": [
                        543,
                        "StartAppChannelConversationInput!"
                    ]
                }
            ],
            "startChannelSync": [
                161,
                {
                    "connectedAccountId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "startInteractiveConnection": [
                353,
                {
                    "input": [
                        544,
                        "StartInteractiveConnectionInput!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                545,
                {
                    "companyContext": [
                        356
                    ],
                    "personContext": [
                        356
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        546,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                547
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
                396,
                {
                    "input": [
                        554,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                744,
                {
                    "dryRun": [
                        1
                    ],
                    "inferDeletionFromMissingEntities": [
                        1
                    ],
                    "manifest": [
                        356,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                384,
                {
                    "id": [
                        581,
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
                        356
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
                564,
                {
                    "input": [
                        563,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                568,
                {
                    "input": [
                        565,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                567,
                {
                    "input": [
                        566,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                572,
                {
                    "input": [
                        569,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                571,
                {
                    "input": [
                        570,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                574,
                {
                    "input": [
                        573,
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
                        581,
                        "UUID!"
                    ],
                    "input": [
                        586,
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
                        581,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                49,
                {
                    "input": [
                        588,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                389,
                {
                    "input": [
                        589,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                59,
                {
                    "id": [
                        581,
                        "UUID!"
                    ],
                    "input": [
                        590,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                93,
                {
                    "input": [
                        591,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                97,
                {
                    "input": [
                        593,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                145,
                {
                    "input": [
                        595,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                175,
                {
                    "input": [
                        597,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                389,
                {
                    "input": [
                        598,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                313,
                {
                    "input": [
                        600,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                322,
                {
                    "input": [
                        602,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateInboxNotificationSettings": [
                689,
                {
                    "input": [
                        603,
                        "UpdateInboxNotificationSettingsInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                291,
                {
                    "input": [
                        604,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                416,
                {
                    "inputs": [
                        617,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                419,
                {
                    "inputs": [
                        618,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                714,
                {
                    "inputs": [
                        642,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                384,
                {
                    "input": [
                        607,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                389,
                {
                    "input": [
                        609,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                396,
                {
                    "input": [
                        611,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                396,
                {
                    "input": [
                        613,
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
                416,
                {
                    "input": [
                        617,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                7,
                {
                    "input": [
                        587,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        581
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
                        616,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        605,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                419,
                {
                    "input": [
                        618,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                493,
                {
                    "updateRoleInput": [
                        626,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                440,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        619,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                441,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        620,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                444,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        622,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                440,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        624,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                354,
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
                485,
                {
                    "input": [
                        625,
                        "UpdateRelatedRecordPathInput!"
                    ]
                }
            ],
            "updateSkill": [
                541,
                {
                    "input": [
                        628,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTabPresence": [
                1,
                {
                    "input": [
                        629,
                        "UpdateTabPresenceInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                557,
                {
                    "input": [
                        630,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                584,
                {
                    "input": [
                        631,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                672,
                {
                    "input": [
                        632,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                122,
                {
                    "userCreditsFallback": [
                        687,
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
                692,
                {
                    "input": [
                        633,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                697,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        644,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                700,
                {
                    "input": [
                        637,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                701,
                {
                    "input": [
                        635,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                710,
                {
                    "input": [
                        640,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                711,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        639,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                714,
                {
                    "input": [
                        642,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                718,
                {
                    "input": [
                        645,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                721,
                {
                    "input": [
                        647,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                729,
                {
                    "data": [
                        651,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                729,
                {
                    "data": [
                        649,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                729,
                {
                    "data": [
                        650,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                739,
                {
                    "roleId": [
                        581,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        652,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                93,
                {
                    "file": [
                        653,
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
                        653,
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
                        653,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                308,
                {
                    "file": [
                        653,
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
                        653,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                308,
                {
                    "file": [
                        653,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                300,
                {
                    "upsertFieldPermissionsInput": [
                        654,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                697,
                {
                    "input": [
                        657,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                427,
                {
                    "upsertObjectPermissionsInput": [
                        658,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                494,
                {
                    "upsertPermissionFlagsInput": [
                        659,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                661,
                {
                    "input": [
                        660,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                697,
                {
                    "input": [
                        662,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "upsertWebPushSubscription": [
                1,
                {
                    "input": [
                        668,
                        "UpsertWebPushSubscriptionInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                101,
                {
                    "input": [
                        690,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                694,
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
                264,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                695,
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
                581
            ],
            "agentId": [
                581
            ],
            "applicationId": [
                581
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
                581
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "parentId": [
                581
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                581
            ],
            "targetRecordId": [
                581
            ],
            "targetRecordIdentifier": [
                473
            ],
            "type": [
                417
            ],
            "universalIdentifier": [
                581
            ],
            "updatedAt": [
                234
            ],
            "userWorkspaceId": [
                581
            ],
            "viewId": [
                581
            ],
            "visibleItemLimit": [
                2
            ],
            "workflowId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                723
            ],
            "__typename": [
                4
            ]
        },
        "Object": {
            "applicationId": [
                581
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
                422,
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
                581
            ],
            "imageIdentifierFieldMetadataId": [
                581
            ],
            "indexMetadataList": [
                342
            ],
            "indexMetadatas": [
                424,
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
                581
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
                426
            ],
            "searchFieldMetadataList": [
                515
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
                421
            ],
            "pageInfo": [
                439
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
                419
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
                439
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                423
            ],
            "id": [
                582
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
                423
            ],
            "universalIdentifier": [
                582
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
                439
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                581
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
                581
            ],
            "restrictedFields": [
                356
            ],
            "rowLevelPermissionPredicateGroups": [
                497
            ],
            "rowLevelPermissionPredicates": [
                496
            ],
            "uneditableFields": [
                581
            ],
            "unreadableFields": [
                581
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
                581
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
                431
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
                356
            ],
            "before": [
                356
            ],
            "diff": [
                356
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
                430
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
                581
            ],
            "restrictedFields": [
                356
            ],
            "rowLevelRecordsPermissions": [
                504
            ],
            "uneditableFields": [
                581
            ],
            "unreadableFields": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                435
            ],
            "previousOnboardingStatus": [
                435
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
                581
            ],
            "createdAt": [
                234
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                581
            ],
            "deletedAt": [
                234
            ],
            "id": [
                581
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
                581
            ],
            "tabs": [
                441
            ],
            "type": [
                443
            ],
            "universalIdentifier": [
                581
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
                581
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
                581
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
                442
            ],
            "pageLayoutId": [
                581
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                581
            ],
            "updatedAt": [
                234
            ],
            "widgets": [
                444
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
                581
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailability": [
                356
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                356
            ],
            "configuration": [
                722
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
                581
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
                581
            ],
            "pageLayoutTabId": [
                581
            ],
            "position": [
                447
            ],
            "title": [
                4
            ],
            "type": [
                724
            ],
            "universalIdentifier": [
                581
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
                442
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
                442
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
                445
            ],
            "on_PageLayoutWidgetGridPosition": [
                446
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                449
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                448
            ],
            "index": [
                2
            ],
            "layoutMode": [
                442
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
                581
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
                581
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
                581
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
                581
            ],
            "aggregateOperation": [
                33
            ],
            "color": [
                4
            ],
            "configurationType": [
                723
            ],
            "dateGranularity": [
                433
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
                356
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                581
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
                456
            ],
            "formattedToRawLookup": [
                356
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
                356
            ],
            "objectMetadataId": [
                581
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
                368
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
                156
            ],
            "blockers": [
                388
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                581
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
                581
            ],
            "handle": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "createdAt": [
                234
            ],
            "domain": [
                4
            ],
            "id": [
                581
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
                466
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
                463
            ],
            "IMAP": [
                463
            ],
            "SMTP": [
                463
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
                581
            ],
            "logo": [
                4
            ],
            "workspaceUrls": [
                748
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
                581
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
                        581,
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
                        581,
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
                        581,
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
                        365
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
                389,
                {
                    "filter": [
                        366
                    ]
                }
            ],
            "appMessageFolders": [
                396,
                {
                    "filter": [
                        367
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                67,
                {
                    "applicationId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                69,
                {
                    "applicationId": [
                        581,
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
                514,
                {
                    "applicationId": [
                        581,
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
                462
            ],
            "callRecordingIdForCalendarEvent": [
                581,
                {
                    "calendarEventId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                24,
                {
                    "agentUniversalIdentifier": [
                        581
                    ],
                    "threadId": [
                        581
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
                        581
                    ],
                    "threadId": [
                        581
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
                        581,
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
                738,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                548,
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                175
            ],
            "currentUser": [
                685
            ],
            "currentUserApplicationAuthorizations": [
                60
            ],
            "currentUserSessions": [
                688
            ],
            "currentWorkspace": [
                729
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
                        581,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                293,
                {
                    "id": [
                        581,
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
                461,
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
                        234
                    ],
                    "periodStart": [
                        234
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
                        234
                    ],
                    "periodStart": [
                        234
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
                359,
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
                369
            ],
            "findManyMarketplaceApps": [
                378,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                464
            ],
            "findMarketplaceAppDetail": [
                379,
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
                        581
                    ],
                    "universalIdentifier": [
                        581
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
                369,
                {
                    "input": [
                        373,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                359,
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
                359,
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
                731
            ],
            "findWorkspaceFromInviteHash": [
                736,
                {
                    "inviteHash": [
                        4,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                737
            ],
            "frontComponent": [
                313,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                313
            ],
            "getAddressDetails": [
                457,
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
                493
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
                356,
                {
                    "input": [
                        373,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                182,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                264
            ],
            "getInviteSuggestions": [
                355
            ],
            "getJobs": [
                359,
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
                        373,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                440,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                441,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                441,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                444,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                444,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                440,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        443
                    ]
                }
            ],
            "getPermissionFlags": [
                451
            ],
            "getPublicWorkspaceDataByDomain": [
                468,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                469,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                135
            ],
            "getRole": [
                493,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                493
            ],
            "getSSOIdentityProviders": [
                310
            ],
            "getToolIndex": [
                561
            ],
            "getToolInputSchema": [
                356,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                669,
                {
                    "input": [
                        670
                    ]
                }
            ],
            "getView": [
                697,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                700,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                701,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                701,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                700,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                710,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                711,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                711,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                710,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                714,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                714,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                718,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                718,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                697,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        720,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                734
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
                361,
                {
                    "input": [
                        362,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                129
            ],
            "mcpServer": [
                384,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                384
            ],
            "messageSuppressions": [
                401,
                {
                    "input": [
                        311,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                406,
                {
                    "input": [
                        409,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                410
            ],
            "mostlyEmptyFieldMetadataIds": [
                581,
                {
                    "objectMetadataId": [
                        581,
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
                        581
                    ]
                }
            ],
            "myConnectedAccounts": [
                180
            ],
            "myMessageChannels": [
                389,
                {
                    "connectedAccountId": [
                        581
                    ]
                }
            ],
            "myMessageFolders": [
                396,
                {
                    "messageChannelId": [
                        581
                    ]
                }
            ],
            "myUserApplicationVariables": [
                740
            ],
            "navigationMenuItem": [
                416,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                416
            ],
            "object": [
                419,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                429
            ],
            "objects": [
                420,
                {
                    "filter": [
                        423,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        232,
                        "CursorPaging!"
                    ]
                }
            ],
            "onlineWorkspaceMemberIds": [
                581
            ],
            "pieChartData": [
                454,
                {
                    "input": [
                        455,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                156,
                {
                    "input": [
                        458,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                460,
                {
                    "input": [
                        459,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                379,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                378
            ],
            "recordPermissions": [
                475,
                {
                    "targets": [
                        484,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                480,
                {
                    "target": [
                        484,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                485
            ],
            "skill": [
                541,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                541
            ],
            "timelineActivityTypes": [
                557
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                575
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                580,
                {
                    "userId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                584
            ],
            "usageLimits": [
                672
            ],
            "usageQuotaDefinitions": [
                676
            ],
            "usageQuotaScopeConsumption": [
                678,
                {
                    "input": [
                        679,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                680
            ],
            "validatePasswordResetToken": [
                691,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                692,
                {
                    "objectMetadataId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                692,
                {
                    "fieldMetadataId": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                721,
                {
                    "id": [
                        581,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                721
            ],
            "workspaceApplicationAuthorizations": [
                60,
                {
                    "applicationId": [
                        581
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
                581
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
                581
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
                581
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
                581
            ],
            "permissions": [
                474
            ],
            "recordId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                581
            ],
            "workspaceMemberId": [
                581
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
                474
            ],
            "roles": [
                482
            ],
            "shares": [
                481
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                476
            ],
            "id": [
                20
            ],
            "principalId": [
                581
            ],
            "principalRoleId": [
                581
            ],
            "principalType": [
                478
            ],
            "rowCause": [
                479
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
                581
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
                723
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
                581
            ],
            "recordId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                581
            ],
            "id": [
                581
            ],
            "isActive": [
                1
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                581
            ],
            "secondFieldMetadataId": [
                581
            ],
            "thirdFieldMetadataId": [
                581
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
                419
            ],
            "targetFieldMetadata": [
                293
            ],
            "targetObjectMetadata": [
                419
            ],
            "type": [
                487
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
                581
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
                581
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
                581
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                427
            ],
            "permissionFlags": [
                494
            ],
            "rowLevelPermissionFieldPermissions": [
                300
            ],
            "rowLevelPermissionPredicateGroups": [
                497
            ],
            "rowLevelPermissionPredicates": [
                496
            ],
            "rowLevelPermissionRules": [
                500
            ],
            "universalIdentifier": [
                581
            ],
            "workspaceMembers": [
                739
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
                581
            ],
            "roleId": [
                581
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
                499
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
                356
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
                498
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
                581
            ],
            "objectMetadataId": [
                581
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
                581
            ],
            "predicateGroups": [
                502
            ],
            "predicates": [
                503
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                581
            ],
            "logicalOperator": [
                498
            ],
            "position": [
                9
            ],
            "predicateGroups": [
                502
            ],
            "predicates": [
                503
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                581
            ],
            "id": [
                581
            ],
            "operand": [
                499
            ],
            "position": [
                9
            ],
            "relationFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "value": [
                356
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
                581
            ],
            "workspaceMemberRelationFilterFieldMetadataId": [
                581
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
                497
            ],
            "predicates": [
                496
            ],
            "ruleId": [
                581
            ],
            "uneditableFields": [
                581
            ],
            "unreadableFields": [
                581
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
                507
            ],
            "messages": [
                507
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                356
            ],
            "runAsWorkspaceMemberId": [
                581
            ],
            "thread": [
                510
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
                581
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
                506
            ],
            "content": [
                4
            ],
            "role": [
                508
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
                356
            ],
            "runId": [
                581
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                581
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
                581
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                513
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
                581
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                513
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
                581
            ],
            "id": [
                581
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                581
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
                581
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
                516
            ],
            "email": [
                517
            ],
            "idempotencyKey": [
                581
            ],
            "messageChannelId": [
                581
            ],
            "messageThreadId": [
                581
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
                581
            ],
            "messageThreadId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                581
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                581
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
                521
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
                524
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
                581
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
                356
            ],
            "toolCalls": [
                356
            ],
            "workspaceMemberIds": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                581
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
                737
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
                356
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                581
            ],
            "createdAt": [
                234
            ],
            "frontComponentId": [
                581
            ],
            "icon": [
                4
            ],
            "id": [
                581
            ],
            "position": [
                9
            ],
            "scope": [
                535
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                581
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
                581
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
                581
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                513
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
                105
            ],
            "workspace": [
                749
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
                581
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
                581
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
                492
            ],
            "configurationType": [
                723
            ],
            "__typename": [
                4
            ]
        },
        "StartAppChannelConversationInput": {
            "idempotencyKey": [
                581
            ],
            "messageChannelId": [
                581
            ],
            "personId": [
                581
            ],
            "text": [
                4
            ],
            "__typename": [
                4
            ]
        },
        "StartInteractiveConnectionInput": {
            "applicationId": [
                581
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                747
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
                581
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
                472,
                {
                    "input": [
                        216,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                374,
                {
                    "input": [
                        375,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                16,
                {
                    "agentUniversalIdentifier": [
                        581
                    ],
                    "runId": [
                        581
                    ],
                    "threadId": [
                        581
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
                553
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "TabPresenceStatus": {},
        "TasksConfiguration": {
            "configurationType": [
                723
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
                581
            ],
            "createdAt": [
                234
            ],
            "emit": [
                558
            ],
            "frontComponentUniversalIdentifier": [
                581
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                581
            ],
            "universalIdentifier": [
                581
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
                581
            ],
            "on": [
                4
            ],
            "through": [
                559
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                581
            ],
            "relationFieldUniversalIdentifier": [
                581
            ],
            "triggerFieldUniversalIdentifiers": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                723
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
                356
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
                581
            ],
            "personFilter": [
                356
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
                581
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
                234
            ],
            "__typename": [
                4
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                581
            ],
            "gt": [
                581
            ],
            "gte": [
                581
            ],
            "iLike": [
                581
            ],
            "in": [
                581
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                581
            ],
            "lt": [
                581
            ],
            "lte": [
                581
            ],
            "neq": [
                581
            ],
            "notILike": [
                581
            ],
            "notIn": [
                581
            ],
            "notLike": [
                581
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
                581
            ],
            "name": [
                4
            ],
            "updatedAt": [
                234
            ],
            "visibility": [
                585
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
                581
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
                581
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
                356
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
                356
            ],
            "roleId": [
                581
            ],
            "triggers": [
                356
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
                581
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
                581
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                581
            ],
            "visibility": [
                395
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
                592
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
                594
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
                581
            ],
            "update": [
                596
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
                581
            ],
            "availabilityType": [
                176
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
                581
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                356
            ],
            "description": [
                4
            ],
            "formula": [
                356
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
                356
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                581
            ],
            "options": [
                356
            ],
            "settings": [
                356
            ],
            "translations": [
                407
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
                581
            ],
            "update": [
                601
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
                581
            ],
            "update": [
                606
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                356
            ],
            "databaseEventTriggerSettings": [
                356
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                356
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
                356
            ],
            "workflowActionTriggerSettings": [
                356
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                581
            ],
            "update": [
                608
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                581
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
                581
            ],
            "update": [
                610
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                390
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
                397
            ],
            "visibility": [
                395
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                581
            ],
            "update": [
                612
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
                581
            ],
            "update": [
                612
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
                581
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
                581
            ],
            "parentId": [
                581
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
                581
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
                581
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
                426
            ],
            "shortcut": [
                4
            ],
            "translations": [
                407
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                581
            ],
            "update": [
                599
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                581
            ],
            "update": [
                614
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                581
            ],
            "update": [
                615
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
                581
            ],
            "type": [
                443
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
                442
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
                581
            ],
            "layoutMode": [
                442
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "widgets": [
                623
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "conditionalAvailability": [
                356
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                356
            ],
            "configuration": [
                356
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                581
            ],
            "pageLayoutTabId": [
                581
            ],
            "position": [
                356
            ],
            "title": [
                4
            ],
            "type": [
                724
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "conditionalAvailability": [
                356
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                356
            ],
            "configuration": [
                356
            ],
            "id": [
                581
            ],
            "objectMetadataId": [
                581
            ],
            "pageLayoutTabId": [
                581
            ],
            "position": [
                356
            ],
            "title": [
                4
            ],
            "type": [
                724
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
                581
            ],
            "tabs": [
                621
            ],
            "type": [
                443
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRelatedRecordPathInput": {
            "id": [
                581
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
                581
            ],
            "update": [
                627
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
                581
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
                555
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
                581
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                407
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
                585
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                581
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
                581
            ],
            "update": [
                634
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
                581
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
                581
            ],
            "update": [
                636
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
                581
            ],
            "update": [
                638
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
                707
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                581
            ],
            "logicalOperator": [
                712
            ],
            "parentViewFilterGroupId": [
                581
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                581
            ],
            "update": [
                641
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                581
            ],
            "operand": [
                713
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "value": [
                356
            ],
            "viewFilterGroupId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                581
            ],
            "update": [
                643
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                581
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
                581
            ],
            "calendarFieldMetadataId": [
                581
            ],
            "calendarLayout": [
                698
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "kanbanColumnWidth": [
                2
            ],
            "listPinnedFieldMetadataId": [
                581
            ],
            "mainGroupByFieldMetadataId": [
                581
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                716
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
                407
            ],
            "type": [
                720
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                581
            ],
            "update": [
                646
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                719
            ],
            "relationTargetFieldMetadataId": [
                581
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
                581
            ],
            "update": [
                648
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
                581
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
                356
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                581
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
                735
            ],
            "__typename": [
                4
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                356
            ],
            "workspaceMemberId": [
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                581
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                655
            ],
            "id": [
                581
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
                655
            ],
            "groups": [
                656
            ],
            "widgetId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                428
            ],
            "roleId": [
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                581
            ],
            "roleId": [
                581
            ],
            "rules": [
                501
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                497
            ],
            "predicates": [
                496
            ],
            "rules": [
                500
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                666
            ],
            "viewFields": [
                663
            ],
            "viewFilterGroups": [
                664
            ],
            "viewFilters": [
                665
            ],
            "viewSorts": [
                667
            ],
            "widgetId": [
                581
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
                581
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
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                581
            ],
            "logicalOperator": [
                712
            ],
            "parentViewFilterGroupId": [
                581
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
                581
            ],
            "id": [
                581
            ],
            "operand": [
                713
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "value": [
                356
            ],
            "viewFilterGroupId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                581
            ],
            "calendarFieldMetadataId": [
                581
            ],
            "calendarLayout": [
                698
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                581
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                581
            ],
            "openRecordIn": [
                716
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                720
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                719
            ],
            "fieldMetadataId": [
                581
            ],
            "id": [
                581
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
                682
            ],
            "usageByApplication": [
                671
            ],
            "usageByModel": [
                671
            ],
            "usageByOperationType": [
                671
            ],
            "usageByUser": [
                671
            ],
            "userDailyUsage": [
                684
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                674
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
                120
            ],
            "createdAt": [
                234
            ],
            "id": [
                581
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                674
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                681
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                683
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
                683
            ],
            "operationType": [
                674
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                673
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                677
            ],
            "resourceType": [
                681
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                675
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
                674
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                683
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
                674
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                681
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                683
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
                581
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                674
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
                120
            ],
            "resourceType": [
                681
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
                683
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
                682
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
                234
            ],
            "currentUserWorkspace": [
                689
            ],
            "currentWorkspace": [
                729
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
                581
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
                435
            ],
            "previousOnboardingStatus": [
                435
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                234
            ],
            "userVars": [
                357
            ],
            "userWorkspaces": [
                689
            ],
            "workspaceMember": [
                739
            ],
            "workspaceMembers": [
                739
            ],
            "workspaces": [
                689
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
                356
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
                581
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
                581
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
                581
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
                434
            ],
            "permissionFlags": [
                452
            ],
            "twoFactorAuthenticationMethodSummary": [
                577
            ],
            "updatedAt": [
                234
            ],
            "user": [
                685
            ],
            "userId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                581
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
                581
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
                581
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
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
                748
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
                581
            ],
            "calendarEndFieldMetadataId": [
                581
            ],
            "calendarFieldMetadataId": [
                581
            ],
            "calendarLayout": [
                698
            ],
            "createdAt": [
                234
            ],
            "createdByUserWorkspaceId": [
                581
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                581
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
                581
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                715
            ],
            "listPinnedFieldMetadataId": [
                581
            ],
            "mainGroupByFieldMetadataId": [
                581
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                581
            ],
            "openRecordIn": [
                716
            ],
            "position": [
                9
            ],
            "presetFilter": [
                717
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                720
            ],
            "universalIdentifier": [
                581
            ],
            "updatedAt": [
                234
            ],
            "viewFieldGroups": [
                701
            ],
            "viewFields": [
                700
            ],
            "viewFilterGroups": [
                711
            ],
            "viewFilters": [
                710
            ],
            "viewGroups": [
                714
            ],
            "viewSorts": [
                718
            ],
            "workspaceId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                723
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
                581
            ],
            "createdAt": [
                234
            ],
            "fieldMetadataId": [
                581
            ],
            "id": [
                581
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
                702
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "size": [
                9
            ],
            "universalIdentifier": [
                581
            ],
            "updatedAt": [
                234
            ],
            "viewFieldGroupId": [
                581
            ],
            "viewId": [
                581
            ],
            "workspaceId": [
                581
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
                581
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
                700
            ],
            "viewId": [
                581
            ],
            "workspaceId": [
                581
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
                704
            ],
            "filters": [
                703
            ],
            "limit": [
                2
            ],
            "sorts": [
                708
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilter": {
            "fieldMetadataId": [
                581
            ],
            "filterGroupId": [
                581
            ],
            "id": [
                581
            ],
            "operand": [
                713
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "value": [
                356
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroup": {
            "id": [
                581
            ],
            "logicalOperator": [
                712
            ],
            "parentFilterGroupId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroupInput": {
            "id": [
                581
            ],
            "logicalOperator": [
                712
            ],
            "parentFilterGroupId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterInput": {
            "fieldMetadataId": [
                581
            ],
            "filterGroupId": [
                581
            ],
            "id": [
                581
            ],
            "operand": [
                713
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "value": [
                356
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
                705
            ],
            "filters": [
                706
            ],
            "limit": [
                2
            ],
            "sorts": [
                709
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeSort": {
            "direction": [
                719
            ],
            "fieldMetadataId": [
                581
            ],
            "relationTargetFieldMetadataId": [
                581
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
                719
            ],
            "fieldMetadataId": [
                581
            ],
            "relationTargetFieldMetadataId": [
                581
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
                581
            ],
            "id": [
                581
            ],
            "operand": [
                713
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                234
            ],
            "value": [
                356
            ],
            "viewFilterGroupId": [
                581
            ],
            "viewId": [
                581
            ],
            "workspaceId": [
                581
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
                581
            ],
            "logicalOperator": [
                712
            ],
            "parentViewFilterGroupId": [
                581
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                234
            ],
            "viewId": [
                581
            ],
            "workspaceId": [
                581
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
                581
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
                581
            ],
            "workspaceId": [
                581
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
                719
            ],
            "fieldMetadataId": [
                581
            ],
            "id": [
                581
            ],
            "relationTargetFieldMetadataId": [
                581
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                234
            ],
            "viewId": [
                581
            ],
            "workspaceId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "ViewSortDirection": {},
        "ViewType": {},
        "Webhook": {
            "applicationId": [
                581
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
                581
            ],
            "operations": [
                4
            ],
            "role": [
                493
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
                360
            ],
            "on_MessageCampaignBodyConfiguration": [
                386
            ],
            "on_MessageCampaignDetailsConfiguration": [
                387
            ],
            "on_NotesConfiguration": [
                418
            ],
            "on_PieChartConfiguration": [
                453
            ],
            "on_RecordTableConfiguration": [
                483
            ],
            "on_StandaloneRichTextConfiguration": [
                542
            ],
            "on_TasksConfiguration": [
                556
            ],
            "on_TimelineConfiguration": [
                560
            ],
            "on_ViewConfiguration": [
                699
            ],
            "on_WorkflowConfiguration": [
                726
            ],
            "on_WorkflowRunConfiguration": [
                727
            ],
            "on_WorkflowVersionConfiguration": [
                728
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
                723
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                723
            ],
            "__typename": [
                4
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                723
            ],
            "__typename": [
                4
            ]
        },
        "Workspace": {
            "activationStatus": [
                730
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
                356
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
                234
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
                493
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
                581
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
                581
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
                700
            ],
            "viewFilterGroups": [
                711
            ],
            "viewFilters": [
                710
            ],
            "viewGroups": [
                714
            ],
            "viewSorts": [
                718
            ],
            "views": [
                697
            ],
            "workspaceCustomApplication": [
                59
            ],
            "workspaceCustomApplicationId": [
                4
            ],
            "workspaceDiscoverability": [
                735
            ],
            "workspaceMembersCount": [
                9
            ],
            "workspaceUrls": [
                748
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
                356
            ],
            "outcome": [
                732
            ],
            "personEnrichment": [
                356
            ],
            "personOutcome": [
                746
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
                581
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
                581
            ],
            "roleId": [
                581
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
                741
            ],
            "id": [
                581
            ],
            "locale": [
                4
            ],
            "name": [
                316
            ],
            "numberFormat": [
                742
            ],
            "openRecordIn": [
                438
            ],
            "roles": [
                493
            ],
            "timeFormat": [
                743
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
                581
            ],
            "userWorkspaceId": [
                581
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                581
            ],
            "variables": [
                686
            ],
            "workspaceMemberId": [
                581
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
                356
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
                581
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
                581
            ],
            "workspaceUrls": [
                748
            ],
            "__typename": [
                4
            ]
        }
    }
}