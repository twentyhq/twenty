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
        26,
        27,
        28,
        30,
        31,
        38,
        39,
        40,
        41,
        44,
        46,
        54,
        56,
        58,
        60,
        63,
        66,
        67,
        68,
        69,
        70,
        72,
        73,
        74,
        76,
        77,
        82,
        83,
        84,
        86,
        94,
        101,
        104,
        106,
        110,
        111,
        114,
        115,
        117,
        120,
        121,
        131,
        146,
        150,
        154,
        155,
        158,
        165,
        168,
        169,
        173,
        176,
        178,
        199,
        204,
        211,
        212,
        219,
        224,
        227,
        250,
        260,
        261,
        263,
        268,
        271,
        280,
        311,
        318,
        326,
        327,
        328,
        330,
        331,
        332,
        333,
        334,
        335,
        336,
        346,
        347,
        350,
        389,
        397,
        399,
        400,
        401,
        402,
        404,
        406,
        412,
        431,
        444,
        566,
        570,
        597
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
                81
            ],
            "on_BillingLicensedProduct": [
                90
            ],
            "on_BillingMeteredProduct": [
                91
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
                50
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
                15
            ],
            "scope": [
                22
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
                15
            ],
            "executionMode": [
                24
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
                26
            ],
            "readability": [
                27
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                3
            ],
            "writability": [
                28
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
                275,
                {
                    "paging": [
                        29,
                        "CursorPaging!"
                    ],
                    "filter": [
                        32,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                276,
                {
                    "paging": [
                        29,
                        "CursorPaging!"
                    ],
                    "filter": [
                        35,
                        "IndexFilter!"
                    ]
                }
            ],
            "fieldsList": [
                262
            ],
            "indexMetadataList": [
                270
            ],
            "searchFieldMetadataList": [
                278
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
                31
            ],
            "after": [
                31
            ],
            "first": [
                30
            ],
            "last": [
                30
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                32
            ],
            "or": [
                32
            ],
            "id": [
                33
            ],
            "isActive": [
                34
            ],
            "isSystem": [
                34
            ],
            "isUIEditable": [
                34
            ],
            "isUIReadOnly": [
                34
            ],
            "objectMetadataId": [
                33
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
                35
            ],
            "or": [
                35
            ],
            "id": [
                33
            ],
            "isCustom": [
                34
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
                36
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
                38
            ],
            "avatarUrl": [
                1
            ],
            "locale": [
                1
            ],
            "calendarStartDay": [
                30
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                39
            ],
            "timeFormat": [
                40
            ],
            "roles": [
                50
            ],
            "userId": [
                3
            ],
            "userWorkspaceId": [
                3
            ],
            "numberFormat": [
                41
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
                44
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
                46
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
                45
            ],
            "rowLevelPermissionPredicateGroups": [
                43
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
                37
            ],
            "agents": [
                10
            ],
            "apiKeys": [
                49
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
                48
            ],
            "objectPermissions": [
                47
            ],
            "fieldPermissions": [
                42
            ],
            "rowLevelPermissionPredicates": [
                45
            ],
            "rowLevelPermissionPredicateGroups": [
                43
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
                50
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
            "settingsMenuItems": [
                21
            ],
            "logicFunctions": [
                23
            ],
            "objects": [
                25
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
                75
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
                54
            ],
            "objectPermissions": [
                47
            ],
            "objectsPermissions": [
                47
            ],
            "twoFactorAuthenticationMethodSummary": [
                52
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
                56
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
                58
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
                60
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
                63
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
                55
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
                66
            ],
            "key": [
                67
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
                68
            ],
            "kanbanAggregateOperation": [
                56
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
                30
            ],
            "groupLoadLimit": [
                30
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
                69
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
                55
            ],
            "viewFilters": [
                59
            ],
            "viewFilterGroups": [
                57
            ],
            "viewSorts": [
                62
            ],
            "viewGroups": [
                61
            ],
            "viewFieldGroups": [
                64
            ],
            "visibility": [
                70
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
                72
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
                73
            ],
            "views": [
                65
            ],
            "viewFields": [
                55
            ],
            "viewFilters": [
                59
            ],
            "viewFilterGroups": [
                57
            ],
            "viewGroups": [
                61
            ],
            "viewSorts": [
                62
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
            "allowedIframeOrigins": [
                1
            ],
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                50
            ],
            "aiChatModelTier": [
                74
            ],
            "aiAgentModelTier": [
                74
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
                51
            ],
            "featureFlags": [
                203
            ],
            "billingSubscriptions": [
                93
            ],
            "installedApplications": [
                51
            ],
            "currentBillingSubscription": [
                93
            ],
            "billingCustomer": [
                95
            ],
            "billingEntitlements": [
                279
            ],
            "hasValidSignedEnterpriseKey": [
                8
            ],
            "hasValidEnterpriseValidityToken": [
                8
            ],
            "workspaceUrls": [
                205
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
                37
            ],
            "userWorkspaces": [
                53
            ],
            "onboardingStatus": [
                76
            ],
            "previousOnboardingStatus": [
                76
            ],
            "currentWorkspace": [
                71
            ],
            "currentUserWorkspace": [
                53
            ],
            "userVars": [
                77
            ],
            "workspaceMembers": [
                37
            ],
            "deletedWorkspaceMembers": [
                247
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
                53
            ],
            "availableWorkspaces": [
                246
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
                79
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                82
            ],
            "priceUsageBased": [
                83
            ],
            "productKey": [
                84
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
                86
            ],
            "unitAmount": [
                15
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                83
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
                87
            ],
            "recurringInterval": [
                86
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                83
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
                81
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
                81
            ],
            "prices": [
                85
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
                81
            ],
            "prices": [
                88
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
        "BillingSubscription": {
            "id": [
                3
            ],
            "status": [
                94
            ],
            "interval": [
                86
            ],
            "billingSubscriptionItems": [
                92
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                9
            ],
            "phases": [
                80
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
                101
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                99
            ],
            "position": [
                102
            ],
            "configuration": [
                108
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
                103
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                105
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                107
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                104
            ],
            "row": [
                30
            ],
            "column": [
                30
            ],
            "rowSpan": [
                30
            ],
            "columnSpan": [
                30
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                104
            ],
            "index": [
                30
            ],
            "heightBehavior": [
                106
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                104
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                109
            ],
            "on_StandaloneRichTextConfiguration": [
                112
            ],
            "on_PieChartConfiguration": [
                113
            ],
            "on_LineChartConfiguration": [
                116
            ],
            "on_IframeConfiguration": [
                118
            ],
            "on_BarChartConfiguration": [
                119
            ],
            "on_CalendarConfiguration": [
                122
            ],
            "on_FrontComponentConfiguration": [
                123
            ],
            "on_EmailsConfiguration": [
                124
            ],
            "on_EmailThreadConfiguration": [
                125
            ],
            "on_CallRecordingSummaryConfiguration": [
                126
            ],
            "on_CallRecordingTranscriptConfiguration": [
                127
            ],
            "on_MessageCampaignBodyConfiguration": [
                128
            ],
            "on_MessageCampaignDetailsConfiguration": [
                129
            ],
            "on_FieldConfiguration": [
                130
            ],
            "on_FieldRichTextConfiguration": [
                132
            ],
            "on_FieldsConfiguration": [
                133
            ],
            "on_FormFieldConfiguration": [
                134
            ],
            "on_FilesConfiguration": [
                135
            ],
            "on_NotesConfiguration": [
                136
            ],
            "on_TasksConfiguration": [
                137
            ],
            "on_TimelineConfiguration": [
                138
            ],
            "on_ViewConfiguration": [
                139
            ],
            "on_RecordTableConfiguration": [
                140
            ],
            "on_WorkflowConfiguration": [
                141
            ],
            "on_WorkflowRunConfiguration": [
                142
            ],
            "on_WorkflowVersionConfiguration": [
                143
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                110
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                8
            ],
            "numberFormat": [
                111
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
                30
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                97
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "ChartNumberFormat": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                110
            ],
            "body": [
                98
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                110
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                114
            ],
            "orderBy": [
                115
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
                111
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
                30
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                110
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                114
            ],
            "primaryAxisOrderBy": [
                115
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
                114
            ],
            "secondaryAxisOrderBy": [
                115
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
                117
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                111
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
                30
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                110
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
                110
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                56
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                114
            ],
            "primaryAxisOrderBy": [
                115
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
                114
            ],
            "secondaryAxisOrderBy": [
                115
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
                117
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                111
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
                120
            ],
            "layout": [
                121
            ],
            "isCumulative": [
                8
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                30
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                110
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
                110
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                110
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                131
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
                110
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                110
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
                110
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
                110
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                110
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                30
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
                110
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                110
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                110
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
                100
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                104
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
                146
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                144
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
                147
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
                15
            ],
            "status": [
                150
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
        "UsageQuotaDefinition": {
            "resourceType": [
                154
            ],
            "limitKind": [
                1
            ],
            "allowedOperationTypes": [
                155
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
                153
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
                154
            ],
            "operationType": [
                155
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
                158
            ],
            "isEnforced": [
                8
            ],
            "consumedValue": [
                158
            ],
            "remainingValue": [
                158
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
                158
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
                154
            ],
            "operationType": [
                155
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
                30
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "limitValue": [
                158
            ],
            "burstValue": [
                158
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
                165
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
                163
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
                168
            ],
            "principalType": [
                1
            ],
            "principalId": [
                3
            ],
            "accessLevel": [
                169
            ],
            "rowCause": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "RecordShareAccessLevel": {},
        "RecordSharingRoleDTO": {
            "id": [
                3
            ],
            "label": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingDTO": {
            "viewerAccessLevel": [
                169
            ],
            "permissions": [
                166
            ],
            "isEnabled": [
                8
            ],
            "hasInheritedAccess": [
                8
            ],
            "roles": [
                170
            ],
            "shares": [
                167
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
                173
            ],
            "attemptsMade": [
                30
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
                176
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                174
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
                178
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
                174
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
                177
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
                179
            ],
            "metadataEvents": [
                175
            ],
            "queueJobEvents": [
                172
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
                94
            ],
            "hasPaymentMethod": [
                8
            ],
            "billingPortalUrl": [
                1
            ],
            "currentBillingSubscription": [
                93
            ],
            "billingSubscriptions": [
                93
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                84
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
                82
            ],
            "baseProducts": [
                90
            ],
            "resourceCreditProducts": [
                90
            ],
            "meteredProducts": [
                91
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
                93
            ],
            "billingSubscriptions": [
                93
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
                189
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                188
            ],
            "usageByOperationType": [
                188
            ],
            "usageByApplication": [
                188
            ],
            "usageByModel": [
                188
            ],
            "timeSeries": [
                189
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userDailyUsage": [
                190
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
                76
            ],
            "previousOnboardingStatus": [
                76
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
                196
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
                199
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                198
            ],
            "SMTP": [
                198
            ],
            "CALDAV": [
                198
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
                200
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
                200
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
                204
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
                30
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                30
            ],
            "suspendedInstalls": [
                30
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                207
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
                211
            ],
            "status": [
                212
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
                210
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
                213
            ],
            "authBypassProviders": [
                214
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                205
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
                219
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
                217
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
                15
            ],
            "maxScoreLevels": [
                15
            ],
            "medianLatencyMs": [
                15
            ],
            "inputCostPerMillionTokens": [
                15
            ],
            "outputCostPerMillionTokens": [
                15
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
                74
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
                209
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                224
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
                227
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
                204
            ],
            "metadata": [
                229
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
                213
            ],
            "billing": [
                222
            ],
            "aiModels": [
                218
            ],
            "aiEvaluationModels": [
                220
            ],
            "aiModelTiers": [
                221
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
                223
            ],
            "isAttachmentPreviewEnabled": [
                8
            ],
            "sentry": [
                225
            ],
            "captcha": [
                226
            ],
            "api": [
                228
            ],
            "canManageFeatureFlags": [
                8
            ],
            "publicFeatureFlags": [
                230
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
                231
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
                168
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
                211
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                212
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
                211
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
                212
            ],
            "workspace": [
                241
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
                211
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                212
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                211
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
                212
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
                205
            ],
            "logo": [
                1
            ],
            "sso": [
                244
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                245
            ],
            "availableWorkspacesForSignUp": [
                245
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
                36
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
                250
            ],
            "title": [
                1
            ],
            "description": [
                1
            ],
            "action": [
                248
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
                252
            ],
            "fieldPermissions": [
                253
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
                30
            ],
            "defaultRoleUniversalIdentifier": [
                1
            ],
            "roles": [
                254
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
                260
            ],
            "enrichment": [
                9
            ],
            "personOutcome": [
                261
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
                263
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
                28
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
                25
            ],
            "relation": [
                267
            ],
            "morphRelations": [
                267
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
                31
            ],
            "endCursor": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                262
            ],
            "cursor": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                264
            ],
            "edges": [
                265
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                268
            ],
            "sourceObjectMetadata": [
                25
            ],
            "targetObjectMetadata": [
                25
            ],
            "sourceFieldMetadata": [
                262
            ],
            "targetFieldMetadata": [
                262
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
                271
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IndexEdge": {
            "node": [
                270
            ],
            "cursor": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                25
            ],
            "cursor": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                264
            ],
            "edges": [
                273
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                264
            ],
            "edges": [
                265
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                264
            ],
            "edges": [
                272
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
                30
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
                280
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
                281
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
                45
            ],
            "predicateGroups": [
                43
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
                289
            ],
            "availableWorkspaces": [
                246
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
                205
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
                294
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
                205
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
                289
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
                294
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
                311
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
                309
            ],
            "manifest": [
                9
            ],
            "coverage": [
                310
            ],
            "files": [
                312
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
                314
            ],
            "errors": [
                315
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
                318
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
                318
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
                317
            ],
            "errors": [
                319
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
                326
            ],
            "tenantStatus": [
                327
            ],
            "unsubscribeHostnameStatus": [
                328
            ],
            "verificationRecords": [
                324
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
                330
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "type": [
                331
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                332
            ],
            "messageFolderImportPolicy": [
                333
            ],
            "excludeNonProfessionalEmails": [
                8
            ],
            "excludeGroupEmails": [
                8
            ],
            "pendingGroupEmailsAction": [
                334
            ],
            "isSyncEnabled": [
                8
            ],
            "syncedAt": [
                4
            ],
            "syncStatus": [
                335
            ],
            "syncStage": [
                336
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
                201
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
                337
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelOutput": {
            "messageChannel": [
                329
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
                30
            ],
            "withoutEmail": [
                30
            ],
            "duplicateEmails": [
                30
            ],
            "overCap": [
                30
            ],
            "hardSuppressed": [
                30
            ],
            "globallyUnsubscribed": [
                30
            ],
            "topicUnsubscribed": [
                30
            ],
            "sendable": [
                30
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
                30
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
                30
            ],
            "audience": [
                340
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
                346
            ],
            "source": [
                347
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
                345
            ],
            "totalCount": [
                30
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
                350
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
                352
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
                199
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
                354
            ],
            "SMTP": [
                354
            ],
            "CALDAV": [
                354
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
                355
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
                30
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
                364
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
                121
            ],
            "groupMode": [
                120
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
                366
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                367
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
                369
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
                374
            ],
            "totalCount": [
                30
            ],
            "pageInfo": [
                375
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
                30
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
        "AiChatUsage": {
            "limitValue": [
                158
            ],
            "consumedValue": [
                158
            ],
            "periodEnd": [
                4
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
                360
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
                168
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                30
            ],
            "totalInputTokens": [
                30
            ],
            "totalOutputTokens": [
                30
            ],
            "contextWindowTokens": [
                30
            ],
            "conversationSize": [
                30
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
                30
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                382
            ],
            "estimatedTokenCount": [
                30
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
                30
            ],
            "error": [
                384
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
                389
            ],
            "thread": [
                381
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceSetupChatOutcome": {},
        "RecordPermissionsResult": {
            "objectMetadataId": [
                3
            ],
            "recordId": [
                3
            ],
            "permissions": [
                166
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
                30
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
                391
            ],
            "messages": [
                380
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
                30
            ],
            "skillsCount": [
                30
            ],
            "toolsCount": [
                30
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
                30
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
                397
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
                399
            ],
            "syncStage": [
                400
            ],
            "visibility": [
                401
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                402
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
                404
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
                406
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
                407
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
                408
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
                412
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
                66
            ],
            "key": [
                67
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
                413
            ],
            "views": [
                414
            ],
            "collectionHashes": [
                411
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "recordSharing": [
                171,
                {
                    "target": [
                        417,
                        "RecordSharingTargetInput!"
                    ]
                }
            ],
            "navigationMenuItems": [
                164
            ],
            "navigationMenuItem": [
                164,
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
                152
            ],
            "applicationSdkClientChecksums": [
                96,
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
                160
            ],
            "usageQuotasWithConsumption": [
                157
            ],
            "usageQuotaDefinitions": [
                156
            ],
            "usageQuotaScopeConsumption": [
                159,
                {
                    "input": [
                        418,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                191,
                {
                    "input": [
                        419
                    ]
                }
            ],
            "getViewFilterGroups": [
                57,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                59,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                65,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        66,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                65,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                62,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                55,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                64,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                64,
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
                50
            ],
            "apiKey": [
                2,
                {
                    "input": [
                        420,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "currentUserSessions": [
                181
            ],
            "billingPortalSession": [
                186,
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
                184
            ],
            "getResourceCreditUsage": [
                183
            ],
            "myConnectedAccounts": [
                201
            ],
            "applicationConnectedAccounts": [
                202,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "applicationConnectionProviders": [
                148,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getInviteSuggestions": [
                193
            ],
            "findWorkspaceInvitations": [
                196
            ],
            "getApprovedAccessDomains": [
                192
            ],
            "getPageLayoutTabs": [
                144,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                144,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                145,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        146
                    ]
                }
            ],
            "getPageLayout": [
                145,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                100,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                100,
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
                        421,
                        "AgentIdInput!"
                    ]
                }
            ],
            "objects": [
                274,
                {
                    "paging": [
                        29,
                        "CursorPaging!"
                    ],
                    "filter": [
                        422,
                        "ObjectFilter!"
                    ]
                }
            ],
            "object": [
                25,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                277
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
                23,
                {
                    "input": [
                        423,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                23
            ],
            "getAvailablePackages": [
                9,
                {
                    "input": [
                        423,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        423,
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
                71
            ],
            "getPublicWorkspaceDataByDomain": [
                215,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                216,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                235,
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
                208,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                206,
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
                233,
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
                51
            ],
            "findOneApplication": [
                51,
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
                172,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                172,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                251,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                255,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                251,
                {
                    "isVetted": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                255,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "fields": [
                266,
                {
                    "paging": [
                        29,
                        "CursorPaging!"
                    ],
                    "filter": [
                        32,
                        "FieldFilter!"
                    ]
                }
            ],
            "field": [
                262,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getViewGroups": [
                61,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getRoles": [
                50
            ],
            "previewMessageCampaignAudience": [
                340,
                {
                    "input": [
                        424,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "messageSuppressions": [
                348,
                {
                    "input": [
                        425,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                349
            ],
            "myMessageChannels": [
                329,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "appMessageChannels": [
                329,
                {
                    "filter": [
                        426
                    ]
                }
            ],
            "getEmailingDomains": [
                325
            ],
            "getToolIndex": [
                359
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
                358
            ],
            "webhook": [
                358,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "myMessageFolders": [
                403,
                {
                    "messageChannelId": [
                        3
                    ]
                }
            ],
            "myCalendarChannels": [
                398,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "getPermissionFlags": [
                410
            ],
            "minimalMetadata": [
                415
            ],
            "appKeyValue": [
                396,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        397
                    ]
                }
            ],
            "getJobs": [
                172,
                {
                    "jobIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "appConnections": [
                237,
                {
                    "filter": [
                        427
                    ]
                }
            ],
            "appConnection": [
                237,
                {
                    "id": [
                        168,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                393
            ],
            "aiChatUsage": [
                378
            ],
            "chatThreads": [
                381
            ],
            "chatThread": [
                381,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                380,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                385,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatThreadsForRecord": [
                381,
                {
                    "objectNameSingular": [
                        1,
                        "String!"
                    ],
                    "recordId": [
                        3,
                        "UUID!"
                    ],
                    "limit": [
                        30,
                        "Int!"
                    ],
                    "offset": [
                        30,
                        "Int!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                383
            ],
            "skills": [
                379
            ],
            "skill": [
                379,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                392,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "timelineActivityTypes": [
                409
            ],
            "metadataTranslations": [
                405,
                {
                    "input": [
                        428,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "recordPermissions": [
                390,
                {
                    "targets": [
                        429,
                        "[RecordPermissionsTargetInput!]!"
                    ]
                }
            ],
            "checkUserExists": [
                304,
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
                305,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                71,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                299,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                300
            ],
            "validatePasswordResetToken": [
                297,
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
                242
            ],
            "eventLogs": [
                376,
                {
                    "input": [
                        430,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                370,
                {
                    "input": [
                        434,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                368,
                {
                    "input": [
                        435,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                365,
                {
                    "input": [
                        436,
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
                356,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                351,
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
                353,
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
                323
            ],
            "exportApplication": [
                313,
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
                308
            ],
            "__typename": [
                1
            ]
        },
        "RecordSharingTargetInput": {
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
                154
            ],
            "operationType": [
                155
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
                155
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
                422
            ],
            "or": [
                422
            ],
            "id": [
                33
            ],
            "universalIdentifier": [
                33
            ],
            "isActive": [
                34
            ],
            "isRemote": [
                34
            ],
            "isSearchable": [
                34
            ],
            "isSystem": [
                34
            ],
            "isUICreatable": [
                34
            ],
            "isUIEditable": [
                34
            ],
            "isUIReadOnly": [
                34
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                168
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
                346
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                3
            ],
            "limit": [
                30
            ],
            "offset": [
                30
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
        "RecordPermissionsTargetInput": {
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
        "EventLogQueryInput": {
            "table": [
                431
            ],
            "filters": [
                432
            ],
            "first": [
                30
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
                433
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
                        438,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                8,
                {
                    "input": [
                        439,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "setRecordShare": [
                171,
                {
                    "target": [
                        417,
                        "RecordSharingTargetInput!"
                    ],
                    "principal": [
                        440,
                        "RecordSharePrincipalInput!"
                    ],
                    "enabled": [
                        8,
                        "Boolean!"
                    ],
                    "accessLevel": [
                        169
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                164,
                {
                    "inputs": [
                        441,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                164,
                {
                    "input": [
                        441,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                164,
                {
                    "inputs": [
                        442,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                164,
                {
                    "input": [
                        442,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                164,
                {
                    "ids": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                164,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                162,
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
                        318,
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
                161,
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
                151
            ],
            "setEnterpriseKey": [
                151,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                161,
                {
                    "file": [
                        444,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                161,
                {
                    "file": [
                        444,
                        "Upload!"
                    ]
                }
            ],
            "completeWorkspaceLogoUpload": [
                161,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                161,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                161,
                {
                    "file": [
                        444,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createUsageLimit": [
                160,
                {
                    "input": [
                        445,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                160,
                {
                    "input": [
                        446,
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
                57,
                {
                    "input": [
                        447,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        448,
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
                59,
                {
                    "input": [
                        449,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                59,
                {
                    "input": [
                        450,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                59,
                {
                    "input": [
                        452,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                59,
                {
                    "input": [
                        453,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "createView": [
                65,
                {
                    "input": [
                        454,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                65,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        455,
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
                65,
                {
                    "input": [
                        456,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                62,
                {
                    "input": [
                        462,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                62,
                {
                    "input": [
                        463,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                8,
                {
                    "input": [
                        465,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                8,
                {
                    "input": [
                        466,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "updateViewField": [
                55,
                {
                    "input": [
                        467,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                55,
                {
                    "input": [
                        469,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                55,
                {
                    "inputs": [
                        469,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                55,
                {
                    "input": [
                        470,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                55,
                {
                    "input": [
                        471,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                64,
                {
                    "input": [
                        472,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                64,
                {
                    "input": [
                        474,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                64,
                {
                    "inputs": [
                        474,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                64,
                {
                    "input": [
                        475,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                64,
                {
                    "input": [
                        476,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                65,
                {
                    "input": [
                        477,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createApiKey": [
                2,
                {
                    "input": [
                        480,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        481,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        482,
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
                30
            ],
            "checkoutSession": [
                186,
                {
                    "recurringInterval": [
                        86,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        82,
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
                185,
                {
                    "recurringInterval": [
                        86,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        82,
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
                185
            ],
            "switchSubscriptionInterval": [
                187
            ],
            "switchBillingPlan": [
                187
            ],
            "cancelSwitchBillingPlan": [
                187
            ],
            "cancelSwitchBillingInterval": [
                187
            ],
            "setResourceCreditSubscriptionPrice": [
                187,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                182
            ],
            "cancelSwitchResourceCreditPrice": [
                187
            ],
            "deleteConnectedAccount": [
                201,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                201,
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
                195,
                {
                    "isAutoSkipped": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                195,
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
                195,
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
                194
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
                197,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                197,
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
                192,
                {
                    "input": [
                        483,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                8,
                {
                    "input": [
                        484,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                192,
                {
                    "input": [
                        485,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                144,
                {
                    "input": [
                        486,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                144,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        487,
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
                145,
                {
                    "input": [
                        488,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                145,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        489,
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
                145,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        490,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                145,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                100,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                144,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                100,
                {
                    "input": [
                        493,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                100,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        494,
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
                        495,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                10,
                {
                    "input": [
                        496,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                10,
                {
                    "input": [
                        421,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createOneObject": [
                25,
                {
                    "input": [
                        497,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                25,
                {
                    "input": [
                        499,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                25,
                {
                    "input": [
                        500,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateManyObjects": [
                25,
                {
                    "inputs": [
                        500,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "createOneIndex": [
                270,
                {
                    "input": [
                        503,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                270,
                {
                    "input": [
                        506,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                23,
                {
                    "input": [
                        423,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                23,
                {
                    "input": [
                        507,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                149,
                {
                    "input": [
                        508,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                8,
                {
                    "input": [
                        509,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                14,
                {
                    "input": [
                        511,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                14,
                {
                    "input": [
                        512,
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
            "generateFrontComponentApplicationTokenPair": [
                12,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                13,
                {
                    "input": [
                        513,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                13,
                {
                    "input": [
                        514,
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
                71,
                {
                    "data": [
                        516,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                71,
                {
                    "data": [
                        517,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                71,
                {
                    "data": [
                        518,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                71
            ],
            "checkCustomDomainValidRecords": [
                282
            ],
            "enrichWorkspaceCompany": [
                259
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
                234,
                {
                    "input": [
                        519,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                78,
                {
                    "input": [
                        520,
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
                236,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationRegistrationVariable": [
                206,
                {
                    "input": [
                        522,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                206,
                {
                    "input": [
                        523,
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
            "completeAppTarballUpload": [
                78,
                {
                    "fileId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "uploadAppTarball": [
                78,
                {
                    "file": [
                        444,
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
            "grantApplicationCapabilities": [
                258,
                {
                    "input": [
                        525,
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
                51,
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
                256,
                {
                    "input": [
                        526,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                257,
                {
                    "input": [
                        527,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "updateApplication": [
                51,
                {
                    "id": [
                        3,
                        "UUID!"
                    ],
                    "input": [
                        528,
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
                249,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneField": [
                262,
                {
                    "input": [
                        529,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                262,
                {
                    "input": [
                        531,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                262,
                {
                    "input": [
                        533,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                61,
                {
                    "input": [
                        534,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                61,
                {
                    "inputs": [
                        534,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                61,
                {
                    "input": [
                        535,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                61,
                {
                    "inputs": [
                        535,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                61,
                {
                    "input": [
                        537,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                61,
                {
                    "input": [
                        538,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                37,
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
                50,
                {
                    "createRoleInput": [
                        539,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                50,
                {
                    "updateRoleInput": [
                        540,
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
                47,
                {
                    "upsertObjectPermissionsInput": [
                        542,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                48,
                {
                    "upsertPermissionFlagsInput": [
                        544,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                42,
                {
                    "upsertFieldPermissionsInput": [
                        545,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                283,
                {
                    "input": [
                        547,
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
                342,
                {
                    "input": [
                        550,
                        "SendEmailViaDomainInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                343,
                {
                    "input": [
                        551,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "cancelMessageCampaign": [
                341,
                {
                    "input": [
                        552,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                342,
                {
                    "input": [
                        553,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "duplicateMessageList": [
                344,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createMessageSuppression": [
                345,
                {
                    "input": [
                        554,
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
                349,
                {
                    "input": [
                        555,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                349,
                {
                    "input": [
                        556,
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
                329,
                {
                    "input": [
                        557,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                339,
                {
                    "input": [
                        559,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                329,
                {
                    "input": [
                        560,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                329,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                329,
                {
                    "input": [
                        561,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                329,
                {
                    "input": [
                        562,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                329,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                338,
                {
                    "input": [
                        563,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                325,
                {
                    "input": [
                        567,
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
                325,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                361,
                {
                    "input": [
                        568,
                        "RunAgentInput!"
                    ]
                }
            ],
            "createWebhook": [
                358,
                {
                    "input": [
                        572,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                358,
                {
                    "input": [
                        573,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                358,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateMessageFolder": [
                403,
                {
                    "input": [
                        575,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                403,
                {
                    "input": [
                        577,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                398,
                {
                    "input": [
                        578,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                396,
                {
                    "input": [
                        580,
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
                        397
                    ]
                }
            ],
            "enqueueJob": [
                394,
                {
                    "input": [
                        581,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                395,
                {
                    "input": [
                        582,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                8,
                {
                    "input": [
                        584,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "attachChatThreadToRecord": [
                8,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "objectNameSingular": [
                        1,
                        "String!"
                    ],
                    "recordId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "detachChatThreadFromRecord": [
                8,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ],
                    "objectNameSingular": [
                        1,
                        "String!"
                    ],
                    "recordId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createChatThread": [
                381
            ],
            "sendChatMessage": [
                386,
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
                        585,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "retryChatMessage": [
                386,
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
                386,
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
                        586,
                        "[AgentChatQuestionAnswerInput!]!"
                    ],
                    "modelId": [
                        1
                    ],
                    "fileAttachments": [
                        585,
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
                381,
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
                381,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "unarchiveChatThread": [
                381,
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
                388,
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
                379,
                {
                    "input": [
                        587,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                379,
                {
                    "input": [
                        588,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                379,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                379,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                379,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                391,
                {
                    "turnId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                392,
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
                409,
                {
                    "input": [
                        589,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                409,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                292,
                {
                    "input": [
                        590,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                303,
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
                    ]
                }
            ],
            "verifyEmailAndGetLoginToken": [
                298,
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
                290,
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
                302,
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
                    ]
                }
            ],
            "signUpInWorkspace": [
                295,
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
                295,
                {
                    "input": [
                        591
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                161,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        444,
                        "Upload!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                162,
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
                        15,
                        "Float!"
                    ]
                }
            ],
            "completeNewWorkspaceLogoUpload": [
                161,
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
                296
            ],
            "getAuthTokensFromLoginToken": [
                302,
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
                302,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "authorizeApp": [
                288,
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
                302,
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
                301,
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
                291,
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
                293,
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
                286,
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
                286
            ],
            "deleteTwoFactorAuthenticationMethod": [
                285,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                287,
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
                53,
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
                        592,
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
                238,
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
                243,
                {
                    "input": [
                        593,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                243,
                {
                    "input": [
                        594,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                239,
                {
                    "input": [
                        595,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                240,
                {
                    "input": [
                        596,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                373,
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
                373,
                {
                    "type": [
                        597,
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
                371,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                306,
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
                307
            ],
            "createCalendarEvent": [
                363,
                {
                    "input": [
                        598,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                372,
                {
                    "input": [
                        599,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                362,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                357,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        601,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                203,
                {
                    "input": [
                        603,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                323,
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
                282,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                321,
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
                322,
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
                314,
                {
                    "file": [
                        444,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        318,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                320,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        604,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                316,
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
        "RecordSharePrincipalInput": {
            "workspaceMemberId": [
                3
            ],
            "roleId": [
                3
            ],
            "everyone": [
                8
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
                165
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
                443
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
                154
            ],
            "operationType": [
                155
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
                30
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "limitValue": [
                158
            ],
            "burstValue": [
                158
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
                445
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
                58
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
                58
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
                60
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
                451
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
                60
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
                66
            ],
            "key": [
                67
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
                30
            ],
            "groupLoadLimit": [
                30
            ],
            "openRecordIn": [
                68
            ],
            "kanbanAggregateOperation": [
                56
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                69
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
                70
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
                66
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
                68
            ],
            "kanbanAggregateOperation": [
                56
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                69
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "calendarEndFieldMetadataId": [
                3
            ],
            "visibility": [
                70
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "kanbanColumnWidth": [
                30
            ],
            "groupLoadLimit": [
                30
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
                457
            ],
            "viewFields": [
                458
            ],
            "viewFilters": [
                459
            ],
            "viewFilterGroups": [
                460
            ],
            "viewSorts": [
                461
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "type": [
                66
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "openRecordIn": [
                68
            ],
            "kanbanAggregateOperation": [
                56
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "kanbanColumnWidth": [
                30
            ],
            "calendarLayout": [
                69
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
                56
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
                60
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
                58
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
                63
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
                63
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
                464
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                63
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
                468
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
                56
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
                56
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
                473
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
                478
            ],
            "fields": [
                479
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
                479
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
                104
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
                104
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
                146
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
                146
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
                146
            ],
            "objectMetadataId": [
                3
            ],
            "isFirstTabPinned": [
                8
            ],
            "tabs": [
                491
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
                104
            ],
            "widgets": [
                492
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
                101
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
                101
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
                101
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
                498
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
                501
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
                26
            ],
            "readability": [
                27
            ],
            "translations": [
                502
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
                504
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
                505
            ],
            "indexType": [
                271
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
                510
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
            "coreWorkflowVersionId": [
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
                515
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
                72
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
                74
            ],
            "aiAgentModelTier": [
                74
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
                521
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
                524
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
        "CreateOneFieldMetadataInput": {
            "field": [
                530
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                263
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
                532
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
                502
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
                536
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
                541
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
                543
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
                546
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
                548
            ],
            "predicateGroups": [
                549
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
                46
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
                44
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
                350
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
                350
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
                558
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                330
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                332
            ],
            "messageFolderImportPolicy": [
                333
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
                330
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
                330
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
                564
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
                565
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageParticipantInput": {
            "role": [
                566
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
                569
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageInput": {
            "role": [
                570
            ],
            "content": [
                1
            ],
            "attachments": [
                571
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
                574
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
                576
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
                576
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
                579
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                401
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                402
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
                397
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
                30
            ],
            "delayMs": [
                30
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
                583
            ],
            "retryLimit": [
                30
            ],
            "delayMs": [
                30
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
                168
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
                30
            ],
            "selectedOptionIndices": [
                30
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
                502
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
                212
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
                600
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
                602
            ],
            "SMTP": [
                602
            ],
            "CALDAV": [
                602
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
                199
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
                318
            ],
            "filePath": [
                1
            ],
            "size": [
                30
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "onEventSubscription": [
                180,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                284,
                {
                    "input": [
                        606,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                387,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                374,
                {
                    "table": [
                        431,
                        "EventLogTable!"
                    ]
                }
            ],
            "exportRecords": [
                377,
                {
                    "input": [
                        607,
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