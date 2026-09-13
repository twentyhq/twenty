export default {
    "scalars": [
        1,
        3,
        4,
        6,
        8,
        9,
        15,
        16,
        17,
        22,
        24,
        25,
        26,
        28,
        29,
        36,
        37,
        38,
        39,
        42,
        44,
        52,
        54,
        56,
        58,
        61,
        64,
        65,
        66,
        67,
        68,
        70,
        71,
        72,
        74,
        75,
        82,
        85,
        87,
        91,
        92,
        95,
        96,
        98,
        101,
        102,
        112,
        127,
        133,
        134,
        135,
        137,
        146,
        148,
        155,
        157,
        160,
        162,
        177,
        178,
        181,
        191,
        195,
        202,
        203,
        210,
        214,
        217,
        228,
        247,
        248,
        250,
        255,
        258,
        267,
        298,
        305,
        313,
        314,
        315,
        317,
        318,
        319,
        320,
        321,
        322,
        323,
        331,
        332,
        335,
        372,
        379,
        381,
        382,
        383,
        384,
        386,
        388,
        393,
        409,
        421,
        539,
        565
    ],
    "types": {
        "BillingProductDTO": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                132
            ],
            "on_BillingLicensedProduct": [
                141
            ],
            "on_BillingMeteredProduct": [
                142
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "ApiKey": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "expiresAt": [
                4
            ],
            "revokedAt": [
                4
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "role": [
                48
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "DateTime": {},
        "ApplicationRegistrationSummary": {
            "id": [
                3
            ],
            "latestAvailableVersion": [
                1
            ],
            "sourceType": [
                6
            ],
            "logoUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
        "ApplicationVariable": {
            "id": [
                3
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "description": [
                1
            ],
            "label": [
                1
            ],
            "isSecret": [
                8
            ],
            "isDeprecated": [
                8
            ],
            "type": [
                1
            ],
            "options": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "JSON": {},
        "Agent": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "prompt": [
                1
            ],
            "modelId": [
                1
            ],
            "responseFormat": [
                9
            ],
            "roleId": [
                3
            ],
            "isCustom": [
                8
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "modelConfiguration": [
                9
            ],
            "evaluationInputs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AuthToken": {
            "token": [
                1
            ],
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationTokenPair": {
            "applicationAccessToken": [
                11
            ],
            "applicationRefreshToken": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponent": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "sourceComponentPath": [
                1
            ],
            "builtComponentPath": [
                1
            ],
            "componentName": [
                1
            ],
            "builtComponentChecksum": [
                1
            ],
            "universalIdentifier": [
                3
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isHeadless": [
                8
            ],
            "usesSdkClient": [
                8
            ],
            "applicationTokenPair": [
                12
            ],
            "applicationVariables": [
                9
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItem": {
            "id": [
                3
            ],
            "workflowVersionId": [
                3
            ],
            "frontComponentId": [
                3
            ],
            "frontComponent": [
                13
            ],
            "engineComponentKey": [
                16
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "shortLabel": [
                1
            ],
            "position": [
                15
            ],
            "isPinned": [
                8
            ],
            "availabilityType": [
                17
            ],
            "payload": [
                18
            ],
            "hotKeys": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "navigationTargetObjectMetadataId": [
                3
            ],
            "pageLayoutId": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "applicationId": [
                3
            ],
            "isActive": [
                8
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Float": {},
        "EngineComponentKey": {},
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_PathCommandMenuItemPayload": [
                19
            ],
            "on_ObjectMetadataCommandMenuItemPayload": [
                20
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
        "ObjectMetadataCommandMenuItemPayload": {
            "objectMetadataItemId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "runtime": [
                1
            ],
            "timeoutSeconds": [
                15
            ],
            "executionMode": [
                22
            ],
            "sourceHandlerPath": [
                1
            ],
            "handlerName": [
                1
            ],
            "cronTriggerSettings": [
                9
            ],
            "databaseEventTriggerSettings": [
                9
            ],
            "httpRouteTriggerSettings": [
                9
            ],
            "toolTriggerSettings": [
                9
            ],
            "workflowActionTriggerSettings": [
                9
            ],
            "applicationId": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "Object": {
            "id": [
                3
            ],
            "universalIdentifier": [
                1
            ],
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "shortcut": [
                1
            ],
            "color": [
                1
            ],
            "isRemote": [
                8
            ],
            "isActive": [
                8
            ],
            "isSystem": [
                8
            ],
            "isUIEditable": [
                8
            ],
            "isUICreatable": [
                8
            ],
            "isUIReadOnly": [
                8
            ],
            "isSearchable": [
                8
            ],
            "openRecordIn": [
                24
            ],
            "readability": [
                25
            ],
            "writability": [
                26
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "labelIdentifierFieldMetadataId": [
                3
            ],
            "imageIdentifierFieldMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                8
            ],
            "duplicateCriteria": [
                1
            ],
            "fields": [
                262,
                {
                    "paging": [
                        27,
                        "CursorPaging!"
                    ],
                    "filter": [
                        30,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                263,
                {
                    "paging": [
                        27,
                        "CursorPaging!"
                    ],
                    "filter": [
                        33,
                        "IndexFilter!"
                    ]
                }
            ],
            "fieldsList": [
                249
            ],
            "indexMetadataList": [
                257
            ],
            "searchFieldMetadataList": [
                265
            ],
            "__typename": [
                1
            ]
        },
        "ObjectOpenRecordIn": {},
        "MetadataReadability": {},
        "MetadataWritability": {},
        "CursorPaging": {
            "before": [
                29
            ],
            "after": [
                29
            ],
            "first": [
                28
            ],
            "last": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                30
            ],
            "or": [
                30
            ],
            "id": [
                31
            ],
            "isActive": [
                32
            ],
            "isSystem": [
                32
            ],
            "isUIEditable": [
                32
            ],
            "isUIReadOnly": [
                32
            ],
            "objectMetadataId": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "UUIDFilterComparison": {
            "is": [
                8
            ],
            "isNot": [
                8
            ],
            "eq": [
                3
            ],
            "neq": [
                3
            ],
            "gt": [
                3
            ],
            "gte": [
                3
            ],
            "lt": [
                3
            ],
            "lte": [
                3
            ],
            "like": [
                3
            ],
            "notLike": [
                3
            ],
            "iLike": [
                3
            ],
            "notILike": [
                3
            ],
            "in": [
                3
            ],
            "notIn": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "BooleanFieldComparison": {
            "is": [
                8
            ],
            "isNot": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                33
            ],
            "or": [
                33
            ],
            "id": [
                31
            ],
            "isCustom": [
                32
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
        "WorkspaceMember": {
            "id": [
                3
            ],
            "name": [
                34
            ],
            "userEmail": [
                1
            ],
            "colorScheme": [
                1
            ],
            "uiScale": [
                1
            ],
            "openRecordIn": [
                36
            ],
            "avatarUrl": [
                1
            ],
            "locale": [
                1
            ],
            "calendarStartDay": [
                28
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                37
            ],
            "timeFormat": [
                38
            ],
            "roles": [
                48
            ],
            "userWorkspaceId": [
                3
            ],
            "numberFormat": [
                39
            ],
            "__typename": [
                1
            ]
        },
        "OpenRecordIn": {},
        "WorkspaceMemberDateFormatEnum": {},
        "WorkspaceMemberTimeFormatEnum": {},
        "WorkspaceMemberNumberFormatEnum": {},
        "FieldPermission": {
            "id": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "roleId": [
                3
            ],
            "canReadFieldValue": [
                8
            ],
            "canUpdateFieldValue": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroup": {
            "id": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "logicalOperator": [
                42
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                15
            ],
            "roleId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupLogicalOperator": {},
        "RowLevelPermissionPredicate": {
            "id": [
                1
            ],
            "fieldMetadataId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "operand": [
                44
            ],
            "subFieldName": [
                1
            ],
            "workspaceMemberFieldMetadataId": [
                1
            ],
            "workspaceMemberSubFieldName": [
                1
            ],
            "rowLevelPermissionPredicateGroupId": [
                1
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                15
            ],
            "roleId": [
                1
            ],
            "value": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateOperand": {},
        "ObjectPermission": {
            "objectMetadataId": [
                3
            ],
            "canReadObjectRecords": [
                8
            ],
            "canUpdateObjectRecords": [
                8
            ],
            "canSoftDeleteObjectRecords": [
                8
            ],
            "canDestroyObjectRecords": [
                8
            ],
            "restrictedFields": [
                9
            ],
            "rowLevelPermissionPredicates": [
                43
            ],
            "rowLevelPermissionPredicateGroups": [
                41
            ],
            "__typename": [
                1
            ]
        },
        "RolePermissionFlag": {
            "id": [
                3
            ],
            "roleId": [
                3
            ],
            "flag": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApiKeyForRole": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "expiresAt": [
                4
            ],
            "revokedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Role": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isEditable": [
                8
            ],
            "canBeAssignedToUsers": [
                8
            ],
            "canBeAssignedToAgents": [
                8
            ],
            "canBeAssignedToApiKeys": [
                8
            ],
            "workspaceMembers": [
                35
            ],
            "agents": [
                10
            ],
            "apiKeys": [
                47
            ],
            "canUpdateAllSettings": [
                8
            ],
            "canAccessAllTools": [
                8
            ],
            "canReadAllObjectRecords": [
                8
            ],
            "canUpdateAllObjectRecords": [
                8
            ],
            "canSoftDeleteAllObjectRecords": [
                8
            ],
            "canDestroyAllObjectRecords": [
                8
            ],
            "permissionFlags": [
                46
            ],
            "objectPermissions": [
                45
            ],
            "fieldPermissions": [
                40
            ],
            "rowLevelPermissionPredicates": [
                43
            ],
            "rowLevelPermissionPredicateGroups": [
                41
            ],
            "__typename": [
                1
            ]
        },
        "Application": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "logoFileId": [
                3
            ],
            "version": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "packageJsonChecksum": [
                1
            ],
            "packageJsonFileId": [
                3
            ],
            "yarnLockChecksum": [
                1
            ],
            "yarnLockFileId": [
                3
            ],
            "availablePackages": [
                9
            ],
            "applicationRegistrationId": [
                3
            ],
            "canBeUninstalled": [
                8
            ],
            "autoUpgrade": [
                8
            ],
            "defaultRoleId": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                3
            ],
            "defaultLogicFunctionRole": [
                48
            ],
            "agents": [
                10
            ],
            "frontComponents": [
                13
            ],
            "commandMenuItems": [
                14
            ],
            "logicFunctions": [
                21
            ],
            "objects": [
                23
            ],
            "applicationVariables": [
                7
            ],
            "applicationRegistration": [
                5
            ],
            "logoUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TwoFactorAuthenticationMethodSummary": {
            "twoFactorAuthenticationMethodId": [
                3
            ],
            "status": [
                1
            ],
            "strategy": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UserWorkspace": {
            "id": [
                3
            ],
            "user": [
                73
            ],
            "userId": [
                3
            ],
            "locale": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "permissionFlags": [
                52
            ],
            "objectPermissions": [
                45
            ],
            "objectsPermissions": [
                45
            ],
            "twoFactorAuthenticationMethodSummary": [
                50
            ],
            "isImpersonating": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "ViewField": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "applicationId": [
                3
            ],
            "isSystemSideEffect": [
                8
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                8
            ],
            "size": [
                15
            ],
            "position": [
                15
            ],
            "aggregateOperation": [
                54
            ],
            "viewId": [
                3
            ],
            "viewFieldGroupId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                8
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "AggregateOperations": {},
        "ViewFilterGroup": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                56
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilter": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                58
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterOperand": {},
        "ViewGroup": {
            "id": [
                3
            ],
            "isVisible": [
                8
            ],
            "fieldValue": [
                1
            ],
            "position": [
                15
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewSort": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                61
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ViewSortDirection": {},
        "ViewFieldGroup": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "position": [
                15
            ],
            "isVisible": [
                8
            ],
            "viewId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                8
            ],
            "deletedAt": [
                4
            ],
            "viewFields": [
                53
            ],
            "isOverridden": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "View": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "applicationId": [
                3
            ],
            "isSystemSideEffect": [
                8
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                3
            ],
            "type": [
                64
            ],
            "key": [
                65
            ],
            "icon": [
                1
            ],
            "position": [
                15
            ],
            "isCompact": [
                8
            ],
            "isCustom": [
                8
            ],
            "openRecordIn": [
                66
            ],
            "kanbanAggregateOperation": [
                54
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "kanbanColumnWidth": [
                28
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "calendarEndFieldMetadataId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                67
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "viewFields": [
                53
            ],
            "viewFilters": [
                57
            ],
            "viewFilterGroups": [
                55
            ],
            "viewSorts": [
                60
            ],
            "viewGroups": [
                59
            ],
            "viewFieldGroups": [
                62
            ],
            "visibility": [
                68
            ],
            "createdByUserWorkspaceId": [
                3
            ],
            "isActive": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ViewType": {},
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewCalendarLayout": {},
        "ViewVisibility": {},
        "Workspace": {
            "id": [
                3
            ],
            "displayName": [
                1
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                3
            ],
            "inviteHash": [
                1
            ],
            "deletedAt": [
                4
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "allowImpersonation": [
                8
            ],
            "isPublicInviteLinkEnabled": [
                8
            ],
            "workspaceDiscoverability": [
                70
            ],
            "trashRetentionDays": [
                15
            ],
            "eventLogRetentionDays": [
                15
            ],
            "workspaceMembersCount": [
                15
            ],
            "activationStatus": [
                71
            ],
            "views": [
                63
            ],
            "viewFields": [
                53
            ],
            "viewFilters": [
                57
            ],
            "viewFilterGroups": [
                55
            ],
            "viewGroups": [
                59
            ],
            "viewSorts": [
                60
            ],
            "metadataVersion": [
                15
            ],
            "databaseSchema": [
                1
            ],
            "subdomain": [
                1
            ],
            "customDomain": [
                1
            ],
            "isGoogleAuthEnabled": [
                8
            ],
            "isGoogleAuthBypassEnabled": [
                8
            ],
            "isTwoFactorAuthenticationEnforced": [
                8
            ],
            "isPasswordAuthEnabled": [
                8
            ],
            "isPasswordAuthBypassEnabled": [
                8
            ],
            "isMicrosoftAuthEnabled": [
                8
            ],
            "isMicrosoftAuthBypassEnabled": [
                8
            ],
            "isCustomDomainEnabled": [
                8
            ],
            "isInternalMessagesImportEnabled": [
                8
            ],
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                48
            ],
            "aiChatModelTier": [
                72
            ],
            "aiAgentModelTier": [
                72
            ],
            "isAutoModelSelectionEnabled": [
                8
            ],
            "aiModelIdByTier": [
                9
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "workspaceCustomApplication": [
                49
            ],
            "featureFlags": [
                194
            ],
            "billingSubscriptions": [
                145
            ],
            "installedApplications": [
                49
            ],
            "currentBillingSubscription": [
                145
            ],
            "billingCustomer": [
                144
            ],
            "billingEntitlements": [
                266
            ],
            "hasValidSignedEnterpriseKey": [
                8
            ],
            "hasValidEnterpriseValidityToken": [
                8
            ],
            "workspaceUrls": [
                196
            ],
            "workspaceCustomApplicationId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceDiscoverability": {},
        "WorkspaceActivationStatus": {},
        "AiModelTier": {},
        "User": {
            "id": [
                3
            ],
            "firstName": [
                1
            ],
            "lastName": [
                1
            ],
            "email": [
                1
            ],
            "isEmailVerified": [
                8
            ],
            "disabled": [
                8
            ],
            "canImpersonate": [
                8
            ],
            "canAccessFullAdminPanel": [
                8
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "locale": [
                1
            ],
            "workspaceMember": [
                35
            ],
            "userWorkspaces": [
                51
            ],
            "onboardingStatus": [
                74
            ],
            "previousOnboardingStatus": [
                74
            ],
            "currentWorkspace": [
                69
            ],
            "currentUserWorkspace": [
                51
            ],
            "userVars": [
                75
            ],
            "workspaceMembers": [
                35
            ],
            "deletedWorkspaceMembers": [
                238
            ],
            "hasPassword": [
                8
            ],
            "supportUserHash": [
                1
            ],
            "isWorkspaceCreator": [
                8
            ],
            "workspaces": [
                51
            ],
            "availableWorkspaces": [
                237
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "JSONObject": {},
        "ApplicationRegistration": {
            "id": [
                3
            ],
            "universalIdentifier": [
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
                3
            ],
            "sourceType": [
                6
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                8
            ],
            "isVetted": [
                8
            ],
            "isPreInstalled": [
                8
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isConfigured": [
                8
            ],
            "logoUrl": [
                1
            ],
            "galleryImagesUrls": [
                1
            ],
            "__typename": [
                1
            ]
        },
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
        "RatioAggregateConfig": {
            "fieldMetadataId": [
                3
            ],
            "optionValue": [
                1
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
        "GridPosition": {
            "row": [
                15
            ],
            "column": [
                15
            ],
            "rowSpan": [
                15
            ],
            "columnSpan": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidget": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "isSystemSideEffect": [
                8
            ],
            "applicationId": [
                3
            ],
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                82
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                80
            ],
            "position": [
                83
            ],
            "configuration": [
                89
            ],
            "conditionalDisplay": [
                9
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                8
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "WidgetType": {},
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetGridPosition": [
                84
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                86
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                85
            ],
            "row": [
                28
            ],
            "column": [
                28
            ],
            "rowSpan": [
                28
            ],
            "columnSpan": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                85
            ],
            "index": [
                28
            ],
            "heightBehavior": [
                87
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                85
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                90
            ],
            "on_StandaloneRichTextConfiguration": [
                93
            ],
            "on_PieChartConfiguration": [
                94
            ],
            "on_LineChartConfiguration": [
                97
            ],
            "on_IframeConfiguration": [
                99
            ],
            "on_BarChartConfiguration": [
                100
            ],
            "on_CalendarConfiguration": [
                103
            ],
            "on_FrontComponentConfiguration": [
                104
            ],
            "on_EmailsConfiguration": [
                105
            ],
            "on_EmailThreadConfiguration": [
                106
            ],
            "on_CallRecordingSummaryConfiguration": [
                107
            ],
            "on_CallRecordingTranscriptConfiguration": [
                108
            ],
            "on_MessageCampaignBodyConfiguration": [
                109
            ],
            "on_MessageCampaignDetailsConfiguration": [
                110
            ],
            "on_FieldConfiguration": [
                111
            ],
            "on_FieldRichTextConfiguration": [
                113
            ],
            "on_FieldsConfiguration": [
                114
            ],
            "on_FormFieldConfiguration": [
                115
            ],
            "on_FilesConfiguration": [
                116
            ],
            "on_NotesConfiguration": [
                117
            ],
            "on_TasksConfiguration": [
                118
            ],
            "on_TimelineConfiguration": [
                119
            ],
            "on_ViewConfiguration": [
                120
            ],
            "on_RecordTableConfiguration": [
                121
            ],
            "on_WorkflowConfiguration": [
                122
            ],
            "on_WorkflowRunConfiguration": [
                123
            ],
            "on_WorkflowVersionConfiguration": [
                124
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                91
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                54
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                8
            ],
            "numberFormat": [
                92
            ],
            "description": [
                1
            ],
            "filter": [
                9
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                28
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                78
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "ChartNumberFormat": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                91
            ],
            "body": [
                79
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                91
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                54
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                95
            ],
            "orderBy": [
                96
            ],
            "manualSortOrder": [
                1
            ],
            "displayDataLabel": [
                8
            ],
            "showCenterMetric": [
                8
            ],
            "displayLegend": [
                8
            ],
            "hideEmptyCategory": [
                8
            ],
            "numberFormat": [
                92
            ],
            "splitMultiValueFields": [
                8
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                9
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                91
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                54
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                95
            ],
            "primaryAxisOrderBy": [
                96
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                3
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisGroupByDateGranularity": [
                95
            ],
            "secondaryAxisOrderBy": [
                96
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                8
            ],
            "splitMultiValueFields": [
                8
            ],
            "axisNameDisplay": [
                98
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                92
            ],
            "rangeMin": [
                15
            ],
            "rangeMax": [
                15
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                9
            ],
            "isStacked": [
                8
            ],
            "isCumulative": [
                8
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                91
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BarChartConfiguration": {
            "configurationType": [
                91
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                54
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                95
            ],
            "primaryAxisOrderBy": [
                96
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                3
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisGroupByDateGranularity": [
                95
            ],
            "secondaryAxisOrderBy": [
                96
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                8
            ],
            "splitMultiValueFields": [
                8
            ],
            "axisNameDisplay": [
                98
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                92
            ],
            "rangeMin": [
                15
            ],
            "rangeMax": [
                15
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                9
            ],
            "groupMode": [
                101
            ],
            "layout": [
                102
            ],
            "isCumulative": [
                8
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                91
            ],
            "frontComponentId": [
                3
            ],
            "headerCommandMenuItemUniversalIdentifiers": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EmailsConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                91
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                112
            ],
            "viewId": [
                1
            ],
            "nestedRelationFieldMetadataId": [
                1
            ],
            "isUIEditable": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldRichTextConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                91
            ],
            "viewId": [
                1
            ],
            "newFieldDefaultVisibility": [
                8
            ],
            "shouldAllowUserToSeeHiddenFields": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "FormFieldConfiguration": {
            "configurationType": [
                91
            ],
            "fieldMetadataId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                91
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                28
            ],
            "isUIEditable": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                91
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "isSystemSideEffect": [
                8
            ],
            "applicationId": [
                3
            ],
            "title": [
                1
            ],
            "position": [
                15
            ],
            "pageLayoutId": [
                3
            ],
            "widgets": [
                81
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                85
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                8
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                125
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "applicationId": [
                3
            ],
            "isSystemSideEffect": [
                8
            ],
            "isFirstTabPinned": [
                8
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutType": {},
        "ApplicationConnectionProviderOAuthConfig": {
            "scopes": [
                1
            ],
            "isClientCredentialsConfigured": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectionProvider": {
            "id": [
                3
            ],
            "applicationId": [
                1
            ],
            "type": [
                1
            ],
            "name": [
                1
            ],
            "displayName": [
                1
            ],
            "oauth": [
                128
            ],
            "logoUrl": [
                1
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
                15
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "start_date": [
                15
            ],
            "end_date": [
                15
            ],
            "items": [
                130
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                133
            ],
            "priceUsageBased": [
                134
            ],
            "productKey": [
                135
            ],
            "isLegacy": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingUsageType": {},
        "BillingProductKey": {},
        "BillingPriceLicensed": {
            "recurringInterval": [
                137
            ],
            "unitAmount": [
                15
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                134
            ],
            "creditAmount": [
                15
            ],
            "isSellable": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionInterval": {},
        "BillingPriceTier": {
            "upTo": [
                15
            ],
            "flatAmount": [
                15
            ],
            "unitAmount": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "tiers": [
                138
            ],
            "recurringInterval": [
                137
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                134
            ],
            "__typename": [
                1
            ]
        },
        "BillingProduct": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                132
            ],
            "__typename": [
                1
            ]
        },
        "BillingLicensedProduct": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                132
            ],
            "prices": [
                136
            ],
            "__typename": [
                1
            ]
        },
        "BillingMeteredProduct": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "images": [
                1
            ],
            "metadata": [
                132
            ],
            "prices": [
                139
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "id": [
                3
            ],
            "hasReachedCurrentPeriodCap": [
                8
            ],
            "quantity": [
                15
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                15
            ],
            "creditAmount": [
                15
            ],
            "billingProduct": [
                0
            ],
            "__typename": [
                1
            ]
        },
        "BillingCustomer": {
            "id": [
                3
            ],
            "hasPaymentMethod": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscription": {
            "id": [
                3
            ],
            "status": [
                146
            ],
            "interval": [
                137
            ],
            "billingSubscriptionItems": [
                143
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                9
            ],
            "phases": [
                131
            ],
            "cancelAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "LogicFunctionExecutionResult": {
            "data": [
                9
            ],
            "logs": [
                1
            ],
            "duration": [
                15
            ],
            "status": [
                148
            ],
            "error": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "EnterpriseLicenseInfoDTO": {
            "isValid": [
                8
            ],
            "licensee": [
                1
            ],
            "expiresAt": [
                4
            ],
            "subscriptionId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseSubscriptionStatusDTO": {
            "status": [
                1
            ],
            "licensee": [
                1
            ],
            "expiresAt": [
                4
            ],
            "cancelAt": [
                4
            ],
            "currentPeriodEnd": [
                4
            ],
            "isCancellationScheduled": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "FileWithSignedUrl": {
            "id": [
                3
            ],
            "path": [
                1
            ],
            "size": [
                15
            ],
            "createdAt": [
                4
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FileUploadTarget": {
            "fileId": [
                3
            ],
            "uploadUrl": [
                1
            ],
            "contentType": [
                1
            ],
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "RecordIdentifier": {
            "id": [
                3
            ],
            "labelIdentifier": [
                1
            ],
            "imageIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItem": {
            "id": [
                3
            ],
            "userWorkspaceId": [
                3
            ],
            "targetRecordId": [
                3
            ],
            "targetObjectMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "type": [
                155
            ],
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "folderId": [
                3
            ],
            "pageLayoutId": [
                3
            ],
            "position": [
                15
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "targetRecordIdentifier": [
                153
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "JobStatus": {
            "jobId": [
                1
            ],
            "state": [
                157
            ],
            "attemptsMade": [
                28
            ],
            "failedReason": [
                1
            ],
            "enqueuedAt": [
                15
            ],
            "startedAt": [
                15
            ],
            "finishedAt": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "JobState": {},
        "ObjectRecordEventProperties": {
            "updatedFields": [
                1
            ],
            "before": [
                9
            ],
            "after": [
                9
            ],
            "diff": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEvent": {
            "type": [
                160
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                158
            ],
            "updatedCollectionHash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventAction": {},
        "ObjectRecordEvent": {
            "action": [
                162
            ],
            "objectNameSingular": [
                1
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
            "properties": [
                158
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventAction": {},
        "ObjectRecordEventWithQueryIds": {
            "queryIds": [
                1
            ],
            "objectRecordEvent": [
                161
            ],
            "__typename": [
                1
            ]
        },
        "EventSubscription": {
            "eventStreamId": [
                1
            ],
            "objectRecordEventsWithQueryIds": [
                163
            ],
            "metadataEvents": [
                159
            ],
            "queueJobEvents": [
                156
            ],
            "__typename": [
                1
            ]
        },
        "UserSession": {
            "id": [
                3
            ],
            "workspaceId": [
                3
            ],
            "authProvider": [
                1
            ],
            "isImpersonating": [
                8
            ],
            "userAgent": [
                1
            ],
            "ipAddress": [
                1
            ],
            "createdAt": [
                4
            ],
            "lastActiveAt": [
                4
            ],
            "expiresAt": [
                4
            ],
            "isCurrent": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "BillingEndTrialPeriod": {
            "status": [
                146
            ],
            "hasPaymentMethod": [
                8
            ],
            "billingPortalUrl": [
                1
            ],
            "currentBillingSubscription": [
                145
            ],
            "billingSubscriptions": [
                145
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                135
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "usedCredits": [
                15
            ],
            "grantedCredits": [
                15
            ],
            "rolloverCredits": [
                15
            ],
            "totalGrantedCredits": [
                15
            ],
            "unitPriceCents": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlan": {
            "planKey": [
                133
            ],
            "baseProducts": [
                141
            ],
            "resourceCreditProducts": [
                141
            ],
            "meteredProducts": [
                142
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
        "BillingSession": {
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingUpdate": {
            "currentBillingSubscription": [
                145
            ],
            "billingSubscriptions": [
                145
            ],
            "__typename": [
                1
            ]
        },
        "UsageBreakdownItem": {
            "key": [
                1
            ],
            "label": [
                1
            ],
            "creditsUsed": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "UsageTimeSeries": {
            "date": [
                1
            ],
            "creditsUsed": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "UsageUserDaily": {
            "userWorkspaceId": [
                1
            ],
            "dailyUsage": [
                173
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                172
            ],
            "usageByOperationType": [
                172
            ],
            "usageByApplication": [
                172
            ],
            "usageByModel": [
                172
            ],
            "timeSeries": [
                173
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userDailyUsage": [
                174
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinition": {
            "resourceType": [
                177
            ],
            "allowedOperationTypes": [
                178
            ],
            "allowedSpenderTypes": [
                1
            ],
            "allowedMeters": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageOperationType": {},
        "UsageQuotaDefinitions": {
            "definitions": [
                176
            ],
            "isIntraWorkspaceLimitEntitled": [
                8
            ],
            "hasAllowancePeriod": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaWithConsumption": {
            "id": [
                3
            ],
            "resourceType": [
                177
            ],
            "operationType": [
                178
            ],
            "spenderType": [
                1
            ],
            "spenderId": [
                1
            ],
            "spenderLabel": [
                1
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "limitValue": [
                181
            ],
            "isEnforced": [
                8
            ],
            "consumedValue": [
                181
            ],
            "remainingValue": [
                181
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "BigInt": {},
        "UsageQuotaScopeConsumption": {
            "consumedValue": [
                181
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimit": {
            "id": [
                3
            ],
            "resourceType": [
                177
            ],
            "operationType": [
                178
            ],
            "spenderType": [
                1
            ],
            "spenderId": [
                1
            ],
            "limitKind": [
                1
            ],
            "periodCount": [
                28
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "limitValue": [
                181
            ],
            "burstValue": [
                181
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ApprovedAccessDomain": {
            "id": [
                3
            ],
            "domain": [
                1
            ],
            "isValidated": [
                8
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "InviteSuggestion": {
            "email": [
                1
            ],
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStepNavigation": {
            "onboardingStatus": [
                74
            ],
            "previousOnboardingStatus": [
                74
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInvitation": {
            "id": [
                3
            ],
            "email": [
                1
            ],
            "roleId": [
                3
            ],
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SendInvitations": {
            "success": [
                8
            ],
            "errors": [
                1
            ],
            "result": [
                188
            ],
            "__typename": [
                1
            ]
        },
        "PublicConnectionParametersOutput": {
            "host": [
                1
            ],
            "port": [
                15
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                191
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                190
            ],
            "SMTP": [
                190
            ],
            "CALDAV": [
                190
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "id": [
                3
            ],
            "handle": [
                1
            ],
            "provider": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                4
            ],
            "authFailedAt": [
                4
            ],
            "authFailedReason": [
                1
            ],
            "archivedAt": [
                4
            ],
            "handleAliases": [
                1
            ],
            "scopes": [
                1
            ],
            "lastSignedInAt": [
                4
            ],
            "userWorkspaceId": [
                3
            ],
            "connectionProviderId": [
                3
            ],
            "applicationId": [
                3
            ],
            "name": [
                1
            ],
            "visibility": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "connectionParameters": [
                192
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                195
            ],
            "value": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
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
        "ApplicationRegistrationVariable": {
            "id": [
                3
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                8
            ],
            "isRequired": [
                8
            ],
            "isDeprecated": [
                8
            ],
            "isFilled": [
                8
            ],
            "type": [
                1
            ],
            "options": [
                9
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "VersionDistributionEntry": {
            "version": [
                1
            ],
            "count": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                28
            ],
            "suspendedInstalls": [
                28
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                198
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                15
            ],
            "isCreditCardRequired": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                202
            ],
            "status": [
                203
            ],
            "issuer": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "SSOIdentityProviderStatus": {},
        "AuthProviders": {
            "sso": [
                201
            ],
            "google": [
                8
            ],
            "magicLink": [
                8
            ],
            "password": [
                8
            ],
            "microsoft": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "AuthBypassProviders": {
            "google": [
                8
            ],
            "password": [
                8
            ],
            "microsoft": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "id": [
                3
            ],
            "authProviders": [
                204
            ],
            "authBypassProviders": [
                205
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                196
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceDataSummary": {
            "id": [
                3
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "NativeModelCapabilities": {
            "webSearch": [
                8
            ],
            "twitterSearch": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ClientAiModelConfig": {
            "modelId": [
                1
            ],
            "label": [
                1
            ],
            "modelFamily": [
                210
            ],
            "modelFamilyLabel": [
                1
            ],
            "sdkPackage": [
                1
            ],
            "inputCostPerMillionTokens": [
                15
            ],
            "outputCostPerMillionTokens": [
                15
            ],
            "nativeCapabilities": [
                208
            ],
            "isDeprecated": [
                8
            ],
            "providerName": [
                1
            ],
            "providerLabel": [
                1
            ],
            "contextWindowTokens": [
                15
            ],
            "maxOutputTokens": [
                15
            ],
            "dataResidency": [
                1
            ],
            "intelligenceIndex": [
                15
            ],
            "outputTokensPerSecond": [
                15
            ],
            "costPerTask": [
                15
            ],
            "efforts": [
                1
            ],
            "effort": [
                1
            ],
            "isBenchmarkInherited": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "ClientAiModelTierConfig": {
            "tier": [
                72
            ],
            "modelId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Billing": {
            "isBillingEnabled": [
                8
            ],
            "billingUrl": [
                1
            ],
            "stripePublishableKey": [
                1
            ],
            "trialPeriods": [
                200
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                214
            ],
            "supportFrontChatId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SupportDriver": {},
        "Sentry": {
            "environment": [
                1
            ],
            "release": [
                1
            ],
            "dsn": [
                1
            ],
            "tracesSampleRate": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                217
            ],
            "siteKey": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CaptchaDriverType": {},
        "ApiConfig": {
            "mutationMaximumAffectedRecords": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlagMetadata": {
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "imagePath": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlag": {
            "key": [
                195
            ],
            "metadata": [
                219
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "startAt": [
                4
            ],
            "endAt": [
                4
            ],
            "link": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfig": {
            "appVersion": [
                1
            ],
            "authProviders": [
                204
            ],
            "billing": [
                212
            ],
            "aiModels": [
                209
            ],
            "aiModelTiers": [
                211
            ],
            "signInPrefilled": [
                8
            ],
            "isMultiWorkspaceEnabled": [
                8
            ],
            "isEmailVerificationRequired": [
                8
            ],
            "defaultSubdomain": [
                1
            ],
            "frontDomain": [
                1
            ],
            "publicFunctionDomain": [
                1
            ],
            "analyticsEnabled": [
                8
            ],
            "support": [
                213
            ],
            "isAttachmentPreviewEnabled": [
                8
            ],
            "sentry": [
                215
            ],
            "captcha": [
                216
            ],
            "api": [
                218
            ],
            "canManageFeatureFlags": [
                8
            ],
            "publicFeatureFlags": [
                220
            ],
            "isCookieSessionEnabled": [
                8
            ],
            "isMicrosoftMessagingEnabled": [
                8
            ],
            "isMicrosoftCalendarEnabled": [
                8
            ],
            "isGoogleMessagingEnabled": [
                8
            ],
            "isGoogleCalendarEnabled": [
                8
            ],
            "isConfigVariablesInDbEnabled": [
                8
            ],
            "isImapSmtpCaldavEnabled": [
                8
            ],
            "isEmailingDomainInDemoMode": [
                8
            ],
            "allowRequestsToTwentyIcons": [
                8
            ],
            "calendarBookingPageId": [
                1
            ],
            "isBookCallOnboardingStepEnabled": [
                8
            ],
            "isCompanyEnrichmentEnabled": [
                8
            ],
            "isCloudflareIntegrationEnabled": [
                8
            ],
            "isClickHouseConfigured": [
                8
            ],
            "isWorkspaceSchemaDDLLocked": [
                8
            ],
            "isOnboardingAiChatEnabled": [
                8
            ],
            "enterpriseInstanceType": [
                1
            ],
            "maintenance": [
                221
            ],
            "__typename": [
                1
            ]
        },
        "ClaimableApplicationRegistration": {
            "id": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "name": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "logoUrl": [
                1
            ],
            "description": [
                1
            ],
            "author": [
                1
            ],
            "isOwned": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                76
            ],
            "clientSecret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicApplicationRegistration": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "logoUrl": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "oAuthScopes": [
                1
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
        "AppConnection": {
            "id": [
                228
            ],
            "providerName": [
                1
            ],
            "name": [
                1
            ],
            "handle": [
                1
            ],
            "visibility": [
                1
            ],
            "userWorkspaceId": [
                1
            ],
            "workspaceMemberId": [
                1
            ],
            "accessToken": [
                1
            ],
            "scopes": [
                1
            ],
            "authFailedAt": [
                1
            ],
            "authFailedReason": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "ResendEmailVerificationToken": {
            "success": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EditSso": {
            "id": [
                3
            ],
            "type": [
                202
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                203
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "type": [
                202
            ],
            "id": [
                3
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                203
            ],
            "workspace": [
                232
            ],
            "__typename": [
                1
            ]
        },
        "SetupSso": {
            "id": [
                3
            ],
            "type": [
                202
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                203
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                202
            ],
            "id": [
                3
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                203
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspace": {
            "id": [
                3
            ],
            "displayName": [
                1
            ],
            "loginToken": [
                1
            ],
            "personalInviteToken": [
                1
            ],
            "inviteHash": [
                1
            ],
            "workspaceUrls": [
                196
            ],
            "logo": [
                1
            ],
            "sso": [
                235
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                236
            ],
            "availableWorkspacesForSignUp": [
                236
            ],
            "__typename": [
                1
            ]
        },
        "DeletedWorkspaceMember": {
            "id": [
                3
            ],
            "name": [
                34
            ],
            "userEmail": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "userWorkspaceId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceApp": {
            "id": [
                1
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "author": [
                1
            ],
            "category": [
                1
            ],
            "logoUrl": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "isVetted": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRoleObjectPermission": {
            "universalIdentifier": [
                1
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "canReadObjectRecords": [
                8
            ],
            "canUpdateObjectRecords": [
                8
            ],
            "canSoftDeleteObjectRecords": [
                8
            ],
            "canDestroyObjectRecords": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRoleFieldPermission": {
            "universalIdentifier": [
                1
            ],
            "objectUniversalIdentifier": [
                1
            ],
            "fieldUniversalIdentifier": [
                1
            ],
            "canReadFieldValue": [
                8
            ],
            "canUpdateFieldValue": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRole": {
            "universalIdentifier": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "canUpdateAllSettings": [
                8
            ],
            "canAccessAllTools": [
                8
            ],
            "canReadAllObjectRecords": [
                8
            ],
            "canUpdateAllObjectRecords": [
                8
            ],
            "canSoftDeleteAllObjectRecords": [
                8
            ],
            "canDestroyAllObjectRecords": [
                8
            ],
            "permissionFlagUniversalIdentifiers": [
                1
            ],
            "objectPermissions": [
                240
            ],
            "fieldPermissions": [
                241
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppDetail": {
            "universalIdentifier": [
                1
            ],
            "id": [
                1
            ],
            "name": [
                1
            ],
            "sourceType": [
                6
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                8
            ],
            "isVetted": [
                8
            ],
            "description": [
                1
            ],
            "author": [
                1
            ],
            "category": [
                1
            ],
            "logoUrl": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "aboutDescription": [
                1
            ],
            "pricingDescription": [
                1
            ],
            "termsUrl": [
                1
            ],
            "emailSupport": [
                1
            ],
            "issueReportUrl": [
                1
            ],
            "screenshots": [
                1
            ],
            "galleryImages": [
                1
            ],
            "defaultRoleUniversalIdentifier": [
                1
            ],
            "roles": [
                242
            ],
            "manifest": [
                9
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
        "TriggerUninstallApplicationJobResult": {
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentResult": {
            "outcome": [
                247
            ],
            "enrichment": [
                9
            ],
            "personOutcome": [
                248
            ],
            "personEnrichment": [
                9
            ],
            "isBookCallOnboardingStepPending": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "WorkspacePersonEnrichmentOutcome": {},
        "Field": {
            "id": [
                3
            ],
            "universalIdentifier": [
                1
            ],
            "type": [
                250
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                8
            ],
            "isSystem": [
                8
            ],
            "isUIEditable": [
                8
            ],
            "writability": [
                26
            ],
            "isUIReadOnly": [
                8
            ],
            "isNullable": [
                8
            ],
            "isUnique": [
                8
            ],
            "isSearchable": [
                8
            ],
            "isAuditLogged": [
                8
            ],
            "defaultValue": [
                9
            ],
            "options": [
                9
            ],
            "settings": [
                9
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                8
            ],
            "morphId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "applicationId": [
                3
            ],
            "object": [
                23
            ],
            "relation": [
                254
            ],
            "morphRelations": [
                254
            ],
            "__typename": [
                1
            ]
        },
        "FieldMetadataType": {},
        "PageInfo": {
            "hasNextPage": [
                8
            ],
            "hasPreviousPage": [
                8
            ],
            "startCursor": [
                29
            ],
            "endCursor": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                249
            ],
            "cursor": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                251
            ],
            "edges": [
                252
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                255
            ],
            "sourceObjectMetadata": [
                23
            ],
            "targetObjectMetadata": [
                23
            ],
            "sourceFieldMetadata": [
                249
            ],
            "targetFieldMetadata": [
                249
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "IndexField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "order": [
                15
            ],
            "subFieldName": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "Index": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "isCustom": [
                8
            ],
            "isUnique": [
                8
            ],
            "indexWhereClause": [
                1
            ],
            "indexType": [
                258
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                256
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IndexEdge": {
            "node": [
                257
            ],
            "cursor": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                23
            ],
            "cursor": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                251
            ],
            "edges": [
                260
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                251
            ],
            "edges": [
                252
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                251
            ],
            "edges": [
                259
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
                28
            ],
            "__typename": [
                1
            ]
        },
        "SearchField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "tsVectorFieldMetadataId": [
                3
            ],
            "position": [
                15
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                267
            ],
            "value": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlementKey": {},
        "DomainRecord": {
            "validationType": [
                1
            ],
            "type": [
                1
            ],
            "status": [
                1
            ],
            "key": [
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
            "id": [
                3
            ],
            "domain": [
                1
            ],
            "records": [
                268
            ],
            "isCustomDomainEnabled": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicates": [
                43
            ],
            "predicateGroups": [
                41
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogs": {
            "logs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                8
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
        "VerifyTwoFactorAuthenticationMethod": {
            "success": [
                8
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
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                11
            ],
            "refreshToken": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "tokens": [
                276
            ],
            "availableWorkspaces": [
                237
            ],
            "__typename": [
                1
            ]
        },
        "EmailPasswordResetLink": {
            "success": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSO": {
            "authorizationURL": [
                1
            ],
            "type": [
                1
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "InvalidatePassword": {
            "success": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceUrlsAndId": {
            "workspaceUrls": [
                196
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                11
            ],
            "workspace": [
                281
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "ValidatePasswordResetToken": {
            "id": [
                3
            ],
            "email": [
                1
            ],
            "hasPassword": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "VerifyEmailAndGetLoginToken": {
            "loginToken": [
                11
            ],
            "workspaceUrls": [
                196
            ],
            "__typename": [
                1
            ]
        },
        "SubdomainAvailabilityDTO": {
            "isValid": [
                8
            ],
            "available": [
                8
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
        "ApiKeyToken": {
            "token": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                276
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "exists": [
                8
            ],
            "availableWorkspacesCount": [
                15
            ],
            "isEmailVerified": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "Impersonate": {
            "loginToken": [
                11
            ],
            "workspace": [
                281
            ],
            "__typename": [
                1
            ]
        },
        "StopImpersonation": {
            "canRestoreImpersonatorSession": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "id": [
                3
            ],
            "applicationId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "applicationName": [
                1
            ],
            "applicationUniversalIdentifier": [
                1
            ],
            "scopes": [
                1
            ],
            "lastAuthorizedAt": [
                4
            ],
            "lastUsedAt": [
                4
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExportApplication": {
            "universalIdentifier": [
                1
            ],
            "displayName": [
                1
            ],
            "sourceType": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExportCoverageEntry": {
            "metadataName": [
                1
            ],
            "universalIdentifier": [
                1
            ],
            "status": [
                298
            ],
            "reason": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExportCoverageStatus": {},
        "ApplicationExportFile": {
            "folder": [
                1
            ],
            "path": [
                1
            ],
            "content": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationExport": {
            "application": [
                296
            ],
            "manifest": [
                9
            ],
            "coverage": [
                297
            ],
            "files": [
                299
            ],
            "__typename": [
                1
            ]
        },
        "File": {
            "id": [
                3
            ],
            "path": [
                1
            ],
            "size": [
                15
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationFileCompletionError": {
            "fileId": [
                3
            ],
            "message": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CompleteApplicationFileUploadsResult": {
            "files": [
                301
            ],
            "errors": [
                302
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationFileUploadTarget": {
            "fileId": [
                3
            ],
            "fileFolder": [
                305
            ],
            "filePath": [
                1
            ],
            "uploadUrl": [
                1
            ],
            "contentType": [
                1
            ],
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "FileFolder": {},
        "ApplicationFileUploadError": {
            "fileFolder": [
                305
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
        "CreateApplicationFileUploadsResult": {
            "targets": [
                304
            ],
            "errors": [
                306
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
        "WorkspaceMigration": {
            "applicationUniversalIdentifier": [
                1
            ],
            "actions": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "PublicDomain": {
            "id": [
                3
            ],
            "domain": [
                1
            ],
            "isValidated": [
                8
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "VerificationRecord": {
            "type": [
                1
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "priority": [
                15
            ],
            "status": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomain": {
            "id": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "domain": [
                1
            ],
            "status": [
                313
            ],
            "tenantStatus": [
                314
            ],
            "unsubscribeHostnameStatus": [
                315
            ],
            "verificationRecords": [
                311
            ],
            "verifiedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "EmailingDomainTenantStatus": {},
        "UnsubscribeHostnameStatus": {},
        "MessageChannel": {
            "id": [
                3
            ],
            "visibility": [
                317
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "type": [
                318
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                319
            ],
            "messageFolderImportPolicy": [
                320
            ],
            "excludeNonProfessionalEmails": [
                8
            ],
            "excludeGroupEmails": [
                8
            ],
            "pendingGroupEmailsAction": [
                321
            ],
            "isSyncEnabled": [
                8
            ],
            "syncedAt": [
                4
            ],
            "syncStatus": [
                322
            ],
            "syncStage": [
                323
            ],
            "syncStageStartedAt": [
                4
            ],
            "throttleFailureCount": [
                15
            ],
            "throttleRetryAfter": [
                4
            ],
            "connectedAccountId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "connectedAccount": [
                193
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannelVisibility": {},
        "MessageChannelType": {},
        "MessageChannelContactAutoCreationPolicy": {},
        "MessageFolderImportPolicy": {},
        "MessageChannelPendingGroupEmailsAction": {},
        "MessageChannelSyncStatus": {},
        "MessageChannelSyncStage": {},
        "CreateEmailGroupChannelOutput": {
            "messageChannel": [
                316
            ],
            "forwardingAddress": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CampaignAudiencePreviewDTO": {
            "totalMembers": [
                28
            ],
            "withoutEmail": [
                28
            ],
            "duplicateEmails": [
                28
            ],
            "overCap": [
                28
            ],
            "hardSuppressed": [
                28
            ],
            "globallyUnsubscribed": [
                28
            ],
            "topicUnsubscribed": [
                28
            ],
            "sendable": [
                28
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
                28
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
        "SendMessageCampaignOutputDTO": {
            "campaignId": [
                1
            ],
            "queuedCount": [
                28
            ],
            "audience": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "DuplicatedMessageList": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "position": [
                15
            ],
            "memberCount": [
                15
            ],
            "createdAt": [
                1
            ],
            "updatedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppression": {
            "id": [
                3
            ],
            "createdAt": [
                4
            ],
            "emailAddress": [
                1
            ],
            "reason": [
                331
            ],
            "source": [
                332
            ],
            "unsubscribeTopicId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionReason": {},
        "MessageSuppressionSource": {},
        "MessageSuppressionList": {
            "records": [
                330
            ],
            "totalCount": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopic": {
            "id": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopicVisibility": {},
        "AutocompleteResult": {
            "text": [
                1
            ],
            "placeId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Location": {
            "lat": [
                15
            ],
            "lng": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "PlaceDetailsResult": {
            "street": [
                1
            ],
            "state": [
                1
            ],
            "postcode": [
                1
            ],
            "city": [
                1
            ],
            "country": [
                1
            ],
            "location": [
                337
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParams": {
            "host": [
                1
            ],
            "port": [
                15
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                191
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParameters": {
            "name": [
                1
            ],
            "IMAP": [
                339
            ],
            "SMTP": [
                339
            ],
            "CALDAV": [
                339
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedImapSmtpCaldavAccount": {
            "id": [
                3
            ],
            "handle": [
                1
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                3
            ],
            "connectionParameters": [
                340
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "success": [
                8
            ],
            "connectedAccountId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Webhook": {
            "id": [
                3
            ],
            "targetUrl": [
                1
            ],
            "operations": [
                1
            ],
            "description": [
                1
            ],
            "secret": [
                1
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ToolIndexEntry": {
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "category": [
                1
            ],
            "objectName": [
                1
            ],
            "icon": [
                1
            ],
            "inputSchema": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "id": [
                3
            ],
            "messageId": [
                3
            ],
            "orderIndex": [
                28
            ],
            "type": [
                1
            ],
            "textContent": [
                1
            ],
            "reasoningContent": [
                1
            ],
            "toolName": [
                1
            ],
            "toolCallId": [
                1
            ],
            "toolInput": [
                9
            ],
            "toolOutput": [
                9
            ],
            "state": [
                1
            ],
            "providerExecuted": [
                8
            ],
            "errorMessage": [
                1
            ],
            "errorDetails": [
                9
            ],
            "sourceUrlSourceId": [
                1
            ],
            "sourceUrlUrl": [
                1
            ],
            "sourceUrlTitle": [
                1
            ],
            "sourceDocumentSourceId": [
                1
            ],
            "sourceDocumentMediaType": [
                1
            ],
            "sourceDocumentTitle": [
                1
            ],
            "sourceDocumentFilename": [
                1
            ],
            "fileMediaType": [
                1
            ],
            "fileFilename": [
                1
            ],
            "fileId": [
                3
            ],
            "fileUrl": [
                1
            ],
            "providerMetadata": [
                9
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentResult": {
            "result": [
                9
            ],
            "error": [
                1
            ],
            "success": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ChannelSyncSuccess": {
            "success": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CreateCalendarEventOutput": {
            "success": [
                8
            ],
            "iCalUid": [
                1
            ],
            "calendarEventId": [
                1
            ],
            "conferenceLink": [
                1
            ],
            "error": [
                1
            ],
            "__typename": [
                1
            ]
        },
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
        "BarChartData": {
            "data": [
                9
            ],
            "indexBy": [
                1
            ],
            "keys": [
                1
            ],
            "series": [
                349
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                8
            ],
            "showDataLabels": [
                8
            ],
            "layout": [
                102
            ],
            "groupMode": [
                101
            ],
            "hasTooManyGroups": [
                8
            ],
            "formattedToRawLookup": [
                9
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
                15
            ],
            "__typename": [
                1
            ]
        },
        "LineChartSeries": {
            "key": [
                1
            ],
            "label": [
                1
            ],
            "data": [
                351
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                352
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                8
            ],
            "showDataLabels": [
                8
            ],
            "hasTooManyGroups": [
                8
            ],
            "formattedToRawLookup": [
                9
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
                15
            ],
            "__typename": [
                1
            ]
        },
        "PieChartData": {
            "data": [
                354
            ],
            "showLegend": [
                8
            ],
            "showDataLabels": [
                8
            ],
            "showCenterMetric": [
                8
            ],
            "hasTooManyGroups": [
                8
            ],
            "formattedToRawLookup": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "DuplicatedDashboard": {
            "id": [
                3
            ],
            "title": [
                1
            ],
            "pageLayoutId": [
                3
            ],
            "position": [
                15
            ],
            "createdAt": [
                1
            ],
            "updatedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailOutput": {
            "success": [
                8
            ],
            "error": [
                1
            ],
            "messageThreadId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Analytics": {
            "success": [
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
            "timestamp": [
                4
            ],
            "userId": [
                1
            ],
            "properties": [
                9
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "isCustom": [
                8
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
                8
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "records": [
                359
            ],
            "totalCount": [
                28
            ],
            "pageInfo": [
                360
            ],
            "__typename": [
                1
            ]
        },
        "Skill": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "content": [
                1
            ],
            "isCustom": [
                8
            ],
            "isSystem": [
                8
            ],
            "isActive": [
                8
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "id": [
                3
            ],
            "threadId": [
                3
            ],
            "turnId": [
                3
            ],
            "agentId": [
                3
            ],
            "role": [
                1
            ],
            "status": [
                1
            ],
            "parts": [
                345
            ],
            "processedAt": [
                4
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThread": {
            "id": [
                228
            ],
            "title": [
                1
            ],
            "totalInputTokens": [
                28
            ],
            "totalOutputTokens": [
                28
            ],
            "contextWindowTokens": [
                28
            ],
            "conversationSize": [
                28
            ],
            "totalInputCredits": [
                15
            ],
            "totalOutputCredits": [
                15
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "deletedAt": [
                4
            ],
            "lastMessageAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptSection": {
            "title": [
                1
            ],
            "content": [
                1
            ],
            "estimatedTokenCount": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                365
            ],
            "estimatedTokenCount": [
                28
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
        "ChatStreamCatchupChunks": {
            "chunks": [
                9
            ],
            "maxSeq": [
                28
            ],
            "error": [
                367
            ],
            "__typename": [
                1
            ]
        },
        "SendChatMessageResult": {
            "messageId": [
                1
            ],
            "queued": [
                8
            ],
            "streamId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatEvent": {
            "threadId": [
                1
            ],
            "event": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                372
            ],
            "thread": [
                364
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceSetupChatOutcome": {},
        "AgentTurnEvaluation": {
            "id": [
                3
            ],
            "turnId": [
                3
            ],
            "score": [
                28
            ],
            "comment": [
                1
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentTurn": {
            "id": [
                3
            ],
            "threadId": [
                3
            ],
            "agentId": [
                3
            ],
            "evaluations": [
                373
            ],
            "messages": [
                363
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceAiStats": {
            "conversationsCount": [
                28
            ],
            "skillsCount": [
                28
            ],
            "toolsCount": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobResult": {
            "enqueued": [
                8
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobsResult": {
            "enqueued": [
                8
            ],
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "enqueuedJobsCount": [
                28
            ],
            "jobIds": [
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
            "value": [
                9
            ],
            "scope": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "CalendarChannel": {
            "id": [
                3
            ],
            "handle": [
                1
            ],
            "syncStatus": [
                381
            ],
            "syncStage": [
                382
            ],
            "visibility": [
                383
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                384
            ],
            "isSyncEnabled": [
                8
            ],
            "syncedAt": [
                4
            ],
            "syncStageStartedAt": [
                4
            ],
            "throttleFailureCount": [
                15
            ],
            "connectedAccountId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannelSyncStatus": {},
        "CalendarChannelSyncStage": {},
        "CalendarChannelVisibility": {},
        "CalendarChannelContactAutoCreationPolicy": {},
        "MessageFolder": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "isSentFolder": [
                8
            ],
            "isSynced": [
                8
            ],
            "parentFolderId": [
                1
            ],
            "externalId": [
                1
            ],
            "pendingSyncAction": [
                386
            ],
            "messageChannelId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "MessageFolderPendingSyncAction": {},
        "MetadataTranslation": {
            "metadataName": [
                1
            ],
            "recordId": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "property": [
                1
            ],
            "locale": [
                1
            ],
            "sourceValue": [
                1
            ],
            "canonicalValue": [
                1
            ],
            "value": [
                1
            ],
            "provenance": [
                388
            ],
            "__typename": [
                1
            ]
        },
        "MetadataTranslationProvenance": {},
        "TimelineActivityTypeEmitThrough": {
            "relationFieldUniversalIdentifier": [
                3
            ],
            "triggerFieldUniversalIdentifiers": [
                3
            ],
            "happensAtFieldUniversalIdentifier": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityTypeEmit": {
            "on": [
                1
            ],
            "objectUniversalIdentifier": [
                3
            ],
            "through": [
                389
            ],
            "__typename": [
                1
            ]
        },
        "TimelineActivityType": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "emit": [
                390
            ],
            "action": [
                1
            ],
            "icon": [
                1
            ],
            "frontComponentUniversalIdentifier": [
                3
            ],
            "objectUniversalIdentifier": [
                3
            ],
            "replacesTimelineActivityTypeUniversalIdentifier": [
                3
            ],
            "isActive": [
                8
            ],
            "applicationId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                393
            ],
            "hash": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AllMetadataName": {},
        "MinimalObjectMetadata": {
            "id": [
                3
            ],
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "isActive": [
                8
            ],
            "isSystem": [
                8
            ],
            "isRemote": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "MinimalView": {
            "id": [
                3
            ],
            "type": [
                64
            ],
            "key": [
                65
            ],
            "objectMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "objectMetadataItems": [
                394
            ],
            "views": [
                395
            ],
            "collectionHashes": [
                392
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "navigationMenuItems": [
                154
            ],
            "navigationMenuItem": [
                154,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "applicationSdkClientChecksums": [
                77,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "isApplicationStopped": [
                8,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
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
            "enterpriseCheckoutSession": [
                1,
                {
                    "billingInterval": [
                        1
                    ]
                }
            ],
            "enterpriseSubscriptionStatus": [
                150
            ],
            "getUsageAnalytics": [
                175,
                {
                    "input": [
                        398
                    ]
                }
            ],
            "usageLimits": [
                183
            ],
            "usageQuotasWithConsumption": [
                180
            ],
            "usageQuotaDefinitions": [
                179
            ],
            "usageQuotaScopeConsumption": [
                182,
                {
                    "input": [
                        399,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                55,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                57,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                63,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        64,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                63,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                60,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                60,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                53,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                53,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                62,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "apiKeys": [
                2
            ],
            "getApiKeyRoles": [
                48
            ],
            "apiKey": [
                2,
                {
                    "input": [
                        400,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "currentUserSessions": [
                165
            ],
            "myConnectedAccounts": [
                193
            ],
            "applicationConnectedAccounts": [
                193,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                129,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "billingPortalSession": [
                170,
                {
                    "returnUrlPath": [
                        1
                    ],
                    "forPaymentMethodUpdate": [
                        8
                    ]
                }
            ],
            "listPlans": [
                168
            ],
            "getResourceCreditUsage": [
                167
            ],
            "getInviteSuggestions": [
                185
            ],
            "findWorkspaceInvitations": [
                188
            ],
            "getApprovedAccessDomains": [
                184
            ],
            "getPageLayoutTabs": [
                125,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                125,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                126,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        127
                    ]
                }
            ],
            "getPageLayout": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                81,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                81,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyAgents": [
                10
            ],
            "findOneAgent": [
                10,
                {
                    "input": [
                        401,
                        "AgentIdInput!"
                    ]
                }
            ],
            "objects": [
                261,
                {
                    "paging": [
                        27,
                        "CursorPaging!"
                    ],
                    "filter": [
                        402,
                        "ObjectFilter!"
                    ]
                }
            ],
            "object": [
                23,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                264
            ],
            "mostlyEmptyFieldMetadataIds": [
                3,
                {
                    "objectMetadataId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                21,
                {
                    "input": [
                        403,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                21
            ],
            "getAvailablePackages": [
                9,
                {
                    "input": [
                        403,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        403,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "commandMenuItems": [
                14
            ],
            "commandMenuItem": [
                14,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                13
            ],
            "frontComponent": [
                13,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "currentWorkspace": [
                69
            ],
            "getPublicWorkspaceDataByDomain": [
                206,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                207,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                225,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                76,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                76
            ],
            "findOneApplicationRegistration": [
                76,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                199,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                197,
                {
                    "applicationRegistrationId": [
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
            "findClaimableApplicationRegistration": [
                223,
                {
                    "sourcePackage": [
                        1
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
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
            "findManyApplications": [
                49
            ],
            "findOneApplication": [
                49,
                {
                    "id": [
                        3
                    ],
                    "universalIdentifier": [
                        3
                    ]
                }
            ],
            "findInstallApplicationJobStatus": [
                156,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                156,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                239,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                243,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                239,
                {
                    "isVetted": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                243,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "fields": [
                253,
                {
                    "paging": [
                        27,
                        "CursorPaging!"
                    ],
                    "filter": [
                        30,
                        "FieldFilter!"
                    ]
                }
            ],
            "field": [
                249,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getViewGroups": [
                59,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getRoles": [
                48
            ],
            "previewMessageCampaignAudience": [
                325,
                {
                    "input": [
                        404,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "messageSuppressions": [
                333,
                {
                    "input": [
                        405,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                334
            ],
            "myMessageChannels": [
                316,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "getEmailingDomains": [
                312
            ],
            "getToolIndex": [
                344
            ],
            "getToolInputSchema": [
                9,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "webhooks": [
                343
            ],
            "webhook": [
                343,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "myMessageFolders": [
                385,
                {
                    "messageChannelId": [
                        3
                    ]
                }
            ],
            "myCalendarChannels": [
                380,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "minimalMetadata": [
                396
            ],
            "appKeyValue": [
                378,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        379
                    ]
                }
            ],
            "getJobs": [
                156,
                {
                    "jobIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "appConnections": [
                227,
                {
                    "filter": [
                        406
                    ]
                }
            ],
            "appConnection": [
                227,
                {
                    "id": [
                        228,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                375
            ],
            "chatThreads": [
                364
            ],
            "chatThread": [
                364,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                363,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                368,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                366
            ],
            "skills": [
                362
            ],
            "skill": [
                362,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                374,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "timelineActivityTypes": [
                391
            ],
            "metadataTranslations": [
                387,
                {
                    "input": [
                        407,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "checkUserExists": [
                291,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ]
                }
            ],
            "checkWorkspaceInviteHashIsValid": [
                292,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                69,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                286,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                287
            ],
            "validatePasswordResetToken": [
                284,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "currentUser": [
                73
            ],
            "getSSOIdentityProviders": [
                233
            ],
            "eventLogs": [
                361,
                {
                    "input": [
                        408,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                355,
                {
                    "input": [
                        412,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                353,
                {
                    "input": [
                        413,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                350,
                {
                    "input": [
                        414,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "callRecordingIdForCalendarEvent": [
                3,
                {
                    "calendarEventId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                341,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                336,
                {
                    "address": [
                        1,
                        "String!"
                    ],
                    "token": [
                        1,
                        "String!"
                    ],
                    "country": [
                        1
                    ],
                    "isFieldCity": [
                        8
                    ]
                }
            ],
            "getAddressDetails": [
                338,
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
            "findManyPublicDomains": [
                310
            ],
            "exportApplication": [
                300,
                {
                    "universalIdentifier": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "currentUserApplicationAuthorizations": [
                295
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userWorkspaceId": [
                1
            ],
            "operationTypes": [
                178
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "resourceType": [
                177
            ],
            "operationType": [
                178
            ],
            "spenderType": [
                1
            ],
            "spenderId": [
                1
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                402
            ],
            "or": [
                402
            ],
            "id": [
                31
            ],
            "universalIdentifier": [
                31
            ],
            "isActive": [
                32
            ],
            "isRemote": [
                32
            ],
            "isSearchable": [
                32
            ],
            "isSystem": [
                32
            ],
            "isUICreatable": [
                32
            ],
            "isUIEditable": [
                32
            ],
            "isUIReadOnly": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                228
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
        "FindMessageSuppressionsInput": {
            "reason": [
                331
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                3
            ],
            "limit": [
                28
            ],
            "offset": [
                28
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
        "MetadataTranslationsInput": {
            "objectMetadataId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "locale": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryInput": {
            "table": [
                409
            ],
            "filters": [
                410
            ],
            "first": [
                28
            ],
            "after": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogTable": {},
        "EventLogFiltersInput": {
            "eventType": [
                1
            ],
            "userWorkspaceId": [
                1
            ],
            "dateRange": [
                411
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogDateRangeInput": {
            "start": [
                4
            ],
            "end": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataInput": {
            "objectMetadataId": [
                3
            ],
            "configuration": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "LineChartDataInput": {
            "objectMetadataId": [
                3
            ],
            "configuration": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "BarChartDataInput": {
            "objectMetadataId": [
                3
            ],
            "configuration": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "Mutation": {
            "addQueryToEventStream": [
                8,
                {
                    "input": [
                        416,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                8,
                {
                    "input": [
                        417,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                154,
                {
                    "inputs": [
                        418,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                154,
                {
                    "input": [
                        418,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                154,
                {
                    "inputs": [
                        419,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                154,
                {
                    "input": [
                        419,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                154,
                {
                    "ids": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                154,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                152,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        15,
                        "Float!"
                    ],
                    "fileFolder": [
                        305,
                        "FileFolder!"
                    ],
                    "fieldMetadataId": [
                        1
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1
                    ]
                }
            ],
            "completeFileUpload": [
                151,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                8
            ],
            "releaseEnterpriseServerBinding": [
                149
            ],
            "setEnterpriseKey": [
                149,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                151,
                {
                    "file": [
                        421,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                151,
                {
                    "file": [
                        421,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                151,
                {
                    "file": [
                        421,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createUsageLimit": [
                183,
                {
                    "input": [
                        422,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                183,
                {
                    "input": [
                        423,
                        "UpdateUsageLimitInput!"
                    ]
                }
            ],
            "deleteUsageLimit": [
                8,
                {
                    "usageLimitId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                55,
                {
                    "input": [
                        424,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        425,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilter": [
                57,
                {
                    "input": [
                        426,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                57,
                {
                    "input": [
                        427,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                57,
                {
                    "input": [
                        429,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                57,
                {
                    "input": [
                        430,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "createView": [
                63,
                {
                    "input": [
                        431,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                63,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        432,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "deleteView": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "upsertViewWidget": [
                63,
                {
                    "input": [
                        433,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                60,
                {
                    "input": [
                        439,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                60,
                {
                    "input": [
                        440,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                8,
                {
                    "input": [
                        442,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                8,
                {
                    "input": [
                        443,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "updateViewField": [
                53,
                {
                    "input": [
                        444,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                53,
                {
                    "input": [
                        446,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                53,
                {
                    "inputs": [
                        446,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                53,
                {
                    "input": [
                        447,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                53,
                {
                    "input": [
                        448,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                62,
                {
                    "input": [
                        449,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                62,
                {
                    "input": [
                        451,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                62,
                {
                    "inputs": [
                        451,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                62,
                {
                    "input": [
                        452,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                62,
                {
                    "input": [
                        453,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                63,
                {
                    "input": [
                        454,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createApiKey": [
                2,
                {
                    "input": [
                        457,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        458,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        459,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                8,
                {
                    "apiKeyId": [
                        3,
                        "UUID!"
                    ],
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                8,
                {
                    "userSessionId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                28
            ],
            "deleteConnectedAccount": [
                193,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                8,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        1,
                        "String!"
                    ],
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "checkoutSession": [
                170,
                {
                    "recurringInterval": [
                        137,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        133,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        8,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                169,
                {
                    "recurringInterval": [
                        137,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        133,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        8,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ],
                    "idempotencyKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createBillingPaymentMethodSetupIntent": [
                169
            ],
            "switchSubscriptionInterval": [
                171
            ],
            "switchBillingPlan": [
                171
            ],
            "cancelSwitchBillingPlan": [
                171
            ],
            "cancelSwitchBillingInterval": [
                171
            ],
            "setResourceCreditSubscriptionPrice": [
                171,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                166
            ],
            "cancelSwitchResourceCreditPrice": [
                171
            ],
            "skipSyncEmailOnboardingStep": [
                187,
                {
                    "isAutoSkipped": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                187,
                {
                    "hasBookedCall": [
                        8,
                        "Boolean!"
                    ],
                    "isAutoSkipped": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "triggerInstallAppsOnboardingStep": [
                187,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]!"
                    ],
                    "isAutoSkipped": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "goBackToPreviousOnboardingStep": [
                186
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
            "resendWorkspaceInvitation": [
                189,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                189,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        3
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                184,
                {
                    "input": [
                        460,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                8,
                {
                    "input": [
                        461,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                184,
                {
                    "input": [
                        462,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                125,
                {
                    "input": [
                        463,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                125,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        464,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayout": [
                126,
                {
                    "input": [
                        465,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        466,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "destroyPageLayout": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        467,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                126,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                81,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                125,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                81,
                {
                    "input": [
                        470,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                81,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        471,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneAgent": [
                10,
                {
                    "input": [
                        472,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                10,
                {
                    "input": [
                        473,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                10,
                {
                    "input": [
                        401,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createOneObject": [
                23,
                {
                    "input": [
                        474,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                23,
                {
                    "input": [
                        476,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                23,
                {
                    "input": [
                        477,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "createOneIndex": [
                257,
                {
                    "input": [
                        480,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                257,
                {
                    "input": [
                        483,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                21,
                {
                    "input": [
                        403,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                21,
                {
                    "input": [
                        484,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                147,
                {
                    "input": [
                        485,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                8,
                {
                    "input": [
                        486,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                14,
                {
                    "input": [
                        488,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                14,
                {
                    "input": [
                        489,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                14,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                14,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                13,
                {
                    "input": [
                        490,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                13,
                {
                    "input": [
                        491,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                13,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                69,
                {
                    "data": [
                        493,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                69,
                {
                    "data": [
                        494,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                69
            ],
            "checkCustomDomainValidRecords": [
                269
            ],
            "enrichWorkspaceCompany": [
                246
            ],
            "upgradeApplication": [
                8,
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
            "createApplicationRegistration": [
                224,
                {
                    "input": [
                        495,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                76,
                {
                    "input": [
                        496,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                226,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationRegistrationVariable": [
                197,
                {
                    "input": [
                        498,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                197,
                {
                    "input": [
                        499,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "deleteApplicationRegistrationVariable": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadAppTarball": [
                76,
                {
                    "file": [
                        421,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                76,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                76,
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
            "installMarketplaceApp": [
                8,
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
            "installApplication": [
                49,
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
            "triggerInstallApplicationJob": [
                244,
                {
                    "input": [
                        501,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                245,
                {
                    "input": [
                        502,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "updateApplication": [
                49,
                {
                    "id": [
                        3,
                        "UUID!"
                    ],
                    "input": [
                        503,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                8,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                8
            ],
            "createOneField": [
                249,
                {
                    "input": [
                        504,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                249,
                {
                    "input": [
                        506,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                249,
                {
                    "input": [
                        508,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                59,
                {
                    "input": [
                        509,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                59,
                {
                    "inputs": [
                        509,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                59,
                {
                    "input": [
                        510,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                59,
                {
                    "inputs": [
                        510,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                59,
                {
                    "input": [
                        512,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                59,
                {
                    "input": [
                        513,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                35,
                {
                    "workspaceMemberId": [
                        3,
                        "UUID!"
                    ],
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneRole": [
                48,
                {
                    "createRoleInput": [
                        514,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                48,
                {
                    "updateRoleInput": [
                        515,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                45,
                {
                    "upsertObjectPermissionsInput": [
                        517,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                46,
                {
                    "upsertPermissionFlagsInput": [
                        519,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                40,
                {
                    "upsertFieldPermissionsInput": [
                        520,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                270,
                {
                    "input": [
                        522,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                8,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ],
                    "roleId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                8,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "sendEmailViaEmailingDomain": [
                327,
                {
                    "input": [
                        525,
                        "SendEmailViaDomainInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                328,
                {
                    "input": [
                        526,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "cancelMessageCampaign": [
                326,
                {
                    "input": [
                        527,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                327,
                {
                    "input": [
                        528,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "duplicateMessageList": [
                329,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createMessageSuppression": [
                330,
                {
                    "input": [
                        529,
                        "CreateMessageSuppressionInput!"
                    ]
                }
            ],
            "deleteMessageSuppression": [
                8,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                334,
                {
                    "input": [
                        530,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                334,
                {
                    "input": [
                        531,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "deleteUnsubscribeTopic": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateMessageChannel": [
                316,
                {
                    "input": [
                        532,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                324,
                {
                    "input": [
                        534,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                316,
                {
                    "input": [
                        535,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                316,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createEmailingDomain": [
                312,
                {
                    "input": [
                        536,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                8,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                312,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                346,
                {
                    "input": [
                        537,
                        "RunAgentInput!"
                    ]
                }
            ],
            "createWebhook": [
                343,
                {
                    "input": [
                        540,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                343,
                {
                    "input": [
                        541,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                343,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateMessageFolder": [
                385,
                {
                    "input": [
                        543,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                385,
                {
                    "input": [
                        545,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                380,
                {
                    "input": [
                        546,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                378,
                {
                    "input": [
                        548,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "deleteAppKeyValue": [
                8,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        379
                    ]
                }
            ],
            "enqueueJob": [
                376,
                {
                    "input": [
                        549,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                377,
                {
                    "input": [
                        550,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                8,
                {
                    "input": [
                        552,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "createChatThread": [
                364
            ],
            "sendChatMessage": [
                369,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        3,
                        "UUID!"
                    ],
                    "browsingContext": [
                        9
                    ],
                    "modelId": [
                        1
                    ],
                    "fileAttachments": [
                        553,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "retryChatMessage": [
                369,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ]
                }
            ],
            "answerAgentChatQuestion": [
                369,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "messageId": [
                        3,
                        "UUID!"
                    ],
                    "answers": [
                        554,
                        "[AgentChatQuestionAnswerInput!]!"
                    ],
                    "modelId": [
                        1
                    ],
                    "fileAttachments": [
                        553,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "stopAgentChatStream": [
                8,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "renameChatThread": [
                364,
                {
                    "id": [
                        3,
                        "UUID!"
                    ],
                    "title": [
                        1,
                        "String!"
                    ]
                }
            ],
            "archiveChatThread": [
                364,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "unarchiveChatThread": [
                364,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteChatThread": [
                8,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                8,
                {
                    "messageId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                371,
                {
                    "companyContext": [
                        9
                    ],
                    "personContext": [
                        9
                    ]
                }
            ],
            "createSkill": [
                362,
                {
                    "input": [
                        555,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                362,
                {
                    "input": [
                        556,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                362,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                362,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                362,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                373,
                {
                    "turnId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                374,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ],
                    "input": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                391,
                {
                    "input": [
                        557,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                391,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                279,
                {
                    "input": [
                        558,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                290,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signIn": [
                277,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                285,
                {
                    "emailVerificationToken": [
                        1,
                        "String!"
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailAndGetWorkspaceAgnosticToken": [
                277,
                {
                    "emailVerificationToken": [
                        1,
                        "String!"
                    ],
                    "email": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ]
                }
            ],
            "getAuthTokensFromOTP": [
                289,
                {
                    "otp": [
                        1,
                        "String!"
                    ],
                    "loginToken": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signUp": [
                277,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "signUpInWorkspace": [
                282,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "password": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        3
                    ],
                    "workspaceInviteHash": [
                        1
                    ],
                    "workspacePersonalInviteToken": [
                        1
                    ],
                    "captchaToken": [
                        1
                    ],
                    "locale": [
                        1
                    ],
                    "verifyEmailRedirectPath": [
                        1
                    ]
                }
            ],
            "signUpInNewWorkspace": [
                282,
                {
                    "input": [
                        559
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                151,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        421,
                        "Upload!"
                    ]
                }
            ],
            "generateTransientToken": [
                283
            ],
            "getAuthTokensFromLoginToken": [
                289,
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
            "getAuthTokensFromSSOExchangeToken": [
                289,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "authorizeApp": [
                275,
                {
                    "clientId": [
                        1,
                        "String!"
                    ],
                    "codeChallenge": [
                        1
                    ],
                    "redirectUrl": [
                        1,
                        "String!"
                    ],
                    "state": [
                        1
                    ],
                    "scope": [
                        1
                    ],
                    "issuer": [
                        1
                    ]
                }
            ],
            "renewToken": [
                289,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signOut": [
                8,
                {
                    "refreshToken": [
                        1
                    ]
                }
            ],
            "generateApiKeyToken": [
                288,
                {
                    "apiKeyId": [
                        3,
                        "UUID!"
                    ],
                    "expiresAt": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generatePlaygroundToken": [
                11
            ],
            "emailPasswordResetLink": [
                278,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        3
                    ],
                    "captchaToken": [
                        1
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                280,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ],
                    "newPassword": [
                        1,
                        "String!"
                    ]
                }
            ],
            "initiateOTPProvisioning": [
                273,
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
                273
            ],
            "deleteTwoFactorAuthenticationMethod": [
                272,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                274,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                73
            ],
            "deleteUserFromWorkspace": [
                51,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                8,
                {
                    "input": [
                        560,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "updateUserEmail": [
                8,
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
            "resendEmailVerificationToken": [
                229,
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
            "createOIDCIdentityProvider": [
                234,
                {
                    "input": [
                        561,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                234,
                {
                    "input": [
                        562,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                230,
                {
                    "input": [
                        563,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                231,
                {
                    "input": [
                        564,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                358,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "recordId": [
                        3,
                        "UUID!"
                    ],
                    "objectMetadataId": [
                        3,
                        "UUID!"
                    ],
                    "properties": [
                        9
                    ]
                }
            ],
            "trackAnalytics": [
                358,
                {
                    "type": [
                        565,
                        "AnalyticsType!"
                    ],
                    "name": [
                        1
                    ],
                    "event": [
                        1
                    ],
                    "properties": [
                        9
                    ]
                }
            ],
            "duplicateDashboard": [
                356,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                293,
                {
                    "userId": [
                        3,
                        "UUID!"
                    ],
                    "workspaceId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                294
            ],
            "createCalendarEvent": [
                348,
                {
                    "input": [
                        566,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                357,
                {
                    "input": [
                        567,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                347,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                342,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        569,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                194,
                {
                    "input": [
                        571,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                310,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "applicationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deletePublicDomain": [
                8,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkPublicDomainValidRecords": [
                269,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                308,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ],
                    "name": [
                        1,
                        "String!"
                    ]
                }
            ],
            "syncApplication": [
                309,
                {
                    "manifest": [
                        9,
                        "JSON!"
                    ],
                    "dryRun": [
                        8
                    ],
                    "inferDeletionFromMissingEntities": [
                        8
                    ]
                }
            ],
            "uploadApplicationFile": [
                301,
                {
                    "file": [
                        421,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        305,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                307,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        572,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                303,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileIds": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                8,
                {
                    "applicationAuthorizationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "generateApplicationToken": [
                12,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                12,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "AddQuerySubscriptionInput": {
            "eventStreamId": [
                1
            ],
            "queryId": [
                1
            ],
            "operationSignature": [
                9
            ],
            "__typename": [
                1
            ]
        },
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
        "CreateNavigationMenuItemInput": {
            "id": [
                3
            ],
            "userWorkspaceId": [
                3
            ],
            "targetRecordId": [
                3
            ],
            "targetObjectMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "type": [
                155
            ],
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "folderId": [
                3
            ],
            "pageLayoutId": [
                3
            ],
            "position": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneNavigationMenuItemInput": {
            "id": [
                3
            ],
            "update": [
                420
            ],
            "__typename": [
                1
            ]
        },
        "UpdateNavigationMenuItemInput": {
            "folderId": [
                3
            ],
            "position": [
                15
            ],
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "color": [
                1
            ],
            "pageLayoutId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "CreateUsageLimitInput": {
            "resourceType": [
                177
            ],
            "operationType": [
                178
            ],
            "spenderType": [
                1
            ],
            "spenderId": [
                1
            ],
            "limitKind": [
                1
            ],
            "periodCount": [
                28
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "limitValue": [
                181
            ],
            "burstValue": [
                181
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUsageLimitInput": {
            "id": [
                3
            ],
            "payload": [
                422
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                56
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                56
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                58
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                3
            ],
            "update": [
                428
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                3
            ],
            "operand": [
                58
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                3
            ],
            "type": [
                64
            ],
            "key": [
                65
            ],
            "icon": [
                1
            ],
            "position": [
                15
            ],
            "isCompact": [
                8
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "kanbanColumnWidth": [
                28
            ],
            "openRecordIn": [
                66
            ],
            "kanbanAggregateOperation": [
                54
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                67
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "calendarEndFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "visibility": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                64
            ],
            "icon": [
                1
            ],
            "position": [
                15
            ],
            "isCompact": [
                8
            ],
            "openRecordIn": [
                66
            ],
            "kanbanAggregateOperation": [
                54
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                67
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "calendarEndFieldMetadataId": [
                3
            ],
            "visibility": [
                68
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "kanbanColumnWidth": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "widgetId": [
                3
            ],
            "view": [
                434
            ],
            "viewFields": [
                435
            ],
            "viewFilters": [
                436
            ],
            "viewFilterGroups": [
                437
            ],
            "viewSorts": [
                438
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "type": [
                64
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "openRecordIn": [
                66
            ],
            "kanbanAggregateOperation": [
                54
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "kanbanColumnWidth": [
                28
            ],
            "calendarLayout": [
                67
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "calendarEndFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "viewFieldId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                8
            ],
            "position": [
                15
            ],
            "size": [
                15
            ],
            "aggregateOperation": [
                54
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                58
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                56
            ],
            "positionInViewFilterGroup": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSortInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                61
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                61
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                3
            ],
            "update": [
                441
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                61
            ],
            "subFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewSortInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                3
            ],
            "update": [
                445
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "isVisible": [
                8
            ],
            "size": [
                15
            ],
            "position": [
                15
            ],
            "aggregateOperation": [
                54
            ],
            "viewFieldGroupId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "viewId": [
                3
            ],
            "isVisible": [
                8
            ],
            "size": [
                15
            ],
            "position": [
                15
            ],
            "aggregateOperation": [
                54
            ],
            "viewFieldGroupId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldGroupInput": {
            "id": [
                3
            ],
            "update": [
                450
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldGroupInputUpdates": {
            "name": [
                1
            ],
            "position": [
                15
            ],
            "isVisible": [
                8
            ],
            "deletedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldGroupInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "viewId": [
                3
            ],
            "position": [
                15
            ],
            "isVisible": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "widgetId": [
                3
            ],
            "groups": [
                455
            ],
            "fields": [
                456
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "position": [
                15
            ],
            "isVisible": [
                8
            ],
            "fields": [
                456
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "viewFieldId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                8
            ],
            "position": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "CreateApiKeyInput": {
            "name": [
                1
            ],
            "expiresAt": [
                1
            ],
            "revokedAt": [
                1
            ],
            "roleId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApiKeyInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "expiresAt": [
                1
            ],
            "revokedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RevokeApiKeyInput": {
            "id": [
                3
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
        "DeleteApprovedAccessDomainInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ValidateApprovedAccessDomainInput": {
            "validationToken": [
                1
            ],
            "approvedAccessDomainId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutTabInput": {
            "title": [
                1
            ],
            "position": [
                15
            ],
            "pageLayoutId": [
                3
            ],
            "layoutMode": [
                85
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutTabInput": {
            "title": [
                1
            ],
            "position": [
                15
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                85
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutInput": {
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutInput": {
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWithTabsInput": {
            "name": [
                1
            ],
            "type": [
                127
            ],
            "objectMetadataId": [
                3
            ],
            "isFirstTabPinned": [
                8
            ],
            "tabs": [
                468
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutTabWithWidgetsInput": {
            "id": [
                3
            ],
            "title": [
                1
            ],
            "position": [
                15
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                85
            ],
            "widgets": [
                469
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "id": [
                3
            ],
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                82
            ],
            "objectMetadataId": [
                3
            ],
            "position": [
                9
            ],
            "configuration": [
                9
            ],
            "conditionalDisplay": [
                9
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                82
            ],
            "objectMetadataId": [
                3
            ],
            "position": [
                9
            ],
            "configuration": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                82
            ],
            "objectMetadataId": [
                3
            ],
            "position": [
                9
            ],
            "configuration": [
                9
            ],
            "conditionalDisplay": [
                9
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentInput": {
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "prompt": [
                1
            ],
            "modelId": [
                1
            ],
            "roleId": [
                3
            ],
            "responseFormat": [
                9
            ],
            "modelConfiguration": [
                9
            ],
            "evaluationInputs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateAgentInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "prompt": [
                1
            ],
            "modelId": [
                1
            ],
            "roleId": [
                3
            ],
            "responseFormat": [
                9
            ],
            "modelConfiguration": [
                9
            ],
            "evaluationInputs": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                475
            ],
            "__typename": [
                1
            ]
        },
        "CreateObjectInput": {
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "shortcut": [
                1
            ],
            "color": [
                1
            ],
            "skipNameField": [
                8
            ],
            "isRemote": [
                8
            ],
            "primaryKeyColumnType": [
                1
            ],
            "primaryKeyFieldMetadataSettings": [
                9
            ],
            "isLabelSyncedWithName": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "update": [
                478
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateObjectPayload": {
            "labelSingular": [
                1
            ],
            "labelPlural": [
                1
            ],
            "nameSingular": [
                1
            ],
            "namePlural": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "shortcut": [
                1
            ],
            "color": [
                1
            ],
            "isActive": [
                8
            ],
            "labelIdentifierFieldMetadataId": [
                3
            ],
            "imageIdentifierFieldMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                8
            ],
            "isSearchable": [
                8
            ],
            "openRecordIn": [
                24
            ],
            "translations": [
                479
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
        "CreateOneIndexInput": {
            "index": [
                481
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexInput": {
            "objectMetadataId": [
                3
            ],
            "fields": [
                482
            ],
            "indexType": [
                258
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexFieldInput": {
            "fieldMetadataId": [
                3
            ],
            "subFieldName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneIndexInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "timeoutSeconds": [
                15
            ],
            "source": [
                9
            ],
            "cronTriggerSettings": [
                9
            ],
            "databaseEventTriggerSettings": [
                9
            ],
            "httpRouteTriggerSettings": [
                9
            ],
            "serverRouteTriggerSettings": [
                9
            ],
            "toolTriggerSettings": [
                9
            ],
            "workflowActionTriggerSettings": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                3
            ],
            "payload": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                3
            ],
            "update": [
                487
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInputUpdates": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "timeoutSeconds": [
                15
            ],
            "sourceHandlerCode": [
                1
            ],
            "handlerName": [
                1
            ],
            "sourceHandlerPath": [
                1
            ],
            "cronTriggerSettings": [
                9
            ],
            "databaseEventTriggerSettings": [
                9
            ],
            "httpRouteTriggerSettings": [
                9
            ],
            "toolTriggerSettings": [
                9
            ],
            "workflowActionTriggerSettings": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "CreateCommandMenuItemInput": {
            "workflowVersionId": [
                3
            ],
            "frontComponentId": [
                3
            ],
            "engineComponentKey": [
                16
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "shortLabel": [
                1
            ],
            "position": [
                15
            ],
            "isPinned": [
                8
            ],
            "availabilityType": [
                17
            ],
            "hotKeys": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "conditionalPinnedExpression": [
                1
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "payload": [
                9
            ],
            "navigationTargetObjectMetadataId": [
                3
            ],
            "pageLayoutId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "id": [
                3
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "shortLabel": [
                1
            ],
            "position": [
                15
            ],
            "isPinned": [
                8
            ],
            "availabilityType": [
                17
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "engineComponentKey": [
                16
            ],
            "hotKeys": [
                1
            ],
            "pageLayoutId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateFrontComponentInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "sourceComponentPath": [
                1
            ],
            "builtComponentPath": [
                1
            ],
            "componentName": [
                1
            ],
            "builtComponentChecksum": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFrontComponentInput": {
            "id": [
                3
            ],
            "update": [
                492
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFrontComponentInputUpdates": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ActivateWorkspaceInput": {
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkspaceInput": {
            "subdomain": [
                1
            ],
            "customDomain": [
                1
            ],
            "displayName": [
                1
            ],
            "logo": [
                1
            ],
            "inviteHash": [
                1
            ],
            "isPublicInviteLinkEnabled": [
                8
            ],
            "workspaceDiscoverability": [
                70
            ],
            "allowImpersonation": [
                8
            ],
            "isGoogleAuthEnabled": [
                8
            ],
            "isMicrosoftAuthEnabled": [
                8
            ],
            "isPasswordAuthEnabled": [
                8
            ],
            "isGoogleAuthBypassEnabled": [
                8
            ],
            "isMicrosoftAuthBypassEnabled": [
                8
            ],
            "isPasswordAuthBypassEnabled": [
                8
            ],
            "defaultRoleId": [
                3
            ],
            "isTwoFactorAuthenticationEnforced": [
                8
            ],
            "trashRetentionDays": [
                15
            ],
            "eventLogRetentionDays": [
                15
            ],
            "aiChatModelTier": [
                72
            ],
            "aiAgentModelTier": [
                72
            ],
            "isAutoModelSelectionEnabled": [
                8
            ],
            "aiModelIdByTier": [
                9
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "isInternalMessagesImportEnabled": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistrationInput": {
            "name": [
                1
            ],
            "universalIdentifier": [
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
        "UpdateApplicationRegistrationInput": {
            "id": [
                1
            ],
            "update": [
                497
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
            "isListed": [
                8
            ],
            "isPreInstalled": [
                8
            ],
            "isVetted": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistrationVariableInput": {
            "applicationRegistrationId": [
                1
            ],
            "key": [
                1
            ],
            "value": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                8
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
                500
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationVariablePayload": {
            "value": [
                1
            ],
            "resetValue": [
                8
            ],
            "description": [
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
        "TriggerUninstallApplicationJobInput": {
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationInput": {
            "autoUpgrade": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneFieldMetadataInput": {
            "field": [
                505
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                250
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                8
            ],
            "isSystem": [
                8
            ],
            "isUIEditable": [
                8
            ],
            "isUIReadOnly": [
                8
            ],
            "isNullable": [
                8
            ],
            "isUnique": [
                8
            ],
            "isSearchable": [
                8
            ],
            "isAuditLogged": [
                8
            ],
            "defaultValue": [
                9
            ],
            "options": [
                9
            ],
            "settings": [
                9
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                8
            ],
            "isRemoteCreation": [
                8
            ],
            "relationCreationPayload": [
                9
            ],
            "morphRelationsCreationPayload": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                3
            ],
            "update": [
                507
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "universalIdentifier": [
                1
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                8
            ],
            "isSystem": [
                8
            ],
            "isUIEditable": [
                8
            ],
            "isUIReadOnly": [
                8
            ],
            "isNullable": [
                8
            ],
            "isUnique": [
                8
            ],
            "isSearchable": [
                8
            ],
            "isAuditLogged": [
                8
            ],
            "defaultValue": [
                9
            ],
            "options": [
                9
            ],
            "settings": [
                9
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                8
            ],
            "morphRelationsUpdatePayload": [
                9
            ],
            "translations": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewGroupInput": {
            "id": [
                3
            ],
            "isVisible": [
                8
            ],
            "fieldValue": [
                1
            ],
            "position": [
                15
            ],
            "viewId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                3
            ],
            "update": [
                511
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                8
            ],
            "fieldValue": [
                1
            ],
            "position": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateRoleInput": {
            "id": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "canUpdateAllSettings": [
                8
            ],
            "canAccessAllTools": [
                8
            ],
            "canReadAllObjectRecords": [
                8
            ],
            "canUpdateAllObjectRecords": [
                8
            ],
            "canSoftDeleteAllObjectRecords": [
                8
            ],
            "canDestroyAllObjectRecords": [
                8
            ],
            "canBeAssignedToUsers": [
                8
            ],
            "canBeAssignedToAgents": [
                8
            ],
            "canBeAssignedToApiKeys": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "update": [
                516
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRolePayload": {
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "canUpdateAllSettings": [
                8
            ],
            "canAccessAllTools": [
                8
            ],
            "canReadAllObjectRecords": [
                8
            ],
            "canUpdateAllObjectRecords": [
                8
            ],
            "canSoftDeleteAllObjectRecords": [
                8
            ],
            "canDestroyAllObjectRecords": [
                8
            ],
            "canBeAssignedToUsers": [
                8
            ],
            "canBeAssignedToAgents": [
                8
            ],
            "canBeAssignedToApiKeys": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "roleId": [
                3
            ],
            "objectPermissions": [
                518
            ],
            "__typename": [
                1
            ]
        },
        "ObjectPermissionInput": {
            "objectMetadataId": [
                3
            ],
            "canReadObjectRecords": [
                8
            ],
            "canUpdateObjectRecords": [
                8
            ],
            "canSoftDeleteObjectRecords": [
                8
            ],
            "canDestroyObjectRecords": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpsertPermissionFlagsInput": {
            "roleId": [
                3
            ],
            "permissionFlagKeys": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldPermissionsInput": {
            "roleId": [
                3
            ],
            "fieldPermissions": [
                521
            ],
            "__typename": [
                1
            ]
        },
        "FieldPermissionInput": {
            "objectMetadataId": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "canReadFieldValue": [
                8
            ],
            "canUpdateFieldValue": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "roleId": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "predicates": [
                523
            ],
            "predicateGroups": [
                524
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                44
            ],
            "value": [
                9
            ],
            "subFieldName": [
                1
            ],
            "workspaceMemberFieldMetadataId": [
                1
            ],
            "workspaceMemberSubFieldName": [
                1
            ],
            "rowLevelPermissionPredicateGroupId": [
                3
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateGroupInput": {
            "id": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                3
            ],
            "logicalOperator": [
                42
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailViaDomainInput": {
            "emailingDomainId": [
                1
            ],
            "to": [
                1
            ],
            "cc": [
                1
            ],
            "bcc": [
                1
            ],
            "subject": [
                1
            ],
            "text": [
                1
            ],
            "html": [
                1
            ],
            "from": [
                1
            ],
            "replyTo": [
                1
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
                4
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
        "SendMessageCampaignTestInput": {
            "toAddress": [
                1
            ],
            "unsubscribeTopicId": [
                1
            ],
            "subject": [
                1
            ],
            "body": [
                1
            ],
            "fromAddress": [
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateUnsubscribeTopicInput": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "UpdateUnsubscribeTopicInput": {
            "id": [
                1
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                3
            ],
            "update": [
                533
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                317
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                319
            ],
            "messageFolderImportPolicy": [
                320
            ],
            "isSyncEnabled": [
                8
            ],
            "excludeNonProfessionalEmails": [
                8
            ],
            "excludeGroupEmails": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelInput": {
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateEmailGroupChannelInput": {
            "id": [
                3
            ],
            "displayName": [
                1
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
        "RunAgentInput": {
            "agentUniversalIdentifier": [
                1
            ],
            "prompt": [
                1
            ],
            "runAsWorkspaceMemberId": [
                3
            ],
            "messages": [
                538
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageInput": {
            "role": [
                539
            ],
            "content": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageRole": {},
        "CreateWebhookInput": {
            "id": [
                3
            ],
            "targetUrl": [
                1
            ],
            "operations": [
                1
            ],
            "description": [
                1
            ],
            "secret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWebhookInput": {
            "id": [
                3
            ],
            "update": [
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWebhookInputUpdates": {
            "targetUrl": [
                1
            ],
            "operations": [
                1
            ],
            "description": [
                1
            ],
            "secret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInput": {
            "id": [
                3
            ],
            "update": [
                544
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFoldersInput": {
            "ids": [
                3
            ],
            "update": [
                544
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInput": {
            "id": [
                3
            ],
            "update": [
                547
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                383
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                384
            ],
            "isSyncEnabled": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "SetAppKeyValueInput": {
            "key": [
                1
            ],
            "value": [
                9
            ],
            "scope": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobInput": {
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payload": [
                9
            ],
            "jobId": [
                1
            ],
            "retryLimit": [
                28
            ],
            "delayMs": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobsInput": {
            "logicFunctionUniversalIdentifier": [
                1
            ],
            "payloads": [
                9
            ],
            "jobs": [
                551
            ],
            "retryLimit": [
                28
            ],
            "delayMs": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobItemInput": {
            "payload": [
                9
            ],
            "jobId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ReportAppConnectionAuthFailureInput": {
            "id": [
                228
            ],
            "reason": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FileAttachmentInput": {
            "id": [
                3
            ],
            "filename": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatQuestionAnswerInput": {
            "questionIndex": [
                28
            ],
            "selectedOptionIndices": [
                28
            ],
            "freeText": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateSkillInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "content": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateSkillInput": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "description": [
                1
            ],
            "content": [
                1
            ],
            "isActive": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpdateTimelineActivityTypeInput": {
            "id": [
                3
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "isActive": [
                8
            ],
            "translations": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSOInput": {
            "identityProviderId": [
                3
            ],
            "workspaceInviteHash": [
                1
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
        "UpdateWorkspaceMemberSettingsInput": {
            "workspaceMemberId": [
                3
            ],
            "update": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "SetupOIDCSsoInput": {
            "name": [
                1
            ],
            "issuer": [
                1
            ],
            "clientID": [
                1
            ],
            "clientSecret": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SetupSAMLSsoInput": {
            "name": [
                1
            ],
            "issuer": [
                1
            ],
            "id": [
                3
            ],
            "ssoURL": [
                1
            ],
            "certificate": [
                1
            ],
            "fingerprint": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoInput": {
            "identityProviderId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                3
            ],
            "status": [
                203
            ],
            "__typename": [
                1
            ]
        },
        "AnalyticsType": {},
        "CreateCalendarEventInput": {
            "connectedAccountId": [
                1
            ],
            "title": [
                1
            ],
            "description": [
                1
            ],
            "location": [
                1
            ],
            "startsAt": [
                1
            ],
            "endsAt": [
                1
            ],
            "isFullDay": [
                8
            ],
            "timeZone": [
                1
            ],
            "attendees": [
                1
            ],
            "sendInvitations": [
                8
            ],
            "addConferencing": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailInput": {
            "connectedAccountId": [
                1
            ],
            "fromHandle": [
                1
            ],
            "to": [
                1
            ],
            "cc": [
                1
            ],
            "bcc": [
                1
            ],
            "subject": [
                1
            ],
            "body": [
                1
            ],
            "inReplyTo": [
                1
            ],
            "draftMessageId": [
                1
            ],
            "files": [
                568
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
        "EmailAccountConnectionParameters": {
            "name": [
                1
            ],
            "IMAP": [
                570
            ],
            "SMTP": [
                570
            ],
            "CALDAV": [
                570
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionParametersInput": {
            "host": [
                1
            ],
            "port": [
                15
            ],
            "username": [
                1
            ],
            "password": [
                1
            ],
            "connectionSecurity": [
                191
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
                8
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationFileUploadRequestInput": {
            "fileFolder": [
                305
            ],
            "filePath": [
                1
            ],
            "size": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "onEventSubscription": [
                164,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                271,
                {
                    "input": [
                        574,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                370,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                359,
                {
                    "table": [
                        409,
                        "EventLogTable!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionLogsInput": {
            "applicationId": [
                3
            ],
            "applicationUniversalIdentifier": [
                3
            ],
            "name": [
                1
            ],
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "__typename": [
                1
            ]
        }
    }
}