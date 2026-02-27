export default {
    "scalars": [
        1,
        3,
        4,
        7,
        8,
        10,
        11,
        13,
        15,
        18,
        19,
        20,
        21,
        31,
        34,
        36,
        47,
        49,
        51,
        53,
        56,
        59,
        60,
        61,
        62,
        63,
        65,
        68,
        69,
        75,
        78,
        83,
        86,
        87,
        89,
        93,
        94,
        111,
        114,
        116,
        125,
        126,
        127,
        129,
        137,
        153,
        154,
        159,
        181,
        209,
        216,
        230,
        231,
        236,
        239,
        245,
        246,
        248,
        253,
        258,
        259,
        271,
        285,
        286,
        309,
        313,
        322,
        337,
        338,
        424,
        425
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
                124
            ],
            "on_BillingLicensedProduct": [
                133
            ],
            "on_BillingMeteredProduct": [
                134
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
                26
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "DateTime": {},
        "TwoFactorAuthenticationMethodDTO": {
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
                8
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
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
                10
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
                7
            ],
            "roleId": [
                1
            ],
            "value": [
                11
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
                13
            ],
            "canUpdateObjectRecords": [
                13
            ],
            "canSoftDeleteObjectRecords": [
                13
            ],
            "canDestroyObjectRecords": [
                13
            ],
            "restrictedFields": [
                11
            ],
            "rowLevelPermissionPredicates": [
                9
            ],
            "rowLevelPermissionPredicateGroups": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "UserWorkspace": {
            "id": [
                3
            ],
            "user": [
                67
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
                15
            ],
            "objectPermissions": [
                12
            ],
            "objectsPermissions": [
                12
            ],
            "twoFactorAuthenticationMethodSummary": [
                5
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
                16
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
                18
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                19
            ],
            "timeFormat": [
                20
            ],
            "roles": [
                26
            ],
            "userWorkspaceId": [
                3
            ],
            "numberFormat": [
                21
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
                11
            ],
            "roleId": [
                3
            ],
            "isCustom": [
                13
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
                11
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
                13
            ],
            "canUpdateFieldValue": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlag": {
            "id": [
                3
            ],
            "roleId": [
                3
            ],
            "flag": [
                15
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
                13
            ],
            "canBeAssignedToUsers": [
                13
            ],
            "canBeAssignedToAgents": [
                13
            ],
            "canBeAssignedToApiKeys": [
                13
            ],
            "workspaceMembers": [
                17
            ],
            "agents": [
                22
            ],
            "apiKeys": [
                25
            ],
            "canUpdateAllSettings": [
                13
            ],
            "canAccessAllTools": [
                13
            ],
            "canReadAllObjectRecords": [
                13
            ],
            "canUpdateAllObjectRecords": [
                13
            ],
            "canSoftDeleteAllObjectRecords": [
                13
            ],
            "canDestroyAllObjectRecords": [
                13
            ],
            "permissionFlags": [
                24
            ],
            "objectPermissions": [
                12
            ],
            "fieldPermissions": [
                23
            ],
            "rowLevelPermissionPredicates": [
                9
            ],
            "rowLevelPermissionPredicateGroups": [
                6
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
                13
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
                7
            ],
            "sourceHandlerPath": [
                1
            ],
            "handlerName": [
                1
            ],
            "toolInputSchema": [
                11
            ],
            "isTool": [
                13
            ],
            "cronTriggerSettings": [
                11
            ],
            "databaseEventTriggerSettings": [
                11
            ],
            "httpRouteTriggerSettings": [
                11
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
                11
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
                3
            ],
            "type": [
                31
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
                29
            ],
            "isCustom": [
                13
            ],
            "isActive": [
                13
            ],
            "isSystem": [
                13
            ],
            "isUIReadOnly": [
                13
            ],
            "isNullable": [
                13
            ],
            "isUnique": [
                13
            ],
            "defaultValue": [
                11
            ],
            "options": [
                11
            ],
            "settings": [
                11
            ],
            "isLabelSyncedWithName": [
                13
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
                180
            ],
            "morphRelations": [
                180
            ],
            "object": [
                42
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
                7
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
                13
            ],
            "isUnique": [
                13
            ],
            "indexWhereClause": [
                1
            ],
            "indexType": [
                34
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                32
            ],
            "objectMetadata": [
                173,
                {
                    "paging": [
                        35,
                        "CursorPaging!"
                    ],
                    "filter": [
                        37,
                        "ObjectFilter!"
                    ]
                }
            ],
            "indexFieldMetadatas": [
                171,
                {
                    "paging": [
                        35,
                        "CursorPaging!"
                    ],
                    "filter": [
                        40,
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
                36
            ],
            "after": [
                36
            ],
            "first": [
                18
            ],
            "last": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "ObjectFilter": {
            "and": [
                37
            ],
            "or": [
                37
            ],
            "id": [
                38
            ],
            "universalIdentifier": [
                38
            ],
            "isCustom": [
                39
            ],
            "isRemote": [
                39
            ],
            "isActive": [
                39
            ],
            "isSystem": [
                39
            ],
            "isUIReadOnly": [
                39
            ],
            "isSearchable": [
                39
            ],
            "__typename": [
                1
            ]
        },
        "UUIDFilterComparison": {
            "is": [
                13
            ],
            "isNot": [
                13
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
                13
            ],
            "isNot": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "IndexFieldFilter": {
            "and": [
                40
            ],
            "or": [
                40
            ],
            "id": [
                38
            ],
            "fieldMetadataId": [
                38
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
            "translations": [
                11
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
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "standardOverrides": [
                41
            ],
            "shortcut": [
                1
            ],
            "isCustom": [
                13
            ],
            "isRemote": [
                13
            ],
            "isActive": [
                13
            ],
            "isSystem": [
                13
            ],
            "isUIReadOnly": [
                13
            ],
            "isSearchable": [
                13
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
                13
            ],
            "duplicateCriteria": [
                1
            ],
            "fieldsList": [
                30
            ],
            "indexMetadataList": [
                33
            ],
            "fields": [
                178,
                {
                    "paging": [
                        35,
                        "CursorPaging!"
                    ],
                    "filter": [
                        43,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                176,
                {
                    "paging": [
                        35,
                        "CursorPaging!"
                    ],
                    "filter": [
                        44,
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
                43
            ],
            "or": [
                43
            ],
            "id": [
                38
            ],
            "universalIdentifier": [
                38
            ],
            "isCustom": [
                39
            ],
            "isActive": [
                39
            ],
            "isSystem": [
                39
            ],
            "isUIReadOnly": [
                39
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                44
            ],
            "or": [
                44
            ],
            "id": [
                38
            ],
            "isCustom": [
                39
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
                11
            ],
            "canBeUninstalled": [
                13
            ],
            "defaultRoleId": [
                1
            ],
            "settingsCustomTabFrontComponentId": [
                3
            ],
            "defaultLogicFunctionRole": [
                26
            ],
            "agents": [
                22
            ],
            "logicFunctions": [
                28
            ],
            "objects": [
                42
            ],
            "applicationVariables": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "id": [
                3
            ],
            "key": [
                47
            ],
            "value": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
        "CoreViewField": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "isVisible": [
                13
            ],
            "size": [
                7
            ],
            "position": [
                7
            ],
            "aggregateOperation": [
                49
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
            "deletedAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AggregateOperations": {},
        "CoreViewFilterGroup": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                51
            ],
            "positionInViewFilterGroup": [
                7
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
        "CoreViewFilter": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                53
            ],
            "value": [
                11
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                7
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
        "ViewFilterOperand": {},
        "CoreViewGroup": {
            "id": [
                3
            ],
            "isVisible": [
                13
            ],
            "fieldValue": [
                1
            ],
            "position": [
                7
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
        "CoreViewSort": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                56
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
        "CoreViewFieldGroup": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "position": [
                7
            ],
            "isVisible": [
                13
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
            "viewFields": [
                48
            ],
            "__typename": [
                1
            ]
        },
        "CoreView": {
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
                59
            ],
            "key": [
                60
            ],
            "icon": [
                1
            ],
            "position": [
                7
            ],
            "isCompact": [
                13
            ],
            "isCustom": [
                13
            ],
            "openRecordIn": [
                61
            ],
            "kanbanAggregateOperation": [
                49
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                13
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
                62
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
                48
            ],
            "viewFilters": [
                52
            ],
            "viewFilterGroups": [
                50
            ],
            "viewSorts": [
                55
            ],
            "viewGroups": [
                54
            ],
            "viewFieldGroups": [
                57
            ],
            "visibility": [
                63
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
                13
            ],
            "isPublicInviteLinkEnabled": [
                13
            ],
            "trashRetentionDays": [
                7
            ],
            "eventLogRetentionDays": [
                7
            ],
            "workspaceMembersCount": [
                7
            ],
            "activationStatus": [
                65
            ],
            "views": [
                58
            ],
            "viewFields": [
                48
            ],
            "viewFilters": [
                52
            ],
            "viewFilterGroups": [
                50
            ],
            "viewGroups": [
                54
            ],
            "viewSorts": [
                55
            ],
            "metadataVersion": [
                7
            ],
            "databaseUrl": [
                1
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
                13
            ],
            "isGoogleAuthBypassEnabled": [
                13
            ],
            "isTwoFactorAuthenticationEnforced": [
                13
            ],
            "isPasswordAuthEnabled": [
                13
            ],
            "isPasswordAuthBypassEnabled": [
                13
            ],
            "isMicrosoftAuthEnabled": [
                13
            ],
            "isMicrosoftAuthBypassEnabled": [
                13
            ],
            "isCustomDomainEnabled": [
                13
            ],
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                26
            ],
            "version": [
                1
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
            "autoEnableNewAiModels": [
                13
            ],
            "disabledAiModelIds": [
                1
            ],
            "enabledAiModelIds": [
                1
            ],
            "useRecommendedModels": [
                13
            ],
            "routerModel": [
                1
            ],
            "workspaceCustomApplication": [
                45
            ],
            "featureFlags": [
                162
            ],
            "billingSubscriptions": [
                136
            ],
            "currentBillingSubscription": [
                136
            ],
            "billingEntitlements": [
                158
            ],
            "hasValidEnterpriseKey": [
                13
            ],
            "workspaceUrls": [
                151
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
            "defaultAvatarUrl": [
                1
            ],
            "isEmailVerified": [
                13
            ],
            "disabled": [
                13
            ],
            "canImpersonate": [
                13
            ],
            "canAccessFullAdminPanel": [
                13
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
                17
            ],
            "userWorkspaces": [
                14
            ],
            "onboardingStatus": [
                68
            ],
            "currentWorkspace": [
                64
            ],
            "currentUserWorkspace": [
                14
            ],
            "userVars": [
                69
            ],
            "workspaceMembers": [
                17
            ],
            "deletedWorkspaceMembers": [
                157
            ],
            "hasPassword": [
                13
            ],
            "supportUserHash": [
                1
            ],
            "workspaces": [
                14
            ],
            "availableWorkspaces": [
                156
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
        "NewFieldDefaultConfiguration": {
            "isVisible": [
                13
            ],
            "viewFieldGroupId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RichTextV2Body": {
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
                7
            ],
            "column": [
                7
            ],
            "rowSpan": [
                7
            ],
            "columnSpan": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidget": {
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
                75
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                73
            ],
            "position": [
                76
            ],
            "configuration": [
                81
            ],
            "conditionalDisplay": [
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
            "__typename": [
                1
            ]
        },
        "WidgetType": {},
        "PageLayoutWidgetPosition": {
            "on_PageLayoutWidgetGridPosition": [
                77
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                79
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                80
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                78
            ],
            "row": [
                18
            ],
            "column": [
                18
            ],
            "rowSpan": [
                18
            ],
            "columnSpan": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                78
            ],
            "index": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                78
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                82
            ],
            "on_StandaloneRichTextConfiguration": [
                84
            ],
            "on_PieChartConfiguration": [
                85
            ],
            "on_LineChartConfiguration": [
                88
            ],
            "on_IframeConfiguration": [
                90
            ],
            "on_GaugeChartConfiguration": [
                91
            ],
            "on_BarChartConfiguration": [
                92
            ],
            "on_CalendarConfiguration": [
                95
            ],
            "on_FrontComponentConfiguration": [
                96
            ],
            "on_EmailsConfiguration": [
                97
            ],
            "on_FieldConfiguration": [
                98
            ],
            "on_FieldRichTextConfiguration": [
                99
            ],
            "on_FieldsConfiguration": [
                100
            ],
            "on_FilesConfiguration": [
                101
            ],
            "on_NotesConfiguration": [
                102
            ],
            "on_TasksConfiguration": [
                103
            ],
            "on_TimelineConfiguration": [
                104
            ],
            "on_ViewConfiguration": [
                105
            ],
            "on_WorkflowConfiguration": [
                106
            ],
            "on_WorkflowRunConfiguration": [
                107
            ],
            "on_WorkflowVersionConfiguration": [
                108
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                83
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                49
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                13
            ],
            "format": [
                1
            ],
            "description": [
                1
            ],
            "filter": [
                11
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                18
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                70
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                83
            ],
            "body": [
                72
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                83
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                49
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                86
            ],
            "orderBy": [
                87
            ],
            "manualSortOrder": [
                1
            ],
            "displayDataLabel": [
                13
            ],
            "showCenterMetric": [
                13
            ],
            "displayLegend": [
                13
            ],
            "hideEmptyCategory": [
                13
            ],
            "splitMultiValueFields": [
                13
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                11
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                83
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                49
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                86
            ],
            "primaryAxisOrderBy": [
                87
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
                86
            ],
            "secondaryAxisOrderBy": [
                87
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                13
            ],
            "splitMultiValueFields": [
                13
            ],
            "axisNameDisplay": [
                89
            ],
            "displayDataLabel": [
                13
            ],
            "displayLegend": [
                13
            ],
            "rangeMin": [
                7
            ],
            "rangeMax": [
                7
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                11
            ],
            "isStacked": [
                13
            ],
            "isCumulative": [
                13
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                83
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GaugeChartConfiguration": {
            "configurationType": [
                83
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                49
            ],
            "displayDataLabel": [
                13
            ],
            "color": [
                1
            ],
            "description": [
                1
            ],
            "filter": [
                11
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "BarChartConfiguration": {
            "configurationType": [
                83
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                49
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                86
            ],
            "primaryAxisOrderBy": [
                87
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
                86
            ],
            "secondaryAxisOrderBy": [
                87
            ],
            "secondaryAxisManualSortOrder": [
                1
            ],
            "omitNullValues": [
                13
            ],
            "splitMultiValueFields": [
                13
            ],
            "axisNameDisplay": [
                89
            ],
            "displayDataLabel": [
                13
            ],
            "displayLegend": [
                13
            ],
            "rangeMin": [
                7
            ],
            "rangeMax": [
                7
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                11
            ],
            "groupMode": [
                93
            ],
            "layout": [
                94
            ],
            "isCumulative": [
                13
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                83
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
                83
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                83
            ],
            "viewId": [
                1
            ],
            "newFieldDefaultConfiguration": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "FilesConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                83
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
                7
            ],
            "pageLayoutId": [
                3
            ],
            "widgets": [
                74
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                78
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
        "PageLayout": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                111
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                109
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
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
        "ObjectRecordEventProperties": {
            "updatedFields": [
                1
            ],
            "before": [
                11
            ],
            "after": [
                11
            ],
            "diff": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEvent": {
            "type": [
                114
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                112
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventAction": {},
        "ObjectRecordEvent": {
            "action": [
                116
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
                112
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
                115
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventWithQueryIds": {
            "queryIds": [
                1
            ],
            "metadataEvent": [
                113
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
                117
            ],
            "metadataEventsWithQueryIds": [
                118
            ],
            "__typename": [
                1
            ]
        },
        "OnDbEvent": {
            "action": [
                116
            ],
            "objectNameSingular": [
                1
            ],
            "eventDate": [
                4
            ],
            "record": [
                11
            ],
            "updatedFields": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Analytics": {
            "success": [
                13
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
                7
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "start_date": [
                7
            ],
            "end_date": [
                7
            ],
            "items": [
                122
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                125
            ],
            "priceUsageBased": [
                126
            ],
            "productKey": [
                127
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
                129
            ],
            "unitAmount": [
                7
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                126
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionInterval": {},
        "BillingPriceTier": {
            "upTo": [
                7
            ],
            "flatAmount": [
                7
            ],
            "unitAmount": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMetered": {
            "tiers": [
                130
            ],
            "recurringInterval": [
                129
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                126
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
                124
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
                124
            ],
            "prices": [
                128
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
                124
            ],
            "prices": [
                131
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionItemDTO": {
            "id": [
                3
            ],
            "hasReachedCurrentPeriodCap": [
                13
            ],
            "quantity": [
                7
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
                137
            ],
            "interval": [
                129
            ],
            "billingSubscriptionItems": [
                135
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                11
            ],
            "phases": [
                123
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "BillingEndTrialPeriodOutput": {
            "status": [
                137
            ],
            "hasPaymentMethod": [
                13
            ],
            "billingPortalUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingMeteredProductUsageOutput": {
            "productKey": [
                127
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "usedCredits": [
                7
            ],
            "grantedCredits": [
                7
            ],
            "rolloverCredits": [
                7
            ],
            "totalGrantedCredits": [
                7
            ],
            "unitPriceCents": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanOutput": {
            "planKey": [
                125
            ],
            "licensedProducts": [
                133
            ],
            "meteredProducts": [
                134
            ],
            "__typename": [
                1
            ]
        },
        "BillingSessionOutput": {
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "BillingUpdateOutput": {
            "currentBillingSubscription": [
                136
            ],
            "billingSubscriptions": [
                136
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStepSuccess": {
            "success": [
                13
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
                13
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
                7
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
        "File": {
            "id": [
                3
            ],
            "path": [
                1
            ],
            "size": [
                7
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SignedFile": {
            "path": [
                1
            ],
            "token": [
                1
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
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SendInvitationsOutput": {
            "success": [
                13
            ],
            "errors": [
                1
            ],
            "result": [
                148
            ],
            "__typename": [
                1
            ]
        },
        "ResendEmailVerificationTokenOutput": {
            "success": [
                13
            ],
            "__typename": [
                1
            ]
        },
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
        "SSOConnection": {
            "type": [
                153
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
                154
            ],
            "__typename": [
                1
            ]
        },
        "IdentityProviderType": {},
        "SSOIdentityProviderStatus": {},
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
                151
            ],
            "logo": [
                1
            ],
            "sso": [
                152
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                155
            ],
            "availableWorkspacesForSignUp": [
                155
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
                16
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
                159
            ],
            "value": [
                13
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
                160
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagDTO": {
            "key": [
                47
            ],
            "value": [
                13
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
                153
            ],
            "status": [
                154
            ],
            "issuer": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AuthProviders": {
            "sso": [
                163
            ],
            "google": [
                13
            ],
            "magicLink": [
                13
            ],
            "password": [
                13
            ],
            "microsoft": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "AuthBypassProviders": {
            "google": [
                13
            ],
            "password": [
                13
            ],
            "microsoft": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "PublicWorkspaceDataOutput": {
            "id": [
                3
            ],
            "authProviders": [
                164
            ],
            "authBypassProviders": [
                165
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                151
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "node": [
                33
            ],
            "cursor": [
                36
            ],
            "__typename": [
                1
            ]
        },
        "PageInfo": {
            "hasNextPage": [
                13
            ],
            "hasPreviousPage": [
                13
            ],
            "startCursor": [
                36
            ],
            "endCursor": [
                36
            ],
            "__typename": [
                1
            ]
        },
        "IndexConnection": {
            "pageInfo": [
                168
            ],
            "edges": [
                167
            ],
            "__typename": [
                1
            ]
        },
        "IndexFieldEdge": {
            "node": [
                32
            ],
            "cursor": [
                36
            ],
            "__typename": [
                1
            ]
        },
        "IndexIndexFieldMetadatasConnection": {
            "pageInfo": [
                168
            ],
            "edges": [
                170
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                42
            ],
            "cursor": [
                36
            ],
            "__typename": [
                1
            ]
        },
        "IndexObjectMetadataConnection": {
            "pageInfo": [
                168
            ],
            "edges": [
                172
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
                18
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                168
            ],
            "edges": [
                172
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                168
            ],
            "edges": [
                167
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                30
            ],
            "cursor": [
                36
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                168
            ],
            "edges": [
                177
            ],
            "__typename": [
                1
            ]
        },
        "UpsertRowLevelPermissionPredicatesResult": {
            "predicates": [
                9
            ],
            "predicateGroups": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                181
            ],
            "sourceObjectMetadata": [
                42
            ],
            "targetObjectMetadata": [
                42
            ],
            "sourceFieldMetadata": [
                30
            ],
            "targetFieldMetadata": [
                30
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "FieldConnection": {
            "pageInfo": [
                168
            ],
            "edges": [
                177
            ],
            "__typename": [
                1
            ]
        },
        "DeleteSsoOutput": {
            "identityProviderId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EditSsoOutput": {
            "id": [
                3
            ],
            "type": [
                153
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                154
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
        "FindAvailableSSOIDPOutput": {
            "type": [
                153
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
                154
            ],
            "workspace": [
                185
            ],
            "__typename": [
                1
            ]
        },
        "SetupSsoOutput": {
            "id": [
                3
            ],
            "type": [
                153
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                154
            ],
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethodOutput": {
            "success": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "InitiateTwoFactorAuthenticationProvisioningOutput": {
            "uri": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "VerifyTwoFactorAuthenticationMethodOutput": {
            "success": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "AuthorizeAppOutput": {
            "redirectUrl": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "EmailPasswordResetLinkOutput": {
            "success": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "InvalidatePasswordOutput": {
            "success": [
                13
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
        "TransientTokenOutput": {
            "transientToken": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "ValidatePasswordResetTokenOutput": {
            "id": [
                3
            ],
            "email": [
                1
            ],
            "hasPassword": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                194
            ],
            "refreshToken": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokensOutput": {
            "tokens": [
                197
            ],
            "availableWorkspaces": [
                156
            ],
            "__typename": [
                1
            ]
        },
        "GetAuthorizationUrlForSSOOutput": {
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
        "WorkspaceUrlsAndId": {
            "workspaceUrls": [
                151
            ],
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "SignUpOutput": {
            "loginToken": [
                194
            ],
            "workspace": [
                200
            ],
            "__typename": [
                1
            ]
        },
        "VerifyEmailAndGetLoginTokenOutput": {
            "loginToken": [
                194
            ],
            "workspaceUrls": [
                151
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
                197
            ],
            "__typename": [
                1
            ]
        },
        "LoginTokenOutput": {
            "loginToken": [
                194
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExistOutput": {
            "exists": [
                13
            ],
            "availableWorkspacesCount": [
                7
            ],
            "isEmailVerified": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceInviteHashValidOutput": {
            "isValid": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionResult": {
            "data": [
                11
            ],
            "logs": [
                1
            ],
            "duration": [
                7
            ],
            "status": [
                209
            ],
            "error": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionExecutionStatus": {},
        "LogicFunctionLogs": {
            "logs": [
                1
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
            "inputSchema": [
                11
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
                13
            ],
            "isActive": [
                13
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
        "ApplicationTokenPair": {
            "applicationAccessToken": [
                194
            ],
            "applicationRefreshToken": [
                194
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
                13
            ],
            "applicationTokenPair": [
                213
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
                214
            ],
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "isPinned": [
                13
            ],
            "availabilityType": [
                216
            ],
            "availabilityObjectMetadataId": [
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
        "CommandMenuItemAvailabilityType": {},
        "AgentMessagePart": {
            "id": [
                3
            ],
            "messageId": [
                3
            ],
            "orderIndex": [
                18
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
                11
            ],
            "toolOutput": [
                11
            ],
            "state": [
                1
            ],
            "errorMessage": [
                1
            ],
            "errorDetails": [
                11
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
            "fileUrl": [
                1
            ],
            "providerMetadata": [
                11
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
            "role": [
                1
            ],
            "parts": [
                217
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
                3
            ],
            "title": [
                1
            ],
            "totalInputTokens": [
                18
            ],
            "totalOutputTokens": [
                18
            ],
            "contextWindowTokens": [
                18
            ],
            "conversationSize": [
                18
            ],
            "totalInputCredits": [
                7
            ],
            "totalOutputCredits": [
                7
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
        "AISystemPromptSection": {
            "title": [
                1
            ],
            "content": [
                1
            ],
            "estimatedTokenCount": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "AISystemPromptPreview": {
            "sections": [
                220
            ],
            "estimatedTokenCount": [
                18
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
                18
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
                222
            ],
            "messages": [
                218
            ],
            "createdAt": [
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
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "folderId": [
                3
            ],
            "position": [
                7
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
                224
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
        "BillingTrialPeriod": {
            "duration": [
                7
            ],
            "isCreditCardRequired": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "NativeModelCapabilities": {
            "webSearch": [
                13
            ],
            "twitterSearch": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "ClientAIModelConfig": {
            "modelId": [
                1
            ],
            "label": [
                1
            ],
            "modelFamily": [
                230
            ],
            "inferenceProvider": [
                231
            ],
            "inputCostPerMillionTokensInCredits": [
                7
            ],
            "outputCostPerMillionTokensInCredits": [
                7
            ],
            "nativeCapabilities": [
                228
            ],
            "deprecated": [
                13
            ],
            "isRecommended": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "ModelFamily": {},
        "InferenceProvider": {},
        "AdminAIModelConfig": {
            "modelId": [
                1
            ],
            "label": [
                1
            ],
            "modelFamily": [
                230
            ],
            "inferenceProvider": [
                231
            ],
            "isAvailable": [
                13
            ],
            "isAdminEnabled": [
                13
            ],
            "deprecated": [
                13
            ],
            "isRecommended": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "AdminAIModelsOutput": {
            "autoEnableNewModels": [
                13
            ],
            "models": [
                232
            ],
            "__typename": [
                1
            ]
        },
        "Billing": {
            "isBillingEnabled": [
                13
            ],
            "billingUrl": [
                1
            ],
            "trialPeriods": [
                227
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                236
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
                239
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
                7
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
                47
            ],
            "metadata": [
                241
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
                164
            ],
            "billing": [
                234
            ],
            "aiModels": [
                229
            ],
            "signInPrefilled": [
                13
            ],
            "isMultiWorkspaceEnabled": [
                13
            ],
            "isEmailVerificationRequired": [
                13
            ],
            "defaultSubdomain": [
                1
            ],
            "frontDomain": [
                1
            ],
            "analyticsEnabled": [
                13
            ],
            "support": [
                235
            ],
            "isAttachmentPreviewEnabled": [
                13
            ],
            "sentry": [
                237
            ],
            "captcha": [
                238
            ],
            "chromeExtensionId": [
                1
            ],
            "api": [
                240
            ],
            "canManageFeatureFlags": [
                13
            ],
            "publicFeatureFlags": [
                242
            ],
            "isMicrosoftMessagingEnabled": [
                13
            ],
            "isMicrosoftCalendarEnabled": [
                13
            ],
            "isGoogleMessagingEnabled": [
                13
            ],
            "isGoogleCalendarEnabled": [
                13
            ],
            "isConfigVariablesInDbEnabled": [
                13
            ],
            "isImapSmtpCaldavEnabled": [
                13
            ],
            "allowRequestsToTwentyIcons": [
                13
            ],
            "calendarBookingPageId": [
                1
            ],
            "isCloudflareIntegrationEnabled": [
                13
            ],
            "isClickHouseConfigured": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "ConfigVariable": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "value": [
                11
            ],
            "isSensitive": [
                13
            ],
            "source": [
                245
            ],
            "isEnvOnly": [
                13
            ],
            "type": [
                246
            ],
            "options": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "ConfigSource": {},
        "ConfigVariableType": {},
        "ConfigVariablesGroupData": {
            "variables": [
                244
            ],
            "name": [
                248
            ],
            "description": [
                1
            ],
            "isHiddenOnLoad": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "ConfigVariablesGroup": {},
        "ConfigVariablesOutput": {
            "groups": [
                247
            ],
            "__typename": [
                1
            ]
        },
        "JobOperationResult": {
            "jobId": [
                1
            ],
            "success": [
                13
            ],
            "error": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DeleteJobsResponse": {
            "deletedCount": [
                18
            ],
            "results": [
                250
            ],
            "__typename": [
                1
            ]
        },
        "QueueJob": {
            "id": [
                1
            ],
            "name": [
                1
            ],
            "data": [
                11
            ],
            "state": [
                253
            ],
            "timestamp": [
                7
            ],
            "failedReason": [
                1
            ],
            "processedOn": [
                7
            ],
            "finishedOn": [
                7
            ],
            "attemptsMade": [
                7
            ],
            "returnValue": [
                11
            ],
            "logs": [
                1
            ],
            "stackTrace": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "JobState": {},
        "QueueRetentionConfig": {
            "completedMaxAge": [
                7
            ],
            "completedMaxCount": [
                7
            ],
            "failedMaxAge": [
                7
            ],
            "failedMaxCount": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "QueueJobsResponse": {
            "jobs": [
                252
            ],
            "count": [
                7
            ],
            "totalCount": [
                7
            ],
            "hasMore": [
                13
            ],
            "retentionConfig": [
                254
            ],
            "__typename": [
                1
            ]
        },
        "RetryJobsResponse": {
            "retriedCount": [
                18
            ],
            "results": [
                250
            ],
            "__typename": [
                1
            ]
        },
        "SystemHealthService": {
            "id": [
                258
            ],
            "label": [
                1
            ],
            "status": [
                259
            ],
            "__typename": [
                1
            ]
        },
        "HealthIndicatorId": {},
        "AdminPanelHealthServiceStatus": {},
        "SystemHealth": {
            "services": [
                257
            ],
            "__typename": [
                1
            ]
        },
        "UserInfo": {
            "id": [
                3
            ],
            "email": [
                1
            ],
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
        "WorkspaceInfo": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "allowImpersonation": [
                13
            ],
            "logo": [
                1
            ],
            "totalUsers": [
                7
            ],
            "workspaceUrls": [
                151
            ],
            "users": [
                261
            ],
            "featureFlags": [
                46
            ],
            "__typename": [
                1
            ]
        },
        "UserLookup": {
            "user": [
                261
            ],
            "workspaces": [
                262
            ],
            "__typename": [
                1
            ]
        },
        "VersionInfo": {
            "currentVersion": [
                1
            ],
            "latestVersion": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AdminPanelWorkerQueueHealth": {
            "id": [
                1
            ],
            "queueName": [
                1
            ],
            "status": [
                259
            ],
            "__typename": [
                1
            ]
        },
        "AdminPanelHealthServiceData": {
            "id": [
                258
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "status": [
                259
            ],
            "errorMessage": [
                1
            ],
            "details": [
                1
            ],
            "queues": [
                265
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsDataPoint": {
            "x": [
                7
            ],
            "y": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsSeries": {
            "id": [
                1
            ],
            "data": [
                267
            ],
            "__typename": [
                1
            ]
        },
        "WorkerQueueMetrics": {
            "failed": [
                7
            ],
            "completed": [
                7
            ],
            "waiting": [
                7
            ],
            "active": [
                7
            ],
            "delayed": [
                7
            ],
            "failureRate": [
                7
            ],
            "failedData": [
                7
            ],
            "completedData": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsData": {
            "queueName": [
                1
            ],
            "workers": [
                7
            ],
            "timeRange": [
                271
            ],
            "details": [
                269
            ],
            "data": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsTimeRange": {},
        "ImpersonateOutput": {
            "loginToken": [
                194
            ],
            "workspace": [
                200
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigrationDTO": {
            "applicationUniversalIdentifier": [
                1
            ],
            "actions": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppField": {
            "name": [
                1
            ],
            "type": [
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
        "MarketplaceAppObject": {
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
            "fields": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppLogicFunction": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "timeoutSeconds": [
                18
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppFrontComponent": {
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
        "MarketplaceAppRoleObjectPermission": {
            "objectUniversalIdentifier": [
                1
            ],
            "canReadObjectRecords": [
                13
            ],
            "canUpdateObjectRecords": [
                13
            ],
            "canSoftDeleteObjectRecords": [
                13
            ],
            "canDestroyObjectRecords": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppRoleFieldPermission": {
            "objectUniversalIdentifier": [
                1
            ],
            "fieldUniversalIdentifier": [
                1
            ],
            "canReadFieldValue": [
                13
            ],
            "canUpdateFieldValue": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "MarketplaceAppDefaultRole": {
            "id": [
                1
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "canReadAllObjectRecords": [
                13
            ],
            "canUpdateAllObjectRecords": [
                13
            ],
            "canSoftDeleteAllObjectRecords": [
                13
            ],
            "canDestroyAllObjectRecords": [
                13
            ],
            "canUpdateAllSettings": [
                13
            ],
            "canAccessAllTools": [
                13
            ],
            "objectPermissions": [
                278
            ],
            "fieldPermissions": [
                279
            ],
            "permissionFlags": [
                1
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
            "icon": [
                1
            ],
            "version": [
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
            "screenshots": [
                1
            ],
            "aboutDescription": [
                1
            ],
            "providers": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "termsUrl": [
                1
            ],
            "objects": [
                275
            ],
            "fields": [
                274
            ],
            "logicFunctions": [
                276
            ],
            "frontComponents": [
                277
            ],
            "defaultRole": [
                280
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
                13
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
                7
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
                285
            ],
            "status": [
                286
            ],
            "verificationRecords": [
                283
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
                7
            ],
            "lng": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "PlaceDetailsResult": {
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
                288
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionParametersOutput": {
            "host": [
                1
            ],
            "port": [
                7
            ],
            "username": [
                1
            ],
            "password": [
                1
            ],
            "secure": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                290
            ],
            "SMTP": [
                290
            ],
            "CALDAV": [
                290
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
            "accountOwnerId": [
                3
            ],
            "connectionParameters": [
                291
            ],
            "__typename": [
                1
            ]
        },
        "ImapSmtpCaldavConnectionSuccess": {
            "success": [
                13
            ],
            "connectedAccountId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PostgresCredentials": {
            "id": [
                3
            ],
            "user": [
                1
            ],
            "password": [
                1
            ],
            "workspaceId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ChannelSyncSuccess": {
            "success": [
                13
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
        "BarChartDataOutput": {
            "data": [
                11
            ],
            "indexBy": [
                1
            ],
            "keys": [
                1
            ],
            "series": [
                296
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                13
            ],
            "showDataLabels": [
                13
            ],
            "layout": [
                94
            ],
            "groupMode": [
                93
            ],
            "hasTooManyGroups": [
                13
            ],
            "formattedToRawLookup": [
                11
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
                7
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
                298
            ],
            "__typename": [
                1
            ]
        },
        "LineChartDataOutput": {
            "series": [
                299
            ],
            "xAxisLabel": [
                1
            ],
            "yAxisLabel": [
                1
            ],
            "showLegend": [
                13
            ],
            "showDataLabels": [
                13
            ],
            "hasTooManyGroups": [
                13
            ],
            "formattedToRawLookup": [
                11
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
                7
            ],
            "__typename": [
                1
            ]
        },
        "PieChartDataOutput": {
            "data": [
                301
            ],
            "showLegend": [
                13
            ],
            "showDataLabels": [
                13
            ],
            "showCenterMetric": [
                13
            ],
            "hasTooManyGroups": [
                13
            ],
            "formattedToRawLookup": [
                11
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
                7
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
        "EventLogRecord": {
            "event": [
                1
            ],
            "timestamp": [
                4
            ],
            "userWorkspaceId": [
                1
            ],
            "properties": [
                11
            ],
            "recordId": [
                1
            ],
            "objectMetadataId": [
                1
            ],
            "isCustom": [
                13
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
                13
            ],
            "__typename": [
                1
            ]
        },
        "EventLogQueryResult": {
            "records": [
                304
            ],
            "totalCount": [
                18
            ],
            "pageInfo": [
                305
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "getPageLayoutWidgets": [
                74,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                74,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                109,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                109,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                110,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        111
                    ]
                }
            ],
            "getPageLayout": [
                110,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                28,
                {
                    "input": [
                        308,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                28
            ],
            "getAvailablePackages": [
                11,
                {
                    "input": [
                        308,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        308,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "objectRecordCounts": [
                174
            ],
            "object": [
                42,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                175,
                {
                    "paging": [
                        35,
                        "CursorPaging!"
                    ],
                    "filter": [
                        37,
                        "ObjectFilter!"
                    ]
                }
            ],
            "getCoreViewFields": [
                48,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewField": [
                48,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViews": [
                58,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        59,
                        "[ViewType!]"
                    ]
                }
            ],
            "getCoreView": [
                58,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewSorts": [
                55,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewSort": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewGroups": [
                54,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewGroup": [
                54,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFilterGroups": [
                50,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewFilterGroup": [
                50,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFilters": [
                52,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewFilter": [
                52,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFieldGroups": [
                57,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFieldGroup": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "index": [
                33,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "indexMetadatas": [
                169,
                {
                    "paging": [
                        35,
                        "CursorPaging!"
                    ],
                    "filter": [
                        44,
                        "IndexFilter!"
                    ]
                }
            ],
            "commandMenuItems": [
                215
            ],
            "commandMenuItem": [
                215,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                214
            ],
            "frontComponent": [
                214,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "findManyAgents": [
                22
            ],
            "findOneAgent": [
                22,
                {
                    "input": [
                        310,
                        "AgentIdInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                141,
                {
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "listPlans": [
                140
            ],
            "getMeteredProductsUsage": [
                139
            ],
            "getRoles": [
                26
            ],
            "findWorkspaceInvitations": [
                148
            ],
            "getApprovedAccessDomains": [
                144
            ],
            "apiKeys": [
                2
            ],
            "apiKey": [
                2,
                {
                    "input": [
                        311,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "getToolIndex": [
                211
            ],
            "getToolInputSchema": [
                11,
                {
                    "toolName": [
                        1,
                        "String!"
                    ]
                }
            ],
            "field": [
                30,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                182,
                {
                    "paging": [
                        35,
                        "CursorPaging!"
                    ],
                    "filter": [
                        43,
                        "FieldFilter!"
                    ]
                }
            ],
            "currentUser": [
                67
            ],
            "currentWorkspace": [
                64
            ],
            "getPublicWorkspaceDataByDomain": [
                166,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "checkUserExists": [
                206,
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
                207,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                64,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validatePasswordResetToken": [
                196,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getSSOIdentityProviders": [
                186
            ],
            "webhooks": [
                226
            ],
            "webhook": [
                226,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatThreads": [
                219
            ],
            "chatThread": [
                219,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                218,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAISystemPromptPreview": [
                221
            ],
            "skills": [
                212
            ],
            "skill": [
                212,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                223,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "navigationMenuItems": [
                225
            ],
            "navigationMenuItem": [
                225,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "eventLogs": [
                306,
                {
                    "input": [
                        312,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                302,
                {
                    "input": [
                        316,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                300,
                {
                    "input": [
                        317,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                297,
                {
                    "input": [
                        318,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                292,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                287,
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
                        13
                    ]
                }
            ],
            "getAddressDetails": [
                289,
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
            "getConfigVariablesGrouped": [
                249
            ],
            "getSystemHealthStatus": [
                260
            ],
            "getIndicatorHealthStatus": [
                266,
                {
                    "indicatorId": [
                        258,
                        "HealthIndicatorId!"
                    ]
                }
            ],
            "getQueueMetrics": [
                270,
                {
                    "queueName": [
                        1,
                        "String!"
                    ],
                    "timeRange": [
                        271
                    ]
                }
            ],
            "versionInfo": [
                264
            ],
            "getAdminAiModels": [
                233
            ],
            "getDatabaseConfigVariable": [
                244,
                {
                    "key": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getQueueJobs": [
                255,
                {
                    "queueName": [
                        1,
                        "String!"
                    ],
                    "state": [
                        253,
                        "JobState!"
                    ],
                    "limit": [
                        18
                    ],
                    "offset": [
                        18
                    ]
                }
            ],
            "getPostgresCredentials": [
                294
            ],
            "findManyPublicDomains": [
                282
            ],
            "getEmailingDomains": [
                284
            ],
            "findManyApplications": [
                45
            ],
            "findOneApplication": [
                45,
                {
                    "id": [
                        3
                    ],
                    "universalIdentifier": [
                        3
                    ]
                }
            ],
            "findManyMarketplaceApps": [
                281
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                309
            ],
            "__typename": [
                1
            ]
        },
        "ID": {},
        "AgentIdInput": {
            "id": [
                3
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
        "EventLogQueryInput": {
            "table": [
                313
            ],
            "filters": [
                314
            ],
            "first": [
                18
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
                315
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
                11
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
                11
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
                11
            ],
            "__typename": [
                1
            ]
        },
        "Mutation": {
            "addQueryToEventStream": [
                13,
                {
                    "input": [
                        320,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                13,
                {
                    "input": [
                        321,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                121,
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
                        11
                    ]
                }
            ],
            "trackAnalytics": [
                121,
                {
                    "type": [
                        322,
                        "AnalyticsType!"
                    ],
                    "name": [
                        1
                    ],
                    "event": [
                        1
                    ],
                    "properties": [
                        11
                    ]
                }
            ],
            "createPageLayoutWidget": [
                74,
                {
                    "input": [
                        323,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                74,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        325,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "destroyPageLayoutWidget": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                109,
                {
                    "input": [
                        326,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                109,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        327,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "destroyPageLayoutTab": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayout": [
                110,
                {
                    "input": [
                        328,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                110,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        329,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "destroyPageLayout": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                110,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        330,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                28,
                {
                    "input": [
                        308,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                28,
                {
                    "input": [
                        333,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                208,
                {
                    "input": [
                        334,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                13,
                {
                    "input": [
                        335,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "uploadFile": [
                147,
                {
                    "file": [
                        337,
                        "Upload!"
                    ],
                    "fileFolder": [
                        338
                    ]
                }
            ],
            "uploadImage": [
                147,
                {
                    "file": [
                        337,
                        "Upload!"
                    ],
                    "fileFolder": [
                        338
                    ]
                }
            ],
            "createFile": [
                146,
                {
                    "file": [
                        337,
                        "Upload!"
                    ]
                }
            ],
            "deleteFile": [
                146,
                {
                    "fileId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "uploadWorkflowFile": [
                145,
                {
                    "file": [
                        337,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                145,
                {
                    "file": [
                        337,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                145,
                {
                    "file": [
                        337,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFile": [
                145,
                {
                    "file": [
                        337,
                        "Upload!"
                    ],
                    "fieldMetadataId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                145,
                {
                    "file": [
                        337,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneObject": [
                42,
                {
                    "input": [
                        339,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                42,
                {
                    "input": [
                        341,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                42,
                {
                    "input": [
                        342,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateCoreViewField": [
                48,
                {
                    "input": [
                        344,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createCoreViewField": [
                48,
                {
                    "input": [
                        346,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyCoreViewFields": [
                48,
                {
                    "inputs": [
                        346,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteCoreViewField": [
                48,
                {
                    "input": [
                        347,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyCoreViewField": [
                48,
                {
                    "input": [
                        348,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "createCoreView": [
                58,
                {
                    "input": [
                        349,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateCoreView": [
                58,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        350,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "deleteCoreView": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyCoreView": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createCoreViewSort": [
                55,
                {
                    "input": [
                        351,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateCoreViewSort": [
                55,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        352,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteCoreViewSort": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyCoreViewSort": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createCoreViewGroup": [
                54,
                {
                    "input": [
                        353,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyCoreViewGroups": [
                54,
                {
                    "inputs": [
                        353,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateCoreViewGroup": [
                54,
                {
                    "input": [
                        354,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "deleteCoreViewGroup": [
                54,
                {
                    "input": [
                        356,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyCoreViewGroup": [
                54,
                {
                    "input": [
                        357,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "createCoreViewFilterGroup": [
                50,
                {
                    "input": [
                        358,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateCoreViewFilterGroup": [
                50,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        359,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "deleteCoreViewFilterGroup": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyCoreViewFilterGroup": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createCoreViewFilter": [
                52,
                {
                    "input": [
                        360,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateCoreViewFilter": [
                52,
                {
                    "input": [
                        361,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteCoreViewFilter": [
                52,
                {
                    "input": [
                        363,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyCoreViewFilter": [
                52,
                {
                    "input": [
                        364,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "updateCoreViewFieldGroup": [
                57,
                {
                    "input": [
                        365,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createCoreViewFieldGroup": [
                57,
                {
                    "input": [
                        367,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyCoreViewFieldGroups": [
                57,
                {
                    "inputs": [
                        367,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteCoreViewFieldGroup": [
                57,
                {
                    "input": [
                        368,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyCoreViewFieldGroup": [
                57,
                {
                    "input": [
                        369,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                58,
                {
                    "input": [
                        370,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                215,
                {
                    "input": [
                        373,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                215,
                {
                    "input": [
                        374,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                215,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                214,
                {
                    "input": [
                        375,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                214,
                {
                    "input": [
                        376,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                214,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                22,
                {
                    "input": [
                        378,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                22,
                {
                    "input": [
                        379,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                22,
                {
                    "input": [
                        310,
                        "AgentIdInput!"
                    ]
                }
            ],
            "checkoutSession": [
                141,
                {
                    "recurringInterval": [
                        129,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        125,
                        "BillingPlanKey!"
                    ],
                    "requirePaymentMethod": [
                        13,
                        "Boolean!"
                    ],
                    "successUrlPath": [
                        1
                    ]
                }
            ],
            "switchSubscriptionInterval": [
                142
            ],
            "switchBillingPlan": [
                142
            ],
            "cancelSwitchBillingPlan": [
                142
            ],
            "cancelSwitchBillingInterval": [
                142
            ],
            "setMeteredSubscriptionPrice": [
                142,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                138
            ],
            "cancelSwitchMeteredPrice": [
                142
            ],
            "updateWorkspaceMemberRole": [
                17,
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
                26,
                {
                    "createRoleInput": [
                        380,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                26,
                {
                    "updateRoleInput": [
                        381,
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
                12,
                {
                    "upsertObjectPermissionsInput": [
                        383,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                24,
                {
                    "upsertPermissionFlagsInput": [
                        385,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                23,
                {
                    "upsertFieldPermissionsInput": [
                        386,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                179,
                {
                    "input": [
                        388,
                        "UpsertRowLevelPermissionPredicatesInput!"
                    ]
                }
            ],
            "assignRoleToAgent": [
                13,
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
                13,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePictureLegacy": [
                147,
                {
                    "file": [
                        337,
                        "Upload!"
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                143
            ],
            "skipBookOnboardingStep": [
                143
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
                149,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                149,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "createApprovedAccessDomain": [
                144,
                {
                    "input": [
                        391,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                13,
                {
                    "input": [
                        392,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                144,
                {
                    "input": [
                        393,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createApiKey": [
                2,
                {
                    "input": [
                        394,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        395,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        396,
                        "RevokeApiKeyInput!"
                    ]
                }
            ],
            "assignRoleToApiKey": [
                13,
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
            "createOneField": [
                30,
                {
                    "input": [
                        397,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                30,
                {
                    "input": [
                        399,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                30,
                {
                    "input": [
                        401,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteUser": [
                67
            ],
            "deleteUserFromWorkspace": [
                14,
                {
                    "workspaceMemberIdToDelete": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateUserEmail": [
                13,
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
                150,
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
                64,
                {
                    "data": [
                        402,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                64,
                {
                    "data": [
                        403,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "uploadWorkspaceLogoLegacy": [
                147,
                {
                    "file": [
                        337,
                        "Upload!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                64
            ],
            "checkCustomDomainValidRecords": [
                161
            ],
            "getAuthorizationUrlForSSO": [
                199,
                {
                    "input": [
                        404,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                205,
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
                198,
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
                202,
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
                198,
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
                204,
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
                198,
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
                201,
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
                201
            ],
            "generateTransientToken": [
                195
            ],
            "getAuthTokensFromLoginToken": [
                204,
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
                191,
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
                    ]
                }
            ],
            "renewToken": [
                204,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                203,
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
            "emailPasswordResetLink": [
                192,
                {
                    "email": [
                        1,
                        "String!"
                    ],
                    "workspaceId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "updatePasswordViaResetToken": [
                193,
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
                189,
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
                189
            ],
            "deleteTwoFactorAuthenticationMethod": [
                188,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                190,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                187,
                {
                    "input": [
                        405,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                187,
                {
                    "input": [
                        406,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                183,
                {
                    "input": [
                        407,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                184,
                {
                    "input": [
                        408,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createWebhook": [
                226,
                {
                    "input": [
                        409,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                226,
                {
                    "input": [
                        410,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                226,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createChatThread": [
                219
            ],
            "createSkill": [
                212,
                {
                    "input": [
                        412,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                212,
                {
                    "input": [
                        413,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                212,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                212,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                212,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                222,
                {
                    "turnId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                223,
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
            "createNavigationMenuItem": [
                225,
                {
                    "input": [
                        414,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                225,
                {
                    "input": [
                        415,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                225,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "duplicateDashboard": [
                303,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                272,
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
            "startChannelSync": [
                295,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                293,
                {
                    "accountOwnerId": [
                        3,
                        "UUID!"
                    ],
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        417,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                162,
                {
                    "input": [
                        419,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "userLookupAdminPanel": [
                263,
                {
                    "userIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceFeatureFlag": [
                13,
                {
                    "workspaceId": [
                        3,
                        "UUID!"
                    ],
                    "featureFlag": [
                        1,
                        "String!"
                    ],
                    "value": [
                        13,
                        "Boolean!"
                    ]
                }
            ],
            "setAdminAiModelEnabled": [
                13,
                {
                    "modelId": [
                        1,
                        "String!"
                    ],
                    "enabled": [
                        13,
                        "Boolean!"
                    ]
                }
            ],
            "createDatabaseConfigVariable": [
                13,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        11,
                        "JSON!"
                    ]
                }
            ],
            "updateDatabaseConfigVariable": [
                13,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        11,
                        "JSON!"
                    ]
                }
            ],
            "deleteDatabaseConfigVariable": [
                13,
                {
                    "key": [
                        1,
                        "String!"
                    ]
                }
            ],
            "retryJobs": [
                256,
                {
                    "queueName": [
                        1,
                        "String!"
                    ],
                    "jobIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "deleteJobs": [
                251,
                {
                    "queueName": [
                        1,
                        "String!"
                    ],
                    "jobIds": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "enablePostgresProxy": [
                294
            ],
            "disablePostgresProxy": [
                294
            ],
            "createPublicDomain": [
                282,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deletePublicDomain": [
                13,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkPublicDomainValidRecords": [
                161,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createEmailingDomain": [
                284,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "driver": [
                        285,
                        "EmailingDomainDriver!"
                    ]
                }
            ],
            "deleteEmailingDomain": [
                13,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "verifyEmailingDomain": [
                284,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneAppToken": [
                66,
                {
                    "input": [
                        420,
                        "CreateOneAppTokenInput!"
                    ]
                }
            ],
            "renewApplicationToken": [
                213,
                {
                    "applicationRefreshToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "installApplication": [
                13,
                {
                    "workspaceMigration": [
                        422,
                        "WorkspaceMigrationInput!"
                    ]
                }
            ],
            "uninstallApplication": [
                13,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApplicationToken": [
                213,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "syncApplication": [
                273,
                {
                    "manifest": [
                        11,
                        "JSON!"
                    ]
                }
            ],
            "createOneApplication": [
                45,
                {
                    "input": [
                        426,
                        "CreateApplicationInput!"
                    ]
                }
            ],
            "uploadApplicationFile": [
                146,
                {
                    "file": [
                        337,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        338,
                        "FileFolder!"
                    ],
                    "filePath": [
                        1,
                        "String!"
                    ]
                }
            ],
            "installMarketplaceApp": [
                13
            ],
            "updateOneApplicationVariable": [
                13,
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
                11
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
        "AnalyticsType": {},
        "CreatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                75
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                324
            ],
            "position": [
                11
            ],
            "configuration": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "GridPositionInput": {
            "row": [
                7
            ],
            "column": [
                7
            ],
            "rowSpan": [
                7
            ],
            "columnSpan": [
                7
            ],
            "__typename": [
                1
            ]
        },
        "UpdatePageLayoutWidgetInput": {
            "title": [
                1
            ],
            "type": [
                75
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                324
            ],
            "position": [
                11
            ],
            "configuration": [
                11
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
                7
            ],
            "pageLayoutId": [
                3
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
                7
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
                111
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
                111
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
                111
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                331
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
                7
            ],
            "widgets": [
                332
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
                75
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                324
            ],
            "position": [
                11
            ],
            "configuration": [
                11
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
                7
            ],
            "toolInputSchema": [
                11
            ],
            "isTool": [
                13
            ],
            "source": [
                11
            ],
            "cronTriggerSettings": [
                11
            ],
            "databaseEventTriggerSettings": [
                11
            ],
            "httpRouteTriggerSettings": [
                11
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
                11
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
                336
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
                7
            ],
            "sourceHandlerCode": [
                1
            ],
            "toolInputSchema": [
                11
            ],
            "handlerName": [
                1
            ],
            "sourceHandlerPath": [
                1
            ],
            "isTool": [
                13
            ],
            "cronTriggerSettings": [
                11
            ],
            "databaseEventTriggerSettings": [
                11
            ],
            "httpRouteTriggerSettings": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "FileFolder": {},
        "CreateOneObjectInput": {
            "object": [
                340
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
            "skipNameField": [
                13
            ],
            "isRemote": [
                13
            ],
            "primaryKeyColumnType": [
                1
            ],
            "primaryKeyFieldMetadataSettings": [
                11
            ],
            "isLabelSyncedWithName": [
                13
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
                343
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
            "isActive": [
                13
            ],
            "labelIdentifierFieldMetadataId": [
                3
            ],
            "imageIdentifierFieldMetadataId": [
                3
            ],
            "isLabelSyncedWithName": [
                13
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
                345
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInputUpdates": {
            "isVisible": [
                13
            ],
            "size": [
                7
            ],
            "position": [
                7
            ],
            "aggregateOperation": [
                49
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
                13
            ],
            "size": [
                7
            ],
            "position": [
                7
            ],
            "aggregateOperation": [
                49
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
                59
            ],
            "key": [
                60
            ],
            "icon": [
                1
            ],
            "position": [
                7
            ],
            "isCompact": [
                13
            ],
            "shouldHideEmptyGroups": [
                13
            ],
            "openRecordIn": [
                61
            ],
            "kanbanAggregateOperation": [
                49
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                62
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "visibility": [
                63
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
                59
            ],
            "icon": [
                1
            ],
            "position": [
                7
            ],
            "isCompact": [
                13
            ],
            "openRecordIn": [
                61
            ],
            "kanbanAggregateOperation": [
                49
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                62
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "visibility": [
                63
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "shouldHideEmptyGroups": [
                13
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
                56
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
            "fieldMetadataId": [
                3
            ],
            "direction": [
                56
            ],
            "viewId": [
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
                13
            ],
            "fieldValue": [
                1
            ],
            "position": [
                7
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
                355
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
                13
            ],
            "fieldValue": [
                1
            ],
            "position": [
                7
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
        "CreateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                51
            ],
            "positionInViewFilterGroup": [
                7
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
                51
            ],
            "positionInViewFilterGroup": [
                7
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
                53
            ],
            "value": [
                11
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                7
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
        "UpdateViewFilterInput": {
            "id": [
                3
            ],
            "update": [
                362
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
                53
            ],
            "value": [
                11
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                7
            ],
            "subFieldName": [
                1
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
        "UpdateViewFieldGroupInput": {
            "id": [
                3
            ],
            "update": [
                366
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
                7
            ],
            "isVisible": [
                13
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
                7
            ],
            "isVisible": [
                13
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
                371
            ],
            "fields": [
                372
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
                7
            ],
            "isVisible": [
                13
            ],
            "fields": [
                372
            ],
            "__typename": [
                1
            ]
        },
        "UpsertFieldsWidgetFieldInput": {
            "viewFieldId": [
                3
            ],
            "isVisible": [
                13
            ],
            "position": [
                7
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
            "label": [
                1
            ],
            "icon": [
                1
            ],
            "isPinned": [
                13
            ],
            "availabilityType": [
                216
            ],
            "availabilityObjectMetadataId": [
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
            "isPinned": [
                13
            ],
            "availabilityType": [
                216
            ],
            "availabilityObjectMetadataId": [
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
                377
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
                11
            ],
            "modelConfiguration": [
                11
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
                11
            ],
            "modelConfiguration": [
                11
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
                13
            ],
            "canAccessAllTools": [
                13
            ],
            "canReadAllObjectRecords": [
                13
            ],
            "canUpdateAllObjectRecords": [
                13
            ],
            "canSoftDeleteAllObjectRecords": [
                13
            ],
            "canDestroyAllObjectRecords": [
                13
            ],
            "canBeAssignedToUsers": [
                13
            ],
            "canBeAssignedToAgents": [
                13
            ],
            "canBeAssignedToApiKeys": [
                13
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRoleInput": {
            "update": [
                382
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
                13
            ],
            "canAccessAllTools": [
                13
            ],
            "canReadAllObjectRecords": [
                13
            ],
            "canUpdateAllObjectRecords": [
                13
            ],
            "canSoftDeleteAllObjectRecords": [
                13
            ],
            "canDestroyAllObjectRecords": [
                13
            ],
            "canBeAssignedToUsers": [
                13
            ],
            "canBeAssignedToAgents": [
                13
            ],
            "canBeAssignedToApiKeys": [
                13
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
                384
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
                13
            ],
            "canUpdateObjectRecords": [
                13
            ],
            "canSoftDeleteObjectRecords": [
                13
            ],
            "canDestroyObjectRecords": [
                13
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
                15
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
                387
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
                13
            ],
            "canUpdateFieldValue": [
                13
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
                389
            ],
            "predicateGroups": [
                390
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
                10
            ],
            "value": [
                11
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
                7
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
                8
            ],
            "positionInRowLevelPermissionPredicateGroup": [
                7
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
        "CreateOneFieldMetadataInput": {
            "field": [
                398
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                31
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
                13
            ],
            "isActive": [
                13
            ],
            "isSystem": [
                13
            ],
            "isUIReadOnly": [
                13
            ],
            "isNullable": [
                13
            ],
            "isUnique": [
                13
            ],
            "defaultValue": [
                11
            ],
            "options": [
                11
            ],
            "settings": [
                11
            ],
            "isLabelSyncedWithName": [
                13
            ],
            "objectMetadataId": [
                3
            ],
            "isRemoteCreation": [
                13
            ],
            "relationCreationPayload": [
                11
            ],
            "morphRelationsCreationPayload": [
                11
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
                400
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
            "universalIdentifier": [
                3
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
                13
            ],
            "isSystem": [
                13
            ],
            "isUIReadOnly": [
                13
            ],
            "isNullable": [
                13
            ],
            "isUnique": [
                13
            ],
            "defaultValue": [
                11
            ],
            "options": [
                11
            ],
            "settings": [
                11
            ],
            "isLabelSyncedWithName": [
                13
            ],
            "morphRelationsUpdatePayload": [
                11
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
                13
            ],
            "allowImpersonation": [
                13
            ],
            "isGoogleAuthEnabled": [
                13
            ],
            "isMicrosoftAuthEnabled": [
                13
            ],
            "isPasswordAuthEnabled": [
                13
            ],
            "isGoogleAuthBypassEnabled": [
                13
            ],
            "isMicrosoftAuthBypassEnabled": [
                13
            ],
            "isPasswordAuthBypassEnabled": [
                13
            ],
            "defaultRoleId": [
                3
            ],
            "isTwoFactorAuthenticationEnforced": [
                13
            ],
            "trashRetentionDays": [
                7
            ],
            "eventLogRetentionDays": [
                7
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
            "autoEnableNewAiModels": [
                13
            ],
            "disabledAiModelIds": [
                1
            ],
            "enabledAiModelIds": [
                1
            ],
            "useRecommendedModels": [
                13
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
                154
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
                411
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
                13
            ],
            "__typename": [
                1
            ]
        },
        "CreateNavigationMenuItemInput": {
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
            "name": [
                1
            ],
            "link": [
                1
            ],
            "icon": [
                1
            ],
            "folderId": [
                3
            ],
            "position": [
                7
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
                416
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
                7
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
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "IMAP": [
                418
            ],
            "SMTP": [
                418
            ],
            "CALDAV": [
                418
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionParameters": {
            "host": [
                1
            ],
            "port": [
                7
            ],
            "username": [
                1
            ],
            "password": [
                1
            ],
            "secure": [
                13
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
                13
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneAppTokenInput": {
            "appToken": [
                421
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
        "WorkspaceMigrationInput": {
            "actions": [
                423
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigrationDeleteActionInput": {
            "type": [
                424
            ],
            "metadataName": [
                425
            ],
            "universalIdentifier": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigrationActionType": {},
        "AllMetadataName": {},
        "CreateApplicationInput": {
            "universalIdentifier": [
                1
            ],
            "name": [
                1
            ],
            "description": [
                1
            ],
            "version": [
                1
            ],
            "sourcePath": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "Subscription": {
            "onDbEvent": [
                120,
                {
                    "input": [
                        428,
                        "OnDbEventInput!"
                    ]
                }
            ],
            "onEventSubscription": [
                119,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                210,
                {
                    "input": [
                        429,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "OnDbEventInput": {
            "action": [
                116
            ],
            "objectNameSingular": [
                1
            ],
            "recordId": [
                3
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