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
        28,
        35,
        36,
        37,
        38,
        41,
        43,
        51,
        53,
        55,
        57,
        60,
        63,
        64,
        65,
        66,
        67,
        69,
        70,
        72,
        73,
        80,
        83,
        88,
        89,
        92,
        93,
        95,
        98,
        99,
        109,
        123,
        129,
        130,
        131,
        133,
        142,
        144,
        152,
        155,
        157,
        172,
        179,
        180,
        187,
        190,
        193,
        205,
        222,
        224,
        229,
        232,
        241,
        247,
        283,
        285,
        286,
        287,
        288,
        289,
        290,
        291,
        298,
        299,
        302,
        339,
        345,
        347,
        348,
        349,
        350,
        352,
        354,
        367,
        374,
        381,
        382,
        494,
        516
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
                128
            ],
            "on_BillingLicensedProduct": [
                137
            ],
            "on_BillingMeteredProduct": [
                138
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
                47
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
            "applicationTokenPair": [
                13
            ],
            "applicationVariables": [
                5
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
                25
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
            "fields": [
                236,
                {
                    "paging": [
                        26,
                        "CursorPaging!"
                    ],
                    "filter": [
                        29,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                237,
                {
                    "paging": [
                        26,
                        "CursorPaging!"
                    ],
                    "filter": [
                        32,
                        "IndexFilter!"
                    ]
                }
            ],
            "fieldsList": [
                223
            ],
            "indexMetadataList": [
                231
            ],
            "searchFieldMetadataList": [
                239
            ],
            "__typename": [
                1
            ]
        },
        "ObjectOpenRecordIn": {},
        "CursorPaging": {
            "before": [
                28
            ],
            "after": [
                28
            ],
            "first": [
                27
            ],
            "last": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                29
            ],
            "or": [
                29
            ],
            "id": [
                30
            ],
            "isActive": [
                31
            ],
            "isSystem": [
                31
            ],
            "isUIEditable": [
                31
            ],
            "isUIReadOnly": [
                31
            ],
            "objectMetadataId": [
                30
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
                32
            ],
            "or": [
                32
            ],
            "id": [
                30
            ],
            "isCustom": [
                31
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
                33
            ],
            "userEmail": [
                1
            ],
            "colorScheme": [
                1
            ],
            "openRecordIn": [
                35
            ],
            "avatarUrl": [
                1
            ],
            "locale": [
                1
            ],
            "calendarStartDay": [
                27
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                36
            ],
            "timeFormat": [
                37
            ],
            "roles": [
                47
            ],
            "userWorkspaceId": [
                4
            ],
            "numberFormat": [
                38
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
                41
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
                43
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
                42
            ],
            "rowLevelPermissionPredicateGroups": [
                40
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
                34
            ],
            "agents": [
                11
            ],
            "apiKeys": [
                46
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
                45
            ],
            "objectPermissions": [
                44
            ],
            "fieldPermissions": [
                39
            ],
            "rowLevelPermissionPredicates": [
                42
            ],
            "rowLevelPermissionPredicateGroups": [
                40
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
                47
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
                24
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
                71
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
                51
            ],
            "objectPermissions": [
                44
            ],
            "objectsPermissions": [
                44
            ],
            "twoFactorAuthenticationMethodSummary": [
                49
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
            "universalIdentifier": [
                4
            ],
            "applicationId": [
                4
            ],
            "isSystemSideEffect": [
                3
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
                53
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
                55
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
                57
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
                60
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
                52
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
            "universalIdentifier": [
                4
            ],
            "applicationId": [
                4
            ],
            "isSystemSideEffect": [
                3
            ],
            "name": [
                1
            ],
            "objectMetadataId": [
                4
            ],
            "type": [
                63
            ],
            "key": [
                64
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
                65
            ],
            "kanbanAggregateOperation": [
                53
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
                27
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
                66
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
                52
            ],
            "viewFilters": [
                56
            ],
            "viewFilterGroups": [
                54
            ],
            "viewSorts": [
                59
            ],
            "viewGroups": [
                58
            ],
            "viewFieldGroups": [
                61
            ],
            "visibility": [
                67
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
                69
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
                70
            ],
            "views": [
                62
            ],
            "viewFields": [
                52
            ],
            "viewFilters": [
                56
            ],
            "viewFilterGroups": [
                54
            ],
            "viewGroups": [
                58
            ],
            "viewSorts": [
                59
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
                47
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
                48
            ],
            "featureFlags": [
                171
            ],
            "billingSubscriptions": [
                141
            ],
            "installedApplications": [
                48
            ],
            "currentBillingSubscription": [
                141
            ],
            "billingCustomer": [
                140
            ],
            "billingEntitlements": [
                240
            ],
            "hasValidSignedEnterpriseKey": [
                3
            ],
            "hasValidEnterpriseValidityToken": [
                3
            ],
            "workspaceUrls": [
                173
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
                34
            ],
            "userWorkspaces": [
                50
            ],
            "onboardingStatus": [
                72
            ],
            "currentWorkspace": [
                68
            ],
            "currentUserWorkspace": [
                50
            ],
            "userVars": [
                73
            ],
            "workspaceMembers": [
                34
            ],
            "deletedWorkspaceMembers": [
                215
            ],
            "hasPassword": [
                3
            ],
            "supportUserHash": [
                1
            ],
            "isWorkspaceCreator": [
                3
            ],
            "workspaces": [
                50
            ],
            "availableWorkspaces": [
                214
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
            "universalIdentifier": [
                4
            ],
            "isSystemSideEffect": [
                3
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
                80
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                78
            ],
            "position": [
                81
            ],
            "configuration": [
                86
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
                82
            ],
            "on_PageLayoutWidgetVerticalListPosition": [
                84
            ],
            "on_PageLayoutWidgetCanvasPosition": [
                85
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetGridPosition": {
            "layoutMode": [
                83
            ],
            "row": [
                27
            ],
            "column": [
                27
            ],
            "rowSpan": [
                27
            ],
            "columnSpan": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTabLayoutMode": {},
        "PageLayoutWidgetVerticalListPosition": {
            "layoutMode": [
                83
            ],
            "index": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutWidgetCanvasPosition": {
            "layoutMode": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfiguration": {
            "on_AggregateChartConfiguration": [
                87
            ],
            "on_StandaloneRichTextConfiguration": [
                90
            ],
            "on_PieChartConfiguration": [
                91
            ],
            "on_LineChartConfiguration": [
                94
            ],
            "on_IframeConfiguration": [
                96
            ],
            "on_BarChartConfiguration": [
                97
            ],
            "on_CalendarConfiguration": [
                100
            ],
            "on_FrontComponentConfiguration": [
                101
            ],
            "on_EmailsConfiguration": [
                102
            ],
            "on_EmailThreadConfiguration": [
                103
            ],
            "on_CallRecordingSummaryConfiguration": [
                104
            ],
            "on_CallRecordingTranscriptConfiguration": [
                105
            ],
            "on_MessageCampaignBodyConfiguration": [
                106
            ],
            "on_MessageCampaignDetailsConfiguration": [
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
                88
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                53
            ],
            "label": [
                1
            ],
            "displayDataLabel": [
                3
            ],
            "numberFormat": [
                89
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
                27
            ],
            "prefix": [
                1
            ],
            "suffix": [
                1
            ],
            "ratioAggregateConfig": [
                76
            ],
            "__typename": [
                1
            ]
        },
        "WidgetConfigurationType": {},
        "ChartNumberFormat": {},
        "StandaloneRichTextConfiguration": {
            "configurationType": [
                88
            ],
            "body": [
                77
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "configurationType": [
                88
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                53
            ],
            "groupByFieldMetadataId": [
                4
            ],
            "groupBySubFieldName": [
                1
            ],
            "dateGranularity": [
                92
            ],
            "orderBy": [
                93
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
                89
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
                27
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordGroupByDateGranularity": {},
        "GraphOrderBy": {},
        "LineChartConfiguration": {
            "configurationType": [
                88
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                53
            ],
            "primaryAxisGroupByFieldMetadataId": [
                4
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                92
            ],
            "primaryAxisOrderBy": [
                93
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
                92
            ],
            "secondaryAxisOrderBy": [
                93
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
                95
            ],
            "displayDataLabel": [
                3
            ],
            "displayLegend": [
                3
            ],
            "numberFormat": [
                89
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
                27
            ],
            "__typename": [
                1
            ]
        },
        "AxisNameDisplay": {},
        "IframeConfiguration": {
            "configurationType": [
                88
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
                88
            ],
            "aggregateFieldMetadataId": [
                4
            ],
            "aggregateOperation": [
                53
            ],
            "primaryAxisGroupByFieldMetadataId": [
                4
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisDateGranularity": [
                92
            ],
            "primaryAxisOrderBy": [
                93
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
                92
            ],
            "secondaryAxisOrderBy": [
                93
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
                95
            ],
            "displayDataLabel": [
                3
            ],
            "displayLegend": [
                3
            ],
            "numberFormat": [
                89
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
                98
            ],
            "layout": [
                99
            ],
            "isCumulative": [
                3
            ],
            "timezone": [
                1
            ],
            "firstDayOfTheWeek": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "BarChartGroupMode": {},
        "BarChartLayout": {},
        "CalendarConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "FrontComponentConfiguration": {
            "configurationType": [
                88
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
                88
            ],
            "__typename": [
                1
            ]
        },
        "EmailThreadConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingSummaryConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "CallRecordingTranscriptConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignBodyConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "MessageCampaignDetailsConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "FieldConfiguration": {
            "configurationType": [
                88
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
                88
            ],
            "__typename": [
                1
            ]
        },
        "FieldsConfiguration": {
            "configurationType": [
                88
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
                88
            ],
            "__typename": [
                1
            ]
        },
        "NotesConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "TasksConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "TimelineConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "ViewConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "RecordTableConfiguration": {
            "configurationType": [
                88
            ],
            "viewId": [
                1
            ],
            "recordLimit": [
                27
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRunConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionConfiguration": {
            "configurationType": [
                88
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "id": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "isSystemSideEffect": [
                3
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
                79
            ],
            "icon": [
                1
            ],
            "layoutMode": [
                83
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
                123
            ],
            "objectMetadataId": [
                4
            ],
            "tabs": [
                121
            ],
            "defaultTabToFocusOnMobileAndSidePanelId": [
                4
            ],
            "universalIdentifier": [
                4
            ],
            "applicationId": [
                4
            ],
            "isSystemSideEffect": [
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
                124
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
                126
            ],
            "__typename": [
                1
            ]
        },
        "BillingProductMetadata": {
            "planKey": [
                129
            ],
            "priceUsageBased": [
                130
            ],
            "productKey": [
                131
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
                133
            ],
            "unitAmount": [
                16
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                130
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
                134
            ],
            "recurringInterval": [
                133
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                130
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
                128
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
                128
            ],
            "prices": [
                132
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
                128
            ],
            "prices": [
                135
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
                142
            ],
            "interval": [
                133
            ],
            "billingSubscriptionItems": [
                139
            ],
            "currentPeriodEnd": [
                6
            ],
            "metadata": [
                5
            ],
            "phases": [
                127
            ],
            "cancelAt": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
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
                144
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
                152
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
                150
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
                155
            ],
            "metadataName": [
                1
            ],
            "recordId": [
                1
            ],
            "properties": [
                153
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
                157
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
                153
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
                156
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
                158
            ],
            "metadataEvents": [
                154
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
                142
            ],
            "hasPaymentMethod": [
                3
            ],
            "billingPortalUrl": [
                1
            ],
            "currentBillingSubscription": [
                141
            ],
            "billingSubscriptions": [
                141
            ],
            "__typename": [
                1
            ]
        },
        "BillingResourceCreditUsage": {
            "productKey": [
                131
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
                129
            ],
            "baseProducts": [
                137
            ],
            "resourceCreditProducts": [
                137
            ],
            "meteredProducts": [
                138
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
                141
            ],
            "billingSubscriptions": [
                141
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
                169
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlag": {
            "key": [
                172
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
                27
            ],
            "__typename": [
                1
            ]
        },
        "ApplicationRegistrationStats": {
            "activeInstalls": [
                27
            ],
            "mostInstalledVersion": [
                1
            ],
            "versionDistribution": [
                175
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
                173
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
                187
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
                185
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
                172
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
                181
            ],
            "billing": [
                188
            ],
            "aiModels": [
                186
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
                189
            ],
            "isAttachmentPreviewEnabled": [
                3
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
                3
            ],
            "publicFeatureFlags": [
                196
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
                74
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
                205
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
                4
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
                4
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
                209
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
                4
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
                173
            ],
            "logo": [
                1
            ],
            "sso": [
                212
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                213
            ],
            "availableWorkspacesForSignUp": [
                213
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
                33
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
                217
            ],
            "fieldPermissions": [
                218
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
                219
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
                222
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
        "Field": {
            "id": [
                4
            ],
            "universalIdentifier": [
                1
            ],
            "type": [
                224
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
            "object": [
                24
            ],
            "relation": [
                228
            ],
            "morphRelations": [
                228
            ],
            "__typename": [
                1
            ]
        },
        "FieldMetadataType": {},
        "PageInfo": {
            "hasNextPage": [
                3
            ],
            "hasPreviousPage": [
                3
            ],
            "startCursor": [
                28
            ],
            "endCursor": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                223
            ],
            "cursor": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "FieldConnection": {
            "pageInfo": [
                225
            ],
            "edges": [
                226
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                229
            ],
            "sourceObjectMetadata": [
                24
            ],
            "targetObjectMetadata": [
                24
            ],
            "sourceFieldMetadata": [
                223
            ],
            "targetFieldMetadata": [
                223
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
                232
            ],
            "createdAt": [
                6
            ],
            "updatedAt": [
                6
            ],
            "indexFieldMetadataList": [
                230
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "IndexEdge": {
            "node": [
                231
            ],
            "cursor": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                24
            ],
            "cursor": [
                28
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                225
            ],
            "edges": [
                234
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                225
            ],
            "edges": [
                226
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                225
            ],
            "edges": [
                233
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
                27
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
        "BillingEntitlement": {
            "key": [
                241
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
                242
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
                42
            ],
            "predicateGroups": [
                40
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
                247
            ],
            "__typename": [
                1
            ]
        },
        "EmailConnectionSecurity": {},
        "PublicImapSmtpCaldavConnectionParameters": {
            "IMAP": [
                246
            ],
            "SMTP": [
                246
            ],
            "CALDAV": [
                246
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
                248
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
                254
            ],
            "availableWorkspaces": [
                214
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
                173
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
                259
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
                173
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
                254
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
                259
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
                273
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
                273
            ],
            "periodStart": [
                6
            ],
            "periodEnd": [
                6
            ],
            "userDailyUsage": [
                274
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
                283
            ],
            "verificationRecords": [
                281
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
                285
            ],
            "handle": [
                1
            ],
            "displayName": [
                1
            ],
            "type": [
                286
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                287
            ],
            "messageFolderImportPolicy": [
                288
            ],
            "excludeNonProfessionalEmails": [
                3
            ],
            "excludeGroupEmails": [
                3
            ],
            "pendingGroupEmailsAction": [
                289
            ],
            "isSyncEnabled": [
                3
            ],
            "syncedAt": [
                6
            ],
            "syncStatus": [
                290
            ],
            "syncStage": [
                291
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
                249
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
                284
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
                27
            ],
            "withoutEmail": [
                27
            ],
            "duplicateEmails": [
                27
            ],
            "globallyUnsubscribed": [
                27
            ],
            "topicUnsubscribed": [
                27
            ],
            "sendable": [
                27
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
                27
            ],
            "deduped": [
                27
            ],
            "overCap": [
                27
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
                27
            ],
            "skipped": [
                295
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
                298
            ],
            "source": [
                299
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
                297
            ],
            "totalCount": [
                27
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
                302
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
                304
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
                247
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
                306
            ],
            "SMTP": [
                306
            ],
            "CALDAV": [
                306
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
                307
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
                27
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
                316
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
                99
            ],
            "groupMode": [
                98
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
                318
            ],
            "__typename": [
                1
            ]
        },
        "LineChartData": {
            "series": [
                319
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
                321
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
                326
            ],
            "totalCount": [
                27
            ],
            "pageInfo": [
                327
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
                312
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
                205
            ],
            "title": [
                1
            ],
            "totalInputTokens": [
                27
            ],
            "totalOutputTokens": [
                27
            ],
            "contextWindowTokens": [
                27
            ],
            "conversationSize": [
                27
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
                27
            ],
            "__typename": [
                1
            ]
        },
        "AiSystemPromptPreview": {
            "sections": [
                332
            ],
            "estimatedTokenCount": [
                27
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
                27
            ],
            "error": [
                334
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
                339
            ],
            "thread": [
                331
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
                27
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
                340
            ],
            "messages": [
                330
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
                27
            ],
            "skillsCount": [
                27
            ],
            "toolsCount": [
                27
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
                345
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
                347
            ],
            "syncStage": [
                348
            ],
            "visibility": [
                349
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                350
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
                352
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
                354
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
                63
            ],
            "key": [
                64
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
                355
            ],
            "views": [
                356
            ],
            "collectionHashes": [
                353
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "navigationMenuItems": [
                151
            ],
            "navigationMenuItem": [
                151,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "applicationSdkClientChecksums": [
                75,
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
                146
            ],
            "getViewFilterGroups": [
                54,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilterGroup": [
                54,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFilters": [
                56,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewFilter": [
                56,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViews": [
                62,
                {
                    "objectMetadataId": [
                        1
                    ],
                    "viewTypes": [
                        63,
                        "[ViewType!]"
                    ]
                }
            ],
            "getView": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewSorts": [
                59,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewSort": [
                59,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFields": [
                52,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewField": [
                52,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroups": [
                61,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getViewFieldGroup": [
                61,
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
                47
            ],
            "apiKey": [
                7,
                {
                    "input": [
                        359,
                        "GetApiKeyInput!"
                    ]
                }
            ],
            "currentUserSessions": [
                160
            ],
            "getInviteSuggestions": [
                167
            ],
            "applicationConnectionProviders": [
                125,
                {
                    "applicationId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "billingPortalSession": [
                165,
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
                163
            ],
            "getResourceCreditUsage": [
                162
            ],
            "findWorkspaceInvitations": [
                169
            ],
            "getApprovedAccessDomains": [
                147
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
            "getPageLayoutWidgets": [
                79,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                79,
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
                        360,
                        "AgentIdInput!"
                    ]
                }
            ],
            "objects": [
                235,
                {
                    "paging": [
                        26,
                        "CursorPaging!"
                    ],
                    "filter": [
                        361,
                        "ObjectFilter!"
                    ]
                }
            ],
            "object": [
                24,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "objectRecordCounts": [
                238
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
            "findOneLogicFunction": [
                22,
                {
                    "input": [
                        362,
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
                        362,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "getLogicFunctionSourceCode": [
                1,
                {
                    "input": [
                        362,
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
                68
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
                        4,
                        "UUID!"
                    ]
                }
            ],
            "findApplicationRegistrationByClientId": [
                202,
                {
                    "clientId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationByUniversalIdentifier": [
                74,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findManyApplicationRegistrations": [
                74
            ],
            "findOneApplicationRegistration": [
                74,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationStats": [
                176,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findApplicationRegistrationVariables": [
                174,
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
                200,
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
                48
            ],
            "findOneApplication": [
                48,
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
                216,
                {
                    "universalIdentifiers": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "findMarketplaceAppDetail": [
                220,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "publicMarketplaceApps": [
                216,
                {
                    "isVetted": [
                        3,
                        "Boolean!"
                    ]
                }
            ],
            "publicMarketplaceAppDetail": [
                220,
                {
                    "universalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "fields": [
                227,
                {
                    "paging": [
                        26,
                        "CursorPaging!"
                    ],
                    "filter": [
                        29,
                        "FieldFilter!"
                    ]
                }
            ],
            "field": [
                223,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "getViewGroups": [
                58,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getViewGroup": [
                58,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getRoles": [
                47
            ],
            "previewMessageCampaignAudience": [
                293,
                {
                    "input": [
                        363,
                        "PreviewMessageCampaignAudienceInput!"
                    ]
                }
            ],
            "messageSuppressions": [
                300,
                {
                    "input": [
                        364,
                        "FindMessageSuppressionsInput!"
                    ]
                }
            ],
            "unsubscribeTopics": [
                301
            ],
            "myMessageChannels": [
                284,
                {
                    "connectedAccountId": [
                        4
                    ]
                }
            ],
            "getEmailingDomains": [
                282
            ],
            "myConnectedAccounts": [
                249
            ],
            "getToolIndex": [
                311
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
                310
            ],
            "webhook": [
                310,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "myMessageFolders": [
                351,
                {
                    "messageChannelId": [
                        4
                    ]
                }
            ],
            "myCalendarChannels": [
                346,
                {
                    "connectedAccountId": [
                        4
                    ]
                }
            ],
            "minimalMetadata": [
                357
            ],
            "appKeyValue": [
                344,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "scope": [
                        345
                    ]
                }
            ],
            "appConnections": [
                204,
                {
                    "filter": [
                        365
                    ]
                }
            ],
            "appConnection": [
                204,
                {
                    "id": [
                        205,
                        "ID!"
                    ]
                }
            ],
            "findWorkspaceAiStats": [
                342
            ],
            "chatThreads": [
                331
            ],
            "chatThread": [
                331,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "chatMessages": [
                330,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "chatStreamCatchupChunks": [
                335,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "getAiSystemPromptPreview": [
                333
            ],
            "skills": [
                329
            ],
            "skill": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "agentTurns": [
                341,
                {
                    "agentId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "checkUserExists": [
                269,
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
                270,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                68,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "checkWorkspaceSubdomainAvailability": [
                264,
                {
                    "subdomain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getWorkspaceCreationDefaults": [
                265
            ],
            "validatePasswordResetToken": [
                262,
                {
                    "passwordResetToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "currentUser": [
                71
            ],
            "getSSOIdentityProviders": [
                210
            ],
            "eventLogs": [
                328,
                {
                    "input": [
                        366,
                        "EventLogQueryInput!"
                    ]
                }
            ],
            "pieChartData": [
                322,
                {
                    "input": [
                        370,
                        "PieChartDataInput!"
                    ]
                }
            ],
            "lineChartData": [
                320,
                {
                    "input": [
                        371,
                        "LineChartDataInput!"
                    ]
                }
            ],
            "barChartData": [
                317,
                {
                    "input": [
                        372,
                        "BarChartDataInput!"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                308,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                303,
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
                305,
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
                275,
                {
                    "input": [
                        373
                    ]
                }
            ],
            "findManyPublicDomains": [
                280
            ],
            "currentUserApplicationAuthorizations": [
                276
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
                361
            ],
            "or": [
                361
            ],
            "id": [
                30
            ],
            "isActive": [
                31
            ],
            "isRemote": [
                31
            ],
            "isSearchable": [
                31
            ],
            "isSystem": [
                31
            ],
            "isUICreatable": [
                31
            ],
            "isUIEditable": [
                31
            ],
            "isUIReadOnly": [
                31
            ],
            "__typename": [
                1
            ]
        },
        "LogicFunctionIdInput": {
            "id": [
                205
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
                298
            ],
            "searchTerm": [
                1
            ],
            "unsubscribeTopicId": [
                4
            ],
            "limit": [
                27
            ],
            "offset": [
                27
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
                367
            ],
            "filters": [
                368
            ],
            "first": [
                27
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
                369
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
                374
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
                        376,
                        "AddQuerySubscriptionInput!"
                    ]
                }
            ],
            "removeQueryFromEventStream": [
                3,
                {
                    "input": [
                        377,
                        "RemoveQueryFromEventStreamInput!"
                    ]
                }
            ],
            "createManyNavigationMenuItems": [
                151,
                {
                    "inputs": [
                        378,
                        "[CreateNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "createNavigationMenuItem": [
                151,
                {
                    "input": [
                        378,
                        "CreateNavigationMenuItemInput!"
                    ]
                }
            ],
            "updateManyNavigationMenuItems": [
                151,
                {
                    "inputs": [
                        379,
                        "[UpdateOneNavigationMenuItemInput!]!"
                    ]
                }
            ],
            "updateNavigationMenuItem": [
                151,
                {
                    "input": [
                        379,
                        "UpdateOneNavigationMenuItemInput!"
                    ]
                }
            ],
            "deleteManyNavigationMenuItems": [
                151,
                {
                    "ids": [
                        4,
                        "[UUID!]!"
                    ]
                }
            ],
            "deleteNavigationMenuItem": [
                151,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createFileUpload": [
                149,
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
                        381,
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
                148,
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
                145
            ],
            "setEnterpriseKey": [
                145,
                {
                    "enterpriseKey": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadEmailAttachmentFile": [
                148,
                {
                    "file": [
                        382,
                        "Upload!"
                    ]
                }
            ],
            "uploadAiChatFile": [
                148,
                {
                    "file": [
                        382,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkflowFile": [
                148,
                {
                    "file": [
                        382,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                148,
                {
                    "file": [
                        382,
                        "Upload!"
                    ]
                }
            ],
            "uploadWorkspaceMemberProfilePicture": [
                148,
                {
                    "file": [
                        382,
                        "Upload!"
                    ]
                }
            ],
            "uploadFilesFieldFile": [
                148,
                {
                    "file": [
                        382,
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
                        382,
                        "Upload!"
                    ],
                    "fieldMetadataUniversalIdentifier": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createViewFilterGroup": [
                54,
                {
                    "input": [
                        383,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateViewFilterGroup": [
                54,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        384,
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
                56,
                {
                    "input": [
                        385,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateViewFilter": [
                56,
                {
                    "input": [
                        386,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteViewFilter": [
                56,
                {
                    "input": [
                        388,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyViewFilter": [
                56,
                {
                    "input": [
                        389,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "createView": [
                62,
                {
                    "input": [
                        390,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateView": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        391,
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
                62,
                {
                    "input": [
                        392,
                        "UpsertViewWidgetInput!"
                    ]
                }
            ],
            "createViewSort": [
                59,
                {
                    "input": [
                        398,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateViewSort": [
                59,
                {
                    "input": [
                        399,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteViewSort": [
                3,
                {
                    "input": [
                        401,
                        "DeleteViewSortInput!"
                    ]
                }
            ],
            "destroyViewSort": [
                3,
                {
                    "input": [
                        402,
                        "DestroyViewSortInput!"
                    ]
                }
            ],
            "updateViewField": [
                52,
                {
                    "input": [
                        403,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createViewField": [
                52,
                {
                    "input": [
                        405,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "createManyViewFields": [
                52,
                {
                    "inputs": [
                        405,
                        "[CreateViewFieldInput!]!"
                    ]
                }
            ],
            "deleteViewField": [
                52,
                {
                    "input": [
                        406,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyViewField": [
                52,
                {
                    "input": [
                        407,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "updateViewFieldGroup": [
                61,
                {
                    "input": [
                        408,
                        "UpdateViewFieldGroupInput!"
                    ]
                }
            ],
            "createViewFieldGroup": [
                61,
                {
                    "input": [
                        410,
                        "CreateViewFieldGroupInput!"
                    ]
                }
            ],
            "createManyViewFieldGroups": [
                61,
                {
                    "inputs": [
                        410,
                        "[CreateViewFieldGroupInput!]!"
                    ]
                }
            ],
            "deleteViewFieldGroup": [
                61,
                {
                    "input": [
                        411,
                        "DeleteViewFieldGroupInput!"
                    ]
                }
            ],
            "destroyViewFieldGroup": [
                61,
                {
                    "input": [
                        412,
                        "DestroyViewFieldGroupInput!"
                    ]
                }
            ],
            "upsertFieldsWidget": [
                62,
                {
                    "input": [
                        413,
                        "UpsertFieldsWidgetInput!"
                    ]
                }
            ],
            "createApiKey": [
                7,
                {
                    "input": [
                        416,
                        "CreateApiKeyInput!"
                    ]
                }
            ],
            "updateApiKey": [
                7,
                {
                    "input": [
                        417,
                        "UpdateApiKeyInput!"
                    ]
                }
            ],
            "revokeApiKey": [
                7,
                {
                    "input": [
                        418,
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
                27
            ],
            "skipSyncEmailOnboardingStep": [
                168
            ],
            "completeBookCallOnboardingStep": [
                168
            ],
            "triggerInstallAppsOnboardingStep": [
                168,
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
                165,
                {
                    "recurringInterval": [
                        133,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        129,
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
                164,
                {
                    "recurringInterval": [
                        133,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        129,
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
                164
            ],
            "switchSubscriptionInterval": [
                166
            ],
            "switchBillingPlan": [
                166
            ],
            "cancelSwitchBillingPlan": [
                166
            ],
            "cancelSwitchBillingInterval": [
                166
            ],
            "setResourceCreditSubscriptionPrice": [
                166,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                161
            ],
            "cancelSwitchResourceCreditPrice": [
                166
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
                170,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                170,
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
                147,
                {
                    "input": [
                        419,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                3,
                {
                    "input": [
                        420,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                147,
                {
                    "input": [
                        421,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                121,
                {
                    "input": [
                        422,
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
                        423,
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
                122,
                {
                    "input": [
                        424,
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
                        425,
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
                122,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        426,
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
                79,
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
            "createPageLayoutWidget": [
                79,
                {
                    "input": [
                        430,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                79,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        431,
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
                        432,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                11,
                {
                    "input": [
                        433,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                11,
                {
                    "input": [
                        360,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createOneObject": [
                24,
                {
                    "input": [
                        434,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "deleteOneObject": [
                24,
                {
                    "input": [
                        436,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                24,
                {
                    "input": [
                        437,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "createOneIndex": [
                231,
                {
                    "input": [
                        439,
                        "CreateOneIndexInput!"
                    ]
                }
            ],
            "deleteOneIndex": [
                231,
                {
                    "input": [
                        442,
                        "DeleteOneIndexInput!"
                    ]
                }
            ],
            "deleteOneLogicFunction": [
                22,
                {
                    "input": [
                        362,
                        "LogicFunctionIdInput!"
                    ]
                }
            ],
            "createOneLogicFunction": [
                22,
                {
                    "input": [
                        443,
                        "CreateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "executeOneLogicFunction": [
                143,
                {
                    "input": [
                        444,
                        "ExecuteOneLogicFunctionInput!"
                    ]
                }
            ],
            "updateOneLogicFunction": [
                3,
                {
                    "input": [
                        445,
                        "UpdateLogicFunctionFromSourceInput!"
                    ]
                }
            ],
            "createCommandMenuItem": [
                15,
                {
                    "input": [
                        447,
                        "CreateCommandMenuItemInput!"
                    ]
                }
            ],
            "updateCommandMenuItem": [
                15,
                {
                    "input": [
                        448,
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
                        449,
                        "CreateFrontComponentInput!"
                    ]
                }
            ],
            "updateFrontComponent": [
                14,
                {
                    "input": [
                        450,
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
                68,
                {
                    "data": [
                        452,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                68,
                {
                    "data": [
                        453,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                68
            ],
            "checkCustomDomainValidRecords": [
                243
            ],
            "enrichWorkspaceCompany": [
                221
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
                201,
                {
                    "input": [
                        454,
                        "CreateApplicationRegistrationInput!"
                    ]
                }
            ],
            "updateApplicationRegistration": [
                74,
                {
                    "input": [
                        455,
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
                203,
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
                        457,
                        "CreateApplicationRegistrationVariableInput!"
                    ]
                }
            ],
            "updateApplicationRegistrationVariable": [
                2,
                {
                    "input": [
                        458,
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
                74,
                {
                    "file": [
                        382,
                        "Upload!"
                    ],
                    "universalIdentifier": [
                        1
                    ]
                }
            ],
            "claimApplicationRegistrationOwnership": [
                74,
                {
                    "applicationRegistrationId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "transferApplicationRegistrationOwnership": [
                74,
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
                48,
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
                48,
                {
                    "id": [
                        4,
                        "UUID!"
                    ],
                    "input": [
                        460,
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
                223,
                {
                    "input": [
                        461,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                223,
                {
                    "input": [
                        463,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                223,
                {
                    "input": [
                        465,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "createViewGroup": [
                58,
                {
                    "input": [
                        466,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "createManyViewGroups": [
                58,
                {
                    "inputs": [
                        466,
                        "[CreateViewGroupInput!]!"
                    ]
                }
            ],
            "updateViewGroup": [
                58,
                {
                    "input": [
                        467,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "updateManyViewGroups": [
                58,
                {
                    "inputs": [
                        467,
                        "[UpdateViewGroupInput!]!"
                    ]
                }
            ],
            "deleteViewGroup": [
                58,
                {
                    "input": [
                        469,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyViewGroup": [
                58,
                {
                    "input": [
                        470,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                34,
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
                47,
                {
                    "createRoleInput": [
                        471,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                47,
                {
                    "updateRoleInput": [
                        472,
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
                44,
                {
                    "upsertObjectPermissionsInput": [
                        474,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                45,
                {
                    "upsertPermissionFlagsInput": [
                        476,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                39,
                {
                    "upsertFieldPermissionsInput": [
                        477,
                        "UpsertFieldPermissionsInput!"
                    ]
                }
            ],
            "upsertRowLevelPermissionPredicates": [
                244,
                {
                    "input": [
                        479,
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
                294,
                {
                    "input": [
                        482,
                        "SendEmailViaDomainInput!"
                    ]
                }
            ],
            "sendMessageCampaign": [
                296,
                {
                    "input": [
                        483,
                        "SendMessageCampaignInput!"
                    ]
                }
            ],
            "sendMessageCampaignTest": [
                294,
                {
                    "input": [
                        484,
                        "SendMessageCampaignTestInput!"
                    ]
                }
            ],
            "createUnsubscribeTopic": [
                301,
                {
                    "input": [
                        485,
                        "CreateUnsubscribeTopicInput!"
                    ]
                }
            ],
            "updateUnsubscribeTopic": [
                301,
                {
                    "input": [
                        486,
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
                284,
                {
                    "input": [
                        487,
                        "UpdateMessageChannelInput!"
                    ]
                }
            ],
            "createEmailGroupChannel": [
                292,
                {
                    "input": [
                        489,
                        "CreateEmailGroupChannelInput!"
                    ]
                }
            ],
            "updateEmailGroupChannel": [
                284,
                {
                    "input": [
                        490,
                        "UpdateEmailGroupChannelInput!"
                    ]
                }
            ],
            "deleteEmailGroupChannel": [
                284,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "createEmailingDomain": [
                282,
                {
                    "input": [
                        491,
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
                282,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteConnectedAccount": [
                249,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "runAgent": [
                313,
                {
                    "input": [
                        492,
                        "RunAgentInput!"
                    ]
                }
            ],
            "createWebhook": [
                310,
                {
                    "input": [
                        495,
                        "CreateWebhookInput!"
                    ]
                }
            ],
            "updateWebhook": [
                310,
                {
                    "input": [
                        496,
                        "UpdateWebhookInput!"
                    ]
                }
            ],
            "deleteWebhook": [
                310,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "updateMessageFolder": [
                351,
                {
                    "input": [
                        498,
                        "UpdateMessageFolderInput!"
                    ]
                }
            ],
            "updateMessageFolders": [
                351,
                {
                    "input": [
                        500,
                        "UpdateMessageFoldersInput!"
                    ]
                }
            ],
            "updateCalendarChannel": [
                346,
                {
                    "input": [
                        501,
                        "UpdateCalendarChannelInput!"
                    ]
                }
            ],
            "setAppKeyValue": [
                344,
                {
                    "input": [
                        503,
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
                        345
                    ]
                }
            ],
            "enqueueJob": [
                343,
                {
                    "input": [
                        504,
                        "EnqueueJobInput!"
                    ]
                }
            ],
            "createChatThread": [
                331
            ],
            "sendChatMessage": [
                336,
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
                        505,
                        "[FileAttachmentInput!]"
                    ]
                }
            ],
            "retryChatMessage": [
                336,
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
                336,
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
                        506,
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
                331,
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
                331,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "unarchiveChatThread": [
                331,
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
                338,
                {
                    "companyContext": [
                        5
                    ]
                }
            ],
            "createSkill": [
                329,
                {
                    "input": [
                        507,
                        "CreateSkillInput!"
                    ]
                }
            ],
            "updateSkill": [
                329,
                {
                    "input": [
                        508,
                        "UpdateSkillInput!"
                    ]
                }
            ],
            "deleteSkill": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "activateSkill": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "deactivateSkill": [
                329,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "evaluateAgentTurn": [
                340,
                {
                    "turnId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "runEvaluationInput": [
                341,
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
                257,
                {
                    "input": [
                        509,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                268,
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
                255,
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
                263,
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
                255,
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
                267,
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
                255,
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
                260,
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
                260,
                {
                    "input": [
                        510
                    ]
                }
            ],
            "uploadNewWorkspaceLogo": [
                148,
                {
                    "workspaceId": [
                        1,
                        "String!"
                    ],
                    "file": [
                        382,
                        "Upload!"
                    ]
                }
            ],
            "generateTransientToken": [
                261
            ],
            "getAuthTokensFromLoginToken": [
                267,
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
                267,
                {
                    "ssoExchangeToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "authorizeApp": [
                253,
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
                267,
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
                266,
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
                256,
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
                258,
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
            "initiateOTPProvisioningForAuthenticatedUser": [
                251
            ],
            "deleteTwoFactorAuthenticationMethod": [
                250,
                {
                    "twoFactorAuthenticationMethodId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                252,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteUser": [
                71
            ],
            "deleteUserFromWorkspace": [
                50,
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
                        511,
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
                206,
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
                211,
                {
                    "input": [
                        512,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                211,
                {
                    "input": [
                        513,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                207,
                {
                    "input": [
                        514,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                208,
                {
                    "input": [
                        515,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createObjectEvent": [
                325,
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
                325,
                {
                    "type": [
                        516,
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
                323,
                {
                    "id": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "impersonate": [
                271,
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
                272
            ],
            "createCalendarEvent": [
                315,
                {
                    "input": [
                        517,
                        "CreateCalendarEventInput!"
                    ]
                }
            ],
            "sendEmail": [
                324,
                {
                    "input": [
                        518,
                        "SendEmailInput!"
                    ]
                }
            ],
            "startChannelSync": [
                314,
                {
                    "connectedAccountId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                309,
                {
                    "handle": [
                        1,
                        "String!"
                    ],
                    "connectionParameters": [
                        520,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        4
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                171,
                {
                    "input": [
                        522,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "createPublicDomain": [
                280,
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
                243,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createDevelopmentApplication": [
                277,
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
                278,
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
                279,
                {
                    "file": [
                        382,
                        "Upload!"
                    ],
                    "applicationUniversalIdentifier": [
                        1,
                        "String!"
                    ],
                    "fileFolder": [
                        381,
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
                152
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
                380
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
                55
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
                55
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
                57
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
                387
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
                57
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
                63
            ],
            "key": [
                64
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
                27
            ],
            "openRecordIn": [
                65
            ],
            "kanbanAggregateOperation": [
                53
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                66
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
                67
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
                63
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
                65
            ],
            "kanbanAggregateOperation": [
                53
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                66
            ],
            "calendarFieldMetadataId": [
                4
            ],
            "calendarEndFieldMetadataId": [
                4
            ],
            "visibility": [
                67
            ],
            "mainGroupByFieldMetadataId": [
                4
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "kanbanColumnWidth": [
                27
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
                393
            ],
            "viewFields": [
                394
            ],
            "viewFilters": [
                395
            ],
            "viewFilterGroups": [
                396
            ],
            "viewSorts": [
                397
            ],
            "__typename": [
                1
            ]
        },
        "UpsertViewWidgetViewSettingsInput": {
            "type": [
                63
            ],
            "mainGroupByFieldMetadataId": [
                4
            ],
            "shouldHideEmptyGroups": [
                3
            ],
            "openRecordIn": [
                65
            ],
            "kanbanAggregateOperation": [
                53
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                4
            ],
            "kanbanColumnWidth": [
                27
            ],
            "calendarLayout": [
                66
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
                53
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
                57
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
                55
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
                60
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
                60
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
                400
            ],
            "__typename": [
                1
            ]
        },
        "UpdateViewSortInputUpdates": {
            "direction": [
                60
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
                404
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
                53
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
                53
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
                409
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
                414
            ],
            "fields": [
                415
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
                415
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
                83
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
                83
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
                123
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
                123
            ],
            "objectMetadataId": [
                4
            ],
            "tabs": [
                427
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
                83
            ],
            "widgets": [
                428
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
                80
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                429
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
                80
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                429
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
                80
            ],
            "objectMetadataId": [
                4
            ],
            "gridPosition": [
                429
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
                435
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
                438
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
                25
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneIndexInput": {
            "index": [
                440
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
                441
            ],
            "indexType": [
                232
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
                446
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
                451
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
                69
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
                456
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
                459
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
                462
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                224
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
                464
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
                468
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
                473
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
                475
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
                478
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
                480
            ],
            "predicateGroups": [
                481
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
                43
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
                41
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
                302
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
                302
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
                488
            ],
            "__typename": [
                1
            ]
        },
        "UpdateMessageChannelInputUpdates": {
            "visibility": [
                285
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                287
            ],
            "messageFolderImportPolicy": [
                288
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
            "runAsWorkspaceMemberId": [
                4
            ],
            "messages": [
                493
            ],
            "__typename": [
                1
            ]
        },
        "RunAgentMessageInput": {
            "role": [
                494
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
                497
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
                499
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
                499
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
                502
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCalendarChannelInputUpdates": {
            "visibility": [
                349
            ],
            "isContactAutoCreationEnabled": [
                3
            ],
            "contactAutoCreationPolicy": [
                350
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
                345
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
                27
            ],
            "delayMs": [
                27
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
                27
            ],
            "selectedOptionIndices": [
                27
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
                180
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
                519
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
                521
            ],
            "SMTP": [
                521
            ],
            "CALDAV": [
                521
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
                247
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
                159,
                {
                    "eventStreamId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "logicFunctionLogs": [
                245,
                {
                    "input": [
                        524,
                        "LogicFunctionLogsInput!"
                    ]
                }
            ],
            "onAgentChatEvent": [
                337,
                {
                    "threadId": [
                        4,
                        "UUID!"
                    ]
                }
            ],
            "eventLogsLive": [
                326,
                {
                    "table": [
                        367,
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