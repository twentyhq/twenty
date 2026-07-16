export default {
    "scalars": [
        1,
        3,
        4,
        5,
        6,
        10,
        11,
        13,
        16,
        19,
        20,
        21,
        22,
        29,
        35,
        36,
        41,
        43,
        45,
        48,
        55,
        57,
        59,
        62,
        65,
        66,
        67,
        68,
        69,
        71,
        72,
        74,
        76,
        77,
        82,
        85,
        90,
        91,
        94,
        95,
        97,
        100,
        101,
        107,
        121,
        132,
        133,
        134,
        136,
        145,
        158,
        161,
        163,
        167,
        169,
        176,
        177,
        184,
        187,
        190,
        204,
        217,
        234,
        240,
        274,
        276,
        277,
        278,
        279,
        280,
        281,
        282,
        289,
        329,
        330,
        331,
        332,
        334,
        336,
        348,
        355,
        362,
        363,
        489
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
                131
            ],
            "on_BillingLicensedProduct": [
                140
            ],
            "on_BillingMeteredProduct": [
                141
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
                27
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
        "RowLevelPermissionPredicateGroup": {
            "id": [
                1
            ],
            "parentRowLevelPermissionPredicateGroupId": [
                1
            ],
            "logicalOperator": [
                11
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                10
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
                13
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
                10
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
                12
            ],
            "rowLevelPermissionPredicateGroups": [
                9
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
                16
            ],
            "objectPermissions": [
                14
            ],
            "objectsPermissions": [
                14
            ],
            "twoFactorAuthenticationMethodSummary": [
                8
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
                4
            ],
            "name": [
                17
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
                19
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                20
            ],
            "timeFormat": [
                21
            ],
            "roles": [
                27
            ],
            "userWorkspaceId": [
                4
            ],
            "numberFormat": [
                22
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
                18
            ],
            "agents": [
                23
            ],
            "apiKeys": [
                26
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
                25
            ],
            "objectPermissions": [
                14
            ],
            "fieldPermissions": [
                24
            ],
            "rowLevelPermissionPredicates": [
                12
            ],
            "rowLevelPermissionPredicateGroups": [
                9
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
                29
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
                31
            ],
            "applicationRefreshToken": [
                31
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
            "applicationTokenPair": [
                32
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
                33
            ],
            "engineComponentKey": [
                35
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
                10
            ],
            "isPinned": [
                3
            ],
            "availabilityType": [
                36
            ],
            "payload": [
                37
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
        "EngineComponentKey": {},
        "CommandMenuItemAvailabilityType": {},
        "CommandMenuItemPayload": {
            "on_PathCommandMenuItemPayload": [
                38
            ],
            "on_ObjectMetadataCommandMenuItemPayload": [
                39
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
                10
            ],
            "executionMode": [
                41
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
                43
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
                203
            ],
            "morphRelations": [
                203
            ],
            "object": [
                46
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
                45
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "indexFieldMetadataList": [
                205
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
                42
            ],
            "indexMetadataList": [
                44
            ],
            "searchFieldMetadataList": [
                207
            ],
            "fields": [
                214,
                {
                    "paging": [
                        47,
                        "CursorPaging!"
                    ],
                    "filter": [
                        49,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                212,
                {
                    "paging": [
                        47,
                        "CursorPaging!"
                    ],
                    "filter": [
                        52,
                        "IndexFilter!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "CursorPaging": {
            "before": [
                48
            ],
            "after": [
                48
            ],
            "first": [
                19
            ],
            "last": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                49
            ],
            "or": [
                49
            ],
            "id": [
                50
            ],
            "isActive": [
                51
            ],
            "isSystem": [
                51
            ],
            "isUIEditable": [
                51
            ],
            "isUIReadOnly": [
                51
            ],
            "objectMetadataId": [
                50
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
                52
            ],
            "or": [
                52
            ],
            "id": [
                50
            ],
            "isCustom": [
                51
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
            "logo": [
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
            "defaultRoleId": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                4
            ],
            "defaultLogicFunctionRole": [
                27
            ],
            "agents": [
                23
            ],
            "frontComponents": [
                33
            ],
            "commandMenuItems": [
                34
            ],
            "logicFunctions": [
                40
            ],
            "objects": [
                46
            ],
            "applicationVariables": [
                30
            ],
            "applicationRegistration": [
                28
            ],
            "logoUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
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
                10
            ],
            "position": [
                10
            ],
            "aggregateOperation": [
                55
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
                57
            ],
            "positionInViewFilterGroup": [
                10
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
                59
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                10
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
                10
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
                62
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
                10
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
                54
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
                65
            ],
            "key": [
                66
            ],
            "icon": [
                1
            ],
            "position": [
                10
            ],
            "isCompact": [
                3
            ],
            "isCustom": [
                3
            ],
            "openRecordIn": [
                67
            ],
            "kanbanAggregateOperation": [
                55
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
                19
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
                68
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
                54
            ],
            "viewFilters": [
                58
            ],
            "viewFilterGroups": [
                56
            ],
            "viewSorts": [
                61
            ],
            "viewGroups": [
                60
            ],
            "viewFieldGroups": [
                63
            ],
            "visibility": [
                69
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
                71
            ],
            "trashRetentionDays": [
                10
            ],
            "eventLogRetentionDays": [
                10
            ],
            "workspaceMembersCount": [
                10
            ],
            "activationStatus": [
                72
            ],
            "views": [
                64
            ],
            "viewFields": [
                54
            ],
            "viewFilters": [
                58
            ],
            "viewFilterGroups": [
                56
            ],
            "viewGroups": [
                60
            ],
            "viewSorts": [
                61
            ],
            "metadataVersion": [
                10
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
                27
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
                53
            ],
            "featureFlags": [
                168
            ],
            "billingSubscriptions": [
                144
            ],
            "installedApplications": [
                53
            ],
            "currentBillingSubscription": [
                144
            ],
            "billingCustomer": [
                143
            ],
            "billingEntitlements": [
                233
            ],
            "hasValidSignedEnterpriseKey": [
                3
            ],
            "hasValidEnterpriseValidityToken": [
                3
            ],
            "workspaceUrls": [
                170
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
                29
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
            "listingRequestStatus": [
                74
            ],
            "listingRequestedAt": [
                6
            ],
            "listingRequestContactEmail": [
                1
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
        "ApplicationRegistrationListingRequestStatus": {},
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
                18
            ],
            "userWorkspaces": [
                15
            ],
            "onboardingStatus": [
                76
            ],
            "currentWorkspace": [
                70
            ],
            "currentUserWorkspace": [
                15
            ],
            "userVars": [
                77
            ],
            "workspaceMembers": [
                18
            ],
            "deletedWorkspaceMembers": [
                227
            ],
            "hasPassword": [
                3
            ],
            "supportUserHash": [
                1
            ],
            "workspaces": [
                15
            ],
            "availableWorkspaces": [
                226
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "JSONObject": {},
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
                10
            ],
            "column": [
                10
            ],
            "rowSpan": [
                10
            ],
            "columnSpan": [
                10
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
                82
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                80
            ],
            "position": [
                83
            ],
            "configuration": [
                88
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
                84
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                86
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                87
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
                19
            ],
            "column": [
                19
            ],
            "rowSpan": [
                19
            ],
            "columnSpan": [
                19
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
                19
            ],
            "__typename": [
                1
            ]
        },
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
                89
            ],
            "on_StandaloneRichTextConfiguration": [
                92
            ],
            "on_PieChartConfiguration": [
                93
            ],
            "on_LineChartConfiguration": [
                96
            ],
            "on_IframeConfiguration": [
                98
            ],
            "on_BarChartConfiguration": [
                99
            ],
            "on_CalendarConfiguration": [
                102
            ],
            "on_FrontComponentConfiguration": [
                103
            ],
            "on_EmailsConfiguration": [
                104
            ],
            "on_EmailThreadConfiguration": [
                105
            ],
            "on_FieldConfiguration": [
                106
            ],
            "on_FieldRichTextConfiguration": [
                108
            ],
            "on_FieldsConfiguration": [
                109
            ],
            "on_FilesConfiguration": [
                110
            ],
            "on_NotesConfiguration": [
                111
            ],
            "on_TasksConfiguration": [
                112
            ],
            "on_TimelineConfiguration": [
                113
            ],
            "on_ViewConfiguration": [
                114
            ],
            "on_RecordTableConfiguration": [
                115
            ],
            "on_WorkflowConfiguration": [
                116
            ],
            "on_WorkflowRunConfiguration": [
                117
            ],
            "on_WorkflowVersionConfiguration": [
                118
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                90
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                55
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                3
            ],
            "numberFormat": [
                91
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
                19
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
                90
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
                90
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                55
            ],
            "groupByFieldMetadataId": [
                4
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                94
            ],
            "orderBy": [
                95
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                90
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                55
            ],
            "primaryAxisGroupByFieldMetadataId": [
                4
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                94
            ],
            "primaryAxisOrderBy": [
                95
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
                94
            ],
            "secondaryAxisOrderBy": [
                95
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
                97
            ],
            "displayDataLabel": [
                3
            ],
            "displayLegend": [
                3
            ],
            "rangeMin": [
                10
            ],
            "rangeMax": [
                10
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                90
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
                90
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                55
            ],
            "primaryAxisGroupByFieldMetadataId": [
                4
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                94
            ],
            "primaryAxisOrderBy": [
                95
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
                94
            ],
            "secondaryAxisOrderBy": [
                95
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
                97
            ],
            "displayDataLabel": [
                3
            ],
            "displayLegend": [
                3
            ],
            "rangeMin": [
                10
            ],
            "rangeMax": [
                10
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
                100
            ],
            "layout": [
                101
            ],
            "isCumulative": [
                3
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                90
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
                90
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                90
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                107
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
                90
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                90
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
                90
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                90
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                90
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                90
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
                10
            ],
            "pageLayoutId": [
                4
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
                121
            ],
            "objectMetadataId": [
                4
            ],
            "tabs": [
                119
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
                122
            ],
            "__typename": [
                1
            ]
        },
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
                10
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
        "BillingSubscriptionSchedulePhaseItem": {
            "price": [
                1
            ],
            "quantity": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "start_date": [
                10
            ],
            "end_date": [
                10
            ],
            "items": [
                129
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                132
            ],
            "priceUsageBased": [
                133
            ],
            "productKey": [
                134
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
                136
            ],
            "unitAmount": [
                10
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                133
            ],
            "creditAmount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionInterval": {},
        "BillingPriceTier": {
            "upTo": [
                10
            ],
            "flatAmount": [
                10
            ],
            "unitAmount": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "tiers": [
                137
            ],
            "recurringInterval": [
                136
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                133
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
                131
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
                131
            ],
            "prices": [
                135
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
                131
            ],
            "prices": [
                138
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
                10
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
        "BillingSubscription": {
            "id": [
                4
            ],
            "status": [
                145
            ],
            "interval": [
                136
            ],
            "billingSubscriptionItems": [
                142
            ],
            "currentPeriodEnd": [
                6
            ],
            "metadata": [
                5
            ],
            "phases": [
                130
            ],
            "cancelAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "BillingEndTrialPeriod": {
            "status": [
                145
            ],
            "hasPaymentMethod": [
                3
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
                134
            ],
            "periodStart": [
                6
            ],
            "periodEnd": [
                6
            ],
            "usedCredits": [
                10
            ],
            "grantedCredits": [
                10
            ],
            "rolloverCredits": [
                10
            ],
            "totalGrantedCredits": [
                10
            ],
            "unitPriceCents": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlan": {
            "planKey": [
                132
            ],
            "baseProducts": [
                140
            ],
            "resourceCreditProducts": [
                140
            ],
            "meteredProducts": [
                141
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
                144
            ],
            "billingSubscriptions": [
                144
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
                154
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
                158
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
                10
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
                156
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
                161
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                159
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
                163
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
                159
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
                162
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
                164
            ],
            "metadataEvents": [
                160
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
                10
            ],
            "status": [
                167
            ],
            "error": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "FeatureFlag": {
            "key": [
                169
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                19
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                172
            ],
            "__typename": [
                1
            ]
        },
        "BillingTrialPeriod": {
            "duration": [
                10
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
                176
            ],
            "status": [
                177
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
                175
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
                178
            ],
            "authBypassProviders": [
                179
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                170
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
                184
            ],
            "modelFamilyLabel": [
                1
            ],
            "sdkPackage": [
                1
            ],
            "inputCostPerMillionTokens": [
                10
            ],
            "outputCostPerMillionTokens": [
                10
            ],
            "nativeCapabilities": [
                182
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
                10
            ],
            "maxOutputTokens": [
                10
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
                174
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                187
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
                190
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
                10
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
                169
            ],
            "metadata": [
                192
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
                178
            ],
            "billing": [
                185
            ],
            "aiModels": [
                183
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
                186
            ],
            "isAttachmentPreviewEnabled": [
                3
            ],
            "sentry": [
                188
            ],
            "captcha": [
                189
            ],
            "api": [
                191
            ],
            "canManageFeatureFlags": [
                3
            ],
            "publicFeatureFlags": [
                193
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
            "isCloudflareIntegrationEnabled": [
                3
            ],
            "isClickHouseConfigured": [
                3
            ],
            "isWorkspaceSchemaDDLLocked": [
                3
            ],
            "enterpriseInstanceType": [
                1
            ],
            "maintenance": [
                194
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationClaimChallenge": {
            "applicationRegistrationId": [
                1
            ],
            "sourcePackage": [
                1
            ],
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
        "ClaimableApplicationRegistration": {
            "id": [
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
        "PendingApplicationRegistrationClaim": {
            "applicationRegistrationId": [
                1
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "sourcePackage": [
                1
            ],
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
        "CreateApplicationRegistration": {
            "applicationRegistration": [
                73
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
        "Relation": {
            "type": [
                204
            ],
            "sourceObjectMetadata": [
                46
            ],
            "targetObjectMetadata": [
                46
            ],
            "sourceFieldMetadata": [
                42
            ],
            "targetFieldMetadata": [
                42
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
                10
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
                19
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
                10
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
                46
            ],
            "cursor": [
                48
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
                48
            ],
            "endCursor": [
                48
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                209
            ],
            "edges": [
                208
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "node": [
                44
            ],
            "cursor": [
                48
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                209
            ],
            "edges": [
                211
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                42
            ],
            "cursor": [
                48
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                209
            ],
            "edges": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                209
            ],
            "edges": [
                213
            ],
            "__typename": [
                1
            ]
        },
        "AppConnection": {
            "id": [
                217
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
                176
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                177
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
                176
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
                177
            ],
            "workspace": [
                221
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
                176
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                177
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                176
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
                177
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
                170
            ],
            "logo": [
                1
            ],
            "sso": [
                224
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                225
            ],
            "availableWorkspacesForSignUp": [
                225
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
                17
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
            "logo": [
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
                229
            ],
            "fieldPermissions": [
                230
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
                29
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
            "logo": [
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
                231
            ],
            "manifest": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "BillingEntitlement": {
            "key": [
                234
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
                235
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
                12
            ],
            "predicateGroups": [
                9
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
                10
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                240
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                239
            ],
            "SMTP": [
                239
            ],
            "CALDAV": [
                239
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
                241
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
                31
            ],
            "refreshToken": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "tokens": [
                247
            ],
            "availableWorkspaces": [
                226
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
                170
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
                31
            ],
            "workspace": [
                252
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                31
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
                31
            ],
            "workspaceUrls": [
                170
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
                247
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                31
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
                10
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
                31
            ],
            "workspace": [
                252
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
                10
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
                265
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                196
            ],
            "usageByOperationType": [
                196
            ],
            "usageByModel": [
                196
            ],
            "timeSeries": [
                265
            ],
            "periodStart": [
                6
            ],
            "periodEnd": [
                6
            ],
            "userDailyUsage": [
                266
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
                10
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
                10
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
                274
            ],
            "verificationRecords": [
                272
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
                276
            ],
            "handle": [
                1
            ],
            "type": [
                277
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                278
            ],
            "messageFolderImportPolicy": [
                279
            ],
            "excludeNonProfessionalEmails": [
                3
            ],
            "excludeGroupEmails": [
                3
            ],
            "pendingGroupEmailsAction": [
                280
            ],
            "isSyncEnabled": [
                3
            ],
            "syncedAt": [
                6
            ],
            "syncStatus": [
                281
            ],
            "syncStage": [
                282
            ],
            "syncStageStartedAt": [
                6
            ],
            "throttleFailureCount": [
                10
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
                242
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
                275
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
                19
            ],
            "withoutEmail": [
                19
            ],
            "duplicateEmails": [
                19
            ],
            "globallyUnsubscribed": [
                19
            ],
            "topicUnsubscribed": [
                19
            ],
            "sendable": [
                19
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
                19
            ],
            "deduped": [
                19
            ],
            "overCap": [
                19
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
                19
            ],
            "skipped": [
                286
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
                289
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
                10
            ],
            "lng": [
                10
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
                291
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
                10
            ],
            "username": [
                1
            ],
            "connectionSecurity": [
                240
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
                293
            ],
            "SMTP": [
                293
            ],
            "CALDAV": [
                293
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
                294
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
                19
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
                303
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
                101
            ],
            "groupMode": [
                100
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
                10
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
                305
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                306
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "PieChartData": {
            "data": [
                308
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
                10
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
                313
            ],
            "totalCount": [
                19
            ],
            "pageInfo": [
                314
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
                299
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
                217
            ],
            "title": [
                1
            ],
            "totalInputTokens": [
                19
            ],
            "totalOutputTokens": [
                19
            ],
            "contextWindowTokens": [
                19
            ],
            "conversationSize": [
                19
            ],
            "totalInputCredits": [
                10
            ],
            "totalOutputCredits": [
                10
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
                19
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                319
            ],
            "estimatedTokenCount": [
                19
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
                19
            ],
            "error": [
                321
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
        "AgentTurnEvaluation": {
            "id": [
                4
            ],
            "turnId": [
                4
            ],
            "score": [
                19
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
                325
            ],
            "messages": [
                317
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
                19
            ],
            "skillsCount": [
                19
            ],
            "toolsCount": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannel": {
            "id": [
                4
            ],
            "handle": [
                1
            ],
            "syncStatus": [
                329
            ],
            "syncStage": [
                330
            ],
            "visibility": [
                331
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                332
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
                10
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
                334
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
                336
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
                65
            ],
            "key": [
                66
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
                337
            ],
            "views": [
                338
            ],
            "collectionHashes": [
                335
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "navigationMenuItems": [
                157
            ],
            "navigationMenuItem": [
                157,
                {
                    "id": [
                        4,
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
                125
            ],
            "getViewFilterGroups": [
                56,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                56,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                58,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                58,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                64,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        65,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                64,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                61,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                54,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                54,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                63,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                63,
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
            "apiKey": [
                7,
                {
                    "input": [
                        341,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "getInviteSuggestions": [
                152
            ],
            "applicationConnectionProviders": [
                123,
                {
                    "applicationId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "billingPortalSession": [
                150,
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
                148
            ],
            "getResourceCreditUsage": [
                147
            ],
            "findWorkspaceInvitations": [
                154
            ],
            "getApprovedAccessDomains": [
                126
            ],
            "getPageLayoutTabs": [
                119,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                119,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                120,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        121
                    ]
                }
            ],
            "getPageLayout": [
                120,
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
                23
            ],
            "findOneAgent": [
                23,
                {
                    "input": [
                        342,
                        "AgentIdInput!"
                    ]
                }
            ],
            "objectRecordCounts": [
                206
            ],
            "object": [
                46,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                210,
                {
                    "paging": [
                        47,
                        "CursorPaging!"
                    ],
                    "filter": [
                        343,
                        "ObjectFilter!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                40,
                {
                    "input": [
                        344,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                40
            ],
            "getAvailablePackages": [
                5,
                {
                    "input": [
                        344,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        344,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "commandMenuItems": [
                34
            ],
            "commandMenuItem": [
                34,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                33
            ],
            "frontComponent": [
                33,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "currentWorkspace": [
                70
            ],
            "getPublicWorkspaceDataByDomain": [
                180,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                181,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "field": [
                42,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                215,
                {
                    "paging": [
                        47,
                        "CursorPaging!"
                    ],
                    "filter": [
                        49,
                        "FieldFilter!"
                    ]
                }
            ],
            "getViewGroups": [
                60,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                60,
                {
                    "id": [
                        1,
                        "String!"
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
                        4
                    ],
                    "universalIdentifier": [
                        4
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                228,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                232,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                228,
                {
                    "isVetted": [
                        3,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                232,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                201,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                73,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                73
            ],
            "findOneApplicationRegistration": [
                73,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                173,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                171,
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
                198,
                {
                    "sourcePackage": [
                        1
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "findPendingApplicationRegistrationClaims": [
                199
            ],
            "getRoles": [
                27
            ],
            "previewMessageCampaignAudience": [
                284,
                {
                    "input": [
                        345,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                288
            ],
            "unsubscribePagePreviewUrl": [
                1
            ],
            "myMessageChannels": [
                275,
                {
                    "connectedAccountId": [
                        4
                    ]
                }
            ],
            "getEmailingDomains": [
                273
            ],
            "myConnectedAccounts": [
                242
            ],
            "getToolIndex": [
                298
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
                297
            ],
            "webhook": [
                297,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "myMessageFolders": [
                333,
                {
                    "messageChannelId": [
                        4
                    ]
                }
            ],
            "myCalendarChannels": [
                328,
                {
                    "connectedAccountId": [
                        4
                    ]
                }
            ],
            "minimalMetadata": [
                339
            ],
            "appConnections": [
                216,
                {
                    "filter": [
                        346
                    ]
                }
            ],
            "appConnection": [
                216,
                {
                    "id": [
                        217,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                327
            ],
            "chatThreads": [
                318
            ],
            "chatThread": [
                318,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                317,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                322,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                320
            ],
            "skills": [
                316
            ],
            "skill": [
                316,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                326,
                {
                    "agentId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                262,
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
                263,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                70,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                257,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                258
            ],
            "validatePasswordResetToken": [
                255,
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
                222
            ],
            "eventLogs": [
                315,
                {
                    "input": [
                        347,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                309,
                {
                    "input": [
                        351,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                307,
                {
                    "input": [
                        352,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                304,
                {
                    "input": [
                        353,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                295,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                290,
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
                292,
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
                267,
                {
                    "input": [
                        354
                    ]
                }
            ],
            "findManyPublicDomains": [
                271
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
                343
            ],
            "or": [
                343
            ],
            "id": [
                50
            ],
            "isRemote": [
                51
            ],
            "isActive": [
                51
            ],
            "isSystem": [
                51
            ],
            "isUIEditable": [
                51
            ],
            "isUICreatable": [
                51
            ],
            "isUIReadOnly": [
                51
            ],
            "isSearchable": [
                51
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                217
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
                348
            ],
            "filters": [
                349
            ],
            "first": [
                19
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
                350
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
                355
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
                        357,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                3,
                {
                    "input": [
                        358,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                157,
                {
                    "inputs": [
                        359,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                157,
                {
                    "input": [
                        359,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                157,
                {
                    "inputs": [
                        360,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                157,
                {
                    "input": [
                        360,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                157,
                {
                    "ids": [
                        4,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                157,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                128,
                {
                    "filename": [
                        1,
                        "String!"
                    ],
                    "size": [
                        10,
                        "Float!"
                    ],
                    "fileFolder": [
                        362,
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
                127,
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
                124
            ],
            "setEnterpriseKey": [
                124,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadEmailAttachmentFile": [
                127,
                {
                    "file": [
                        363,
                        "Upload!"
                    ]
                }
            ],
            "uploadAiChatFile": [
                127,
                {
                    "file": [
                        363,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkflowFile": [
                127,
                {
                    "file": [
                        363,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                127,
                {
                    "file": [
                        363,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                127,
                {
                    "file": [
                        363,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFile": [
                127,
                {
                    "file": [
                        363,
                        "Upload!"
                    ],
                    "fieldMetadataId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                127,
                {
                    "file": [
                        363,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                56,
                {
                    "input": [
                        364,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                56,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        365,
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
                58,
                {
                    "input": [
                        366,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                58,
                {
                    "input": [
                        367,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                58,
                {
                    "input": [
                        369,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                58,
                {
                    "input": [
                        370,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "createView": [
                64,
                {
                    "input": [
                        371,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                64,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        372,
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
                64,
                {
                    "input": [
                        373,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                61,
                {
                    "input": [
                        378,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                61,
                {
                    "input": [
                        379,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                3,
                {
                    "input": [
                        381,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                3,
                {
                    "input": [
                        382,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "updateViewField": [
                54,
                {
                    "input": [
                        383,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                54,
                {
                    "input": [
                        385,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                54,
                {
                    "inputs": [
                        385,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                54,
                {
                    "input": [
                        386,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                54,
                {
                    "input": [
                        387,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                63,
                {
                    "input": [
                        388,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                63,
                {
                    "input": [
                        390,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                63,
                {
                    "inputs": [
                        390,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                63,
                {
                    "input": [
                        391,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                63,
                {
                    "input": [
                        392,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                64,
                {
                    "input": [
                        393,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createApiKey": [
                7,
                {
                    "input": [
                        396,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                7,
                {
                    "input": [
                        397,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                7,
                {
                    "input": [
                        398,
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
            "skipSyncEmailOnboardingStep": [
                153
            ],
            "triggerInstallAppsOnboardingStep": [
                153,
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
                150,
                {
                    "recurringInterval": [
                        136,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        132,
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
                149,
                {
                    "recurringInterval": [
                        136,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        132,
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
                149
            ],
            "switchSubscriptionInterval": [
                151
            ],
            "switchBillingPlan": [
                151
            ],
            "cancelSwitchBillingPlan": [
                151
            ],
            "cancelSwitchBillingInterval": [
                151
            ],
            "setResourceCreditSubscriptionPrice": [
                151,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                146
            ],
            "cancelSwitchResourceCreditPrice": [
                151
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
                155,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                155,
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
                126,
                {
                    "input": [
                        399,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                3,
                {
                    "input": [
                        400,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                126,
                {
                    "input": [
                        401,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                119,
                {
                    "input": [
                        402,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                119,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        403,
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
                120,
                {
                    "input": [
                        404,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                120,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        405,
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
                120,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        406,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                120,
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
                119,
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
                        410,
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
                        411,
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
                23,
                {
                    "input": [
                        412,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                23,
                {
                    "input": [
                        413,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                23,
                {
                    "input": [
                        342,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createOneObject": [
                46,
                {
                    "input": [
                        414,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                46,
                {
                    "input": [
                        416,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                46,
                {
                    "input": [
                        417,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "createOneIndex": [
                44,
                {
                    "input": [
                        419,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                44,
                {
                    "input": [
                        422,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                40,
                {
                    "input": [
                        344,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                40,
                {
                    "input": [
                        423,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                166,
                {
                    "input": [
                        424,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                3,
                {
                    "input": [
                        425,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                34,
                {
                    "input": [
                        427,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                34,
                {
                    "input": [
                        428,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "resetCommandMenuItem": [
                34,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                34,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                33,
                {
                    "input": [
                        429,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                33,
                {
                    "input": [
                        430,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                33,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                70,
                {
                    "data": [
                        432,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                70,
                {
                    "data": [
                        433,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                70
            ],
            "checkCustomDomainValidRecords": [
                236
            ],
            "createOneField": [
                42,
                {
                    "input": [
                        434,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                42,
                {
                    "input": [
                        436,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                42,
                {
                    "input": [
                        438,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                60,
                {
                    "input": [
                        439,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                60,
                {
                    "inputs": [
                        439,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                60,
                {
                    "input": [
                        440,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                60,
                {
                    "inputs": [
                        440,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                60,
                {
                    "input": [
                        442,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                60,
                {
                    "input": [
                        443,
                        "DestroyViewGroupInput!"
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
            "createApplicationRegistration": [
                200,
                {
                    "input": [
                        444,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                73,
                {
                    "input": [
                        445,
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
                202,
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
                        447,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                2,
                {
                    "input": [
                        448,
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
                73,
                {
                    "file": [
                        363,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                73,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "startApplicationRegistrationClaim": [
                197,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyApplicationRegistrationClaim": [
                73,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "cancelApplicationRegistrationClaim": [
                3,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                73,
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
            "requestApplicationRegistrationListing": [
                73,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ],
                    "contactEmail": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                18,
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
                27,
                {
                    "createRoleInput": [
                        450,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                27,
                {
                    "updateRoleInput": [
                        451,
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
                14,
                {
                    "upsertObjectPermissionsInput": [
                        453,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                25,
                {
                    "upsertPermissionFlagsInput": [
                        455,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                24,
                {
                    "upsertFieldPermissionsInput": [
                        456,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                237,
                {
                    "input": [
                        458,
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
                285,
                {
                    "input": [
                        461,
                        "SendEmailViaDomainInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                287,
                {
                    "input": [
                        462,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                288,
                {
                    "input": [
                        463,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                288,
                {
                    "input": [
                        464,
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
                275,
                {
                    "input": [
                        465,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                283,
                {
                    "input": [
                        467,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                275,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createEmailingDomain": [
                273,
                {
                    "input": [
                        468,
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
                273,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                242,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "runAgent": [
                300,
                {
                    "input": [
                        469,
                        "RunAgentInput!"
                    ]
                }
            ],
            "createWebhook": [
                297,
                {
                    "input": [
                        470,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                297,
                {
                    "input": [
                        471,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                297,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "updateMessageFolder": [
                333,
                {
                    "input": [
                        473,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                333,
                {
                    "input": [
                        475,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                328,
                {
                    "input": [
                        476,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "createChatThread": [
                318
            ],
            "sendChatMessage": [
                323,
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
                        478,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "retryChatMessage": [
                323,
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
                323,
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
                        479,
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
                318,
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
                318,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "unarchiveChatThread": [
                318,
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
            "createSkill": [
                316,
                {
                    "input": [
                        480,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                316,
                {
                    "input": [
                        481,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                316,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                316,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                316,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                325,
                {
                    "turnId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                326,
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
                250,
                {
                    "input": [
                        482,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                261,
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
                248,
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
                256,
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
                248,
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
                260,
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
                248,
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
                253,
                {
                    "input": [
                        483
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                127,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        363,
                        "Upload!"
                    ]
                }
            ],
            "generateTransientToken": [
                254
            ],
            "getAuthTokensFromLoginToken": [
                260,
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
                246,
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
                260,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                259,
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
                31
            ],
            "emailPasswordResetLink": [
                249,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        4
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                251,
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
                244,
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
                244
            ],
            "deleteTwoFactorAuthenticationMethod": [
                243,
                {
                    "twoFactorAuthenticationMethodId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                245,
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
                15,
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
                        484,
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
                218,
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
                223,
                {
                    "input": [
                        485,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                223,
                {
                    "input": [
                        486,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                219,
                {
                    "input": [
                        487,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                220,
                {
                    "input": [
                        488,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                312,
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
                312,
                {
                    "type": [
                        489,
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
                310,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                264,
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
            "createCalendarEvent": [
                302,
                {
                    "input": [
                        490,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                311,
                {
                    "input": [
                        491,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                301,
                {
                    "connectedAccountId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                296,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        493,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        4
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                168,
                {
                    "input": [
                        495,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                271,
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
                236,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                268,
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
                269,
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
                270,
                {
                    "file": [
                        363,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        362,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
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
            "generateApplicationToken": [
                32,
                {
                    "applicationId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "renewApplicationToken": [
                32,
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
                158
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
                10
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
                361
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
                10
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
                57
            ],
            "positionInViewFilterGroup": [
                10
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
                57
            ],
            "positionInViewFilterGroup": [
                10
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
                59
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                10
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
                368
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
                59
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                10
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
                65
            ],
            "key": [
                66
            ],
            "icon": [
                1
            ],
            "position": [
                10
            ],
            "isCompact": [
                3
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "kanbanColumnWidth": [
                19
            ],
            "openRecordIn": [
                67
            ],
            "kanbanAggregateOperation": [
                55
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                68
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
                69
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
                65
            ],
            "icon": [
                1
            ],
            "position": [
                10
            ],
            "isCompact": [
                3
            ],
            "openRecordIn": [
                67
            ],
            "kanbanAggregateOperation": [
                55
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                68
            ],
            "calendarFieldMetadataId": [
                4
            ],
            "calendarEndFieldMetadataId": [
                4
            ],
            "visibility": [
                69
            ],
            "mainGroupByFieldMetadataId": [
                4
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "kanbanColumnWidth": [
                19
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetInput": {
            "widgetId": [
                4
            ],
            "viewFields": [
                374
            ],
            "viewFilters": [
                375
            ],
            "viewFilterGroups": [
                376
            ],
            "viewSorts": [
                377
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
                10
            ],
            "size": [
                10
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
                59
            ],
            "value": [
                5
            ],
            "viewFilterGroupId": [
                4
            ],
            "positionInViewFilterGroup": [
                10
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
                57
            ],
            "positionInViewFilterGroup": [
                10
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
                62
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
                62
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
                380
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                62
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
                384
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
                10
            ],
            "position": [
                10
            ],
            "aggregateOperation": [
                55
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
                10
            ],
            "position": [
                10
            ],
            "aggregateOperation": [
                55
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
                389
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
                10
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
                10
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
                394
            ],
            "fields": [
                395
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
                10
            ],
            "isVisible": [
                3
            ],
            "fields": [
                395
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
                10
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
                10
            ],
            "pageLayoutId": [
                4
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
                10
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
                121
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
                121
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
                121
            ],
            "objectMetadataId": [
                4
            ],
            "tabs": [
                407
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
                10
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                85
            ],
            "widgets": [
                408
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
                82
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                409
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
                10
            ],
            "column": [
                10
            ],
            "rowSpan": [
                10
            ],
            "columnSpan": [
                10
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
                82
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                409
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
                82
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                409
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
                415
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
                418
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
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                420
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
                421
            ],
            "indexType": [
                45
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
                10
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
                426
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
                10
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
                35
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
                10
            ],
            "isPinned": [
                3
            ],
            "availabilityType": [
                36
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
                10
            ],
            "isPinned": [
                3
            ],
            "availabilityType": [
                36
            ],
            "availabilityObjectMetadataId": [
                4
            ],
            "engineComponentKey": [
                35
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
                431
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
                71
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
                10
            ],
            "eventLogRetentionDays": [
                10
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
        "CreateOneFieldMetadataInput": {
            "field": [
                435
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                43
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
                437
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
                10
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
                441
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
                10
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
                446
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
                449
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
                452
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
                454
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
                457
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
                459
            ],
            "predicateGroups": [
                460
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
                13
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
                10
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
                11
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                10
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
            "listId": [
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
                289
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
                289
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
                466
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                276
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                278
            ],
            "messageFolderImportPolicy": [
                279
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
            "__typename": [
                1
            ]
        },
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
                472
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
                474
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
                474
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
                477
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                331
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                332
            ],
            "isSyncEnabled": [
                3
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
                19
            ],
            "selectedOptionIndices": [
                19
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
                177
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
                492
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
                494
            ],
            "SMTP": [
                494
            ],
            "CALDAV": [
                494
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
                10
            ],
            "username": [
                1
            ],
            "password": [
                1
            ],
            "connectionSecurity": [
                240
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
                165,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                238,
                {
                    "input": [
                        497,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                324,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                313,
                {
                    "table": [
                        348,
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