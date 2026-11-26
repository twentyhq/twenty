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
        279,
        285,
        289,
        293,
        296,
        303,
        320,
        322,
        328,
        330,
        343,
        350,
        351,
        352,
        364,
        366,
        384,
        385,
        386,
        387,
        388,
        389,
        391,
        392,
        393,
        396,
        397,
        399,
        402,
        407,
        411,
        420,
        427,
        429,
        432,
        436,
        437,
        442,
        446,
        470,
        472,
        473,
        481,
        492,
        493,
        502,
        507,
        529,
        542,
        543,
        545,
        547,
        573,
        575,
        577,
        645,
        666,
        673,
        675,
        679,
        690,
        704,
        705,
        707,
        708,
        709,
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
                573
            ],
            "workspaceMemberIds": [
                573
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
                350
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
                573
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
                573
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
                350
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
                350
            ],
            "roleId": [
                573
            ],
            "triggers": [
                350
            ],
            "universalIdentifier": [
                573
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
                573
            ],
            "color": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
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
                573
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
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                350
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
                573
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
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "AgentMessage": {
            "agentId": [
                573
            ],
            "createdAt": [
                233
            ],
            "id": [
                573
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
                573
            ],
            "senderUserWorkspaceId": [
                573
            ],
            "senderWorkspaceMemberId": [
                573
            ],
            "status": [
                4
            ],
            "threadId": [
                573
            ],
            "turnId": [
                573
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
                573
            ],
            "fileMediaType": [
                4
            ],
            "fileUrl": [
                4
            ],
            "id": [
                573
            ],
            "messageId": [
                573
            ],
            "orderIndex": [
                2
            ],
            "providerExecuted": [
                1
            ],
            "providerMetadata": [
                350
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
                350
            ],
            "toolName": [
                4
            ],
            "toolOutput": [
                350
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
                573
            ],
            "emoji": [
                4
            ],
            "hasAssistantReacted": [
                1
            ],
            "workspaceMemberIds": [
                573
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
                573
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
                573
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
                573
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
                573
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
                573
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
                573
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
                350
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
                465
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
                573
            ],
            "name": [
                4
            ],
            "revokedAt": [
                233
            ],
            "role": [
                487
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
                573
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
                350
            ],
            "__typename": [
                4
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                573
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
                573
            ],
            "role": [
                393
            ],
            "workspaceMemberId": [
                573
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
                573
            ],
            "applicationVariables": [
                99
            ],
            "autoUpgrade": [
                1
            ],
            "availablePackages": [
                350
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
                487
            ],
            "defaultRoleId": [
                4
            ],
            "description": [
                4
            ],
            "frontComponents": [
                310
            ],
            "grantRoleId": [
                573
            ],
            "grantedIframeMediaPermissions": [
                332
            ],
            "healthCheckLogicFunctionId": [
                573
            ],
            "id": [
                573
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                1
            ],
            "logicFunctions": [
                363
            ],
            "logoFileId": [
                573
            ],
            "logoUrl": [
                4
            ],
            "name": [
                4
            ],
            "objects": [
                413
            ],
            "packageJsonChecksum": [
                4
            ],
            "packageJsonFileId": [
                573
            ],
            "requestedIframeMediaPermissions": [
                332
            ],
            "requestedRoleId": [
                573
            ],
            "runHealthCheckOnUserPreferences": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                573
            ],
            "settingsMenuItems": [
                528
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                573
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
                573
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
                573
            ],
            "workspaceId": [
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                573
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
                461
            ],
            "connectionProviderId": [
                573
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
                573
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
                573
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
                573
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
                573
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
                350
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
                573
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
                303
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
                303
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
                303
            ],
            "fileId": [
                573
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
                573
            ],
            "connectionProviders": [
                69
            ],
            "settingsMenuItems": [
                528
            ],
            "variables": [
                678
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
                573
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
                573
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
                688
            ],
            "__typename": [
                4
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                573
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
                573
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
                350
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
                573
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
                350
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
                573
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
                573
            ],
            "workspaceMemberIds": [
                573
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
                506
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
                573
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
                505
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
                573
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
                350
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
                427
            ],
            "primaryAxisGroupByFieldMetadataId": [
                573
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                328
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                427
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                573
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                328
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
                350
            ],
            "formattedToRawLookup": [
                350
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
                350
            ],
            "objectMetadataId": [
                573
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
                573
            ],
            "stripeCustomerEmail": [
                4
            ],
            "userCreditsFallback": [
                679
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
                543
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
                542
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
                573
            ],
            "interval": [
                542
            ],
            "metadata": [
                350
            ],
            "phases": [
                140
            ],
            "status": [
                543
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
                573
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
                573
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
                573
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
                350
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
                407
            ],
            "modelFamilyLabel": [
                4
            ],
            "modelId": [
                4
            ],
            "nativeCapabilities": [
                409
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
                459
            ],
            "publicFunctionDomain": [
                4
            ],
            "sentry": [
                526
            ],
            "serverUrl": [
                4
            ],
            "signInPrefilled": [
                1
            ],
            "support": [
                544
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
                573
            ],
            "availabilityCoreObjectName": [
                4
            ],
            "availabilityObjectMetadataId": [
                573
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
                573
            ],
            "createdAt": [
                233
            ],
            "engineComponentKey": [
                267
            ],
            "frontComponent": [
                310
            ],
            "frontComponentId": [
                573
            ],
            "hotKeys": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "pageLayoutId": [
                573
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
                573
            ],
            "updatedAt": [
                233
            ],
            "workflowVersionId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                419
            ],
            "on_PathCommandMenuItemPayload": [
                444
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
                301
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
                573
            ],
            "providerName": [
                4
            ],
            "reconnectingConnectedAccountId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                573
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
                461
            ],
            "connectionProviderId": [
                573
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
                573
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
                573
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
                335
            ],
            "handle": [
                4
            ],
            "id": [
                573
            ],
            "provider": [
                4
            ],
            "userWorkspaceId": [
                573
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
                573
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
                350
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
                350
            ],
            "roleId": [
                573
            ],
            "triggers": [
                350
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                573
            ],
            "displayName": [
                4
            ],
            "handle": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                573
            ],
            "participantHandleFieldUniversalIdentifier": [
                573
            ],
            "visibility": [
                389
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
                573
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
                573
            ],
            "engineComponentKey": [
                267
            ],
            "frontComponentId": [
                573
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
                573
            ],
            "pageLayoutId": [
                573
            ],
            "payload": [
                350
            ],
            "position": [
                9
            ],
            "shortLabel": [
                4
            ],
            "workflowVersionId": [
                573
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
                383
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
                350
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
                350
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                573
            ],
            "options": [
                350
            ],
            "relationCreationPayload": [
                350
            ],
            "settings": [
                350
            ],
            "type": [
                296
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
                573
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
                573
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
                343
            ],
            "objectMetadataId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                350
            ],
            "databaseEventTriggerSettings": [
                350
            ],
            "description": [
                4
            ],
            "httpRouteTriggerSettings": [
                350
            ],
            "id": [
                573
            ],
            "name": [
                4
            ],
            "serverRouteTriggerSettings": [
                350
            ],
            "source": [
                350
            ],
            "timeoutSeconds": [
                9
            ],
            "toolTriggerSettings": [
                350
            ],
            "universalIdentifier": [
                573
            ],
            "workflowActionTriggerSettings": [
                350
            ],
            "__typename": [
                4
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                573
            ],
            "id": [
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                573
            ],
            "agentId": [
                573
            ],
            "builtInSectionKey": [
                4
            ],
            "color": [
                4
            ],
            "folderId": [
                573
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "parentId": [
                573
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                573
            ],
            "targetRecordId": [
                573
            ],
            "type": [
                411
            ],
            "userWorkspaceId": [
                573
            ],
            "viewId": [
                573
            ],
            "workflowId": [
                573
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
                350
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
                573
            ],
            "type": [
                437
            ],
            "__typename": [
                4
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                436
            ],
            "pageLayoutId": [
                573
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
                350
            ],
            "configuration": [
                350
            ],
            "objectMetadataId": [
                573
            ],
            "pageLayoutTabId": [
                573
            ],
            "position": [
                350
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
                573
            ],
            "filter": [
                350
            ],
            "objectMetadataId": [
                573
            ],
            "orderBy": [
                350
            ],
            "__typename": [
                4
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                573
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                573
            ],
            "secondFieldMetadataId": [
                573
            ],
            "thirdFieldMetadataId": [
                573
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
                573
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
                577
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
                666
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                673
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                675
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
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                573
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
                573
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
                573
            ],
            "id": [
                573
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
                699
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                573
            ],
            "viewId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                573
            ],
            "logicalOperator": [
                704
            ],
            "parentViewFilterGroupId": [
                573
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                573
            ],
            "id": [
                573
            ],
            "operand": [
                705
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "value": [
                350
            ],
            "viewFilterGroupId": [
                573
            ],
            "viewId": [
                573
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
                573
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewId": [
                573
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
                573
            ],
            "calendarFieldMetadataId": [
                573
            ],
            "calendarLayout": [
                690
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                707
            ],
            "listPinnedFieldMetadataId": [
                573
            ],
            "mainGroupByFieldMetadataId": [
                573
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                573
            ],
            "openRecordIn": [
                708
            ],
            "position": [
                9
            ],
            "presetFilter": [
                709
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                712
            ],
            "__typename": [
                4
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                711
            ],
            "fieldMetadataId": [
                573
            ],
            "id": [
                573
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "viewId": [
                573
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
                573
            ],
            "operations": [
                4
            ],
            "roleId": [
                573
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
                666
            ],
            "resource": [
                673
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                573
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
                573
            ],
            "name": [
                313
            ],
            "userEmail": [
                4
            ],
            "userWorkspaceId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                573
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
                573
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
                573
            ],
            "pageLayoutId": [
                573
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
                573
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
                573
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                507
            ],
            "type": [
                330
            ],
            "__typename": [
                4
            ]
        },
        "EditSsoInput": {
            "id": [
                573
            ],
            "status": [
                507
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
                573
            ],
            "status": [
                264
            ],
            "tenantStatus": [
                265
            ],
            "unsubscribeHostnameStatus": [
                575
            ],
            "updatedAt": [
                233
            ],
            "verificationRecords": [
                685
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
                350
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
                350
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
            "limiter": [
                272
            ],
            "logicFunctionUniversalIdentifier": [
                4
            ],
            "payloads": [
                350
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
                274
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
                279
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
                277
            ],
            "eventType": [
                4
            ],
            "fieldFilters": [
                278
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
                280
            ],
            "first": [
                2
            ],
            "table": [
                285
            ],
            "__typename": [
                4
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                281
            ],
            "records": [
                284
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
                350
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
                398
            ],
            "objectRecordEventsWithQueryIds": [
                426
            ],
            "queueJobEvents": [
                353
            ],
            "__typename": [
                4
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                573
            ],
            "payload": [
                350
            ],
            "__typename": [
                4
            ]
        },
        "FeatureFlag": {
            "key": [
                289
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
                573
            ],
            "createdAt": [
                233
            ],
            "defaultValue": [
                350
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
                573
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
                573
            ],
            "morphRelations": [
                480
            ],
            "name": [
                4
            ],
            "object": [
                413
            ],
            "objectMetadataId": [
                573
            ],
            "options": [
                350
            ],
            "relation": [
                480
            ],
            "settings": [
                350
            ],
            "type": [
                296
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
                293
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
                294
            ],
            "pageInfo": [
                433
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
                290
            ],
            "__typename": [
                4
            ]
        },
        "FieldFilter": {
            "and": [
                295
            ],
            "id": [
                574
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
                574
            ],
            "or": [
                295
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
                573
            ],
            "id": [
                573
            ],
            "objectMetadataId": [
                573
            ],
            "roleId": [
                573
            ],
            "rowLevelPermissionPredicateGroupId": [
                573
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
                573
            ],
            "objectMetadataId": [
                573
            ],
            "rowLevelPermissionPredicateGroupId": [
                573
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
                573
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
                573
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
                573
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
                573
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
                573
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                507
            ],
            "type": [
                330
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
                396
            ],
            "searchTerm": [
                4
            ],
            "unsubscribeTopicId": [
                573
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
                332
            ],
            "applicationId": [
                573
            ],
            "applicationName": [
                4
            ],
            "applicationTokenPair": [
                98
            ],
            "applicationVariables": [
                350
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
                573
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
                573
            ],
            "updatedAt": [
                233
            ],
            "usesSdkClient": [
                1
            ],
            "widgetAvailability": [
                312
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
                573
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                573
            ],
            "pageLayoutType": [
                437
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
                501
            ],
            "instructions": [
                4
            ],
            "modelId": [
                4
            ],
            "responseFormat": [
                350
            ],
            "runId": [
                573
            ],
            "scope": [
                350
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
                350
            ],
            "runId": [
                573
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
                573
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
                573
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
                573
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
                320
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                320
            ],
            "snoozedUntil": [
                4
            ],
            "steps": [
                321
            ],
            "__typename": [
                4
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                320
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
                322
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
                325
            ],
            "stepActionKey": [
                320
            ],
            "trigger": [
                326
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
                573
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
                336
            ],
            "IMAP": [
                336
            ],
            "SMTP": [
                336
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
                573
            ],
            "threadId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "Index": {
            "applicationId": [
                573
            ],
            "createdAt": [
                233
            ],
            "id": [
                573
            ],
            "indexFieldMetadataList": [
                341
            ],
            "indexType": [
                343
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
                339
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
                573
            ],
            "id": [
                573
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
                342
            ],
            "id": [
                574
            ],
            "isCustom": [
                144
            ],
            "or": [
                342
            ],
            "__typename": [
                4
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                573
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
                346
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
                573
            ],
            "messageThreadId": [
                573
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
                352
            ],
            "__typename": [
                4
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                573
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
                350
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
                427
            ],
            "primaryAxisGroupByFieldMetadataId": [
                573
            ],
            "primaryAxisGroupBySubFieldName": [
                4
            ],
            "primaryAxisManualSortOrder": [
                4
            ],
            "primaryAxisOrderBy": [
                328
            ],
            "rangeMax": [
                9
            ],
            "rangeMin": [
                9
            ],
            "secondaryAxisGroupByDateGranularity": [
                427
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                573
            ],
            "secondaryAxisGroupBySubFieldName": [
                4
            ],
            "secondaryAxisManualSortOrder": [
                4
            ],
            "secondaryAxisOrderBy": [
                328
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
                350
            ],
            "hasTooManyGroups": [
                1
            ],
            "series": [
                358
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
                350
            ],
            "objectMetadataId": [
                573
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
                357
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                573
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
                573
            ],
            "canRunOnDemand": [
                1
            ],
            "createdAt": [
                233
            ],
            "cronTriggerSettings": [
                350
            ],
            "databaseEventTriggerSettings": [
                350
            ],
            "description": [
                4
            ],
            "executionMode": [
                364
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                350
            ],
            "id": [
                573
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
                350
            ],
            "universalIdentifier": [
                573
            ],
            "updatedAt": [
                233
            ],
            "workflowActionTriggerSettings": [
                350
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                350
            ],
            "duration": [
                9
            ],
            "error": [
                350
            ],
            "logs": [
                4
            ],
            "status": [
                366
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                573
            ],
            "applicationUniversalIdentifier": [
                573
            ],
            "id": [
                573
            ],
            "name": [
                4
            ],
            "universalIdentifier": [
                573
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
                573
            ],
            "messageThreadId": [
                573
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
                350
            ],
            "name": [
                4
            ],
            "objects": [
                374
            ],
            "pricingDescription": [
                4
            ],
            "requestedCapabilities": [
                4
            ],
            "requestedIframeMediaPermissions": [
                332
            ],
            "roles": [
                375
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
                376
            ],
            "icon": [
                4
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                377
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
                573
            ],
            "connectionProviderId": [
                573
            ],
            "createdAt": [
                233
            ],
            "id": [
                573
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
                379
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
                350
            ],
            "description": [
                4
            ],
            "inputSchema": [
                350
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
                573
            ],
            "contactAutoCreationPolicy": [
                384
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
                573
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
                391
            ],
            "messagingProviderUniversalIdentifier": [
                573
            ],
            "participantHandleFieldUniversalIdentifier": [
                573
            ],
            "pendingGroupEmailsAction": [
                385
            ],
            "syncStage": [
                386
            ],
            "syncStageStartedAt": [
                233
            ],
            "syncStatus": [
                387
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
                388
            ],
            "updatedAt": [
                233
            ],
            "visibility": [
                389
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
                573
            ],
            "isSentFolder": [
                1
            ],
            "isSynced": [
                1
            ],
            "messageChannelId": [
                573
            ],
            "name": [
                4
            ],
            "parentFolderId": [
                4
            ],
            "pendingSyncAction": [
                392
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
                573
            ],
            "reason": [
                396
            ],
            "source": [
                397
            ],
            "unsubscribeTopicId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "MessageSuppressionList": {
            "records": [
                394
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
                425
            ],
            "recordId": [
                4
            ],
            "type": [
                399
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
                573
            ],
            "property": [
                4
            ],
            "provenance": [
                402
            ],
            "recordId": [
                573
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
                573
            ],
            "locale": [
                4
            ],
            "objectMetadataId": [
                573
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
                405
            ],
            "views": [
                406
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
                573
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
                573
            ],
            "key": [
                707
            ],
            "objectMetadataId": [
                573
            ],
            "type": [
                712
            ],
            "__typename": [
                4
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                535,
                {
                    "id": [
                        573,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                573,
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
                        573,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        333,
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
                        573
                    ],
                    "threadId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                1,
                {
                    "agentId": [
                        573,
                        "UUID!"
                    ],
                    "roleId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                1,
                {
                    "apiKeyId": [
                        573,
                        "UUID!"
                    ],
                    "roleId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                1,
                {
                    "input": [
                        338,
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
                        542,
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
                        573,
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
                        573,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                431,
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
                305,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                305,
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
                305,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                305,
                {
                    "fileId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "connectApplicationWithApiKey": [
                573,
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
                383,
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
                        573
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
                304,
                {
                    "fieldMetadataId": [
                        4
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        4
                    ],
                    "fileFolder": [
                        303,
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
                310,
                {
                    "input": [
                        201,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                410,
                {
                    "inputs": [
                        207,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                693,
                {
                    "inputs": [
                        222,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                692,
                {
                    "inputs": [
                        223,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                706,
                {
                    "inputs": [
                        226,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                378,
                {
                    "input": [
                        205,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                394,
                {
                    "input": [
                        206,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                410,
                {
                    "input": [
                        207,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                304,
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
                532,
                {
                    "input": [
                        530,
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
                        573,
                        "UUID!"
                    ],
                    "properties": [
                        350
                    ],
                    "recordId": [
                        573,
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
                290,
                {
                    "input": [
                        209,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                339,
                {
                    "input": [
                        210,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                363,
                {
                    "input": [
                        204,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                413,
                {
                    "input": [
                        211,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                487,
                {
                    "createRoleInput": [
                        217,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                434,
                {
                    "input": [
                        212,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                435,
                {
                    "input": [
                        213,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                438,
                {
                    "input": [
                        214,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                458,
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
                479,
                {
                    "input": [
                        216,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                532,
                {
                    "input": [
                        531,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                535,
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
                        542,
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
                576,
                {
                    "input": [
                        219,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                664,
                {
                    "input": [
                        220,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                684,
                {
                    "input": [
                        221,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                689,
                {
                    "input": [
                        227,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                692,
                {
                    "input": [
                        223,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                693,
                {
                    "input": [
                        222,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                702,
                {
                    "input": [
                        225,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                703,
                {
                    "input": [
                        224,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                706,
                {
                    "input": [
                        226,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                710,
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
                535,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                1,
                {
                    "channelId": [
                        573,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        573
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
                383,
                {
                    "id": [
                        573,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                180,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                721
            ],
            "deleteEmailGroupChannel": [
                383,
                {
                    "id": [
                        573,
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
                310,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                410,
                {
                    "ids": [
                        573,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                378,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                1,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                410,
                {
                    "id": [
                        573,
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
                290,
                {
                    "input": [
                        235,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                339,
                {
                    "input": [
                        236,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                363,
                {
                    "input": [
                        367,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                413,
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
                        573,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                479,
                {
                    "id": [
                        573,
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
                535,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                240,
                {
                    "twoFactorAuthenticationMethodId": [
                        573,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                677
            ],
            "deleteUserFromWorkspace": [
                681,
                {
                    "workspaceMemberIdToDelete": [
                        4,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                684,
                {
                    "id": [
                        573,
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
                692,
                {
                    "input": [
                        242,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                693,
                {
                    "input": [
                        241,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                702,
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
                706,
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
                        573,
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
                692,
                {
                    "input": [
                        248,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                693,
                {
                    "input": [
                        247,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                702,
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
                706,
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
                        338,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                180,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                255,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                256,
                {
                    "id": [
                        573,
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
                        573
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
                273,
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
                365,
                {
                    "input": [
                        287,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                315,
                {
                    "input": [
                        314,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                51,
                {
                    "apiKeyId": [
                        573,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                105
            ],
            "generateTransientToken": [
                554
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                568,
                {
                    "otp": [
                        4
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                570,
                {
                    "otp": [
                        4
                    ],
                    "userId": [
                        573,
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
                571,
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
                317,
                {
                    "input": [
                        318,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                370,
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
                430
            ],
            "grantApplicationCapabilities": [
                66,
                {
                    "input": [
                        327,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                337,
                {
                    "userId": [
                        573,
                        "UUID!"
                    ],
                    "workspaceId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                345,
                {
                    "input": [
                        344,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                347,
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
                347
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "markAppChannelThreadAsRead": [
                1,
                {
                    "input": [
                        371,
                        "MarkAppChannelThreadAsReadInput!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                1,
                {
                    "channelId": [
                        573
                    ],
                    "threadId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                573,
                {
                    "workspaceMemberId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                323,
                {
                    "stepActionKey": [
                        320,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                1
            ],
            "releaseEnterpriseServerBinding": [
                275
            ],
            "removeAgentChatMessageReaction": [
                26,
                {
                    "emoji": [
                        4,
                        "String!"
                    ],
                    "messageId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                1,
                {
                    "input": [
                        482,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                474,
                {
                    "principal": [
                        471,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        478,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                1,
                {
                    "agentId": [
                        573,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                1,
                {
                    "input": [
                        483,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                484,
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
                522,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                435,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                434,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                438,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                549,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                514,
                {
                    "modelId": [
                        4
                    ],
                    "threadId": [
                        573,
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
                        485,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                1,
                {
                    "userId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                1,
                {
                    "userSessionId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "revokeWorkspaceApplicationAuthorization": [
                1,
                {
                    "applicationAuthorizationId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                489,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                503,
                {
                    "input": [
                        499,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                83,
                {
                    "applicationId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                334,
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
                        573
                    ]
                }
            ],
            "sendAppChannelMessage": [
                513,
                {
                    "input": [
                        512,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                514,
                {
                    "browsingContext": [
                        350
                    ],
                    "channelId": [
                        573
                    ],
                    "fileAttachments": [
                        302,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        1
                    ],
                    "isAssistantParticipant": [
                        1
                    ],
                    "mentionedWorkspaceMemberIds": [
                        573,
                        "[UUID!]"
                    ],
                    "messageId": [
                        573,
                        "UUID!"
                    ],
                    "modelId": [
                        4
                    ],
                    "recipientWorkspaceMemberIds": [
                        573,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                517,
                {
                    "input": [
                        516,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                521,
                {
                    "input": [
                        520,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                522,
                {
                    "emails": [
                        4,
                        "[String!]!"
                    ],
                    "roleId": [
                        573
                    ]
                }
            ],
            "sendMessageCampaign": [
                524,
                {
                    "input": [
                        523,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                519,
                {
                    "input": [
                        525,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                53,
                {
                    "input": [
                        527,
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
                275,
                {
                    "enterpriseKey": [
                        4,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                474,
                {
                    "isPrivate": [
                        1,
                        "Boolean!"
                    ],
                    "target": [
                        478,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                474,
                {
                    "accessLevel": [
                        470,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        471,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        478,
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
                533,
                {
                    "input": [
                        534
                    ]
                }
            ],
            "signUpInWorkspace": [
                533,
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
                        573
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
                431,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                161,
                {
                    "connectedAccountId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                537,
                {
                    "companyContext": [
                        350
                    ],
                    "personContext": [
                        350
                    ]
                }
            ],
            "stopAgentChatStream": [
                1,
                {
                    "threadId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "stopGenerate": [
                1,
                {
                    "input": [
                        538,
                        "StopGenerateInput!"
                    ]
                }
            ],
            "stopImpersonation": [
                539
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
                390,
                {
                    "input": [
                        546,
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
                        350,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                1
            ],
            "syncMcpServerTools": [
                378,
                {
                    "id": [
                        573,
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
                        350
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
                556,
                {
                    "input": [
                        555,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                560,
                {
                    "input": [
                        557,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                559,
                {
                    "input": [
                        558,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                564,
                {
                    "input": [
                        561,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                563,
                {
                    "input": [
                        562,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                566,
                {
                    "input": [
                        565,
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
                        573,
                        "UUID!"
                    ],
                    "input": [
                        578,
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
                        573,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                49,
                {
                    "input": [
                        580,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                383,
                {
                    "input": [
                        581,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                59,
                {
                    "id": [
                        573,
                        "UUID!"
                    ],
                    "input": [
                        582,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                93,
                {
                    "input": [
                        583,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                97,
                {
                    "input": [
                        585,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                145,
                {
                    "input": [
                        587,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                175,
                {
                    "input": [
                        589,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                383,
                {
                    "input": [
                        590,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                310,
                {
                    "input": [
                        592,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                319,
                {
                    "input": [
                        594,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateInboxNotificationSettings": [
                681,
                {
                    "input": [
                        595,
                        "UpdateInboxNotificationSettingsInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                288,
                {
                    "input": [
                        596,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                410,
                {
                    "inputs": [
                        609,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                413,
                {
                    "inputs": [
                        610,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                706,
                {
                    "inputs": [
                        634,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                378,
                {
                    "input": [
                        599,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                383,
                {
                    "input": [
                        601,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                390,
                {
                    "input": [
                        603,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                390,
                {
                    "input": [
                        605,
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
                410,
                {
                    "input": [
                        609,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                7,
                {
                    "input": [
                        579,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                1,
                {
                    "applicationId": [
                        573
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
                290,
                {
                    "input": [
                        608,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                1,
                {
                    "input": [
                        597,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                413,
                {
                    "input": [
                        610,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                487,
                {
                    "updateRoleInput": [
                        618,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                434,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        611,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                435,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        612,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                438,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        614,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                434,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        616,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                348,
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
                479,
                {
                    "input": [
                        617,
                        "UpdateRelatedRecordPathInput!"
                    ]
                }
            ],
            "updateSkill": [
                535,
                {
                    "input": [
                        620,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTabPresence": [
                1,
                {
                    "input": [
                        621,
                        "UpdateTabPresenceInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                549,
                {
                    "input": [
                        622,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                576,
                {
                    "input": [
                        623,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                664,
                {
                    "input": [
                        624,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                122,
                {
                    "userCreditsFallback": [
                        679,
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
                684,
                {
                    "input": [
                        625,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                689,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        636,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                692,
                {
                    "input": [
                        629,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                693,
                {
                    "input": [
                        627,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                702,
                {
                    "input": [
                        632,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                703,
                {
                    "id": [
                        4,
                        "String!"
                    ],
                    "input": [
                        631,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                706,
                {
                    "input": [
                        634,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                710,
                {
                    "input": [
                        637,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                713,
                {
                    "input": [
                        639,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                721,
                {
                    "data": [
                        643,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                721,
                {
                    "data": [
                        641,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                721,
                {
                    "data": [
                        642,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                731,
                {
                    "roleId": [
                        573,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                1,
                {
                    "input": [
                        644,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "uploadAppTarball": [
                93,
                {
                    "file": [
                        645,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "uploadApplicationFile": [
                301,
                {
                    "applicationUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        645,
                        "Upload!"
                    ],
                    "fileFolder": [
                        303,
                        "FileFolder!"
                    ],
                    "filePath": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                305,
                {
                    "fieldMetadataUniversalIdentifier": [
                        4,
                        "String!"
                    ],
                    "file": [
                        645,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                305,
                {
                    "file": [
                        645,
                        "Upload!"
                    ],
                    "workspaceId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                305,
                {
                    "file": [
                        645,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                305,
                {
                    "file": [
                        645,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                297,
                {
                    "upsertFieldPermissionsInput": [
                        646,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                689,
                {
                    "input": [
                        649,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                421,
                {
                    "upsertObjectPermissionsInput": [
                        650,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                488,
                {
                    "upsertPermissionFlagsInput": [
                        651,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionRules": [
                653,
                {
                    "input": [
                        652,
                        "UpsertRowLevelPermissionRulesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                689,
                {
                    "input": [
                        654,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "upsertWebPushSubscription": [
                1,
                {
                    "input": [
                        660,
                        "UpsertWebPushSubscriptionInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                101,
                {
                    "input": [
                        682,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                686,
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
                687,
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
                573
            ],
            "agentId": [
                573
            ],
            "applicationId": [
                573
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
                573
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "parentId": [
                573
            ],
            "position": [
                9
            ],
            "targetObjectMetadataId": [
                573
            ],
            "targetRecordId": [
                573
            ],
            "targetRecordIdentifier": [
                467
            ],
            "type": [
                411
            ],
            "universalIdentifier": [
                573
            ],
            "updatedAt": [
                233
            ],
            "userWorkspaceId": [
                573
            ],
            "viewId": [
                573
            ],
            "workflowId": [
                573
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
                573
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
                416,
                {
                    "filter": [
                        295,
                        "FieldFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                290
            ],
            "icon": [
                4
            ],
            "id": [
                573
            ],
            "imageIdentifierFieldMetadataId": [
                573
            ],
            "indexMetadataList": [
                339
            ],
            "indexMetadatas": [
                418,
                {
                    "filter": [
                        342,
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
                573
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
                420
            ],
            "searchFieldMetadataList": [
                509
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
                415
            ],
            "pageInfo": [
                433
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
                413
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                294
            ],
            "pageInfo": [
                433
            ],
            "__typename": [
                4
            ]
        },
        "ObjectFilter": {
            "and": [
                417
            ],
            "id": [
                574
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
                417
            ],
            "universalIdentifier": [
                574
            ],
            "__typename": [
                4
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                340
            ],
            "pageInfo": [
                433
            ],
            "__typename": [
                4
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                573
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
                573
            ],
            "restrictedFields": [
                350
            ],
            "rowLevelPermissionPredicateGroups": [
                491
            ],
            "rowLevelPermissionPredicates": [
                490
            ],
            "uneditableFields": [
                573
            ],
            "unreadableFields": [
                573
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
                573
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
                425
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
                350
            ],
            "before": [
                350
            ],
            "diff": [
                350
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
                424
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
                573
            ],
            "restrictedFields": [
                350
            ],
            "rowLevelRecordsPermissions": [
                498
            ],
            "uneditableFields": [
                573
            ],
            "unreadableFields": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                429
            ],
            "previousOnboardingStatus": [
                429
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
                573
            ],
            "createdAt": [
                233
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                573
            ],
            "deletedAt": [
                233
            ],
            "id": [
                573
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
                573
            ],
            "tabs": [
                435
            ],
            "type": [
                437
            ],
            "universalIdentifier": [
                573
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
                573
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
                573
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
                436
            ],
            "pageLayoutId": [
                573
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                573
            ],
            "updatedAt": [
                233
            ],
            "widgets": [
                438
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                332
            ],
            "applicationId": [
                573
            ],
            "applicationName": [
                4
            ],
            "conditionalAvailability": [
                350
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                350
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
                329
            ],
            "id": [
                573
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
                573
            ],
            "pageLayoutTabId": [
                573
            ],
            "position": [
                441
            ],
            "title": [
                4
            ],
            "type": [
                716
            ],
            "universalIdentifier": [
                573
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
                436
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
                436
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
                439
            ],
            "on_PageLayoutWidgetGridPosition": [
                440
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                443
            ],
            "__typename": [
                4
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                442
            ],
            "index": [
                2
            ],
            "layoutMode": [
                436
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
                573
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
                573
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
                573
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
                573
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
                427
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
                350
            ],
            "firstDayOfTheWeek": [
                2
            ],
            "groupByFieldMetadataId": [
                573
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
                328
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
                450
            ],
            "formattedToRawLookup": [
                350
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
                350
            ],
            "objectMetadataId": [
                573
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
                362
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
                382
            ],
            "__typename": [
                4
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                573
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
                573
            ],
            "handle": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "createdAt": [
                233
            ],
            "domain": [
                4
            ],
            "id": [
                573
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
                289
            ],
            "metadata": [
                460
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
                457
            ],
            "IMAP": [
                457
            ],
            "SMTP": [
                457
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
                573
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
                573
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
                        573,
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
                        573,
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
                        573,
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
                        316,
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
                        359
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
                383,
                {
                    "filter": [
                        360
                    ]
                }
            ],
            "appMessageFolders": [
                390,
                {
                    "filter": [
                        361
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                67,
                {
                    "applicationId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                69,
                {
                    "applicationId": [
                        573,
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
                508,
                {
                    "applicationId": [
                        573,
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
                456
            ],
            "callRecordingIdForCalendarEvent": [
                573,
                {
                    "calendarEventId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                24,
                {
                    "agentUniversalIdentifier": [
                        573
                    ],
                    "threadId": [
                        573
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
                        573
                    ],
                    "threadId": [
                        573
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
                        573,
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
                540,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                175
            ],
            "currentUser": [
                677
            ],
            "currentUserApplicationAuthorizations": [
                60
            ],
            "currentUserSessions": [
                680
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
                276
            ],
            "eventLogs": [
                283,
                {
                    "input": [
                        282,
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
                        573,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                290,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                292,
                {
                    "filter": [
                        295,
                        "FieldFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                455,
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
                353,
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
                363
            ],
            "findManyMarketplaceApps": [
                372,
                {
                    "universalIdentifiers": [
                        4,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                458
            ],
            "findMarketplaceAppDetail": [
                373,
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
                        573
                    ],
                    "universalIdentifier": [
                        573
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
                363,
                {
                    "input": [
                        367,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                353,
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
                353,
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
                310,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                310
            ],
            "getAddressDetails": [
                451,
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
                487
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
                350,
                {
                    "input": [
                        367,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                182,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                263
            ],
            "getInviteSuggestions": [
                349
            ],
            "getJobs": [
                353,
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
                        367,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                434,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                435,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                435,
                {
                    "pageLayoutId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                438,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                438,
                {
                    "pageLayoutTabId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                434,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "pageLayoutType": [
                        437
                    ]
                }
            ],
            "getPermissionFlags": [
                445
            ],
            "getPublicWorkspaceDataByDomain": [
                462,
                {
                    "origin": [
                        4
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                463,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                135
            ],
            "getRole": [
                487,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                487
            ],
            "getSSOIdentityProviders": [
                307
            ],
            "getToolIndex": [
                553
            ],
            "getToolInputSchema": [
                350,
                {
                    "toolName": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                661,
                {
                    "input": [
                        662
                    ]
                }
            ],
            "getView": [
                689,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                692,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                693,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                693,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                692,
                {
                    "viewId": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                702,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                703,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                703,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewFilters": [
                702,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewGroup": [
                706,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                706,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViewSort": [
                710,
                {
                    "id": [
                        4,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                710,
                {
                    "viewId": [
                        4
                    ]
                }
            ],
            "getViews": [
                689,
                {
                    "objectMetadataId": [
                        4
                    ],
                    "viewTypes": [
                        712,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                726
            ],
            "gettingStartedProgress": [
                319
            ],
            "gettingStartedWorkflowPreviews": [
                324
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
                355,
                {
                    "input": [
                        356,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                129
            ],
            "mcpServer": [
                378,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                378
            ],
            "messageSuppressions": [
                395,
                {
                    "input": [
                        308,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                400,
                {
                    "input": [
                        403,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                404
            ],
            "mostlyEmptyFieldMetadataIds": [
                573,
                {
                    "objectMetadataId": [
                        573,
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
                        573
                    ]
                }
            ],
            "myConnectedAccounts": [
                180
            ],
            "myMessageChannels": [
                383,
                {
                    "connectedAccountId": [
                        573
                    ]
                }
            ],
            "myMessageFolders": [
                390,
                {
                    "messageChannelId": [
                        573
                    ]
                }
            ],
            "myUserApplicationVariables": [
                732
            ],
            "navigationMenuItem": [
                410,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                410
            ],
            "object": [
                413,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                423
            ],
            "objects": [
                414,
                {
                    "filter": [
                        417,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        231,
                        "CursorPaging!"
                    ]
                }
            ],
            "onlineWorkspaceMemberIds": [
                573
            ],
            "pieChartData": [
                448,
                {
                    "input": [
                        449,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                156,
                {
                    "input": [
                        452,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                454,
                {
                    "input": [
                        453,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                373,
                {
                    "universalIdentifier": [
                        4,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                372
            ],
            "recordPermissions": [
                469,
                {
                    "targets": [
                        478,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                474,
                {
                    "target": [
                        478,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                479
            ],
            "skill": [
                535,
                {
                    "id": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                535
            ],
            "timelineActivityTypes": [
                549
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                567
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                572,
                {
                    "userId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                576
            ],
            "usageLimits": [
                664
            ],
            "usageQuotaDefinitions": [
                668
            ],
            "usageQuotaScopeConsumption": [
                670,
                {
                    "input": [
                        671,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                672
            ],
            "validatePasswordResetToken": [
                683,
                {
                    "passwordResetToken": [
                        4,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                684,
                {
                    "objectMetadataId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                684,
                {
                    "fieldMetadataId": [
                        573,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                713,
                {
                    "id": [
                        573,
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
                        573
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
                573
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
                573
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
                573
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
                573
            ],
            "permissions": [
                468
            ],
            "recordId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                573
            ],
            "workspaceMemberId": [
                573
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
                468
            ],
            "roles": [
                476
            ],
            "shares": [
                475
            ],
            "__typename": [
                4
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                470
            ],
            "id": [
                20
            ],
            "principalId": [
                573
            ],
            "principalRoleId": [
                573
            ],
            "principalType": [
                472
            ],
            "rowCause": [
                473
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
                573
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
                573
            ],
            "recordId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                573
            ],
            "id": [
                573
            ],
            "isActive": [
                1
            ],
            "isInherent": [
                1
            ],
            "objectMetadataId": [
                573
            ],
            "secondFieldMetadataId": [
                573
            ],
            "thirdFieldMetadataId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                290
            ],
            "sourceObjectMetadata": [
                413
            ],
            "targetFieldMetadata": [
                290
            ],
            "targetObjectMetadata": [
                413
            ],
            "type": [
                481
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
                573
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
                573
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
                297
            ],
            "icon": [
                4
            ],
            "id": [
                573
            ],
            "isEditable": [
                1
            ],
            "label": [
                4
            ],
            "objectPermissions": [
                421
            ],
            "permissionFlags": [
                488
            ],
            "rowLevelPermissionFieldPermissions": [
                297
            ],
            "rowLevelPermissionPredicateGroups": [
                491
            ],
            "rowLevelPermissionPredicates": [
                490
            ],
            "rowLevelPermissionRules": [
                494
            ],
            "universalIdentifier": [
                573
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
                573
            ],
            "roleId": [
                573
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
                493
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
                350
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
                492
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
                573
            ],
            "objectMetadataId": [
                573
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
                573
            ],
            "predicateGroups": [
                496
            ],
            "predicates": [
                497
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateGroupInput": {
            "id": [
                573
            ],
            "logicalOperator": [
                492
            ],
            "position": [
                9
            ],
            "predicateGroups": [
                496
            ],
            "predicates": [
                497
            ],
            "__typename": [
                4
            ]
        },
        "RowLevelPermissionRulePredicateInput": {
            "fieldMetadataId": [
                573
            ],
            "id": [
                573
            ],
            "operand": [
                493
            ],
            "position": [
                9
            ],
            "relationFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "value": [
                350
            ],
            "workspaceMemberFieldMetadataId": [
                4
            ],
            "workspaceMemberRelationFieldMetadataId": [
                573
            ],
            "workspaceMemberRelationFilterFieldMetadataId": [
                573
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
                491
            ],
            "predicates": [
                490
            ],
            "ruleId": [
                573
            ],
            "uneditableFields": [
                573
            ],
            "unreadableFields": [
                573
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
                501
            ],
            "messages": [
                501
            ],
            "prompt": [
                4
            ],
            "responseFormat": [
                350
            ],
            "runAsWorkspaceMemberId": [
                573
            ],
            "thread": [
                504
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
                573
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
                500
            ],
            "content": [
                4
            ],
            "role": [
                502
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
                350
            ],
            "runId": [
                573
            ],
            "status": [
                4
            ],
            "success": [
                1
            ],
            "threadId": [
                573
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
                573
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                507
            ],
            "type": [
                330
            ],
            "__typename": [
                4
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                573
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                507
            ],
            "type": [
                330
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
                573
            ],
            "id": [
                573
            ],
            "position": [
                9
            ],
            "tsVectorFieldMetadataId": [
                573
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
                573
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
                510
            ],
            "email": [
                511
            ],
            "idempotencyKey": [
                573
            ],
            "messageChannelId": [
                573
            ],
            "messageThreadId": [
                573
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
                573
            ],
            "messageThreadId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                573
            ],
            "messageId": [
                4
            ],
            "queued": [
                1
            ],
            "recipientParticipantWorkspaceMemberIds": [
                573
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
                515
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
                518
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
                573
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
                350
            ],
            "workspaceMemberIds": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                573
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
                350
            ],
            "__typename": [
                4
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                573
            ],
            "createdAt": [
                233
            ],
            "frontComponentId": [
                573
            ],
            "icon": [
                4
            ],
            "id": [
                573
            ],
            "position": [
                9
            ],
            "scope": [
                529
            ],
            "slug": [
                4
            ],
            "title": [
                4
            ],
            "universalIdentifier": [
                573
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
                573
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
                573
            ],
            "issuer": [
                4
            ],
            "name": [
                4
            ],
            "status": [
                507
            ],
            "type": [
                330
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
                573
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
                573
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
                486
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
                573
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
                284,
                {
                    "fieldFilters": [
                        278,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        285,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                466,
                {
                    "input": [
                        215,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                368,
                {
                    "input": [
                        369,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                16,
                {
                    "agentUniversalIdentifier": [
                        573
                    ],
                    "runId": [
                        573
                    ],
                    "threadId": [
                        573
                    ],
                    "threadKey": [
                        4
                    ]
                }
            ],
            "onEventSubscription": [
                286,
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
                545
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
                573
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
                573
            ],
            "createdAt": [
                233
            ],
            "emit": [
                550
            ],
            "frontComponentUniversalIdentifier": [
                573
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                573
            ],
            "universalIdentifier": [
                573
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
                573
            ],
            "on": [
                4
            ],
            "through": [
                551
            ],
            "__typename": [
                4
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                573
            ],
            "relationFieldUniversalIdentifier": [
                573
            ],
            "triggerFieldUniversalIdentifiers": [
                573
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
                350
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
                573
            ],
            "personFilter": [
                350
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
                573
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
                573
            ],
            "gt": [
                573
            ],
            "gte": [
                573
            ],
            "iLike": [
                573
            ],
            "in": [
                573
            ],
            "is": [
                1
            ],
            "isNot": [
                1
            ],
            "like": [
                573
            ],
            "lt": [
                573
            ],
            "lte": [
                573
            ],
            "neq": [
                573
            ],
            "notILike": [
                573
            ],
            "notIn": [
                573
            ],
            "notLike": [
                573
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
                573
            ],
            "name": [
                4
            ],
            "updatedAt": [
                233
            ],
            "visibility": [
                577
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
                573
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
                573
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
                350
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
                350
            ],
            "roleId": [
                573
            ],
            "triggers": [
                350
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
                573
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
                573
            ],
            "isSyncEnabled": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                573
            ],
            "visibility": [
                389
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
                584
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
                586
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
                573
            ],
            "update": [
                588
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
                573
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
                573
            ],
            "isPinned": [
                1
            ],
            "label": [
                4
            ],
            "pageLayoutId": [
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                350
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
                350
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                573
            ],
            "options": [
                350
            ],
            "settings": [
                350
            ],
            "translations": [
                401
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
                573
            ],
            "update": [
                593
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
                320
            ],
            "completedStepChatThreadId": [
                4
            ],
            "isHidden": [
                1
            ],
            "selectedStepActionKey": [
                320
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
                573
            ],
            "update": [
                598
            ],
            "__typename": [
                4
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                350
            ],
            "databaseEventTriggerSettings": [
                350
            ],
            "description": [
                4
            ],
            "handlerName": [
                4
            ],
            "httpRouteTriggerSettings": [
                350
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
                350
            ],
            "workflowActionTriggerSettings": [
                350
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                573
            ],
            "update": [
                600
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                573
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
                573
            ],
            "update": [
                602
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                384
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
                391
            ],
            "visibility": [
                389
            ],
            "__typename": [
                4
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                573
            ],
            "update": [
                604
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
                573
            ],
            "update": [
                604
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
                573
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
                573
            ],
            "parentId": [
                573
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
                573
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
                573
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
                420
            ],
            "shortcut": [
                4
            ],
            "translations": [
                401
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                573
            ],
            "update": [
                591
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                573
            ],
            "update": [
                606
            ],
            "__typename": [
                4
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                573
            ],
            "update": [
                607
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
                573
            ],
            "type": [
                437
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
                436
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
                573
            ],
            "layoutMode": [
                436
            ],
            "position": [
                9
            ],
            "title": [
                4
            ],
            "widgets": [
                615
            ],
            "__typename": [
                4
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "conditionalAvailability": [
                350
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                350
            ],
            "configuration": [
                350
            ],
            "isActive": [
                1
            ],
            "objectMetadataId": [
                573
            ],
            "pageLayoutTabId": [
                573
            ],
            "position": [
                350
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
                350
            ],
            "conditionalAvailabilityExpression": [
                4
            ],
            "conditionalDisplay": [
                350
            ],
            "configuration": [
                350
            ],
            "id": [
                573
            ],
            "objectMetadataId": [
                573
            ],
            "pageLayoutTabId": [
                573
            ],
            "position": [
                350
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
                573
            ],
            "tabs": [
                613
            ],
            "type": [
                437
            ],
            "__typename": [
                4
            ]
        },
        "UpdateRelatedRecordPathInput": {
            "id": [
                573
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
                573
            ],
            "update": [
                619
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
                573
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
                547
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
                573
            ],
            "isActive": [
                1
            ],
            "label": [
                4
            ],
            "translations": [
                401
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
                577
            ],
            "__typename": [
                4
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                573
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
                573
            ],
            "update": [
                626
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
                573
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
                573
            ],
            "update": [
                628
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
                573
            ],
            "update": [
                630
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
                699
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "size": [
                9
            ],
            "viewFieldGroupId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                573
            ],
            "logicalOperator": [
                704
            ],
            "parentViewFilterGroupId": [
                573
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "viewId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                573
            ],
            "update": [
                633
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                573
            ],
            "operand": [
                705
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "value": [
                350
            ],
            "viewFilterGroupId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                573
            ],
            "update": [
                635
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                573
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
                573
            ],
            "calendarFieldMetadataId": [
                573
            ],
            "calendarLayout": [
                690
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "kanbanColumnWidth": [
                2
            ],
            "listPinnedFieldMetadataId": [
                573
            ],
            "mainGroupByFieldMetadataId": [
                573
            ],
            "name": [
                4
            ],
            "openRecordIn": [
                708
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
                401
            ],
            "type": [
                712
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                573
            ],
            "update": [
                638
            ],
            "__typename": [
                4
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                711
            ],
            "relationTargetFieldMetadataId": [
                573
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
                573
            ],
            "update": [
                640
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
                573
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
                350
            ],
            "allowImpersonation": [
                1
            ],
            "customDomain": [
                4
            ],
            "defaultRoleId": [
                573
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
                350
            ],
            "workspaceMemberId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                298
            ],
            "roleId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                573
            ],
            "isVisible": [
                1
            ],
            "position": [
                9
            ],
            "viewFieldId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                647
            ],
            "id": [
                573
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
                647
            ],
            "groups": [
                648
            ],
            "widgetId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                422
            ],
            "roleId": [
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesInput": {
            "objectMetadataId": [
                573
            ],
            "roleId": [
                573
            ],
            "rules": [
                495
            ],
            "__typename": [
                4
            ]
        },
        "UpsertRowLevelPermissionRulesResult": {
            "predicateGroups": [
                491
            ],
            "predicates": [
                490
            ],
            "rules": [
                494
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                658
            ],
            "viewFields": [
                655
            ],
            "viewFilterGroups": [
                656
            ],
            "viewFilters": [
                657
            ],
            "viewSorts": [
                659
            ],
            "widgetId": [
                573
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
                573
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
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                573
            ],
            "logicalOperator": [
                704
            ],
            "parentViewFilterGroupId": [
                573
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
                573
            ],
            "id": [
                573
            ],
            "operand": [
                705
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "value": [
                350
            ],
            "viewFilterGroupId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                573
            ],
            "calendarFieldMetadataId": [
                573
            ],
            "calendarLayout": [
                690
            ],
            "kanbanAggregateOperation": [
                33
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                573
            ],
            "kanbanColumnWidth": [
                2
            ],
            "mainGroupByFieldMetadataId": [
                573
            ],
            "openRecordIn": [
                708
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                712
            ],
            "__typename": [
                4
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                711
            ],
            "fieldMetadataId": [
                573
            ],
            "id": [
                573
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
                674
            ],
            "usageByApplication": [
                663
            ],
            "usageByModel": [
                663
            ],
            "usageByOperationType": [
                663
            ],
            "usageByUser": [
                663
            ],
            "userDailyUsage": [
                676
            ],
            "__typename": [
                4
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                666
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
                573
            ],
            "limitKind": [
                4
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                666
            ],
            "periodCount": [
                2
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                673
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                675
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
                675
            ],
            "operationType": [
                666
            ],
            "__typename": [
                4
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                665
            ],
            "allowedSpenderTypes": [
                4
            ],
            "limitKind": [
                4
            ],
            "operatorOnlyScopes": [
                669
            ],
            "resourceType": [
                673
            ],
            "__typename": [
                4
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                667
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
                666
            ],
            "periodUnit": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                675
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
                666
            ],
            "periodUnit": [
                4
            ],
            "resourceType": [
                673
            ],
            "spenderId": [
                4
            ],
            "spenderType": [
                4
            ],
            "unit": [
                675
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
                573
            ],
            "isEnforced": [
                1
            ],
            "limitValue": [
                120
            ],
            "operationType": [
                666
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
                673
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
                675
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
                674
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
                681
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
                573
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
                429
            ],
            "previousOnboardingStatus": [
                429
            ],
            "supportUserHash": [
                4
            ],
            "updatedAt": [
                233
            ],
            "userVars": [
                351
            ],
            "userWorkspaces": [
                681
            ],
            "workspaceMember": [
                731
            ],
            "workspaceMembers": [
                731
            ],
            "workspaces": [
                681
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
                350
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
                573
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
                573
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
                573
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
                428
            ],
            "permissionFlags": [
                446
            ],
            "twoFactorAuthenticationMethodSummary": [
                569
            ],
            "updatedAt": [
                233
            ],
            "user": [
                677
            ],
            "userId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                573
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
                573
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
                573
            ],
            "expression": [
                4
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
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
                573
            ],
            "calendarEndFieldMetadataId": [
                573
            ],
            "calendarFieldMetadataId": [
                573
            ],
            "calendarLayout": [
                690
            ],
            "createdAt": [
                233
            ],
            "createdByUserWorkspaceId": [
                573
            ],
            "groupLoadLimit": [
                2
            ],
            "icon": [
                4
            ],
            "id": [
                573
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
                573
            ],
            "kanbanColumnWidth": [
                2
            ],
            "key": [
                707
            ],
            "listPinnedFieldMetadataId": [
                573
            ],
            "mainGroupByFieldMetadataId": [
                573
            ],
            "name": [
                4
            ],
            "objectMetadataId": [
                573
            ],
            "openRecordIn": [
                708
            ],
            "position": [
                9
            ],
            "presetFilter": [
                709
            ],
            "shouldDisplayGroupsAsTabs": [
                1
            ],
            "shouldHideEmptyGroups": [
                1
            ],
            "type": [
                712
            ],
            "universalIdentifier": [
                573
            ],
            "updatedAt": [
                233
            ],
            "viewFieldGroups": [
                693
            ],
            "viewFields": [
                692
            ],
            "viewFilterGroups": [
                703
            ],
            "viewFilters": [
                702
            ],
            "viewGroups": [
                706
            ],
            "viewSorts": [
                710
            ],
            "workspaceId": [
                573
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
                573
            ],
            "createdAt": [
                233
            ],
            "fieldMetadataId": [
                573
            ],
            "id": [
                573
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
                694
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "size": [
                9
            ],
            "universalIdentifier": [
                573
            ],
            "updatedAt": [
                233
            ],
            "viewFieldGroupId": [
                573
            ],
            "viewId": [
                573
            ],
            "workspaceId": [
                573
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
                573
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
                692
            ],
            "viewId": [
                573
            ],
            "workspaceId": [
                573
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
                696
            ],
            "filters": [
                695
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
        "ViewFieldRelationScopeFilter": {
            "fieldMetadataId": [
                573
            ],
            "filterGroupId": [
                573
            ],
            "id": [
                573
            ],
            "operand": [
                705
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "value": [
                350
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroup": {
            "id": [
                573
            ],
            "logicalOperator": [
                704
            ],
            "parentFilterGroupId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterGroupInput": {
            "id": [
                573
            ],
            "logicalOperator": [
                704
            ],
            "parentFilterGroupId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeFilterInput": {
            "fieldMetadataId": [
                573
            ],
            "filterGroupId": [
                573
            ],
            "id": [
                573
            ],
            "operand": [
                705
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "value": [
                350
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
                697
            ],
            "filters": [
                698
            ],
            "limit": [
                2
            ],
            "sorts": [
                701
            ],
            "__typename": [
                4
            ]
        },
        "ViewFieldRelationScopeSort": {
            "direction": [
                711
            ],
            "fieldMetadataId": [
                573
            ],
            "relationTargetFieldMetadataId": [
                573
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
                711
            ],
            "fieldMetadataId": [
                573
            ],
            "relationTargetFieldMetadataId": [
                573
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
                573
            ],
            "id": [
                573
            ],
            "operand": [
                705
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                233
            ],
            "value": [
                350
            ],
            "viewFilterGroupId": [
                573
            ],
            "viewId": [
                573
            ],
            "workspaceId": [
                573
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
                573
            ],
            "logicalOperator": [
                704
            ],
            "parentViewFilterGroupId": [
                573
            ],
            "positionInViewFilterGroup": [
                9
            ],
            "updatedAt": [
                233
            ],
            "viewId": [
                573
            ],
            "workspaceId": [
                573
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
                573
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
                573
            ],
            "workspaceId": [
                573
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
                711
            ],
            "fieldMetadataId": [
                573
            ],
            "id": [
                573
            ],
            "relationTargetFieldMetadataId": [
                573
            ],
            "subFieldName": [
                4
            ],
            "updatedAt": [
                233
            ],
            "viewId": [
                573
            ],
            "workspaceId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "ViewSortDirection": {},
        "ViewType": {},
        "Webhook": {
            "applicationId": [
                573
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
                573
            ],
            "operations": [
                4
            ],
            "role": [
                487
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
                291
            ],
            "on_FieldRichTextConfiguration": [
                299
            ],
            "on_FieldsConfiguration": [
                300
            ],
            "on_FilesConfiguration": [
                306
            ],
            "on_FormFieldConfiguration": [
                309
            ],
            "on_FrontComponentConfiguration": [
                311
            ],
            "on_IframeConfiguration": [
                331
            ],
            "on_LineChartConfiguration": [
                354
            ],
            "on_MessageCampaignBodyConfiguration": [
                380
            ],
            "on_MessageCampaignDetailsConfiguration": [
                381
            ],
            "on_NotesConfiguration": [
                412
            ],
            "on_PieChartConfiguration": [
                447
            ],
            "on_RecordTableConfiguration": [
                477
            ],
            "on_StandaloneRichTextConfiguration": [
                536
            ],
            "on_TasksConfiguration": [
                548
            ],
            "on_TimelineConfiguration": [
                552
            ],
            "on_ViewConfiguration": [
                691
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
                350
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
                487
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
                288
            ],
            "hasValidEnterpriseValidityToken": [
                1
            ],
            "hasValidSignedEnterpriseKey": [
                1
            ],
            "id": [
                573
            ],
            "iframeMediaPermissions": [
                332
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
                573
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
                692
            ],
            "viewFilterGroups": [
                703
            ],
            "viewFilters": [
                702
            ],
            "viewGroups": [
                706
            ],
            "viewSorts": [
                710
            ],
            "views": [
                689
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
                350
            ],
            "isBookCallOnboardingStepPending": [
                1
            ],
            "outcome": [
                724
            ],
            "personEnrichment": [
                350
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
                573
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
                573
            ],
            "roleId": [
                573
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
                573
            ],
            "locale": [
                4
            ],
            "name": [
                313
            ],
            "numberFormat": [
                734
            ],
            "openRecordIn": [
                432
            ],
            "roles": [
                487
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
                573
            ],
            "userWorkspaceId": [
                573
            ],
            "__typename": [
                4
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                573
            ],
            "variables": [
                678
            ],
            "workspaceMemberId": [
                573
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
                350
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
                573
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
                573
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