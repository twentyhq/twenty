export default {
    "scalars": [
        1,
        3,
        4,
        6,
        8,
        11,
        12,
        14,
        15,
        18,
        21,
        22,
        23,
        24,
        36,
        37,
        44,
        47,
        49,
        60,
        62,
        64,
        67,
        70,
        71,
        72,
        73,
        74,
        76,
        79,
        80,
        85,
        88,
        93,
        96,
        97,
        99,
        102,
        103,
        109,
        123,
        131,
        132,
        140,
        141,
        142,
        144,
        152,
        163,
        166,
        168,
        172,
        174,
        179,
        180,
        187,
        190,
        193,
        206,
        231,
        294,
        304,
        305,
        306,
        307,
        309,
        310,
        311,
        312,
        313,
        314,
        315,
        318,
        320,
        329,
        336,
        343,
        379,
        462,
        474
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
                139
            ],
            "on_BillingLicensedProduct": [
                148
            ],
            "on_BillingMeteredProduct": [
                149
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
                29
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "DateTime": {},
        "ApplicationRegistrationVariable": {
            "id": [
                3
            ],
            "key": [
                1
            ],
            "description": [
                1
            ],
            "isSecret": [
                6
            ],
            "isRequired": [
                6
            ],
            "isFilled": [
                6
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
        "Boolean": {},
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
                8
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                6
            ],
            "isFeatured": [
                6
            ],
            "isPreInstalled": [
                6
            ],
            "logoUrl": [
                1
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isConfigured": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSourceType": {},
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
        "RowLevelPermissionPredicateGroup": {
            "id": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "logicalOperator": [
                12
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
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
        "Float": {},
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
                14
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
                11
            ],
            "roleId": [
                1
            ],
            "value": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "RowLevelPermissionPredicateOperand": {},
        "JSON": {},
        "ObjectPermission": {
            "objectMetadataId": [
                3
            ],
            "canReadObjectRecords": [
                6
            ],
            "canUpdateObjectRecords": [
                6
            ],
            "canSoftDeleteObjectRecords": [
                6
            ],
            "canDestroyObjectRecords": [
                6
            ],
            "restrictedFields": [
                15
            ],
            "rowLevelPermissionPredicates": [
                13
            ],
            "rowLevelPermissionPredicateGroups": [
                10
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
                78
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
                18
            ],
            "objectPermissions": [
                16
            ],
            "objectsPermissions": [
                16
            ],
            "twoFactorAuthenticationMethodSummary": [
                9
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
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
                19
            ],
            "userEmail": [
                1
            ],
            "colorScheme": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "locale": [
                1
            ],
            "calendarStartDay": [
                21
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                22
            ],
            "timeFormat": [
                23
            ],
            "roles": [
                29
            ],
            "userWorkspaceId": [
                3
            ],
            "numberFormat": [
                24
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "WorkspaceMemberDateFormatEnum": {},
        "WorkspaceMemberTimeFormatEnum": {},
        "WorkspaceMemberNumberFormatEnum": {},
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
                15
            ],
            "roleId": [
                3
            ],
            "isCustom": [
                6
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
                15
            ],
            "evaluationInputs": [
                1
            ],
            "__typename": [
                1
            ]
        },
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
                6
            ],
            "canUpdateFieldValue": [
                6
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
                6
            ],
            "canBeAssignedToUsers": [
                6
            ],
            "canBeAssignedToAgents": [
                6
            ],
            "canBeAssignedToApiKeys": [
                6
            ],
            "workspaceMembers": [
                20
            ],
            "agents": [
                25
            ],
            "apiKeys": [
                28
            ],
            "canUpdateAllSettings": [
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "canReadAllObjectRecords": [
                6
            ],
            "canUpdateAllObjectRecords": [
                6
            ],
            "canSoftDeleteAllObjectRecords": [
                6
            ],
            "canDestroyAllObjectRecords": [
                6
            ],
            "permissionFlags": [
                27
            ],
            "objectPermissions": [
                16
            ],
            "fieldPermissions": [
                26
            ],
            "rowLevelPermissionPredicates": [
                13
            ],
            "rowLevelPermissionPredicateGroups": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationSummary": {
            "id": [
                3
            ],
            "latestAvailableVersion": [
                1
            ],
            "sourceType": [
                8
            ],
            "logoUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
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
            "isSecret": [
                6
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
                32
            ],
            "applicationRefreshToken": [
                32
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
                6
            ],
            "usesSdkClient": [
                6
            ],
            "applicationTokenPair": [
                33
            ],
            "applicationVariables": [
                15
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
                34
            ],
            "engineComponentKey": [
                36
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
                11
            ],
            "isPinned": [
                6
            ],
            "availabilityType": [
                37
            ],
            "payload": [
                38
            ],
            "hotKeys": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "availabilityObjectMetadataId": [
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
        "EngineComponentKey": {},
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_PathCommandMenuItemPayload": [
                39
            ],
            "on_ObjectMetadataCommandMenuItemPayload": [
                40
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
                11
            ],
            "sourceHandlerPath": [
                1
            ],
            "handlerName": [
                1
            ],
            "cronTriggerSettings": [
                15
            ],
            "databaseEventTriggerSettings": [
                15
            ],
            "httpRouteTriggerSettings": [
                15
            ],
            "toolTriggerSettings": [
                15
            ],
            "workflowActionTriggerSettings": [
                15
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
        "StandardOverrides": {
            "label": [
                1
            ],
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "translations": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "Field": {
            "id": [
                3
            ],
            "universalIdentifier": [
                1
            ],
            "type": [
                44
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
            "standardOverrides": [
                42
            ],
            "isCustom": [
                6
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isNullable": [
                6
            ],
            "isUnique": [
                6
            ],
            "defaultValue": [
                15
            ],
            "options": [
                15
            ],
            "settings": [
                15
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
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
            "relation": [
                205
            ],
            "morphRelations": [
                205
            ],
            "object": [
                55
            ],
            "__typename": [
                1
            ]
        },
        "FieldMetadataType": {},
        "IndexField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "order": [
                11
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
                6
            ],
            "isUnique": [
                6
            ],
            "indexWhereClause": [
                1
            ],
            "indexType": [
                47
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                45
            ],
            "objectMetadata": [
                213,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        50,
                        "ObjectFilter!"
                    ]
                }
            ],
            "indexFieldMetadatas": [
                211,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        53,
                        "IndexFieldFilter!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "CursorPaging": {
            "before": [
                49
            ],
            "after": [
                49
            ],
            "first": [
                21
            ],
            "last": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ObjectFilter": {
            "and": [
                50
            ],
            "or": [
                50
            ],
            "id": [
                51
            ],
            "isCustom": [
                52
            ],
            "isRemote": [
                52
            ],
            "isActive": [
                52
            ],
            "isSystem": [
                52
            ],
            "isUIReadOnly": [
                52
            ],
            "isSearchable": [
                52
            ],
            "__typename": [
                1
            ]
        },
        "UUIDFilterComparison": {
            "is": [
                6
            ],
            "isNot": [
                6
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
                6
            ],
            "isNot": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "IndexFieldFilter": {
            "and": [
                53
            ],
            "or": [
                53
            ],
            "id": [
                51
            ],
            "fieldMetadataId": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "ObjectStandardOverrides": {
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
            "color": [
                1
            ],
            "translations": [
                15
            ],
            "__typename": [
                1
            ]
        },
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
            "standardOverrides": [
                54
            ],
            "shortcut": [
                1
            ],
            "color": [
                1
            ],
            "isCustom": [
                6
            ],
            "isRemote": [
                6
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isSearchable": [
                6
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
                6
            ],
            "duplicateCriteria": [
                1
            ],
            "fieldsList": [
                43
            ],
            "indexMetadataList": [
                46
            ],
            "fields": [
                218,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        56,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                216,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        57,
                        "IndexFilter!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "FieldFilter": {
            "and": [
                56
            ],
            "or": [
                56
            ],
            "id": [
                51
            ],
            "isCustom": [
                52
            ],
            "isActive": [
                52
            ],
            "isSystem": [
                52
            ],
            "isUIReadOnly": [
                52
            ],
            "objectMetadataId": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                57
            ],
            "or": [
                57
            ],
            "id": [
                51
            ],
            "isCustom": [
                52
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
            "logo": [
                1
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
                15
            ],
            "applicationRegistrationId": [
                3
            ],
            "canBeUninstalled": [
                6
            ],
            "defaultRoleId": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                3
            ],
            "defaultLogicFunctionRole": [
                29
            ],
            "agents": [
                25
            ],
            "frontComponents": [
                34
            ],
            "commandMenuItems": [
                35
            ],
            "logicFunctions": [
                41
            ],
            "objects": [
                55
            ],
            "applicationVariables": [
                31
            ],
            "applicationRegistration": [
                30
            ],
            "__typename": [
                1
            ]
        },
        "ViewField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                6
            ],
            "size": [
                11
            ],
            "position": [
                11
            ],
            "aggregateOperation": [
                60
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
                6
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                6
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
                62
            ],
            "positionInViewFilterGroup": [
                11
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
                64
            ],
            "value": [
                15
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                11
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
                6
            ],
            "fieldValue": [
                1
            ],
            "position": [
                11
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
                67
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
                11
            ],
            "isVisible": [
                6
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
                6
            ],
            "deletedAt": [
                4
            ],
            "viewFields": [
                59
            ],
            "isOverridden": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "View": {
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
                70
            ],
            "key": [
                71
            ],
            "icon": [
                1
            ],
            "position": [
                11
            ],
            "isCompact": [
                6
            ],
            "isCustom": [
                6
            ],
            "openRecordIn": [
                72
            ],
            "kanbanAggregateOperation": [
                60
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                6
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "workspaceId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                73
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
                59
            ],
            "viewFilters": [
                63
            ],
            "viewFilterGroups": [
                61
            ],
            "viewSorts": [
                66
            ],
            "viewGroups": [
                65
            ],
            "viewFieldGroups": [
                68
            ],
            "visibility": [
                74
            ],
            "createdByUserWorkspaceId": [
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
                6
            ],
            "isPublicInviteLinkEnabled": [
                6
            ],
            "trashRetentionDays": [
                11
            ],
            "eventLogRetentionDays": [
                11
            ],
            "workspaceMembersCount": [
                11
            ],
            "activationStatus": [
                76
            ],
            "views": [
                69
            ],
            "viewFields": [
                59
            ],
            "viewFilters": [
                63
            ],
            "viewFilterGroups": [
                61
            ],
            "viewGroups": [
                65
            ],
            "viewSorts": [
                66
            ],
            "metadataVersion": [
                11
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
                6
            ],
            "isGoogleAuthBypassEnabled": [
                6
            ],
            "isTwoFactorAuthenticationEnforced": [
                6
            ],
            "isPasswordAuthEnabled": [
                6
            ],
            "isPasswordAuthBypassEnabled": [
                6
            ],
            "isMicrosoftAuthEnabled": [
                6
            ],
            "isMicrosoftAuthBypassEnabled": [
                6
            ],
            "isCustomDomainEnabled": [
                6
            ],
            "isInternalMessagesImportEnabled": [
                6
            ],
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                29
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
                6
            ],
            "routerModel": [
                1
            ],
            "workspaceCustomApplication": [
                58
            ],
            "featureFlags": [
                173
            ],
            "billingSubscriptions": [
                151
            ],
            "installedApplications": [
                58
            ],
            "currentBillingSubscription": [
                151
            ],
            "billingEntitlements": [
                230
            ],
            "hasValidEnterpriseKey": [
                6
            ],
            "hasValidSignedEnterpriseKey": [
                6
            ],
            "hasValidEnterpriseValidityToken": [
                6
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
        "WorkspaceActivationStatus": {},
        "AppToken": {
            "id": [
                3
            ],
            "type": [
                1
            ],
            "expiresAt": [
                4
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
                6
            ],
            "disabled": [
                6
            ],
            "canImpersonate": [
                6
            ],
            "canAccessFullAdminPanel": [
                6
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
                20
            ],
            "userWorkspaces": [
                17
            ],
            "onboardingStatus": [
                79
            ],
            "currentWorkspace": [
                75
            ],
            "currentUserWorkspace": [
                17
            ],
            "userVars": [
                80
            ],
            "workspaceMembers": [
                20
            ],
            "deletedWorkspaceMembers": [
                229
            ],
            "hasPassword": [
                6
            ],
            "supportUserHash": [
                1
            ],
            "workspaces": [
                17
            ],
            "availableWorkspaces": [
                228
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "JSONObject": {},
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
                11
            ],
            "column": [
                11
            ],
            "rowSpan": [
                11
            ],
            "columnSpan": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidget": {
            "id": [
                3
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
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                83
            ],
            "position": [
                86
            ],
            "configuration": [
                91
            ],
            "conditionalDisplay": [
                15
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
                6
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WidgetType": {},
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetGridPosition": [
                87
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                89
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                88
            ],
            "row": [
                21
            ],
            "column": [
                21
            ],
            "rowSpan": [
                21
            ],
            "columnSpan": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                88
            ],
            "index": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                92
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
            "on_FieldConfiguration": [
                108
            ],
            "on_FieldRichTextConfiguration": [
                110
            ],
            "on_FieldsConfiguration": [
                111
            ],
            "on_FilesConfiguration": [
                112
            ],
            "on_NotesConfiguration": [
                113
            ],
            "on_TasksConfiguration": [
                114
            ],
            "on_TimelineConfiguration": [
                115
            ],
            "on_ViewConfiguration": [
                116
            ],
            "on_RecordTableConfiguration": [
                117
            ],
            "on_WorkflowConfiguration": [
                118
            ],
            "on_WorkflowRunConfiguration": [
                119
            ],
            "on_WorkflowVersionConfiguration": [
                120
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                60
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                6
            ],
            "format": [
                1
            ],
            "description": [
                1
            ],
            "filter": [
                15
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                81
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                93
            ],
            "body": [
                82
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                60
            ],
            "groupByFieldMetadataId": [
                3
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
                6
            ],
            "showCenterMetric": [
                6
            ],
            "displayLegend": [
                6
            ],
            "hideEmptyCategory": [
                6
            ],
            "splitMultiValueFields": [
                6
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                15
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                60
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
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
                3
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
                6
            ],
            "splitMultiValueFields": [
                6
            ],
            "axisNameDisplay": [
                99
            ],
            "displayDataLabel": [
                6
            ],
            "displayLegend": [
                6
            ],
            "rangeMin": [
                11
            ],
            "rangeMax": [
                11
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                15
            ],
            "isStacked": [
                6
            ],
            "isCumulative": [
                6
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                93
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
                93
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                60
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
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
                3
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
                6
            ],
            "splitMultiValueFields": [
                6
            ],
            "axisNameDisplay": [
                99
            ],
            "displayDataLabel": [
                6
            ],
            "displayLegend": [
                6
            ],
            "rangeMin": [
                11
            ],
            "rangeMax": [
                11
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                15
            ],
            "groupMode": [
                102
            ],
            "layout": [
                103
            ],
            "isCumulative": [
                6
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                93
            ],
            "frontComponentId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EmailsConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                93
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                109
            ],
            "viewId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FieldDisplayMode": {},
        "FieldRichTextConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                93
            ],
            "viewId": [
                1
            ],
            "newFieldDefaultVisibility": [
                6
            ],
            "shouldAllowUserToSeeHiddenFields": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                93
            ],
            "viewId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "id": [
                3
            ],
            "applicationId": [
                3
            ],
            "title": [
                1
            ],
            "position": [
                11
            ],
            "pageLayoutId": [
                3
            ],
            "widgets": [
                84
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                88
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "isActive": [
                6
            ],
            "deletedAt": [
                4
            ],
            "isOverridden": [
                6
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
                123
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                121
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
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
                6
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
                124
            ],
            "__typename": [
                1
            ]
        },
        "EnterpriseLicenseInfoDTO": {
            "isValid": [
                6
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "Analytics": {
            "success": [
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
                11
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
            "driver": [
                131
            ],
            "status": [
                132
            ],
            "verificationRecords": [
                129
            ],
            "verifiedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "EmailingDomainDriver": {},
        "EmailingDomainStatus": {},
        "SendMessageCampaignOutputDTO": {
            "campaignId": [
                1
            ],
            "sentCount": [
                21
            ],
            "failedCount": [
                21
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
        "ApprovedAccessDomain": {
            "id": [
                3
            ],
            "domain": [
                1
            ],
            "isValidated": [
                6
            ],
            "createdAt": [
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
                11
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
        "BillingSubscriptionSchedulePhase": {
            "start_date": [
                11
            ],
            "end_date": [
                11
            ],
            "items": [
                137
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                140
            ],
            "priceUsageBased": [
                141
            ],
            "productKey": [
                142
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
                144
            ],
            "unitAmount": [
                11
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                141
            ],
            "creditAmount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionInterval": {},
        "BillingPriceTier": {
            "upTo": [
                11
            ],
            "flatAmount": [
                11
            ],
            "unitAmount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "tiers": [
                145
            ],
            "recurringInterval": [
                144
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                141
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
                139
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
                139
            ],
            "prices": [
                143
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
                139
            ],
            "prices": [
                146
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
                6
            ],
            "quantity": [
                11
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
                3
            ],
            "status": [
                152
            ],
            "interval": [
                144
            ],
            "billingSubscriptionItems": [
                150
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                15
            ],
            "phases": [
                138
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "BillingEndTrialPeriod": {
            "status": [
                152
            ],
            "hasPaymentMethod": [
                6
            ],
            "billingPortalUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                142
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "usedCredits": [
                11
            ],
            "grantedCredits": [
                11
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
            "__typename": [
                1
            ]
        },
        "BillingPlan": {
            "planKey": [
                140
            ],
            "baseProducts": [
                148
            ],
            "resourceCreditProducts": [
                148
            ],
            "meteredProducts": [
                149
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
                151
            ],
            "billingSubscriptions": [
                151
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                6
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
                6
            ],
            "errors": [
                1
            ],
            "result": [
                159
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
                163
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
                11
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
                161
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
                15
            ],
            "after": [
                15
            ],
            "diff": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEvent": {
            "type": [
                166
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                164
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
                168
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
                164
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
                167
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
                169
            ],
            "metadataEvents": [
                165
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionResult": {
            "data": [
                15
            ],
            "logs": [
                1
            ],
            "duration": [
                11
            ],
            "status": [
                172
            ],
            "error": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "FeatureFlag": {
            "key": [
                174
            ],
            "value": [
                6
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
                6
            ],
            "isRequired": [
                6
            ],
            "isFilled": [
                6
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
        "BillingTrialPeriod": {
            "duration": [
                11
            ],
            "isCreditCardRequired": [
                6
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
                179
            ],
            "status": [
                180
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
                178
            ],
            "google": [
                6
            ],
            "magicLink": [
                6
            ],
            "password": [
                6
            ],
            "microsoft": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AuthBypassProviders": {
            "google": [
                6
            ],
            "password": [
                6
            ],
            "microsoft": [
                6
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
                181
            ],
            "authBypassProviders": [
                182
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
                6
            ],
            "twitterSearch": [
                6
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
                187
            ],
            "modelFamilyLabel": [
                1
            ],
            "sdkPackage": [
                1
            ],
            "inputCostPerMillionTokens": [
                11
            ],
            "outputCostPerMillionTokens": [
                11
            ],
            "nativeCapabilities": [
                185
            ],
            "isDeprecated": [
                6
            ],
            "isRecommended": [
                6
            ],
            "providerName": [
                1
            ],
            "providerLabel": [
                1
            ],
            "contextWindowTokens": [
                11
            ],
            "maxOutputTokens": [
                11
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
                6
            ],
            "billingUrl": [
                1
            ],
            "trialPeriods": [
                177
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                190
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
                193
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
                11
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
                195
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
                181
            ],
            "billing": [
                188
            ],
            "aiModels": [
                186
            ],
            "signInPrefilled": [
                6
            ],
            "isMultiWorkspaceEnabled": [
                6
            ],
            "isEmailVerificationRequired": [
                6
            ],
            "defaultSubdomain": [
                1
            ],
            "frontDomain": [
                1
            ],
            "analyticsEnabled": [
                6
            ],
            "support": [
                189
            ],
            "isAttachmentPreviewEnabled": [
                6
            ],
            "sentry": [
                191
            ],
            "captcha": [
                192
            ],
            "api": [
                194
            ],
            "canManageFeatureFlags": [
                6
            ],
            "publicFeatureFlags": [
                196
            ],
            "isMicrosoftMessagingEnabled": [
                6
            ],
            "isMicrosoftCalendarEnabled": [
                6
            ],
            "isGoogleMessagingEnabled": [
                6
            ],
            "isGoogleCalendarEnabled": [
                6
            ],
            "isConfigVariablesInDbEnabled": [
                6
            ],
            "isImapSmtpCaldavEnabled": [
                6
            ],
            "isEmailGroupEnabled": [
                6
            ],
            "allowRequestsToTwentyIcons": [
                6
            ],
            "calendarBookingPageId": [
                1
            ],
            "isCloudflareIntegrationEnabled": [
                6
            ],
            "isClickHouseConfigured": [
                6
            ],
            "isWorkspaceSchemaDDLLocked": [
                6
            ],
            "maintenance": [
                197
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
                11
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
                21
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                21
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                200
            ],
            "__typename": [
                1
            ]
        },
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                7
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
        "Relation": {
            "type": [
                206
            ],
            "sourceObjectMetadata": [
                55
            ],
            "targetObjectMetadata": [
                55
            ],
            "sourceFieldMetadata": [
                43
            ],
            "targetFieldMetadata": [
                43
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "IndexEdge": {
            "node": [
                46
            ],
            "cursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "PageInfo": {
            "hasNextPage": [
                6
            ],
            "hasPreviousPage": [
                6
            ],
            "startCursor": [
                49
            ],
            "endCursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "IndexConnection": {
            "pageInfo": [
                208
            ],
            "edges": [
                207
            ],
            "__typename": [
                1
            ]
        },
        "IndexFieldEdge": {
            "node": [
                45
            ],
            "cursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "IndexIndexFieldMetadatasConnection": {
            "pageInfo": [
                208
            ],
            "edges": [
                210
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                55
            ],
            "cursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "IndexObjectMetadataConnection": {
            "pageInfo": [
                208
            ],
            "edges": [
                212
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
                21
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                208
            ],
            "edges": [
                212
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                208
            ],
            "edges": [
                207
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                43
            ],
            "cursor": [
                49
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                208
            ],
            "edges": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                208
            ],
            "edges": [
                217
            ],
            "__typename": [
                1
            ]
        },
        "ResendEmailVerificationToken": {
            "success": [
                6
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
                179
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                180
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
                179
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
                180
            ],
            "workspace": [
                223
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
                179
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                180
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                179
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
                180
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
                175
            ],
            "logo": [
                1
            ],
            "sso": [
                226
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                227
            ],
            "availableWorkspacesForSignUp": [
                227
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
                19
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
        "BillingEntitlement": {
            "key": [
                231
            ],
            "value": [
                6
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
                232
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicates": [
                13
            ],
            "predicateGroups": [
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
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethod": {
            "success": [
                6
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
                6
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
                32
            ],
            "refreshToken": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "tokens": [
                240
            ],
            "availableWorkspaces": [
                228
            ],
            "__typename": [
                1
            ]
        },
        "EmailPasswordResetLink": {
            "success": [
                6
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
                6
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
                3
            ],
            "__typename": [
                1
            ]
        },
        "SignUp": {
            "loginToken": [
                32
            ],
            "workspace": [
                245
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                32
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "VerifyEmailAndGetLoginToken": {
            "loginToken": [
                32
            ],
            "workspaceUrls": [
                175
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
                240
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExist": {
            "exists": [
                6
            ],
            "availableWorkspacesCount": [
                11
            ],
            "isEmailVerified": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInviteHashValid": {
            "isValid": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Impersonate": {
            "loginToken": [
                32
            ],
            "workspace": [
                245
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
                11
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
                256
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                199
            ],
            "usageByOperationType": [
                199
            ],
            "usageByModel": [
                199
            ],
            "timeSeries": [
                256
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userDailyUsage": [
                257
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
                15
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
                11
            ],
            "createdAt": [
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
            "logo": [
                1
            ],
            "sourcePackage": [
                1
            ],
            "isFeatured": [
                6
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
                8
            ],
            "sourcePackage": [
                1
            ],
            "latestAvailableVersion": [
                1
            ],
            "isListed": [
                6
            ],
            "isFeatured": [
                6
            ],
            "manifest": [
                15
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
                6
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
                11
            ],
            "lng": [
                11
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
                266
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
                11
            ],
            "username": [
                1
            ],
            "secure": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                268
            ],
            "SMTP": [
                268
            ],
            "CALDAV": [
                268
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
                269
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
                11
            ],
            "username": [
                1
            ],
            "secure": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavPublicConnectionParameters": {
            "IMAP": [
                271
            ],
            "SMTP": [
                271
            ],
            "CALDAV": [
                271
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
                272
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "success": [
                6
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
                15
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
                21
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
                15
            ],
            "toolOutput": [
                15
            ],
            "state": [
                1
            ],
            "providerExecuted": [
                6
            ],
            "errorMessage": [
                1
            ],
            "errorDetails": [
                15
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
                15
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "ChannelSyncSuccess": {
            "success": [
                6
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
                15
            ],
            "indexBy": [
                1
            ],
            "keys": [
                1
            ],
            "series": [
                279
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                6
            ],
            "showDataLabels": [
                6
            ],
            "layout": [
                103
            ],
            "groupMode": [
                102
            ],
            "hasTooManyGroups": [
                6
            ],
            "formattedToRawLookup": [
                15
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
            "id": [
                1
            ],
            "label": [
                1
            ],
            "data": [
                281
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                282
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                6
            ],
            "showDataLabels": [
                6
            ],
            "hasTooManyGroups": [
                6
            ],
            "formattedToRawLookup": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataItem": {
            "id": [
                1
            ],
            "value": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "PieChartData": {
            "data": [
                284
            ],
            "showLegend": [
                6
            ],
            "showDataLabels": [
                6
            ],
            "showCenterMetric": [
                6
            ],
            "hasTooManyGroups": [
                6
            ],
            "formattedToRawLookup": [
                15
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
                11
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
                6
            ],
            "error": [
                1
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
                15
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "isCustom": [
                6
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "records": [
                288
            ],
            "totalCount": [
                21
            ],
            "pageInfo": [
                289
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
                6
            ],
            "isActive": [
                6
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
                277
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
                294
            ],
            "title": [
                1
            ],
            "totalInputTokens": [
                21
            ],
            "totalOutputTokens": [
                21
            ],
            "contextWindowTokens": [
                21
            ],
            "conversationSize": [
                21
            ],
            "totalInputCredits": [
                11
            ],
            "totalOutputCredits": [
                11
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
        "ID": {},
        "AiSystemPromptSection": {
            "title": [
                1
            ],
            "content": [
                1
            ],
            "estimatedTokenCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                295
            ],
            "estimatedTokenCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "ChatStreamCatchupChunks": {
            "chunks": [
                15
            ],
            "maxSeq": [
                21
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
                6
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
                15
            ],
            "__typename": [
                1
            ]
        },
        "AgentTurnEvaluation": {
            "id": [
                3
            ],
            "turnId": [
                3
            ],
            "score": [
                21
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
                300
            ],
            "messages": [
                292
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
                21
            ],
            "skillsCount": [
                21
            ],
            "toolsCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannel": {
            "id": [
                3
            ],
            "handle": [
                1
            ],
            "syncStatus": [
                304
            ],
            "syncStage": [
                305
            ],
            "visibility": [
                306
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                307
            ],
            "isSyncEnabled": [
                6
            ],
            "syncedAt": [
                4
            ],
            "syncStageStartedAt": [
                4
            ],
            "throttleFailureCount": [
                11
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
        "MessageChannel": {
            "id": [
                3
            ],
            "visibility": [
                309
            ],
            "handle": [
                1
            ],
            "type": [
                310
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                311
            ],
            "messageFolderImportPolicy": [
                312
            ],
            "excludeNonProfessionalEmails": [
                6
            ],
            "excludeGroupEmails": [
                6
            ],
            "pendingGroupEmailsAction": [
                313
            ],
            "isSyncEnabled": [
                6
            ],
            "syncedAt": [
                4
            ],
            "syncStatus": [
                314
            ],
            "syncStage": [
                315
            ],
            "syncStageStartedAt": [
                4
            ],
            "throttleFailureCount": [
                11
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
                270
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
                308
            ],
            "forwardingAddress": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "MessageFolder": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "isSentFolder": [
                6
            ],
            "isSynced": [
                6
            ],
            "parentFolderId": [
                1
            ],
            "externalId": [
                1
            ],
            "pendingSyncAction": [
                318
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
        "CollectionHash": {
            "collectionName": [
                320
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
            "isCustom": [
                6
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isRemote": [
                6
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
                70
            ],
            "key": [
                71
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
                321
            ],
            "views": [
                322
            ],
            "collectionHashes": [
                319
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "navigationMenuItems": [
                162
            ],
            "navigationMenuItem": [
                162,
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
                127
            ],
            "getViewFilterGroups": [
                61,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                63,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                63,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                69,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        70,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                69,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                66,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                66,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                59,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                68,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                68,
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
            "apiKey": [
                2,
                {
                    "input": [
                        325,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                156,
                {
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "listPlans": [
                155
            ],
            "getResourceCreditUsage": [
                154
            ],
            "findWorkspaceInvitations": [
                159
            ],
            "getApprovedAccessDomains": [
                135
            ],
            "getPageLayoutTabs": [
                121,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                121,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                122,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        123
                    ]
                }
            ],
            "getPageLayout": [
                122,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getEmailingDomains": [
                130
            ],
            "applicationConnectionProviders": [
                125,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                84,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                84,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                41,
                {
                    "input": [
                        326,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                41
            ],
            "getAvailablePackages": [
                15,
                {
                    "input": [
                        326,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        326,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "commandMenuItems": [
                35
            ],
            "commandMenuItem": [
                35,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                34
            ],
            "frontComponent": [
                34,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                214
            ],
            "object": [
                55,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                215,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        50,
                        "ObjectFilter!"
                    ]
                }
            ],
            "index": [
                46,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "indexMetadatas": [
                209,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        57,
                        "IndexFilter!"
                    ]
                }
            ],
            "findManyAgents": [
                25
            ],
            "findOneAgent": [
                25,
                {
                    "input": [
                        327,
                        "AgentIdInput!"
                    ]
                }
            ],
            "getRoles": [
                29
            ],
            "getToolIndex": [
                276
            ],
            "getToolInputSchema": [
                15,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "webhooks": [
                275
            ],
            "webhook": [
                275,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                43,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                219,
                {
                    "paging": [
                        48,
                        "CursorPaging!"
                    ],
                    "filter": [
                        56,
                        "FieldFilter!"
                    ]
                }
            ],
            "getViewGroups": [
                65,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                65,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "myMessageFolders": [
                317,
                {
                    "messageChannelId": [
                        3
                    ]
                }
            ],
            "myMessageChannels": [
                308,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "myConnectedAccounts": [
                270
            ],
            "myCalendarChannels": [
                303,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "minimalMetadata": [
                323
            ],
            "findWorkspaceAiStats": [
                302
            ],
            "chatThreads": [
                293
            ],
            "chatThread": [
                293,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                292,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                297,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                296
            ],
            "skills": [
                291
            ],
            "skill": [
                291,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                301,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                253,
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
                254,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                75,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validatePasswordResetToken": [
                248,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                203,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                7,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                7
            ],
            "findOneApplicationRegistration": [
                7,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                201,
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
            "currentUser": [
                78
            ],
            "currentWorkspace": [
                75
            ],
            "getPublicWorkspaceDataByDomain": [
                183,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                184,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "findManyApplications": [
                58
            ],
            "findOneApplication": [
                58,
                {
                    "id": [
                        3
                    ],
                    "universalIdentifier": [
                        3
                    ]
                }
            ],
            "getSSOIdentityProviders": [
                224
            ],
            "eventLogs": [
                290,
                {
                    "input": [
                        328,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                285,
                {
                    "input": [
                        332,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                283,
                {
                    "input": [
                        333,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                280,
                {
                    "input": [
                        334,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                273,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                265,
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
                        6
                    ]
                }
            ],
            "getAddressDetails": [
                267,
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
                258,
                {
                    "input": [
                        335
                    ]
                }
            ],
            "findManyPublicDomains": [
                264
            ],
            "findManyMarketplaceApps": [
                262
            ],
            "findMarketplaceAppDetail": [
                263,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
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
        "LogicFunctionIdInput": {
            "id": [
                294
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
        "EventLogQueryInput": {
            "table": [
                329
            ],
            "filters": [
                330
            ],
            "first": [
                21
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
                331
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
                15
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
                15
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
                15
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
                336
            ],
            "__typename": [
                1
            ]
        },
        "UsageOperationType": {},
        "Mutation": {
            "addQueryToEventStream": [
                6,
                {
                    "input": [
                        338,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                6,
                {
                    "input": [
                        339,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                162,
                {
                    "inputs": [
                        340,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                162,
                {
                    "input": [
                        340,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                162,
                {
                    "inputs": [
                        341,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                162,
                {
                    "input": [
                        341,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                162,
                {
                    "ids": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                162,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "uploadEmailAttachmentFile": [
                136,
                {
                    "file": [
                        343,
                        "Upload!"
                    ]
                }
            ],
            "refreshEnterpriseValidityToken": [
                6
            ],
            "setEnterpriseKey": [
                126,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadAiChatFile": [
                136,
                {
                    "file": [
                        343,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkflowFile": [
                136,
                {
                    "file": [
                        343,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                136,
                {
                    "file": [
                        343,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                136,
                {
                    "file": [
                        343,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFile": [
                136,
                {
                    "file": [
                        343,
                        "Upload!"
                    ],
                    "fieldMetadataId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                136,
                {
                    "file": [
                        343,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                61,
                {
                    "input": [
                        344,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        345,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "deleteViewFilterGroup": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyViewFilterGroup": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilter": [
                63,
                {
                    "input": [
                        346,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                63,
                {
                    "input": [
                        347,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                63,
                {
                    "input": [
                        349,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                63,
                {
                    "input": [
                        350,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "createView": [
                69,
                {
                    "input": [
                        351,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                69,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        352,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "deleteView": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyView": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "upsertViewWidget": [
                69,
                {
                    "input": [
                        353,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                66,
                {
                    "input": [
                        358,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                66,
                {
                    "input": [
                        359,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                6,
                {
                    "input": [
                        361,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                6,
                {
                    "input": [
                        362,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "updateViewField": [
                59,
                {
                    "input": [
                        363,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                59,
                {
                    "input": [
                        365,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                59,
                {
                    "inputs": [
                        365,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                59,
                {
                    "input": [
                        366,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                59,
                {
                    "input": [
                        367,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                68,
                {
                    "input": [
                        368,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                68,
                {
                    "input": [
                        370,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                68,
                {
                    "inputs": [
                        370,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                68,
                {
                    "input": [
                        371,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                68,
                {
                    "input": [
                        372,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                69,
                {
                    "input": [
                        373,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createApiKey": [
                2,
                {
                    "input": [
                        376,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        377,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        378,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                6,
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
            "createObjectEvent": [
                128,
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
                        15
                    ]
                }
            ],
            "trackAnalytics": [
                128,
                {
                    "type": [
                        379,
                        "AnalyticsType!"
                    ],
                    "name": [
                        1
                    ],
                    "event": [
                        1
                    ],
                    "properties": [
                        15
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                158
            ],
            "skipBookOnboardingStep": [
                158
            ],
            "checkoutSession": [
                156,
                {
                    "recurringInterval": [
                        144,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        140,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        6,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                157
            ],
            "switchBillingPlan": [
                157
            ],
            "cancelSwitchBillingPlan": [
                157
            ],
            "cancelSwitchBillingInterval": [
                157
            ],
            "setResourceCreditSubscriptionPrice": [
                157,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                153
            ],
            "cancelSwitchResourceCreditPrice": [
                157
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
                160,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                160,
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
                135,
                {
                    "input": [
                        380,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                6,
                {
                    "input": [
                        381,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                135,
                {
                    "input": [
                        382,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                121,
                {
                    "input": [
                        383,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                121,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        384,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayout": [
                122,
                {
                    "input": [
                        385,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                122,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        386,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "destroyPageLayout": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                122,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        387,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                122,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                84,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                121,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createEmailingDomain": [
                130,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "driver": [
                        131,
                        "EmailingDomainDriver!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                130,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendEmailViaEmailingDomain": [
                134,
                {
                    "input": [
                        391,
                        "SendEmailViaDomainInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                133,
                {
                    "input": [
                        392,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "updateOneApplicationVariable": [
                6,
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
            "createPageLayoutWidget": [
                84,
                {
                    "input": [
                        393,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                84,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        394,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                41,
                {
                    "input": [
                        326,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                41,
                {
                    "input": [
                        395,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                171,
                {
                    "input": [
                        396,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                6,
                {
                    "input": [
                        397,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                35,
                {
                    "input": [
                        399,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                35,
                {
                    "input": [
                        400,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                35,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                34,
                {
                    "input": [
                        401,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                34,
                {
                    "input": [
                        402,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                34,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneObject": [
                55,
                {
                    "input": [
                        404,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                55,
                {
                    "input": [
                        406,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                55,
                {
                    "input": [
                        407,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "createOneIndex": [
                46,
                {
                    "input": [
                        409,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                46,
                {
                    "input": [
                        412,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "createOneAgent": [
                25,
                {
                    "input": [
                        413,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                25,
                {
                    "input": [
                        414,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                25,
                {
                    "input": [
                        327,
                        "AgentIdInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                20,
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
                29,
                {
                    "createRoleInput": [
                        415,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                29,
                {
                    "updateRoleInput": [
                        416,
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
                16,
                {
                    "upsertObjectPermissionsInput": [
                        418,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                27,
                {
                    "upsertPermissionFlagsInput": [
                        420,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                26,
                {
                    "upsertFieldPermissionsInput": [
                        421,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                234,
                {
                    "input": [
                        423,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                6,
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
                6,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createWebhook": [
                275,
                {
                    "input": [
                        426,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                275,
                {
                    "input": [
                        427,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                275,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneField": [
                43,
                {
                    "input": [
                        429,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                43,
                {
                    "input": [
                        431,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                43,
                {
                    "input": [
                        433,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                65,
                {
                    "input": [
                        434,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                65,
                {
                    "inputs": [
                        434,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                65,
                {
                    "input": [
                        435,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                65,
                {
                    "inputs": [
                        435,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                65,
                {
                    "input": [
                        437,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                65,
                {
                    "input": [
                        438,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "updateMessageFolder": [
                317,
                {
                    "input": [
                        439,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                317,
                {
                    "input": [
                        441,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateMessageChannel": [
                308,
                {
                    "input": [
                        442,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                316,
                {
                    "input": [
                        444,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                308,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                270,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                303,
                {
                    "input": [
                        445,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "createChatThread": [
                293
            ],
            "sendChatMessage": [
                298,
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
                        15
                    ],
                    "modelId": [
                        1
                    ],
                    "fileAttachments": [
                        447,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "stopAgentChatStream": [
                6,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "renameChatThread": [
                293,
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
                293,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "unarchiveChatThread": [
                293,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteChatThread": [
                6,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deleteQueuedChatMessage": [
                6,
                {
                    "messageId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createSkill": [
                291,
                {
                    "input": [
                        448,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                291,
                {
                    "input": [
                        449,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                291,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                291,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                291,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                300,
                {
                    "turnId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                301,
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
            "getAuthorizationUrlForSSO": [
                243,
                {
                    "input": [
                        450,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                252,
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
                241,
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
                249,
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
                241,
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
                251,
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
                241,
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
                246,
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
                246
            ],
            "generateTransientToken": [
                247
            ],
            "getAuthTokensFromLoginToken": [
                251,
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
            "authorizeApp": [
                239,
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
                251,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                250,
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
                32
            ],
            "emailPasswordResetLink": [
                242,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        3
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                244,
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
                202,
                {
                    "input": [
                        451,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                7,
                {
                    "input": [
                        452,
                        "UpdateApplicationRegistrationInput!"
                    ]
                }
            ],
            "deleteApplicationRegistration": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "rotateApplicationRegistrationClientSecret": [
                204,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationRegistrationVariable": [
                5,
                {
                    "input": [
                        454,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                5,
                {
                    "input": [
                        455,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "deleteApplicationRegistrationVariable": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadAppTarball": [
                7,
                {
                    "file": [
                        343,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                7,
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
                237,
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
                237
            ],
            "deleteTwoFactorAuthenticationMethod": [
                236,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                238,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                78
            ],
            "deleteUserFromWorkspace": [
                17,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceMemberSettings": [
                6,
                {
                    "input": [
                        457,
                        "UpdateWorkspaceMemberSettingsInput!"
                    ]
                }
            ],
            "updateUserEmail": [
                6,
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
                220,
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
                75,
                {
                    "data": [
                        458,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                75,
                {
                    "data": [
                        459,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                75
            ],
            "checkCustomDomainValidRecords": [
                233
            ],
            "runWorkspaceMigration": [
                6,
                {
                    "workspaceMigration": [
                        460,
                        "WorkspaceMigrationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                6,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                225,
                {
                    "input": [
                        463,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                225,
                {
                    "input": [
                        464,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                221,
                {
                    "input": [
                        465,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                222,
                {
                    "input": [
                        466,
                        "EditSsoInput!"
                    ]
                }
            ],
            "duplicateDashboard": [
                286,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                255,
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
            "sendEmail": [
                287,
                {
                    "input": [
                        467,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                278,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                274,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        469,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                173,
                {
                    "input": [
                        471,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                264,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "applicationId": [
                        1
                    ]
                }
            ],
            "updatePublicDomain": [
                264,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "applicationId": [
                        1
                    ]
                }
            ],
            "deletePublicDomain": [
                6,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkPublicDomainValidRecords": [
                233,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneAppToken": [
                77,
                {
                    "input": [
                        472,
                        "CreateOneAppTokenInput!"
                    ]
                }
            ],
            "installMarketplaceApp": [
                6,
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
                58,
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
            "syncMarketplaceCatalog": [
                6
            ],
            "createDevelopmentApplication": [
                259,
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
            "generateApplicationToken": [
                33,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "syncApplication": [
                260,
                {
                    "manifest": [
                        15,
                        "JSON!"
                    ]
                }
            ],
            "uploadApplicationFile": [
                261,
                {
                    "file": [
                        343,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        474,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "upgradeApplication": [
                6,
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
            "renewApplicationToken": [
                33,
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
                15
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
                163
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
                11
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
                342
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
                11
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
        "CreateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                62
            ],
            "positionInViewFilterGroup": [
                11
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
                62
            ],
            "positionInViewFilterGroup": [
                11
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
                64
            ],
            "value": [
                15
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                11
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
                348
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
                64
            ],
            "value": [
                15
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                11
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
                70
            ],
            "key": [
                71
            ],
            "icon": [
                1
            ],
            "position": [
                11
            ],
            "isCompact": [
                6
            ],
            "shouldHideEmptyGroups": [
                6
            ],
            "openRecordIn": [
                72
            ],
            "kanbanAggregateOperation": [
                60
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                73
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "visibility": [
                74
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
                70
            ],
            "icon": [
                1
            ],
            "position": [
                11
            ],
            "isCompact": [
                6
            ],
            "openRecordIn": [
                72
            ],
            "kanbanAggregateOperation": [
                60
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                73
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "visibility": [
                74
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "widgetId": [
                3
            ],
            "viewFields": [
                354
            ],
            "viewFilters": [
                355
            ],
            "viewFilterGroups": [
                356
            ],
            "viewSorts": [
                357
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
                6
            ],
            "position": [
                11
            ],
            "size": [
                11
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
                64
            ],
            "value": [
                15
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                11
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
                62
            ],
            "positionInViewFilterGroup": [
                11
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
                67
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
                67
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
                360
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                67
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
                364
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "isVisible": [
                6
            ],
            "size": [
                11
            ],
            "position": [
                11
            ],
            "aggregateOperation": [
                60
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
                6
            ],
            "size": [
                11
            ],
            "position": [
                11
            ],
            "aggregateOperation": [
                60
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
                369
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
                11
            ],
            "isVisible": [
                6
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
                11
            ],
            "isVisible": [
                6
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
                374
            ],
            "fields": [
                375
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
                11
            ],
            "isVisible": [
                6
            ],
            "fields": [
                375
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
                6
            ],
            "position": [
                11
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
        "AnalyticsType": {},
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
                11
            ],
            "pageLayoutId": [
                3
            ],
            "layoutMode": [
                88
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
                11
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                88
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
                123
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
                123
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
                123
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                388
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
                11
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                88
            ],
            "widgets": [
                389
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
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                390
            ],
            "position": [
                15
            ],
            "configuration": [
                15
            ],
            "conditionalDisplay": [
                15
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
                11
            ],
            "column": [
                11
            ],
            "rowSpan": [
                11
            ],
            "columnSpan": [
                11
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
            "messageTopicId": [
                1
            ],
            "recipientViewId": [
                1
            ],
            "listId": [
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
        "CreatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                390
            ],
            "position": [
                15
            ],
            "configuration": [
                15
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
                85
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                390
            ],
            "position": [
                15
            ],
            "configuration": [
                15
            ],
            "conditionalDisplay": [
                15
            ],
            "conditionalAvailabilityExpression": [
                1
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
                11
            ],
            "source": [
                15
            ],
            "cronTriggerSettings": [
                15
            ],
            "databaseEventTriggerSettings": [
                15
            ],
            "httpRouteTriggerSettings": [
                15
            ],
            "toolTriggerSettings": [
                15
            ],
            "workflowActionTriggerSettings": [
                15
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
                15
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
                398
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
                11
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
                15
            ],
            "databaseEventTriggerSettings": [
                15
            ],
            "httpRouteTriggerSettings": [
                15
            ],
            "toolTriggerSettings": [
                15
            ],
            "workflowActionTriggerSettings": [
                15
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
                36
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
                11
            ],
            "isPinned": [
                6
            ],
            "availabilityType": [
                37
            ],
            "hotKeys": [
                1
            ],
            "conditionalAvailabilityExpression": [
                1
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "payload": [
                15
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
                11
            ],
            "isPinned": [
                6
            ],
            "availabilityType": [
                37
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "engineComponentKey": [
                36
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
                403
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
                405
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
                6
            ],
            "isRemote": [
                6
            ],
            "primaryKeyColumnType": [
                1
            ],
            "primaryKeyFieldMetadataSettings": [
                15
            ],
            "isLabelSyncedWithName": [
                6
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
                408
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
                6
            ],
            "labelIdentifierFieldMetadataId": [
                3
            ],
            "imageIdentifierFieldMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "isSearchable": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                410
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
                411
            ],
            "indexType": [
                47
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
                15
            ],
            "modelConfiguration": [
                15
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
                15
            ],
            "modelConfiguration": [
                15
            ],
            "evaluationInputs": [
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
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "canReadAllObjectRecords": [
                6
            ],
            "canUpdateAllObjectRecords": [
                6
            ],
            "canSoftDeleteAllObjectRecords": [
                6
            ],
            "canDestroyAllObjectRecords": [
                6
            ],
            "canBeAssignedToUsers": [
                6
            ],
            "canBeAssignedToAgents": [
                6
            ],
            "canBeAssignedToApiKeys": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "update": [
                417
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
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "canReadAllObjectRecords": [
                6
            ],
            "canUpdateAllObjectRecords": [
                6
            ],
            "canSoftDeleteAllObjectRecords": [
                6
            ],
            "canDestroyAllObjectRecords": [
                6
            ],
            "canBeAssignedToUsers": [
                6
            ],
            "canBeAssignedToAgents": [
                6
            ],
            "canBeAssignedToApiKeys": [
                6
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
                419
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
                6
            ],
            "canUpdateObjectRecords": [
                6
            ],
            "canSoftDeleteObjectRecords": [
                6
            ],
            "canDestroyObjectRecords": [
                6
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
                422
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
                6
            ],
            "canUpdateFieldValue": [
                6
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
                424
            ],
            "predicateGroups": [
                425
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
                14
            ],
            "value": [
                15
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
                11
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
                12
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                11
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
                428
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
                430
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                44
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
            "isCustom": [
                6
            ],
            "isActive": [
                6
            ],
            "isSystem": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isNullable": [
                6
            ],
            "isUnique": [
                6
            ],
            "defaultValue": [
                15
            ],
            "options": [
                15
            ],
            "settings": [
                15
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "isRemoteCreation": [
                6
            ],
            "relationCreationPayload": [
                15
            ],
            "morphRelationsCreationPayload": [
                15
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
                432
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
                6
            ],
            "isSystem": [
                6
            ],
            "isUIReadOnly": [
                6
            ],
            "isNullable": [
                6
            ],
            "isUnique": [
                6
            ],
            "defaultValue": [
                15
            ],
            "options": [
                15
            ],
            "settings": [
                15
            ],
            "objectMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "morphRelationsUpdatePayload": [
                15
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
                6
            ],
            "fieldValue": [
                1
            ],
            "position": [
                11
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
                436
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
                6
            ],
            "fieldValue": [
                1
            ],
            "position": [
                11
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
                440
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageFolderInputUpdates": {
            "isSynced": [
                6
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
                440
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
                443
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                309
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                311
            ],
            "messageFolderImportPolicy": [
                312
            ],
            "isSyncEnabled": [
                6
            ],
            "excludeNonProfessionalEmails": [
                6
            ],
            "excludeGroupEmails": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelInput": {
            "handle": [
                1
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
                446
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                306
            ],
            "isContactAutoCreationEnabled": [
                6
            ],
            "contactAutoCreationPolicy": [
                307
            ],
            "isSyncEnabled": [
                6
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
                6
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
                453
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
                6
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
                6
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
                456
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
                6
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
                15
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
                6
            ],
            "allowImpersonation": [
                6
            ],
            "isGoogleAuthEnabled": [
                6
            ],
            "isMicrosoftAuthEnabled": [
                6
            ],
            "isPasswordAuthEnabled": [
                6
            ],
            "isGoogleAuthBypassEnabled": [
                6
            ],
            "isMicrosoftAuthBypassEnabled": [
                6
            ],
            "isPasswordAuthBypassEnabled": [
                6
            ],
            "defaultRoleId": [
                3
            ],
            "isTwoFactorAuthenticationEnforced": [
                6
            ],
            "trashRetentionDays": [
                11
            ],
            "eventLogRetentionDays": [
                11
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
                6
            ],
            "isInternalMessagesImportEnabled": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigrationInput": {
            "actions": [
                461
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigrationDeleteActionInput": {
            "type": [
                462
            ],
            "metadataName": [
                320
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigrationActionType": {},
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
                180
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
            "files": [
                468
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
            "IMAP": [
                470
            ],
            "SMTP": [
                470
            ],
            "CALDAV": [
                470
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
                11
            ],
            "username": [
                1
            ],
            "password": [
                1
            ],
            "secure": [
                6
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneAppTokenInput": {
            "appToken": [
                473
            ],
            "__typename": [
                1
            ]
        },
        "CreateAppTokenInput": {
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "FileFolder": {},
        "Subscription": {
            "onEventSubscription": [
                170,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                235,
                {
                    "input": [
                        476,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                299,
                {
                    "threadId": [
                        3,
                        "UUID!"
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