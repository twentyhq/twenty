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
        35,
        38,
        40,
        51,
        53,
        55,
        58,
        61,
        62,
        63,
        64,
        65,
        67,
        70,
        71,
        76,
        79,
        84,
        87,
        88,
        90,
        94,
        95,
        112,
        115,
        117,
        126,
        127,
        128,
        130,
        138,
        154,
        155,
        160,
        164,
        183,
        218,
        226,
        239,
        240,
        245,
        248,
        254,
        255,
        257,
        262,
        267,
        268,
        280,
        296,
        297,
        320,
        327,
        328,
        329,
        331,
        340,
        399,
        450,
        451,
        452
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
                125
            ],
            "on_BillingLicensedProduct": [
                134
            ],
            "on_BillingMeteredProduct": [
                135
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
            "description": [
                1
            ],
            "logoUrl": [
                1
            ],
            "author": [
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
            "websiteUrl": [
                1
            ],
            "termsUrl": [
                1
            ],
            "isListed": [
                6
            ],
            "isFeatured": [
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
                69
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
        "PermissionFlag": {
            "id": [
                3
            ],
            "roleId": [
                3
            ],
            "flag": [
                18
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
            "toolInputSchema": [
                15
            ],
            "isTool": [
                6
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
                3
            ],
            "type": [
                35
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
                33
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
                182
            ],
            "morphRelations": [
                182
            ],
            "object": [
                46
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
                38
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                36
            ],
            "objectMetadata": [
                175,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        41,
                        "ObjectFilter!"
                    ]
                }
            ],
            "indexFieldMetadatas": [
                173,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        44,
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
                40
            ],
            "after": [
                40
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
                41
            ],
            "or": [
                41
            ],
            "id": [
                42
            ],
            "universalIdentifier": [
                42
            ],
            "isCustom": [
                43
            ],
            "isRemote": [
                43
            ],
            "isActive": [
                43
            ],
            "isSystem": [
                43
            ],
            "isUIReadOnly": [
                43
            ],
            "isSearchable": [
                43
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
                44
            ],
            "or": [
                44
            ],
            "id": [
                42
            ],
            "fieldMetadataId": [
                42
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
                45
            ],
            "shortcut": [
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
                34
            ],
            "indexMetadataList": [
                37
            ],
            "fields": [
                180,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        47,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                178,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        48,
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
                47
            ],
            "or": [
                47
            ],
            "id": [
                42
            ],
            "universalIdentifier": [
                42
            ],
            "isCustom": [
                43
            ],
            "isActive": [
                43
            ],
            "isSystem": [
                43
            ],
            "isUIReadOnly": [
                43
            ],
            "__typename": [
                1
            ]
        },
        "IndexFilter": {
            "and": [
                48
            ],
            "or": [
                48
            ],
            "id": [
                42
            ],
            "isCustom": [
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
            "logicFunctions": [
                32
            ],
            "objects": [
                46
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
        "CoreViewField": {
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
                51
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
                53
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
        "CoreViewFilter": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "operand": [
                55
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
        "CoreViewSort": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                58
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
            "deletedAt": [
                4
            ],
            "viewFields": [
                50
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
                61
            ],
            "key": [
                62
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
                63
            ],
            "kanbanAggregateOperation": [
                51
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
                64
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
                50
            ],
            "viewFilters": [
                54
            ],
            "viewFilterGroups": [
                52
            ],
            "viewSorts": [
                57
            ],
            "viewGroups": [
                56
            ],
            "viewFieldGroups": [
                59
            ],
            "visibility": [
                65
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
                67
            ],
            "views": [
                60
            ],
            "viewFields": [
                50
            ],
            "viewFilters": [
                54
            ],
            "viewFilterGroups": [
                52
            ],
            "viewGroups": [
                56
            ],
            "viewSorts": [
                57
            ],
            "metadataVersion": [
                11
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
            "editableProfileFields": [
                1
            ],
            "defaultRole": [
                29
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
                6
            ],
            "disabledAiModelIds": [
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
                49
            ],
            "featureFlags": [
                163
            ],
            "billingSubscriptions": [
                137
            ],
            "currentBillingSubscription": [
                137
            ],
            "billingEntitlements": [
                159
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
                152
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
                70
            ],
            "currentWorkspace": [
                66
            ],
            "currentUserWorkspace": [
                17
            ],
            "userVars": [
                71
            ],
            "workspaceMembers": [
                20
            ],
            "deletedWorkspaceMembers": [
                158
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
                157
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
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                76
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                74
            ],
            "position": [
                77
            ],
            "configuration": [
                82
            ],
            "conditionalDisplay": [
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
                78
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                80
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                81
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                79
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
                79
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
                79
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                83
            ],
            "on_StandaloneRichTextConfiguration": [
                85
            ],
            "on_PieChartConfiguration": [
                86
            ],
            "on_LineChartConfiguration": [
                89
            ],
            "on_IframeConfiguration": [
                91
            ],
            "on_GaugeChartConfiguration": [
                92
            ],
            "on_BarChartConfiguration": [
                93
            ],
            "on_CalendarConfiguration": [
                96
            ],
            "on_FrontComponentConfiguration": [
                97
            ],
            "on_EmailsConfiguration": [
                98
            ],
            "on_FieldConfiguration": [
                99
            ],
            "on_FieldRichTextConfiguration": [
                100
            ],
            "on_FieldsConfiguration": [
                101
            ],
            "on_FilesConfiguration": [
                102
            ],
            "on_NotesConfiguration": [
                103
            ],
            "on_TasksConfiguration": [
                104
            ],
            "on_TimelineConfiguration": [
                105
            ],
            "on_ViewConfiguration": [
                106
            ],
            "on_WorkflowConfiguration": [
                107
            ],
            "on_WorkflowRunConfiguration": [
                108
            ],
            "on_WorkflowVersionConfiguration": [
                109
            ],
            "__typename": [
                1
            ]
        },
        "AggregateChartConfiguration": {
            "configurationType": [
                84
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                51
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
                72
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                84
            ],
            "body": [
                73
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                84
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                51
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                87
            ],
            "orderBy": [
                88
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
                84
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                51
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                87
            ],
            "primaryAxisOrderBy": [
                88
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
                87
            ],
            "secondaryAxisOrderBy": [
                88
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
                90
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
                84
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
                84
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                51
            ],
            "displayDataLabel": [
                6
            ],
            "color": [
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
            "__typename": [
                1
            ]
        },
        "BarChartConfiguration": {
            "configurationType": [
                84
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                51
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                87
            ],
            "primaryAxisOrderBy": [
                88
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
                87
            ],
            "secondaryAxisOrderBy": [
                88
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
                90
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
                94
            ],
            "layout": [
                95
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
                84
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                84
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
                84
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "FieldRichTextConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                84
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
                84
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                84
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                84
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
                75
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                79
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
                112
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                110
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
                115
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                113
            ],
            "__typename": [
                1
            ]
        },
        "MetadataEventAction": {},
        "ObjectRecordEvent": {
            "action": [
                117
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
                113
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
                116
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
                114
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
                118
            ],
            "metadataEventsWithQueryIds": [
                119
            ],
            "__typename": [
                1
            ]
        },
        "OnDbEvent": {
            "action": [
                117
            ],
            "objectNameSingular": [
                1
            ],
            "eventDate": [
                4
            ],
            "record": [
                15
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
                123
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                126
            ],
            "priceUsageBased": [
                127
            ],
            "productKey": [
                128
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
                130
            ],
            "unitAmount": [
                11
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                127
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
                131
            ],
            "recurringInterval": [
                130
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                127
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
                125
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
                125
            ],
            "prices": [
                129
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
                125
            ],
            "prices": [
                132
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
                138
            ],
            "interval": [
                130
            ],
            "billingSubscriptionItems": [
                136
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                15
            ],
            "phases": [
                124
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "BillingEndTrialPeriod": {
            "status": [
                138
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
        "BillingMeteredProductUsage": {
            "productKey": [
                128
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
                126
            ],
            "licensedProducts": [
                134
            ],
            "meteredProducts": [
                135
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
                137
            ],
            "billingSubscriptions": [
                137
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
        "OnboardingStepSuccess": {
            "success": [
                6
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
                149
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
                154
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
                155
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
                152
            ],
            "logo": [
                1
            ],
            "sso": [
                153
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                156
            ],
            "availableWorkspacesForSignUp": [
                156
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
                160
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
                161
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                164
            ],
            "value": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagKey": {},
        "SSOIdentityProvider": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                154
            ],
            "status": [
                155
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
                165
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
                166
            ],
            "authBypassProviders": [
                167
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                152
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "node": [
                37
            ],
            "cursor": [
                40
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
                40
            ],
            "endCursor": [
                40
            ],
            "__typename": [
                1
            ]
        },
        "IndexConnection": {
            "pageInfo": [
                170
            ],
            "edges": [
                169
            ],
            "__typename": [
                1
            ]
        },
        "IndexFieldEdge": {
            "node": [
                36
            ],
            "cursor": [
                40
            ],
            "__typename": [
                1
            ]
        },
        "IndexIndexFieldMetadatasConnection": {
            "pageInfo": [
                170
            ],
            "edges": [
                172
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
                40
            ],
            "__typename": [
                1
            ]
        },
        "IndexObjectMetadataConnection": {
            "pageInfo": [
                170
            ],
            "edges": [
                174
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
                170
            ],
            "edges": [
                174
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                170
            ],
            "edges": [
                169
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                34
            ],
            "cursor": [
                40
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                170
            ],
            "edges": [
                179
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
        "Relation": {
            "type": [
                183
            ],
            "sourceObjectMetadata": [
                46
            ],
            "targetObjectMetadata": [
                46
            ],
            "sourceFieldMetadata": [
                34
            ],
            "targetFieldMetadata": [
                34
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "FieldConnection": {
            "pageInfo": [
                170
            ],
            "edges": [
                179
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
                185
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
                154
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                155
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
                154
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
                155
            ],
            "workspace": [
                192
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
                154
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                155
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
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                199
            ],
            "refreshToken": [
                199
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokens": {
            "tokens": [
                200
            ],
            "availableWorkspaces": [
                157
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
                152
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
                199
            ],
            "workspace": [
                205
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                199
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
                199
            ],
            "workspaceUrls": [
                152
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
                200
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                199
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
            "color": [
                1
            ],
            "folderId": [
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
                215
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
                218
            ],
            "error": [
                15
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
        "ApplicationTokenPair": {
            "applicationAccessToken": [
                199
            ],
            "applicationRefreshToken": [
                199
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
            "applicationTokenPair": [
                223
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
                224
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
                226
            ],
            "conditionalAvailabilityExpression": [
                1
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
        "EngineComponentKey": {},
        "CommandMenuItemAvailabilityType": {},
        "AgentChatThread": {
            "id": [
                3
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
                221
            ],
            "createdAt": [
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
                21
            ],
            "__typename": [
                1
            ]
        },
        "AISystemPromptPreview": {
            "sections": [
                229
            ],
            "estimatedTokenCount": [
                21
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThreadEdge": {
            "node": [
                227
            ],
            "cursor": [
                40
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThreadConnection": {
            "pageInfo": [
                170
            ],
            "edges": [
                231
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
                233
            ],
            "messages": [
                228
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
        "ClientAIModelConfig": {
            "modelId": [
                1
            ],
            "label": [
                1
            ],
            "modelFamily": [
                239
            ],
            "inferenceProvider": [
                240
            ],
            "inputCostPerMillionTokensInCredits": [
                11
            ],
            "outputCostPerMillionTokensInCredits": [
                11
            ],
            "nativeCapabilities": [
                237
            ],
            "deprecated": [
                6
            ],
            "isRecommended": [
                6
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
                239
            ],
            "inferenceProvider": [
                240
            ],
            "isAvailable": [
                6
            ],
            "isAdminEnabled": [
                6
            ],
            "deprecated": [
                6
            ],
            "isRecommended": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "AdminAIModels": {
            "autoEnableNewModels": [
                6
            ],
            "models": [
                241
            ],
            "__typename": [
                1
            ]
        },
        "Billing": {
            "isBillingEnabled": [
                6
            ],
            "billingUrl": [
                1
            ],
            "trialPeriods": [
                236
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                245
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
                248
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
                164
            ],
            "metadata": [
                250
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
                166
            ],
            "billing": [
                243
            ],
            "aiModels": [
                238
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
                244
            ],
            "isAttachmentPreviewEnabled": [
                6
            ],
            "sentry": [
                246
            ],
            "captcha": [
                247
            ],
            "chromeExtensionId": [
                1
            ],
            "api": [
                249
            ],
            "canManageFeatureFlags": [
                6
            ],
            "publicFeatureFlags": [
                251
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
                15
            ],
            "isSensitive": [
                6
            ],
            "source": [
                254
            ],
            "isEnvOnly": [
                6
            ],
            "type": [
                255
            ],
            "options": [
                15
            ],
            "__typename": [
                1
            ]
        },
        "ConfigSource": {},
        "ConfigVariableType": {},
        "ConfigVariablesGroupData": {
            "variables": [
                253
            ],
            "name": [
                257
            ],
            "description": [
                1
            ],
            "isHiddenOnLoad": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "ConfigVariablesGroup": {},
        "ConfigVariables": {
            "groups": [
                256
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
                6
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
                21
            ],
            "results": [
                259
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
                15
            ],
            "state": [
                262
            ],
            "timestamp": [
                11
            ],
            "failedReason": [
                1
            ],
            "processedOn": [
                11
            ],
            "finishedOn": [
                11
            ],
            "attemptsMade": [
                11
            ],
            "returnValue": [
                15
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
                11
            ],
            "completedMaxCount": [
                11
            ],
            "failedMaxAge": [
                11
            ],
            "failedMaxCount": [
                11
            ],
            "__typename": [
                1
            ]
        },
        "QueueJobsResponse": {
            "jobs": [
                261
            ],
            "count": [
                11
            ],
            "totalCount": [
                11
            ],
            "hasMore": [
                6
            ],
            "retentionConfig": [
                263
            ],
            "__typename": [
                1
            ]
        },
        "RetryJobsResponse": {
            "retriedCount": [
                21
            ],
            "results": [
                259
            ],
            "__typename": [
                1
            ]
        },
        "SystemHealthService": {
            "id": [
                267
            ],
            "label": [
                1
            ],
            "status": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "HealthIndicatorId": {},
        "AdminPanelHealthServiceStatus": {},
        "SystemHealth": {
            "services": [
                266
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
                6
            ],
            "logo": [
                1
            ],
            "totalUsers": [
                11
            ],
            "workspaceUrls": [
                152
            ],
            "users": [
                270
            ],
            "featureFlags": [
                163
            ],
            "__typename": [
                1
            ]
        },
        "UserLookup": {
            "user": [
                270
            ],
            "workspaces": [
                271
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
                268
            ],
            "__typename": [
                1
            ]
        },
        "AdminPanelHealthServiceData": {
            "id": [
                267
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "status": [
                268
            ],
            "errorMessage": [
                1
            ],
            "details": [
                1
            ],
            "queues": [
                274
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsDataPoint": {
            "x": [
                11
            ],
            "y": [
                11
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
                276
            ],
            "__typename": [
                1
            ]
        },
        "WorkerQueueMetrics": {
            "failed": [
                11
            ],
            "completed": [
                11
            ],
            "waiting": [
                11
            ],
            "active": [
                11
            ],
            "delayed": [
                11
            ],
            "failureRate": [
                11
            ],
            "failedData": [
                11
            ],
            "completedData": [
                11
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
                11
            ],
            "timeRange": [
                280
            ],
            "details": [
                278
            ],
            "data": [
                277
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsTimeRange": {},
        "Impersonate": {
            "loginToken": [
                199
            ],
            "workspace": [
                205
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
                285
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
                21
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
        "MarketplaceAppRoleFieldPermission": {
            "objectUniversalIdentifier": [
                1
            ],
            "fieldUniversalIdentifier": [
                1
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
            "canUpdateAllSettings": [
                6
            ],
            "canAccessAllTools": [
                6
            ],
            "objectPermissions": [
                289
            ],
            "fieldPermissions": [
                290
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
                286
            ],
            "fields": [
                285
            ],
            "logicFunctions": [
                287
            ],
            "frontComponents": [
                288
            ],
            "defaultRole": [
                291
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
                296
            ],
            "status": [
                297
            ],
            "verificationRecords": [
                294
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
                299
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
        "ImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                301
            ],
            "SMTP": [
                301
            ],
            "CALDAV": [
                301
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
                302
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
                307
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
                95
            ],
            "groupMode": [
                94
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
                309
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                310
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
                312
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
                315
            ],
            "totalCount": [
                21
            ],
            "pageInfo": [
                316
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "getPageLayoutWidgets": [
                75,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                75,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                110,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                110,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayouts": [
                111,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "pageLayoutType": [
                        112
                    ]
                }
            ],
            "getPageLayout": [
                111,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findOneLogicFunction": [
                32,
                {
                    "input": [
                        319,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "findManyLogicFunctions": [
                32
            ],
            "getAvailablePackages": [
                15,
                {
                    "input": [
                        319,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        319,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "objectRecordCounts": [
                176
            ],
            "object": [
                46,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                177,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        41,
                        "ObjectFilter!"
                    ]
                }
            ],
            "getCoreViewFields": [
                50,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewField": [
                50,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViews": [
                60,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        61,
                        "[ViewType!]"
                    ]
                }
            ],
            "getCoreView": [
                60,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewSorts": [
                57,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewSort": [
                57,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewGroups": [
                56,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewGroup": [
                56,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFilterGroups": [
                52,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewFilterGroup": [
                52,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFilters": [
                54,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewFilter": [
                54,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFieldGroups": [
                59,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFieldGroup": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "index": [
                37,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "indexMetadatas": [
                171,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        48,
                        "IndexFilter!"
                    ]
                }
            ],
            "commandMenuItems": [
                225
            ],
            "commandMenuItem": [
                225,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "frontComponents": [
                224
            ],
            "frontComponent": [
                224,
                {
                    "id": [
                        3,
                        "UUID!"
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
                        321,
                        "AgentIdInput!"
                    ]
                }
            ],
            "billingPortalSession": [
                142,
                {
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "listPlans": [
                141
            ],
            "getMeteredProductsUsage": [
                140
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
                145
            ],
            "navigationMenuItems": [
                216
            ],
            "navigationMenuItem": [
                216,
                {
                    "id": [
                        3,
                        "UUID!"
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
                        322,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "getRoles": [
                29
            ],
            "findWorkspaceInvitations": [
                149
            ],
            "getApprovedAccessDomains": [
                147
            ],
            "getToolIndex": [
                220
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
            "field": [
                34,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                184,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        47,
                        "FieldFilter!"
                    ]
                }
            ],
            "currentUser": [
                69
            ],
            "currentWorkspace": [
                66
            ],
            "getPublicWorkspaceDataByDomain": [
                168,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "checkUserExists": [
                213,
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
                214,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                66,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validatePasswordResetToken": [
                208,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                188,
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
                186,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                5,
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
            "getSSOIdentityProviders": [
                193
            ],
            "webhooks": [
                235
            ],
            "webhook": [
                235,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatThread": [
                227,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                228,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAISystemPromptPreview": [
                230
            ],
            "skills": [
                222
            ],
            "skill": [
                222,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "chatThreads": [
                232,
                {
                    "paging": [
                        39,
                        "CursorPaging!"
                    ],
                    "filter": [
                        323,
                        "AgentChatThreadFilter!"
                    ],
                    "sorting": [
                        326,
                        "[AgentChatThreadSort!]!"
                    ]
                }
            ],
            "agentTurns": [
                234,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "eventLogs": [
                317,
                {
                    "input": [
                        330,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                313,
                {
                    "input": [
                        334,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                311,
                {
                    "input": [
                        335,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                308,
                {
                    "input": [
                        336,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                303,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                298,
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
                300,
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
                258
            ],
            "getSystemHealthStatus": [
                269
            ],
            "getIndicatorHealthStatus": [
                275,
                {
                    "indicatorId": [
                        267,
                        "HealthIndicatorId!"
                    ]
                }
            ],
            "getQueueMetrics": [
                279,
                {
                    "queueName": [
                        1,
                        "String!"
                    ],
                    "timeRange": [
                        280
                    ]
                }
            ],
            "versionInfo": [
                273
            ],
            "getAdminAiModels": [
                242
            ],
            "getDatabaseConfigVariable": [
                253,
                {
                    "key": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getQueueJobs": [
                264,
                {
                    "queueName": [
                        1,
                        "String!"
                    ],
                    "state": [
                        262,
                        "JobState!"
                    ],
                    "limit": [
                        21
                    ],
                    "offset": [
                        21
                    ]
                }
            ],
            "findAllApplicationRegistrations": [
                7
            ],
            "getPostgresCredentials": [
                305
            ],
            "findManyPublicDomains": [
                293
            ],
            "getEmailingDomains": [
                295
            ],
            "findManyMarketplaceApps": [
                292
            ],
            "findOneMarketplaceApp": [
                292,
                {
                    "universalIdentifier": [
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
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                320
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
        "AgentChatThreadFilter": {
            "and": [
                323
            ],
            "or": [
                323
            ],
            "id": [
                42
            ],
            "updatedAt": [
                324
            ],
            "__typename": [
                1
            ]
        },
        "DateFieldComparison": {
            "is": [
                6
            ],
            "isNot": [
                6
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
            "in": [
                4
            ],
            "notIn": [
                4
            ],
            "between": [
                325
            ],
            "notBetween": [
                325
            ],
            "__typename": [
                1
            ]
        },
        "DateFieldComparisonBetween": {
            "lower": [
                4
            ],
            "upper": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThreadSort": {
            "field": [
                327
            ],
            "direction": [
                328
            ],
            "nulls": [
                329
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatThreadSortFields": {},
        "SortDirection": {},
        "SortNulls": {},
        "EventLogQueryInput": {
            "table": [
                331
            ],
            "filters": [
                332
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
                333
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
            "createObjectEvent": [
                122,
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
                122,
                {
                    "type": [
                        340,
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
            "createPageLayoutWidget": [
                75,
                {
                    "input": [
                        341,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                75,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        343,
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
            "createPageLayoutTab": [
                110,
                {
                    "input": [
                        344,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                110,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        345,
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
                111,
                {
                    "input": [
                        346,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                111,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        347,
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
                111,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        348,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                32,
                {
                    "input": [
                        319,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                32,
                {
                    "input": [
                        351,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                217,
                {
                    "input": [
                        352,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                6,
                {
                    "input": [
                        353,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createOneObject": [
                46,
                {
                    "input": [
                        355,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                46,
                {
                    "input": [
                        357,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                46,
                {
                    "input": [
                        358,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "updateCoreViewField": [
                50,
                {
                    "input": [
                        360,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createCoreViewField": [
                50,
                {
                    "input": [
                        362,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyCoreViewFields": [
                50,
                {
                    "inputs": [
                        362,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteCoreViewField": [
                50,
                {
                    "input": [
                        363,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyCoreViewField": [
                50,
                {
                    "input": [
                        364,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "createCoreView": [
                60,
                {
                    "input": [
                        365,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateCoreView": [
                60,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        366,
                        "UpdateViewInput!"
                    ]
                }
            ],
            "deleteCoreView": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyCoreView": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createCoreViewSort": [
                57,
                {
                    "input": [
                        367,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateCoreViewSort": [
                57,
                {
                    "input": [
                        368,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteCoreViewSort": [
                6,
                {
                    "input": [
                        370,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyCoreViewSort": [
                6,
                {
                    "input": [
                        371,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "createCoreViewGroup": [
                56,
                {
                    "input": [
                        372,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyCoreViewGroups": [
                56,
                {
                    "inputs": [
                        372,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateCoreViewGroup": [
                56,
                {
                    "input": [
                        373,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "deleteCoreViewGroup": [
                56,
                {
                    "input": [
                        375,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyCoreViewGroup": [
                56,
                {
                    "input": [
                        376,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "createCoreViewFilterGroup": [
                52,
                {
                    "input": [
                        377,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateCoreViewFilterGroup": [
                52,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        378,
                        "UpdateViewFilterGroupInput!"
                    ]
                }
            ],
            "deleteCoreViewFilterGroup": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyCoreViewFilterGroup": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createCoreViewFilter": [
                54,
                {
                    "input": [
                        379,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateCoreViewFilter": [
                54,
                {
                    "input": [
                        380,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteCoreViewFilter": [
                54,
                {
                    "input": [
                        382,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyCoreViewFilter": [
                54,
                {
                    "input": [
                        383,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "updateCoreViewFieldGroup": [
                59,
                {
                    "input": [
                        384,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createCoreViewFieldGroup": [
                59,
                {
                    "input": [
                        386,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyCoreViewFieldGroups": [
                59,
                {
                    "inputs": [
                        386,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteCoreViewFieldGroup": [
                59,
                {
                    "input": [
                        387,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyCoreViewFieldGroup": [
                59,
                {
                    "input": [
                        388,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                60,
                {
                    "input": [
                        389,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                225,
                {
                    "input": [
                        392,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                225,
                {
                    "input": [
                        393,
                        "UpdateCommandMenuItemInput!"
                    ]
                }
            ],
            "deleteCommandMenuItem": [
                225,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createFrontComponent": [
                224,
                {
                    "input": [
                        394,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                224,
                {
                    "input": [
                        395,
                        "UpdateFrontComponentInput!"
                    ]
                }
            ],
            "deleteFrontComponent": [
                224,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createOneAgent": [
                25,
                {
                    "input": [
                        397,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                25,
                {
                    "input": [
                        398,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                25,
                {
                    "input": [
                        321,
                        "AgentIdInput!"
                    ]
                }
            ],
            "uploadAIChatFile": [
                148,
                {
                    "file": [
                        399,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkflowFile": [
                148,
                {
                    "file": [
                        399,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                148,
                {
                    "file": [
                        399,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                148,
                {
                    "file": [
                        399,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFile": [
                148,
                {
                    "file": [
                        399,
                        "Upload!"
                    ],
                    "fieldMetadataId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadFilesFieldFileByUniversalIdentifier": [
                148,
                {
                    "file": [
                        399,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkoutSession": [
                142,
                {
                    "recurringInterval": [
                        130,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        126,
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
                143
            ],
            "switchBillingPlan": [
                143
            ],
            "cancelSwitchBillingPlan": [
                143
            ],
            "cancelSwitchBillingInterval": [
                143
            ],
            "setMeteredSubscriptionPrice": [
                143,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                139
            ],
            "cancelSwitchMeteredPrice": [
                143
            ],
            "refreshEnterpriseValidityToken": [
                6
            ],
            "setEnterpriseKey": [
                144,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                216,
                {
                    "input": [
                        400,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                216,
                {
                    "input": [
                        401,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                216,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createApiKey": [
                2,
                {
                    "input": [
                        403,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        404,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        405,
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
                        406,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                29,
                {
                    "updateRoleInput": [
                        407,
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
                        409,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                27,
                {
                    "upsertPermissionFlagsInput": [
                        411,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                26,
                {
                    "upsertFieldPermissionsInput": [
                        412,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                181,
                {
                    "input": [
                        414,
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
            "skipSyncEmailOnboardingStep": [
                146
            ],
            "skipBookOnboardingStep": [
                146
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
                150,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                150,
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
                147,
                {
                    "input": [
                        417,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                6,
                {
                    "input": [
                        418,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                147,
                {
                    "input": [
                        419,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createOneField": [
                34,
                {
                    "input": [
                        420,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                34,
                {
                    "input": [
                        422,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                34,
                {
                    "input": [
                        424,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "deleteUser": [
                69
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
                151,
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
                66,
                {
                    "data": [
                        425,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                66,
                {
                    "data": [
                        426,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                66
            ],
            "checkCustomDomainValidRecords": [
                162
            ],
            "getAuthorizationUrlForSSO": [
                203,
                {
                    "input": [
                        427,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                212,
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
                209,
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
                201,
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
                211,
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
                206,
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
                206
            ],
            "generateTransientToken": [
                207
            ],
            "getAuthTokensFromLoginToken": [
                211,
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
                198,
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
                211,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                210,
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
                202,
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
                204,
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
                187,
                {
                    "input": [
                        428,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                7,
                {
                    "input": [
                        429,
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
                189,
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
                        431,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                5,
                {
                    "input": [
                        432,
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
                        399,
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
                196,
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
                196
            ],
            "deleteTwoFactorAuthenticationMethod": [
                195,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                197,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOIDCIdentityProvider": [
                194,
                {
                    "input": [
                        434,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                194,
                {
                    "input": [
                        435,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                190,
                {
                    "input": [
                        436,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                191,
                {
                    "input": [
                        437,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createWebhook": [
                235,
                {
                    "input": [
                        438,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                235,
                {
                    "input": [
                        439,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                235,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "createChatThread": [
                227
            ],
            "createSkill": [
                222,
                {
                    "input": [
                        441,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                222,
                {
                    "input": [
                        442,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                222,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                222,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                222,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                233,
                {
                    "turnId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                234,
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
            "duplicateDashboard": [
                314,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                281,
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
                306,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                304,
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
                        443,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                163,
                {
                    "input": [
                        445,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "userLookupAdminPanel": [
                272,
                {
                    "userIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updateWorkspaceFeatureFlag": [
                6,
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
                        6,
                        "Boolean!"
                    ]
                }
            ],
            "setAdminAiModelEnabled": [
                6,
                {
                    "modelId": [
                        1,
                        "String!"
                    ],
                    "enabled": [
                        6,
                        "Boolean!"
                    ]
                }
            ],
            "createDatabaseConfigVariable": [
                6,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        15,
                        "JSON!"
                    ]
                }
            ],
            "updateDatabaseConfigVariable": [
                6,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        15,
                        "JSON!"
                    ]
                }
            ],
            "deleteDatabaseConfigVariable": [
                6,
                {
                    "key": [
                        1,
                        "String!"
                    ]
                }
            ],
            "retryJobs": [
                265,
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
                260,
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
                305
            ],
            "disablePostgresProxy": [
                305
            ],
            "createPublicDomain": [
                293,
                {
                    "domain": [
                        1,
                        "String!"
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
                162,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createEmailingDomain": [
                295,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "driver": [
                        296,
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
                295,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneAppToken": [
                68,
                {
                    "input": [
                        446,
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
                6,
                {
                    "appRegistrationId": [
                        1,
                        "String!"
                    ],
                    "version": [
                        1
                    ]
                }
            ],
            "runWorkspaceMigration": [
                6,
                {
                    "workspaceMigration": [
                        448,
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
            "createDevelopmentApplication": [
                282,
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
                223,
                {
                    "applicationId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "syncApplication": [
                283,
                {
                    "manifest": [
                        15,
                        "JSON!"
                    ]
                }
            ],
            "uploadApplicationFile": [
                284,
                {
                    "file": [
                        399,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        452,
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
                223,
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
        "AnalyticsType": {},
        "CreatePageLayoutWidgetInput": {
            "pageLayoutTabId": [
                3
            ],
            "title": [
                1
            ],
            "type": [
                76
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                342
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
        "UpdatePageLayoutWidgetInput": {
            "title": [
                1
            ],
            "type": [
                76
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                342
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
            "__typename": [
                1
            ]
        },
        "CreatePageLayoutInput": {
            "name": [
                1
            ],
            "type": [
                112
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
                112
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
                112
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                349
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
            "widgets": [
                350
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
                76
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                342
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
            "toolInputSchema": [
                15
            ],
            "isTool": [
                6
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
                354
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
            "toolInputSchema": [
                15
            ],
            "handlerName": [
                1
            ],
            "sourceHandlerPath": [
                1
            ],
            "isTool": [
                6
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
            "__typename": [
                1
            ]
        },
        "CreateOneObjectInput": {
            "object": [
                356
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
                359
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
            "__typename": [
                1
            ]
        },
        "UpdateViewFieldInput": {
            "id": [
                3
            ],
            "update": [
                361
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
                51
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
                51
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
                61
            ],
            "key": [
                62
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
                63
            ],
            "kanbanAggregateOperation": [
                51
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                64
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "mainGroupByFieldMetadataId": [
                3
            ],
            "visibility": [
                65
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
                61
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
                63
            ],
            "kanbanAggregateOperation": [
                51
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                64
            ],
            "calendarFieldMetadataId": [
                3
            ],
            "visibility": [
                65
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
        "CreateViewSortInput": {
            "id": [
                3
            ],
            "fieldMetadataId": [
                3
            ],
            "direction": [
                58
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
                369
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                58
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
                374
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
        "CreateViewFilterGroupInput": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                53
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
                53
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
                55
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
                381
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
                55
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
                385
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
                390
            ],
            "fields": [
                391
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
                391
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
                6
            ],
            "position": [
                11
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
                224
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
                226
            ],
            "conditionalAvailabilityExpression": [
                1
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
                226
            ],
            "availabilityObjectMetadataId": [
                3
            ],
            "engineComponentKey": [
                224
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
                396
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
        "Upload": {},
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
            "color": [
                1
            ],
            "folderId": [
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
                402
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
                408
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
                410
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
                18
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
                413
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
                415
            ],
            "predicateGroups": [
                416
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
        "CreateOneFieldMetadataInput": {
            "field": [
                421
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                35
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
            "isLabelSyncedWithName": [
                6
            ],
            "objectMetadataId": [
                3
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
                423
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
            "autoEnableNewAiModels": [
                6
            ],
            "disabledAiModelIds": [
                1
            ],
            "enabledAiModelIds": [
                1
            ],
            "useRecommendedModels": [
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
            "description": [
                1
            ],
            "logoUrl": [
                1
            ],
            "author": [
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
            "websiteUrl": [
                1
            ],
            "termsUrl": [
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
                430
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationPayload": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "logoUrl": [
                1
            ],
            "author": [
                1
            ],
            "oAuthRedirectUris": [
                1
            ],
            "oAuthScopes": [
                1
            ],
            "websiteUrl": [
                1
            ],
            "termsUrl": [
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
                433
            ],
            "__typename": [
                1
            ]
        },
        "UpdateApplicationRegistrationVariablePayload": {
            "value": [
                1
            ],
            "description": [
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
                155
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
                440
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
                6
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
            "IMAP": [
                444
            ],
            "SMTP": [
                444
            ],
            "CALDAV": [
                444
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
                447
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
                449
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceMigrationDeleteActionInput": {
            "type": [
                450
            ],
            "metadataName": [
                451
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
        "FileFolder": {},
        "Subscription": {
            "onDbEvent": [
                121,
                {
                    "input": [
                        454,
                        "OnDbEventInput!"
                    ]
                }
            ],
            "onEventSubscription": [
                120,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                219,
                {
                    "input": [
                        455,
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
                117
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
