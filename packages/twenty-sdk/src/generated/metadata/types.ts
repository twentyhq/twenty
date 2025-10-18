export default {
    "scalars": [
        1,
        3,
        4,
        6,
        7,
        10,
        12,
        17,
        18,
        19,
        20,
        26,
        27,
        29,
        31,
        34,
        36,
        37,
        38,
        39,
        41,
        44,
        45,
        48,
        51,
        52,
        53,
        54,
        55,
        63,
        68,
        74,
        77,
        93,
        94,
        95,
        97,
        107,
        114,
        118,
        119,
        131,
        132,
        147,
        177,
        181,
        182,
        184,
        185,
        187,
        190,
        191,
        203,
        212,
        217,
        218,
        228,
        244,
        247,
        250,
        268,
        270,
        272,
        304,
        305
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
                92
            ],
            "on_BillingLicensedProduct": [
                101
            ],
            "on_BillingMeteredProduct": [
                102
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
            "workspaceId": [
                3
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "workspace": [
                40
            ],
            "role": [
                24
            ],
            "__typename": [
                1
            ]
        },
        "UUID": {},
        "DateTime": {},
        "FeatureFlag": {
            "id": [
                3
            ],
            "key": [
                7
            ],
            "workspaceId": [
                3
            ],
            "value": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "Boolean": {},
        "FeatureFlagKey": {},
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "JSON": {},
        "UserWorkspace": {
            "id": [
                3
            ],
            "user": [
                43
            ],
            "userId": [
                3
            ],
            "workspace": [
                40
            ],
            "workspaceId": [
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
                12
            ],
            "objectPermissions": [
                9
            ],
            "objectsPermissions": [
                9
            ],
            "twoFactorAuthenticationMethodSummary": [
                8
            ],
            "__typename": [
                1
            ]
        },
        "PermissionFlagType": {},
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
            "workspace": [
                40
            ],
            "__typename": [
                1
            ]
        },
        "Agent": {
            "id": [
                3
            ],
            "standardId": [
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
                10
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
                10
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
                15
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
                17
            ],
            "timeZone": [
                1
            ],
            "dateFormat": [
                18
            ],
            "timeFormat": [
                19
            ],
            "roles": [
                24
            ],
            "userWorkspaceId": [
                3
            ],
            "numberFormat": [
                20
            ],
            "__typename": [
                1
            ]
        },
        "Int": {},
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
                12
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
            "standardId": [
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
                16
            ],
            "agents": [
                14
            ],
            "apiKeys": [
                23
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
                22
            ],
            "objectPermissions": [
                9
            ],
            "fieldPermissions": [
                21
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
                26
            ],
            "position": [
                26
            ],
            "aggregateOperation": [
                27
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
        "Float": {},
        "AggregateOperations": {},
        "CoreViewFilterGroup": {
            "id": [
                3
            ],
            "parentViewFilterGroupId": [
                3
            ],
            "logicalOperator": [
                29
            ],
            "positionInViewFilterGroup": [
                26
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
                31
            ],
            "value": [
                10
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                26
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
                26
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
                34
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
                36
            ],
            "key": [
                37
            ],
            "icon": [
                1
            ],
            "position": [
                26
            ],
            "isCompact": [
                6
            ],
            "isCustom": [
                6
            ],
            "openRecordIn": [
                38
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
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
                39
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
                25
            ],
            "viewFilters": [
                30
            ],
            "viewFilterGroups": [
                28
            ],
            "viewSorts": [
                33
            ],
            "viewGroups": [
                32
            ],
            "__typename": [
                1
            ]
        },
        "ViewType": {},
        "ViewKey": {},
        "ViewOpenRecordIn": {},
        "ViewCalendarLayout": {},
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
                26
            ],
            "workspaceMembersCount": [
                26
            ],
            "activationStatus": [
                41
            ],
            "views": [
                35
            ],
            "viewFields": [
                25
            ],
            "viewFilters": [
                30
            ],
            "viewFilterGroups": [
                28
            ],
            "viewGroups": [
                32
            ],
            "viewSorts": [
                33
            ],
            "metadataVersion": [
                26
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
            "isTwoFactorAuthenticationEnforced": [
                6
            ],
            "isPasswordAuthEnabled": [
                6
            ],
            "isMicrosoftAuthEnabled": [
                6
            ],
            "isCustomDomainEnabled": [
                6
            ],
            "defaultRole": [
                24
            ],
            "defaultAgent": [
                14
            ],
            "version": [
                1
            ],
            "featureFlags": [
                138
            ],
            "billingSubscriptions": [
                106
            ],
            "currentBillingSubscription": [
                106
            ],
            "hasValidEnterpriseKey": [
                6
            ],
            "workspaceUrls": [
                129
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
            "passwordHash": [
                1
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
                16
            ],
            "userWorkspaces": [
                11
            ],
            "onboardingStatus": [
                44
            ],
            "currentWorkspace": [
                40
            ],
            "currentUserWorkspace": [
                11
            ],
            "userVars": [
                45
            ],
            "workspaceMembers": [
                16
            ],
            "deletedWorkspaceMembers": [
                135
            ],
            "supportUserHash": [
                1
            ],
            "workspaces": [
                11
            ],
            "availableWorkspaces": [
                134
            ],
            "__typename": [
                1
            ]
        },
        "OnboardingStatus": {},
        "JSONObject": {},
        "GridPosition": {
            "row": [
                26
            ],
            "column": [
                26
            ],
            "rowSpan": [
                26
            ],
            "columnSpan": [
                26
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
                48
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                46
            ],
            "configuration": [
                49
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
        "WidgetConfiguration": {
            "on_BarChartConfiguration": [
                50
            ],
            "on_LineChartConfiguration": [
                56
            ],
            "on_PieChartConfiguration": [
                57
            ],
            "on_NumberChartConfiguration": [
                58
            ],
            "on_GaugeChartConfiguration": [
                59
            ],
            "on_IframeConfiguration": [
                60
            ],
            "__typename": [
                1
            ]
        },
        "BarChartConfiguration": {
            "graphType": [
                51
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                52
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisOrderBy": [
                53
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                3
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisOrderBy": [
                53
            ],
            "omitNullValues": [
                6
            ],
            "axisNameDisplay": [
                54
            ],
            "displayDataLabel": [
                6
            ],
            "rangeMin": [
                26
            ],
            "rangeMax": [
                26
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                10
            ],
            "groupMode": [
                55
            ],
            "__typename": [
                1
            ]
        },
        "GraphType": {},
        "ExtendedAggregateOperations": {},
        "GraphOrderBy": {},
        "AxisNameDisplay": {},
        "BarChartGroupMode": {},
        "LineChartConfiguration": {
            "graphType": [
                51
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                52
            ],
            "primaryAxisGroupByFieldMetadataId": [
                3
            ],
            "primaryAxisGroupBySubFieldName": [
                1
            ],
            "primaryAxisOrderBy": [
                53
            ],
            "secondaryAxisGroupByFieldMetadataId": [
                3
            ],
            "secondaryAxisGroupBySubFieldName": [
                1
            ],
            "secondaryAxisOrderBy": [
                53
            ],
            "omitNullValues": [
                6
            ],
            "axisNameDisplay": [
                54
            ],
            "displayDataLabel": [
                6
            ],
            "rangeMin": [
                26
            ],
            "rangeMax": [
                26
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "PieChartConfiguration": {
            "graphType": [
                51
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                52
            ],
            "groupByFieldMetadataId": [
                3
            ],
            "groupBySubFieldName": [
                1
            ],
            "orderBy": [
                53
            ],
            "displayDataLabel": [
                6
            ],
            "description": [
                1
            ],
            "color": [
                1
            ],
            "filter": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "NumberChartConfiguration": {
            "graphType": [
                51
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                52
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "GaugeChartConfiguration": {
            "graphType": [
                51
            ],
            "aggregateFieldMetadataId": [
                3
            ],
            "aggregateOperation": [
                52
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "IframeConfiguration": {
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PageLayoutTab": {
            "id": [
                3
            ],
            "title": [
                1
            ],
            "position": [
                26
            ],
            "pageLayoutId": [
                3
            ],
            "widgets": [
                47
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
                63
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                61
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
                10
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
                10
            ],
            "__typename": [
                1
            ]
        },
        "Object": {
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
            "description": [
                1
            ],
            "icon": [
                1
            ],
            "standardOverrides": [
                65
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
                73
            ],
            "indexMetadataList": [
                76
            ],
            "fields": [
                90,
                {
                    "paging": [
                        67,
                        "CursorPaging!"
                    ],
                    "filter": [
                        69,
                        "FieldFilter!"
                    ]
                }
            ],
            "indexMetadatas": [
                88,
                {
                    "paging": [
                        67,
                        "CursorPaging!"
                    ],
                    "filter": [
                        72,
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
                68
            ],
            "after": [
                68
            ],
            "first": [
                17
            ],
            "last": [
                17
            ],
            "__typename": [
                1
            ]
        },
        "ConnectionCursor": {},
        "FieldFilter": {
            "and": [
                69
            ],
            "or": [
                69
            ],
            "id": [
                70
            ],
            "isCustom": [
                71
            ],
            "isActive": [
                71
            ],
            "isSystem": [
                71
            ],
            "isUIReadOnly": [
                71
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
        "IndexFilter": {
            "and": [
                72
            ],
            "or": [
                72
            ],
            "id": [
                70
            ],
            "isCustom": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "Field": {
            "id": [
                3
            ],
            "type": [
                74
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
                64
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
                10
            ],
            "options": [
                10
            ],
            "settings": [
                10
            ],
            "isLabelSyncedWithName": [
                6
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "relation": [
                146
            ],
            "morphRelations": [
                146
            ],
            "object": [
                66
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
                26
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
                77
            ],
            "createdAt": [
                4
            ],
            "updatedAt": [
                4
            ],
            "indexFieldMetadataList": [
                75
            ],
            "objectMetadata": [
                86,
                {
                    "paging": [
                        67,
                        "CursorPaging!"
                    ],
                    "filter": [
                        78,
                        "ObjectFilter!"
                    ]
                }
            ],
            "indexFieldMetadatas": [
                84,
                {
                    "paging": [
                        67,
                        "CursorPaging!"
                    ],
                    "filter": [
                        79,
                        "IndexFieldFilter!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "IndexType": {},
        "ObjectFilter": {
            "and": [
                78
            ],
            "or": [
                78
            ],
            "id": [
                70
            ],
            "isCustom": [
                71
            ],
            "isRemote": [
                71
            ],
            "isActive": [
                71
            ],
            "isSystem": [
                71
            ],
            "isUIReadOnly": [
                71
            ],
            "isSearchable": [
                71
            ],
            "__typename": [
                1
            ]
        },
        "IndexFieldFilter": {
            "and": [
                79
            ],
            "or": [
                79
            ],
            "id": [
                70
            ],
            "fieldMetadataId": [
                70
            ],
            "__typename": [
                1
            ]
        },
        "IndexEdge": {
            "node": [
                76
            ],
            "cursor": [
                68
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
                68
            ],
            "endCursor": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "IndexConnection": {
            "pageInfo": [
                81
            ],
            "edges": [
                80
            ],
            "__typename": [
                1
            ]
        },
        "IndexFieldEdge": {
            "node": [
                75
            ],
            "cursor": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "IndexIndexFieldMetadatasConnection": {
            "pageInfo": [
                81
            ],
            "edges": [
                83
            ],
            "__typename": [
                1
            ]
        },
        "ObjectEdge": {
            "node": [
                66
            ],
            "cursor": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "IndexObjectMetadataConnection": {
            "pageInfo": [
                81
            ],
            "edges": [
                85
            ],
            "__typename": [
                1
            ]
        },
        "ObjectConnection": {
            "pageInfo": [
                81
            ],
            "edges": [
                85
            ],
            "__typename": [
                1
            ]
        },
        "ObjectIndexMetadatasConnection": {
            "pageInfo": [
                81
            ],
            "edges": [
                80
            ],
            "__typename": [
                1
            ]
        },
        "FieldEdge": {
            "node": [
                73
            ],
            "cursor": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "ObjectFieldsConnection": {
            "pageInfo": [
                81
            ],
            "edges": [
                89
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
        "BillingProductMetadata": {
            "planKey": [
                93
            ],
            "priceUsageBased": [
                94
            ],
            "productKey": [
                95
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanKey": {},
        "BillingUsageType": {},
        "BillingProductKey": {},
        "BillingPriceLicensedDTO": {
            "recurringInterval": [
                97
            ],
            "unitAmount": [
                26
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                94
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionInterval": {},
        "BillingPriceTierDTO": {
            "upTo": [
                26
            ],
            "flatAmount": [
                26
            ],
            "unitAmount": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "BillingPriceMeteredDTO": {
            "tiers": [
                98
            ],
            "recurringInterval": [
                97
            ],
            "stripePriceId": [
                1
            ],
            "priceUsageType": [
                94
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
                92
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
                92
            ],
            "prices": [
                96
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
                92
            ],
            "prices": [
                99
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
                6
            ],
            "quantity": [
                26
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
        "BillingSubscriptionSchedulePhaseItem": {
            "price": [
                1
            ],
            "quantity": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "BillingSubscriptionSchedulePhase": {
            "start_date": [
                26
            ],
            "end_date": [
                26
            ],
            "items": [
                104
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
                107
            ],
            "interval": [
                97
            ],
            "billingSubscriptionItems": [
                103
            ],
            "currentPeriodEnd": [
                4
            ],
            "metadata": [
                10
            ],
            "phases": [
                105
            ],
            "__typename": [
                1
            ]
        },
        "SubscriptionStatus": {},
        "ResendEmailVerificationTokenOutput": {
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
        "File": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "fullPath": [
                1
            ],
            "size": [
                26
            ],
            "type": [
                1
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SignedFileDTO": {
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
        "ServerlessFunctionLayer": {
            "id": [
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
        "ServerlessFunctionExecutionResult": {
            "data": [
                10
            ],
            "logs": [
                1
            ],
            "duration": [
                26
            ],
            "status": [
                114
            ],
            "error": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ServerlessFunctionExecutionStatus": {},
        "CronTrigger": {
            "id": [
                3
            ],
            "settings": [
                10
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
        "DatabaseEventTrigger": {
            "id": [
                3
            ],
            "settings": [
                10
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
        "RouteTrigger": {
            "id": [
                118
            ],
            "path": [
                1
            ],
            "isAuthRequired": [
                6
            ],
            "httpMethod": [
                119
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
        "ID": {},
        "HTTPMethod": {},
        "ServerlessFunction": {
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
                26
            ],
            "latestVersion": [
                1
            ],
            "publishedVersions": [
                1
            ],
            "cronTriggers": [
                115
            ],
            "databaseEventTriggers": [
                116
            ],
            "routeTriggers": [
                117
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
        "BillingEndTrialPeriodOutput": {
            "status": [
                107
            ],
            "hasPaymentMethod": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "BillingMeteredProductUsageOutput": {
            "productKey": [
                95
            ],
            "periodStart": [
                4
            ],
            "periodEnd": [
                4
            ],
            "usedCredits": [
                26
            ],
            "grantedCredits": [
                26
            ],
            "unitPriceCents": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "BillingPlanOutput": {
            "planKey": [
                93
            ],
            "licensedProducts": [
                101
            ],
            "meteredProducts": [
                102
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
                106
            ],
            "billingSubscriptions": [
                106
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
            "expiresAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "SendInvitationsOutput": {
            "success": [
                6
            ],
            "errors": [
                1
            ],
            "result": [
                127
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
                131
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
                132
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
                129
            ],
            "logo": [
                1
            ],
            "sso": [
                130
            ],
            "__typename": [
                1
            ]
        },
        "AvailableWorkspaces": {
            "availableWorkspacesForSignIn": [
                133
            ],
            "availableWorkspacesForSignUp": [
                133
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
                15
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
                136
            ],
            "__typename": [
                1
            ]
        },
        "FeatureFlagDTO": {
            "key": [
                7
            ],
            "value": [
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
                131
            ],
            "status": [
                132
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
                139
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
        "PublicWorkspaceDataOutput": {
            "id": [
                3
            ],
            "authProviders": [
                140
            ],
            "logo": [
                1
            ],
            "displayName": [
                1
            ],
            "workspaceUrls": [
                129
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatMessagePart": {
            "id": [
                3
            ],
            "messageId": [
                3
            ],
            "orderIndex": [
                17
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
                10
            ],
            "toolOutput": [
                10
            ],
            "state": [
                1
            ],
            "errorMessage": [
                1
            ],
            "errorDetails": [
                10
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
                10
            ],
            "createdAt": [
                4
            ],
            "__typename": [
                1
            ]
        },
        "AgentChatMessage": {
            "id": [
                3
            ],
            "threadId": [
                3
            ],
            "role": [
                1
            ],
            "parts": [
                142
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
            "agentId": [
                3
            ],
            "title": [
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
        "AgentHandoffDTO": {
            "id": [
                3
            ],
            "description": [
                1
            ],
            "toAgent": [
                14
            ],
            "__typename": [
                1
            ]
        },
        "Relation": {
            "type": [
                147
            ],
            "sourceObjectMetadata": [
                66
            ],
            "targetObjectMetadata": [
                66
            ],
            "sourceFieldMetadata": [
                73
            ],
            "targetFieldMetadata": [
                73
            ],
            "__typename": [
                1
            ]
        },
        "RelationType": {},
        "FieldConnection": {
            "pageInfo": [
                81
            ],
            "edges": [
                89
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceEdge": {
            "node": [
                40
            ],
            "cursor": [
                68
            ],
            "__typename": [
                1
            ]
        },
        "UserEdge": {
            "node": [
                43
            ],
            "cursor": [
                68
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
                131
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                132
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
                131
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
                132
            ],
            "workspace": [
                153
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
                131
            ],
            "issuer": [
                1
            ],
            "name": [
                1
            ],
            "status": [
                132
            ],
            "__typename": [
                1
            ]
        },
        "DeleteTwoFactorAuthenticationMethodOutput": {
            "success": [
                6
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
        "EmailPasswordResetLink": {
            "success": [
                6
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
        "ApiKeyToken": {
            "token": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokenPair": {
            "accessOrWorkspaceAgnosticToken": [
                162
            ],
            "refreshToken": [
                162
            ],
            "__typename": [
                1
            ]
        },
        "AuthTokens": {
            "tokens": [
                164
            ],
            "__typename": [
                1
            ]
        },
        "TransientToken": {
            "transientToken": [
                162
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
            "__typename": [
                1
            ]
        },
        "AvailableWorkspacesAndAccessTokensOutput": {
            "tokens": [
                164
            ],
            "availableWorkspaces": [
                134
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
        "GetLoginTokenFromEmailVerificationTokenOutput": {
            "loginToken": [
                162
            ],
            "workspaceUrls": [
                129
            ],
            "__typename": [
                1
            ]
        },
        "WorkspaceUrlsAndId": {
            "workspaceUrls": [
                129
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
                162
            ],
            "workspace": [
                171
            ],
            "__typename": [
                1
            ]
        },
        "LoginToken": {
            "loginToken": [
                162
            ],
            "__typename": [
                1
            ]
        },
        "CheckUserExistOutput": {
            "exists": [
                6
            ],
            "availableWorkspacesCount": [
                26
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
        "OnDbEventDTO": {
            "action": [
                177
            ],
            "objectNameSingular": [
                1
            ],
            "eventDate": [
                4
            ],
            "record": [
                10
            ],
            "updatedFields": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventAction": {},
        "UserMappingOptionsUser": {
            "user": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RemoteServer": {
            "id": [
                3
            ],
            "foreignDataWrapperId": [
                3
            ],
            "foreignDataWrapperType": [
                1
            ],
            "label": [
                1
            ],
            "foreignDataWrapperOptions": [
                10
            ],
            "userMappingOptions": [
                178
            ],
            "schema": [
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
        "RemoteTable": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "status": [
                181
            ],
            "schema": [
                1
            ],
            "schemaPendingUpdates": [
                182
            ],
            "__typename": [
                1
            ]
        },
        "RemoteTableStatus": {},
        "DistantTableUpdate": {},
        "ConfigVariable": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "value": [
                10
            ],
            "isSensitive": [
                6
            ],
            "source": [
                184
            ],
            "isEnvOnly": [
                6
            ],
            "type": [
                185
            ],
            "options": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ConfigSource": {},
        "ConfigVariableType": {},
        "ConfigVariablesGroupData": {
            "variables": [
                183
            ],
            "name": [
                187
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
        "ConfigVariablesOutput": {
            "groups": [
                186
            ],
            "__typename": [
                1
            ]
        },
        "SystemHealthService": {
            "id": [
                190
            ],
            "label": [
                1
            ],
            "status": [
                191
            ],
            "__typename": [
                1
            ]
        },
        "HealthIndicatorId": {},
        "AdminPanelHealthServiceStatus": {},
        "SystemHealth": {
            "services": [
                189
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
                26
            ],
            "workspaceUrls": [
                129
            ],
            "users": [
                193
            ],
            "featureFlags": [
                5
            ],
            "__typename": [
                1
            ]
        },
        "UserLookup": {
            "user": [
                193
            ],
            "workspaces": [
                194
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
                191
            ],
            "__typename": [
                1
            ]
        },
        "AdminPanelHealthServiceData": {
            "id": [
                190
            ],
            "label": [
                1
            ],
            "description": [
                1
            ],
            "status": [
                191
            ],
            "errorMessage": [
                1
            ],
            "details": [
                1
            ],
            "queues": [
                197
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsDataPoint": {
            "x": [
                26
            ],
            "y": [
                26
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
                199
            ],
            "__typename": [
                1
            ]
        },
        "WorkerQueueMetrics": {
            "failed": [
                26
            ],
            "completed": [
                26
            ],
            "waiting": [
                26
            ],
            "active": [
                26
            ],
            "delayed": [
                26
            ],
            "failureRate": [
                26
            ],
            "failedData": [
                26
            ],
            "completedData": [
                26
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
                26
            ],
            "timeRange": [
                203
            ],
            "details": [
                201
            ],
            "data": [
                200
            ],
            "__typename": [
                1
            ]
        },
        "QueueMetricsTimeRange": {},
        "ImpersonateOutput": {
            "loginToken": [
                162
            ],
            "workspace": [
                171
            ],
            "__typename": [
                1
            ]
        },
        "AppTokenEdge": {
            "node": [
                42
            ],
            "cursor": [
                68
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
            "agents": [
                14
            ],
            "serverlessFunctions": [
                120
            ],
            "objects": [
                66
            ],
            "applicationVariables": [
                206
            ],
            "__typename": [
                1
            ]
        },
        "TimelineCalendarEventParticipant": {
            "personId": [
                3
            ],
            "workspaceMemberId": [
                3
            ],
            "firstName": [
                1
            ],
            "lastName": [
                1
            ],
            "displayName": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "handle": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "LinkMetadata": {
            "label": [
                1
            ],
            "url": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "LinksMetadata": {
            "primaryLinkLabel": [
                1
            ],
            "primaryLinkUrl": [
                1
            ],
            "secondaryLinks": [
                209
            ],
            "__typename": [
                1
            ]
        },
        "TimelineCalendarEvent": {
            "id": [
                3
            ],
            "title": [
                1
            ],
            "isCanceled": [
                6
            ],
            "isFullDay": [
                6
            ],
            "startsAt": [
                4
            ],
            "endsAt": [
                4
            ],
            "description": [
                1
            ],
            "location": [
                1
            ],
            "conferenceSolution": [
                1
            ],
            "conferenceLink": [
                210
            ],
            "participants": [
                208
            ],
            "visibility": [
                212
            ],
            "__typename": [
                1
            ]
        },
        "CalendarChannelVisibility": {},
        "TimelineCalendarEventsWithTotal": {
            "totalNumberOfCalendarEvents": [
                17
            ],
            "timelineCalendarEvents": [
                211
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
                26
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
                217
            ],
            "status": [
                218
            ],
            "verificationRecords": [
                215
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
        "AutocompleteResultDto": {
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
        "LocationDto": {
            "lat": [
                26
            ],
            "lng": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "PlaceDetailsResultDto": {
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
                220
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
                26
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
                222
            ],
            "SMTP": [
                222
            ],
            "CALDAV": [
                222
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
                223
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
        "TimelineThreadParticipant": {
            "personId": [
                3
            ],
            "workspaceMemberId": [
                3
            ],
            "firstName": [
                1
            ],
            "lastName": [
                1
            ],
            "displayName": [
                1
            ],
            "avatarUrl": [
                1
            ],
            "handle": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "TimelineThread": {
            "id": [
                3
            ],
            "read": [
                6
            ],
            "visibility": [
                228
            ],
            "firstParticipant": [
                226
            ],
            "lastTwoParticipants": [
                226
            ],
            "lastMessageReceivedAt": [
                4
            ],
            "lastMessageBody": [
                1
            ],
            "subject": [
                1
            ],
            "numberOfMessagesInThread": [
                26
            ],
            "participantCount": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "MessageChannelVisibility": {},
        "TimelineThreadsWithTotal": {
            "totalNumberOfThreads": [
                17
            ],
            "timelineThreads": [
                227
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
        "SearchRecord": {
            "recordId": [
                3
            ],
            "objectNameSingular": [
                1
            ],
            "label": [
                1
            ],
            "imageUrl": [
                1
            ],
            "tsRankCD": [
                26
            ],
            "tsRank": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "SearchResultEdge": {
            "node": [
                231
            ],
            "cursor": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SearchResultPageInfo": {
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
        "SearchResultConnection": {
            "edges": [
                232
            ],
            "pageInfo": [
                233
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowRun": {
            "workflowRunId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionStepChanges": {
            "triggerDiff": [
                10
            ],
            "stepsDiff": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowStepPosition": {
            "x": [
                26
            ],
            "y": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowAction": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "type": [
                1
            ],
            "settings": [
                10
            ],
            "valid": [
                6
            ],
            "nextStepIds": [
                3
            ],
            "position": [
                237
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowVersionDTO": {
            "id": [
                3
            ],
            "name": [
                1
            ],
            "createdAt": [
                1
            ],
            "updatedAt": [
                1
            ],
            "workflowId": [
                3
            ],
            "status": [
                1
            ],
            "trigger": [
                10
            ],
            "steps": [
                10
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
        "BillingTrialPeriodDTO": {
            "duration": [
                26
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
            "provider": [
                244
            ],
            "inputCostPer1kTokensInCredits": [
                26
            ],
            "outputCostPer1kTokensInCredits": [
                26
            ],
            "nativeCapabilities": [
                242
            ],
            "__typename": [
                1
            ]
        },
        "ModelProvider": {},
        "Billing": {
            "isBillingEnabled": [
                6
            ],
            "billingUrl": [
                1
            ],
            "trialPeriods": [
                241
            ],
            "__typename": [
                1
            ]
        },
        "Support": {
            "supportDriver": [
                247
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
                250
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
                26
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
                7
            ],
            "metadata": [
                252
            ],
            "__typename": [
                1
            ]
        },
        "Query": {
            "object": [
                66,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "objects": [
                87,
                {
                    "paging": [
                        67,
                        "CursorPaging!"
                    ],
                    "filter": [
                        78,
                        "ObjectFilter!"
                    ]
                }
            ],
            "getCoreViewFields": [
                25,
                {
                    "viewId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewField": [
                25,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViews": [
                35,
                {
                    "objectMetadataId": [
                        1
                    ]
                }
            ],
            "getCoreView": [
                35,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewSorts": [
                33,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewSort": [
                33,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewGroups": [
                32,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewGroup": [
                32,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFilterGroups": [
                28,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewFilterGroup": [
                28,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getCoreViewFilters": [
                30,
                {
                    "viewId": [
                        1
                    ]
                }
            ],
            "getCoreViewFilter": [
                30,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "index": [
                76,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "indexMetadatas": [
                82,
                {
                    "paging": [
                        67,
                        "CursorPaging!"
                    ],
                    "filter": [
                        72,
                        "IndexFilter!"
                    ]
                }
            ],
            "findOneServerlessFunction": [
                120,
                {
                    "input": [
                        255,
                        "ServerlessFunctionIdInput!"
                    ]
                }
            ],
            "findManyServerlessFunctions": [
                120
            ],
            "getAvailablePackages": [
                10,
                {
                    "input": [
                        255,
                        "ServerlessFunctionIdInput!"
                    ]
                }
            ],
            "getServerlessFunctionSourceCode": [
                10,
                {
                    "input": [
                        256,
                        "GetServerlessFunctionSourceCodeInput!"
                    ]
                }
            ],
            "findOneDatabaseEventTrigger": [
                116,
                {
                    "input": [
                        257,
                        "DatabaseEventTriggerIdInput!"
                    ]
                }
            ],
            "findManyDatabaseEventTriggers": [
                116
            ],
            "findOneCronTrigger": [
                115,
                {
                    "input": [
                        258,
                        "CronTriggerIdInput!"
                    ]
                }
            ],
            "findManyCronTriggers": [
                115
            ],
            "findOneRouteTrigger": [
                117,
                {
                    "input": [
                        259,
                        "RouteTriggerIdInput!"
                    ]
                }
            ],
            "findManyRouteTriggers": [
                117
            ],
            "checkUserExists": [
                174,
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
                175,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "findWorkspaceFromInviteHash": [
                40,
                {
                    "inviteHash": [
                        1,
                        "String!"
                    ]
                }
            ],
            "validatePasswordResetToken": [
                167,
                {
                    "passwordResetToken": [
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
                        260,
                        "GetApiKeyDTO!"
                    ]
                }
            ],
            "currentUser": [
                43
            ],
            "findWorkspaceInvitations": [
                127
            ],
            "billingPortalSession": [
                124,
                {
                    "returnUrlPath": [
                        1
                    ]
                }
            ],
            "listPlans": [
                123
            ],
            "getMeteredProductsUsage": [
                122
            ],
            "getApprovedAccessDomains": [
                109
            ],
            "currentWorkspace": [
                40
            ],
            "getPublicWorkspaceDataByDomain": [
                141,
                {
                    "origin": [
                        1
                    ]
                }
            ],
            "findManyAgents": [
                14
            ],
            "findOneAgent": [
                14,
                {
                    "input": [
                        261,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findAgentHandoffTargets": [
                14,
                {
                    "input": [
                        261,
                        "AgentIdInput!"
                    ]
                }
            ],
            "findAgentHandoffs": [
                145,
                {
                    "input": [
                        261,
                        "AgentIdInput!"
                    ]
                }
            ],
            "agentChatThreads": [
                144,
                {
                    "agentId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentChatThread": [
                144,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "agentChatMessages": [
                143,
                {
                    "threadId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getRoles": [
                24
            ],
            "field": [
                73,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "fields": [
                148,
                {
                    "paging": [
                        67,
                        "CursorPaging!"
                    ],
                    "filter": [
                        69,
                        "FieldFilter!"
                    ]
                }
            ],
            "getSSOIdentityProviders": [
                154
            ],
            "findOneRemoteServerById": [
                179,
                {
                    "input": [
                        262,
                        "RemoteServerIdInput!"
                    ]
                }
            ],
            "findManyRemoteServersByType": [
                179,
                {
                    "input": [
                        263,
                        "RemoteServerTypeInput!"
                    ]
                }
            ],
            "findDistantTablesWithStatus": [
                180,
                {
                    "input": [
                        264,
                        "FindManyRemoteTablesInput!"
                    ]
                }
            ],
            "getPageLayouts": [
                62,
                {
                    "objectMetadataId": [
                        1
                    ]
                }
            ],
            "getPageLayout": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTabs": [
                61,
                {
                    "pageLayoutId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutTab": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidgets": [
                47,
                {
                    "pageLayoutTabId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPageLayoutWidget": [
                47,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "webhooks": [
                13
            ],
            "webhook": [
                13,
                {
                    "input": [
                        265,
                        "GetWebhookDTO!"
                    ]
                }
            ],
            "search": [
                234,
                {
                    "searchInput": [
                        1,
                        "String!"
                    ],
                    "limit": [
                        17,
                        "Int!"
                    ],
                    "after": [
                        1
                    ],
                    "includedObjectNameSingulars": [
                        1,
                        "[String!]"
                    ],
                    "filter": [
                        266
                    ],
                    "excludedObjectNameSingulars": [
                        1,
                        "[String!]"
                    ]
                }
            ],
            "getConnectedImapSmtpCaldavAccount": [
                224,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "getAutoCompleteAddress": [
                219,
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
                221,
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
                188
            ],
            "getSystemHealthStatus": [
                192
            ],
            "getIndicatorHealthStatus": [
                198,
                {
                    "indicatorId": [
                        190,
                        "HealthIndicatorId!"
                    ]
                }
            ],
            "getQueueMetrics": [
                202,
                {
                    "queueName": [
                        1,
                        "String!"
                    ],
                    "timeRange": [
                        203
                    ]
                }
            ],
            "versionInfo": [
                196
            ],
            "getDatabaseConfigVariable": [
                183,
                {
                    "key": [
                        1,
                        "String!"
                    ]
                }
            ],
            "getPostgresCredentials": [
                230
            ],
            "findManyPublicDomains": [
                214
            ],
            "getEmailingDomains": [
                216
            ],
            "getTimelineCalendarEventsFromPersonId": [
                213,
                {
                    "personId": [
                        3,
                        "UUID!"
                    ],
                    "page": [
                        17,
                        "Int!"
                    ],
                    "pageSize": [
                        17,
                        "Int!"
                    ]
                }
            ],
            "getTimelineCalendarEventsFromCompanyId": [
                213,
                {
                    "companyId": [
                        3,
                        "UUID!"
                    ],
                    "page": [
                        17,
                        "Int!"
                    ],
                    "pageSize": [
                        17,
                        "Int!"
                    ]
                }
            ],
            "getTimelineCalendarEventsFromOpportunityId": [
                213,
                {
                    "opportunityId": [
                        3,
                        "UUID!"
                    ],
                    "page": [
                        17,
                        "Int!"
                    ],
                    "pageSize": [
                        17,
                        "Int!"
                    ]
                }
            ],
            "getTimelineThreadsFromPersonId": [
                229,
                {
                    "personId": [
                        3,
                        "UUID!"
                    ],
                    "page": [
                        17,
                        "Int!"
                    ],
                    "pageSize": [
                        17,
                        "Int!"
                    ]
                }
            ],
            "getTimelineThreadsFromCompanyId": [
                229,
                {
                    "companyId": [
                        3,
                        "UUID!"
                    ],
                    "page": [
                        17,
                        "Int!"
                    ],
                    "pageSize": [
                        17,
                        "Int!"
                    ]
                }
            ],
            "getTimelineThreadsFromOpportunityId": [
                229,
                {
                    "opportunityId": [
                        3,
                        "UUID!"
                    ],
                    "page": [
                        17,
                        "Int!"
                    ],
                    "pageSize": [
                        17,
                        "Int!"
                    ]
                }
            ],
            "findManyApplications": [
                207
            ],
            "findOneApplication": [
                207,
                {
                    "id": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "ServerlessFunctionIdInput": {
            "id": [
                118
            ],
            "__typename": [
                1
            ]
        },
        "GetServerlessFunctionSourceCodeInput": {
            "id": [
                118
            ],
            "version": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "DatabaseEventTriggerIdInput": {
            "id": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CronTriggerIdInput": {
            "id": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RouteTriggerIdInput": {
            "id": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "GetApiKeyDTO": {
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
        "RemoteServerIdInput": {
            "id": [
                118
            ],
            "__typename": [
                1
            ]
        },
        "RemoteServerTypeInput": {
            "foreignDataWrapperType": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "FindManyRemoteTablesInput": {
            "id": [
                118
            ],
            "shouldFetchPendingSchemaUpdates": [
                6
            ],
            "__typename": [
                1
            ]
        },
        "GetWebhookDTO": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "ObjectRecordFilterInput": {
            "and": [
                266
            ],
            "not": [
                266
            ],
            "or": [
                266
            ],
            "id": [
                267
            ],
            "createdAt": [
                269
            ],
            "updatedAt": [
                269
            ],
            "deletedAt": [
                269
            ],
            "__typename": [
                1
            ]
        },
        "UUIDFilter": {
            "eq": [
                3
            ],
            "gt": [
                3
            ],
            "gte": [
                3
            ],
            "in": [
                3
            ],
            "lt": [
                3
            ],
            "lte": [
                3
            ],
            "neq": [
                3
            ],
            "is": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "FilterIs": {},
        "DateFilter": {
            "eq": [
                270
            ],
            "gt": [
                270
            ],
            "gte": [
                270
            ],
            "in": [
                270
            ],
            "lt": [
                270
            ],
            "lte": [
                270
            ],
            "neq": [
                270
            ],
            "is": [
                268
            ],
            "__typename": [
                1
            ]
        },
        "Date": {},
        "Mutation": {
            "createObjectEvent": [
                91,
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
                        10
                    ]
                }
            ],
            "trackAnalytics": [
                91,
                {
                    "type": [
                        272,
                        "AnalyticsType!"
                    ],
                    "name": [
                        1
                    ],
                    "event": [
                        1
                    ],
                    "properties": [
                        10
                    ]
                }
            ],
            "deleteOneObject": [
                66,
                {
                    "input": [
                        273,
                        "DeleteOneObjectInput!"
                    ]
                }
            ],
            "updateOneObject": [
                66,
                {
                    "input": [
                        274,
                        "UpdateOneObjectInput!"
                    ]
                }
            ],
            "createOneObject": [
                66,
                {
                    "input": [
                        276,
                        "CreateOneObjectInput!"
                    ]
                }
            ],
            "updateCoreViewField": [
                25,
                {
                    "input": [
                        278,
                        "UpdateViewFieldInput!"
                    ]
                }
            ],
            "createCoreViewField": [
                25,
                {
                    "input": [
                        280,
                        "CreateViewFieldInput!"
                    ]
                }
            ],
            "deleteCoreViewField": [
                25,
                {
                    "input": [
                        281,
                        "DeleteViewFieldInput!"
                    ]
                }
            ],
            "destroyCoreViewField": [
                25,
                {
                    "input": [
                        282,
                        "DestroyViewFieldInput!"
                    ]
                }
            ],
            "createCoreView": [
                35,
                {
                    "input": [
                        283,
                        "CreateViewInput!"
                    ]
                }
            ],
            "updateCoreView": [
                35,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        284,
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
                33,
                {
                    "input": [
                        285,
                        "CreateViewSortInput!"
                    ]
                }
            ],
            "updateCoreViewSort": [
                33,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        286,
                        "UpdateViewSortInput!"
                    ]
                }
            ],
            "deleteCoreViewSort": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "destroyCoreViewSort": [
                6,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createCoreViewGroup": [
                32,
                {
                    "input": [
                        287,
                        "CreateViewGroupInput!"
                    ]
                }
            ],
            "updateCoreViewGroup": [
                32,
                {
                    "input": [
                        288,
                        "UpdateViewGroupInput!"
                    ]
                }
            ],
            "deleteCoreViewGroup": [
                32,
                {
                    "input": [
                        290,
                        "DeleteViewGroupInput!"
                    ]
                }
            ],
            "destroyCoreViewGroup": [
                32,
                {
                    "input": [
                        291,
                        "DestroyViewGroupInput!"
                    ]
                }
            ],
            "createCoreViewFilterGroup": [
                28,
                {
                    "input": [
                        292,
                        "CreateViewFilterGroupInput!"
                    ]
                }
            ],
            "updateCoreViewFilterGroup": [
                28,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        293,
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
                30,
                {
                    "input": [
                        294,
                        "CreateViewFilterInput!"
                    ]
                }
            ],
            "updateCoreViewFilter": [
                30,
                {
                    "input": [
                        295,
                        "UpdateViewFilterInput!"
                    ]
                }
            ],
            "deleteCoreViewFilter": [
                30,
                {
                    "input": [
                        297,
                        "DeleteViewFilterInput!"
                    ]
                }
            ],
            "destroyCoreViewFilter": [
                30,
                {
                    "input": [
                        298,
                        "DestroyViewFilterInput!"
                    ]
                }
            ],
            "deleteOneServerlessFunction": [
                120,
                {
                    "input": [
                        255,
                        "ServerlessFunctionIdInput!"
                    ]
                }
            ],
            "updateOneServerlessFunction": [
                120,
                {
                    "input": [
                        299,
                        "UpdateServerlessFunctionInput!"
                    ]
                }
            ],
            "createOneServerlessFunction": [
                120,
                {
                    "input": [
                        301,
                        "CreateServerlessFunctionInput!"
                    ]
                }
            ],
            "executeOneServerlessFunction": [
                113,
                {
                    "input": [
                        302,
                        "ExecuteServerlessFunctionInput!"
                    ]
                }
            ],
            "publishServerlessFunction": [
                120,
                {
                    "input": [
                        303,
                        "PublishServerlessFunctionInput!"
                    ]
                }
            ],
            "createOneServerlessFunctionLayer": [
                112,
                {
                    "packageJson": [
                        10,
                        "JSON!"
                    ],
                    "yarnLock": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createFile": [
                110,
                {
                    "file": [
                        304,
                        "Upload!"
                    ]
                }
            ],
            "deleteFile": [
                110,
                {
                    "fileId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "uploadFile": [
                111,
                {
                    "file": [
                        304,
                        "Upload!"
                    ],
                    "fileFolder": [
                        305
                    ]
                }
            ],
            "uploadImage": [
                111,
                {
                    "file": [
                        304,
                        "Upload!"
                    ],
                    "fileFolder": [
                        305
                    ]
                }
            ],
            "deleteOneDatabaseEventTrigger": [
                116,
                {
                    "input": [
                        257,
                        "DatabaseEventTriggerIdInput!"
                    ]
                }
            ],
            "updateOneDatabaseEventTrigger": [
                116,
                {
                    "input": [
                        306,
                        "UpdateDatabaseEventTriggerInput!"
                    ]
                }
            ],
            "createOneDatabaseEventTrigger": [
                116,
                {
                    "input": [
                        308,
                        "CreateDatabaseEventTriggerInput!"
                    ]
                }
            ],
            "deleteOneCronTrigger": [
                115,
                {
                    "input": [
                        258,
                        "CronTriggerIdInput!"
                    ]
                }
            ],
            "updateOneCronTrigger": [
                115,
                {
                    "input": [
                        309,
                        "UpdateCronTriggerInput!"
                    ]
                }
            ],
            "createOneCronTrigger": [
                115,
                {
                    "input": [
                        311,
                        "CreateCronTriggerInput!"
                    ]
                }
            ],
            "deleteOneRouteTrigger": [
                117,
                {
                    "input": [
                        259,
                        "RouteTriggerIdInput!"
                    ]
                }
            ],
            "updateOneRouteTrigger": [
                117,
                {
                    "input": [
                        312,
                        "UpdateRouteTriggerInput!"
                    ]
                }
            ],
            "createOneRouteTrigger": [
                117,
                {
                    "input": [
                        314,
                        "CreateRouteTriggerInput!"
                    ]
                }
            ],
            "getAuthorizationUrlForSSO": [
                169,
                {
                    "input": [
                        315,
                        "GetAuthorizationUrlForSSOInput!"
                    ]
                }
            ],
            "getLoginTokenFromCredentials": [
                173,
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
                168,
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
            "getLoginTokenFromEmailVerificationToken": [
                170,
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
            "getWorkspaceAgnosticTokenFromEmailVerificationToken": [
                168,
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
                165,
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
                168,
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
                172,
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
                172
            ],
            "generateTransientToken": [
                166
            ],
            "getAuthTokensFromLoginToken": [
                165,
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
                159,
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
                165,
                {
                    "appToken": [
                        1,
                        "String!"
                    ]
                }
            ],
            "generateApiKeyToken": [
                163,
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
                160,
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
                161,
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
            "createApiKey": [
                2,
                {
                    "input": [
                        316,
                        "CreateApiKeyDTO!"
                    ]
                }
            ],
            "updateApiKey": [
                2,
                {
                    "input": [
                        317,
                        "UpdateApiKeyDTO!"
                    ]
                }
            ],
            "revokeApiKey": [
                2,
                {
                    "input": [
                        318,
                        "RevokeApiKeyDTO!"
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
            "initiateOTPProvisioning": [
                157,
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
                157
            ],
            "deleteTwoFactorAuthenticationMethod": [
                156,
                {
                    "twoFactorAuthenticationMethodId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "verifyTwoFactorAuthenticationMethodForAuthenticatedUser": [
                158,
                {
                    "otp": [
                        1,
                        "String!"
                    ]
                }
            ],
            "uploadProfilePicture": [
                111,
                {
                    "file": [
                        304,
                        "Upload!"
                    ]
                }
            ],
            "deleteUser": [
                43
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
                128,
                {
                    "appTokenId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "sendInvitations": [
                128,
                {
                    "emails": [
                        1,
                        "[String!]!"
                    ]
                }
            ],
            "skipSyncEmailOnboardingStep": [
                126
            ],
            "skipBookOnboardingStep": [
                126
            ],
            "checkoutSession": [
                124,
                {
                    "recurringInterval": [
                        97,
                        "SubscriptionInterval!"
                    ],
                    "plan": [
                        93,
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
                125
            ],
            "switchBillingPlan": [
                125
            ],
            "cancelSwitchBillingPlan": [
                125
            ],
            "cancelSwitchBillingInterval": [
                125
            ],
            "setMeteredSubscriptionPrice": [
                125,
                {
                    "priceId": [
                        1,
                        "String!"
                    ]
                }
            ],
            "endSubscriptionTrialPeriod": [
                121
            ],
            "cancelSwitchMeteredPrice": [
                125
            ],
            "createApprovedAccessDomain": [
                109,
                {
                    "input": [
                        319,
                        "CreateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "deleteApprovedAccessDomain": [
                6,
                {
                    "input": [
                        320,
                        "DeleteApprovedAccessDomainInput!"
                    ]
                }
            ],
            "validateApprovedAccessDomain": [
                109,
                {
                    "input": [
                        321,
                        "ValidateApprovedAccessDomainInput!"
                    ]
                }
            ],
            "activateWorkspace": [
                40,
                {
                    "data": [
                        322,
                        "ActivateWorkspaceInput!"
                    ]
                }
            ],
            "updateWorkspace": [
                40,
                {
                    "data": [
                        323,
                        "UpdateWorkspaceInput!"
                    ]
                }
            ],
            "uploadWorkspaceLogo": [
                111,
                {
                    "file": [
                        304,
                        "Upload!"
                    ]
                }
            ],
            "deleteCurrentWorkspace": [
                40
            ],
            "checkCustomDomainValidRecords": [
                137
            ],
            "createOneAgent": [
                14,
                {
                    "input": [
                        324,
                        "CreateAgentInput!"
                    ]
                }
            ],
            "updateOneAgent": [
                14,
                {
                    "input": [
                        325,
                        "UpdateAgentInput!"
                    ]
                }
            ],
            "deleteOneAgent": [
                14,
                {
                    "input": [
                        261,
                        "AgentIdInput!"
                    ]
                }
            ],
            "createAgentHandoff": [
                6,
                {
                    "input": [
                        326,
                        "CreateAgentHandoffInput!"
                    ]
                }
            ],
            "removeAgentHandoff": [
                6,
                {
                    "input": [
                        327,
                        "RemoveAgentHandoffInput!"
                    ]
                }
            ],
            "createAgentChatThread": [
                144,
                {
                    "input": [
                        328,
                        "CreateAgentChatThreadInput!"
                    ]
                }
            ],
            "updateWorkspaceMemberRole": [
                16,
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
                24,
                {
                    "createRoleInput": [
                        329,
                        "CreateRoleInput!"
                    ]
                }
            ],
            "updateOneRole": [
                24,
                {
                    "updateRoleInput": [
                        330,
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
                9,
                {
                    "upsertObjectPermissionsInput": [
                        332,
                        "UpsertObjectPermissionsInput!"
                    ]
                }
            ],
            "upsertPermissionFlags": [
                22,
                {
                    "upsertPermissionFlagsInput": [
                        334,
                        "UpsertPermissionFlagsInput!"
                    ]
                }
            ],
            "upsertFieldPermissions": [
                21,
                {
                    "upsertFieldPermissionsInput": [
                        335,
                        "UpsertFieldPermissionsInput!"
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
            "createOneField": [
                73,
                {
                    "input": [
                        337,
                        "CreateOneFieldMetadataInput!"
                    ]
                }
            ],
            "updateOneField": [
                73,
                {
                    "input": [
                        339,
                        "UpdateOneFieldMetadataInput!"
                    ]
                }
            ],
            "deleteOneField": [
                73,
                {
                    "input": [
                        341,
                        "DeleteOneFieldInput!"
                    ]
                }
            ],
            "resendEmailVerificationToken": [
                108,
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
                155,
                {
                    "input": [
                        342,
                        "SetupOIDCSsoInput!"
                    ]
                }
            ],
            "createSAMLIdentityProvider": [
                155,
                {
                    "input": [
                        343,
                        "SetupSAMLSsoInput!"
                    ]
                }
            ],
            "deleteSSOIdentityProvider": [
                151,
                {
                    "input": [
                        344,
                        "DeleteSsoInput!"
                    ]
                }
            ],
            "editSSOIdentityProvider": [
                152,
                {
                    "input": [
                        345,
                        "EditSsoInput!"
                    ]
                }
            ],
            "createOneRemoteServer": [
                179,
                {
                    "input": [
                        346,
                        "CreateRemoteServerInput!"
                    ]
                }
            ],
            "updateOneRemoteServer": [
                179,
                {
                    "input": [
                        348,
                        "UpdateRemoteServerInput!"
                    ]
                }
            ],
            "deleteOneRemoteServer": [
                179,
                {
                    "input": [
                        262,
                        "RemoteServerIdInput!"
                    ]
                }
            ],
            "syncRemoteTable": [
                180,
                {
                    "input": [
                        350,
                        "RemoteTableInput!"
                    ]
                }
            ],
            "unsyncRemoteTable": [
                180,
                {
                    "input": [
                        350,
                        "RemoteTableInput!"
                    ]
                }
            ],
            "syncRemoteTableSchemaChanges": [
                180,
                {
                    "input": [
                        350,
                        "RemoteTableInput!"
                    ]
                }
            ],
            "impersonate": [
                204,
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
            "createPageLayout": [
                62,
                {
                    "input": [
                        351,
                        "CreatePageLayoutInput!"
                    ]
                }
            ],
            "updatePageLayout": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        352,
                        "UpdatePageLayoutInput!"
                    ]
                }
            ],
            "deletePageLayout": [
                62,
                {
                    "id": [
                        1,
                        "String!"
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
            "restorePageLayout": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "updatePageLayoutWithTabsAndWidgets": [
                62,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        353,
                        "UpdatePageLayoutWithTabsInput!"
                    ]
                }
            ],
            "createPageLayoutTab": [
                61,
                {
                    "input": [
                        357,
                        "CreatePageLayoutTabInput!"
                    ]
                }
            ],
            "updatePageLayoutTab": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        358,
                        "UpdatePageLayoutTabInput!"
                    ]
                }
            ],
            "deletePageLayoutTab": [
                6,
                {
                    "id": [
                        1,
                        "String!"
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
            "restorePageLayoutTab": [
                61,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createPageLayoutWidget": [
                47,
                {
                    "input": [
                        359,
                        "CreatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "updatePageLayoutWidget": [
                47,
                {
                    "id": [
                        1,
                        "String!"
                    ],
                    "input": [
                        360,
                        "UpdatePageLayoutWidgetInput!"
                    ]
                }
            ],
            "deletePageLayoutWidget": [
                47,
                {
                    "id": [
                        1,
                        "String!"
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
            "restorePageLayoutWidget": [
                47,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createWebhook": [
                13,
                {
                    "input": [
                        361,
                        "CreateWebhookDTO!"
                    ]
                }
            ],
            "updateWebhook": [
                13,
                {
                    "input": [
                        362,
                        "UpdateWebhookDTO!"
                    ]
                }
            ],
            "deleteWebhook": [
                6,
                {
                    "input": [
                        363,
                        "DeleteWebhookDTO!"
                    ]
                }
            ],
            "startChannelSync": [
                240,
                {
                    "connectedAccountId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "saveImapSmtpCaldavAccount": [
                225,
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
                        364,
                        "EmailAccountConnectionParameters!"
                    ],
                    "id": [
                        3
                    ]
                }
            ],
            "updateLabPublicFeatureFlag": [
                138,
                {
                    "input": [
                        366,
                        "UpdateLabPublicFeatureFlagInput!"
                    ]
                }
            ],
            "userLookupAdminPanel": [
                195,
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
            "createDatabaseConfigVariable": [
                6,
                {
                    "key": [
                        1,
                        "String!"
                    ],
                    "value": [
                        10,
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
                        10,
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
            "activateWorkflowVersion": [
                6,
                {
                    "workflowVersionId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "deactivateWorkflowVersion": [
                6,
                {
                    "workflowVersionId": [
                        3,
                        "UUID!"
                    ]
                }
            ],
            "runWorkflowVersion": [
                235,
                {
                    "input": [
                        367,
                        "RunWorkflowVersionInput!"
                    ]
                }
            ],
            "computeStepOutputSchema": [
                10,
                {
                    "input": [
                        368,
                        "ComputeStepOutputSchemaInput!"
                    ]
                }
            ],
            "createWorkflowVersionStep": [
                236,
                {
                    "input": [
                        369,
                        "CreateWorkflowVersionStepInput!"
                    ]
                }
            ],
            "updateWorkflowVersionStep": [
                238,
                {
                    "input": [
                        371,
                        "UpdateWorkflowVersionStepInput!"
                    ]
                }
            ],
            "deleteWorkflowVersionStep": [
                236,
                {
                    "input": [
                        372,
                        "DeleteWorkflowVersionStepInput!"
                    ]
                }
            ],
            "submitFormStep": [
                6,
                {
                    "input": [
                        373,
                        "SubmitFormStepInput!"
                    ]
                }
            ],
            "updateWorkflowRunStep": [
                238,
                {
                    "input": [
                        374,
                        "UpdateWorkflowRunStepInput!"
                    ]
                }
            ],
            "duplicateWorkflowVersionStep": [
                236,
                {
                    "input": [
                        375,
                        "DuplicateWorkflowVersionStepInput!"
                    ]
                }
            ],
            "createWorkflowVersionEdge": [
                236,
                {
                    "input": [
                        376,
                        "CreateWorkflowVersionEdgeInput!"
                    ]
                }
            ],
            "deleteWorkflowVersionEdge": [
                236,
                {
                    "input": [
                        376,
                        "CreateWorkflowVersionEdgeInput!"
                    ]
                }
            ],
            "createDraftFromWorkflowVersion": [
                239,
                {
                    "input": [
                        377,
                        "CreateDraftFromWorkflowVersionInput!"
                    ]
                }
            ],
            "updateWorkflowVersionPositions": [
                6,
                {
                    "input": [
                        378,
                        "UpdateWorkflowVersionPositionsInput!"
                    ]
                }
            ],
            "enablePostgresProxy": [
                230
            ],
            "disablePostgresProxy": [
                230
            ],
            "createPublicDomain": [
                214,
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
                137,
                {
                    "domain": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createEmailingDomain": [
                216,
                {
                    "domain": [
                        1,
                        "String!"
                    ],
                    "driver": [
                        217,
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
                216,
                {
                    "id": [
                        1,
                        "String!"
                    ]
                }
            ],
            "createOneAppToken": [
                42,
                {
                    "input": [
                        380,
                        "CreateOneAppTokenInput!"
                    ]
                }
            ],
            "syncApplication": [
                6,
                {
                    "manifest": [
                        10,
                        "JSON!"
                    ],
                    "packageJson": [
                        10,
                        "JSON!"
                    ],
                    "yarnLock": [
                        1,
                        "String!"
                    ]
                }
            ],
            "deleteApplication": [
                6,
                {
                    "packageJson": [
                        10,
                        "JSON!"
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
            "__typename": [
                1
            ]
        },
        "AnalyticsType": {},
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
                275
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
        "CreateOneObjectInput": {
            "object": [
                277
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
            "isRemote": [
                6
            ],
            "primaryKeyColumnType": [
                1
            ],
            "primaryKeyFieldMetadataSettings": [
                10
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
                279
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
                26
            ],
            "position": [
                26
            ],
            "aggregateOperation": [
                27
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
                26
            ],
            "position": [
                26
            ],
            "aggregateOperation": [
                27
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
                36
            ],
            "key": [
                37
            ],
            "icon": [
                1
            ],
            "position": [
                26
            ],
            "isCompact": [
                6
            ],
            "openRecordIn": [
                38
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                39
            ],
            "calendarFieldMetadataId": [
                3
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
                36
            ],
            "icon": [
                1
            ],
            "position": [
                26
            ],
            "isCompact": [
                6
            ],
            "openRecordIn": [
                38
            ],
            "kanbanAggregateOperation": [
                27
            ],
            "kanbanAggregateOperationFieldMetadataId": [
                3
            ],
            "anyFieldFilterValue": [
                1
            ],
            "calendarLayout": [
                39
            ],
            "calendarFieldMetadataId": [
                3
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
                34
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
                34
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
                26
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
                289
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
                26
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
                29
            ],
            "positionInViewFilterGroup": [
                26
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
                29
            ],
            "positionInViewFilterGroup": [
                26
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
                31
            ],
            "value": [
                10
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                26
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
                296
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
                31
            ],
            "value": [
                10
            ],
            "viewFilterGroupId": [
                3
            ],
            "positionInViewFilterGroup": [
                26
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
        "UpdateServerlessFunctionInput": {
            "id": [
                3
            ],
            "update": [
                300
            ],
            "__typename": [
                1
            ]
        },
        "UpdateServerlessFunctionInputUpdates": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "timeoutSeconds": [
                26
            ],
            "code": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CreateServerlessFunctionInput": {
            "name": [
                1
            ],
            "description": [
                1
            ],
            "timeoutSeconds": [
                26
            ],
            "code": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ExecuteServerlessFunctionInput": {
            "id": [
                3
            ],
            "payload": [
                10
            ],
            "version": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "PublishServerlessFunctionInput": {
            "id": [
                118
            ],
            "__typename": [
                1
            ]
        },
        "Upload": {},
        "FileFolder": {},
        "UpdateDatabaseEventTriggerInput": {
            "id": [
                1
            ],
            "update": [
                307
            ],
            "__typename": [
                1
            ]
        },
        "UpdateDatabaseEventTriggerInputUpdates": {
            "settings": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CreateDatabaseEventTriggerInput": {
            "settings": [
                10
            ],
            "serverlessFunctionId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCronTriggerInput": {
            "id": [
                1
            ],
            "update": [
                310
            ],
            "__typename": [
                1
            ]
        },
        "UpdateCronTriggerInputUpdates": {
            "settings": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CreateCronTriggerInput": {
            "settings": [
                10
            ],
            "serverlessFunctionId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRouteTriggerInput": {
            "id": [
                1
            ],
            "update": [
                313
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRouteTriggerInputUpdates": {
            "path": [
                1
            ],
            "isAuthRequired": [
                6
            ],
            "httpMethod": [
                119
            ],
            "__typename": [
                1
            ]
        },
        "CreateRouteTriggerInput": {
            "path": [
                1
            ],
            "isAuthRequired": [
                6
            ],
            "httpMethod": [
                119
            ],
            "serverlessFunctionId": [
                1
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
        "CreateApiKeyDTO": {
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
        "UpdateApiKeyDTO": {
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
        "RevokeApiKeyDTO": {
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
            "defaultRoleId": [
                3
            ],
            "isTwoFactorAuthenticationEnforced": [
                6
            ],
            "trashRetentionDays": [
                26
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
                10
            ],
            "modelConfiguration": [
                10
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
                10
            ],
            "modelConfiguration": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentHandoffInput": {
            "fromAgentId": [
                3
            ],
            "toAgentId": [
                3
            ],
            "description": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RemoveAgentHandoffInput": {
            "fromAgentId": [
                3
            ],
            "toAgentId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateAgentChatThreadInput": {
            "agentId": [
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
                331
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
                333
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
                12
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
                336
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
        "CreateOneFieldMetadataInput": {
            "field": [
                338
            ],
            "__typename": [
                1
            ]
        },
        "CreateFieldInput": {
            "type": [
                74
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
                10
            ],
            "options": [
                10
            ],
            "settings": [
                10
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
                10
            ],
            "morphRelationsCreationPayload": [
                10
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
                340
            ],
            "__typename": [
                1
            ]
        },
        "UpdateFieldInput": {
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
                10
            ],
            "options": [
                10
            ],
            "settings": [
                10
            ],
            "isLabelSyncedWithName": [
                6
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
                132
            ],
            "__typename": [
                1
            ]
        },
        "CreateRemoteServerInput": {
            "foreignDataWrapperType": [
                1
            ],
            "foreignDataWrapperOptions": [
                10
            ],
            "label": [
                1
            ],
            "userMappingOptions": [
                347
            ],
            "schema": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UserMappingOptions": {
            "user": [
                1
            ],
            "password": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UpdateRemoteServerInput": {
            "id": [
                3
            ],
            "foreignDataWrapperOptions": [
                10
            ],
            "label": [
                1
            ],
            "userMappingOptions": [
                349
            ],
            "schema": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "UserMappingOptionsUpdateInput": {
            "user": [
                1
            ],
            "password": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "RemoteTableInput": {
            "remoteServerId": [
                3
            ],
            "name": [
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
                63
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
                63
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
                63
            ],
            "objectMetadataId": [
                3
            ],
            "tabs": [
                354
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
                26
            ],
            "widgets": [
                355
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
                48
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                356
            ],
            "configuration": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "GridPositionInput": {
            "row": [
                26
            ],
            "column": [
                26
            ],
            "rowSpan": [
                26
            ],
            "columnSpan": [
                26
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
                26
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
                26
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
                48
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                356
            ],
            "configuration": [
                10
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
                48
            ],
            "objectMetadataId": [
                3
            ],
            "gridPosition": [
                356
            ],
            "configuration": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CreateWebhookDTO": {
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
        "UpdateWebhookDTO": {
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
        "DeleteWebhookDTO": {
            "id": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "EmailAccountConnectionParameters": {
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
        "ConnectionParameters": {
            "host": [
                1
            ],
            "port": [
                26
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
        "RunWorkflowVersionInput": {
            "workflowVersionId": [
                3
            ],
            "workflowRunId": [
                3
            ],
            "payload": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "ComputeStepOutputSchemaInput": {
            "step": [
                10
            ],
            "workflowVersionId": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "CreateWorkflowVersionStepInput": {
            "workflowVersionId": [
                3
            ],
            "stepType": [
                1
            ],
            "parentStepId": [
                1
            ],
            "parentStepConnectionOptions": [
                10
            ],
            "nextStepId": [
                3
            ],
            "position": [
                370
            ],
            "id": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowStepPositionInput": {
            "x": [
                26
            ],
            "y": [
                26
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkflowVersionStepInput": {
            "workflowVersionId": [
                3
            ],
            "step": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "DeleteWorkflowVersionStepInput": {
            "workflowVersionId": [
                3
            ],
            "stepId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "SubmitFormStepInput": {
            "stepId": [
                3
            ],
            "workflowRunId": [
                3
            ],
            "response": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkflowRunStepInput": {
            "workflowRunId": [
                3
            ],
            "step": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "DuplicateWorkflowVersionStepInput": {
            "stepId": [
                1
            ],
            "workflowVersionId": [
                1
            ],
            "__typename": [
                1
            ]
        },
        "CreateWorkflowVersionEdgeInput": {
            "workflowVersionId": [
                1
            ],
            "source": [
                1
            ],
            "target": [
                1
            ],
            "sourceConnectionOptions": [
                10
            ],
            "__typename": [
                1
            ]
        },
        "CreateDraftFromWorkflowVersionInput": {
            "workflowId": [
                3
            ],
            "workflowVersionIdToCopy": [
                3
            ],
            "__typename": [
                1
            ]
        },
        "UpdateWorkflowVersionPositionsInput": {
            "workflowVersionId": [
                3
            ],
            "positions": [
                379
            ],
            "__typename": [
                1
            ]
        },
        "WorkflowStepPositionUpdateInput": {
            "id": [
                1
            ],
            "position": [
                370
            ],
            "__typename": [
                1
            ]
        },
        "CreateOneAppTokenInput": {
            "appToken": [
                381
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
        "Subscription": {
            "onDbEvent": [
                176,
                {
                    "input": [
                        383,
                        "OnDbEventInput!"
                    ]
                }
            ],
            "__typename": [
                1
            ]
        },
        "OnDbEventInput": {
            "action": [
                177
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
        }
    }
}