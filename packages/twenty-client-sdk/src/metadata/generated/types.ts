export default {
    "scalars": [
        1,
        3,
        4,
        5,
        6,
        9,
        16,
        17,
        18,
        23,
        25,
        27,
        29,
        31,
        32,
        39,
        40,
        41,
        42,
        45,
        47,
        55,
        57,
        59,
        61,
        64,
        67,
        68,
        69,
        70,
        71,
        73,
        74,
        76,
        77,
        84,
        87,
        92,
        93,
        96,
        97,
        99,
        102,
        103,
        111,
        125,
        131,
        132,
        133,
        135,
        143,
        146,
        154,
        157,
        159,
        174,
        181,
        182,
        189,
        192,
        195,
        207,
        224,
        226,
        239,
        245,
        281,
        283,
        284,
        285,
        286,
        287,
        288,
        289,
        296,
        297,
        300,
        337,
        343,
        345,
        346,
        347,
        348,
        350,
        352,
        365,
        372,
        379,
        380,
        492,
        514
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
                130
            ],
            "on_BillingLicensedProduct": [
                139
            ],
            "on_BillingMeteredProduct": [
                140
            ],
            "__typename": [
                1
            ]
        },
        "String": {},
        "ApplicationRegistrationVariable": {
            "id": [
                4
            ],
            "key": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                3
            ],
            "isRequired": [
                3
            ],
            "type": [
                1
            ],
            "options": [
                5
            ],
            "isFilled": [
                3
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "UUID": {},
        "JSON": {},
        "DateTime": {},
        "ApiKey": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "expiresAt": [
                6
            ],
            "revokedAt": [
                6
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "role": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                4
            ],
            "latestAvailableVersion": [
                1
            ],
            "sourceType": [
                9
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
                4
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
                3
            ],
            "type": [
                1
            ],
            "options": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "Agent": {
            "id": [
                4
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
                5
            ],
            "roleId": [
                4
            ],
            "isCustom": [
                3
            ],
            "applicationId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "modelConfiguration": [
                5
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
                6
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
                4
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
                4
            ],
            "applicationId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "isHeadless": [
                3
            ],
            "usesSdkClient": [
                3
            ],
            "usesVendor": [
                3
            ],
            "applicationTokenPair": [
                13
            ],
            "applicationVariables": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "CommandMenuItem": {
            "id": [
                4
            ],
            "workflowVersionId": [
                4
            ],
            "frontComponentId": [
                4
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
                3
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
            "availabilityObjectMetadataId": [
                4
            ],
            "pageLayoutId": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "applicationId": [
                4
            ],
            "isActive": [
                3
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunction": {
            "id": [
                4
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
                23
            ],
            "sourceHandlerPath": [
                1
            ],
            "handlerName": [
                1
            ],
            "cronTriggerSettings": [
                5
            ],
            "databaseEventTriggerSettings": [
                5
            ],
            "httpRouteTriggerSettings": [
                5
            ],
            "toolTriggerSettings": [
                5
            ],
            "workflowActionTriggerSettings": [
                5
            ],
            "applicationId": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionMode": {},
        "Field": {
            "id": [
                4
            ],
            "universalIdentifier": [
                1
            ],
            "type": [
                25
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
                3
            ],
            "isSystem": [
                3
            ],
            "isUIEditable": [
                3
            ],
            "isUIReadOnly": [
                3
            ],
            "isNullable": [
                3
            ],
            "isUnique": [
                3
            ],
            "defaultValue": [
                5
            ],
            "options": [
                5
            ],
            "settings": [
                5
            ],
            "objectMetadataId": [
                4
            ],
            "isLabelSyncedWithName": [
                3
            ],
            "morphId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "applicationId": [
                4
            ],
            "relation": [
                225
            ],
            "morphRelations": [
                225
            ],
            "object": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "FieldMetadataType": {},
        "Index": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "isCustom": [
                3
            ],
            "isUnique": [
                3
            ],
            "indexWhereClause": [
                1
            ],
            "indexType": [
                27
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "indexFieldMetadataList": [
                227
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "Object": {
            "id": [
                4
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
                3
            ],
            "isActive": [
                3
            ],
            "isSystem": [
                3
            ],
            "isUIEditable": [
                3
            ],
            "isUICreatable": [
                3
            ],
            "isUIReadOnly": [
                3
            ],
            "isSearchable": [
                3
            ],
            "openRecordIn": [
                29
            ],
            "applicationId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "labelIdentifierFieldMetadataId": [
                4
            ],
            "imageIdentifierFieldMetadataId": [
                4
            ],
            "isLabelSyncedWithName": [
                3
            ],
            "duplicateCriteria": [
                1
            ],
            "fieldsList": [
                24
            ],
            "indexMetadataList": [
                26
            ],
            "searchFieldMetadataList": [
                229
            ],
            "fields": [
                236,
                {
                    "paging": [
                        30,
                        "CursorPaging!"
                    ],
                    "filter": [
                        33,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                234,
                {
                    "paging": [
                        30,
                        "CursorPaging!"
                    ],
                    "filter": [
                        36,
                        "IndexFilter!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "ObjectOpenRecordIn": {},
        "CursorPaging": {
            "before": [
                32
            ],
            "after": [
                32
            ],
            "first": [
                31
            ],
            "last": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                33
            ],
            "or": [
                33
            ],
            "id": [
                34
            ],
            "isActive": [
                35
            ],
            "isSystem": [
                35
            ],
            "isUIEditable": [
                35
            ],
            "isUIReadOnly": [
                35
            ],
            "objectMetadataId": [
                34
            ],
            "__typename": [
                1
            ]
        },
        "UUIDFilterComparison": {
            "is": [
                3
            ],
            "isNot": [
                3
            ],
            "eq": [
                4
            ],
            "neq": [
                4
            ],
            "gt": [
                4
            ],
            "gte": [
                4
            ],
            "lt": [
                4
            ],
            "lte": [
                4
            ],
            "like": [
                4
            ],
            "notLike": [
                4
            ],
            "iLike": [
                4
            ],
            "notILike": [
                4
            ],
            "in": [
                4
            ],
            "notIn": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "BooleanFieldComparison": {
            "is": [
                3
            ],
            "isNot": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                36
            ],
            "or": [
                36
            ],
            "id": [
                34
            ],
            "isCustom": [
                35
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
                4
            ],
            "name": [
                37
            ],
            "userEmail": [
                1
            ],
            "colorScheme": [
                1
            ],
            "openRecordIn": [
                39
            ],
            "avatarUrl": [
                1
            ],
            "locale": [
                1
            ],
            "calendarStartDay": [
                31
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                40
            ],
            "timeFormat": [
                41
            ],
            "roles": [
                51
            ],
            "userWorkspaceId": [
                4
            ],
            "numberFormat": [
                42
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
                4
            ],
            "objectMetadataId": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "roleId": [
                4
            ],
            "canReadFieldValue": [
                3
            ],
            "canUpdateFieldValue": [
                3
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
                45
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
                47
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateOperand": {},
        "ObjectPermission": {
            "objectMetadataId": [
                4
            ],
            "canReadObjectRecords": [
                3
            ],
            "canUpdateObjectRecords": [
                3
            ],
            "canSoftDeleteObjectRecords": [
                3
            ],
            "canDestroyObjectRecords": [
                3
            ],
            "restrictedFields": [
                5
            ],
            "rowLevelPermissionPredicates": [
                46
            ],
            "rowLevelPermissionPredicateGroups": [
                44
            ],
            "__typename": [
                1
            ]
        },
        "RolePermissionFlag": {
            "id": [
                4
            ],
            "roleId": [
                4
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
                4
            ],
            "name": [
                1
            ],
            "expiresAt": [
                6
            ],
            "revokedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Role": {
            "id": [
                4
            ],
            "universalIdentifier": [
                4
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
                3
            ],
            "canBeAssignedToUsers": [
                3
            ],
            "canBeAssignedToAgents": [
                3
            ],
            "canBeAssignedToApiKeys": [
                3
            ],
            "workspaceMembers": [
                38
            ],
            "agents": [
                11
            ],
            "apiKeys": [
                50
            ],
            "canUpdateAllSettings": [
                3
            ],
            "canAccessAllTools": [
                3
            ],
            "canReadAllObjectRecords": [
                3
            ],
            "canUpdateAllObjectRecords": [
                3
            ],
            "canSoftDeleteAllObjectRecords": [
                3
            ],
            "canDestroyAllObjectRecords": [
                3
            ],
            "permissionFlags": [
                49
            ],
            "objectPermissions": [
                48
            ],
            "fieldPermissions": [
                43
            ],
            "rowLevelPermissionPredicates": [
                46
            ],
            "rowLevelPermissionPredicateGroups": [
                44
            ],
            "__typename": [
                1
            ]
        },
        "Application": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "logoFileId": [
                4
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
                4
            ],
            "yarnLockChecksum": [
                1
            ],
            "yarnLockFileId": [
                4
            ],
            "availablePackages": [
                5
            ],
            "applicationRegistrationId": [
                4
            ],
            "canBeUninstalled": [
                3
            ],
            "autoUpgrade": [
                3
            ],
            "defaultRoleId": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                4
            ],
            "defaultLogicFunctionRole": [
                51
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
            "logicFunctions": [
                22
            ],
            "objects": [
                28
            ],
            "applicationVariables": [
                10
            ],
            "applicationRegistration": [
                8
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
                4
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
                4
            ],
            "user": [
                75
            ],
            "userId": [
                4
            ],
            "locale": [
                1
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "permissionFlags": [
                55
            ],
            "objectPermissions": [
                48
            ],
            "objectsPermissions": [
                48
            ],
            "twoFactorAuthenticationMethodSummary": [
                53
            ],
            "isImpersonating": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
        "ViewField": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "isVisible": [
                3
            ],
            "size": [
                16
            ],
            "position": [
                16
            ],
            "aggregateOperation": [
                57
            ],
            "viewId": [
                4
            ],
            "viewFieldGroupId": [
                4
            ],
            "workspaceId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "isActive": [
                3
            ],
            "deletedAt": [
                6
            ],
            "isOverridden": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "AggregateOperations": {},
        "ViewFilterGroup": {
            "id": [
                4
            ],
            "parentViewFilterGroupId": [
                4
            ],
            "logicalOperator": [
                59
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "viewId": [
                4
            ],
            "workspaceId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterGroupLogicalOperator": {},
        "ViewFilter": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "operand": [
                61
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                4
            ],
            "viewId": [
                4
            ],
            "workspaceId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ViewFilterOperand": {},
        "ViewGroup": {
            "id": [
                4
            ],
            "isVisible": [
                3
            ],
            "fieldValue": [
                1
            ],
            "position": [
                16
            ],
            "viewId": [
                4
            ],
            "workspaceId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ViewSort": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "direction": [
                64
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                4
            ],
            "workspaceId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ViewSortDirection": {},
        "ViewFieldGroup": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                16
            ],
            "isVisible": [
                3
            ],
            "viewId": [
                4
            ],
            "workspaceId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "isActive": [
                3
            ],
            "deletedAt": [
                6
            ],
            "viewFields": [
                56
            ],
            "isOverridden": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "View": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                4
            ],
            "type": [
                67
            ],
            "key": [
                68
            ],
            "icon": [
                1
            ],
            "position": [
                16
            ],
            "isCompact": [
                3
            ],
            "isCustom": [
                3
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                57
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "mainGroupByFieldMetadataId": [
                4
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "kanbanColumnWidth": [
                31
            ],
            "calendarFieldMetadataId": [
                4
            ],
            "calendarEndFieldMetadataId": [
                4
            ],
            "workspaceId": [
                4
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "viewFields": [
                56
            ],
            "viewFilters": [
                60
            ],
            "viewFilterGroups": [
                58
            ],
            "viewSorts": [
                63
            ],
            "viewGroups": [
                62
            ],
            "viewFieldGroups": [
                65
            ],
            "visibility": [
                71
            ],
            "createdByUserWorkspaceId": [
                4
            ],
            "isActive": [
                3
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
                4
            ],
            "displayName": [
                1
            ],
            "logo": [
                1
            ],
            "logoFileId": [
                4
            ],
            "inviteHash": [
                1
            ],
            "deletedAt": [
                6
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "allowImpersonation": [
                3
            ],
            "isPublicInviteLinkEnabled": [
                3
            ],
            "workspaceDiscoverability": [
                73
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
                74
            ],
            "views": [
                66
            ],
            "viewFields": [
                56
            ],
            "viewFilters": [
                60
            ],
            "viewFilterGroups": [
                58
            ],
            "viewGroups": [
                62
            ],
            "viewSorts": [
                63
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
                3
            ],
            "isGoogleAuthBypassEnabled": [
                3
            ],
            "isTwoFactorAuthenticationEnforced": [
                3
            ],
            "isPasswordAuthEnabled": [
                3
            ],
            "isPasswordAuthBypassEnabled": [
                3
            ],
            "isMicrosoftAuthEnabled": [
                3
            ],
            "isMicrosoftAuthBypassEnabled": [
                3
            ],
            "isCustomDomainEnabled": [
                3
            ],
            "isInternalMessagesImportEnabled": [
                3
            ],
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                51
            ],
            "fastModel": [
                1
            ],
            "smartModel": [
                1
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "enabledAiModelIds": [
                1
            ],
            "useRecommendedModels": [
                3
            ],
            "routerModel": [
                1
            ],
            "workspaceCustomApplication": [
                52
            ],
            "featureFlags": [
                173
            ],
            "billingSubscriptions": [
                142
            ],
            "installedApplications": [
                52
            ],
            "currentBillingSubscription": [
                142
            ],
            "billingCustomer": [
                144
            ],
            "billingEntitlements": [
                238
            ],
            "hasValidSignedEnterpriseKey": [
                3
            ],
            "hasValidEnterpriseValidityToken": [
                3
            ],
            "workspaceUrls": [
                175
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
        "User": {
            "id": [
                4
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
                3
            ],
            "disabled": [
                3
            ],
            "canImpersonate": [
                3
            ],
            "canAccessFullAdminPanel": [
                3
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "locale": [
                1
            ],
            "workspaceMember": [
                38
            ],
            "userWorkspaces": [
                54
            ],
            "onboardingStatus": [
                76
            ],
            "currentWorkspace": [
                72
            ],
            "currentUserWorkspace": [
                54
            ],
            "userVars": [
                77
            ],
            "workspaceMembers": [
                38
            ],
            "deletedWorkspaceMembers": [
                217
            ],
            "hasPassword": [
                3
            ],
            "supportUserHash": [
                1
            ],
            "workspaces": [
                54
            ],
            "availableWorkspaces": [
                216
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "JSONObject": {},
        "ApplicationRegistration": {
            "id": [
                4
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
                4
            ],
            "sourceType": [
                9
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                3
            ],
            "isVetted": [
                3
            ],
            "isPreInstalled": [
                3
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "isConfigured": [
                3
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
                4
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
                4
            ],
            "applicationId": [
                4
            ],
            "pageLayoutTabId": [
                4
            ],
            "title": [
                1
            ],
            "type": [
                84
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                82
            ],
            "position": [
                85
            ],
            "configuration": [
                90
            ],
            "conditionalDisplay": [
                5
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "isActive": [
                3
            ],
            "deletedAt": [
                6
            ],
            "isOverridden": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "WidgetType": {},
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetGridPosition": [
                86
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                88
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                89
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                87
            ],
            "row": [
                31
            ],
            "column": [
                31
            ],
            "rowSpan": [
                31
            ],
            "columnSpan": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                87
            ],
            "index": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                87
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                91
            ],
            "on_StandaloneRichTextConfiguration": [
                94
            ],
            "on_PieChartConfiguration": [
                95
            ],
            "on_LineChartConfiguration": [
                98
            ],
            "on_IframeConfiguration": [
                100
            ],
            "on_BarChartConfiguration": [
                101
            ],
            "on_CalendarConfiguration": [
                104
            ],
            "on_FrontComponentConfiguration": [
                105
            ],
            "on_EmailsConfiguration": [
                106
            ],
            "on_EmailThreadConfiguration": [
                107
            ],
            "on_MessageCampaignBodyConfiguration": [
                108
            ],
            "on_MessageCampaignDetailsConfiguration": [
                109
            ],
            "on_FieldConfiguration": [
                110
            ],
            "on_FieldRichTextConfiguration": [
                112
            ],
            "on_FieldsConfiguration": [
                113
            ],
            "on_FilesConfiguration": [
                114
            ],
            "on_NotesConfiguration": [
                115
            ],
            "on_TasksConfiguration": [
                116
            ],
            "on_TimelineConfiguration": [
                117
            ],
            "on_ViewConfiguration": [
                118
            ],
            "on_RecordTableConfiguration": [
                119
            ],
            "on_WorkflowConfiguration": [
                120
            ],
            "on_WorkflowRunConfiguration": [
                121
            ],
            "on_WorkflowVersionConfiguration": [
                122
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                92
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                57
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                3
            ],
            "numberFormat": [
                93
            ],
            "description": [
                1
            ],
            "filter": [
                5
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                31
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                80
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "ChartNumberFormat": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                92
            ],
            "body": [
                81
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                92
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                57
            ],
            "groupByFieldMetadataId": [
                4
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                96
            ],
            "orderBy": [
                97
            ],
            "manualSortOrder": [
                1
            ],
            "displayDataLabel": [
                3
            ],
            "showCenterMetric": [
                3
            ],
            "displayLegend": [
                3
            ],
            "hideEmptyCategory": [
                3
            ],
            "numberFormat": [
                93
            ],
            "splitMultiValueFields": [
                3
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                5
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                92
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                57
            ],
            "primaryAxisGroupByFieldMetadataId": [
                4
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                96
            ],
            "primaryAxisOrderBy": [
                97
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                4
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisGroupByDateGranularity": [
                96
            ],
            "secondaryAxisOrderBy": [
                97
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                3
            ],
            "splitMultiValueFields": [
                3
            ],
            "axisNameDisplay": [
                99
            ],
            "displayDataLabel": [
                3
            ],
            "displayLegend": [
                3
            ],
            "numberFormat": [
                93
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
                5
            ],
            "isStacked": [
                3
            ],
            "isCumulative": [
                3
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                92
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
                92
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                57
            ],
            "primaryAxisGroupByFieldMetadataId": [
                4
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                96
            ],
            "primaryAxisOrderBy": [
                97
            ],
            "primaryAxisManualSortOrder": [
                1
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                4
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisGroupByDateGranularity": [
                96
            ],
            "secondaryAxisOrderBy": [
                97
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                3
            ],
            "splitMultiValueFields": [
                3
            ],
            "axisNameDisplay": [
                99
            ],
            "displayDataLabel": [
                3
            ],
            "displayLegend": [
                3
            ],
            "numberFormat": [
                93
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
                5
            ],
            "groupMode": [
                102
            ],
            "layout": [
                103
            ],
            "isCumulative": [
                3
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                92
            ],
            "frontComponentId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EmailsConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                92
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                111
            ],
            "viewId": [
                1
            ],
            "nestedRelationFieldMetadataId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldRichTextConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                92
            ],
            "viewId": [
                1
            ],
            "newFieldDefaultVisibility": [
                3
            ],
            "shouldAllowUserToSeeHiddenFields": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                92
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                92
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "id": [
                4
            ],
            "applicationId": [
                4
            ],
            "title": [
                1
            ],
            "position": [
                16
            ],
            "pageLayoutId": [
                4
            ],
            "widgets": [
                83
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                87
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "isActive": [
                3
            ],
            "deletedAt": [
                6
            ],
            "isOverridden": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "PageLayout": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "type": [
                125
            ],
            "objectMetadataId": [
                4
            ],
            "tabs": [
                123
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationConnectionProvider": {
            "id": [
                4
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
                126
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
                128
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                131
            ],
            "priceUsageBased": [
                132
            ],
            "productKey": [
                133
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
                135
            ],
            "unitAmount": [
                16
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                132
            ],
            "creditAmount": [
                16
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
                136
            ],
            "recurringInterval": [
                135
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                132
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
                130
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
                130
            ],
            "prices": [
                134
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
                130
            ],
            "prices": [
                137
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItem": {
            "id": [
                4
            ],
            "hasReachedCurrentPeriodCap": [
                3
            ],
            "quantity": [
                16
            ],
            "stripePriceId": [
                1
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
                4
            ],
            "status": [
                143
            ],
            "interval": [
                135
            ],
            "billingSubscriptionItems": [
                141
            ],
            "currentPeriodEnd": [
                6
            ],
            "metadata": [
                5
            ],
            "phases": [
                129
            ],
            "cancelAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "BillingCustomer": {
            "id": [
                4
            ],
            "hasPaymentMethod": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionResult": {
            "data": [
                5
            ],
            "logs": [
                1
            ],
            "duration": [
                16
            ],
            "status": [
                146
            ],
            "error": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "EnterpriseLicenseInfoDTO": {
            "isValid": [
                3
            ],
            "licensee": [
                1
            ],
            "expiresAt": [
                6
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
                6
            ],
            "cancelAt": [
                6
            ],
            "currentPeriodEnd": [
                6
            ],
            "isCancellationScheduled": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ApprovedAccessDomain": {
            "id": [
                4
            ],
            "domain": [
                1
            ],
            "isValidated": [
                3
            ],
            "createdAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "FileWithSignedUrl": {
            "id": [
                4
            ],
            "path": [
                1
            ],
            "size": [
                16
            ],
            "createdAt": [
                6
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
                4
            ],
            "uploadUrl": [
                1
            ],
            "contentType": [
                1
            ],
            "expiresAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "RecordIdentifier": {
            "id": [
                4
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
                4
            ],
            "userWorkspaceId": [
                4
            ],
            "targetRecordId": [
                4
            ],
            "targetObjectMetadataId": [
                4
            ],
            "viewId": [
                4
            ],
            "type": [
                154
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
                4
            ],
            "pageLayoutId": [
                4
            ],
            "position": [
                16
            ],
            "applicationId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "targetRecordIdentifier": [
                152
            ],
            "__typename": [
                1
            ]
        },
        "NavigationMenuItemType": {},
        "ObjectRecordEventProperties": {
            "updatedFields": [
                1
            ],
            "before": [
                5
            ],
            "after": [
                5
            ],
            "diff": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEvent": {
            "type": [
                157
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                155
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
                159
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
                155
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
                158
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
                160
            ],
            "metadataEvents": [
                156
            ],
            "__typename": [
                1
            ]
        },
        "UserSession": {
            "id": [
                4
            ],
            "workspaceId": [
                4
            ],
            "authProvider": [
                1
            ],
            "isImpersonating": [
                3
            ],
            "userAgent": [
                1
            ],
            "ipAddress": [
                1
            ],
            "createdAt": [
                6
            ],
            "lastActiveAt": [
                6
            ],
            "expiresAt": [
                6
            ],
            "isCurrent": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "BillingEndTrialPeriod": {
            "status": [
                143
            ],
            "hasPaymentMethod": [
                3
            ],
            "billingPortalUrl": [
                1
            ],
            "currentBillingSubscription": [
                142
            ],
            "billingSubscriptions": [
                142
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                133
            ],
            "periodStart": [
                6
            ],
            "periodEnd": [
                6
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
                131
            ],
            "baseProducts": [
                139
            ],
            "resourceCreditProducts": [
                139
            ],
            "meteredProducts": [
                140
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
                142
            ],
            "billingSubscriptions": [
                142
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
        "OnboardingStepSuccess": {
            "success": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInvitation": {
            "id": [
                4
            ],
            "email": [
                1
            ],
            "roleId": [
                4
            ],
            "expiresAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "SendInvitations": {
            "success": [
                3
            ],
            "errors": [
                1
            ],
            "result": [
                171
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                174
            ],
            "value": [
                3
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
        "ApplicationRegistrationVariableDTO": {
            "id": [
                4
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
                3
            ],
            "isRequired": [
                3
            ],
            "isFilled": [
                3
            ],
            "type": [
                1
            ],
            "options": [
                5
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
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
                31
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                31
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                177
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "SSOIdentityProvider": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "type": [
                181
            ],
            "status": [
                182
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
                180
            ],
            "google": [
                3
            ],
            "magicLink": [
                3
            ],
            "password": [
                3
            ],
            "microsoft": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "AuthBypassProviders": {
            "google": [
                3
            ],
            "password": [
                3
            ],
            "microsoft": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceData": {
            "id": [
                4
            ],
            "authProviders": [
                183
            ],
            "authBypassProviders": [
                184
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                175
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceDataSummary": {
            "id": [
                4
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
                3
            ],
            "twitterSearch": [
                3
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
                189
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
                187
            ],
            "isDeprecated": [
                3
            ],
            "isRecommended": [
                3
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
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "Billing": {
            "isBillingEnabled": [
                3
            ],
            "billingUrl": [
                1
            ],
            "stripePublishableKey": [
                1
            ],
            "trialPeriods": [
                179
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                192
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
            "__typename": [
                1
            ]
        },
        "Captcha": {
            "provider": [
                195
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
            "imagePath": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublicFeatureFlag": {
            "key": [
                174
            ],
            "metadata": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "ClientConfigMaintenanceMode": {
            "startAt": [
                6
            ],
            "endAt": [
                6
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
                183
            ],
            "billing": [
                190
            ],
            "aiModels": [
                188
            ],
            "signInPrefilled": [
                3
            ],
            "isMultiWorkspaceEnabled": [
                3
            ],
            "isEmailVerificationRequired": [
                3
            ],
            "defaultSubdomain": [
                1
            ],
            "subdomainMinLength": [
                16
            ],
            "frontDomain": [
                1
            ],
            "publicFunctionDomain": [
                1
            ],
            "analyticsEnabled": [
                3
            ],
            "support": [
                191
            ],
            "isAttachmentPreviewEnabled": [
                3
            ],
            "sentry": [
                193
            ],
            "captcha": [
                194
            ],
            "api": [
                196
            ],
            "canManageFeatureFlags": [
                3
            ],
            "publicFeatureFlags": [
                198
            ],
            "isCookieSessionEnabled": [
                3
            ],
            "isMicrosoftMessagingEnabled": [
                3
            ],
            "isMicrosoftCalendarEnabled": [
                3
            ],
            "isGoogleMessagingEnabled": [
                3
            ],
            "isGoogleCalendarEnabled": [
                3
            ],
            "isConfigVariablesInDbEnabled": [
                3
            ],
            "isImapSmtpCaldavEnabled": [
                3
            ],
            "isEmailingDomainInDemoMode": [
                3
            ],
            "allowRequestsToTwentyIcons": [
                3
            ],
            "calendarBookingPageId": [
                1
            ],
            "isBookCallOnboardingStepEnabled": [
                3
            ],
            "isCompanyEnrichmentEnabled": [
                3
            ],
            "isCloudflareIntegrationEnabled": [
                3
            ],
            "isClickHouseConfigured": [
                3
            ],
            "isWorkspaceSchemaDDLLocked": [
                3
            ],
            "isOnboardingAiChatEnabled": [
                3
            ],
            "enterpriseInstanceType": [
                1
            ],
            "maintenance": [
                199
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                78
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
                4
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
                207
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
            "accessToken": [
                1
            ],
            "scopes": [
                1
            ],
            "authFailedAt": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "ResendEmailVerificationToken": {
            "success": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSso": {
            "identityProviderId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EditSso": {
            "id": [
                4
            ],
            "type": [
                181
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                182
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "FindAvailableSSOIDP": {
            "type": [
                181
            ],
            "id": [
                4
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                182
            ],
            "workspace": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "SetupSso": {
            "id": [
                4
            ],
            "type": [
                181
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                182
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                181
            ],
            "id": [
                4
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                182
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspace": {
            "id": [
                4
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
                175
            ],
            "logo": [
                1
            ],
            "sso": [
                214
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                215
            ],
            "availableWorkspacesForSignUp": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "DeletedWorkspaceMember": {
            "id": [
                4
            ],
            "name": [
                37
            ],
            "userEmail": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "userWorkspaceId": [
                4
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
                3
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
                3
            ],
            "canUpdateObjectRecords": [
                3
            ],
            "canSoftDeleteObjectRecords": [
                3
            ],
            "canDestroyObjectRecords": [
                3
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
                3
            ],
            "canUpdateFieldValue": [
                3
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
                3
            ],
            "canAccessAllTools": [
                3
            ],
            "canReadAllObjectRecords": [
                3
            ],
            "canUpdateAllObjectRecords": [
                3
            ],
            "canSoftDeleteAllObjectRecords": [
                3
            ],
            "canDestroyAllObjectRecords": [
                3
            ],
            "permissionFlagUniversalIdentifiers": [
                1
            ],
            "objectPermissions": [
                219
            ],
            "fieldPermissions": [
                220
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
                9
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                3
            ],
            "isVetted": [
                3
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
                221
            ],
            "manifest": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentResult": {
            "outcome": [
                224
            ],
            "enrichment": [
                5
            ],
            "isBookCallOnboardingStepPending": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceCompanyEnrichmentOutcome": {},
        "Relation": {
            "type": [
                226
            ],
            "sourceObjectMetadata": [
                28
            ],
            "targetObjectMetadata": [
                28
            ],
            "sourceFieldMetadata": [
                24
            ],
            "targetFieldMetadata": [
                24
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "IndexField": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "order": [
                16
            ],
            "subFieldName": [
                1
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
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
                31
            ],
            "__typename": [
                1
            ]
        },
        "SearchField": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "tsVectorFieldMetadataId": [
                4
            ],
            "position": [
                16
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                28
            ],
            "cursor": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "PageInfo": {
            "hasNextPage": [
                3
            ],
            "hasPreviousPage": [
                3
            ],
            "startCursor": [
                32
            ],
            "endCursor": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                231
            ],
            "edges": [
                230
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "node": [
                26
            ],
            "cursor": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                231
            ],
            "edges": [
                233
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                24
            ],
            "cursor": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                231
            ],
            "edges": [
                235
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                231
            ],
            "edges": [
                235
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                239
            ],
            "value": [
                3
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
                4
            ],
            "domain": [
                1
            ],
            "records": [
                240
            ],
            "isCustomDomainEnabled": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicates": [
                46
            ],
            "predicateGroups": [
                44
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
                245
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                244
            ],
            "SMTP": [
                244
            ],
            "CALDAV": [
                244
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedAccountPublicDTO": {
            "id": [
                4
            ],
            "handle": [
                1
            ],
            "provider": [
                1
            ],
            "lastCredentialsRefreshedAt": [
                6
            ],
            "authFailedAt": [
                6
            ],
            "archivedAt": [
                6
            ],
            "handleAliases": [
                1
            ],
            "scopes": [
                1
            ],
            "lastSignedInAt": [
                6
            ],
            "userWorkspaceId": [
                4
            ],
            "connectionProviderId": [
                4
            ],
            "applicationId": [
                4
            ],
            "name": [
                1
            ],
            "visibility": [
                1
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "connectionParameters": [
                246
            ],
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                3
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
                3
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
                252
            ],
            "availableWorkspaces": [
                216
            ],
            "__typename": [
                1
            ]
        },
        "EmailPasswordResetLink": {
            "success": [
                3
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "InvalidatePassword": {
            "success": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceUrlsAndId": {
            "workspaceUrls": [
                175
            ],
            "id": [
                4
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
                257
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
                4
            ],
            "email": [
                1
            ],
            "hasPassword": [
                3
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
                175
            ],
            "__typename": [
                1
            ]
        },
        "SubdomainAvailabilityDTO": {
            "isValid": [
                3
            ],
            "available": [
                3
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
                252
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
                3
            ],
            "availableWorkspacesCount": [
                16
            ],
            "isEmailVerified": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                3
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
                257
            ],
            "__typename": [
                1
            ]
        },
        "StopImpersonation": {
            "canRestoreImpersonatorSession": [
                3
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
                271
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                201
            ],
            "usageByOperationType": [
                201
            ],
            "usageByModel": [
                201
            ],
            "timeSeries": [
                271
            ],
            "periodStart": [
                6
            ],
            "periodEnd": [
                6
            ],
            "userDailyUsage": [
                272
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationAuthorization": {
            "id": [
                4
            ],
            "applicationId": [
                4
            ],
            "workspaceId": [
                4
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
                6
            ],
            "lastUsedAt": [
                6
            ],
            "createdAt": [
                6
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "File": {
            "id": [
                4
            ],
            "path": [
                1
            ],
            "size": [
                16
            ],
            "createdAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "PublicDomain": {
            "id": [
                4
            ],
            "domain": [
                1
            ],
            "isValidated": [
                3
            ],
            "applicationId": [
                4
            ],
            "createdAt": [
                6
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
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "domain": [
                1
            ],
            "status": [
                281
            ],
            "verificationRecords": [
                279
            ],
            "verifiedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainStatus": {},
        "MessageChannel": {
            "id": [
                4
            ],
            "visibility": [
                283
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "type": [
                284
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                285
            ],
            "messageFolderImportPolicy": [
                286
            ],
            "excludeNonProfessionalEmails": [
                3
            ],
            "excludeGroupEmails": [
                3
            ],
            "pendingGroupEmailsAction": [
                287
            ],
            "isSyncEnabled": [
                3
            ],
            "syncedAt": [
                6
            ],
            "syncStatus": [
                288
            ],
            "syncStage": [
                289
            ],
            "syncStageStartedAt": [
                6
            ],
            "throttleFailureCount": [
                16
            ],
            "throttleRetryAfter": [
                6
            ],
            "connectedAccountId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "connectedAccount": [
                247
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
                282
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
                31
            ],
            "withoutEmail": [
                31
            ],
            "duplicateEmails": [
                31
            ],
            "globallyUnsubscribed": [
                31
            ],
            "topicUnsubscribed": [
                31
            ],
            "sendable": [
                31
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
        "CampaignSkippedRecipientsDTO": {
            "noEmail": [
                31
            ],
            "deduped": [
                31
            ],
            "overCap": [
                31
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
                31
            ],
            "skipped": [
                293
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppression": {
            "id": [
                4
            ],
            "createdAt": [
                6
            ],
            "emailAddress": [
                1
            ],
            "reason": [
                296
            ],
            "source": [
                297
            ],
            "unsubscribeTopicId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "MessageSuppressionReason": {},
        "MessageSuppressionSource": {},
        "MessageSuppressionList": {
            "records": [
                295
            ],
            "totalCount": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "UnsubscribeTopic": {
            "id": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                300
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
                302
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
                245
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
                304
            ],
            "SMTP": [
                304
            ],
            "CALDAV": [
                304
            ],
            "__typename": [
                1
            ]
        },
        "ConnectedImapSmtpCaldavAccount": {
            "id": [
                4
            ],
            "handle": [
                1
            ],
            "provider": [
                1
            ],
            "userWorkspaceId": [
                4
            ],
            "connectionParameters": [
                305
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "success": [
                3
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
                4
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
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessagePart": {
            "id": [
                4
            ],
            "messageId": [
                4
            ],
            "orderIndex": [
                31
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
                5
            ],
            "toolOutput": [
                5
            ],
            "state": [
                1
            ],
            "providerExecuted": [
                3
            ],
            "errorMessage": [
                1
            ],
            "errorDetails": [
                5
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
                4
            ],
            "fileUrl": [
                1
            ],
            "providerMetadata": [
                5
            ],
            "createdAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentResult": {
            "result": [
                5
            ],
            "error": [
                1
            ],
            "success": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ChannelSyncSuccess": {
            "success": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateCalendarEventOutput": {
            "success": [
                3
            ],
            "iCalUid": [
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
                5
            ],
            "indexBy": [
                1
            ],
            "keys": [
                1
            ],
            "series": [
                314
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                3
            ],
            "showDataLabels": [
                3
            ],
            "layout": [
                103
            ],
            "groupMode": [
                102
            ],
            "hasTooManyGroups": [
                3
            ],
            "formattedToRawLookup": [
                5
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
                316
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                317
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                3
            ],
            "showDataLabels": [
                3
            ],
            "hasTooManyGroups": [
                3
            ],
            "formattedToRawLookup": [
                5
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
                319
            ],
            "showLegend": [
                3
            ],
            "showDataLabels": [
                3
            ],
            "showCenterMetric": [
                3
            ],
            "hasTooManyGroups": [
                3
            ],
            "formattedToRawLookup": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "DuplicatedDashboard": {
            "id": [
                4
            ],
            "title": [
                1
            ],
            "pageLayoutId": [
                4
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
        "SendEmailOutput": {
            "success": [
                3
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
                3
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
                6
            ],
            "userId": [
                1
            ],
            "properties": [
                5
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "isCustom": [
                3
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "records": [
                324
            ],
            "totalCount": [
                31
            ],
            "pageInfo": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "Skill": {
            "id": [
                4
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
                3
            ],
            "isActive": [
                3
            ],
            "applicationId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AgentMessage": {
            "id": [
                4
            ],
            "threadId": [
                4
            ],
            "turnId": [
                4
            ],
            "agentId": [
                4
            ],
            "role": [
                1
            ],
            "status": [
                1
            ],
            "parts": [
                310
            ],
            "processedAt": [
                6
            ],
            "createdAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThread": {
            "id": [
                207
            ],
            "title": [
                1
            ],
            "totalInputTokens": [
                31
            ],
            "totalOutputTokens": [
                31
            ],
            "contextWindowTokens": [
                31
            ],
            "conversationSize": [
                31
            ],
            "totalInputCredits": [
                16
            ],
            "totalOutputCredits": [
                16
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "deletedAt": [
                6
            ],
            "lastMessageAt": [
                6
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
                31
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                330
            ],
            "estimatedTokenCount": [
                31
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
                5
            ],
            "maxSeq": [
                31
            ],
            "error": [
                332
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
                3
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
                5
            ],
            "__typename": [
                1
            ]
        },
        "StartWorkspaceSetupChatResult": {
            "outcome": [
                337
            ],
            "thread": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceSetupChatOutcome": {},
        "AgentTurnEvaluation": {
            "id": [
                4
            ],
            "turnId": [
                4
            ],
            "score": [
                31
            ],
            "comment": [
                1
            ],
            "createdAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AgentTurn": {
            "id": [
                4
            ],
            "threadId": [
                4
            ],
            "agentId": [
                4
            ],
            "evaluations": [
                338
            ],
            "messages": [
                328
            ],
            "createdAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceAiStats": {
            "conversationsCount": [
                31
            ],
            "skillsCount": [
                31
            ],
            "toolsCount": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "EnqueueJobResult": {
            "enqueued": [
                3
            ],
            "logicFunctionUniversalIdentifier": [
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
                5
            ],
            "scope": [
                343
            ],
            "__typename": [
                1
            ]
        },
        "AppKeyValueScope": {},
        "CalendarChannel": {
            "id": [
                4
            ],
            "handle": [
                1
            ],
            "syncStatus": [
                345
            ],
            "syncStage": [
                346
            ],
            "visibility": [
                347
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                348
            ],
            "isSyncEnabled": [
                3
            ],
            "syncedAt": [
                6
            ],
            "syncStageStartedAt": [
                6
            ],
            "throttleFailureCount": [
                16
            ],
            "connectedAccountId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
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
                4
            ],
            "name": [
                1
            ],
            "isSentFolder": [
                3
            ],
            "isSynced": [
                3
            ],
            "parentFolderId": [
                1
            ],
            "externalId": [
                1
            ],
            "pendingSyncAction": [
                350
            ],
            "messageChannelId": [
                4
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "MessageFolderPendingSyncAction": {},
        "CollectionHash": {
            "collectionName": [
                352
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
                4
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
                3
            ],
            "isSystem": [
                3
            ],
            "isRemote": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "MinimalView": {
            "id": [
                4
            ],
            "type": [
                67
            ],
            "key": [
                68
            ],
            "objectMetadataId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "MinimalMetadata": {
            "objectMetadataItems": [
                353
            ],
            "views": [
                354
            ],
            "collectionHashes": [
                351
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "navigationMenuItems": [
                153
            ],
            "navigationMenuItem": [
                153,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "applicationSdkClientChecksums": [
                79,
                {
                    "applicationId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "applicationVendorChecksum": [
                1,
                {
                    "applicationId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "isApplicationStopped": [
                3,
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
                148
            ],
            "getViewFilterGroups": [
                58,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                58,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                60,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                60,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                66,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        67,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                66,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                63,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                63,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                56,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                56,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                65,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                65,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "apiKeys": [
                7
            ],
            "getApiKeyRoles": [
                51
            ],
            "apiKey": [
                7,
                {
                    "input": [
                        357,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "currentUserSessions": [
                162
            ],
            "getInviteSuggestions": [
                169
            ],
            "applicationConnectionProviders": [
                127,
                {
                    "applicationId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "billingPortalSession": [
                167,
                {
                    "returnUrlPath": [
                        1
                    ],
                    "forPaymentMethodUpdate": [
                        3
                    ]
                }
            ],
            "listPlans": [
                165
            ],
            "getResourceCreditUsage": [
                164
            ],
            "findWorkspaceInvitations": [
                171
            ],
            "getApprovedAccessDomains": [
                149
            ],
            "getPageLayoutTabs": [
                123,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                123,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                124,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        125
                    ]
                }
            ],
            "getPageLayout": [
                124,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                83,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                83,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyAgents": [
                11
            ],
            "findOneAgent": [
                11,
                {
                    "input": [
                        358,
                        "AgentIdInput!"
                    ]
                }
            ],
            "objectRecordCounts": [
                228
            ],
            "mostlyEmptyFieldMetadataIds": [
                4,
                {
                    "objectMetadataId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "object": [
                28,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                232,
                {
                    "paging": [
                        30,
                        "CursorPaging!"
                    ],
                    "filter": [
                        359,
                        "ObjectFilter!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                22,
                {
                    "input": [
                        360,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                22
            ],
            "getAvailablePackages": [
                5,
                {
                    "input": [
                        360,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        360,
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
                        4,
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
                        4,
                        "UUID!"
                    ]
                }
            ],
            "currentWorkspace": [
                72
            ],
            "getPublicWorkspaceDataByDomain": [
                185,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                186,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                204,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                78,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                78
            ],
            "findOneApplicationRegistration": [
                78,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                178,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                176,
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
                202,
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
                52
            ],
            "findOneApplication": [
                52,
                {
                    "id": [
                        4
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                218,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                222,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                218,
                {
                    "isVetted": [
                        3,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                222,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "field": [
                24,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                237,
                {
                    "paging": [
                        30,
                        "CursorPaging!"
                    ],
                    "filter": [
                        33,
                        "FieldFilter!"
                    ]
                }
            ],
            "getViewGroups": [
                62,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getRoles": [
                51
            ],
            "previewMessageCampaignAudience": [
                291,
                {
                    "input": [
                        361,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "messageSuppressions": [
                298,
                {
                    "input": [
                        362,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                299
            ],
            "myMessageChannels": [
                282,
                {
                    "connectedAccountId": [
                        4
                    ]
                }
            ],
            "getEmailingDomains": [
                280
            ],
            "myConnectedAccounts": [
                247
            ],
            "getToolIndex": [
                309
            ],
            "getToolInputSchema": [
                5,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "webhooks": [
                308
            ],
            "webhook": [
                308,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "myMessageFolders": [
                349,
                {
                    "messageChannelId": [
                        4
                    ]
                }
            ],
            "myCalendarChannels": [
                344,
                {
                    "connectedAccountId": [
                        4
                    ]
                }
            ],
            "minimalMetadata": [
                355
            ],
            "appKeyValue": [
                342,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        343
                    ]
                }
            ],
            "appConnections": [
                206,
                {
                    "filter": [
                        363
                    ]
                }
            ],
            "appConnection": [
                206,
                {
                    "id": [
                        207,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                340
            ],
            "chatThreads": [
                329
            ],
            "chatThread": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                328,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                333,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                331
            ],
            "skills": [
                327
            ],
            "skill": [
                327,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                339,
                {
                    "agentId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                267,
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
                268,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                72,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                262,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                263
            ],
            "validatePasswordResetToken": [
                260,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "currentUser": [
                75
            ],
            "getSSOIdentityProviders": [
                212
            ],
            "eventLogs": [
                326,
                {
                    "input": [
                        364,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                320,
                {
                    "input": [
                        368,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                318,
                {
                    "input": [
                        369,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                315,
                {
                    "input": [
                        370,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                306,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                301,
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
                        3
                    ]
                }
            ],
            "getAddressDetails": [
                303,
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
            "getUsageAnalytics": [
                273,
                {
                    "input": [
                        371
                    ]
                }
            ],
            "findManyPublicDomains": [
                278
            ],
            "currentUserApplicationAuthorizations": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentIdInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFilter": {
            "and": [
                359
            ],
            "or": [
                359
            ],
            "id": [
                34
            ],
            "isRemote": [
                35
            ],
            "isActive": [
                35
            ],
            "isSystem": [
                35
            ],
            "isUIEditable": [
                35
            ],
            "isUICreatable": [
                35
            ],
            "isUIReadOnly": [
                35
            ],
            "isSearchable": [
                35
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                207
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
                296
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                4
            ],
            "limit": [
                31
            ],
            "offset": [
                31
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
        "EventLogQueryInput": {
            "table": [
                365
            ],
            "filters": [
                366
            ],
            "first": [
                31
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
                367
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
                6
            ],
            "end": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataInput": {
            "objectMetadataId": [
                4
            ],
            "configuration": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "LineChartDataInput": {
            "objectMetadataId": [
                4
            ],
            "configuration": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "BarChartDataInput": {
            "objectMetadataId": [
                4
            ],
            "configuration": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalyticsInput": {
            "periodStart": [
                6
            ],
            "periodEnd": [
                6
            ],
            "userWorkspaceId": [
                1
            ],
            "operationTypes": [
                372
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "Mutation": {
            "addQueryToEventStream": [
                3,
                {
                    "input": [
                        374,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                3,
                {
                    "input": [
                        375,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                153,
                {
                    "inputs": [
                        376,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                153,
                {
                    "input": [
                        376,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                153,
                {
                    "inputs": [
                        377,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                153,
                {
                    "input": [
                        377,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                153,
                {
                    "ids": [
                        4,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                153,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                151,
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
                        379,
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
                150,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                3
            ],
            "releaseEnterpriseServerBinding": [
                147
            ],
            "setEnterpriseKey": [
                147,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadEmailAttachmentFile": [
                150,
                {
                    "file": [
                        380,
                        "Upload!"
                    ]
                }
            ],
            "uploadAiChatFile": [
                150,
                {
                    "file": [
                        380,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkflowFile": [
                150,
                {
                    "file": [
                        380,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                150,
                {
                    "file": [
                        380,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                150,
                {
                    "file": [
                        380,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFile": [
                150,
                {
                    "file": [
                        380,
                        "Upload!"
                    ],
                    "fieldMetadataId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                150,
                {
                    "file": [
                        380,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                58,
                {
                    "input": [
                        381,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                58,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        382,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilter": [
                60,
                {
                    "input": [
                        383,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                60,
                {
                    "input": [
                        384,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                60,
                {
                    "input": [
                        386,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                60,
                {
                    "input": [
                        387,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "createView": [
                66,
                {
                    "input": [
                        388,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                66,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        389,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "deleteView": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "upsertViewWidget": [
                66,
                {
                    "input": [
                        390,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                63,
                {
                    "input": [
                        396,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                63,
                {
                    "input": [
                        397,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                3,
                {
                    "input": [
                        399,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                3,
                {
                    "input": [
                        400,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "updateViewField": [
                56,
                {
                    "input": [
                        401,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                56,
                {
                    "input": [
                        403,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                56,
                {
                    "inputs": [
                        403,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                56,
                {
                    "input": [
                        404,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                56,
                {
                    "input": [
                        405,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                65,
                {
                    "input": [
                        406,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                65,
                {
                    "input": [
                        408,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                65,
                {
                    "inputs": [
                        408,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                65,
                {
                    "input": [
                        409,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                65,
                {
                    "input": [
                        410,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                66,
                {
                    "input": [
                        411,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createApiKey": [
                7,
                {
                    "input": [
                        414,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                7,
                {
                    "input": [
                        415,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                7,
                {
                    "input": [
                        416,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                3,
                {
                    "apiKeyId": [
                        4,
                        "UUID!"
                    ],
                    "roleId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "revokeUserSession": [
                3,
                {
                    "userSessionId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "revokeAllOtherUserSessions": [
                31
            ],
            "skipSyncEmailOnboardingStep": [
                170
            ],
            "completeBookCallOnboardingStep": [
                170
            ],
            "triggerInstallAppsOnboardingStep": [
                170,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                3,
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
                        4,
                        "UUID!"
                    ]
                }
            ],
            "checkoutSession": [
                167,
                {
                    "recurringInterval": [
                        135,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        131,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        3,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "createSubscriptionPaymentIntent": [
                166,
                {
                    "recurringInterval": [
                        135,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        131,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        3,
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
                166
            ],
            "switchSubscriptionInterval": [
                168
            ],
            "switchBillingPlan": [
                168
            ],
            "cancelSwitchBillingPlan": [
                168
            ],
            "cancelSwitchBillingInterval": [
                168
            ],
            "setResourceCreditSubscriptionPrice": [
                168,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                163
            ],
            "cancelSwitchResourceCreditPrice": [
                168
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
                172,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                172,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ],
                    "roleId": [
                        4
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                149,
                {
                    "input": [
                        417,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                3,
                {
                    "input": [
                        418,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                149,
                {
                    "input": [
                        419,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                123,
                {
                    "input": [
                        420,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                123,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        421,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayout": [
                124,
                {
                    "input": [
                        422,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                124,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        423,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "destroyPageLayout": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                124,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        424,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                124,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                83,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                123,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                83,
                {
                    "input": [
                        428,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                83,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        429,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneAgent": [
                11,
                {
                    "input": [
                        430,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                11,
                {
                    "input": [
                        431,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                11,
                {
                    "input": [
                        358,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createOneObject": [
                28,
                {
                    "input": [
                        432,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                28,
                {
                    "input": [
                        434,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                28,
                {
                    "input": [
                        435,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "createOneIndex": [
                26,
                {
                    "input": [
                        437,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                26,
                {
                    "input": [
                        440,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                22,
                {
                    "input": [
                        360,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                22,
                {
                    "input": [
                        441,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                145,
                {
                    "input": [
                        442,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                3,
                {
                    "input": [
                        443,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                15,
                {
                    "input": [
                        445,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                15,
                {
                    "input": [
                        446,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                15,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                15,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                14,
                {
                    "input": [
                        447,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                14,
                {
                    "input": [
                        448,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                14,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                72,
                {
                    "data": [
                        450,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                72,
                {
                    "data": [
                        451,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                72
            ],
            "checkCustomDomainValidRecords": [
                241
            ],
            "enrichWorkspaceCompany": [
                223
            ],
            "upgradeApplication": [
                3,
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
                203,
                {
                    "input": [
                        452,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                78,
                {
                    "input": [
                        453,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                205,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationRegistrationVariable": [
                2,
                {
                    "input": [
                        455,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                2,
                {
                    "input": [
                        456,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "deleteApplicationRegistrationVariable": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadAppTarball": [
                78,
                {
                    "file": [
                        380,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                78,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                78,
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
                3,
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
                52,
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
            "updateApplication": [
                52,
                {
                    "id": [
                        4,
                        "UUID!"
                    ],
                    "input": [
                        458,
                        "UpdateApplicationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                3,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "syncMarketplaceCatalog": [
                3
            ],
            "createOneField": [
                24,
                {
                    "input": [
                        459,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                24,
                {
                    "input": [
                        461,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                24,
                {
                    "input": [
                        463,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                62,
                {
                    "input": [
                        464,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                62,
                {
                    "inputs": [
                        464,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                62,
                {
                    "input": [
                        465,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                62,
                {
                    "inputs": [
                        465,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                62,
                {
                    "input": [
                        467,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                62,
                {
                    "input": [
                        468,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                38,
                {
                    "workspaceMemberId": [
                        4,
                        "UUID!"
                    ],
                    "roleId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createOneRole": [
                51,
                {
                    "createRoleInput": [
                        469,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                51,
                {
                    "updateRoleInput": [
                        470,
                        "UpdateRoleInput!"
                    ]
                }
            ],
            "deleteOneRole": [
                1,
                {
                    "roleId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "upsertObjectPermissions": [
                48,
                {
                    "upsertObjectPermissionsInput": [
                        472,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                49,
                {
                    "upsertPermissionFlagsInput": [
                        474,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                43,
                {
                    "upsertFieldPermissionsInput": [
                        475,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                242,
                {
                    "input": [
                        477,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                3,
                {
                    "agentId": [
                        4,
                        "UUID!"
                    ],
                    "roleId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "removeRoleFromAgent": [
                3,
                {
                    "agentId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "sendEmailViaEmailingDomain": [
                292,
                {
                    "input": [
                        480,
                        "SendEmailViaDomainInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                294,
                {
                    "input": [
                        481,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                292,
                {
                    "input": [
                        482,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                299,
                {
                    "input": [
                        483,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                299,
                {
                    "input": [
                        484,
                        "UpdateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "deleteUnsubscribeTopic": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateMessageChannel": [
                282,
                {
                    "input": [
                        485,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                290,
                {
                    "input": [
                        487,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                282,
                {
                    "input": [
                        488,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                282,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createEmailingDomain": [
                280,
                {
                    "input": [
                        489,
                        "CreateEmailingDomainInput!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                3,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                280,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                247,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "runAgent": [
                311,
                {
                    "input": [
                        490,
                        "RunAgentInput!"
                    ]
                }
            ],
            "createWebhook": [
                308,
                {
                    "input": [
                        493,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                308,
                {
                    "input": [
                        494,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                308,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "updateMessageFolder": [
                349,
                {
                    "input": [
                        496,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                349,
                {
                    "input": [
                        498,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                344,
                {
                    "input": [
                        499,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                342,
                {
                    "input": [
                        501,
                        "SetAppKeyValueInput!"
                    ]
                }
            ],
            "deleteAppKeyValue": [
                3,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        343
                    ]
                }
            ],
            "enqueueJob": [
                341,
                {
                    "input": [
                        502,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "createChatThread": [
                329
            ],
            "sendChatMessage": [
                334,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ],
                    "text": [
                        1,
                        "String!"
                    ],
                    "messageId": [
                        4,
                        "UUID!"
                    ],
                    "browsingContext": [
                        5
                    ],
                    "modelId": [
                        1
                    ],
                    "fileAttachments": [
                        503,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "retryChatMessage": [
                334,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ],
                    "modelId": [
                        1
                    ]
                }
            ],
            "answerAgentChatQuestion": [
                334,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ],
                    "messageId": [
                        4,
                        "UUID!"
                    ],
                    "answers": [
                        504,
                        "[AgentChatQuestionAnswerInput!]!"
                    ],
                    "modelId": [
                        1
                    ]
                }
            ],
            "stopAgentChatStream": [
                3,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "renameChatThread": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ],
                    "title": [
                        1,
                        "String!"
                    ]
                }
            ],
            "archiveChatThread": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "unarchiveChatThread": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "deleteChatThread": [
                3,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                3,
                {
                    "messageId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "startWorkspaceSetupChat": [
                336,
                {
                    "companyContext": [
                        5
                    ]
                }
            ],
            "createSkill": [
                327,
                {
                    "input": [
                        505,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                327,
                {
                    "input": [
                        506,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                327,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                327,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                327,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                338,
                {
                    "turnId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                339,
                {
                    "agentId": [
                        4,
                        "UUID!"
                    ],
                    "input": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                255,
                {
                    "input": [
                        507,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                266,
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
                253,
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
                261,
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
                253,
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
                265,
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
                253,
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
                258,
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
                        4
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
                258,
                {
                    "input": [
                        508
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                150,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        380,
                        "Upload!"
                    ]
                }
            ],
            "generateTransientToken": [
                259
            ],
            "getAuthTokensFromLoginToken": [
                265,
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
                265,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "authorizeApp": [
                251,
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
                    ]
                }
            ],
            "renewToken": [
                265,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "signOut": [
                3,
                {
                    "refreshToken": [
                        1
                    ]
                }
            ],
            "generateApiKeyToken": [
                264,
                {
                    "apiKeyId": [
                        4,
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
                254,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        4
                    ],
                    "captchaToken": [
                        1
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                256,
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
                249,
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
                249
            ],
            "deleteTwoFactorAuthenticationMethod": [
                248,
                {
                    "twoFactorAuthenticationMethodId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                250,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                75
            ],
            "deleteUserFromWorkspace": [
                54,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                3,
                {
                    "input": [
                        509,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "updateUserEmail": [
                3,
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
                208,
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
                213,
                {
                    "input": [
                        510,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                213,
                {
                    "input": [
                        511,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                209,
                {
                    "input": [
                        512,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                210,
                {
                    "input": [
                        513,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                323,
                {
                    "event": [
                        1,
                        "String!"
                    ],
                    "recordId": [
                        4,
                        "UUID!"
                    ],
                    "objectMetadataId": [
                        4,
                        "UUID!"
                    ],
                    "properties": [
                        5
                    ]
                }
            ],
            "trackAnalytics": [
                323,
                {
                    "type": [
                        514,
                        "AnalyticsType!"
                    ],
                    "name": [
                        1
                    ],
                    "event": [
                        1
                    ],
                    "properties": [
                        5
                    ]
                }
            ],
            "duplicateDashboard": [
                321,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                269,
                {
                    "userId": [
                        4,
                        "UUID!"
                    ],
                    "workspaceId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "stopImpersonation": [
                270
            ],
            "createCalendarEvent": [
                313,
                {
                    "input": [
                        515,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                322,
                {
                    "input": [
                        516,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                312,
                {
                    "connectedAccountId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                307,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        518,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        4
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                173,
                {
                    "input": [
                        520,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                278,
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
                3,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkPublicDomainValidRecords": [
                241,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                275,
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
                276,
                {
                    "manifest": [
                        5,
                        "JSON!"
                    ],
                    "dryRun": [
                        3
                    ]
                }
            ],
            "uploadApplicationFile": [
                277,
                {
                    "file": [
                        380,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        379,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "revokeApplicationAuthorization": [
                3,
                {
                    "applicationAuthorizationId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "generateApplicationToken": [
                13,
                {
                    "applicationId": [
                        4,
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
                5
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
                4
            ],
            "userWorkspaceId": [
                4
            ],
            "targetRecordId": [
                4
            ],
            "targetObjectMetadataId": [
                4
            ],
            "viewId": [
                4
            ],
            "type": [
                154
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
                4
            ],
            "pageLayoutId": [
                4
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
                4
            ],
            "update": [
                378
            ],
            "__typename": [
                1
            ]
        },
        "UpdateNavigationMenuItemInput": {
            "folderId": [
                4
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "FileFolder": {},
        "Upload": {},
        "CreateViewFilterGroupInput": {
            "id": [
                4
            ],
            "parentViewFilterGroupId": [
                4
            ],
            "logicalOperator": [
                59
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "viewId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterGroupInput": {
            "id": [
                4
            ],
            "parentViewFilterGroupId": [
                4
            ],
            "logicalOperator": [
                59
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "viewId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFilterInput": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "operand": [
                61
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                4
            ],
            "viewId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInput": {
            "id": [
                4
            ],
            "update": [
                385
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFilterInputUpdates": {
            "fieldMetadataId": [
                4
            ],
            "operand": [
                61
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFilterInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFilterInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewInput": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                4
            ],
            "type": [
                67
            ],
            "key": [
                68
            ],
            "icon": [
                1
            ],
            "position": [
                16
            ],
            "isCompact": [
                3
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "kanbanColumnWidth": [
                31
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                57
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
            ],
            "calendarFieldMetadataId": [
                4
            ],
            "calendarEndFieldMetadataId": [
                4
            ],
            "mainGroupByFieldMetadataId": [
                4
            ],
            "visibility": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewInput": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "type": [
                67
            ],
            "icon": [
                1
            ],
            "position": [
                16
            ],
            "isCompact": [
                3
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                57
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
            ],
            "calendarFieldMetadataId": [
                4
            ],
            "calendarEndFieldMetadataId": [
                4
            ],
            "visibility": [
                71
            ],
            "mainGroupByFieldMetadataId": [
                4
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "kanbanColumnWidth": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "widgetId": [
                4
            ],
            "view": [
                391
            ],
            "viewFields": [
                392
            ],
            "viewFilters": [
                393
            ],
            "viewFilterGroups": [
                394
            ],
            "viewSorts": [
                395
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "type": [
                67
            ],
            "mainGroupByFieldMetadataId": [
                4
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                57
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "kanbanColumnWidth": [
                31
            ],
            "calendarLayout": [
                70
            ],
            "calendarFieldMetadataId": [
                4
            ],
            "calendarEndFieldMetadataId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFieldInput": {
            "viewFieldId": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "isVisible": [
                3
            ],
            "position": [
                16
            ],
            "size": [
                16
            ],
            "aggregateOperation": [
                57
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterInput": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "operand": [
                61
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                16
            ],
            "subFieldName": [
                1
            ],
            "relationTargetFieldMetadataId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewFilterGroupInput": {
            "id": [
                4
            ],
            "parentViewFilterGroupId": [
                4
            ],
            "logicalOperator": [
                59
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
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "direction": [
                64
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewSortInput": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "direction": [
                64
            ],
            "subFieldName": [
                1
            ],
            "viewId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInput": {
            "id": [
                4
            ],
            "update": [
                398
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                64
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewSortInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                4
            ],
            "update": [
                402
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "isVisible": [
                3
            ],
            "size": [
                16
            ],
            "position": [
                16
            ],
            "aggregateOperation": [
                57
            ],
            "viewFieldGroupId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewFieldInput": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "viewId": [
                4
            ],
            "isVisible": [
                3
            ],
            "size": [
                16
            ],
            "position": [
                16
            ],
            "aggregateOperation": [
                57
            ],
            "viewFieldGroupId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldGroupInput": {
            "id": [
                4
            ],
            "update": [
                407
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
                3
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
                4
            ],
            "name": [
                1
            ],
            "viewId": [
                4
            ],
            "position": [
                16
            ],
            "isVisible": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DeleteViewFieldGroupInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewFieldGroupInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetInput": {
            "widgetId": [
                4
            ],
            "groups": [
                412
            ],
            "fields": [
                413
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetGroupInput": {
            "id": [
                4
            ],
            "name": [
                1
            ],
            "position": [
                16
            ],
            "isVisible": [
                3
            ],
            "fields": [
                413
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "viewFieldId": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "isVisible": [
                3
            ],
            "position": [
                16
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApiKeyInput": {
            "id": [
                4
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
                4
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
                4
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
                4
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
                4
            ],
            "layoutMode": [
                87
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
                87
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
                125
            ],
            "objectMetadataId": [
                4
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
                125
            ],
            "objectMetadataId": [
                4
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
                125
            ],
            "objectMetadataId": [
                4
            ],
            "tabs": [
                425
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutTabWithWidgetsInput": {
            "id": [
                4
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
                87
            ],
            "widgets": [
                426
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetWithIdInput": {
            "id": [
                4
            ],
            "pageLayoutTabId": [
                4
            ],
            "title": [
                1
            ],
            "type": [
                84
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                427
            ],
            "position": [
                5
            ],
            "configuration": [
                5
            ],
            "conditionalDisplay": [
                5
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GridPositionInput": {
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
        "CreatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                4
            ],
            "title": [
                1
            ],
            "type": [
                84
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                427
            ],
            "position": [
                5
            ],
            "configuration": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                4
            ],
            "title": [
                1
            ],
            "type": [
                84
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                427
            ],
            "position": [
                5
            ],
            "configuration": [
                5
            ],
            "conditionalDisplay": [
                5
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
                4
            ],
            "responseFormat": [
                5
            ],
            "modelConfiguration": [
                5
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
                4
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
                4
            ],
            "responseFormat": [
                5
            ],
            "modelConfiguration": [
                5
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
                433
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
                3
            ],
            "isRemote": [
                3
            ],
            "primaryKeyColumnType": [
                1
            ],
            "primaryKeyFieldMetadataSettings": [
                5
            ],
            "isLabelSyncedWithName": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneObjectInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneObjectInput": {
            "update": [
                436
            ],
            "id": [
                4
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
                3
            ],
            "labelIdentifierFieldMetadataId": [
                4
            ],
            "imageIdentifierFieldMetadataId": [
                4
            ],
            "isLabelSyncedWithName": [
                3
            ],
            "isSearchable": [
                3
            ],
            "openRecordIn": [
                29
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                438
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexInput": {
            "objectMetadataId": [
                4
            ],
            "fields": [
                439
            ],
            "indexType": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "CreateIndexFieldInput": {
            "fieldMetadataId": [
                4
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateLogicFunctionFromSourceInput": {
            "id": [
                4
            ],
            "universalIdentifier": [
                4
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
                5
            ],
            "cronTriggerSettings": [
                5
            ],
            "databaseEventTriggerSettings": [
                5
            ],
            "httpRouteTriggerSettings": [
                5
            ],
            "serverRouteTriggerSettings": [
                5
            ],
            "toolTriggerSettings": [
                5
            ],
            "workflowActionTriggerSettings": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteOneLogicFunctionInput": {
            "id": [
                4
            ],
            "payload": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "UpdateLogicFunctionFromSourceInput": {
            "id": [
                4
            ],
            "update": [
                444
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
                5
            ],
            "databaseEventTriggerSettings": [
                5
            ],
            "httpRouteTriggerSettings": [
                5
            ],
            "toolTriggerSettings": [
                5
            ],
            "workflowActionTriggerSettings": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "CreateCommandMenuItemInput": {
            "workflowVersionId": [
                4
            ],
            "frontComponentId": [
                4
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
                3
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
            "availabilityObjectMetadataId": [
                4
            ],
            "payload": [
                5
            ],
            "pageLayoutId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCommandMenuItemInput": {
            "id": [
                4
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
                3
            ],
            "availabilityType": [
                18
            ],
            "availabilityObjectMetadataId": [
                4
            ],
            "engineComponentKey": [
                17
            ],
            "hotKeys": [
                1
            ],
            "pageLayoutId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateFrontComponentInput": {
            "id": [
                4
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
                4
            ],
            "update": [
                449
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
                3
            ],
            "workspaceDiscoverability": [
                73
            ],
            "allowImpersonation": [
                3
            ],
            "isGoogleAuthEnabled": [
                3
            ],
            "isMicrosoftAuthEnabled": [
                3
            ],
            "isPasswordAuthEnabled": [
                3
            ],
            "isGoogleAuthBypassEnabled": [
                3
            ],
            "isMicrosoftAuthBypassEnabled": [
                3
            ],
            "isPasswordAuthBypassEnabled": [
                3
            ],
            "defaultRoleId": [
                4
            ],
            "isTwoFactorAuthenticationEnforced": [
                3
            ],
            "trashRetentionDays": [
                16
            ],
            "eventLogRetentionDays": [
                16
            ],
            "fastModel": [
                1
            ],
            "smartModel": [
                1
            ],
            "aiAdditionalInstructions": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "enabledAiModelIds": [
                1
            ],
            "useRecommendedModels": [
                3
            ],
            "isInternalMessagesImportEnabled": [
                3
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
                454
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
                3
            ],
            "isPreInstalled": [
                3
            ],
            "isVetted": [
                3
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
                3
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
                457
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
                3
            ],
            "description": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationInput": {
            "autoUpgrade": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneFieldMetadataInput": {
            "field": [
                460
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                25
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
                3
            ],
            "isSystem": [
                3
            ],
            "isUIEditable": [
                3
            ],
            "isUIReadOnly": [
                3
            ],
            "isNullable": [
                3
            ],
            "isUnique": [
                3
            ],
            "defaultValue": [
                5
            ],
            "options": [
                5
            ],
            "settings": [
                5
            ],
            "objectMetadataId": [
                4
            ],
            "isLabelSyncedWithName": [
                3
            ],
            "isRemoteCreation": [
                3
            ],
            "relationCreationPayload": [
                5
            ],
            "morphRelationsCreationPayload": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "UpdateOneFieldMetadataInput": {
            "id": [
                4
            ],
            "update": [
                462
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
                3
            ],
            "isSystem": [
                3
            ],
            "isUIEditable": [
                3
            ],
            "isUIReadOnly": [
                3
            ],
            "isNullable": [
                3
            ],
            "isUnique": [
                3
            ],
            "defaultValue": [
                5
            ],
            "options": [
                5
            ],
            "settings": [
                5
            ],
            "objectMetadataId": [
                4
            ],
            "isLabelSyncedWithName": [
                3
            ],
            "morphRelationsUpdatePayload": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "DeleteOneFieldInput": {
            "id": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "CreateViewGroupInput": {
            "id": [
                4
            ],
            "isVisible": [
                3
            ],
            "fieldValue": [
                1
            ],
            "position": [
                16
            ],
            "viewId": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInput": {
            "id": [
                4
            ],
            "update": [
                466
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewGroupInputUpdates": {
            "fieldMetadataId": [
                4
            ],
            "isVisible": [
                3
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "DestroyViewGroupInput": {
            "id": [
                4
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
                3
            ],
            "canAccessAllTools": [
                3
            ],
            "canReadAllObjectRecords": [
                3
            ],
            "canUpdateAllObjectRecords": [
                3
            ],
            "canSoftDeleteAllObjectRecords": [
                3
            ],
            "canDestroyAllObjectRecords": [
                3
            ],
            "canBeAssignedToUsers": [
                3
            ],
            "canBeAssignedToAgents": [
                3
            ],
            "canBeAssignedToApiKeys": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "update": [
                471
            ],
            "id": [
                4
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
                3
            ],
            "canAccessAllTools": [
                3
            ],
            "canReadAllObjectRecords": [
                3
            ],
            "canUpdateAllObjectRecords": [
                3
            ],
            "canSoftDeleteAllObjectRecords": [
                3
            ],
            "canDestroyAllObjectRecords": [
                3
            ],
            "canBeAssignedToUsers": [
                3
            ],
            "canBeAssignedToAgents": [
                3
            ],
            "canBeAssignedToApiKeys": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertObjectPermissionsInput": {
            "roleId": [
                4
            ],
            "objectPermissions": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "ObjectPermissionInput": {
            "objectMetadataId": [
                4
            ],
            "canReadObjectRecords": [
                3
            ],
            "canUpdateObjectRecords": [
                3
            ],
            "canSoftDeleteObjectRecords": [
                3
            ],
            "canDestroyObjectRecords": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertPermissionFlagsInput": {
            "roleId": [
                4
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
                4
            ],
            "fieldPermissions": [
                476
            ],
            "__typename": [
                1
            ]
        },
        "FieldPermissionInput": {
            "objectMetadataId": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "canReadFieldValue": [
                3
            ],
            "canUpdateFieldValue": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesInput": {
            "roleId": [
                4
            ],
            "objectMetadataId": [
                4
            ],
            "predicates": [
                478
            ],
            "predicateGroups": [
                479
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateInput": {
            "id": [
                4
            ],
            "fieldMetadataId": [
                4
            ],
            "operand": [
                47
            ],
            "value": [
                5
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
                4
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
                4
            ],
            "objectMetadataId": [
                4
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                4
            ],
            "logicalOperator": [
                45
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                16
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
        "CreateUnsubscribeTopicInput": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "visibility": [
                300
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
                300
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInput": {
            "id": [
                4
            ],
            "update": [
                486
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                283
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                285
            ],
            "messageFolderImportPolicy": [
                286
            ],
            "isSyncEnabled": [
                3
            ],
            "excludeNonProfessionalEmails": [
                3
            ],
            "excludeGroupEmails": [
                3
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
                4
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
            "messages": [
                491
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageInput": {
            "role": [
                492
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
                4
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
                4
            ],
            "update": [
                495
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
                4
            ],
            "update": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFoldersInput": {
            "ids": [
                4
            ],
            "update": [
                497
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInput": {
            "id": [
                4
            ],
            "update": [
                500
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                347
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                348
            ],
            "isSyncEnabled": [
                3
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
                5
            ],
            "scope": [
                343
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
                5
            ],
            "retryLimit": [
                31
            ],
            "delayMs": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "FileAttachmentInput": {
            "id": [
                4
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
                31
            ],
            "selectedOptionIndices": [
                31
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
                4
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
                4
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSOInput": {
            "identityProviderId": [
                4
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
                4
            ],
            "update": [
                5
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
                4
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
                4
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoInput": {
            "id": [
                4
            ],
            "status": [
                182
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
                3
            ],
            "timeZone": [
                1
            ],
            "attendees": [
                1
            ],
            "sendInvitations": [
                3
            ],
            "addConferencing": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "SendEmailInput": {
            "connectedAccountId": [
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
                517
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
                519
            ],
            "SMTP": [
                519
            ],
            "CALDAV": [
                519
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
                245
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "onEventSubscription": [
                161,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                243,
                {
                    "input": [
                        522,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                335,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                324,
                {
                    "table": [
                        365,
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
                4
            ],
            "applicationUniversalIdentifier": [
                4
            ],
            "name": [
                1
            ],
            "id": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "__typename": [
                1
            ]
        }
    }
}