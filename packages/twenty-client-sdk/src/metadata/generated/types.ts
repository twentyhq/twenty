export default {
    "scalars": [
        1,
        4,
        6,
        7,
        10,
        11,
        13,
        15,
        18,
        25,
        27,
        28,
        35,
        39,
        41,
        48,
        64,
        72,
        82,
        88,
        101,
        105,
        106,
        108,
        113,
        119,
        125,
        130,
        136,
        139,
        140,
        141,
        142,
        150,
        152,
        166,
        170,
        172,
        174,
        221,
        222,
        249,
        253,
        254,
        256,
        267,
        273,
        277,
        281,
        284,
        291,
        308,
        310,
        316,
        318,
        331,
        338,
        339,
        340,
        352,
        354,
        371,
        372,
        373,
        374,
        375,
        376,
        378,
        379,
        380,
        383,
        384,
        386,
        389,
        394,
        398,
        407,
        414,
        416,
        419,
        423,
        424,
        429,
        433,
        456,
        458,
        459,
        467,
        479,
        481,
        487,
        492,
        513,
        525,
        526,
        528,
        555,
        557,
        559,
        624,
        644,
        651,
        653,
        657,
        668,
        674,
        675,
        677,
        678,
        680,
        681,
        682,
        685,
        686,
        687,
        692,
        694,
        697,
        702,
        703,
        704,
        707,
        708
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
                338
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
                555
            ],
            "avatarColor": [
                1
            ],
            "avatarShape": [
                1
            ],
            "createdAt": [
                222
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
            "modelConfiguration": [
                338
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
                338
            ],
            "roleId": [
                555
            ],
            "triggers": [
                338
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "AgentChatChannel": {
            "applicationId": [
                555
            ],
            "color": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "isAccessible": [
                4
            ],
            "isCustom": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                6
            ],
            "roleIds": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "AgentChatChannelAssignmentFilter": {},
        "AgentChatChannelRole": {
            "canAccessAllAgentChatChannels": [
                4
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelSummary": {
            "assignedCount": [
                10
            ],
            "assignedToMeCount": [
                10
            ],
            "channelId": [
                555
            ],
            "doneCount": [
                10
            ],
            "hasUnreadAssignedToMe": [
                4
            ],
            "hasUnreadOpen": [
                4
            ],
            "mentionedCount": [
                10
            ],
            "needsInputCount": [
                10
            ],
            "openCount": [
                10
            ],
            "snoozedCount": [
                10
            ],
            "unassignedCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "AgentChatChannelThreadFilter": {},
        "AgentChatChannelThreadIds": {
            "endCursor": [
                1
            ],
            "hasNextPage": [
                4
            ],
            "threadIds": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatChannelThreadStatus": {},
        "AgentChatEvent": {
            "event": [
                338
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
            "assignedThreadCount": [
                10
            ],
            "assignedToMeThreadCount": [
                10
            ],
            "hasUnreadAssignedThread": [
                4
            ],
            "hasUnreadMentionThread": [
                4
            ],
            "hasUnreadOpenThread": [
                4
            ],
            "mentionThreadCount": [
                10
            ],
            "needsInputThreadCount": [
                10
            ],
            "openThreadCount": [
                10
            ],
            "unassignedThreadCount": [
                10
            ],
            "unreadOpenThreadCount": [
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
                222
            ],
            "deletedAt": [
                222
            ],
            "id": [
                18
            ],
            "isAssistantParticipant": [
                4
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
                222
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentChatThreadParticipant": {
            "archivedAt": [
                222
            ],
            "id": [
                555
            ],
            "isSubscribed": [
                4
            ],
            "lastMentionedAt": [
                222
            ],
            "lastReadAt": [
                222
            ],
            "mentionsResolvedAt": [
                222
            ],
            "snoozedUntil": [
                222
            ],
            "threadId": [
                555
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "agentId": [
                555
            ],
            "createdAt": [
                222
            ],
            "id": [
                555
            ],
            "isBuiltInAssistant": [
                4
            ],
            "parts": [
                22
            ],
            "processedAt": [
                222
            ],
            "reactions": [
                23
            ],
            "role": [
                1
            ],
            "senderApplicationId": [
                555
            ],
            "senderUserWorkspaceId": [
                555
            ],
            "senderWorkspaceMemberId": [
                555
            ],
            "status": [
                1
            ],
            "threadId": [
                555
            ],
            "turnId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "createdAt": [
                222
            ],
            "errorMessage": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                555
            ],
            "fileMediaType": [
                1
            ],
            "fileUrl": [
                1
            ],
            "id": [
                555
            ],
            "messageId": [
                555
            ],
            "orderIndex": [
                10
            ],
            "providerExecuted": [
                4
            ],
            "providerMetadata": [
                338
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
                338
            ],
            "toolName": [
                1
            ],
            "toolOutput": [
                338
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
                555
            ],
            "emoji": [
                1
            ],
            "hasAssistantReacted": [
                4
            ],
            "workspaceMemberIds": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "canReadThread": [
                4
            ],
            "createdAt": [
                222
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
                222
            ],
            "errorMessage": [
                1
            ],
            "id": [
                555
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
                222
            ],
            "status": [
                25
            ],
            "threadId": [
                555
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
                555
            ],
            "aggregateOperation": [
                27
            ],
            "configurationType": [
                685
            ],
            "description": [
                1
            ],
            "displayDataLabel": [
                4
            ],
            "filter": [
                338
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "label": [
                1
            ],
            "numberFormat": [
                152
            ],
            "prefix": [
                1
            ],
            "ratioAggregateConfig": [
                451
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
        "AiChatAssistantMode": {},
        "AiChatAssistantProfile": {
            "avatarColor": [
                1
            ],
            "avatarFace": [
                1
            ],
            "avatarShape": [
                1
            ],
            "displayName": [
                1
            ],
            "isAvatarAnimated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AiChatAssistantProfileInput": {
            "avatarColor": [
                1
            ],
            "avatarFace": [
                1
            ],
            "avatarShape": [
                1
            ],
            "displayName": [
                1
            ],
            "isAvatarAnimated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUsage": {
            "consumedValue": [
                108
            ],
            "kind": [
                1
            ],
            "limitValue": [
                108
            ],
            "periodEnd": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "AiChatUserCreditsUsage": {
            "consumedValue": [
                108
            ],
            "limitValue": [
                108
            ],
            "periodEnd": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "AiDataPolicy": {
            "isProductImprovementDataSharingEnabled": [
                4
            ],
            "isZeroDataRetentionRequired": [
                4
            ],
            "requiredDataResidencyRegion": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AiDataPolicyInput": {
            "isProductImprovementDataSharingEnabled": [
                4
            ],
            "isZeroDataRetentionRequired": [
                4
            ],
            "requiredDataResidencyRegion": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AiModelTier": {},
        "AiRunUsage": {
            "inputTokens": [
                10
            ],
            "outputTokens": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "estimatedTokenCount": [
                10
            ],
            "sections": [
                38
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
                222
            ],
            "expiresAt": [
                222
            ],
            "id": [
                555
            ],
            "name": [
                1
            ],
            "revokedAt": [
                222
            ],
            "role": [
                473
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "expiresAt": [
                222
            ],
            "id": [
                555
            ],
            "name": [
                1
            ],
            "revokedAt": [
                222
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
                18
            ],
            "name": [
                1
            ],
            "providerName": [
                1
            ],
            "providerType": [
                1
            ],
            "scope": [
                170
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
                48
            ],
            "value": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "AppMessageAttachmentInput": {
            "fileId": [
                555
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageFolderInput": {
            "externalId": [
                1
            ],
            "isSynced": [
                4
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageInput": {
            "attachments": [
                49
            ],
            "externalId": [
                1
            ],
            "folderExternalIds": [
                1
            ],
            "participants": [
                52
            ],
            "receivedAt": [
                222
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
                555
            ],
            "role": [
                380
            ],
            "workspaceMemberId": [
                555
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
                84
            ],
            "applicationRegistrationId": [
                555
            ],
            "applicationVariables": [
                87
            ],
            "autoUpgrade": [
                4
            ],
            "availablePackages": [
                338
            ],
            "canBeUninstalled": [
                4
            ],
            "commandMenuItems": [
                165
            ],
            "content": [
                59
            ],
            "createdAt": [
                222
            ],
            "defaultLogicFunctionRole": [
                473
            ],
            "defaultRoleId": [
                1
            ],
            "description": [
                1
            ],
            "frontComponents": [
                298
            ],
            "grantedIframeMediaPermissions": [
                320
            ],
            "grantedRoleId": [
                548
            ],
            "healthCheckLogicFunctionId": [
                555
            ],
            "id": [
                555
            ],
            "isUninstallBlockedByOtherWorkspaceInstallations": [
                4
            ],
            "logicFunctions": [
                351
            ],
            "logoFileId": [
                555
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "objects": [
                400
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                555
            ],
            "requestedIframeMediaPermissions": [
                320
            ],
            "runOnUserPreferences": [
                4
            ],
            "settingsCustomTabFrontComponentId": [
                555
            ],
            "settingsMenuItems": [
                512
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "applicationId": [
                555
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "createdAt": [
                222
            ],
            "id": [
                555
            ],
            "lastAuthorizedAt": [
                222
            ],
            "lastUsedAt": [
                222
            ],
            "scopes": [
                1
            ],
            "workspaceId": [
                555
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
            "applicationId": [
                555
            ],
            "archivedAt": [
                222
            ],
            "authFailedAt": [
                222
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                447
            ],
            "connectionProviderId": [
                555
            ],
            "createdAt": [
                222
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                555
            ],
            "isOwnedByCurrentUser": [
                4
            ],
            "lastCredentialsRefreshedAt": [
                222
            ],
            "lastSignedInAt": [
                222
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                170
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                222
            ],
            "userWorkspaceId": [
                555
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
                555
            ],
            "logoUrl": [
                1
            ],
            "name": [
                1
            ],
            "oauth": [
                58
            ],
            "scope": [
                174
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
        "ApplicationContent": {
            "agents": [
                60
            ],
            "commandMenuItems": [
                60
            ],
            "connectionProviders": [
                60
            ],
            "fields": [
                60
            ],
            "frontComponents": [
                60
            ],
            "indexes": [
                60
            ],
            "logicFunctions": [
                60
            ],
            "navigationMenuItems": [
                60
            ],
            "objects": [
                60
            ],
            "pageLayoutTabs": [
                60
            ],
            "pageLayouts": [
                60
            ],
            "permissionFlags": [
                60
            ],
            "publicAssets": [
                60
            ],
            "roles": [
                60
            ],
            "skills": [
                60
            ],
            "translations": [
                60
            ],
            "viewFields": [
                60
            ],
            "views": [
                60
            ],
            "workflows": [
                60
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationContentItem": {
            "color": [
                1
            ],
            "count": [
                10
            ],
            "description": [
                1
            ],
            "fieldUniversalIdentifier": [
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
            "objectUniversalIdentifier": [
                1
            ],
            "parentLabel": [
                1
            ],
            "parentUniversalIdentifier": [
                1
            ],
            "position": [
                6
            ],
            "tag": [
                1
            ],
            "timeoutSeconds": [
                10
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExport": {
            "application": [
                62
            ],
            "coverage": [
                63
            ],
            "files": [
                65
            ],
            "manifest": [
                338
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
                82
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
                64
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
                555
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
                291
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
                291
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
                222
            ],
            "fileFolder": [
                291
            ],
            "fileId": [
                555
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
                70
            ],
            "description": [
                1
            ],
            "status": [
                72
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationHealthStatus": {},
        "ApplicationMonitoring": {
            "activity": [
                74
            ],
            "bucketSizeInSeconds": [
                10
            ],
            "creditUsage": [
                75
            ],
            "creditsUsed": [
                6
            ],
            "failedRunCount": [
                10
            ],
            "functions": [
                76
            ],
            "issues": [
                77
            ],
            "lifecycle": [
                78
            ],
            "lifecycleFailureCount": [
                10
            ],
            "lookbackInHours": [
                10
            ],
            "periodEnd": [
                222
            ],
            "periodStart": [
                222
            ],
            "rateLimitEventCount": [
                10
            ],
            "runCount": [
                10
            ],
            "versions": [
                79
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringActivityBucket": {
            "bucketStart": [
                222
            ],
            "errorCount": [
                10
            ],
            "rateLimitedJobCount": [
                10
            ],
            "rateLimitedRequestCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringCreditBucket": {
            "bucketStart": [
                222
            ],
            "creditsUsed": [
                6
            ],
            "operationLabel": [
                1
            ],
            "operationType": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringFunction": {
            "failedRunCount": [
                10
            ],
            "logicFunctionName": [
                1
            ],
            "p95DurationMs": [
                6
            ],
            "runCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringIssue": {
            "affectedInstallCount": [
                10
            ],
            "errorCode": [
                1
            ],
            "eventCount": [
                10
            ],
            "lastSeenAt": [
                222
            ],
            "level": [
                1
            ],
            "logicFunctionName": [
                1
            ],
            "source": [
                1
            ],
            "versions": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringLifecycleBucket": {
            "bucketStart": [
                222
            ],
            "failedCount": [
                10
            ],
            "installCount": [
                10
            ],
            "uninstallCount": [
                10
            ],
            "upgradeCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationMonitoringVersion": {
            "activeInstallCount": [
                10
            ],
            "failedRunCount": [
                10
            ],
            "runCount": [
                10
            ],
            "version": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationPreferences": {
            "applicationId": [
                555
            ],
            "connectionProviders": [
                57
            ],
            "hasUserHealthCheck": [
                4
            ],
            "settingsMenuItems": [
                512
            ],
            "variables": [
                656
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistration": {
            "createdAt": [
                222
            ],
            "galleryImagesUrls": [
                1
            ],
            "id": [
                555
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
                555
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                82
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                222
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
            "autoUpdateEnabled": [
                10
            ],
            "creditsUsedBreakdown": [
                219
            ],
            "mostInstalledVersion": [
                1
            ],
            "suspendedInstalls": [
                10
            ],
            "totalCreditsUsed": [
                6
            ],
            "versionDistribution": [
                666
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                555
            ],
            "latestAvailableVersion": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourceType": [
                82
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationVariable": {
            "createdAt": [
                222
            ],
            "description": [
                1
            ],
            "id": [
                555
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
                338
            ],
            "type": [
                1
            ],
            "updatedAt": [
                222
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
                93
            ],
            "applicationRefreshToken": [
                93
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
                555
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
                338
            ],
            "scope": [
                88
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
                222
            ],
            "domain": [
                1
            ],
            "id": [
                555
            ],
            "isValidated": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ArchiveInboxThreadInput": {
            "threadId": [
                555
            ],
            "workspaceMemberIds": [
                555
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
                491
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "expiresAt": [
                222
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
                93
            ],
            "refreshToken": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                94
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
                555
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
                490
            ],
            "workspaceUrls": [
                709
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                98
            ],
            "availableWorkspacesForSignUp": [
                98
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "availableWorkspaces": [
                99
            ],
            "tokens": [
                94
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "BarChartConfiguration": {
            "aggregateFieldMetadataId": [
                555
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                101
            ],
            "color": [
                1
            ],
            "configurationType": [
                685
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
                338
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupMode": [
                105
            ],
            "isCumulative": [
                4
            ],
            "layout": [
                106
            ],
            "numberFormat": [
                152
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                414
            ],
            "primaryAxisGroupByFieldMetadataId": [
                555
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                316
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                414
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                555
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                316
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
                338
            ],
            "formattedToRawLookup": [
                338
            ],
            "groupMode": [
                105
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
                106
            ],
            "series": [
                107
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
                338
            ],
            "objectMetadataId": [
                555
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
                134
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
                555
            ],
            "userCreditsFallback": [
                657
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
                129
            ],
            "currentBillingSubscription": [
                129
            ],
            "hasPaymentMethod": [
                4
            ],
            "status": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                113
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
                126
            ],
            "name": [
                1
            ],
            "prices": [
                120
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
                126
            ],
            "name": [
                1
            ],
            "prices": [
                121
            ],
            "__typename": [
                1
            ]
        },
        "BillingPartnerCode": {
            "isEditable": [
                4
            ],
            "partnerCode": [
                1
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
                114
            ],
            "downgradePlanKeys": [
                119
            ],
            "isCheckoutDefault": [
                4
            ],
            "isSellable": [
                4
            ],
            "meteredProducts": [
                115
            ],
            "planKey": [
                119
            ],
            "resourceCreditProducts": [
                114
            ],
            "upgradePlanKeys": [
                119
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
                136
            ],
            "recurringInterval": [
                525
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
                136
            ],
            "recurringInterval": [
                525
            ],
            "stripePriceId": [
                1
            ],
            "tiers": [
                122
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
                126
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
                126
            ],
            "name": [
                1
            ],
            "on_BillingLicensedProduct": [
                114
            ],
            "on_BillingMeteredProduct": [
                115
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
                119
            ],
            "priceUsageBased": [
                136
            ],
            "productKey": [
                125
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "periodEnd": [
                222
            ],
            "periodStart": [
                222
            ],
            "productKey": [
                125
            ],
            "unitPriceCents": [
                6
            ],
            "userCreditsUsed": [
                6
            ],
            "workspaceCreditsExtraGranted": [
                6
            ],
            "workspaceCreditsGranted": [
                6
            ],
            "workspaceCreditsGrantedForSeats": [
                6
            ],
            "workspaceCreditsSeats": [
                10
            ],
            "workspaceCreditsTotalGranted": [
                6
            ],
            "workspaceCreditsUsed": [
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
                131
            ],
            "cancelAt": [
                222
            ],
            "collectionMethod": [
                130
            ],
            "currentPeriodEnd": [
                222
            ],
            "hasUserCredits": [
                4
            ],
            "id": [
                555
            ],
            "interval": [
                525
            ],
            "metadata": [
                338
            ],
            "phases": [
                132
            ],
            "status": [
                526
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionCollectionMethod": {},
        "BillingSubscriptionItem": {
            "billingProduct": [
                124
            ],
            "creditAmount": [
                6
            ],
            "hasReachedCurrentPeriodCap": [
                4
            ],
            "id": [
                555
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
                133
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
                129
            ],
            "currentBillingSubscription": [
                129
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
                555
            ],
            "contactAutoCreationPolicy": [
                139
            ],
            "createdAt": [
                222
            ],
            "excludePrivateEvents": [
                4
            ],
            "handle": [
                1
            ],
            "id": [
                555
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "syncStage": [
                140
            ],
            "syncStageStartedAt": [
                222
            ],
            "syncStatus": [
                141
            ],
            "syncedAt": [
                222
            ],
            "throttleFailureCount": [
                6
            ],
            "updatedAt": [
                222
            ],
            "visibility": [
                142
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
                685
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                685
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
                150
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
                685
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                338
            ],
            "error": [
                155
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
                685
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
                394
            ],
            "modelFamilyLabel": [
                1
            ],
            "modelId": [
                1
            ],
            "nativeCapabilities": [
                396
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
            "zeroDataRetention": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ClientAiModelTierConfig": {
            "isZeroDataRetentionRequired": [
                4
            ],
            "modelId": [
                1
            ],
            "requiredDataResidencyRegion": [
                1
            ],
            "tier": [
                35
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "aiEvaluationModels": [
                159
            ],
            "aiModelTiers": [
                161
            ],
            "aiModels": [
                160
            ],
            "allowRequestsToTwentyIcons": [
                4
            ],
            "analyticsEnabled": [
                4
            ],
            "api": [
                42
            ],
            "appVersion": [
                1
            ],
            "authProviders": [
                92
            ],
            "billing": [
                109
            ],
            "calendarBookingPageId": [
                1
            ],
            "canManageFeatureFlags": [
                4
            ],
            "captcha": [
                149
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
                163
            ],
            "publicFeatureFlags": [
                445
            ],
            "publicFunctionDomain": [
                1
            ],
            "sentry": [
                510
            ],
            "serverUrl": [
                1
            ],
            "signInPrefilled": [
                4
            ],
            "support": [
                527
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "endAt": [
                222
            ],
            "link": [
                1
            ],
            "startAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                39
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
                555
            ],
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                555
            ],
            "availabilityType": [
                166
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                555
            ],
            "createdAt": [
                222
            ],
            "engineComponentKey": [
                256
            ],
            "frontComponent": [
                298
            ],
            "frontComponentId": [
                555
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
                555
            ],
            "pageLayoutId": [
                555
            ],
            "payload": [
                167
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
            ],
            "workflowVersionId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_ObjectMetadataCommandMenuItemPayload": [
                406
            ],
            "on_PathCommandMenuItemPayload": [
                431
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "errors": [
                66
            ],
            "files": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "applicationId": [
                555
            ],
            "archivedAt": [
                222
            ],
            "authFailedAt": [
                222
            ],
            "authFailedReason": [
                1
            ],
            "connectionParameters": [
                447
            ],
            "connectionProviderId": [
                555
            ],
            "createdAt": [
                222
            ],
            "handle": [
                1
            ],
            "handleAliases": [
                1
            ],
            "id": [
                555
            ],
            "lastCredentialsRefreshedAt": [
                222
            ],
            "lastSignedInAt": [
                222
            ],
            "name": [
                1
            ],
            "provider": [
                1
            ],
            "scope": [
                170
            ],
            "scopes": [
                1
            ],
            "updatedAt": [
                222
            ],
            "userWorkspaceId": [
                555
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
                323
            ],
            "handle": [
                1
            ],
            "id": [
                555
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ConnectionParametersInput": {
            "connectionSecurity": [
                249
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
        "ConnectionProviderScope": {},
        "CreateAgentChatChannelInput": {
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentInput": {
            "avatarColor": [
                1
            ],
            "avatarShape": [
                1
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
            "modelConfiguration": [
                338
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
                338
            ],
            "roleId": [
                555
            ],
            "triggers": [
                338
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                555
            ],
            "displayName": [
                1
            ],
            "handle": [
                1
            ],
            "messagingProviderUniversalIdentifier": [
                555
            ],
            "participantHandleFieldUniversalIdentifier": [
                555
            ],
            "visibility": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationFileUploadsResult": {
            "errors": [
                67
            ],
            "targets": [
                69
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                81
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
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                555
            ],
            "availabilityType": [
                166
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "coreWorkflowVersionId": [
                555
            ],
            "engineComponentKey": [
                256
            ],
            "frontComponentId": [
                555
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
                555
            ],
            "pageLayoutId": [
                555
            ],
            "payload": [
                338
            ],
            "position": [
                6
            ],
            "shortLabel": [
                1
            ],
            "workflowVersionId": [
                555
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
                370
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
                338
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
                338
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                555
            ],
            "options": [
                338
            ],
            "relationCreationPayload": [
                338
            ],
            "settings": [
                338
            ],
            "type": [
                284
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
                555
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
                555
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
                191
            ],
            "indexType": [
                331
            ],
            "objectMetadataId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "cronTriggerSettings": [
                338
            ],
            "databaseEventTriggerSettings": [
                338
            ],
            "description": [
                1
            ],
            "httpRouteTriggerSettings": [
                338
            ],
            "id": [
                555
            ],
            "name": [
                1
            ],
            "serverRouteTriggerSettings": [
                338
            ],
            "source": [
                338
            ],
            "timeoutSeconds": [
                6
            ],
            "toolTriggerSettings": [
                338
            ],
            "universalIdentifier": [
                555
            ],
            "workflowActionTriggerSettings": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "CreateMcpServerInput": {
            "connectionProviderId": [
                555
            ],
            "id": [
                555
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
            "url": [
                1
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
            "agentChatChannelId": [
                555
            ],
            "agentId": [
                555
            ],
            "color": [
                1
            ],
            "folderId": [
                555
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "nativePageKey": [
                1
            ],
            "pageLayoutId": [
                555
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                555
            ],
            "targetRecordId": [
                555
            ],
            "type": [
                398
            ],
            "userWorkspaceId": [
                555
            ],
            "viewId": [
                555
            ],
            "workflowId": [
                555
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
                338
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
                189
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                197
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
                555
            ],
            "type": [
                424
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "layoutMode": [
                423
            ],
            "pageLayoutId": [
                555
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
                338
            ],
            "objectMetadataId": [
                555
            ],
            "pageLayoutTabId": [
                555
            ],
            "position": [
                338
            ],
            "title": [
                1
            ],
            "type": [
                686
            ],
            "__typename": [
                1
            ]
        },
        "CreateRecordExportInput": {
            "fieldMetadataIds": [
                555
            ],
            "filter": [
                338
            ],
            "objectMetadataId": [
                555
            ],
            "orderBy": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "CreateRelatedRecordPathInput": {
            "firstFieldMetadataId": [
                555
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                555
            ],
            "secondFieldMetadataId": [
                555
            ],
            "thirdFieldMetadataId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateRoleInput": {
            "canAccessAllAgentChatChannels": [
                4
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
                555
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
                559
            ],
            "__typename": [
                1
            ]
        },
        "CreateUsageLimitInput": {
            "burstValue": [
                108
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                108
            ],
            "operationType": [
                644
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                651
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                653
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
                555
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                555
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
                555
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
                555
            ],
            "id": [
                555
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
                555
            ],
            "viewId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                555
            ],
            "logicalOperator": [
                674
            ],
            "parentViewFilterGroupId": [
                555
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "operand": [
                675
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                555
            ],
            "subFieldName": [
                1
            ],
            "value": [
                338
            ],
            "viewFilterGroupId": [
                555
            ],
            "viewId": [
                555
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
                555
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewId": [
                555
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
                555
            ],
            "calendarFieldMetadataId": [
                555
            ],
            "calendarLayout": [
                668
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                555
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                677
            ],
            "mainGroupByFieldMetadataId": [
                555
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                555
            ],
            "openRecordIn": [
                678
            ],
            "position": [
                6
            ],
            "shouldDisplayGroupsAsTabs": [
                4
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                681
            ],
            "visibility": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "direction": [
                680
            ],
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                555
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
                555
            ],
            "operations": [
                1
            ],
            "roleId": [
                555
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
                6
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "operation": [
                644
            ],
            "resource": [
                651
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "after": [
                172
            ],
            "before": [
                172
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                555
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                555
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
                555
            ],
            "name": [
                301
            ],
            "userEmail": [
                1
            ],
            "userWorkspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                555
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
                555
            ],
            "isCustomDomainEnabled": [
                4
            ],
            "records": [
                242
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
                555
            ],
            "pageLayoutId": [
                555
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
                555
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
                555
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                492
            ],
            "type": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                555
            ],
            "status": [
                492
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "CALDAV": [
                173
            ],
            "IMAP": [
                173
            ],
            "SMTP": [
                173
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
                685
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "createdAt": [
                222
            ],
            "domain": [
                1
            ],
            "id": [
                555
            ],
            "status": [
                253
            ],
            "tenantStatus": [
                254
            ],
            "unsubscribeHostnameStatus": [
                557
            ],
            "updatedAt": [
                222
            ],
            "verificationRecords": [
                663
            ],
            "verifiedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "EmailsConfiguration": {
            "configurationType": [
                685
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
                338
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
                338
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
                258
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                338
            ],
            "retryLimit": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobsResult": {
            "availableBytes": [
                6
            ],
            "enqueued": [
                4
            ],
            "enqueuedJobsCount": [
                10
            ],
            "jobIds": [
                1
            ],
            "jobs": [
                262
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnqueuedJob": {
            "jobId": [
                1
            ],
            "sizeBytes": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseLicenseInfoDTO": {
            "expiresAt": [
                222
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
                222
            ],
            "currentPeriodEnd": [
                222
            ],
            "expiresAt": [
                222
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
                222
            ],
            "start": [
                222
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
                267
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
                265
            ],
            "eventType": [
                1
            ],
            "fieldFilters": [
                266
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
                268
            ],
            "first": [
                10
            ],
            "table": [
                273
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "pageInfo": [
                269
            ],
            "records": [
                272
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
                338
            ],
            "recordId": [
                1
            ],
            "timestamp": [
                222
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
                385
            ],
            "objectRecordEventsWithQueryIds": [
                413
            ],
            "queueJobEvents": [
                341
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                555
            ],
            "payload": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                277
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
                555
            ],
            "createdAt": [
                222
            ],
            "defaultValue": [
                338
            ],
            "description": [
                1
            ],
            "disabledFieldPermissionActions": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
            "isSystemSideEffect": [
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
                555
            ],
            "morphRelations": [
                466
            ],
            "name": [
                1
            ],
            "object": [
                400
            ],
            "objectMetadataId": [
                555
            ],
            "options": [
                338
            ],
            "relation": [
                466
            ],
            "settings": [
                338
            ],
            "type": [
                284
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                685
            ],
            "fieldDisplayMode": [
                281
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
                282
            ],
            "pageInfo": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldEdge": {
            "cursor": [
                172
            ],
            "node": [
                278
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                283
            ],
            "id": [
                556
            ],
            "isActive": [
                137
            ],
            "isSystem": [
                137
            ],
            "isUIEditable": [
                137
            ],
            "isUIReadOnly": [
                137
            ],
            "objectMetadataId": [
                556
            ],
            "or": [
                283
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
                555
            ],
            "id": [
                555
            ],
            "objectMetadataId": [
                555
            ],
            "roleId": [
                555
            ],
            "rowLevelPermissionPredicateGroupId": [
                555
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
                555
            ],
            "objectMetadataId": [
                555
            ],
            "rowLevelPermissionPredicateGroupId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                685
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
                222
            ],
            "id": [
                555
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
                555
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
                222
            ],
            "fileId": [
                555
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
                222
            ],
            "id": [
                555
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
                685
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "id": [
                555
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                492
            ],
            "type": [
                318
            ],
            "workspace": [
                706
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
                383
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                685
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
            "applicationGrantedIframeMediaPermissions": [
                320
            ],
            "applicationId": [
                555
            ],
            "applicationName": [
                1
            ],
            "applicationTokenPair": [
                86
            ],
            "applicationVariables": [
                338
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
                222
            ],
            "description": [
                1
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "id": [
                555
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
                555
            ],
            "updatedAt": [
                222
            ],
            "usesSdkClient": [
                4
            ],
            "widgetAvailability": [
                300
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                685
            ],
            "frontComponentId": [
                555
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentWidgetAvailability": {
            "objectMetadataId": [
                555
            ],
            "pageLayoutType": [
                424
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
        "GenerateInput": {
            "input": [
                486
            ],
            "instructions": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                338
            ],
            "runId": [
                555
            ],
            "scope": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "GenerateResult": {
            "error": [
                1
            ],
            "object": [
                338
            ],
            "runId": [
                555
            ],
            "success": [
                4
            ],
            "text": [
                1
            ],
            "usage": [
                36
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                555
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
                555
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
                555
            ],
            "workspaceInviteHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedProgress": {
            "completedStepActionKeys": [
                308
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                308
            ],
            "snoozedUntil": [
                1
            ],
            "steps": [
                309
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepActionKey": {},
        "GettingStartedStepDefinition": {
            "actionKey": [
                308
            ],
            "description": [
                1
            ],
            "doneChatThreadId": [
                1
            ],
            "doneDescription": [
                1
            ],
            "doneTitle": [
                1
            ],
            "doneWorkflowId": [
                1
            ],
            "icon": [
                1
            ],
            "iconColor": [
                1
            ],
            "kind": [
                310
            ],
            "prompt": [
                1
            ],
            "promptLabel": [
                1
            ],
            "title": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedStepKind": {},
        "GettingStartedWorkflow": {
            "versionId": [
                1
            ],
            "workflowId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedWorkflowPreview": {
            "actions": [
                313
            ],
            "stepActionKey": [
                308
            ],
            "trigger": [
                314
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedWorkflowPreviewAction": {
            "title": [
                1
            ],
            "type": [
                687
            ],
            "__typename": [
                1
            ]
        },
        "GettingStartedWorkflowPreviewTrigger": {
            "databaseEventAction": [
                1
            ],
            "title": [
                1
            ],
            "type": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GrantApplicationCapabilitiesInput": {
            "applicationId": [
                555
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
                685
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "IframeMediaPermission": {
            "camera": [
                4
            ],
            "microphone": [
                4
            ],
            "origin": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "IframeMediaPermissionInput": {
            "camera": [
                4
            ],
            "microphone": [
                4
            ],
            "origin": [
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
                324
            ],
            "IMAP": [
                324
            ],
            "SMTP": [
                324
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
                249
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
                93
            ],
            "workspace": [
                710
            ],
            "__typename": [
                1
            ]
        },
        "InboxThreadRecordInput": {
            "objectNameSingular": [
                1
            ],
            "recordId": [
                555
            ],
            "threadId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "applicationId": [
                555
            ],
            "createdAt": [
                222
            ],
            "id": [
                555
            ],
            "indexFieldMetadataList": [
                329
            ],
            "indexType": [
                331
            ],
            "indexWhereClause": [
                1
            ],
            "isCustom": [
                4
            ],
            "isSystemSideEffect": [
                4
            ],
            "isUnique": [
                4
            ],
            "name": [
                1
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "cursor": [
                172
            ],
            "node": [
                327
            ],
            "__typename": [
                1
            ]
        },
        "IndexField": {
            "createdAt": [
                222
            ],
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "order": [
                6
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                330
            ],
            "id": [
                556
            ],
            "isCustom": [
                137
            ],
            "or": [
                330
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IngestAppMessagesInput": {
            "messageChannelId": [
                555
            ],
            "messages": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                334
            ],
            "__typename": [
                1
            ]
        },
        "IngestedAppMessage": {
            "externalId": [
                1
            ],
            "hasAttachments": [
                4
            ],
            "messageId": [
                555
            ],
            "messageThreadId": [
                555
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
                340
            ],
            "__typename": [
                1
            ]
        },
        "LineChartConfiguration": {
            "aggregateFieldMetadataId": [
                555
            ],
            "aggregateOperation": [
                27
            ],
            "axisNameDisplay": [
                101
            ],
            "color": [
                1
            ],
            "configurationType": [
                685
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
                338
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
                152
            ],
            "omitNullValues": [
                4
            ],
            "primaryAxisDateGranularity": [
                414
            ],
            "primaryAxisGroupByFieldMetadataId": [
                555
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "primaryAxisOrderBy": [
                316
            ],
            "rangeMax": [
                6
            ],
            "rangeMin": [
                6
            ],
            "secondaryAxisGroupByDateGranularity": [
                414
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                555
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisOrderBy": [
                316
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
                338
            ],
            "hasTooManyGroups": [
                4
            ],
            "series": [
                346
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
                338
            ],
            "objectMetadataId": [
                555
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
                345
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
                170
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageFoldersInput": {
            "messageChannelId": [
                555
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
                555
            ],
            "canRunOnDemand": [
                4
            ],
            "createdAt": [
                222
            ],
            "cronTriggerSettings": [
                338
            ],
            "databaseEventTriggerSettings": [
                338
            ],
            "description": [
                1
            ],
            "executionMode": [
                352
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                338
            ],
            "id": [
                555
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
                338
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
            ],
            "workflowActionTriggerSettings": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "LogicFunctionExecutionResult": {
            "data": [
                338
            ],
            "duration": [
                6
            ],
            "error": [
                338
            ],
            "logs": [
                1
            ],
            "status": [
                354
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                555
            ],
            "applicationUniversalIdentifier": [
                555
            ],
            "id": [
                555
            ],
            "name": [
                1
            ],
            "universalIdentifier": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                93
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
            "isListed": [
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
            "content": [
                59
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
                338
            ],
            "name": [
                1
            ],
            "objects": [
                361
            ],
            "pricingDescription": [
                1
            ],
            "requestedCapabilities": [
                1
            ],
            "requestedIframeMediaPermissions": [
                320
            ],
            "roles": [
                362
            ],
            "screenshots": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "sourceType": [
                82
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
                363
            ],
            "icon": [
                1
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                364
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
        "McpServer": {
            "applicationId": [
                555
            ],
            "connectionProviderId": [
                555
            ],
            "createdAt": [
                222
            ],
            "id": [
                555
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
            "tools": [
                366
            ],
            "toolsSyncError": [
                1
            ],
            "toolsSyncedAt": [
                222
            ],
            "updatedAt": [
                222
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "McpServerTool": {
            "annotations": [
                338
            ],
            "description": [
                1
            ],
            "inputSchema": [
                338
            ],
            "name": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignSendBlockerDTO": {
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
        "MessageChannel": {
            "connectedAccount": [
                169
            ],
            "connectedAccountId": [
                555
            ],
            "contactAutoCreationPolicy": [
                371
            ],
            "createdAt": [
                222
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
                555
            ],
            "importProgress": [
                10
            ],
            "isContactAutoCreationEnabled": [
                4
            ],
            "isSyncEnabled": [
                4
            ],
            "messageFolderImportPolicy": [
                378
            ],
            "messagingProviderUniversalIdentifier": [
                555
            ],
            "participantHandleFieldUniversalIdentifier": [
                555
            ],
            "pendingGroupEmailsAction": [
                372
            ],
            "syncStage": [
                373
            ],
            "syncStageStartedAt": [
                222
            ],
            "syncStatus": [
                374
            ],
            "syncedAt": [
                222
            ],
            "throttleFailureCount": [
                6
            ],
            "throttleRetryAfter": [
                222
            ],
            "type": [
                375
            ],
            "updatedAt": [
                222
            ],
            "visibility": [
                376
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
                222
            ],
            "externalId": [
                1
            ],
            "id": [
                555
            ],
            "isSentFolder": [
                4
            ],
            "isSynced": [
                4
            ],
            "messageChannelId": [
                555
            ],
            "name": [
                1
            ],
            "parentFolderId": [
                1
            ],
            "pendingSyncAction": [
                379
            ],
            "updatedAt": [
                222
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
                222
            ],
            "emailAddress": [
                1
            ],
            "id": [
                555
            ],
            "reason": [
                383
            ],
            "source": [
                384
            ],
            "unsubscribeTopicId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionList": {
            "records": [
                381
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
                412
            ],
            "recordId": [
                1
            ],
            "type": [
                386
            ],
            "updatedCollectionHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventAction": {},
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
                555
            ],
            "property": [
                1
            ],
            "provenance": [
                389
            ],
            "recordId": [
                555
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
                555
            ],
            "locale": [
                1
            ],
            "objectMetadataId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "collectionHashes": [
                164
            ],
            "objectMetadataItems": [
                392
            ],
            "views": [
                393
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
                555
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
                555
            ],
            "key": [
                677
            ],
            "objectMetadataId": [
                555
            ],
            "type": [
                681
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Mutation": {
            "activateSkill": [
                519,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                691,
                {
                    "data": [
                        0,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "addAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        555,
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
            "approveApplicationIframeMediaPermissions": [
                53,
                {
                    "applicationId": [
                        555,
                        "UUID!"
                    ],
                    "approvedIframeMediaPermissions": [
                        321,
                        "[IframeMediaPermissionInput!]!"
                    ]
                }
            ],
            "archiveInboxThread": [
                4,
                {
                    "input": [
                        90,
                        "ArchiveInboxThreadInput!"
                    ]
                }
            ],
            "assignAgentChatThread": [
                4,
                {
                    "assigneeWorkspaceMemberId": [
                        555
                    ],
                    "threadId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                4,
                {
                    "agentId": [
                        555,
                        "UUID!"
                    ],
                    "roleId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                4,
                {
                    "apiKeyId": [
                        555,
                        "UUID!"
                    ],
                    "roleId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "attachRecordToInboxThread": [
                4,
                {
                    "input": [
                        326,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "authorizeApp": [
                96,
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
                148,
                {
                    "input": [
                        147,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "cancelSwitchBillingInterval": [
                135
            ],
            "cancelSwitchBillingPlan": [
                135
            ],
            "cancelSwitchResourceCreditPrice": [
                135
            ],
            "checkCustomDomainValidRecords": [
                243
            ],
            "checkPublicDomainValidRecords": [
                243,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                128,
                {
                    "plan": [
                        119,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        525,
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
                81,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                81,
                {
                    "fileId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                168,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        555,
                        "[UUID!]!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                418,
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
                293,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                293,
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
                293,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                293,
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
                        175,
                        "CreateAgentChatChannelInput!"
                    ]
                }
            ],
            "createApiKey": [
                43,
                {
                    "input": [
                        177,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                370,
                {
                    "input": [
                        178,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                179,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        68,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "createApplicationRegistration": [
                180,
                {
                    "input": [
                        181,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                89,
                {
                    "input": [
                        182,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                117
            ],
            "createCalendarEvent": [
                184,
                {
                    "input": [
                        183,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "createChatThread": [
                17,
                {
                    "channelId": [
                        555
                    ]
                }
            ],
            "createCommandMenuItem": [
                165,
                {
                    "input": [
                        185,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                241,
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
                187,
                {
                    "input": [
                        186,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                252,
                {
                    "input": [
                        188,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "createFileUpload": [
                292,
                {
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ],
                    "fileFolder": [
                        291,
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
                298,
                {
                    "input": [
                        190,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                397,
                {
                    "inputs": [
                        196,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                671,
                {
                    "inputs": [
                        211,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "createManyViewFields": [
                670,
                {
                    "inputs": [
                        212,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "createManyViewGroups": [
                676,
                {
                    "inputs": [
                        215,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "createMcpServer": [
                365,
                {
                    "input": [
                        194,
                        "CreateMcpServerInput!"
                    ]
                }
            ],
            "createMessageSuppression": [
                381,
                {
                    "input": [
                        195,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                397,
                {
                    "input": [
                        196,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                292,
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
                516,
                {
                    "input": [
                        514,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                40,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "objectMetadataId": [
                        555,
                        "UUID!"
                    ],
                    "properties": [
                        338
                    ],
                    "recordId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                3,
                {
                    "input": [
                        176,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "createOneField": [
                278,
                {
                    "input": [
                        198,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "createOneIndex": [
                327,
                {
                    "input": [
                        199,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                351,
                {
                    "input": [
                        193,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                400,
                {
                    "input": [
                        200,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "createOneRole": [
                473,
                {
                    "createRoleInput": [
                        206,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "createPageLayout": [
                421,
                {
                    "input": [
                        201,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                422,
                {
                    "input": [
                        202,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                425,
                {
                    "input": [
                        203,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                444,
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
            "createRelatedRecordPath": [
                465,
                {
                    "input": [
                        205,
                        "CreateRelatedRecordPathInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                516,
                {
                    "input": [
                        515,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "createSkill": [
                519,
                {
                    "input": [
                        207,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                117,
                {
                    "idempotencyKey": [
                        1,
                        "String!"
                    ],
                    "plan": [
                        119,
                        "BillingPlanKey!"
                    ],
                    "recurringInterval": [
                        525,
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
                558,
                {
                    "input": [
                        208,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "createUsageLimit": [
                642,
                {
                    "input": [
                        209,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "createValidationRule": [
                662,
                {
                    "input": [
                        210,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "createView": [
                667,
                {
                    "input": [
                        216,
                        "CreateViewInput!"
                    ]
                }
            ],
            "createViewField": [
                670,
                {
                    "input": [
                        212,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                671,
                {
                    "input": [
                        211,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFilter": [
                672,
                {
                    "input": [
                        214,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                673,
                {
                    "input": [
                        213,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "createViewGroup": [
                676,
                {
                    "input": [
                        215,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createViewSort": [
                679,
                {
                    "input": [
                        217,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "createWebhook": [
                683,
                {
                    "input": [
                        218,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "deactivateSkill": [
                519,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteAgentChatChannel": [
                4,
                {
                    "channelId": [
                        555,
                        "UUID!"
                    ],
                    "destinationChannelId": [
                        555
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
                        48
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                370,
                {
                    "id": [
                        555,
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
                        223,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                165,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                169,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                691
            ],
            "deleteEmailGroupChannel": [
                370,
                {
                    "id": [
                        555,
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
                298,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                397,
                {
                    "ids": [
                        555,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteMcpServer": [
                365,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                4,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                397,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteOneAgent": [
                3,
                {
                    "input": [
                        20,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneField": [
                278,
                {
                    "input": [
                        224,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                327,
                {
                    "input": [
                        225,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                351,
                {
                    "input": [
                        355,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                400,
                {
                    "input": [
                        226,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        555,
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
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteRelatedRecordPath": [
                465,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                227,
                {
                    "input": [
                        228,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "deleteSkill": [
                519,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteTwoFactorAuthenticationMethod": [
                229,
                {
                    "twoFactorAuthenticationMethodId": [
                        555,
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
                        555,
                        "UUID!"
                    ]
                }
            ],
            "deleteUser": [
                655
            ],
            "deleteUserFromWorkspace": [
                659,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteValidationRule": [
                662,
                {
                    "id": [
                        555,
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
                670,
                {
                    "input": [
                        231,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                671,
                {
                    "input": [
                        230,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                672,
                {
                    "input": [
                        232,
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
                676,
                {
                    "input": [
                        233,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                4,
                {
                    "input": [
                        234,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                683,
                {
                    "id": [
                        555,
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
                670,
                {
                    "input": [
                        237,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                671,
                {
                    "input": [
                        236,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                672,
                {
                    "input": [
                        238,
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
                676,
                {
                    "input": [
                        239,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                4,
                {
                    "input": [
                        240,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "detachRecordFromInboxThread": [
                4,
                {
                    "input": [
                        326,
                        "InboxThreadRecordInput!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                169,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                244,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "duplicateMessageList": [
                245,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                246,
                {
                    "input": [
                        247,
                        "EditSsoInput!"
                    ]
                }
            ],
            "emailPasswordResetLink": [
                250,
                {
                    "captchaToken": [
                        1
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        555
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                111
            ],
            "enqueueJob": [
                259,
                {
                    "input": [
                        257,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                261,
                {
                    "input": [
                        260,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "enrichWorkspaceCompany": [
                695
            ],
            "executeOneLogicFunction": [
                353,
                {
                    "input": [
                        275,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "generate": [
                303,
                {
                    "input": [
                        302,
                        "GenerateInput!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                45,
                {
                    "apiKeyId": [
                        555,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                86,
                {
                    "applicationId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                93
            ],
            "generateTransientToken": [
                536
            ],
            "generateTwoFactorAuthenticationBackupCodes": [
                550,
                {
                    "otp": [
                        1
                    ]
                }
            ],
            "generateTwoFactorAuthenticationRecoveryCode": [
                552,
                {
                    "otp": [
                        1
                    ],
                    "userId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "getAuthTokensFromLoginToken": [
                95,
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
                95,
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
                95,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthTokensFromTwoFactorAuthenticationRecoveryCode": [
                553,
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
                305,
                {
                    "input": [
                        306,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                358,
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
                417
            ],
            "grantApplicationCapabilities": [
                55,
                {
                    "input": [
                        315,
                        "GrantApplicationCapabilitiesInput!"
                    ]
                }
            ],
            "impersonate": [
                325,
                {
                    "userId": [
                        555,
                        "UUID!"
                    ],
                    "workspaceId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                333,
                {
                    "input": [
                        332,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                335,
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
                335
            ],
            "installApplication": [
                53,
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
                        555,
                        "UUID!"
                    ]
                }
            ],
            "moveAgentChatThreadToChannel": [
                4,
                {
                    "channelId": [
                        555
                    ],
                    "threadId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "openDirectMessage": [
                555,
                {
                    "workspaceMemberId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "prepareGettingStartedWorkflow": [
                311,
                {
                    "stepActionKey": [
                        308,
                        "GettingStartedStepActionKey!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                4
            ],
            "releaseEnterpriseServerBinding": [
                263
            ],
            "removeAgentChatMessageReaction": [
                23,
                {
                    "emoji": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                4,
                {
                    "input": [
                        468,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "removeRecordShare": [
                460,
                {
                    "principal": [
                        457,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        464,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                4,
                {
                    "agentId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                86,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "renewToken": [
                95,
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
                        555,
                        "UUID!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                4,
                {
                    "input": [
                        469,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                470,
                {
                    "affiliatePartnerName": [
                        1
                    ],
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
                506,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetAiChatAssistantProfile": [
                29
            ],
            "resetCommandMenuItem": [
                165,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                422,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                425,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                531,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "retryChatMessage": [
                498,
                {
                    "modelId": [
                        1
                    ],
                    "threadId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                10
            ],
            "revokeApiKey": [
                43,
                {
                    "input": [
                        471,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                4,
                {
                    "applicationAuthorizationId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "revokeTwoFactorAuthenticationRecoveryCode": [
                4,
                {
                    "userId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                4,
                {
                    "userSessionId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                475,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                488,
                {
                    "input": [
                        484,
                        "RunAgentInput!"
                    ]
                }
            ],
            "runApplicationHealthCheck": [
                71,
                {
                    "applicationId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "runMyApplicationHealthCheck": [
                71,
                {
                    "applicationId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                322,
                {
                    "connectionParameters": [
                        248,
                        "EmailAccountConnectionParameters!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "id": [
                        555
                    ]
                }
            ],
            "sendAppChannelMessage": [
                497,
                {
                    "input": [
                        496,
                        "SendAppChannelMessageInput!"
                    ]
                }
            ],
            "sendChatMessage": [
                498,
                {
                    "browsingContext": [
                        338
                    ],
                    "channelId": [
                        555
                    ],
                    "fileAttachments": [
                        290,
                        "[FileAttachmentInput!]"
                    ],
                    "isAssistantMentioned": [
                        4
                    ],
                    "isAssistantParticipant": [
                        4
                    ],
                    "mentionedWorkspaceMemberIds": [
                        555,
                        "[UUID!]"
                    ],
                    "messageId": [
                        555,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ],
                    "recipientWorkspaceMemberIds": [
                        555,
                        "[UUID!]"
                    ],
                    "shouldAssistantReply": [
                        4
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "threadId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "sendEmail": [
                501,
                {
                    "input": [
                        500,
                        "SendEmailInput!"
                    ]
                }
            ],
            "sendInboxMessage": [
                505,
                {
                    "input": [
                        504,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "sendInvitations": [
                506,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        555
                    ]
                }
            ],
            "sendMessageCampaign": [
                508,
                {
                    "input": [
                        507,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                503,
                {
                    "input": [
                        509,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                47,
                {
                    "input": [
                        511,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "setBillingPartnerCode": [
                116,
                {
                    "partnerCode": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setEnterpriseKey": [
                263,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "setRecordPrivate": [
                460,
                {
                    "isPrivate": [
                        4,
                        "Boolean!"
                    ],
                    "target": [
                        464,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setRecordShare": [
                460,
                {
                    "accessLevel": [
                        456,
                        "RecordShareAccessLevel!"
                    ],
                    "principal": [
                        457,
                        "RecordSharePrincipalInput!"
                    ],
                    "target": [
                        464,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "setResourceCreditSubscriptionPrice": [
                135,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                100,
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
                100,
                {
                    "affiliatePartnerName": [
                        1
                    ],
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
                517,
                {
                    "input": [
                        518
                    ]
                }
            ],
            "signUpInWorkspace": [
                517,
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
                        555
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
                418,
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
                        222,
                        "DateTime!"
                    ],
                    "threadId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "startChannelSync": [
                151,
                {
                    "connectedAccountId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                521,
                {
                    "companyContext": [
                        338
                    ],
                    "personContext": [
                        338
                    ]
                }
            ],
            "stopAgentChatStream": [
                4,
                {
                    "threadId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                522
            ],
            "switchBillingPlan": [
                135,
                {
                    "plan": [
                        119
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                135
            ],
            "syncAppMessageFolders": [
                377,
                {
                    "input": [
                        529,
                        "SyncAppMessageFoldersInput!"
                    ]
                }
            ],
            "syncApplication": [
                705,
                {
                    "dryRun": [
                        4
                    ],
                    "inferDeletionFromMissingEntities": [
                        4
                    ],
                    "manifest": [
                        338,
                        "JSON!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                4
            ],
            "syncMcpServerTools": [
                365,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "trackAnalytics": [
                40,
                {
                    "event": [
                        1
                    ],
                    "name": [
                        1
                    ],
                    "properties": [
                        338
                    ],
                    "type": [
                        41,
                        "AnalyticsType!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                81,
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
                538,
                {
                    "input": [
                        537,
                        "TriggerAddPeopleToMessageListJobInput!"
                    ]
                }
            ],
            "triggerInstallApplication": [
                542,
                {
                    "input": [
                        539,
                        "TriggerInstallApplicationInput!"
                    ]
                }
            ],
            "triggerInstallApplicationJob": [
                541,
                {
                    "input": [
                        540,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplication": [
                546,
                {
                    "input": [
                        543,
                        "TriggerUninstallApplicationInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                545,
                {
                    "input": [
                        544,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUpgradeApplication": [
                548,
                {
                    "input": [
                        547,
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
                        555,
                        "UUID!"
                    ],
                    "input": [
                        560,
                        "UpdateAgentChatChannelInput!"
                    ]
                }
            ],
            "updateAgentChatThreadInboxState": [
                19,
                {
                    "action": [
                        15,
                        "AgentChatInboxAction!"
                    ],
                    "snoozedUntil": [
                        222
                    ],
                    "threadIds": [
                        555,
                        "[UUID!]!"
                    ]
                }
            ],
            "updateApiKey": [
                43,
                {
                    "input": [
                        562,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                370,
                {
                    "input": [
                        563,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateApplication": [
                53,
                {
                    "id": [
                        555,
                        "UUID!"
                    ],
                    "input": [
                        564,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                81,
                {
                    "input": [
                        565,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                85,
                {
                    "input": [
                        567,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                138,
                {
                    "input": [
                        569,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                165,
                {
                    "input": [
                        571,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                370,
                {
                    "input": [
                        572,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                298,
                {
                    "input": [
                        574,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "updateGettingStarted": [
                307,
                {
                    "input": [
                        576,
                        "UpdateGettingStartedInput!"
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                276,
                {
                    "input": [
                        577,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                397,
                {
                    "inputs": [
                        590,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateManyObjects": [
                400,
                {
                    "inputs": [
                        591,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                676,
                {
                    "inputs": [
                        613,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "updateMcpServer": [
                365,
                {
                    "input": [
                        580,
                        "UpdateMcpServerInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                370,
                {
                    "input": [
                        582,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                377,
                {
                    "input": [
                        584,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                377,
                {
                    "input": [
                        586,
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
                397,
                {
                    "input": [
                        590,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                3,
                {
                    "input": [
                        561,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                4,
                {
                    "applicationId": [
                        555
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
                278,
                {
                    "input": [
                        589,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                4,
                {
                    "input": [
                        578,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "updateOneObject": [
                400,
                {
                    "input": [
                        591,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateOneRole": [
                473,
                {
                    "updateRoleInput": [
                        598,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        592,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                422,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        593,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                425,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        595,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        597,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                336,
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
                519,
                {
                    "input": [
                        600,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                531,
                {
                    "input": [
                        601,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                558,
                {
                    "input": [
                        602,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                642,
                {
                    "input": [
                        603,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "updateUserCreditsFallback": [
                110,
                {
                    "userCreditsFallback": [
                        657,
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
                662,
                {
                    "input": [
                        604,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "updateView": [
                667,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        615,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "updateViewField": [
                670,
                {
                    "input": [
                        608,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                671,
                {
                    "input": [
                        606,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                672,
                {
                    "input": [
                        611,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                673,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        610,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewGroup": [
                676,
                {
                    "input": [
                        613,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateViewSort": [
                679,
                {
                    "input": [
                        616,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "updateWebhook": [
                683,
                {
                    "input": [
                        618,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                691,
                {
                    "data": [
                        622,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedEmbeddingOrigins": [
                691,
                {
                    "data": [
                        620,
                        "UpdateWorkspaceAllowedEmbeddingOriginsInput!"
                    ]
                }
            ],
            "updateWorkspaceIframeMediaPermissions": [
                691,
                {
                    "data": [
                        621,
                        "UpdateWorkspaceIframeMediaPermissionsInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                700,
                {
                    "roleId": [
                        555,
                        "UUID!"
                    ],
                    "workspaceMemberId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                4,
                {
                    "input": [
                        623,
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
                81,
                {
                    "file": [
                        624,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "uploadApplicationFile": [
                289,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        624,
                        "Upload!"
                    ],
                    "fileFolder": [
                        291,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                293,
                {
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "file": [
                        624,
                        "Upload!"
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                293,
                {
                    "file": [
                        624,
                        "Upload!"
                    ],
                    "workspaceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                293,
                {
                    "file": [
                        624,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                293,
                {
                    "file": [
                        624,
                        "Upload!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                285,
                {
                    "upsertFieldPermissionsInput": [
                        625,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                667,
                {
                    "input": [
                        628,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                408,
                {
                    "upsertObjectPermissionsInput": [
                        629,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                474,
                {
                    "upsertPermissionFlagsInput": [
                        630,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                632,
                {
                    "input": [
                        631,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "upsertViewWidget": [
                667,
                {
                    "input": [
                        633,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                89,
                {
                    "input": [
                        660,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                664,
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
                100,
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
                252,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                665,
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
            "agentChatChannelId": [
                555
            ],
            "agentId": [
                555
            ],
            "applicationId": [
                555
            ],
            "color": [
                1
            ],
            "createdAt": [
                222
            ],
            "folderId": [
                555
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "link": [
                1
            ],
            "name": [
                1
            ],
            "nativePageKey": [
                1
            ],
            "pageLayoutId": [
                555
            ],
            "position": [
                6
            ],
            "targetObjectMetadataId": [
                555
            ],
            "targetRecordId": [
                555
            ],
            "targetRecordIdentifier": [
                453
            ],
            "type": [
                398
            ],
            "updatedAt": [
                222
            ],
            "userWorkspaceId": [
                555
            ],
            "viewId": [
                555
            ],
            "workflowId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "NotesConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
            "applicationId": [
                555
            ],
            "color": [
                1
            ],
            "createdAt": [
                222
            ],
            "description": [
                1
            ],
            "disabledObjectPermissionActions": [
                1
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                403,
                {
                    "filter": [
                        283,
                        "FieldFilter!"
                    ],
                    "paging": [
                        220,
                        "CursorPaging!"
                    ]
                }
            ],
            "fieldsList": [
                278
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "imageIdentifierFieldMetadataId": [
                555
            ],
            "indexMetadataList": [
                327
            ],
            "indexMetadatas": [
                405,
                {
                    "filter": [
                        330,
                        "IndexFilter!"
                    ],
                    "paging": [
                        220,
                        "CursorPaging!"
                    ]
                }
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
                555
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
                407
            ],
            "searchFieldMetadataList": [
                494
            ],
            "shortcut": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "edges": [
                402
            ],
            "pageInfo": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "cursor": [
                172
            ],
            "node": [
                400
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "edges": [
                282
            ],
            "pageInfo": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                404
            ],
            "id": [
                556
            ],
            "isActive": [
                137
            ],
            "isRemote": [
                137
            ],
            "isSearchable": [
                137
            ],
            "isSystem": [
                137
            ],
            "isUICreatable": [
                137
            ],
            "isUIEditable": [
                137
            ],
            "isUIReadOnly": [
                137
            ],
            "or": [
                404
            ],
            "universalIdentifier": [
                556
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "edges": [
                328
            ],
            "pageInfo": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                555
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
                555
            ],
            "restrictedFields": [
                338
            ],
            "rowLevelPermissionPredicateGroups": [
                477
            ],
            "rowLevelPermissionPredicates": [
                476
            ],
            "uneditableFields": [
                555
            ],
            "unreadableFields": [
                555
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
                555
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
                221
            ],
            "objectNameSingular": [
                1
            ],
            "properties": [
                412
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
                338
            ],
            "before": [
                338
            ],
            "diff": [
                338
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
                411
            ],
            "queryIds": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "ObjectRecordsPermissions": {
            "canCreateAllRecords": [
                4
            ],
            "canDestroyAllRecords": [
                4
            ],
            "canReadAllRecords": [
                4
            ],
            "canSoftDeleteAllRecords": [
                4
            ],
            "canUpdateAllRecords": [
                4
            ],
            "objectMetadataId": [
                555
            ],
            "restrictedFields": [
                338
            ],
            "rowLevelRecordsPermissions": [
                483
            ],
            "uneditableFields": [
                555
            ],
            "unreadableFields": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                416
            ],
            "previousOnboardingStatus": [
                416
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
                172
            ],
            "hasNextPage": [
                4
            ],
            "hasPreviousPage": [
                4
            ],
            "startCursor": [
                172
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "applicationId": [
                555
            ],
            "createdAt": [
                222
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                555
            ],
            "deletedAt": [
                222
            ],
            "id": [
                555
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
                555
            ],
            "tabs": [
                422
            ],
            "type": [
                424
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "applicationId": [
                555
            ],
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
                423
            ],
            "pageLayoutId": [
                555
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
            ],
            "widgets": [
                425
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutType": {},
        "PageLayoutWidget": {
            "applicationGrantedIframeMediaPermissions": [
                320
            ],
            "applicationId": [
                555
            ],
            "applicationName": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalDisplay": [
                338
            ],
            "configuration": [
                684
            ],
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "gridPosition": [
                317
            ],
            "id": [
                555
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
                555
            ],
            "pageLayoutTabId": [
                555
            ],
            "position": [
                428
            ],
            "title": [
                1
            ],
            "type": [
                686
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                423
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
                423
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
                426
            ],
            "on_PageLayoutWidgetGridPosition": [
                427
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                430
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetVerticalListPosition": {
            "heightBehavior": [
                429
            ],
            "index": [
                10
            ],
            "layoutMode": [
                423
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
                555
            ],
            "createdAt": [
                222
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
                555
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "PieChartConfiguration": {
            "aggregateFieldMetadataId": [
                555
            ],
            "aggregateOperation": [
                27
            ],
            "color": [
                1
            ],
            "configurationType": [
                685
            ],
            "dateGranularity": [
                414
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
                338
            ],
            "firstDayOfTheWeek": [
                10
            ],
            "groupByFieldMetadataId": [
                555
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
                152
            ],
            "orderBy": [
                316
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
                437
            ],
            "formattedToRawLookup": [
                338
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
                338
            ],
            "objectMetadataId": [
                555
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
                350
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
        "PreviewMessageCampaignSendInput": {
            "campaignId": [
                1
            ],
            "scheduledAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "PreviewMessageCampaignSendOutputDTO": {
            "audience": [
                146
            ],
            "blockers": [
                369
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                555
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
                249
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
                555
            ],
            "createdAt": [
                222
            ],
            "domain": [
                1
            ],
            "id": [
                555
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
                277
            ],
            "metadata": [
                446
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
                443
            ],
            "IMAP": [
                443
            ],
            "SMTP": [
                443
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "authBypassProviders": [
                91
            ],
            "authProviders": [
                92
            ],
            "displayName": [
                1
            ],
            "id": [
                555
            ],
            "logo": [
                1
            ],
            "workspaceUrls": [
                709
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
                555
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
                12,
                {
                    "after": [
                        1
                    ],
                    "assignment": [
                        7
                    ],
                    "channelId": [
                        555,
                        "UUID!"
                    ],
                    "filter": [
                        11
                    ],
                    "first": [
                        10
                    ],
                    "status": [
                        13
                    ]
                }
            ],
            "agentChatChannels": [
                5
            ],
            "agentChatOpenThreadsSummary": [
                16
            ],
            "agentRuns": [
                24,
                {
                    "agentId": [
                        555,
                        "UUID!"
                    ],
                    "limit": [
                        10,
                        "Int!"
                    ]
                }
            ],
            "aiChatUsage": [
                31
            ],
            "aiChatUserCreditsUsage": [
                32
            ],
            "apiKey": [
                43,
                {
                    "input": [
                        304,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "apiKeys": [
                43
            ],
            "appConnection": [
                46,
                {
                    "id": [
                        18,
                        "ID!"
                    ]
                }
            ],
            "appConnections": [
                46,
                {
                    "filter": [
                        347
                    ]
                }
            ],
            "appKeyValue": [
                47,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        48
                    ]
                }
            ],
            "appMessageChannels": [
                370,
                {
                    "filter": [
                        348
                    ]
                }
            ],
            "appMessageFolders": [
                377,
                {
                    "filter": [
                        349
                    ]
                }
            ],
            "applicationConnectedAccounts": [
                56,
                {
                    "applicationId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                57,
                {
                    "applicationId": [
                        555,
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
                493,
                {
                    "applicationId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "barChartData": [
                103,
                {
                    "input": [
                        104,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "billingPartnerCode": [
                116
            ],
            "billingPlans": [
                118
            ],
            "billingPortalSession": [
                128,
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
                555,
                {
                    "calendarEventId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                21,
                {
                    "agentUniversalIdentifier": [
                        555
                    ],
                    "threadId": [
                        555
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                154,
                {
                    "agentUniversalIdentifier": [
                        555
                    ],
                    "threadId": [
                        555
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "chatThread": [
                17,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                157,
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
                699,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                523,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "commandMenuItem": [
                165,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "commandMenuItems": [
                165
            ],
            "currentUser": [
                655
            ],
            "currentUserApplicationAuthorizations": [
                54
            ],
            "currentUserSessions": [
                658
            ],
            "currentWorkspace": [
                691
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
                264
            ],
            "eventLogs": [
                271,
                {
                    "input": [
                        270,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "exportApplication": [
                61,
                {
                    "shouldIncludeDependencies": [
                        4
                    ],
                    "shouldIncludeSourceFiles": [
                        4
                    ],
                    "universalIdentifier": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                278,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                280,
                {
                    "filter": [
                        283,
                        "FieldFilter!"
                    ],
                    "paging": [
                        220,
                        "CursorPaging!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                442,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                81,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationMonitoring": [
                73,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        222
                    ],
                    "periodStart": [
                        222
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                83,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "periodEnd": [
                        222
                    ],
                    "periodStart": [
                        222
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                85,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findClaimableApplicationRegistration": [
                158,
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
                341,
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
                81
            ],
            "findManyApplications": [
                53
            ],
            "findManyLogicFunctions": [
                351
            ],
            "findManyMarketplaceApps": [
                359,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findManyPublicDomains": [
                444
            ],
            "findMarketplaceAppDetail": [
                360,
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
                        20,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneApplication": [
                53,
                {
                    "id": [
                        555
                    ],
                    "universalIdentifier": [
                        555
                    ]
                }
            ],
            "findOneApplicationRegistration": [
                81,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                351,
                {
                    "input": [
                        355,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                341,
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
                341,
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
                693
            ],
            "findWorkspaceFromInviteHash": [
                691,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceInvitations": [
                698
            ],
            "frontComponent": [
                298,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                298
            ],
            "getAddressDetails": [
                438,
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
                37
            ],
            "getApiKeyRoles": [
                473
            ],
            "getApprovedAccessDomains": [
                89
            ],
            "getAutoCompleteAddress": [
                97,
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
                338,
                {
                    "input": [
                        355,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                171,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "getEmailingDomains": [
                252
            ],
            "getInviteSuggestions": [
                337
            ],
            "getJobs": [
                341,
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
                        355,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getPageLayout": [
                421,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                422,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                422,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                425,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                425,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                421,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        424
                    ]
                }
            ],
            "getPermissionFlags": [
                432
            ],
            "getPublicWorkspaceDataByDomain": [
                448,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                449,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "getResourceCreditUsage": [
                127
            ],
            "getRole": [
                473,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                473
            ],
            "getSSOIdentityProviders": [
                295
            ],
            "getToolIndex": [
                535
            ],
            "getToolInputSchema": [
                338,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                639,
                {
                    "input": [
                        640
                    ]
                }
            ],
            "getView": [
                667,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                670,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                671,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                671,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                670,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilter": [
                672,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroup": [
                673,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                673,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilters": [
                672,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                676,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewGroups": [
                676,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                679,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                679,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViews": [
                667,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        681,
                        "[ViewType!]"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                696
            ],
            "gettingStartedProgress": [
                307
            ],
            "gettingStartedWorkflowPreviews": [
                312
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
                343,
                {
                    "input": [
                        344,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "listPlans": [
                118
            ],
            "mcpServer": [
                365,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "mcpServers": [
                365
            ],
            "messageSuppressions": [
                382,
                {
                    "input": [
                        296,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "metadataTranslations": [
                387,
                {
                    "input": [
                        390,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "minimalMetadata": [
                391
            ],
            "mostlyEmptyFieldMetadataIds": [
                555,
                {
                    "objectMetadataId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "myApplicationPreferences": [
                80
            ],
            "myCalendarChannels": [
                138,
                {
                    "connectedAccountId": [
                        555
                    ]
                }
            ],
            "myConnectedAccounts": [
                169
            ],
            "myMessageChannels": [
                370,
                {
                    "connectedAccountId": [
                        555
                    ]
                }
            ],
            "myMessageFolders": [
                377,
                {
                    "messageChannelId": [
                        555
                    ]
                }
            ],
            "myUserApplicationVariables": [
                701
            ],
            "navigationMenuItem": [
                397,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                397
            ],
            "object": [
                400,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                410
            ],
            "objects": [
                401,
                {
                    "filter": [
                        404,
                        "ObjectFilter!"
                    ],
                    "paging": [
                        220,
                        "CursorPaging!"
                    ]
                }
            ],
            "pieChartData": [
                435,
                {
                    "input": [
                        436,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "previewMessageCampaignAudience": [
                146,
                {
                    "input": [
                        439,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "previewMessageCampaignSend": [
                441,
                {
                    "input": [
                        440,
                        "PreviewMessageCampaignSendInput!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                360,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                359
            ],
            "recordPermissions": [
                455,
                {
                    "targets": [
                        464,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "recordSharing": [
                460,
                {
                    "target": [
                        464,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "relatedRecordPaths": [
                465
            ],
            "skill": [
                519,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "skills": [
                519
            ],
            "timelineActivityTypes": [
                531
            ],
            "twoFactorAuthenticationBackupCodeStatus": [
                549
            ],
            "twoFactorAuthenticationRecoveryStatus": [
                554,
                {
                    "userId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                558
            ],
            "usageLimits": [
                642
            ],
            "usageQuotaDefinitions": [
                646
            ],
            "usageQuotaScopeConsumption": [
                648,
                {
                    "input": [
                        649,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "usageQuotasWithConsumption": [
                650
            ],
            "validatePasswordResetToken": [
                661,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validationRules": [
                662,
                {
                    "objectMetadataId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "validationRulesReadingField": [
                662,
                {
                    "fieldMetadataId": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "webhook": [
                683,
                {
                    "id": [
                        555,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                683
            ],
            "__typename": [
                1
            ]
        },
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                555
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
                555
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
                555
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
                555
            ],
            "permissions": [
                454
            ],
            "recordId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "RecordShareAccessLevel": {},
        "RecordSharePrincipalInput": {
            "roleId": [
                555
            ],
            "workspaceMemberId": [
                555
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
            "hasManagedGeneralAccess": [
                4
            ],
            "isPrivate": [
                4
            ],
            "isShareable": [
                4
            ],
            "permissions": [
                454
            ],
            "roles": [
                462
            ],
            "shares": [
                461
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "accessLevel": [
                456
            ],
            "id": [
                18
            ],
            "principalId": [
                555
            ],
            "principalRoleId": [
                555
            ],
            "principalType": [
                458
            ],
            "rowCause": [
                459
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingRoleDTO": {
            "canRead": [
                4
            ],
            "canUpdate": [
                4
            ],
            "id": [
                555
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
                685
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
                555
            ],
            "recordId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "RelatedRecordPath": {
            "firstFieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "isInherent": [
                4
            ],
            "objectMetadataId": [
                555
            ],
            "secondFieldMetadataId": [
                555
            ],
            "thirdFieldMetadataId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "sourceFieldMetadata": [
                278
            ],
            "sourceObjectMetadata": [
                400
            ],
            "targetFieldMetadata": [
                278
            ],
            "targetObjectMetadata": [
                400
            ],
            "type": [
                467
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
                555
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
            "tiptap": [
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
                44
            ],
            "applicationId": [
                555
            ],
            "canAccessAllAgentChatChannels": [
                4
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
                285
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "isEditable": [
                4
            ],
            "label": [
                1
            ],
            "objectPermissions": [
                408
            ],
            "permissionFlags": [
                474
            ],
            "rowLevelPermissionFieldPermissions": [
                285
            ],
            "rowLevelPermissionPredicateGroups": [
                477
            ],
            "rowLevelPermissionPredicates": [
                476
            ],
            "rowLevelPermissionRules": [
                482
            ],
            "universalIdentifier": [
                555
            ],
            "workspaceMembers": [
                700
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
                555
            ],
            "roleId": [
                555
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
                481
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                1
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
                338
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
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "id": [
                1
            ],
            "logicalOperator": [
                479
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
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "id": [
                555
            ],
            "logicalOperator": [
                479
            ],
            "objectMetadataId": [
                555
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                555
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
                555
            ],
            "id": [
                555
            ],
            "operand": [
                481
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                6
            ],
            "relationFieldMetadataId": [
                555
            ],
            "rowLevelPermissionPredicateGroupId": [
                555
            ],
            "subFieldName": [
                1
            ],
            "value": [
                338
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
        "RowLevelPermissionRule": {
            "canCreateRecords": [
                4
            ],
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "id": [
                555
            ],
            "objectMetadataId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelRecordsPermissions": {
            "canCreateRecords": [
                4
            ],
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "predicateGroups": [
                477
            ],
            "predicates": [
                476
            ],
            "ruleId": [
                555
            ],
            "uneditableFields": [
                555
            ],
            "unreadableFields": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentInput": {
            "additionalInstructions": [
                1
            ],
            "agentUniversalIdentifier": [
                1
            ],
            "input": [
                486
            ],
            "messages": [
                486
            ],
            "prompt": [
                1
            ],
            "responseFormat": [
                338
            ],
            "runAsWorkspaceMemberId": [
                555
            ],
            "thread": [
                489
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
                555
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
                485
            ],
            "content": [
                1
            ],
            "role": [
                487
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
                338
            ],
            "runId": [
                555
            ],
            "status": [
                1
            ],
            "success": [
                4
            ],
            "threadId": [
                555
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
                555
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                492
            ],
            "type": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                555
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                492
            ],
            "type": [
                318
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
                222
            ],
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "position": [
                6
            ],
            "tsVectorFieldMetadataId": [
                555
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageEmailInput": {
            "bcc": [
                1
            ],
            "body": [
                1
            ],
            "cc": [
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
        "SendAppChannelMessageInput": {
            "email": [
                495
            ],
            "idempotencyKey": [
                555
            ],
            "messageChannelId": [
                555
            ],
            "messageThreadId": [
                555
            ],
            "text": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendAppChannelMessageOutput": {
            "messageId": [
                555
            ],
            "messageThreadId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "mentionedParticipantWorkspaceMemberIds": [
                555
            ],
            "messageId": [
                1
            ],
            "queued": [
                4
            ],
            "recipientParticipantWorkspaceMemberIds": [
                555
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
                499
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
            "targetRecord": [
                502
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
        "SendEmailTargetRecordInput": {
            "objectNameSingular": [
                1
            ],
            "recordId": [
                555
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
                338
            ],
            "workspaceMemberIds": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "SendInboxMessageResult": {
            "threadId": [
                555
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
                698
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
                222
            ],
            "__typename": [
                1
            ]
        },
        "SendMessageCampaignOutputDTO": {
            "audience": [
                146
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
                48
            ],
            "value": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "SettingsMenuItem": {
            "applicationId": [
                555
            ],
            "createdAt": [
                222
            ],
            "frontComponentId": [
                555
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "position": [
                6
            ],
            "scope": [
                513
            ],
            "slug": [
                1
            ],
            "title": [
                1
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
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
                555
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
                555
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                492
            ],
            "type": [
                318
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                93
            ],
            "workspace": [
                710
            ],
            "__typename": [
                1
            ]
        },
        "SignUpInNewWorkspaceInput": {
            "affiliatePartnerName": [
                1
            ],
            "captchaToken": [
                1
            ],
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
                555
            ],
            "content": [
                1
            ],
            "createdAt": [
                222
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
                222
            ],
            "__typename": [
                1
            ]
        },
        "StandaloneRichTextConfiguration": {
            "body": [
                472
            ],
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                708
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
                272,
                {
                    "fieldFilters": [
                        266,
                        "[EventLogFieldFilterInput!]"
                    ],
                    "table": [
                        273,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                452,
                {
                    "input": [
                        204,
                        "CreateRecordExportInput!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                356,
                {
                    "input": [
                        357,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                14,
                {
                    "agentUniversalIdentifier": [
                        555
                    ],
                    "runId": [
                        555
                    ],
                    "threadId": [
                        555
                    ],
                    "threadKey": [
                        1
                    ]
                }
            ],
            "onEventSubscription": [
                274,
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
                528
            ],
            "supportFrontChatId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SupportDriver": {},
        "SyncAppMessageFoldersInput": {
            "folders": [
                50
            ],
            "messageChannelId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                685
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
                555
            ],
            "createdAt": [
                222
            ],
            "emit": [
                532
            ],
            "frontComponentUniversalIdentifier": [
                555
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
                555
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                555
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "objectUniversalIdentifier": [
                555
            ],
            "on": [
                1
            ],
            "through": [
                533
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmitThrough": {
            "happensAtFieldUniversalIdentifier": [
                555
            ],
            "relationFieldUniversalIdentifier": [
                555
            ],
            "triggerFieldUniversalIdentifiers": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                685
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
                338
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
                93
            ],
            "__typename": [
                1
            ]
        },
        "TriggerAddPeopleToMessageListJobInput": {
            "messageListId": [
                555
            ],
            "personFilter": [
                338
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
        "TwoFactorAuthenticationBackupCodeStatus": {
            "remainingBackupCodeCount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationBackupCodes": {
            "backupCodes": [
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCode": {
            "expiresAt": [
                222
            ],
            "recoveryCode": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationRecoveryCodeRedemption": {
            "isTwoFactorAuthenticationReset": [
                4
            ],
            "provisioningUri": [
                1
            ],
            "tokens": [
                94
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
                222
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "UUIDFilterComparison": {
            "eq": [
                555
            ],
            "gt": [
                555
            ],
            "gte": [
                555
            ],
            "iLike": [
                555
            ],
            "in": [
                555
            ],
            "is": [
                4
            ],
            "isNot": [
                4
            ],
            "like": [
                555
            ],
            "lt": [
                555
            ],
            "lte": [
                555
            ],
            "neq": [
                555
            ],
            "notILike": [
                555
            ],
            "notIn": [
                555
            ],
            "notLike": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeHostnameStatus": {},
        "UnsubscribeTopic": {
            "createdAt": [
                222
            ],
            "description": [
                1
            ],
            "id": [
                555
            ],
            "name": [
                1
            ],
            "updatedAt": [
                222
            ],
            "visibility": [
                559
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
            "position": [
                6
            ],
            "roleIds": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateAgentInput": {
            "avatarColor": [
                1
            ],
            "avatarShape": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "modelConfiguration": [
                338
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
                338
            ],
            "roleId": [
                555
            ],
            "triggers": [
                338
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
                555
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
                555
            ],
            "isSyncEnabled": [
                4
            ],
            "messagingProviderUniversalIdentifier": [
                555
            ],
            "visibility": [
                376
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
                566
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
                568
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
                555
            ],
            "update": [
                570
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                139
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
                142
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "availabilityCoreObjectName": [
                1
            ],
            "availabilityObjectMetadataId": [
                555
            ],
            "availabilityType": [
                166
            ],
            "engineComponentKey": [
                256
            ],
            "hotKeys": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "isPinned": [
                4
            ],
            "label": [
                1
            ],
            "pageLayoutId": [
                555
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "defaultValue": [
                338
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
                338
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                555
            ],
            "options": [
                338
            ],
            "settings": [
                338
            ],
            "translations": [
                388
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
                555
            ],
            "update": [
                575
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
        "UpdateGettingStartedInput": {
            "completedStepActionKey": [
                308
            ],
            "completedStepChatThreadId": [
                1
            ],
            "isHidden": [
                4
            ],
            "selectedStepActionKey": [
                308
            ],
            "snoozedUntil": [
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
                555
            ],
            "update": [
                579
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "cronTriggerSettings": [
                338
            ],
            "databaseEventTriggerSettings": [
                338
            ],
            "description": [
                1
            ],
            "handlerName": [
                1
            ],
            "httpRouteTriggerSettings": [
                338
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
                338
            ],
            "workflowActionTriggerSettings": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInput": {
            "id": [
                555
            ],
            "update": [
                581
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMcpServerInputUpdates": {
            "connectionProviderId": [
                555
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
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                555
            ],
            "update": [
                583
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "contactAutoCreationPolicy": [
                371
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
                378
            ],
            "visibility": [
                376
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                555
            ],
            "update": [
                585
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
                555
            ],
            "update": [
                585
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
                555
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
                555
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
                555
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
                555
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
                407
            ],
            "shortcut": [
                1
            ],
            "translations": [
                388
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                555
            ],
            "update": [
                573
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                555
            ],
            "update": [
                587
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "id": [
                555
            ],
            "update": [
                588
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
                555
            ],
            "type": [
                424
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
                423
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
                555
            ],
            "layoutMode": [
                423
            ],
            "position": [
                6
            ],
            "title": [
                1
            ],
            "widgets": [
                596
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
                338
            ],
            "configuration": [
                338
            ],
            "isActive": [
                4
            ],
            "objectMetadataId": [
                555
            ],
            "pageLayoutTabId": [
                555
            ],
            "position": [
                338
            ],
            "title": [
                1
            ],
            "type": [
                686
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
                338
            ],
            "configuration": [
                338
            ],
            "id": [
                555
            ],
            "objectMetadataId": [
                555
            ],
            "pageLayoutTabId": [
                555
            ],
            "position": [
                338
            ],
            "title": [
                1
            ],
            "type": [
                686
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
                555
            ],
            "tabs": [
                594
            ],
            "type": [
                424
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "id": [
                555
            ],
            "update": [
                599
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRolePayload": {
            "canAccessAllAgentChatChannels": [
                4
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
                555
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
                555
            ],
            "isActive": [
                4
            ],
            "label": [
                1
            ],
            "translations": [
                388
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
                559
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                555
            ],
            "payload": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                555
            ],
            "update": [
                605
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
                555
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
                555
            ],
            "update": [
                607
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
                555
            ],
            "update": [
                609
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
                6
            ],
            "size": [
                6
            ],
            "viewFieldGroupId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                555
            ],
            "logicalOperator": [
                674
            ],
            "parentViewFilterGroupId": [
                555
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "viewId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                555
            ],
            "update": [
                612
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                555
            ],
            "operand": [
                675
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                555
            ],
            "subFieldName": [
                1
            ],
            "value": [
                338
            ],
            "viewFilterGroupId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                555
            ],
            "update": [
                614
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                555
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
                555
            ],
            "calendarFieldMetadataId": [
                555
            ],
            "calendarLayout": [
                668
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                555
            ],
            "isCompact": [
                4
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                555
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                555
            ],
            "name": [
                1
            ],
            "openRecordIn": [
                678
            ],
            "position": [
                6
            ],
            "shouldDisplayGroupsAsTabs": [
                4
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "translations": [
                388
            ],
            "type": [
                681
            ],
            "visibility": [
                682
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                555
            ],
            "update": [
                617
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                680
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
                555
            ],
            "update": [
                619
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
            "roleId": [
                555
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
        "UpdateWorkspaceAllowedEmbeddingOriginsInput": {
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
        "UpdateWorkspaceIframeMediaPermissionsInput": {
            "camera": [
                4
            ],
            "microphone": [
                4
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
                35
            ],
            "aiChatAssistantProfile": [
                30
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                35
            ],
            "aiDataPolicy": [
                34
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                338
            ],
            "allowImpersonation": [
                4
            ],
            "customDomain": [
                1
            ],
            "defaultRoleId": [
                555
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
                6
            ],
            "workspaceDiscoverability": [
                697
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceMemberSettingsInput": {
            "update": [
                338
            ],
            "workspaceMemberId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "UpsertFieldPermissionsInput": {
            "fieldPermissions": [
                286
            ],
            "roleId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "fieldMetadataId": [
                555
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "viewFieldId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "fields": [
                626
            ],
            "id": [
                555
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
                626
            ],
            "groups": [
                627
            ],
            "widgetId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "objectPermissions": [
                409
            ],
            "roleId": [
                555
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "canCreateRecords": [
                4
            ],
            "canDestroyRecords": [
                4
            ],
            "canReadRecords": [
                4
            ],
            "canSoftDeleteRecords": [
                4
            ],
            "canUpdateRecords": [
                4
            ],
            "objectMetadataId": [
                555
            ],
            "predicateGroups": [
                478
            ],
            "predicates": [
                480
            ],
            "roleId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicateGroups": [
                477
            ],
            "predicates": [
                476
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "view": [
                637
            ],
            "viewFields": [
                634
            ],
            "viewFilterGroups": [
                635
            ],
            "viewFilters": [
                636
            ],
            "viewSorts": [
                638
            ],
            "widgetId": [
                555
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
                555
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
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                555
            ],
            "logicalOperator": [
                674
            ],
            "parentViewFilterGroupId": [
                555
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
                555
            ],
            "id": [
                555
            ],
            "operand": [
                675
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                555
            ],
            "subFieldName": [
                1
            ],
            "value": [
                338
            ],
            "viewFilterGroupId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "calendarEndFieldMetadataId": [
                555
            ],
            "calendarFieldMetadataId": [
                555
            ],
            "calendarLayout": [
                668
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                555
            ],
            "kanbanColumnWidth": [
                10
            ],
            "mainGroupByFieldMetadataId": [
                555
            ],
            "openRecordIn": [
                678
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                681
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "direction": [
                680
            ],
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "periodEnd": [
                222
            ],
            "periodStart": [
                222
            ],
            "timeSeries": [
                652
            ],
            "usageByApplication": [
                641
            ],
            "usageByModel": [
                641
            ],
            "usageByOperationType": [
                641
            ],
            "usageByUser": [
                641
            ],
            "userDailyUsage": [
                654
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "operationTypes": [
                644
            ],
            "periodEnd": [
                222
            ],
            "periodStart": [
                222
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
            "userCreditsUsed": [
                6
            ],
            "workspaceCreditsUsed": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimit": {
            "burstValue": [
                108
            ],
            "createdAt": [
                222
            ],
            "id": [
                555
            ],
            "limitKind": [
                1
            ],
            "limitValue": [
                108
            ],
            "operationType": [
                644
            ],
            "periodCount": [
                10
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                651
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                653
            ],
            "updatedAt": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "allowedUnits": [
                653
            ],
            "operationType": [
                644
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageQuotaDefinition": {
            "allowedOperations": [
                643
            ],
            "allowedSpenderTypes": [
                1
            ],
            "limitKind": [
                1
            ],
            "operatorOnlyScopes": [
                647
            ],
            "resourceType": [
                651
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinitions": {
            "definitions": [
                645
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
                644
            ],
            "periodUnit": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                108
            ],
            "periodEnd": [
                222
            ],
            "periodStart": [
                222
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "operationType": [
                644
            ],
            "periodUnit": [
                1
            ],
            "resourceType": [
                651
            ],
            "spenderId": [
                1
            ],
            "spenderType": [
                1
            ],
            "unit": [
                653
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "consumedValue": [
                108
            ],
            "id": [
                555
            ],
            "isEnforced": [
                4
            ],
            "limitValue": [
                108
            ],
            "operationType": [
                644
            ],
            "periodEnd": [
                222
            ],
            "periodStart": [
                222
            ],
            "periodUnit": [
                1
            ],
            "remainingValue": [
                108
            ],
            "resourceType": [
                651
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
                653
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
            "workspaceCreditsUsed": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UsageUnit": {},
        "UsageUserDaily": {
            "dailyUsage": [
                652
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
                99
            ],
            "canAccessFullAdminPanel": [
                4
            ],
            "canImpersonate": [
                4
            ],
            "createdAt": [
                222
            ],
            "currentUserWorkspace": [
                659
            ],
            "currentWorkspace": [
                691
            ],
            "deletedAt": [
                222
            ],
            "deletedWorkspaceMembers": [
                235
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
                555
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
                416
            ],
            "previousOnboardingStatus": [
                416
            ],
            "supportUserHash": [
                1
            ],
            "updatedAt": [
                222
            ],
            "userVars": [
                339
            ],
            "userWorkspaces": [
                659
            ],
            "workspaceMember": [
                700
            ],
            "workspaceMembers": [
                700
            ],
            "workspaces": [
                659
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
                338
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
            "city": [
                1
            ],
            "country": [
                1
            ],
            "createdAt": [
                222
            ],
            "expiresAt": [
                222
            ],
            "id": [
                555
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
                222
            ],
            "region": [
                1
            ],
            "userAgent": [
                1
            ],
            "workspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "id": [
                555
            ],
            "isImpersonating": [
                4
            ],
            "locale": [
                1
            ],
            "objectRecordsPermissions": [
                415
            ],
            "permissionFlags": [
                433
            ],
            "twoFactorAuthenticationMethodSummary": [
                551
            ],
            "updatedAt": [
                222
            ],
            "user": [
                655
            ],
            "userId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "approvedAccessDomainId": [
                555
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
                555
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
                555
            ],
            "expression": [
                1
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
                555
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
                93
            ],
            "workspaceUrls": [
                709
            ],
            "__typename": [
                1
            ]
        },
        "VerifyTwoFactorAuthenticationMethod": {
            "backupCodes": [
                1
            ],
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
                555
            ],
            "calendarEndFieldMetadataId": [
                555
            ],
            "calendarFieldMetadataId": [
                555
            ],
            "calendarLayout": [
                668
            ],
            "createdAt": [
                222
            ],
            "createdByUserWorkspaceId": [
                555
            ],
            "deletedAt": [
                222
            ],
            "groupLoadLimit": [
                10
            ],
            "icon": [
                1
            ],
            "id": [
                555
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
                555
            ],
            "kanbanColumnWidth": [
                10
            ],
            "key": [
                677
            ],
            "mainGroupByFieldMetadataId": [
                555
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                555
            ],
            "openRecordIn": [
                678
            ],
            "position": [
                6
            ],
            "shouldDisplayGroupsAsTabs": [
                4
            ],
            "shouldHideEmptyGroups": [
                4
            ],
            "type": [
                681
            ],
            "universalIdentifier": [
                555
            ],
            "updatedAt": [
                222
            ],
            "viewFieldGroups": [
                671
            ],
            "viewFields": [
                670
            ],
            "viewFilterGroups": [
                673
            ],
            "viewFilters": [
                672
            ],
            "viewGroups": [
                676
            ],
            "viewSorts": [
                679
            ],
            "visibility": [
                682
            ],
            "workspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ViewCalendarLayout": {},
        "ViewConfiguration": {
            "configurationType": [
                685
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
                555
            ],
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
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
                555
            ],
            "updatedAt": [
                222
            ],
            "viewFieldGroupId": [
                555
            ],
            "viewId": [
                555
            ],
            "workspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ViewFieldGroup": {
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "id": [
                555
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
                222
            ],
            "viewFields": [
                670
            ],
            "viewId": [
                555
            ],
            "workspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilter": {
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "operand": [
                675
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "relationTargetFieldMetadataId": [
                555
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                222
            ],
            "value": [
                338
            ],
            "viewFilterGroupId": [
                555
            ],
            "viewId": [
                555
            ],
            "workspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroup": {
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "id": [
                555
            ],
            "logicalOperator": [
                674
            ],
            "parentViewFilterGroupId": [
                555
            ],
            "positionInViewFilterGroup": [
                6
            ],
            "updatedAt": [
                222
            ],
            "viewId": [
                555
            ],
            "workspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilterOperand": {},
        "ViewGroup": {
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "fieldValue": [
                1
            ],
            "id": [
                555
            ],
            "isVisible": [
                4
            ],
            "position": [
                6
            ],
            "updatedAt": [
                222
            ],
            "viewId": [
                555
            ],
            "workspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewSort": {
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "direction": [
                680
            ],
            "fieldMetadataId": [
                555
            ],
            "id": [
                555
            ],
            "subFieldName": [
                1
            ],
            "updatedAt": [
                222
            ],
            "viewId": [
                555
            ],
            "workspaceId": [
                555
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
                555
            ],
            "createdAt": [
                222
            ],
            "deletedAt": [
                222
            ],
            "description": [
                1
            ],
            "id": [
                555
            ],
            "operations": [
                1
            ],
            "role": [
                473
            ],
            "secret": [
                1
            ],
            "targetUrl": [
                1
            ],
            "updatedAt": [
                222
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
                102
            ],
            "on_CalendarConfiguration": [
                143
            ],
            "on_CallRecordingSummaryConfiguration": [
                144
            ],
            "on_CallRecordingTranscriptConfiguration": [
                145
            ],
            "on_ChatConfiguration": [
                153
            ],
            "on_ChatThreadsConfiguration": [
                156
            ],
            "on_EmailThreadConfiguration": [
                251
            ],
            "on_EmailsConfiguration": [
                255
            ],
            "on_FieldConfiguration": [
                279
            ],
            "on_FieldRichTextConfiguration": [
                287
            ],
            "on_FieldsConfiguration": [
                288
            ],
            "on_FilesConfiguration": [
                294
            ],
            "on_FormFieldConfiguration": [
                297
            ],
            "on_FrontComponentConfiguration": [
                299
            ],
            "on_IframeConfiguration": [
                319
            ],
            "on_LineChartConfiguration": [
                342
            ],
            "on_MessageCampaignBodyConfiguration": [
                367
            ],
            "on_MessageCampaignDetailsConfiguration": [
                368
            ],
            "on_NotesConfiguration": [
                399
            ],
            "on_PieChartConfiguration": [
                434
            ],
            "on_RecordTableConfiguration": [
                463
            ],
            "on_StandaloneRichTextConfiguration": [
                520
            ],
            "on_TasksConfiguration": [
                530
            ],
            "on_TimelineConfiguration": [
                534
            ],
            "on_ViewConfiguration": [
                669
            ],
            "on_WorkflowConfiguration": [
                688
            ],
            "on_WorkflowRunConfiguration": [
                689
            ],
            "on_WorkflowVersionConfiguration": [
                690
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "WidgetType": {},
        "WorkflowActionType": {},
        "WorkflowConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                685
            ],
            "__typename": [
                1
            ]
        },
        "Workspace": {
            "activationStatus": [
                692
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "aiAgentModelTier": [
                35
            ],
            "aiChatAssistantProfile": [
                29
            ],
            "aiChatDirectMessageAssistantMode": [
                28
            ],
            "aiChatInboxAssistantMode": [
                28
            ],
            "aiChatModelTier": [
                35
            ],
            "aiDataPolicy": [
                33
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiModelIdByTier": [
                338
            ],
            "allowImpersonation": [
                4
            ],
            "allowedEmbeddingOrigins": [
                1
            ],
            "billingCustomer": [
                110
            ],
            "billingEntitlements": [
                112
            ],
            "billingSubscriptions": [
                129
            ],
            "createdAt": [
                222
            ],
            "currentBillingSubscription": [
                129
            ],
            "customDomain": [
                1
            ],
            "databaseSchema": [
                1
            ],
            "defaultRole": [
                473
            ],
            "deletedAt": [
                222
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
                276
            ],
            "hasValidEnterpriseValidityToken": [
                4
            ],
            "hasValidSignedEnterpriseKey": [
                4
            ],
            "id": [
                555
            ],
            "iframeMediaPermissions": [
                320
            ],
            "installedApplications": [
                53
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
            "isTrialAvailable": [
                4
            ],
            "isTwoFactorAuthenticationEnforced": [
                4
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                555
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
                222
            ],
            "viewFields": [
                670
            ],
            "viewFilterGroups": [
                673
            ],
            "viewFilters": [
                672
            ],
            "viewGroups": [
                676
            ],
            "viewSorts": [
                679
            ],
            "views": [
                667
            ],
            "workspaceCustomApplication": [
                53
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "workspaceDiscoverability": [
                697
            ],
            "workspaceMembersCount": [
                6
            ],
            "workspaceUrls": [
                709
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
                338
            ],
            "isBookCallOnboardingStepPending": [
                4
            ],
            "outcome": [
                694
            ],
            "personEnrichment": [
                338
            ],
            "personOutcome": [
                707
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
                222
            ],
            "id": [
                555
            ],
            "roleId": [
                555
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
                702
            ],
            "id": [
                555
            ],
            "locale": [
                1
            ],
            "name": [
                301
            ],
            "numberFormat": [
                703
            ],
            "openRecordIn": [
                419
            ],
            "roles": [
                473
            ],
            "timeFormat": [
                704
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
                555
            ],
            "userWorkspaceId": [
                555
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMemberApplicationVariables": {
            "userWorkspaceId": [
                555
            ],
            "variables": [
                656
            ],
            "workspaceMemberId": [
                555
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
                338
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
                555
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
                555
            ],
            "workspaceUrls": [
                709
            ],
            "__typename": [
                1
            ]
        }
    }
}