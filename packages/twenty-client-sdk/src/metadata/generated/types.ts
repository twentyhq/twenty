export default {
    "scalars": [
        1,
        3,
        4,
        6,
        8,
        9,
        10,
        16,
        17,
        18,
        23,
        25,
        27,
        28,
        29,
        30,
        32,
        33,
        40,
        41,
        42,
        43,
        46,
        48,
        56,
        58,
        60,
        62,
        65,
        68,
        69,
        70,
        71,
        72,
        74,
        75,
        76,
        78,
        79,
        84,
        85,
        86,
        88,
        96,
        105,
        108,
        110,
        114,
        115,
        118,
        119,
        121,
        124,
        125,
        137,
        152,
        156,
        169,
        170,
        173,
        176,
        183,
        186,
        187,
        188,
        189,
        192,
        195,
        198,
        200,
        210,
        215,
        222,
        223,
        230,
        235,
        238,
        261,
        271,
        272,
        274,
        279,
        282,
        291,
        324,
        331,
        337,
        338,
        339,
        341,
        342,
        343,
        344,
        345,
        346,
        347,
        357,
        358,
        361,
        396,
        404,
        409,
        411,
        412,
        413,
        414,
        416,
        418,
        425,
        443,
        447,
        458,
        532,
        550,
        613
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
                83
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
                52
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
            "isRequired": [
                8
            ],
            "type": [
                1
            ],
            "options": [
                9
            ],
            "scope": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "JSON": {},
        "ApplicationVariableScope": {},
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
            "isSystem": [
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
            "triggers": [
                9
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
                12
            ],
            "applicationRefreshToken": [
                12
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
                13
            ],
            "applicationVariables": [
                9
            ],
            "frontComponentSharedDependenciesChecksum": [
                1
            ],
            "applicationName": [
                1
            ],
            "applicationGrantedCapabilities": [
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
            "coreWorkflowVersionId": [
                3
            ],
            "frontComponentId": [
                3
            ],
            "frontComponent": [
                14
            ],
            "engineComponentKey": [
                17
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
                16
            ],
            "isPinned": [
                8
            ],
            "availabilityType": [
                18
            ],
            "payload": [
                19
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
                20
            ],
            "on_ObjectMetadataCommandMenuItemPayload": [
                21
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
        "SettingsMenuItem": {
            "id": [
                3
            ],
            "frontComponentId": [
                3
            ],
            "title": [
                1
            ],
            "icon": [
                1
            ],
            "position": [
                16
            ],
            "scope": [
                23
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
            "__typename": [
                1
            ]
        },
        "SettingsMenuItemScope": {},
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
                16
            ],
            "executionMode": [
                25
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
            "canRunOnDemand": [
                8
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
                27
            ],
            "readability": [
                28
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                3
            ],
            "sharingReach": [
                29
            ],
            "writability": [
                30
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
                286,
                {
                    "paging": [
                        31,
                        "CursorPaging!"
                    ],
                    "filter": [
                        34,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                287,
                {
                    "paging": [
                        31,
                        "CursorPaging!"
                    ],
                    "filter": [
                        37,
                        "IndexFilter!"
                    ]
                }
            ],
            "fieldsList": [
                273
            ],
            "indexMetadataList": [
                281
            ],
            "searchFieldMetadataList": [
                289
            ],
            "__typename": [
                1
            ]
        },
        "ObjectOpenRecordIn": {},
        "MetadataReadability": {},
        "ObjectSharingReach": {},
        "MetadataWritability": {},
        "CursorPaging": {
            "before": [
                33
            ],
            "after": [
                33
            ],
            "first": [
                32
            ],
            "last": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                34
            ],
            "or": [
                34
            ],
            "id": [
                35
            ],
            "isActive": [
                36
            ],
            "isSystem": [
                36
            ],
            "isUIEditable": [
                36
            ],
            "isUIReadOnly": [
                36
            ],
            "objectMetadataId": [
                35
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
                37
            ],
            "or": [
                37
            ],
            "id": [
                35
            ],
            "isCustom": [
                36
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
                38
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
                40
            ],
            "avatarUrl": [
                1
            ],
            "locale": [
                1
            ],
            "calendarStartDay": [
                32
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                41
            ],
            "timeFormat": [
                42
            ],
            "roles": [
                52
            ],
            "userId": [
                3
            ],
            "userWorkspaceId": [
                3
            ],
            "numberFormat": [
                43
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
                46
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                16
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
                48
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
                16
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
                47
            ],
            "rowLevelPermissionPredicateGroups": [
                45
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
                39
            ],
            "agents": [
                11
            ],
            "apiKeys": [
                51
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
                50
            ],
            "objectPermissions": [
                49
            ],
            "fieldPermissions": [
                44
            ],
            "rowLevelPermissionPredicates": [
                47
            ],
            "rowLevelPermissionPredicateGroups": [
                45
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
            "healthCheckLogicFunctionId": [
                3
            ],
            "defaultLogicFunctionRole": [
                52
            ],
            "agents": [
                11
            ],
            "frontComponents": [
                14
            ],
            "commandMenuItems": [
                15
            ],
            "settingsMenuItems": [
                22
            ],
            "logicFunctions": [
                24
            ],
            "objects": [
                26
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
                77
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
                56
            ],
            "objectPermissions": [
                49
            ],
            "objectsPermissions": [
                49
            ],
            "twoFactorAuthenticationMethodSummary": [
                54
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
                16
            ],
            "position": [
                16
            ],
            "aggregateOperation": [
                58
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
                60
            ],
            "positionInViewFilterGroup": [
                16
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
                62
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                16
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
                16
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
                65
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
                16
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
                57
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
                68
            ],
            "key": [
                69
            ],
            "icon": [
                1
            ],
            "position": [
                16
            ],
            "isCompact": [
                8
            ],
            "isCustom": [
                8
            ],
            "openRecordIn": [
                70
            ],
            "kanbanAggregateOperation": [
                58
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
                32
            ],
            "groupLoadLimit": [
                32
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
                71
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
                57
            ],
            "viewFilters": [
                61
            ],
            "viewFilterGroups": [
                59
            ],
            "viewSorts": [
                64
            ],
            "viewGroups": [
                63
            ],
            "viewFieldGroups": [
                66
            ],
            "visibility": [
                72
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
            "isCampaignClickTrackingEnabled": [
                8
            ],
            "isCampaignOpenTrackingEnabled": [
                8
            ],
            "workspaceDiscoverability": [
                74
            ],
            "trashRetentionDays": [
                16
            ],
            "eventLogRetentionDays": [
                16
            ],
            "workspaceMembersCount": [
                16
            ],
            "activationStatus": [
                75
            ],
            "views": [
                67
            ],
            "viewFields": [
                57
            ],
            "viewFilters": [
                61
            ],
            "viewFilterGroups": [
                59
            ],
            "viewGroups": [
                63
            ],
            "viewSorts": [
                64
            ],
            "metadataVersion": [
                16
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
            "allowedIframeOrigins": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                52
            ],
            "aiChatModelTier": [
                76
            ],
            "aiAgentModelTier": [
                76
            ],
            "isAutoModelSelectionEnabled": [
                8
            ],
            "aiModelIdByTier": [
                9
            ],
            "aiEvaluationModelId": [
                1
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "workspaceCustomApplication": [
                53
            ],
            "featureFlags": [
                214
            ],
            "billingSubscriptions": [
                95
            ],
            "installedApplications": [
                53
            ],
            "currentBillingSubscription": [
                95
            ],
            "billingCustomer": [
                97
            ],
            "billingEntitlements": [
                290
            ],
            "hasValidSignedEnterpriseKey": [
                8
            ],
            "hasValidEnterpriseValidityToken": [
                8
            ],
            "workspaceUrls": [
                216
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
                39
            ],
            "userWorkspaces": [
                55
            ],
            "onboardingStatus": [
                78
            ],
            "previousOnboardingStatus": [
                78
            ],
            "currentWorkspace": [
                73
            ],
            "currentUserWorkspace": [
                55
            ],
            "userVars": [
                79
            ],
            "workspaceMembers": [
                39
            ],
            "deletedWorkspaceMembers": [
                258
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
                55
            ],
            "availableWorkspaces": [
                257
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
        "BillingSubscriptionSchedulePhaseItem": {
            "price": [
                1
            ],
            "quantity": [
                16
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "start_date": [
                16
            ],
            "end_date": [
                16
            ],
            "items": [
                81
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                84
            ],
            "priceUsageBased": [
                85
            ],
            "productKey": [
                86
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
                88
            ],
            "unitAmount": [
                16
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                85
            ],
            "creditAmount": [
                16
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
                16
            ],
            "flatAmount": [
                16
            ],
            "unitAmount": [
                16
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "tiers": [
                89
            ],
            "recurringInterval": [
                88
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                85
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
                83
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
                83
            ],
            "prices": [
                87
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
                83
            ],
            "prices": [
                90
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
                16
            ],
            "stripePriceId": [
                1
            ],
            "unitAmount": [
                16
            ],
            "creditAmount": [
                16
            ],
            "billingProduct": [
                0
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
                96
            ],
            "interval": [
                88
            ],
            "billingSubscriptionItems": [
                94
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                9
            ],
            "phases": [
                82
            ],
            "cancelAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
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
                16
            ],
            "column": [
                16
            ],
            "rowSpan": [
                16
            ],
            "columnSpan": [
                16
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
                105
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                103
            ],
            "position": [
                106
            ],
            "configuration": [
                112
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
                107
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                109
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                108
            ],
            "row": [
                32
            ],
            "column": [
                32
            ],
            "rowSpan": [
                32
            ],
            "columnSpan": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                108
            ],
            "index": [
                32
            ],
            "heightBehavior": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                108
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                113
            ],
            "on_StandaloneRichTextConfiguration": [
                116
            ],
            "on_PieChartConfiguration": [
                117
            ],
            "on_LineChartConfiguration": [
                120
            ],
            "on_IframeConfiguration": [
                122
            ],
            "on_BarChartConfiguration": [
                123
            ],
            "on_CalendarConfiguration": [
                126
            ],
            "on_FrontComponentConfiguration": [
                127
            ],
            "on_EmailsConfiguration": [
                128
            ],
            "on_EmailThreadConfiguration": [
                129
            ],
            "on_CallRecordingSummaryConfiguration": [
                130
            ],
            "on_CallRecordingTranscriptConfiguration": [
                131
            ],
            "on_ChatThreadsConfiguration": [
                132
            ],
            "on_ChatConfiguration": [
                133
            ],
            "on_MessageCampaignBodyConfiguration": [
                134
            ],
            "on_MessageCampaignDetailsConfiguration": [
                135
            ],
            "on_FieldConfiguration": [
                136
            ],
            "on_FieldRichTextConfiguration": [
                138
            ],
            "on_FieldsConfiguration": [
                139
            ],
            "on_FormFieldConfiguration": [
                140
            ],
            "on_FilesConfiguration": [
                141
            ],
            "on_NotesConfiguration": [
                142
            ],
            "on_TasksConfiguration": [
                143
            ],
            "on_TimelineConfiguration": [
                144
            ],
            "on_ViewConfiguration": [
                145
            ],
            "on_RecordTableConfiguration": [
                146
            ],
            "on_WorkflowConfiguration": [
                147
            ],
            "on_WorkflowRunConfiguration": [
                148
            ],
            "on_WorkflowVersionConfiguration": [
                149
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                114
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                58
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                8
            ],
            "numberFormat": [
                115
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
                32
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                101
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "ChartNumberFormat": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                114
            ],
            "body": [
                102
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                114
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                58
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                118
            ],
            "orderBy": [
                119
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
                115
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
                32
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                114
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                58
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                118
            ],
            "primaryAxisOrderBy": [
                119
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
                118
            ],
            "secondaryAxisOrderBy": [
                119
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
                121
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                115
            ],
            "rangeMin": [
                16
            ],
            "rangeMax": [
                16
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
                32
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                114
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
                114
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                58
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                118
            ],
            "primaryAxisOrderBy": [
                119
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
                118
            ],
            "secondaryAxisOrderBy": [
                119
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
                121
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                115
            ],
            "rangeMin": [
                16
            ],
            "rangeMax": [
                16
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
                124
            ],
            "layout": [
                125
            ],
            "isCumulative": [
                8
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                114
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
                114
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "ChatThreadsConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "ChatConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                114
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                137
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
                114
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                114
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
                114
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
                114
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                114
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                32
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
                114
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                114
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                114
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
                16
            ],
            "pageLayoutId": [
                3
            ],
            "widgets": [
                104
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                108
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
                152
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                150
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
                153
            ],
            "logoUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionResult": {
            "data": [
                9
            ],
            "logs": [
                1
            ],
            "duration": [
                16
            ],
            "status": [
                156
            ],
            "error": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
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
                96
            ],
            "hasPaymentMethod": [
                8
            ],
            "billingPortalUrl": [
                1
            ],
            "currentBillingSubscription": [
                95
            ],
            "billingSubscriptions": [
                95
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                86
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "usedCredits": [
                16
            ],
            "grantedCredits": [
                16
            ],
            "rolloverCredits": [
                16
            ],
            "totalGrantedCredits": [
                16
            ],
            "unitPriceCents": [
                16
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlan": {
            "planKey": [
                84
            ],
            "baseProducts": [
                92
            ],
            "resourceCreditProducts": [
                92
            ],
            "meteredProducts": [
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
                95
            ],
            "billingSubscriptions": [
                95
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
                16
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
                16
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
                165
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                164
            ],
            "usageByOperationType": [
                164
            ],
            "usageByApplication": [
                164
            ],
            "usageByModel": [
                164
            ],
            "timeSeries": [
                165
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userDailyUsage": [
                166
            ],
            "__typename": [
                1
            ]
        },
        "UsageLimitOperationDefinition": {
            "operationType": [
                169
            ],
            "allowedUnits": [
                170
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "UsageUnit": {},
        "UsageQuotaOperatorOnlyScope": {
            "operationType": [
                169
            ],
            "spenderType": [
                1
            ],
            "unit": [
                170
            ],
            "periodUnit": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaDefinition": {
            "resourceType": [
                173
            ],
            "limitKind": [
                1
            ],
            "allowedOperations": [
                168
            ],
            "allowedSpenderTypes": [
                1
            ],
            "operatorOnlyScopes": [
                171
            ],
            "__typename": [
                1
            ]
        },
        "UsageResourceType": {},
        "UsageQuotaDefinitions": {
            "definitions": [
                172
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
                173
            ],
            "operationType": [
                169
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
            "unit": [
                170
            ],
            "limitValue": [
                176
            ],
            "isEnforced": [
                8
            ],
            "consumedValue": [
                176
            ],
            "remainingValue": [
                176
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
                176
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
                173
            ],
            "operationType": [
                169
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
                32
            ],
            "periodUnit": [
                1
            ],
            "unit": [
                170
            ],
            "limitValue": [
                176
            ],
            "burstValue": [
                176
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
        "FileWithSignedUrl": {
            "id": [
                3
            ],
            "path": [
                1
            ],
            "size": [
                16
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
                183
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
                16
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
                181
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "RecordPermissionsDTO": {
            "canRead": [
                8
            ],
            "canUpdate": [
                8
            ],
            "canDelete": [
                8
            ],
            "canSoftDelete": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingGrantDTO": {
            "id": [
                186
            ],
            "principalType": [
                187
            ],
            "principalId": [
                3
            ],
            "principalRoleId": [
                3
            ],
            "accessLevel": [
                188
            ],
            "rowCause": [
                189
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "RecordSharePrincipalType": {},
        "RecordShareAccessLevel": {},
        "RecordShareRowCause": {},
        "RecordSharingRoleDTO": {
            "id": [
                3
            ],
            "label": [
                1
            ],
            "canRead": [
                8
            ],
            "canUpdate": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingDTO": {
            "sharingMode": [
                192
            ],
            "canManageSharing": [
                8
            ],
            "permissions": [
                184
            ],
            "generalAccessLevel": [
                188
            ],
            "defaultGeneralAccessLevel": [
                188
            ],
            "hasManagedGeneralAccess": [
                8
            ],
            "roles": [
                190
            ],
            "shares": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingMode": {},
        "RecordPermissionsResult": {
            "objectMetadataId": [
                3
            ],
            "recordId": [
                3
            ],
            "permissions": [
                184
            ],
            "__typename": [
                1
            ]
        },
        "JobStatus": {
            "jobId": [
                1
            ],
            "state": [
                195
            ],
            "attemptsMade": [
                32
            ],
            "failedReason": [
                1
            ],
            "progress": [
                32
            ],
            "enqueuedAt": [
                16
            ],
            "startedAt": [
                16
            ],
            "finishedAt": [
                16
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
                198
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                196
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
                200
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
                196
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
                199
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
                201
            ],
            "metadataEvents": [
                197
            ],
            "queueJobEvents": [
                194
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
                78
            ],
            "previousOnboardingStatus": [
                78
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
                207
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
                16
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                209
            ],
            "SMTP": [
                209
            ],
            "CALDAV": [
                209
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
                211
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectedAccountDTO": {
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
                211
            ],
            "isOwnedByCurrentUser": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                215
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
                32
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                32
            ],
            "suspendedInstalls": [
                32
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                218
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                16
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
                222
            ],
            "status": [
                223
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
                221
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
                224
            ],
            "authBypassProviders": [
                225
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                216
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
                230
            ],
            "modelFamilyLabel": [
                1
            ],
            "sdkPackage": [
                1
            ],
            "inputCostPerMillionTokens": [
                16
            ],
            "outputCostPerMillionTokens": [
                16
            ],
            "nativeCapabilities": [
                228
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
                16
            ],
            "maxOutputTokens": [
                16
            ],
            "dataResidency": [
                1
            ],
            "intelligenceIndex": [
                16
            ],
            "outputTokensPerSecond": [
                16
            ],
            "costPerTask": [
                16
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
        "ClientAiEvaluationModelConfig": {
            "modelId": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "providerLabel": [
                1
            ],
            "isAvailable": [
                8
            ],
            "supportedQuestionTypes": [
                1
            ],
            "maxCriteriaPerQuestion": [
                16
            ],
            "maxScoreLevels": [
                16
            ],
            "medianLatencyMs": [
                16
            ],
            "inputCostPerMillionTokens": [
                16
            ],
            "outputCostPerMillionTokens": [
                16
            ],
            "isDeprecated": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "ClientAiModelTierConfig": {
            "tier": [
                76
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
                220
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                235
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
                16
            ],
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                238
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
                16
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
                215
            ],
            "metadata": [
                240
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
                224
            ],
            "billing": [
                233
            ],
            "aiModels": [
                229
            ],
            "aiEvaluationModels": [
                231
            ],
            "aiModelTiers": [
                232
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
                234
            ],
            "isAttachmentPreviewEnabled": [
                8
            ],
            "sentry": [
                236
            ],
            "captcha": [
                237
            ],
            "api": [
                239
            ],
            "canManageFeatureFlags": [
                8
            ],
            "publicFeatureFlags": [
                241
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
                242
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
                80
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
                186
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
                222
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                223
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
                222
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
                223
            ],
            "workspace": [
                252
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
                222
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                223
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                222
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
                223
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
                216
            ],
            "logo": [
                1
            ],
            "sso": [
                255
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                256
            ],
            "availableWorkspacesForSignUp": [
                256
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
                38
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
            "status": [
                261
            ],
            "title": [
                1
            ],
            "description": [
                1
            ],
            "action": [
                259
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationHealthStatus": {},
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
                263
            ],
            "fieldPermissions": [
                264
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
            "installCount": [
                32
            ],
            "defaultRoleUniversalIdentifier": [
                1
            ],
            "roles": [
                265
            ],
            "requestedCapabilities": [
                1
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
        "ApplicationCapabilityGrant": {
            "id": [
                3
            ],
            "grantedCapabilities": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentResult": {
            "outcome": [
                271
            ],
            "enrichment": [
                9
            ],
            "personOutcome": [
                272
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
                274
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
                30
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
                26
            ],
            "relation": [
                278
            ],
            "morphRelations": [
                278
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
                33
            ],
            "endCursor": [
                33
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                273
            ],
            "cursor": [
                33
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                275
            ],
            "edges": [
                276
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                279
            ],
            "sourceObjectMetadata": [
                26
            ],
            "targetObjectMetadata": [
                26
            ],
            "sourceFieldMetadata": [
                273
            ],
            "targetFieldMetadata": [
                273
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
                16
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
                282
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                280
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IndexEdge": {
            "node": [
                281
            ],
            "cursor": [
                33
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                26
            ],
            "cursor": [
                33
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                275
            ],
            "edges": [
                284
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                275
            ],
            "edges": [
                276
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                275
            ],
            "edges": [
                283
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
                32
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
                16
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
                291
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
                292
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
                47
            ],
            "predicateGroups": [
                45
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
                3
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
                12
            ],
            "refreshToken": [
                12
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "tokens": [
                300
            ],
            "availableWorkspaces": [
                257
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
                216
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
                12
            ],
            "workspace": [
                305
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                12
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
                12
            ],
            "workspaceUrls": [
                216
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
                300
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                12
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
                16
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
                12
            ],
            "workspace": [
                305
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
        "File": {
            "id": [
                3
            ],
            "path": [
                1
            ],
            "size": [
                16
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
                320
            ],
            "errors": [
                321
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
                324
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
                324
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
                323
            ],
            "errors": [
                325
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
                331
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
                329
            ],
            "manifest": [
                9
            ],
            "coverage": [
                330
            ],
            "files": [
                332
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
                16
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
                337
            ],
            "tenantStatus": [
                338
            ],
            "unsubscribeHostnameStatus": [
                339
            ],
            "verificationRecords": [
                335
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
                341
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "type": [
                342
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                343
            ],
            "messageFolderImportPolicy": [
                344
            ],
            "excludeNonProfessionalEmails": [
                8
            ],
            "excludeGroupEmails": [
                8
            ],
            "pendingGroupEmailsAction": [
                345
            ],
            "isSyncEnabled": [
                8
            ],
            "syncedAt": [
                4
            ],
            "syncStatus": [
                346
            ],
            "syncStage": [
                347
            ],
            "syncStageStartedAt": [
                4
            ],
            "throttleFailureCount": [
                16
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
                212
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
        "IngestedAppMessage": {
            "externalId": [
                1
            ],
            "messageId": [
                3
            ],
            "messageThreadId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesOutput": {
            "messages": [
                348
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelOutput": {
            "messageChannel": [
                340
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
                32
            ],
            "withoutEmail": [
                32
            ],
            "duplicateEmails": [
                32
            ],
            "hardSuppressed": [
                32
            ],
            "globallyUnsubscribed": [
                32
            ],
            "topicUnsubscribed": [
                32
            ],
            "trackingRefused": [
                32
            ],
            "sendable": [
                32
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
                32
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
                32
            ],
            "audience": [
                351
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
                16
            ],
            "memberCount": [
                16
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
                357
            ],
            "source": [
                358
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
                356
            ],
            "totalCount": [
                32
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
                361
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
                16
            ],
            "lng": [
                16
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
                363
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
                16
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                210
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
                365
            ],
            "SMTP": [
                365
            ],
            "CALDAV": [
                365
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
                366
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
            "widgetName": [
                1
            ],
            "frontComponentId": [
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
                32
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
            "senderUserWorkspaceId": [
                3
            ],
            "role": [
                1
            ],
            "status": [
                1
            ],
            "parts": [
                371
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
            "threadId": [
                3
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
                376
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
                125
            ],
            "groupMode": [
                124
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
                16
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
                378
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                379
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
                16
            ],
            "__typename": [
                1
            ]
        },
        "PieChartData": {
            "data": [
                381
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
                16
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
        "AiChatUsage": {
            "limitValue": [
                176
            ],
            "consumedValue": [
                176
            ],
            "periodEnd": [
                4
            ],
            "kind": [
                1
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
        "AgentChatThread": {
            "id": [
                186
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                32
            ],
            "totalInputTokens": [
                32
            ],
            "totalOutputTokens": [
                32
            ],
            "contextWindowTokens": [
                32
            ],
            "conversationSize": [
                32
            ],
            "totalInputCredits": [
                16
            ],
            "totalOutputCredits": [
                16
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
        "AiSystemPromptSection": {
            "title": [
                1
            ],
            "content": [
                1
            ],
            "estimatedTokenCount": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                387
            ],
            "estimatedTokenCount": [
                32
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
                32
            ],
            "error": [
                389
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
            "mentionedParticipantWorkspaceMemberIds": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThreadParticipant": {
            "id": [
                3
            ],
            "threadId": [
                3
            ],
            "lastReadAt": [
                4
            ],
            "archivedAt": [
                4
            ],
            "snoozedUntil": [
                4
            ],
            "isSubscribed": [
                8
            ],
            "lastMentionedAt": [
                4
            ],
            "updatedAt": [
                4
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
        "SendInboxMessageResult": {
            "threadId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                396
            ],
            "thread": [
                386
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceSetupChatOutcome": {},
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
                399
            ],
            "totalCount": [
                32
            ],
            "pageInfo": [
                400
            ],
            "__typename": [
                1
            ]
        },
        "RecordExport": {
            "id": [
                3
            ],
            "filename": [
                1
            ],
            "progress": [
                32
            ],
            "errorMessage": [
                1
            ],
            "downloadPath": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AgentRun": {
            "id": [
                3
            ],
            "threadId": [
                3
            ],
            "threadTitle": [
                1
            ],
            "status": [
                404
            ],
            "errorMessage": [
                1
            ],
            "createdAt": [
                4
            ],
            "startedAt": [
                4
            ],
            "endedAt": [
                4
            ],
            "modelId": [
                1
            ],
            "inputTokens": [
                32
            ],
            "outputTokens": [
                32
            ],
            "credits": [
                16
            ],
            "creatorSource": [
                1
            ],
            "creatorName": [
                1
            ],
            "input": [
                1
            ],
            "reply": [
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
        "WorkspaceAiStats": {
            "conversationsCount": [
                32
            ],
            "skillsCount": [
                32
            ],
            "toolsCount": [
                32
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
                32
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
                409
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
                411
            ],
            "syncStage": [
                412
            ],
            "visibility": [
                413
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                414
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
                16
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
                416
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
                418
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
                419
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
                420
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
        "ValidationRule": {
            "id": [
                3
            ],
            "objectMetadataId": [
                3
            ],
            "errorFieldMetadataId": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "expression": [
                1
            ],
            "message": [
                1
            ],
            "isActive": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlag": {
            "id": [
                3
            ],
            "universalIdentifier": [
                3
            ],
            "key": [
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
            "permissionType": [
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
            "__typename": [
                1
            ]
        },
        "CollectionHash": {
            "collectionName": [
                425
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
                68
            ],
            "key": [
                69
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
                426
            ],
            "views": [
                427
            ],
            "collectionHashes": [
                424
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "recordSharing": [
                191,
                {
                    "target": [
                        430,
                        "RecordTargetInput!"
                    ]
                }
            ],
            "recordPermissions": [
                193,
                {
                    "targets": [
                        430,
                        "[RecordTargetInput!]!"
                    ]
                }
            ],
            "navigationMenuItems": [
                182
            ],
            "navigationMenuItem": [
                182,
                {
                    "id": [
                        3,
                        "UUID!"
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
                99
            ],
            "applicationSdkClientChecksums": [
                100,
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
            "usageLimits": [
                178
            ],
            "usageQuotasWithConsumption": [
                175
            ],
            "usageQuotaDefinitions": [
                174
            ],
            "usageQuotaScopeConsumption": [
                177,
                {
                    "input": [
                        431,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                167,
                {
                    "input": [
                        432
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                104,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                104,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                150,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                150,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                151,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        152
                    ]
                }
            ],
            "getPageLayout": [
                151,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                67,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        68,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                67,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                64,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                64,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                61,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                57,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                66,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                66,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilterGroups": [
                59,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                59,
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
                52
            ],
            "apiKey": [
                2,
                {
                    "input": [
                        433,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "currentUserSessions": [
                157
            ],
            "billingPortalSession": [
                162,
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
                160
            ],
            "getResourceCreditUsage": [
                159
            ],
            "myConnectedAccounts": [
                212
            ],
            "applicationConnectedAccounts": [
                213,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                154,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getInviteSuggestions": [
                204
            ],
            "findWorkspaceInvitations": [
                207
            ],
            "getApprovedAccessDomains": [
                203
            ],
            "findManyAgents": [
                11
            ],
            "findOneAgent": [
                11,
                {
                    "input": [
                        434,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                24,
                {
                    "input": [
                        435,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                24
            ],
            "getAvailablePackages": [
                9,
                {
                    "input": [
                        435,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        435,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "commandMenuItems": [
                15
            ],
            "commandMenuItem": [
                15,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                14
            ],
            "frontComponent": [
                14,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                285,
                {
                    "paging": [
                        31,
                        "CursorPaging!"
                    ],
                    "filter": [
                        436,
                        "ObjectFilter!"
                    ]
                }
            ],
            "object": [
                26,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                288
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
            "getToolIndex": [
                370
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
            "previewMessageCampaignAudience": [
                351,
                {
                    "input": [
                        437,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "messageSuppressions": [
                359,
                {
                    "input": [
                        438,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                360
            ],
            "myMessageChannels": [
                340,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "appMessageChannels": [
                340,
                {
                    "filter": [
                        439
                    ]
                }
            ],
            "getEmailingDomains": [
                336
            ],
            "getRoles": [
                52
            ],
            "getRole": [
                52,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "webhooks": [
                369
            ],
            "webhook": [
                369,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                277,
                {
                    "paging": [
                        31,
                        "CursorPaging!"
                    ],
                    "filter": [
                        34,
                        "FieldFilter!"
                    ]
                }
            ],
            "field": [
                273,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getViewGroups": [
                63,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                63,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "myMessageFolders": [
                415,
                {
                    "messageChannelId": [
                        3
                    ]
                }
            ],
            "myCalendarChannels": [
                410,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "getPermissionFlags": [
                423
            ],
            "minimalMetadata": [
                428
            ],
            "appKeyValue": [
                408,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        409
                    ]
                }
            ],
            "getJobs": [
                194,
                {
                    "jobIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "appConnections": [
                248,
                {
                    "filter": [
                        440
                    ]
                }
            ],
            "appConnection": [
                248,
                {
                    "id": [
                        186,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                405
            ],
            "aiChatUsage": [
                384
            ],
            "chatThread": [
                386,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                372,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                390,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                388
            ],
            "skills": [
                385
            ],
            "skill": [
                385,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentRuns": [
                403,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ],
                    "limit": [
                        32,
                        "Int!"
                    ]
                }
            ],
            "validationRules": [
                422,
                {
                    "objectMetadataId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "timelineActivityTypes": [
                421
            ],
            "metadataTranslations": [
                417,
                {
                    "input": [
                        441,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "checkUserExists": [
                315,
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
                316,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                73,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                310,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                311
            ],
            "validatePasswordResetToken": [
                308,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                246,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                80,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                80
            ],
            "findOneApplicationRegistration": [
                80,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                219,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                217,
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
                244,
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
            "currentUser": [
                77
            ],
            "currentWorkspace": [
                73
            ],
            "getPublicWorkspaceDataByDomain": [
                226,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                227,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "findManyApplications": [
                53
            ],
            "findOneApplication": [
                53,
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
                194,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                194,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                262,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                266,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                262,
                {
                    "isVetted": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                266,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getSSOIdentityProviders": [
                253
            ],
            "eventLogs": [
                401,
                {
                    "input": [
                        442,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                382,
                {
                    "input": [
                        448,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                380,
                {
                    "input": [
                        449,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                377,
                {
                    "input": [
                        450,
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
                367,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                362,
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
                364,
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
                334
            ],
            "exportApplication": [
                333,
                {
                    "universalIdentifier": [
                        3,
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
            "currentUserApplicationAuthorizations": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "RecordTargetInput": {
            "objectMetadataId": [
                3
            ],
            "recordId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UsageQuotaScopeInput": {
            "resourceType": [
                173
            ],
            "operationType": [
                169
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
            "unit": [
                170
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
                169
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
        "LogicFunctionIdInput": {
            "id": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                436
            ],
            "or": [
                436
            ],
            "id": [
                35
            ],
            "universalIdentifier": [
                35
            ],
            "isActive": [
                36
            ],
            "isRemote": [
                36
            ],
            "isSearchable": [
                36
            ],
            "isSystem": [
                36
            ],
            "isUICreatable": [
                36
            ],
            "isUIEditable": [
                36
            ],
            "isUIReadOnly": [
                36
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
                357
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                3
            ],
            "limit": [
                32
            ],
            "offset": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "ListAppMessageChannelsInput": {
            "connectedAccountId": [
                3
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
                443
            ],
            "filters": [
                444
            ],
            "first": [
                32
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
                445
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "fieldFilters": [
                446
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
        "EventLogFieldFilterInput": {
            "field": [
                1
            ],
            "operand": [
                447
            ],
            "values": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EventLogFilterOperand": {},
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
                        452,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                8,
                {
                    "input": [
                        453,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "setRecordGeneralAccess": [
                191,
                {
                    "target": [
                        430,
                        "RecordTargetInput!"
                    ],
                    "accessLevel": [
                        188,
                        "RecordShareAccessLevel!"
                    ]
                }
            ],
            "setRecordShare": [
                191,
                {
                    "target": [
                        430,
                        "RecordTargetInput!"
                    ],
                    "principal": [
                        454,
                        "RecordSharePrincipalInput!"
                    ],
                    "accessLevel": [
                        188,
                        "RecordShareAccessLevel!"
                    ]
                }
            ],
            "removeRecordShare": [
                191,
                {
                    "target": [
                        430,
                        "RecordTargetInput!"
                    ],
                    "principal": [
                        454,
                        "RecordSharePrincipalInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                182,
                {
                    "inputs": [
                        455,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                182,
                {
                    "input": [
                        455,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                182,
                {
                    "inputs": [
                        456,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                182,
                {
                    "input": [
                        456,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                182,
                {
                    "ids": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                182,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                180,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        16,
                        "Float!"
                    ],
                    "fileFolder": [
                        324,
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
                179,
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
                98
            ],
            "setEnterpriseKey": [
                98,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                179,
                {
                    "file": [
                        458,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                179,
                {
                    "file": [
                        458,
                        "Upload!"
                    ]
                }
            ],
            "completeWorkspaceLogoUpload": [
                179,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                179,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                179,
                {
                    "file": [
                        458,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createUsageLimit": [
                178,
                {
                    "input": [
                        459,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                178,
                {
                    "input": [
                        460,
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
            "createPageLayoutWidget": [
                104,
                {
                    "input": [
                        461,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                104,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        462,
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
            "createPageLayoutTab": [
                150,
                {
                    "input": [
                        463,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                150,
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
                151,
                {
                    "input": [
                        465,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                151,
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
                151,
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
                151,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                104,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                150,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createView": [
                67,
                {
                    "input": [
                        470,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                67,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        471,
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
                67,
                {
                    "input": [
                        472,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                64,
                {
                    "input": [
                        478,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                64,
                {
                    "input": [
                        479,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                8,
                {
                    "input": [
                        481,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                8,
                {
                    "input": [
                        482,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "createViewFilter": [
                61,
                {
                    "input": [
                        483,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                61,
                {
                    "input": [
                        484,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                61,
                {
                    "input": [
                        486,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                61,
                {
                    "input": [
                        487,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "updateViewField": [
                57,
                {
                    "input": [
                        488,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                57,
                {
                    "input": [
                        490,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                57,
                {
                    "inputs": [
                        490,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                57,
                {
                    "input": [
                        491,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                57,
                {
                    "input": [
                        492,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                66,
                {
                    "input": [
                        493,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                66,
                {
                    "input": [
                        495,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                66,
                {
                    "inputs": [
                        495,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                66,
                {
                    "input": [
                        496,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                66,
                {
                    "input": [
                        497,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                67,
                {
                    "input": [
                        498,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                59,
                {
                    "input": [
                        501,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        502,
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
            "createApiKey": [
                2,
                {
                    "input": [
                        503,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        504,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        505,
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
                32
            ],
            "checkoutSession": [
                162,
                {
                    "recurringInterval": [
                        88,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        84,
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
                161,
                {
                    "recurringInterval": [
                        88,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        84,
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
                161
            ],
            "switchSubscriptionInterval": [
                163
            ],
            "switchBillingPlan": [
                163
            ],
            "cancelSwitchBillingPlan": [
                163
            ],
            "cancelSwitchBillingInterval": [
                163
            ],
            "setResourceCreditSubscriptionPrice": [
                163,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                158
            ],
            "cancelSwitchResourceCreditPrice": [
                163
            ],
            "deleteConnectedAccount": [
                212,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                212,
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
                        3
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                206,
                {
                    "isAutoSkipped": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                206,
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
            "goBackToPreviousOnboardingStep": [
                205
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
                208,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                208,
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
                203,
                {
                    "input": [
                        506,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                8,
                {
                    "input": [
                        507,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                203,
                {
                    "input": [
                        508,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createOneAgent": [
                11,
                {
                    "input": [
                        509,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                11,
                {
                    "input": [
                        510,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                11,
                {
                    "input": [
                        434,
                        "AgentIdInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                24,
                {
                    "input": [
                        435,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                24,
                {
                    "input": [
                        511,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                155,
                {
                    "input": [
                        512,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                8,
                {
                    "input": [
                        513,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                15,
                {
                    "input": [
                        515,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                15,
                {
                    "input": [
                        516,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                15,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                15,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "generateFrontComponentApplicationTokenPair": [
                13,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                14,
                {
                    "input": [
                        517,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                14,
                {
                    "input": [
                        518,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                14,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneObject": [
                26,
                {
                    "input": [
                        520,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                26,
                {
                    "input": [
                        522,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                26,
                {
                    "input": [
                        523,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateManyObjects": [
                26,
                {
                    "inputs": [
                        523,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "createOneIndex": [
                281,
                {
                    "input": [
                        526,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                281,
                {
                    "input": [
                        529,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "runAgent": [
                373,
                {
                    "input": [
                        530,
                        "RunAgentInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                354,
                {
                    "input": [
                        535,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "cancelMessageCampaign": [
                352,
                {
                    "input": [
                        536,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                353,
                {
                    "input": [
                        537,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "duplicateMessageList": [
                355,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createMessageSuppression": [
                356,
                {
                    "input": [
                        538,
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
                360,
                {
                    "input": [
                        539,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                360,
                {
                    "input": [
                        540,
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
                340,
                {
                    "input": [
                        541,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                350,
                {
                    "input": [
                        543,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                340,
                {
                    "input": [
                        544,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                340,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                340,
                {
                    "input": [
                        545,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                340,
                {
                    "input": [
                        546,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                340,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                349,
                {
                    "input": [
                        547,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                336,
                {
                    "input": [
                        551,
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
                336,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                39,
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
                52,
                {
                    "createRoleInput": [
                        552,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                52,
                {
                    "updateRoleInput": [
                        553,
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
                49,
                {
                    "upsertObjectPermissionsInput": [
                        555,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                50,
                {
                    "upsertPermissionFlagsInput": [
                        557,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                44,
                {
                    "upsertFieldPermissionsInput": [
                        558,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                294,
                {
                    "input": [
                        560,
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
            "createWebhook": [
                369,
                {
                    "input": [
                        563,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                369,
                {
                    "input": [
                        564,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                369,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneField": [
                273,
                {
                    "input": [
                        566,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                273,
                {
                    "input": [
                        568,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                273,
                {
                    "input": [
                        570,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                63,
                {
                    "input": [
                        571,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                63,
                {
                    "inputs": [
                        571,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                63,
                {
                    "input": [
                        572,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                63,
                {
                    "inputs": [
                        572,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                63,
                {
                    "input": [
                        574,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                63,
                {
                    "input": [
                        575,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                415,
                {
                    "input": [
                        576,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                415,
                {
                    "input": [
                        578,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                410,
                {
                    "input": [
                        579,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                408,
                {
                    "input": [
                        581,
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
                        409
                    ]
                }
            ],
            "enqueueJob": [
                406,
                {
                    "input": [
                        582,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                407,
                {
                    "input": [
                        583,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                8,
                {
                    "input": [
                        585,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "createChatThread": [
                386
            ],
            "sendChatMessage": [
                391,
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
                        586,
                        "[FileAttachmentInput!]"
                    ],
                    "mentionedWorkspaceMemberIds": [
                        3,
                        "[UUID!]"
                    ]
                }
            ],
            "retryChatMessage": [
                391,
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
            "stopAgentChatStream": [
                8,
                {
                    "threadId": [
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
            "markAgentChatThreadAsRead": [
                392,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "markAgentChatThreadAsUnread": [
                392,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "archiveAgentChatThread": [
                392,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "snoozeAgentChatThread": [
                392,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "snoozedUntil": [
                        4,
                        "DateTime!"
                    ]
                }
            ],
            "moveAgentChatThreadToInbox": [
                392,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "subscribeToAgentChatThread": [
                392,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "unsubscribeFromAgentChatThread": [
                392,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "addAgentChatThreadParticipants": [
                3,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "workspaceMemberIds": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                395,
                {
                    "companyContext": [
                        9
                    ],
                    "personContext": [
                        9
                    ]
                }
            ],
            "sendInboxMessage": [
                394,
                {
                    "input": [
                        587,
                        "SendInboxMessageInput!"
                    ]
                }
            ],
            "createSkill": [
                385,
                {
                    "input": [
                        588,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                385,
                {
                    "input": [
                        589,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                385,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                385,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                385,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createValidationRule": [
                422,
                {
                    "input": [
                        590,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "updateValidationRule": [
                422,
                {
                    "input": [
                        591,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "deleteValidationRule": [
                422,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                421,
                {
                    "input": [
                        593,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                421,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                303,
                {
                    "input": [
                        594,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                314,
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
                301,
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
                309,
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
                301,
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
                313,
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
                301,
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
                306,
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
                306,
                {
                    "input": [
                        595
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                179,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        458,
                        "Upload!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                180,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        16,
                        "Float!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                179,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateTransientToken": [
                307
            ],
            "getAuthTokensFromLoginToken": [
                313,
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
                313,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "authorizeApp": [
                299,
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
                313,
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
                312,
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
                12
            ],
            "emailPasswordResetLink": [
                302,
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
                304,
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
            "createApplicationRegistration": [
                245,
                {
                    "input": [
                        596,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                80,
                {
                    "input": [
                        597,
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
                247,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                217,
                {
                    "input": [
                        599,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                80,
                {
                    "fileId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "uploadAppTarball": [
                80,
                {
                    "file": [
                        458,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                80,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                80,
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
            "initiateOTPProvisioning": [
                297,
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
                297
            ],
            "deleteTwoFactorAuthenticationMethod": [
                296,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                298,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                77
            ],
            "deleteUserFromWorkspace": [
                55,
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
                        601,
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
                249,
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
            "activateWorkspace": [
                73,
                {
                    "data": [
                        602,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                73,
                {
                    "data": [
                        603,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                73,
                {
                    "data": [
                        604,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                73
            ],
            "checkCustomDomainValidRecords": [
                293
            ],
            "enrichWorkspaceCompany": [
                270
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
            "grantApplicationCapabilities": [
                269,
                {
                    "input": [
                        605,
                        "GrantApplicationCapabilitiesInput!"
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
            "triggerInstallApplicationJob": [
                267,
                {
                    "input": [
                        606,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                268,
                {
                    "input": [
                        607,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "updateApplication": [
                53,
                {
                    "id": [
                        3,
                        "UUID!"
                    ],
                    "input": [
                        608,
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
            "runApplicationHealthCheck": [
                260,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                254,
                {
                    "input": [
                        609,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                254,
                {
                    "input": [
                        610,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                250,
                {
                    "input": [
                        611,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                251,
                {
                    "input": [
                        612,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                398,
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
                398,
                {
                    "type": [
                        613,
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
                383,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                317,
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
                318
            ],
            "createCalendarEvent": [
                375,
                {
                    "input": [
                        614,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                397,
                {
                    "input": [
                        615,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                374,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                368,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        617,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                214,
                {
                    "input": [
                        619,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                334,
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
                293,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                327,
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
                328,
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
                320,
                {
                    "file": [
                        458,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        324,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                326,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        620,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                322,
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
            "renewApplicationToken": [
                13,
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
        "RecordSharePrincipalInput": {
            "workspaceMemberId": [
                3
            ],
            "roleId": [
                3
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
                183
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
                16
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
                457
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
                16
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
                173
            ],
            "operationType": [
                169
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
                32
            ],
            "periodUnit": [
                1
            ],
            "unit": [
                170
            ],
            "limitValue": [
                176
            ],
            "burstValue": [
                176
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
                459
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
                105
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
                105
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
        "CreatePageLayoutTabInput": {
            "title": [
                1
            ],
            "position": [
                16
            ],
            "pageLayoutId": [
                3
            ],
            "layoutMode": [
                108
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
                16
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                108
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
                152
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
                152
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
                152
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
                16
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                108
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
                105
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
                68
            ],
            "key": [
                69
            ],
            "icon": [
                1
            ],
            "position": [
                16
            ],
            "isCompact": [
                8
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "kanbanColumnWidth": [
                32
            ],
            "groupLoadLimit": [
                32
            ],
            "openRecordIn": [
                70
            ],
            "kanbanAggregateOperation": [
                58
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                71
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
                72
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
                68
            ],
            "icon": [
                1
            ],
            "position": [
                16
            ],
            "isCompact": [
                8
            ],
            "openRecordIn": [
                70
            ],
            "kanbanAggregateOperation": [
                58
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                71
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "calendarEndFieldMetadataId": [
                3
            ],
            "visibility": [
                72
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "kanbanColumnWidth": [
                32
            ],
            "groupLoadLimit": [
                32
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
                473
            ],
            "viewFields": [
                474
            ],
            "viewFilters": [
                475
            ],
            "viewFilterGroups": [
                476
            ],
            "viewSorts": [
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "type": [
                68
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "openRecordIn": [
                70
            ],
            "kanbanAggregateOperation": [
                58
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "kanbanColumnWidth": [
                32
            ],
            "calendarLayout": [
                71
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
                16
            ],
            "size": [
                16
            ],
            "aggregateOperation": [
                58
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
                62
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                16
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
                60
            ],
            "positionInViewFilterGroup": [
                16
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
                65
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
                65
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
                480
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                65
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
        "CreateViewFilterInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                62
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                16
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
                485
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
                62
            ],
            "value": [
                9
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                16
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
        "UpdateViewFieldInput": {
            "id": [
                3
            ],
            "update": [
                489
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
                16
            ],
            "position": [
                16
            ],
            "aggregateOperation": [
                58
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
                16
            ],
            "position": [
                16
            ],
            "aggregateOperation": [
                58
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
                494
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
                16
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
                16
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
                499
            ],
            "fields": [
                500
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
                16
            ],
            "isVisible": [
                8
            ],
            "fields": [
                500
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
                16
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
                60
            ],
            "positionInViewFilterGroup": [
                16
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
                60
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "viewId": [
                3
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
            "triggers": [
                9
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
            "triggers": [
                9
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
                16
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
                514
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
                16
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
            "coreWorkflowVersionId": [
                3
            ],
            "frontComponentId": [
                3
            ],
            "engineComponentKey": [
                17
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
                16
            ],
            "isPinned": [
                8
            ],
            "availabilityType": [
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
                16
            ],
            "isPinned": [
                8
            ],
            "availabilityType": [
                18
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "engineComponentKey": [
                17
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
                519
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
        "CreateOneObjectInput": {
            "object": [
                521
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
                524
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
                27
            ],
            "readability": [
                28
            ],
            "sharingReach": [
                29
            ],
            "translations": [
                525
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
                527
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
                528
            ],
            "indexType": [
                282
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
                531
            ],
            "input": [
                531
            ],
            "additionalInstructions": [
                1
            ],
            "thread": [
                534
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageInput": {
            "role": [
                532
            ],
            "content": [
                1
            ],
            "attachments": [
                533
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageRole": {},
        "RunAgentMessageAttachmentInput": {
            "fileId": [
                3
            ],
            "filename": [
                1
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
                361
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
                361
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
                542
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                341
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                343
            ],
            "messageFolderImportPolicy": [
                344
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
        "CreateAppMessageChannelInput": {
            "connectedAccountId": [
                3
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "visibility": [
                341
            ],
            "__typename": [
                1
            ]
        },
        "UpdateAppMessageChannelInput": {
            "id": [
                3
            ],
            "displayName": [
                1
            ],
            "visibility": [
                341
            ],
            "isSyncEnabled": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "IngestAppMessagesInput": {
            "messageChannelId": [
                3
            ],
            "messages": [
                548
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageInput": {
            "externalId": [
                1
            ],
            "threadExternalId": [
                1
            ],
            "subject": [
                1
            ],
            "text": [
                1
            ],
            "receivedAt": [
                4
            ],
            "participants": [
                549
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageParticipantInput": {
            "role": [
                550
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "personId": [
                3
            ],
            "workspaceMemberId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "MessageParticipantRole": {},
        "CreateEmailingDomainInput": {
            "domain": [
                1
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
                554
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
                556
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
                559
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
                561
            ],
            "predicateGroups": [
                562
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
                48
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
                16
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
                46
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                16
            ],
            "__typename": [
                1
            ]
        },
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
                565
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
        "CreateOneFieldMetadataInput": {
            "field": [
                567
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                274
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
                569
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
                525
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
                16
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
                573
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
                16
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
        "UpdateMessageFolderInput": {
            "id": [
                3
            ],
            "update": [
                577
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
                577
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
                580
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                413
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                414
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
                409
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
                32
            ],
            "delayMs": [
                32
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
                584
            ],
            "retryLimit": [
                32
            ],
            "delayMs": [
                32
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
                186
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
        "SendInboxMessageInput": {
            "workspaceMemberId": [
                3
            ],
            "threadKey": [
                1
            ],
            "idempotencyKey": [
                1
            ],
            "title": [
                1
            ],
            "text": [
                1
            ],
            "toolCall": [
                9
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
        "CreateValidationRuleInput": {
            "objectMetadataId": [
                3
            ],
            "errorFieldMetadataId": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "expression": [
                1
            ],
            "message": [
                1
            ],
            "isActive": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInput": {
            "id": [
                3
            ],
            "update": [
                592
            ],
            "__typename": [
                1
            ]
        },
        "UpdateValidationRuleInputUpdates": {
            "errorFieldMetadataId": [
                3
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "expression": [
                1
            ],
            "message": [
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
                525
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
                598
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
                600
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
            "isCampaignClickTrackingEnabled": [
                8
            ],
            "workspaceDiscoverability": [
                74
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
                16
            ],
            "eventLogRetentionDays": [
                16
            ],
            "aiChatModelTier": [
                76
            ],
            "aiAgentModelTier": [
                76
            ],
            "isAutoModelSelectionEnabled": [
                8
            ],
            "aiModelIdByTier": [
                9
            ],
            "aiEvaluationModelId": [
                1
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
        "GrantApplicationCapabilitiesInput": {
            "applicationId": [
                3
            ],
            "capabilities": [
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
                223
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
                616
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
                618
            ],
            "SMTP": [
                618
            ],
            "CALDAV": [
                618
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
                16
            ],
            "username": [
                1
            ],
            "password": [
                1
            ],
            "connectionSecurity": [
                210
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
                324
            ],
            "filePath": [
                1
            ],
            "size": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "onEventSubscription": [
                202,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                295,
                {
                    "input": [
                        622,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                393,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                399,
                {
                    "table": [
                        443,
                        "EventLogTable!"
                    ],
                    "fieldFilters": [
                        446,
                        "[EventLogFieldFilterInput!]"
                    ]
                }
            ],
            "exportRecords": [
                402,
                {
                    "input": [
                        623,
                        "CreateRecordExportInput!"
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
        },
        "CreateRecordExportInput": {
            "objectMetadataId": [
                3
            ],
            "fieldMetadataIds": [
                3
            ],
            "filter": [
                9
            ],
            "orderBy": [
                9
            ],
            "__typename": [
                1
            ]
        }
    }
}