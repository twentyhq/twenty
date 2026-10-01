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
        75,
        77,
        78,
        83,
        84,
        85,
        87,
        95,
        102,
        105,
        107,
        111,
        112,
        115,
        116,
        118,
        121,
        122,
        134,
        149,
        153,
        157,
        158,
        161,
        168,
        171,
        172,
        176,
        179,
        181,
        202,
        207,
        214,
        215,
        222,
        227,
        230,
        253,
        263,
        264,
        266,
        271,
        274,
        283,
        314,
        321,
        329,
        330,
        331,
        333,
        334,
        335,
        336,
        337,
        338,
        339,
        349,
        350,
        353,
        386,
        400,
        402,
        403,
        404,
        405,
        407,
        409,
        416,
        435,
        439,
        450,
        570,
        574,
        603
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
                82
            ],
            "on_BillingLicensedProduct": [
                91
            ],
            "on_BillingMeteredProduct": [
                92
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
                51
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
                26
            ],
            "readability": [
                27
            ],
            "readabilityParentFieldUniversalIdentifiers": [
                3
            ],
            "sharingReach": [
                28
            ],
            "writability": [
                29
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
                278,
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
                279,
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
            "fieldsList": [
                265
            ],
            "indexMetadataList": [
                273
            ],
            "searchFieldMetadataList": [
                281
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
                3
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
            "uiScale": [
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
            "userId": [
                3
            ],
            "userWorkspaceId": [
                3
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
                45
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
                38
            ],
            "agents": [
                10
            ],
            "apiKeys": [
                50
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
                51
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
                76
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
                57
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
                59
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
                61
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
                64
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
                56
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
                67
            ],
            "key": [
                68
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
                69
            ],
            "kanbanAggregateOperation": [
                57
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
                31
            ],
            "groupLoadLimit": [
                31
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
                70
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
                73
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
                51
            ],
            "aiChatModelTier": [
                75
            ],
            "aiAgentModelTier": [
                75
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
                52
            ],
            "featureFlags": [
                206
            ],
            "billingSubscriptions": [
                94
            ],
            "installedApplications": [
                52
            ],
            "currentBillingSubscription": [
                94
            ],
            "billingCustomer": [
                96
            ],
            "billingEntitlements": [
                282
            ],
            "hasValidSignedEnterpriseKey": [
                8
            ],
            "hasValidEnterpriseValidityToken": [
                8
            ],
            "workspaceUrls": [
                208
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
                38
            ],
            "userWorkspaces": [
                54
            ],
            "onboardingStatus": [
                77
            ],
            "previousOnboardingStatus": [
                77
            ],
            "currentWorkspace": [
                72
            ],
            "currentUserWorkspace": [
                54
            ],
            "userVars": [
                78
            ],
            "workspaceMembers": [
                38
            ],
            "deletedWorkspaceMembers": [
                250
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
                54
            ],
            "availableWorkspaces": [
                249
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
                80
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                83
            ],
            "priceUsageBased": [
                84
            ],
            "productKey": [
                85
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
                87
            ],
            "unitAmount": [
                15
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                84
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
                88
            ],
            "recurringInterval": [
                87
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                84
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
                82
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
                82
            ],
            "prices": [
                86
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
                82
            ],
            "prices": [
                89
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
                95
            ],
            "interval": [
                87
            ],
            "billingSubscriptionItems": [
                93
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                9
            ],
            "phases": [
                81
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
                102
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                100
            ],
            "position": [
                103
            ],
            "configuration": [
                109
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
                104
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                106
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                108
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                105
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
                105
            ],
            "index": [
                31
            ],
            "heightBehavior": [
                107
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetVerticalListHeightBehavior": {},
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                105
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                110
            ],
            "on_StandaloneRichTextConfiguration": [
                113
            ],
            "on_PieChartConfiguration": [
                114
            ],
            "on_LineChartConfiguration": [
                117
            ],
            "on_IframeConfiguration": [
                119
            ],
            "on_BarChartConfiguration": [
                120
            ],
            "on_CalendarConfiguration": [
                123
            ],
            "on_FrontComponentConfiguration": [
                124
            ],
            "on_EmailsConfiguration": [
                125
            ],
            "on_EmailThreadConfiguration": [
                126
            ],
            "on_CallRecordingSummaryConfiguration": [
                127
            ],
            "on_CallRecordingTranscriptConfiguration": [
                128
            ],
            "on_ChatThreadsConfiguration": [
                129
            ],
            "on_ChatConfiguration": [
                130
            ],
            "on_MessageCampaignBodyConfiguration": [
                131
            ],
            "on_MessageCampaignDetailsConfiguration": [
                132
            ],
            "on_FieldConfiguration": [
                133
            ],
            "on_FieldRichTextConfiguration": [
                135
            ],
            "on_FieldsConfiguration": [
                136
            ],
            "on_FormFieldConfiguration": [
                137
            ],
            "on_FilesConfiguration": [
                138
            ],
            "on_NotesConfiguration": [
                139
            ],
            "on_TasksConfiguration": [
                140
            ],
            "on_TimelineConfiguration": [
                141
            ],
            "on_ViewConfiguration": [
                142
            ],
            "on_RecordTableConfiguration": [
                143
            ],
            "on_WorkflowConfiguration": [
                144
            ],
            "on_WorkflowRunConfiguration": [
                145
            ],
            "on_WorkflowVersionConfiguration": [
                146
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                111
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                57
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                8
            ],
            "numberFormat": [
                112
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
                31
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                98
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "ChartNumberFormat": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                111
            ],
            "body": [
                99
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                111
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                57
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                115
            ],
            "orderBy": [
                116
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
                112
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
                111
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                57
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                115
            ],
            "primaryAxisOrderBy": [
                116
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
                115
            ],
            "secondaryAxisOrderBy": [
                116
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
                118
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                112
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
                31
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                111
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
                111
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                57
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                115
            ],
            "primaryAxisOrderBy": [
                116
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
                115
            ],
            "secondaryAxisOrderBy": [
                116
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
                118
            ],
            "displayDataLabel": [
                8
            ],
            "displayLegend": [
                8
            ],
            "numberFormat": [
                112
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
                121
            ],
            "layout": [
                122
            ],
            "isCumulative": [
                8
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
                111
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                111
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
                111
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "ChatThreadsConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "ChatConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                111
            ],
            "fieldMetadataId": [
                1
            ],
            "fieldDisplayMode": [
                134
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
                111
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                111
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
                111
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
                111
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                111
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                31
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
                111
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                111
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                111
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
                101
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                105
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
                149
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                147
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
                150
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
                153
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
                157
            ],
            "limitKind": [
                1
            ],
            "allowedOperationTypes": [
                158
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
                156
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
                157
            ],
            "operationType": [
                158
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
                161
            ],
            "isEnforced": [
                8
            ],
            "consumedValue": [
                161
            ],
            "remainingValue": [
                161
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
                161
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
                157
            ],
            "operationType": [
                158
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
                31
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "limitValue": [
                161
            ],
            "burstValue": [
                161
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
                168
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
                166
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
                171
            ],
            "principalType": [
                1
            ],
            "principalId": [
                3
            ],
            "accessLevel": [
                172
            ],
            "rowCause": [
                1
            ],
            "canRoleRead": [
                8
            ],
            "canRoleUpdate": [
                8
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
                172
            ],
            "permissions": [
                169
            ],
            "isEnabled": [
                8
            ],
            "hasInheritedAccess": [
                8
            ],
            "isOpenByDefault": [
                8
            ],
            "generalAccessLevel": [
                172
            ],
            "isGeneralAccessDefault": [
                8
            ],
            "sharingReach": [
                28
            ],
            "roles": [
                173
            ],
            "shares": [
                170
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
                176
            ],
            "attemptsMade": [
                31
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
                179
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                177
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
                181
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
                177
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
                180
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
                182
            ],
            "metadataEvents": [
                178
            ],
            "queueJobEvents": [
                175
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
                95
            ],
            "hasPaymentMethod": [
                8
            ],
            "billingPortalUrl": [
                1
            ],
            "currentBillingSubscription": [
                94
            ],
            "billingSubscriptions": [
                94
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                85
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
                83
            ],
            "baseProducts": [
                91
            ],
            "resourceCreditProducts": [
                91
            ],
            "meteredProducts": [
                92
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
                94
            ],
            "billingSubscriptions": [
                94
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
                192
            ],
            "__typename": [
                1
            ]
        },
        "UsageAnalytics": {
            "usageByUser": [
                191
            ],
            "usageByOperationType": [
                191
            ],
            "usageByApplication": [
                191
            ],
            "usageByModel": [
                191
            ],
            "timeSeries": [
                192
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "userDailyUsage": [
                193
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
                77
            ],
            "previousOnboardingStatus": [
                77
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
                199
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
                202
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                201
            ],
            "SMTP": [
                201
            ],
            "CALDAV": [
                201
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
                203
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
                203
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
                207
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
            "suspendedInstalls": [
                31
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                210
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
                214
            ],
            "status": [
                215
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
                213
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
                216
            ],
            "authBypassProviders": [
                217
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                208
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
                222
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
                220
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
                75
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
                212
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                227
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
                230
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
                207
            ],
            "metadata": [
                232
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
                216
            ],
            "billing": [
                225
            ],
            "aiModels": [
                221
            ],
            "aiEvaluationModels": [
                223
            ],
            "aiModelTiers": [
                224
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
                226
            ],
            "isAttachmentPreviewEnabled": [
                8
            ],
            "sentry": [
                228
            ],
            "captcha": [
                229
            ],
            "api": [
                231
            ],
            "canManageFeatureFlags": [
                8
            ],
            "publicFeatureFlags": [
                233
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
                234
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
                79
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
                171
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
                214
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                215
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
                214
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
                215
            ],
            "workspace": [
                244
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
                214
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                215
            ],
            "__typename": [
                1
            ]
        },
        "SSOConnection": {
            "type": [
                214
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
                215
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
                208
            ],
            "logo": [
                1
            ],
            "sso": [
                247
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                248
            ],
            "availableWorkspacesForSignUp": [
                248
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
                37
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
                253
            ],
            "title": [
                1
            ],
            "description": [
                1
            ],
            "action": [
                251
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
                255
            ],
            "fieldPermissions": [
                256
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
                31
            ],
            "defaultRoleUniversalIdentifier": [
                1
            ],
            "roles": [
                257
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
                263
            ],
            "enrichment": [
                9
            ],
            "personOutcome": [
                264
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
                266
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
                29
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
                270
            ],
            "morphRelations": [
                270
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
                32
            ],
            "endCursor": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                265
            ],
            "cursor": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                267
            ],
            "edges": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                271
            ],
            "sourceObjectMetadata": [
                25
            ],
            "targetObjectMetadata": [
                25
            ],
            "sourceFieldMetadata": [
                265
            ],
            "targetFieldMetadata": [
                265
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
                274
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                272
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IndexEdge": {
            "node": [
                273
            ],
            "cursor": [
                32
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
                32
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                267
            ],
            "edges": [
                276
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                267
            ],
            "edges": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                267
            ],
            "edges": [
                275
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
                283
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
                284
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
                292
            ],
            "availableWorkspaces": [
                249
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
                208
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
                297
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
                208
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
                292
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
                297
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
                314
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
                312
            ],
            "manifest": [
                9
            ],
            "coverage": [
                313
            ],
            "files": [
                315
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
                317
            ],
            "errors": [
                318
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
                321
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
                321
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
                320
            ],
            "errors": [
                322
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
                329
            ],
            "tenantStatus": [
                330
            ],
            "unsubscribeHostnameStatus": [
                331
            ],
            "verificationRecords": [
                327
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
                333
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "type": [
                334
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                335
            ],
            "messageFolderImportPolicy": [
                336
            ],
            "excludeNonProfessionalEmails": [
                8
            ],
            "excludeGroupEmails": [
                8
            ],
            "pendingGroupEmailsAction": [
                337
            ],
            "isSyncEnabled": [
                8
            ],
            "syncedAt": [
                4
            ],
            "syncStatus": [
                338
            ],
            "syncStage": [
                339
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
                204
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
                340
            ],
            "__typename": [
                1
            ]
        },
        "CreateEmailGroupChannelOutput": {
            "messageChannel": [
                332
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
            "hardSuppressed": [
                31
            ],
            "globallyUnsubscribed": [
                31
            ],
            "topicUnsubscribed": [
                31
            ],
            "trackingRefused": [
                31
            ],
            "sendable": [
                31
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
        "SendMessageCampaignOutputDTO": {
            "campaignId": [
                1
            ],
            "queuedCount": [
                31
            ],
            "audience": [
                343
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
                349
            ],
            "source": [
                350
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
                348
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
                353
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
                355
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
                202
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
                357
            ],
            "SMTP": [
                357
            ],
            "CALDAV": [
                357
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
                358
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
        "AgentMessagePart": {
            "id": [
                3
            ],
            "messageId": [
                3
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
                361
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
                368
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
                122
            ],
            "groupMode": [
                121
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
                370
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                371
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
                373
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
        "AiChatUsage": {
            "limitValue": [
                161
            ],
            "consumedValue": [
                161
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
                171
            ],
            "title": [
                1
            ],
            "totalCacheReadTokens": [
                31
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
                379
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
                9
            ],
            "maxSeq": [
                31
            ],
            "error": [
                381
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
                386
            ],
            "thread": [
                378
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
                389
            ],
            "totalCount": [
                31
            ],
            "pageInfo": [
                390
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
                31
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
        "RecordPermissionsResult": {
            "objectMetadataId": [
                3
            ],
            "recordId": [
                3
            ],
            "permissions": [
                169
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
                31
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
                394
            ],
            "messages": [
                362
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
                31
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
                400
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
                402
            ],
            "syncStage": [
                403
            ],
            "visibility": [
                404
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                405
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
                407
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
                409
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
                410
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
                411
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
                416
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
                67
            ],
            "key": [
                68
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
                417
            ],
            "views": [
                418
            ],
            "collectionHashes": [
                415
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "recordSharing": [
                174,
                {
                    "target": [
                        421,
                        "RecordSharingTargetInput!"
                    ]
                }
            ],
            "navigationMenuItems": [
                167
            ],
            "navigationMenuItem": [
                167,
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
                155
            ],
            "applicationSdkClientChecksums": [
                97,
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
                163
            ],
            "usageQuotasWithConsumption": [
                160
            ],
            "usageQuotaDefinitions": [
                159
            ],
            "usageQuotaScopeConsumption": [
                162,
                {
                    "input": [
                        422,
                        "UsageQuotaScopeInput!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                101,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                101,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                147,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                147,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                148,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        149
                    ]
                }
            ],
            "getPageLayout": [
                148,
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
            "findManyAgents": [
                10
            ],
            "findOneAgent": [
                10,
                {
                    "input": [
                        423,
                        "AgentIdInput!"
                    ]
                }
            ],
            "objects": [
                277,
                {
                    "paging": [
                        30,
                        "CursorPaging!"
                    ],
                    "filter": [
                        424,
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
                280
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
            "currentUserSessions": [
                184
            ],
            "findOneLogicFunction": [
                23,
                {
                    "input": [
                        425,
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
                        425,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        425,
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
            "getInviteSuggestions": [
                196
            ],
            "applicationConnectionProviders": [
                151,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getUsageAnalytics": [
                194,
                {
                    "input": [
                        426
                    ]
                }
            ],
            "billingPortalSession": [
                189,
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
                187
            ],
            "getResourceCreditUsage": [
                186
            ],
            "findWorkspaceInvitations": [
                199
            ],
            "getApprovedAccessDomains": [
                195
            ],
            "getRoles": [
                51
            ],
            "apiKeys": [
                2
            ],
            "getApiKeyRoles": [
                51
            ],
            "apiKey": [
                2,
                {
                    "input": [
                        427,
                        "GetApiKeyInput!"
                    ]
                }
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
            "myConnectedAccounts": [
                204
            ],
            "applicationConnectedAccounts": [
                205,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "currentWorkspace": [
                72
            ],
            "getPublicWorkspaceDataByDomain": [
                218,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "getPublicWorkspaceDataById": [
                219,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                238,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                79,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                79
            ],
            "findOneApplicationRegistration": [
                79,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                211,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                209,
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
                236,
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
                        3
                    ],
                    "universalIdentifier": [
                        3
                    ]
                }
            ],
            "findInstallApplicationJobStatus": [
                175,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findUninstallApplicationJobStatus": [
                175,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                254,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                258,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                254,
                {
                    "isVetted": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                258,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "fields": [
                269,
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
            "field": [
                265,
                {
                    "id": [
                        3,
                        "UUID!"
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
            "previewMessageCampaignAudience": [
                343,
                {
                    "input": [
                        428,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "messageSuppressions": [
                351,
                {
                    "input": [
                        429,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                352
            ],
            "myMessageChannels": [
                332,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "appMessageChannels": [
                332,
                {
                    "filter": [
                        430
                    ]
                }
            ],
            "getEmailingDomains": [
                328
            ],
            "getToolIndex": [
                364
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
                363
            ],
            "webhook": [
                363,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "myMessageFolders": [
                406,
                {
                    "messageChannelId": [
                        3
                    ]
                }
            ],
            "myCalendarChannels": [
                401,
                {
                    "connectedAccountId": [
                        3
                    ]
                }
            ],
            "getPermissionFlags": [
                414
            ],
            "minimalMetadata": [
                419
            ],
            "appKeyValue": [
                399,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        400
                    ]
                }
            ],
            "getJobs": [
                175,
                {
                    "jobIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "appConnections": [
                240,
                {
                    "filter": [
                        431
                    ]
                }
            ],
            "appConnection": [
                240,
                {
                    "id": [
                        171,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                396
            ],
            "aiChatUsage": [
                376
            ],
            "chatThread": [
                378,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                362,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                382,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                380
            ],
            "skills": [
                377
            ],
            "skill": [
                377,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                395,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "validationRules": [
                413,
                {
                    "objectMetadataId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "timelineActivityTypes": [
                412
            ],
            "metadataTranslations": [
                408,
                {
                    "input": [
                        432,
                        "MetadataTranslationsInput!"
                    ]
                }
            ],
            "recordPermissions": [
                393,
                {
                    "targets": [
                        433,
                        "[RecordPermissionsTargetInput!]!"
                    ]
                }
            ],
            "checkUserExists": [
                307,
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
                308,
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
                302,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                303
            ],
            "validatePasswordResetToken": [
                300,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "currentUser": [
                76
            ],
            "getSSOIdentityProviders": [
                245
            ],
            "eventLogs": [
                391,
                {
                    "input": [
                        434,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                374,
                {
                    "input": [
                        440,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                372,
                {
                    "input": [
                        441,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                369,
                {
                    "input": [
                        442,
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
                359,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                354,
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
                356,
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
                326
            ],
            "exportApplication": [
                316,
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
                311
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
                157
            ],
            "operationType": [
                158
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
                424
            ],
            "or": [
                424
            ],
            "id": [
                34
            ],
            "universalIdentifier": [
                34
            ],
            "isActive": [
                35
            ],
            "isRemote": [
                35
            ],
            "isSearchable": [
                35
            ],
            "isSystem": [
                35
            ],
            "isUICreatable": [
                35
            ],
            "isUIEditable": [
                35
            ],
            "isUIReadOnly": [
                35
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                171
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
                158
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
                349
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                3
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
                435
            ],
            "filters": [
                436
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
                437
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "fieldFilters": [
                438
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
                439
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
                        444,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                8,
                {
                    "input": [
                        445,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "setRecordShare": [
                174,
                {
                    "target": [
                        421,
                        "RecordSharingTargetInput!"
                    ],
                    "principal": [
                        446,
                        "RecordSharePrincipalInput!"
                    ],
                    "enabled": [
                        8,
                        "Boolean!"
                    ],
                    "accessLevel": [
                        172
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                167,
                {
                    "inputs": [
                        447,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                167,
                {
                    "input": [
                        447,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                167,
                {
                    "inputs": [
                        448,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                167,
                {
                    "input": [
                        448,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                167,
                {
                    "ids": [
                        3,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                167,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                165,
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
                        321,
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
                164,
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
                154
            ],
            "setEnterpriseKey": [
                154,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                164,
                {
                    "file": [
                        450,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                164,
                {
                    "file": [
                        450,
                        "Upload!"
                    ]
                }
            ],
            "completeWorkspaceLogoUpload": [
                164,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "completeWorkspaceMemberProfilePictureUpload": [
                164,
                {
                    "fileId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                164,
                {
                    "file": [
                        450,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createUsageLimit": [
                163,
                {
                    "input": [
                        451,
                        "CreateUsageLimitInput!"
                    ]
                }
            ],
            "updateUsageLimit": [
                163,
                {
                    "input": [
                        452,
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
                101,
                {
                    "input": [
                        453,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                101,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        454,
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
                147,
                {
                    "input": [
                        455,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                147,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        456,
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
                148,
                {
                    "input": [
                        457,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                148,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        458,
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
                148,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        459,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "resetPageLayoutToDefault": [
                148,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutWidgetToDefault": [
                101,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "resetPageLayoutTabToDefault": [
                147,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createView": [
                66,
                {
                    "input": [
                        462,
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
                        463,
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
                66,
                {
                    "input": [
                        464,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                63,
                {
                    "input": [
                        470,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                63,
                {
                    "input": [
                        471,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                8,
                {
                    "input": [
                        473,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                8,
                {
                    "input": [
                        474,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "createViewFilter": [
                60,
                {
                    "input": [
                        475,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                60,
                {
                    "input": [
                        476,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                60,
                {
                    "input": [
                        478,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                60,
                {
                    "input": [
                        479,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "updateViewField": [
                56,
                {
                    "input": [
                        480,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                56,
                {
                    "input": [
                        482,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                56,
                {
                    "inputs": [
                        482,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                56,
                {
                    "input": [
                        483,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                56,
                {
                    "input": [
                        484,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                65,
                {
                    "input": [
                        485,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                65,
                {
                    "input": [
                        487,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                65,
                {
                    "inputs": [
                        487,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                65,
                {
                    "input": [
                        488,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                65,
                {
                    "input": [
                        489,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                66,
                {
                    "input": [
                        490,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createOneAgent": [
                10,
                {
                    "input": [
                        493,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                10,
                {
                    "input": [
                        494,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                10,
                {
                    "input": [
                        423,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createOneObject": [
                25,
                {
                    "input": [
                        495,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                25,
                {
                    "input": [
                        497,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                25,
                {
                    "input": [
                        498,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateManyObjects": [
                25,
                {
                    "inputs": [
                        498,
                        "[UpdateOneObjectInput!]!"
                    ]
                }
            ],
            "createOneIndex": [
                273,
                {
                    "input": [
                        501,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                273,
                {
                    "input": [
                        504,
                        "DeleteOneIndexInput!"
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
                31
            ],
            "deleteOneLogicFunction": [
                23,
                {
                    "input": [
                        425,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                23,
                {
                    "input": [
                        505,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                152,
                {
                    "input": [
                        506,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                8,
                {
                    "input": [
                        507,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                14,
                {
                    "input": [
                        509,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                14,
                {
                    "input": [
                        510,
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
                        511,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                13,
                {
                    "input": [
                        512,
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
                198,
                {
                    "isAutoSkipped": [
                        8,
                        "Boolean!"
                    ]
                }
            ],
            "completeBookCallOnboardingStep": [
                198,
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
                198,
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
                197
            ],
            "checkoutSession": [
                189,
                {
                    "recurringInterval": [
                        87,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        83,
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
                188,
                {
                    "recurringInterval": [
                        87,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        83,
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
                188
            ],
            "switchSubscriptionInterval": [
                190
            ],
            "switchBillingPlan": [
                190
            ],
            "cancelSwitchBillingPlan": [
                190
            ],
            "cancelSwitchBillingInterval": [
                190
            ],
            "setResourceCreditSubscriptionPrice": [
                190,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                185
            ],
            "cancelSwitchResourceCreditPrice": [
                190
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
                200,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                200,
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
                195,
                {
                    "input": [
                        514,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                8,
                {
                    "input": [
                        515,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                195,
                {
                    "input": [
                        516,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                38,
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
                51,
                {
                    "createRoleInput": [
                        517,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                51,
                {
                    "updateRoleInput": [
                        518,
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
                48,
                {
                    "upsertObjectPermissionsInput": [
                        520,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                49,
                {
                    "upsertPermissionFlagsInput": [
                        522,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                43,
                {
                    "upsertFieldPermissionsInput": [
                        523,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                286,
                {
                    "input": [
                        525,
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
            "createApiKey": [
                2,
                {
                    "input": [
                        528,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        529,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        530,
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
            "createViewFilterGroup": [
                58,
                {
                    "input": [
                        531,
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
                        532,
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
            "deleteConnectedAccount": [
                204,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "disconnectConnectedAccount": [
                204,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateWorkspace": [
                72,
                {
                    "data": [
                        533,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                72,
                {
                    "data": [
                        534,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspaceAllowedIframeOrigins": [
                72,
                {
                    "data": [
                        535,
                        "UpdateWorkspaceAllowedIframeOriginsInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                72
            ],
            "checkCustomDomainValidRecords": [
                285
            ],
            "enrichWorkspaceCompany": [
                262
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
                237,
                {
                    "input": [
                        536,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                79,
                {
                    "input": [
                        537,
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
                239,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                209,
                {
                    "input": [
                        539,
                        "UpdateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "completeAppTarballUpload": [
                79,
                {
                    "fileId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "uploadAppTarball": [
                79,
                {
                    "file": [
                        450,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                79,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                79,
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
                261,
                {
                    "input": [
                        541,
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
            "triggerInstallApplicationJob": [
                259,
                {
                    "input": [
                        542,
                        "TriggerInstallApplicationJobInput!"
                    ]
                }
            ],
            "triggerUninstallApplicationJob": [
                260,
                {
                    "input": [
                        543,
                        "TriggerUninstallApplicationJobInput!"
                    ]
                }
            ],
            "updateApplication": [
                52,
                {
                    "id": [
                        3,
                        "UUID!"
                    ],
                    "input": [
                        544,
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
                252,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneField": [
                265,
                {
                    "input": [
                        545,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                265,
                {
                    "input": [
                        547,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                265,
                {
                    "input": [
                        549,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                62,
                {
                    "input": [
                        550,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                62,
                {
                    "inputs": [
                        550,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                62,
                {
                    "input": [
                        551,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                62,
                {
                    "inputs": [
                        551,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                62,
                {
                    "input": [
                        553,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                62,
                {
                    "input": [
                        554,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                346,
                {
                    "input": [
                        555,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "cancelMessageCampaign": [
                344,
                {
                    "input": [
                        556,
                        "CancelMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                345,
                {
                    "input": [
                        557,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "duplicateMessageList": [
                347,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createMessageSuppression": [
                348,
                {
                    "input": [
                        558,
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
                352,
                {
                    "input": [
                        559,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                352,
                {
                    "input": [
                        560,
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
                332,
                {
                    "input": [
                        561,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                342,
                {
                    "input": [
                        563,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                332,
                {
                    "input": [
                        564,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                332,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createAppMessageChannel": [
                332,
                {
                    "input": [
                        565,
                        "CreateAppMessageChannelInput!"
                    ]
                }
            ],
            "updateAppMessageChannel": [
                332,
                {
                    "input": [
                        566,
                        "UpdateAppMessageChannelInput!"
                    ]
                }
            ],
            "deleteAppMessageChannel": [
                332,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "ingestAppMessages": [
                341,
                {
                    "input": [
                        567,
                        "IngestAppMessagesInput!"
                    ]
                }
            ],
            "createEmailingDomain": [
                328,
                {
                    "input": [
                        571,
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
                328,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "runAgent": [
                365,
                {
                    "input": [
                        572,
                        "RunAgentInput!"
                    ]
                }
            ],
            "createWebhook": [
                363,
                {
                    "input": [
                        576,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                363,
                {
                    "input": [
                        577,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                363,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateMessageFolder": [
                406,
                {
                    "input": [
                        579,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                406,
                {
                    "input": [
                        581,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                401,
                {
                    "input": [
                        582,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                399,
                {
                    "input": [
                        584,
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
                        400
                    ]
                }
            ],
            "enqueueJob": [
                397,
                {
                    "input": [
                        585,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "enqueueJobs": [
                398,
                {
                    "input": [
                        586,
                        "EnqueueJobsInput!"
                    ]
                }
            ],
            "reportAppConnectionAuthFailure": [
                8,
                {
                    "input": [
                        588,
                        "ReportAppConnectionAuthFailureInput!"
                    ]
                }
            ],
            "createChatThread": [
                378
            ],
            "sendChatMessage": [
                383,
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
                        589,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "retryChatMessage": [
                383,
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
            "startWorkspaceSetupChat": [
                385,
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
                377,
                {
                    "input": [
                        590,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                377,
                {
                    "input": [
                        591,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                377,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                377,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                377,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                394,
                {
                    "turnId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                395,
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
            "createValidationRule": [
                413,
                {
                    "input": [
                        592,
                        "CreateValidationRuleInput!"
                    ]
                }
            ],
            "updateValidationRule": [
                413,
                {
                    "input": [
                        593,
                        "UpdateValidationRuleInput!"
                    ]
                }
            ],
            "deleteValidationRule": [
                413,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updateTimelineActivityType": [
                412,
                {
                    "input": [
                        595,
                        "UpdateTimelineActivityTypeInput!"
                    ]
                }
            ],
            "resetTimelineActivityType": [
                412,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                295,
                {
                    "input": [
                        596,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
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
                293,
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
                    ],
                    "origin": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailAndGetWorkspaceAgnosticToken": [
                293,
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
                305,
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
                293,
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
                298,
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
                298,
                {
                    "input": [
                        597
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                164,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        450,
                        "Upload!"
                    ]
                }
            ],
            "createNewWorkspaceLogoUpload": [
                165,
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
                164,
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
                299
            ],
            "getAuthTokensFromLoginToken": [
                305,
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
                305,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "authorizeApp": [
                291,
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
                305,
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
                304,
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
                294,
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
                296,
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
            "initiateOTPProvisioningForAuthenticatedUser": [
                289
            ],
            "deleteTwoFactorAuthenticationMethod": [
                288,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                290,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                76
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
                8,
                {
                    "input": [
                        598,
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
                241,
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
                246,
                {
                    "input": [
                        599,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                246,
                {
                    "input": [
                        600,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                242,
                {
                    "input": [
                        601,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                243,
                {
                    "input": [
                        602,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                388,
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
                388,
                {
                    "type": [
                        603,
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
                375,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                309,
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
                310
            ],
            "createCalendarEvent": [
                367,
                {
                    "input": [
                        604,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                387,
                {
                    "input": [
                        605,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                366,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                360,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        607,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                206,
                {
                    "input": [
                        609,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                326,
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
                285,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                324,
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
                325,
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
                317,
                {
                    "file": [
                        450,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        321,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createApplicationFileUploads": [
                323,
                {
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "files": [
                        610,
                        "[ApplicationFileUploadRequestInput!]!"
                    ]
                }
            ],
            "completeApplicationFileUploads": [
                319,
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
                168
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
                449
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
                157
            ],
            "operationType": [
                158
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
                31
            ],
            "periodUnit": [
                1
            ],
            "meter": [
                1
            ],
            "limitValue": [
                161
            ],
            "burstValue": [
                161
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
                451
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
                102
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
                102
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
                15
            ],
            "pageLayoutId": [
                3
            ],
            "layoutMode": [
                105
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
                105
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
                149
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
                149
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
                149
            ],
            "objectMetadataId": [
                3
            ],
            "isFirstTabPinned": [
                8
            ],
            "tabs": [
                460
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
                105
            ],
            "widgets": [
                461
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
                102
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
                67
            ],
            "key": [
                68
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
                31
            ],
            "groupLoadLimit": [
                31
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                57
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
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
                71
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
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                57
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                70
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "calendarEndFieldMetadataId": [
                3
            ],
            "visibility": [
                71
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "kanbanColumnWidth": [
                31
            ],
            "groupLoadLimit": [
                31
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
                465
            ],
            "viewFields": [
                466
            ],
            "viewFilters": [
                467
            ],
            "viewFilterGroups": [
                468
            ],
            "viewSorts": [
                469
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
                3
            ],
            "shouldHideEmptyGroups": [
                8
            ],
            "openRecordIn": [
                69
            ],
            "kanbanAggregateOperation": [
                57
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "kanbanColumnWidth": [
                31
            ],
            "calendarLayout": [
                70
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
                57
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
                61
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
                59
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
                64
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
                64
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
                472
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
                61
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
                477
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
                61
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
        "UpdateViewFieldInput": {
            "id": [
                3
            ],
            "update": [
                481
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
                57
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
                57
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
                486
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
                491
            ],
            "fields": [
                492
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
                492
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
                496
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
                499
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
            "sharingReach": [
                28
            ],
            "translations": [
                500
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
                502
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
                503
            ],
            "indexType": [
                274
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
                508
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
                513
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
                519
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
                521
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
                524
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
                526
            ],
            "predicateGroups": [
                527
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
                47
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
                45
            ],
            "positionInRowLevelPermissionPredicateGroup": [
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
        "CreateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                59
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
                59
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
                73
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
                75
            ],
            "aiAgentModelTier": [
                75
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
                538
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
                540
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
                546
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                266
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
                548
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
                500
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
                552
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
                353
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
                353
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
                562
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                333
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                335
            ],
            "messageFolderImportPolicy": [
                336
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
                333
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
                333
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
                568
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
                569
            ],
            "__typename": [
                1
            ]
        },
        "AppMessageParticipantInput": {
            "role": [
                570
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
                573
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageInput": {
            "role": [
                574
            ],
            "content": [
                1
            ],
            "attachments": [
                575
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
                578
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
                580
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
                580
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
                583
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                404
            ],
            "isContactAutoCreationEnabled": [
                8
            ],
            "contactAutoCreationPolicy": [
                405
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
                400
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
                31
            ],
            "delayMs": [
                31
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
                587
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
                171
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
                594
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
                500
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
                215
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
                606
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
                608
            ],
            "SMTP": [
                608
            ],
            "CALDAV": [
                608
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
                202
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
                321
            ],
            "filePath": [
                1
            ],
            "size": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "onEventSubscription": [
                183,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                287,
                {
                    "input": [
                        612,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                384,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                389,
                {
                    "table": [
                        435,
                        "EventLogTable!"
                    ],
                    "fieldFilters": [
                        438,
                        "[EventLogFieldFilterInput!]"
                    ]
                }
            ],
            "exportRecords": [
                392,
                {
                    "input": [
                        613,
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