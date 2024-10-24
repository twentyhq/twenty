import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
// ⚠️ WARNING ⚠️: Be sure to activate the workflow feature flag (IsWorkflowEnabled) before updating that mock.

export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery ={
    "objects": {
      "__typename": "ObjectConnection",
      "pageInfo": {
        "__typename": "PageInfo",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
        "endCursor": "YXJyYXljb25uZWN0aW9uOjM5"
      },
      "edges": [
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "f428ce3e-3b67-4aec-987f-9eef1e99bff0",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "auditLog",
            "namePlural": "auditLogs",
            "labelSingular": "Audit Log",
            "labelPlural": "Audit Logs",
            "description": "An audit log of actions performed in the system",
            "icon": "IconIconTimelineEvent",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "a935ad3a-e13d-4c77-b207-c194a2f54f94",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "25af1f7c-4239-4ab1-b193-31b6ce3a3182",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_ca389a7ad7595bb15d733535998",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "467060fa-1b4e-466f-9fe1-4cc4d15fb925",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "9be2f6c7-3386-4fc5-9778-67869d1e25e0"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "86518b18-e10b-407d-86ed-26be8f7e891f",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "28398de6-3b1a-4902-9fe6-d516026bb22e",
                    "type": "TEXT",
                    "name": "objectName",
                    "label": "Object name",
                    "description": "Object name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "533c7108-3e66-4d72-8e9d-0066b03ff61d",
                    "type": "RAW_JSON",
                    "name": "context",
                    "label": "Event context",
                    "description": "Json object to provide context (user, device, workspace, etc.)",
                    "icon": "IconListDetails",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cf6ec72a-e56a-41b7-91dd-342f33131a28",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bfa7fab5-e24f-418e-ad46-75fbb1d6a3a7",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fdf8ab92-9d70-44dd-b6d2-b0e7db014613",
                    "type": "UUID",
                    "name": "recordId",
                    "label": "Record id",
                    "description": "Record id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da01681a-8d32-4cc6-8c15-295e28b9103d",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Event workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0c472897-5f75-46e3-8052-9d0c6ac8b613",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f428ce3e-3b67-4aec-987f-9eef1e99bff0",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "da01681a-8d32-4cc6-8c15-295e28b9103d",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7eeab04c-203e-4b48-b904-0bbc3a5bd996",
                        "name": "auditLogs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a935ad3a-e13d-4c77-b207-c194a2f54f94",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Event name",
                    "description": "Event name/type",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2595a0ac-b012-401b-8551-f0a457b06f84",
                    "type": "RAW_JSON",
                    "name": "properties",
                    "label": "Event details",
                    "description": "Json value for event details",
                    "icon": "IconListDetails",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "829daa3b-6c3c-4802-a78a-ae003a61dc93",
                    "type": "TEXT",
                    "name": "objectMetadataId",
                    "label": "Object metadata id",
                    "description": "Object metadata id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9be2f6c7-3386-4fc5-9778-67869d1e25e0",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Event workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ef7f268e-659c-4b72-a384-e96f2bfff051",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "workflow",
            "namePlural": "workflows",
            "labelSingular": "Workflow",
            "labelPlural": "Workflows",
            "description": "A workflow",
            "icon": "IconSettingsAutomation",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "5248d870-b7d5-477a-b77e-29a1a988a370",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEy"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "755ba738-be9c-4e22-bb2f-df8ae7026d14",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the workflow",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "29c90b3e-dae6-43b4-8623-51e8b48e6490",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "755ba738-be9c-4e22-bb2f-df8ae7026d14",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b808bb46-8266-4bd2-8264-9321e505bfed",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "beb70ddb-3a89-4b83-87a0-516a77847e42",
                    "type": "MULTI_SELECT",
                    "name": "statuses",
                    "label": "Statuses",
                    "description": "The current statuses of the workflow versions",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "color": "yellow",
                        "label": "Draft",
                        "value": "DRAFT",
                        "position": 0
                      },
                      {
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 1
                      },
                      {
                        "color": "grey",
                        "label": "Deactivated",
                        "value": "DEACTIVATED",
                        "position": 2
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d093a286-2993-4ccc-9845-e78d0eec4241",
                    "type": "RELATION",
                    "name": "versions",
                    "label": "Versions",
                    "description": "Workflow versions linked to the workflow.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "112cfbaf-80ba-4f7b-a6b9-8f540748a19d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d093a286-2993-4ccc-9845-e78d0eec4241",
                        "name": "versions"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "18e6c02d-49c9-4ef7-b2a2-932cf46a0523",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3ed9c2f2-a41a-463e-8b61-e938ec9a5c31",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3ff9fc93-78ba-4969-a69e-faac7b6858a3",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Workflow record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a7a0698f-5df1-4b52-b43e-2e582390c1ff",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5248d870-b7d5-477a-b77e-29a1a988a370",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The workflow name",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6e8a6ef1-0da9-4d4b-a5d3-a3ee7878357b",
                    "type": "TEXT",
                    "name": "lastPublishedVersionId",
                    "label": "Last published Version Id",
                    "description": "The workflow last published version id",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "22966da9-f55a-4c36-ba0f-b75fd5fa23f9",
                    "type": "RELATION",
                    "name": "runs",
                    "label": "Runs",
                    "description": "Workflow runs linked to the workflow.",
                    "icon": "IconRun",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6e5a90ea-52c1-47c5-bfa8-dec2d99ab149",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "22966da9-f55a-4c36-ba0f-b75fd5fa23f9",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "640c8f0a-d564-4b77-ba9f-bd1d07b7bbd6",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9aefc5a0-0bd8-4080-b5fa-f0159478dccb",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d5f4f84e-2f59-4910-bac9-800d9ec84781",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b6eaead0-4be3-45ce-a57b-8e3e4cb29376",
                    "type": "RELATION",
                    "name": "eventListeners",
                    "label": "Event Listeners",
                    "description": "Workflow event listeners linked to the workflow.",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6571e3cb-d2f2-46d4-b649-893e442db169",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b6eaead0-4be3-45ce-a57b-8e3e4cb29376",
                        "name": "eventListeners"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fffc618-093f-40c3-acf0-00a0aa69e010",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7bd009cc-7c3f-4b49-ba97-53712340b8eb",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2c2d3d67-330e-4b16-a2a4-906c03d1cc62",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline activities linked to the workflow",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6c1b91fc-3642-4e7c-ac0f-ca8db5654295",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2c2d3d67-330e-4b16-a2a4-906c03d1cc62",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "582567a6-b4ab-4605-9e67-87ba3eb13eb7",
                        "name": "workflow"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "ec8bd398-1ba8-4b43-9fc6-14cffb1b15b5",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "favoriteFolder",
            "namePlural": "favoriteFolders",
            "labelSingular": "Favorite Folder",
            "labelPlural": "Favorite Folders",
            "description": "A Folder of favorites",
            "icon": "IconFolder",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "0b4cbf7a-c063-43b6-998e-3e8062fa25a5",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjY="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1faf1227-09ad-45cc-baec-f21e82ac610d",
                    "type": "NUMBER",
                    "name": "position",
                    "label": "Position",
                    "description": "Favorite folder position",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": 0,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "258fef4f-1291-40e3-b180-04625161f926",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0b4cbf7a-c063-43b6-998e-3e8062fa25a5",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6ca91bfe-a426-409f-b10e-2395d8f941ad",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Name of the favorite folder",
                    "icon": "IconText",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5712c594-ea5d-4e5c-a948-08818d10ef16",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites in this folder",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ee1c6b24-0205-4f40-9f50-6b0590ff671a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ec8bd398-1ba8-4b43-9fc6-14cffb1b15b5",
                        "nameSingular": "favoriteFolder",
                        "namePlural": "favoriteFolders"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5712c594-ea5d-4e5c-a948-08818d10ef16",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "26970678-89bf-4b25-b5a1-37183134d66a",
                        "name": "favoriteFolder"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a12a3cd9-988b-49d0-962e-1d722ad6beb5",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "268bb163-37ee-4e05-81a1-c6500ef2f379",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "e9a943b9-590c-468f-9f22-fc8eda8f3110",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "calendarEvent",
            "namePlural": "calendarEvents",
            "labelSingular": "Calendar event",
            "labelPlural": "Calendar events",
            "description": "Calendar events",
            "icon": "IconCalendar",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "e3c02a6d-92e5-444a-a621-7fd6721969d2",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE3"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7e7ff786-e259-4b7c-83e5-0fa5cd7f0336",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e3c02a6d-92e5-444a-a621-7fd6721969d2",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Title",
                    "icon": "IconH1",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "388b9ed8-9fa5-4007-8f1b-5f9f27fc153e",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "597653b0-ae1d-4a39-b0d0-3dd87b8ccf2c",
                    "type": "LINKS",
                    "name": "conferenceLink",
                    "label": "Meet Link",
                    "description": "Meet Link",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "532fdab5-81cd-4650-9d51-dcdcea9275e1",
                    "type": "RELATION",
                    "name": "calendarChannelEventAssociations",
                    "label": "Calendar Channel Event Associations",
                    "description": "Calendar Channel Event Associations",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5a685f16-da76-4593-bb9a-418054336165",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e9a943b9-590c-468f-9f22-fc8eda8f3110",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "532fdab5-81cd-4650-9d51-dcdcea9275e1",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a4c607d4-9d6d-435f-954f-6c6632b54b98",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "748fc945-d995-475c-ad6b-61f6d9bc2e6f",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "894985ba-4a19-4fb5-847e-49261ebaa479",
                    "type": "DATE_TIME",
                    "name": "externalUpdatedAt",
                    "label": "Update DateTime",
                    "description": "Update DateTime",
                    "icon": "IconCalendarCog",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a10ea983-c5df-44e4-9436-3a78e91cee83",
                    "type": "TEXT",
                    "name": "location",
                    "label": "Location",
                    "description": "Location",
                    "icon": "IconMapPin",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "217f48b9-db54-4584-a68b-6201cf7d6f91",
                    "type": "RELATION",
                    "name": "calendarEventParticipants",
                    "label": "Event Participants",
                    "description": "Event Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0c9e22cf-77c1-4418-b338-0e79a76492db",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e9a943b9-590c-468f-9f22-fc8eda8f3110",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "217f48b9-db54-4584-a68b-6201cf7d6f91",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1dd5f673-a00c-4686-a746-b0d92c6363fb",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "49a87187-de28-486b-a041-645895f9f7d3",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "03e43bc9-945e-44da-9a7b-60ef280d469e",
                    "type": "TEXT",
                    "name": "description",
                    "label": "Description",
                    "description": "Description",
                    "icon": "IconFileDescription",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9803007f-b3e2-40ad-b15d-ba2af3ea9231",
                    "type": "DATE_TIME",
                    "name": "externalCreatedAt",
                    "label": "Creation DateTime",
                    "description": "Creation DateTime",
                    "icon": "IconCalendarPlus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f553f0ed-d8af-4efb-ba54-17f3a7e52e27",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "19653ce6-ed7d-4414-bcc1-0f7e8cf4a9d6",
                    "type": "TEXT",
                    "name": "conferenceSolution",
                    "label": "Conference Solution",
                    "description": "Conference Solution",
                    "icon": "IconScreenShare",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ea9ee481-9ff4-46d3-b179-2d5a582a9c14",
                    "type": "BOOLEAN",
                    "name": "isCanceled",
                    "label": "Is canceled",
                    "description": "Is canceled",
                    "icon": "IconCalendarCancel",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": false,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "865c54d2-d660-4bb5-83ca-ec6919d4aae0",
                    "type": "DATE_TIME",
                    "name": "startsAt",
                    "label": "Start Date",
                    "description": "Start Date",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "58ad853f-5890-4545-ae67-a991d8171656",
                    "type": "DATE_TIME",
                    "name": "endsAt",
                    "label": "End Date",
                    "description": "End Date",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "614901c2-2b01-4b92-bbbe-e8883af5e4d9",
                    "type": "BOOLEAN",
                    "name": "isFullDay",
                    "label": "Is Full Day",
                    "description": "Is Full Day",
                    "icon": "Icon24Hours",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": false,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0c1a066f-6fe2-4079-936d-9ec5afc04bb3",
                    "type": "TEXT",
                    "name": "iCalUID",
                    "label": "iCal UID",
                    "description": "iCal UID",
                    "icon": "IconKey",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "14b2a7f6-83e8-42ee-b9f7-5475c2227231",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "attachment",
            "namePlural": "attachments",
            "labelSingular": "Attachment",
            "labelPlural": "Attachments",
            "description": "An attachment",
            "icon": "IconFileImport",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "7279aa5f-8cbd-4361-b64f-a68290030a31",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "b1182c30-9ce5-493f-b15a-4478346bb1f5",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_91e687ea21123af4e02c9a07a43",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4624cc8e-c911-494d-9064-e5f467b676d5",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "df5def91-0091-415b-8174-ec8bf6e17145"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "2f0eaf88-a4e8-402e-bde3-b2d0e557afc0",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_73615a6bdc972b013956b19c59e",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "2cec3e57-d5a6-4041-8439-e7910a5bc124",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "6455f8db-7ba0-4b03-b04f-ffe146787298"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3f97285e-385f-4c8d-943e-08e9a30a7916",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "3f06b1ac-ee1a-42cb-90a1-3c57bf363ab2"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9668e39c-0feb-4906-9f28-81a196499641",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_2055e4e583e9a2e5b4c239fd992",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3fc861f9-bc54-444f-97de-ab8c17f47f32",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "6455f8db-7ba0-4b03-b04f-ffe146787298"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "2fdd23bd-efa2-4e0f-866a-a575c1d180c8",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "104b57e3-6201-45c7-8aa2-da723b032191"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "bfef9821-7446-4640-9529-bb49b791ddcd",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_30f969e0ec549acca94396d3efe",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "237ec9f0-85dd-4e76-a5f3-1c36e59f07d3",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "6455f8db-7ba0-4b03-b04f-ffe146787298"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1e9d80ae-e7bf-4946-a617-8358966d4131",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "b897f103-9de2-4ed1-bae2-b0209ddd90e8"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9c5a8df7-cfe6-4da9-8f4a-a6608c5216ad",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_0698fed0e67005b7051b5d353b6",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "22d3e616-9b8b-41b2-bfb2-aa53ac82986a",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "6455f8db-7ba0-4b03-b04f-ffe146787298"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "7e16a383-0e70-4d68-acb7-dd2e3a676e18",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "eddeb362-8850-4774-a082-c94bfb4eeb13"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "0e814fa2-8d31-4e23-8d47-6882f8c5e160",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_3ca1d5243ff67f58c7c65c9a8a2",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "48dbcd4e-8685-46d9-b38f-31800afdeb08",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "6455f8db-7ba0-4b03-b04f-ffe146787298"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f2ac4e3d-34b7-416e-b7e8-4c0cb745d1de",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_63f7d3dda8101b0fde171835da6",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "71894875-89be-4af0-bc22-74d406953119",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "b745b990-aca6-4502-a9aa-c9f79da6b1c5"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjIy"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6455f8db-7ba0-4b03-b04f-ffe146787298",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "df5def91-0091-415b-8174-ec8bf6e17145",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Attachment company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eddeb362-8850-4774-a082-c94bfb4eeb13",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "Attachment note id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f6c8ef43-9dff-4559-bb9d-0d57c536bdd6",
                    "type": "RELATION",
                    "name": "author",
                    "label": "Author",
                    "description": "Attachment author",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f5c22b93-45df-463e-9ef1-0a7861a714f5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f6c8ef43-9dff-4559-bb9d-0d57c536bdd6",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "843953a7-e30e-42c9-955a-75e90b20fe60",
                        "name": "authoredAttachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3f06b1ac-ee1a-42cb-90a1-3c57bf363ab2",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "Attachment opportunity id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b897f103-9de2-4ed1-bae2-b0209ddd90e8",
                    "type": "UUID",
                    "name": "authorId",
                    "label": "Author id (foreign key)",
                    "description": "Attachment author id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "81543a57-40de-4277-8d1e-b922fa6d7042",
                    "type": "TEXT",
                    "name": "type",
                    "label": "Type",
                    "description": "Attachment type",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "42b46357-5012-46ad-bb45-3d58d02007c3",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "Attachment note",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "535a5c18-ff0a-491b-a3e5-102dcb6bec3b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "42b46357-5012-46ad-bb45-3d58d02007c3",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4e5c3bd5-111f-4528-8a50-5b218fa2665b",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d1e41a03-fd1b-4862-afaa-3191035cb113",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "Attachment Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.807Z",
                    "updatedAt": "2024-10-24T15:29:29.807Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "isForeignKey": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b4de732d-b345-48d4-a10d-c8aa3f7da06c",
                    "type": "TEXT",
                    "name": "fullPath",
                    "label": "Full path",
                    "description": "Attachment full path",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4c5b938e-51cd-49f1-92c5-881072287b92",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "Attachment task",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ad30f83b-7991-4949-b64b-a6674d6c90ad",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4c5b938e-51cd-49f1-92c5-881072287b92",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d66c8a3f-b90e-40de-8fc3-c07efd0c42c6",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e96c0c1a-54f4-4a6b-acfe-8cac61aa2ea3",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "Attachment Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.808Z",
                    "updatedAt": "2024-10-24T15:29:29.808Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "58433ee2-4916-4e3c-8213-576cc1d6126c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e96c0c1a-54f4-4a6b-acfe-8cac61aa2ea3",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "468d159c-c488-4c03-a5eb-5ce33b60d8cb",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "104b57e3-6201-45c7-8aa2-da723b032191",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "Attachment task id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7279aa5f-8cbd-4361-b64f-a68290030a31",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Attachment name",
                    "icon": "IconFileUpload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b0a12aeb-d86e-4e2f-ba89-59a292889a2f",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "83cd6a46-9e06-4d9d-ba4f-f321794bf6d5",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Attachment company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f1d31fd9-4aab-48a3-9d59-309d3612ccb3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "83cd6a46-9e06-4d9d-ba4f-f321794bf6d5",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2f917e6f-8b0a-44fd-8f26-ea5fc843d7c2",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1329cbe7-0755-4fa0-b10b-b1be40e96db2",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0c6e51a8-3e0f-4afb-98d0-150e292fa05a",
                    "type": "RELATION",
                    "name": "activity",
                    "label": "Activity",
                    "description": "Attachment activity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d5ed2a81-6683-4803-a30c-8aa4bbc77820",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0c6e51a8-3e0f-4afb-98d0-150e292fa05a",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "39da0b22-b6d1-4ffb-b06a-cff067f3cfa2",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b745b990-aca6-4502-a9aa-c9f79da6b1c5",
                    "type": "UUID",
                    "name": "activityId",
                    "label": "Activity id (foreign key)",
                    "description": "Attachment activity id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dcfffc5c-3260-48ca-ad89-fd1ed12cdd1f",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "666a9ae3-34b0-4f10-b70f-6fe54023ebe7",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "Attachment opportunity",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07be1891-a9d0-4126-91d1-e2e6730186a1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "666a9ae3-34b0-4f10-b70f-6fe54023ebe7",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "66417686-4a5f-4dd3-a262-9d3edf36ab82",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fc56e684-3a1a-48b5-a9a6-d17bd4d019a6",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Attachment person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "83b47cc7-ba0b-4e2e-8699-407b7372bcc0",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Attachment person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b1e512da-3b6b-4579-a151-3f52fa688fe9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "83b47cc7-ba0b-4e2e-8699-407b7372bcc0",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9bf5b981-1617-4129-bf48-a4790efe315c",
                        "name": "attachments"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "dfadf00a-cfa5-4e3f-93b7-9c73f39d9e6f",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "comment",
            "namePlural": "comments",
            "labelSingular": "Comment",
            "labelPlural": "Comments",
            "description": "A comment",
            "icon": "IconMessageCircle",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "c77a7568-9898-45a8-a852-98793d0aec2a",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4196c363-1d2c-48c7-bc51-25679e1bddca",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_13404a209dc268d64d59e458f86",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4114a82a-d851-4821-ad5b-906e60b289b4",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "15dca403-d3f5-486a-b7b0-7e97973df11f"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d998e28a-45b6-4662-be89-4e6d6348b579",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_59b3acef02e58676e983e724ae1",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e7f57cbc-fc38-4785-9551-b7ded7ff59d2",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "0d7e6c81-7d58-48ea-91ac-243e30ffc722"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjg="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6437467d-7756-48f9-97ce-d9e2dff41579",
                    "type": "RELATION",
                    "name": "activity",
                    "label": "Activity",
                    "description": "Comment activity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c564ab2d-d476-47ba-b7d8-10f9127fe138",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "dfadf00a-cfa5-4e3f-93b7-9c73f39d9e6f",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6437467d-7756-48f9-97ce-d9e2dff41579",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "78357ea5-743a-484e-88b7-bc404fbb1a9d",
                        "name": "comments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "15dca403-d3f5-486a-b7b0-7e97973df11f",
                    "type": "UUID",
                    "name": "activityId",
                    "label": "Activity id (foreign key)",
                    "description": "Comment activity id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62c39d2d-5984-4f99-8f39-bcb32a1e9dc0",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1bdab1df-c487-4b46-86d3-409fda1d0889",
                    "type": "TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Comment body",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "39eb3492-7f04-4e72-ae05-2f04010b64f8",
                    "type": "UUID",
                    "name": "authorId",
                    "label": "Author id (foreign key)",
                    "description": "Comment author id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ddc4e354-7aed-4d20-836b-e5fe04882506",
                    "type": "RELATION",
                    "name": "author",
                    "label": "Author",
                    "description": "Comment author",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1c0aa27b-64e3-4651-b889-995fb1cc4cda",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "dfadf00a-cfa5-4e3f-93b7-9c73f39d9e6f",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ddc4e354-7aed-4d20-836b-e5fe04882506",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "13c5834e-7bbb-4b00-8be8-5b727062cca7",
                        "name": "authoredComments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44371874-7c43-41d5-9a19-c58b29b4b210",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0d7e6c81-7d58-48ea-91ac-243e30ffc722",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c77a7568-9898-45a8-a852-98793d0aec2a",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "cc017b4f-ba4a-4673-8216-103e580bcd96",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "messageChannelMessageAssociation",
            "namePlural": "messageChannelMessageAssociations",
            "labelSingular": "Message Channel Message Association",
            "labelPlural": "Message Channel Message Associations",
            "description": "Message Synced with a Message Channel",
            "icon": "IconMessage",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "59abe433-8dbd-47eb-8e9d-fe21ede8e3ec",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "cdd8671c-d113-4ae8-a1cb-84099fb92cc3",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_671dd9e01a80d1e4c89fc166c3b",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "752ac8d3-ff07-4a12-b429-ab4fe558a4a9",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "2a2bd740-668b-4df4-a6bb-0f8cec3658eb"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1e1ff2f6-24ac-4201-97a7-549c1e3cdb05",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "a15f98d9-67e0-419b-bd89-d6b0fcdba6c3"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e22e788a-8966-4421-9d60-ae695d7c717c",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_63953e5f88351922043480b8801",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": []
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEw"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fa1d23f2-3b48-48f5-8d35-65c48fbeb1e7",
                    "type": "SELECT",
                    "name": "direction",
                    "label": "Direction",
                    "description": "Message Direction",
                    "icon": "IconDirection",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'INCOMING'",
                    "options": [
                      {
                        "id": "6a7914d1-3c72-4214-b745-077836fdd2bd",
                        "color": "green",
                        "label": "Incoming",
                        "value": "INCOMING",
                        "position": 0
                      },
                      {
                        "id": "12092d3a-c44d-476d-84d2-7b4a712e1332",
                        "color": "blue",
                        "label": "Outgoing",
                        "value": "OUTGOING",
                        "position": 1
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "94748751-22cf-4d25-bdf6-9f8729408d15",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2a2bd740-668b-4df4-a6bb-0f8cec3658eb",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a2ee484d-f279-4c0f-a698-afd351dab252",
                    "type": "TEXT",
                    "name": "messageThreadExternalId",
                    "label": "Thread External Id",
                    "description": "Thread id from the messaging provider",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c1d07736-8367-4f07-8ea4-6e788cfde082",
                    "type": "RELATION",
                    "name": "message",
                    "label": "Message Id",
                    "description": "Message Id",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "afb35c8c-63f9-40aa-9c56-e4631c7609a5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cc017b4f-ba4a-4673-8216-103e580bcd96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c1d07736-8367-4f07-8ea4-6e788cfde082",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "33e51e27-22b8-42be-a904-7c4646d26191",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c0f2c4ac-0516-4fdb-bc2b-e3cbf1f1da1d",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "01f354b3-b46c-4f9e-a36f-759216e30c10",
                    "type": "UUID",
                    "name": "messageChannelId",
                    "label": "Message Channel Id id (foreign key)",
                    "description": "Message Channel Id id foreign key",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a15f98d9-67e0-419b-bd89-d6b0fcdba6c3",
                    "type": "UUID",
                    "name": "messageId",
                    "label": "Message Id id (foreign key)",
                    "description": "Message Id id foreign key",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59abe433-8dbd-47eb-8e9d-fe21ede8e3ec",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e4c4f46d-56d0-4705-a752-38c36c134290",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4cb9f95f-7c57-416e-8608-aab68ab4807d",
                    "type": "RELATION",
                    "name": "messageChannel",
                    "label": "Message Channel Id",
                    "description": "Message Channel Id",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f808c0da-79a8-4a6c-b1e0-eda979e0638c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cc017b4f-ba4a-4673-8216-103e580bcd96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4cb9f95f-7c57-416e-8608-aab68ab4807d",
                        "name": "messageChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2011c034-fdd0-4e19-8a52-ea3d91c4df37",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d1065fbf-221e-4ffb-9acd-423f6f97e919",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "14e01c4d-dacf-40b7-9d06-742ea2aa5997",
                    "type": "TEXT",
                    "name": "messageExternalId",
                    "label": "Message External Id",
                    "description": "Message id from the messaging provider",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "task",
            "namePlural": "tasks",
            "labelSingular": "Task",
            "labelPlural": "Tasks",
            "description": "A task",
            "icon": "IconCheckbox",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "73dba800-6484-4459-b036-1f46d58daae6",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "0159cf14-c169-4044-afc2-56d6186fecab",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_ee5298b25512b38b29390e084f7",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0d411208-92a2-4a3a-a626-7ec0e2ff23ee",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "3fb04c13-cd6c-4d29-9c18-ee7aad73f877"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE1"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3afb72cf-47bb-466f-89e1-f5adf0f59b18",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "75be3478-1ca6-460b-a72a-1e277a6bd7d8",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "32c6453f-a197-411c-8998-bfea031d7e5c",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a795ca7d-ece1-4b6b-9c87-7ecf85bc83fe",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a2ee5a7d-8c87-4d80-9198-b083e9762a06",
                    "type": "RICH_TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Task body",
                    "icon": "IconFilePencil",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c4522972-1dde-4cf5-979d-3996bc239a04",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Relations",
                    "description": "Task targets",
                    "icon": "IconArrowUpRight",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a104019e-02f8-460b-aae1-d2734da0c0a1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c4522972-1dde-4cf5-979d-3996bc239a04",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c5f4a3eb-b29e-4236-b2ee-73670bc788b8",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08fcd66a-4602-4504-b925-dd96672a45eb",
                    "type": "RELATION",
                    "name": "assignee",
                    "label": "Assignee",
                    "description": "Task assignee",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b89531e6-d031-4d27-844c-2f158ea462e8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "08fcd66a-4602-4504-b925-dd96672a45eb",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0cb6261d-2a24-4221-b380-0ec8456d6741",
                        "name": "assignedTasks"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d496fc28-ce80-4d4d-b591-17f1b2063a25",
                    "type": "DATE_TIME",
                    "name": "dueAt",
                    "label": "Due Date",
                    "description": "Task due date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "79a073d0-f0a1-4ef6-95cc-c1bd49b5a513",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Task record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4af7562e-ff36-49a8-b109-f0a21010c8d4",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the task.",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ae60adb6-1a89-463b-8f3c-6f45fdc13e1f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4af7562e-ff36-49a8-b109-f0a21010c8d4",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2d191700-fade-4cd2-9aa6-33c2d8facc76",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3fb04c13-cd6c-4d29-9c18-ee7aad73f877",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4fe08580-4037-4c69-a4b9-3f6fbd7860b1",
                    "type": "SELECT",
                    "name": "status",
                    "label": "Status",
                    "description": "Task status",
                    "icon": "IconCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'TODO'",
                    "options": [
                      {
                        "id": "9abd02c0-d9e0-42b7-a97b-620b253a872f",
                        "color": "sky",
                        "label": "To do",
                        "value": "TODO",
                        "position": 0
                      },
                      {
                        "id": "a6208bc0-1bf8-400c-932b-49de78e33a76",
                        "color": "purple",
                        "label": "In progress",
                        "value": "IN_PROGESS",
                        "position": 1
                      },
                      {
                        "id": "ec907f30-003d-4d6c-98ca-e1d3060ec53c",
                        "color": "green",
                        "label": "Done",
                        "value": "DONE",
                        "position": 1
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "60977dbe-9321-44c5-b11d-a82cd0efdcc0",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the task",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2aff2742-cf44-44f5-be04-3a91c28c9653",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "60977dbe-9321-44c5-b11d-a82cd0efdcc0",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e161d71b-a9e7-422e-8a6e-13ab66a0f06e",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d66c8a3f-b90e-40de-8fc3-c07efd0c42c6",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Task attachments",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ad30f83b-7991-4949-b64b-a6674d6c90ad",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d66c8a3f-b90e-40de-8fc3-c07efd0c42c6",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4c5b938e-51cd-49f1-92c5-881072287b92",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "492a51e0-3494-4688-a109-dfd94290f284",
                    "type": "UUID",
                    "name": "assigneeId",
                    "label": "Assignee id (foreign key)",
                    "description": "Task assignee id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "73dba800-6484-4459-b036-1f46d58daae6",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Task title",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "workflowRun",
            "namePlural": "workflowRuns",
            "labelSingular": "Workflow Run",
            "labelPlural": "Workflow Runs",
            "description": "A workflow run",
            "icon": "IconSettingsAutomation",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "73d2313c-40f8-4e1d-8202-147809beb181",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "2d703c3a-beba-479f-a473-80b2c05e5736",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_eee970874f46ff99eefc0015001",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "24a53114-e212-47a7-a40b-be4f5e8e3742",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "91afe1fd-b886-4422-938c-fce90ac720d7"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "aee700e1-3ea0-4a1d-8c19-d1a8dd380a57",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_faa5772594c4ce15b9305919f2f",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1f6bdb99-7cb3-49d7-99ad-52b9513fc238",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "e9c75b11-2a94-4e59-9c01-9ade06234528"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d781f308-8c7f-49a1-a2c5-a1946f1b0925",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "513e07d4-0b94-4d1f-861a-8ada81e03f08"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE2"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1fa45cb3-09aa-4560-b681-e8d0f0e5b3f9",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Workflow run position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "99af4f6e-f8ef-411c-8409-92c5175e7f49",
                    "type": "RELATION",
                    "name": "workflowVersion",
                    "label": "Workflow version",
                    "description": "Workflow version linked to the run.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bbb844e8-1726-48db-833d-a3fc47a5bb59",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "99af4f6e-f8ef-411c-8409-92c5175e7f49",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2e7eac44-d7de-4197-9523-dc2e63dd3e32",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "530bd2d9-0415-4b33-966a-5f993a85b246",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3078179c-5c66-4827-bfdf-019dd1a9bac3",
                    "type": "DATE_TIME",
                    "name": "startedAt",
                    "label": "Workflow run started at",
                    "description": "Workflow run started at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "05c56107-9e13-42e8-8538-5fb11d33953f",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3207a0a3-3511-4a59-84ae-f0565a83b07d",
                    "type": "SELECT",
                    "name": "status",
                    "label": "Workflow run status",
                    "description": "Workflow run status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'NOT_STARTED'",
                    "options": [
                      {
                        "id": "bb2365cf-f972-4ac5-ae21-3939305d83c8",
                        "color": "grey",
                        "label": "Not started",
                        "value": "NOT_STARTED",
                        "position": 0
                      },
                      {
                        "id": "d7106ee4-6c0e-4bc2-942d-af593b42ae72",
                        "color": "yellow",
                        "label": "Running",
                        "value": "RUNNING",
                        "position": 1
                      },
                      {
                        "id": "7aee0cf8-6acd-46f5-9a95-e7d45af43fb8",
                        "color": "green",
                        "label": "Completed",
                        "value": "COMPLETED",
                        "position": 2
                      },
                      {
                        "id": "a701c9d9-c7b0-494d-ad26-e9c8805926f8",
                        "color": "red",
                        "label": "Failed",
                        "value": "FAILED",
                        "position": 3
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "73d2313c-40f8-4e1d-8202-147809beb181",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Name of the workflow run",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3c959975-7dc7-4fce-b2ce-a4008bef10b7",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "513e07d4-0b94-4d1f-861a-8ada81e03f08",
                    "type": "UUID",
                    "name": "workflowVersionId",
                    "label": "Workflow version id (foreign key)",
                    "description": "Workflow version linked to the run. id foreign key",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "71cd4fda-9e00-4953-8232-35add18d7ead",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the workflow run",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dd1f9df9-654b-4a49-91f5-ae447dbd83d0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "71cd4fda-9e00-4953-8232-35add18d7ead",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f248ab3b-833b-43db-9e60-ed6ab456fedb",
                        "name": "workflowRun"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "87dc5c6e-4ba2-4e8c-b055-b245f0705b0f",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e9c75b11-2a94-4e59-9c01-9ade06234528",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6393f27a-0473-4ebe-a8e3-04d07a3b8c77",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline activities linked to the run",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "48734784-6855-4f33-bcef-e55f1937ec90",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6393f27a-0473-4ebe-a8e3-04d07a3b8c77",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8bd70f42-8e5b-4d4c-814b-788e8a0cb5cf",
                        "name": "workflowRun"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "760e2f34-85af-4988-8ddd-e833e34d3973",
                    "type": "DATE_TIME",
                    "name": "endedAt",
                    "label": "Workflow run ended at",
                    "description": "Workflow run ended at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "640c8f0a-d564-4b77-ba9f-bd1d07b7bbd6",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "Workflow linked to the run.",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6e5a90ea-52c1-47c5-bfa8-dec2d99ab149",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "640c8f0a-d564-4b77-ba9f-bd1d07b7bbd6",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "22966da9-f55a-4c36-ba0f-b75fd5fa23f9",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "91afe1fd-b886-4422-938c-fce90ac720d7",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "Workflow linked to the run. id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e653361d-dc7c-441b-b2d2-555cfec02b18",
                    "type": "RAW_JSON",
                    "name": "output",
                    "label": "Output",
                    "description": "Json object to provide output of the workflow run",
                    "icon": "IconText",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "rocket",
            "namePlural": "rockets",
            "labelSingular": "Rocket",
            "labelPlural": "Rockets",
            "description": "A rocket",
            "icon": "IconRocket",
            "isCustom": true,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:29.795Z",
            "updatedAt": "2024-10-24T15:29:29.795Z",
            "labelIdentifierFieldMetadataId": null,
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4348f4d6-1cec-4d3a-9c53-ee47b4404df7",
                    "createdAt": "2024-10-24T15:29:29.822Z",
                    "updatedAt": "2024-10-24T15:29:29.822Z",
                    "name": "IDX_530792e4278e7696c4e3e3e55f8",
                    "indexWhereClause": null,
                    "indexType": "GIN",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e3b9b708-678a-439a-bfae-25a46f055c23",
                            "createdAt": "2024-10-24T15:29:29.822Z",
                            "updatedAt": "2024-10-24T15:29:29.822Z",
                            "order": 0,
                            "fieldMetadataId": "fb6b5f2f-8b45-4e0a-84ca-39973c69f2e8"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6d46021e-cabb-4725-bc24-50bd41e9c026",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the Rocket",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.802Z",
                    "updatedAt": "2024-10-24T15:29:29.802Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7b53ce09-89d4-45d6-99b9-d3162c432195",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6d46021e-cabb-4725-bc24-50bd41e9c026",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8f93025f-f458-49fc-ac21-11401e3c9c32",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "26702c98-6f22-4666-bec3-c089400daa81",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the Rocket",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.810Z",
                    "updatedAt": "2024-10-24T15:29:29.810Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dcfb1a2e-912e-48e8-8e6f-350a4559bbf2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "26702c98-6f22-4666-bec3-c089400daa81",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "73dca6dc-4b7f-4062-ac33-3c05508078de",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c6a2602a-70a2-44ab-a047-12b62dd5001e",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.795Z",
                    "updatedAt": "2024-10-24T15:29:29.795Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9de25d54-278b-4086-b4d6-08287edbe5e3",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites tied to the Rocket",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.805Z",
                    "updatedAt": "2024-10-24T15:29:29.805Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1321e022-08b4-4864-a413-f671e7ea3aaa",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9de25d54-278b-4086-b4d6-08287edbe5e3",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4dfb8a78-3edc-4852-a939-a59e240a295a",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8474e44e-4024-4373-9dab-486901db453d",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.795Z",
                    "updatedAt": "2024-10-24T15:29:29.795Z",
                    "defaultValue": "'Untitled'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a5d75fbb-67ac-4961-823a-14fb82fe23f6",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities tied to the Rocket",
                    "icon": "IconIconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.799Z",
                    "updatedAt": "2024-10-24T15:29:29.799Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fa79944b-9afe-4250-aad0-2aa85b5a4e77",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a5d75fbb-67ac-4961-823a-14fb82fe23f6",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9b92d85e-8582-4b09-a093-c335583958c1",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08361252-6e22-4d32-88e3-7f5da4a9e893",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.795Z",
                    "updatedAt": "2024-10-24T15:29:29.795Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fb6b5f2f-8b45-4e0a-84ca-39973c69f2e8",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": null,
                    "isCustom": false,
                    "isActive": false,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.820Z",
                    "updatedAt": "2024-10-24T15:29:29.820Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f848b4f0-a210-4d93-a042-7834b581f23f",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the Rocket",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.813Z",
                    "updatedAt": "2024-10-24T15:29:29.813Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "23b55de4-fb74-487e-9c64-f6c861fe345f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f848b4f0-a210-4d93-a042-7834b581f23f",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "76b360ea-c7d9-4f57-bf68-215b3e3c7373",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "468d159c-c488-4c03-a5eb-5ce33b60d8cb",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments tied to the Rocket",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.808Z",
                    "updatedAt": "2024-10-24T15:29:29.808Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "58433ee2-4916-4e3c-8213-576cc1d6126c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "468d159c-c488-4c03-a5eb-5ce33b60d8cb",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e96c0c1a-54f4-4a6b-acfe-8cac61aa2ea3",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "716856c6-510a-4676-bd3b-68daed2d5dd2",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.795Z",
                    "updatedAt": "2024-10-24T15:29:29.795Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f8762717-e04c-4ae9-af7a-157548c3be4f",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.795Z",
                    "updatedAt": "2024-10-24T15:29:29.795Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0424cb1c-993e-47f1-a185-b01c3f113c58",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.795Z",
                    "updatedAt": "2024-10-24T15:29:29.795Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "654d990f-c621-4d8e-8d7d-a3fd9843bfc1",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Deletion date",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.795Z",
                    "updatedAt": "2024-10-24T15:29:29.795Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "b5f127b7-7c58-4c72-8a41-3dafc678cf0f",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "viewGroup",
            "namePlural": "viewGroups",
            "labelSingular": "View Group",
            "labelPlural": "View Groups",
            "description": "(System) View Groups",
            "icon": "IconTag",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "1b11330f-01b5-4da6-8abc-f4f698ec5156",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5ca1f482-98e1-4634-885d-2db70514c21e",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_3819ec73f42c743a0d3700ae8e4",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "cb9eb7c3-0c65-4b59-b40d-dcaa64b0d00d",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "61b229c9-983e-4660-87b7-0af66d501408"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjk="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e509434d-dd89-4d98-b45f-d3215932e023",
                    "type": "TEXT",
                    "name": "fieldValue",
                    "label": "Field Value",
                    "description": "Group by this field value",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "494f493f-29cd-4b89-9fd6-defee6bd7f1c",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View Group related view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9ced4eaa-f10c-40f9-8604-77e64eb8542b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5f127b7-7c58-4c72-8a41-3dafc678cf0f",
                        "nameSingular": "viewGroup",
                        "namePlural": "viewGroups"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "494f493f-29cd-4b89-9fd6-defee6bd7f1c",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9c7f1615-3a5f-463f-b7ce-3f29380057fe",
                        "name": "viewGroups"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1be9ebb8-ffba-45af-b116-aa50372cf035",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f0c4b689-54ec-46b1-9d48-b7041095f477",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View Group related view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5a7c4e49-9e5c-4371-9055-d040c78313de",
                    "type": "UUID",
                    "name": "fieldMetadataId",
                    "label": "Field Metadata Id",
                    "description": "View Group target field",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1b11330f-01b5-4da6-8abc-f4f698ec5156",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "06c2b17b-62f2-424d-8733-b3ed9e4d1462",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "70182d86-62da-4009-9ef4-79316979d4b5",
                    "type": "NUMBER",
                    "name": "position",
                    "label": "Position",
                    "description": "View Field position",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": 0,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "61b229c9-983e-4660-87b7-0af66d501408",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "740fbb28-3d03-4432-abc8-d63614c4a69b",
                    "type": "BOOLEAN",
                    "name": "isVisible",
                    "label": "Visible",
                    "description": "View Group visibility",
                    "icon": "IconEye",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "b091b1f5-9cf9-4ecd-9c4e-f02663a052d9",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "webhook",
            "namePlural": "webhooks",
            "labelSingular": "Webhook",
            "labelPlural": "Webhooks",
            "description": "A webhook",
            "icon": "IconRobot",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "82e8fa52-d4c0-4e5a-bacb-e4fcbe09f633",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjY="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e77ff70e-6abc-43be-9d3a-ce5422ecf741",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0ba0c5d4-964d-473d-be4b-802fcbb3c788",
                    "type": "ARRAY",
                    "name": "operations",
                    "label": "Operations",
                    "description": "Webhook operations",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": [
                      "*.*"
                    ],
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f1315104-10f2-44a7-a502-00cae6f54352",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "67c7649b-fee0-4ebb-83aa-ba095520d781",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f9b9fb13-682b-41a8-b0b8-bd6a2eb4fd62",
                    "type": "TEXT",
                    "name": "description",
                    "label": "Description",
                    "description": null,
                    "icon": "IconInfo",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "68559308-6ab2-4bd4-960e-3c6e1508b489",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "82e8fa52-d4c0-4e5a-bacb-e4fcbe09f633",
                    "type": "TEXT",
                    "name": "targetUrl",
                    "label": "Target Url",
                    "description": "Webhook target url",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "af711b7b-2e1a-4c52-a1ec-889a3030beae",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "connectedAccount",
            "namePlural": "connectedAccounts",
            "labelSingular": "Connected Account",
            "labelPlural": "Connected Accounts",
            "description": "A connected account",
            "icon": "IconAt",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "0406e813-3d53-400d-aeee-89534c9313cb",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "50e3d87f-c9c1-4c18-bee1-e89295109feb",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_7d1b454b2a538273bdb947e848f",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b40ea845-3ebe-4485-a763-7f087e08783d",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "0c4b0337-81c4-4810-8bc7-866eb255b366"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE1"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2b162fc7-8860-4ccf-b4e4-5792f686c380",
                    "type": "RELATION",
                    "name": "accountOwner",
                    "label": "Account Owner",
                    "description": "Account Owner",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3503c858-2de3-4919-ae99-aa278f039230",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "af711b7b-2e1a-4c52-a1ec-889a3030beae",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2b162fc7-8860-4ccf-b4e4-5792f686c380",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6b7c0e7e-bb86-431a-acb4-158eeeacc770",
                        "name": "connectedAccounts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0c4b0337-81c4-4810-8bc7-866eb255b366",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "047a3bd4-833e-44bc-81a8-d108f79461a4",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bd7eb5c9-5e3b-4d68-a6de-39f217e6cdc9",
                    "type": "RELATION",
                    "name": "messageChannels",
                    "label": "Message Channels",
                    "description": "Message Channels",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6ede8b89-8c0e-4e9d-b2e0-5f4ecd853b9f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "af711b7b-2e1a-4c52-a1ec-889a3030beae",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bd7eb5c9-5e3b-4d68-a6de-39f217e6cdc9",
                        "name": "messageChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2011c034-fdd0-4e19-8a52-ea3d91c4df37",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "51e51f74-046f-4dbe-92a9-b63583a32984",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0406e813-3d53-400d-aeee-89534c9313cb",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "handle",
                    "description": "The account handle (email, username, phone number, etc.)",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b394e738-d206-4ca0-af5f-0b5f997fab99",
                    "type": "UUID",
                    "name": "accountOwnerId",
                    "label": "Account Owner id (foreign key)",
                    "description": "Account Owner id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d9cf6b94-ac23-46b3-815e-fd0413adbf76",
                    "type": "TEXT",
                    "name": "accessToken",
                    "label": "Access Token",
                    "description": "Messaging provider access token",
                    "icon": "IconKey",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f9dec582-9089-482b-b096-93789e188470",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6d1e71da-98fc-477c-916a-cffb90b64472",
                    "type": "TEXT",
                    "name": "handleAliases",
                    "label": "Handle Aliases",
                    "description": "Handle Aliases",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6d854bef-b821-4f3a-8043-a1c33d008fff",
                    "type": "DATE_TIME",
                    "name": "authFailedAt",
                    "label": "Auth failed at",
                    "description": "Auth failed at",
                    "icon": "IconX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2518170e-e3c1-436f-a6ab-680900a6ef30",
                    "type": "ARRAY",
                    "name": "scopes",
                    "label": "Scopes",
                    "description": "Scopes",
                    "icon": "IconSettings",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44046074-e851-4f8a-9b87-fb03e22cbd92",
                    "type": "TEXT",
                    "name": "provider",
                    "label": "provider",
                    "description": "The account provider",
                    "icon": "IconSettings",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cbe2b118-255e-4c79-b978-8491eaa994d5",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b97a5f27-7cd5-4545-a2ce-cf11626359a2",
                    "type": "TEXT",
                    "name": "refreshToken",
                    "label": "Refresh Token",
                    "description": "Messaging provider refresh token",
                    "icon": "IconKey",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bf3d62dc-45d9-4d05-94cd-00e60fbc5eb8",
                    "type": "RELATION",
                    "name": "calendarChannels",
                    "label": "Calendar Channels",
                    "description": "Calendar Channels",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1a1125cc-dbb6-48b0-ac4b-bd45acc9b647",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "af711b7b-2e1a-4c52-a1ec-889a3030beae",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bf3d62dc-45d9-4d05-94cd-00e60fbc5eb8",
                        "name": "calendarChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "25c4ad74-36ab-4244-bccd-9671df26cd06",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "01a3a94d-60ae-498e-ba4e-3899afd809a4",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "82a0a5d7-f765-4d87-85f5-bfd6c3803e98",
                    "type": "TEXT",
                    "name": "lastSyncHistoryId",
                    "label": "Last sync history ID",
                    "description": "Last sync history ID",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "workspaceMember",
            "namePlural": "workspaceMembers",
            "labelSingular": "Workspace Member",
            "labelPlural": "Workspace Members",
            "description": "A workspace member",
            "icon": "IconUserCircle",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "67752c0c-acc3-4743-a05d-654127f3c8c1",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI1"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec165e36-2f6a-4a4a-8f70-58d03da39c13",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fa24b233-fcad-4f1d-ad36-c56663994640",
                    "type": "TEXT",
                    "name": "locale",
                    "label": "Language",
                    "description": "Preferred language",
                    "icon": "IconLanguage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'en'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "13c5834e-7bbb-4b00-8be8-5b727062cca7",
                    "type": "RELATION",
                    "name": "authoredComments",
                    "label": "Authored comments",
                    "description": "Authored comments",
                    "icon": "IconComment",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1c0aa27b-64e3-4651-b889-995fb1cc4cda",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "13c5834e-7bbb-4b00-8be8-5b727062cca7",
                        "name": "authoredComments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "dfadf00a-cfa5-4e3f-93b7-9c73f39d9e6f",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ddc4e354-7aed-4d20-836b-e5fe04882506",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6b7c0e7e-bb86-431a-acb4-158eeeacc770",
                    "type": "RELATION",
                    "name": "connectedAccounts",
                    "label": "Connected accounts",
                    "description": "Connected accounts",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3503c858-2de3-4919-ae99-aa278f039230",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6b7c0e7e-bb86-431a-acb4-158eeeacc770",
                        "name": "connectedAccounts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "af711b7b-2e1a-4c52-a1ec-889a3030beae",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2b162fc7-8860-4ccf-b4e4-5792f686c380",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "03dcd806-fc7f-418c-89fd-30d656b85160",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a9f67b26-9b35-4d3b-97c0-7e0cf27ec70f",
                    "type": "RELATION",
                    "name": "messageParticipants",
                    "label": "Message Participants",
                    "description": "Message Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f1d5cfa5-1dcb-458d-bd4f-5431c617733d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a9f67b26-9b35-4d3b-97c0-7e0cf27ec70f",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6c3dfa43-d32f-4707-a73b-e2c1d94b2f3b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8764d202-eaa0-48e7-8912-3a3cde6e8d2b",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7e1a04ea-6105-4d9a-af6f-0b83b1e8690f",
                    "type": "TEXT",
                    "name": "avatarUrl",
                    "label": "Avatar Url",
                    "description": "Workspace member avatar",
                    "icon": "IconFileUpload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de3ecd4c-bccf-4d35-867e-e2bcdff576c5",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dda1198e-c7fa-4232-b19b-bf17c27f14f7",
                    "type": "SELECT",
                    "name": "timeFormat",
                    "label": "Time format",
                    "description": "User's preferred time format",
                    "icon": "IconClock2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "52b91870-1f8e-48d5-ab25-bbf897a907b4",
                        "color": "sky",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "aadb9d11-9325-4082-8b57-b03a10efb9ca",
                        "color": "red",
                        "label": "24HRS",
                        "value": "HOUR_24",
                        "position": 1
                      },
                      {
                        "id": "b786750d-fa60-47bf-88e1-2c51ce6ea9c1",
                        "color": "purple",
                        "label": "12HRS",
                        "value": "HOUR_12",
                        "position": 2
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "67752c0c-acc3-4743-a05d-654127f3c8c1",
                    "type": "FULL_NAME",
                    "name": "name",
                    "label": "Name",
                    "description": "Workspace member name",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "lastName": "''",
                      "firstName": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e81221d3-32e9-4bd4-b37d-152f88c7316e",
                    "type": "TEXT",
                    "name": "colorScheme",
                    "label": "Color Scheme",
                    "description": "Preferred color scheme",
                    "icon": "IconColorSwatch",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'Light'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "71e8bd81-c215-4b89-8a53-5bf7f827dccb",
                    "type": "RELATION",
                    "name": "blocklist",
                    "label": "Blocklist",
                    "description": "Blocklisted handles",
                    "icon": "IconForbid2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6044381d-93ce-42da-841b-f96b3823720c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "71e8bd81-c215-4b89-8a53-5bf7f827dccb",
                        "name": "blocklist"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "73d3f05b-b8e2-42aa-abd9-79e655733d0a",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d318e863-d31a-461e-8a9f-127f50ede62f",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "843953a7-e30e-42c9-955a-75e90b20fe60",
                    "type": "RELATION",
                    "name": "authoredAttachments",
                    "label": "Authored attachments",
                    "description": "Attachments created by the workspace member",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f5c22b93-45df-463e-9ef1-0a7861a714f5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "843953a7-e30e-42c9-955a-75e90b20fe60",
                        "name": "authoredAttachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f6c8ef43-9dff-4559-bb9d-0d57c536bdd6",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a9f2d185-d219-4b9d-9178-5dcb65195092",
                    "type": "RELATION",
                    "name": "accountOwnerForCompanies",
                    "label": "Account Owner For Companies",
                    "description": "Account owner for companies",
                    "icon": "IconBriefcase",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "01e2ef91-4b8f-4450-839d-96eea529ed2a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a9f2d185-d219-4b9d-9178-5dcb65195092",
                        "name": "accountOwnerForCompanies"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "59d303b4-ed1a-4bb7-bbd0-d2016599baa2",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7549782c-6c6e-42f4-a786-16816b92e69c",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the workspace member",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ffccf9a8-edbf-4bdf-8c39-311674045609",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7549782c-6c6e-42f4-a786-16816b92e69c",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "92c8dfd9-2122-4eed-b6ec-344d8b39d82e",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7eeab04c-203e-4b48-b904-0bbc3a5bd996",
                    "type": "RELATION",
                    "name": "auditLogs",
                    "label": "Audit Logs",
                    "description": "Audit Logs linked to the workspace member",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0c472897-5f75-46e3-8052-9d0c6ac8b613",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7eeab04c-203e-4b48-b904-0bbc3a5bd996",
                        "name": "auditLogs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f428ce3e-3b67-4aec-987f-9eef1e99bff0",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "da01681a-8d32-4cc6-8c15-295e28b9103d",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "af5eb6f9-4a54-405e-b441-be120b163897",
                    "type": "TEXT",
                    "name": "userEmail",
                    "label": "User Email",
                    "description": "Related user email address",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "355d515e-a3f6-4203-9e4c-b32314f06110",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6a2a1799-2eff-4ba2-9869-4568f48656f0",
                    "type": "RELATION",
                    "name": "authoredActivities",
                    "label": "Authored activities",
                    "description": "Activities created by the workspace member",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8796cc88-6ada-4aa6-97fc-c3bfdb20be24",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6a2a1799-2eff-4ba2-9869-4568f48656f0",
                        "name": "authoredActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b6d0103a-caa8-4512-b038-f4d0a85c9492",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "63937205-8023-447f-a861-ceda6e84f77a",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Events",
                    "description": "Events linked to the workspace member",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d0bb647d-b92e-40e6-9a29-2dadace8c7d1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "63937205-8023-447f-a861-ceda6e84f77a",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2564c692-db11-465b-855e-de84806cd664",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "650beb96-628d-43db-bf5a-4f4a56a1cbbd",
                    "type": "SELECT",
                    "name": "dateFormat",
                    "label": "Date format",
                    "description": "User's preferred date format",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "88ad0fdf-b95e-493c-880a-f9acb0f9769d",
                        "color": "turquoise",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "1a0517a2-32f6-49e0-9678-f8e9afc879ae",
                        "color": "red",
                        "label": "Month First",
                        "value": "MONTH_FIRST",
                        "position": 1
                      },
                      {
                        "id": "4deacbe2-6cfb-472a-ac11-a24a490ad2bd",
                        "color": "purple",
                        "label": "Day First",
                        "value": "DAY_FIRST",
                        "position": 2
                      },
                      {
                        "id": "1c00a617-7a4e-4ffb-bdc9-12685bbc705f",
                        "color": "sky",
                        "label": "Year First",
                        "value": "YEAR_FIRST",
                        "position": 3
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "47c7b641-8f49-4e9f-aa8f-2409deb6975f",
                    "type": "UUID",
                    "name": "userId",
                    "label": "User Id",
                    "description": "Associated User Id",
                    "icon": "IconCircleUsers",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aeecdb45-3d56-476e-9200-250179f610d0",
                    "type": "RELATION",
                    "name": "assignedActivities",
                    "label": "Assigned activities",
                    "description": "Activities assigned to the workspace member",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "92636e8d-07d1-4caa-ab11-7c5baf64066b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "aeecdb45-3d56-476e-9200-250179f610d0",
                        "name": "assignedActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a8559f98-d6a7-4bc5-8058-449a846057eb",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2a0d2586-45ea-45eb-9d1e-7799be1ecafd",
                    "type": "RELATION",
                    "name": "calendarEventParticipants",
                    "label": "Calendar Event Participants",
                    "description": "Calendar Event Participants",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1aa34ced-34ce-4330-a5bb-dc1ff5a321fc",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2a0d2586-45ea-45eb-9d1e-7799be1ecafd",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1dd5f673-a00c-4686-a746-b0d92c6363fb",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ecd417ae-edf2-4802-87d3-95b74e5a94ac",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0cb6261d-2a24-4221-b380-0ec8456d6741",
                    "type": "RELATION",
                    "name": "assignedTasks",
                    "label": "Assigned tasks",
                    "description": "Tasks assigned to the workspace member",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b89531e6-d031-4d27-844c-2f158ea462e8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0cb6261d-2a24-4221-b380-0ec8456d6741",
                        "name": "assignedTasks"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "08fcd66a-4602-4504-b925-dd96672a45eb",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de26fae3-51bc-4fdf-af80-5a50366edde4",
                    "type": "TEXT",
                    "name": "timeZone",
                    "label": "Time zone",
                    "description": "User time zone",
                    "icon": "IconTimezone",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'system'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "a4c607d4-9d6d-435f-954f-6c6632b54b98",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "calendarChannelEventAssociation",
            "namePlural": "calendarChannelEventAssociations",
            "labelSingular": "Calendar Channel Event Association",
            "labelPlural": "Calendar Channel Event Associations",
            "description": "Calendar Channel Event Associations",
            "icon": "IconCalendar",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "0f405c75-49ea-41bd-a128-36a40dec7d04",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4a880eff-aa67-4f57-af59-bab99d715dfd",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_92a888b681107c4f78926820db7",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "279491bd-ae7c-42aa-815c-96752fb5c98e",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "134a35dc-27ed-4804-83a1-c8476030be50"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "52784312-9044-42a9-b2bb-f75cba5cc473",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_a88c3ab301c25202d4b52fb4b1b",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "6bc24235-ff6e-4ffa-a55d-4ccbb8af96a3",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "134a35dc-27ed-4804-83a1-c8476030be50"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjk="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a0c7ece2-0683-4894-902d-d2467bf080a2",
                    "type": "RELATION",
                    "name": "calendarChannel",
                    "label": "Channel ID",
                    "description": "Channel ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cf8500e0-feff-4a87-afd8-bdeea613f0aa",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a4c607d4-9d6d-435f-954f-6c6632b54b98",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a0c7ece2-0683-4894-902d-d2467bf080a2",
                        "name": "calendarChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "25c4ad74-36ab-4244-bccd-9671df26cd06",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c07b20a1-a3f2-4e27-a406-b9e395e41f70",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "13bfb6a9-c781-4941-83ac-6fb1318d4e57",
                    "type": "TEXT",
                    "name": "eventExternalId",
                    "label": "Event external ID",
                    "description": "Event external ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "93ebd15b-b32e-4c51-a4ed-4f444eb49016",
                    "type": "TEXT",
                    "name": "recurringEventExternalId",
                    "label": "Recurring Event ID",
                    "description": "Recurring Event ID",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1bd49046-c762-48af-99d6-2103bc8f613b",
                    "type": "UUID",
                    "name": "calendarEventId",
                    "label": "Event ID id (foreign key)",
                    "description": "Event ID id foreign key",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "134a35dc-27ed-4804-83a1-c8476030be50",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "748fc945-d995-475c-ad6b-61f6d9bc2e6f",
                    "type": "RELATION",
                    "name": "calendarEvent",
                    "label": "Event ID",
                    "description": "Event ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5a685f16-da76-4593-bb9a-418054336165",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a4c607d4-9d6d-435f-954f-6c6632b54b98",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "748fc945-d995-475c-ad6b-61f6d9bc2e6f",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e9a943b9-590c-468f-9f22-fc8eda8f3110",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "532fdab5-81cd-4650-9d51-dcdcea9275e1",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a3d03c7e-9f0c-462a-9989-a99ab3a2ad00",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f64d7a3e-5a91-497d-b293-67182c9714bc",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e388424d-94b0-4d2d-941c-659734bc5a4a",
                    "type": "UUID",
                    "name": "calendarChannelId",
                    "label": "Channel ID id (foreign key)",
                    "description": "Channel ID id foreign key",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0f405c75-49ea-41bd-a128-36a40dec7d04",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "9f807867-5361-49b7-805a-222f42d32940",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "company",
            "namePlural": "companies",
            "labelSingular": "Company",
            "labelPlural": "Companies",
            "description": "A company",
            "icon": "IconBuildingSkyscraper",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "f99e8113-52f4-451e-b05d-cab394d84614",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ebd20aef-62f5-421a-b20e-86fe4e61cb50",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_fb1f4905546cfc6d70a971c76f7",
                    "indexWhereClause": null,
                    "indexType": "GIN",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": []
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "c459555f-bdc5-4bfc-83f0-8449515d2107",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_123501237187c835ede626367b7",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "77eb5484-dbcc-4e01-9d35-2ffb7e295284",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "d425a029-73ac-4d62-a3d9-13e8e2ad76ee"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI4"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e41a625b-9146-493a-abbb-7eafc9d9cf07",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b650cdad-cbcf-468c-8c31-2f32ce88bbf4",
                    "type": "BOOLEAN",
                    "name": "idealCustomerProfile",
                    "label": "ICP",
                    "description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
                    "icon": "IconTarget",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": false,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b16e5927-5582-4164-ae9e-e12ef97f03a2",
                    "type": "LINKS",
                    "name": "domainName",
                    "label": "Domain Name",
                    "description": "The company website URL. We use this url to fetch the company icon",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c05720c1-83e0-4128-8a15-222b12b3488a",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d425a029-73ac-4d62-a3d9-13e8e2ad76ee",
                    "type": "UUID",
                    "name": "accountOwnerId",
                    "label": "Account Owner id (foreign key)",
                    "description": "Your team member responsible for managing the company account id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f99e8113-52f4-451e-b05d-cab394d84614",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The company name",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7e6f187a-157c-43af-b5fe-b0670eb54eda",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "32582b9b-2053-4f95-a41c-f4620480bd60",
                    "type": "MULTI_SELECT",
                    "name": "workPolicy",
                    "label": "Work Policy",
                    "description": "Company's Work Policy",
                    "icon": "IconHome",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.292Z",
                    "updatedAt": "2024-10-24T15:29:29.292Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "a9302979-7738-4529-83da-3d254779bfb7",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "fd221f1d-c1ad-41bb-827f-53034a685731",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "05f8289c-2247-4d61-a033-531521c7f1fb",
                        "color": "sky",
                        "label": "Remote Work",
                        "value": "REMOTE_WORK",
                        "position": 2
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4acb6665-5e1e-48b5-bcda-d37a94f4da6b",
                    "type": "BOOLEAN",
                    "name": "visaSponsorship",
                    "label": "Visa Sponsorship",
                    "description": "Company's Visa Sponsorship Policy",
                    "icon": "IconBrandVisa",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.375Z",
                    "updatedAt": "2024-10-24T15:29:29.375Z",
                    "defaultValue": false,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7382865a-ef78-4fab-b235-c285f63b8535",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "17750fc3-4e8c-4b40-91aa-9a684d009afb",
                    "type": "RELATION",
                    "name": "opportunities",
                    "label": "Opportunities",
                    "description": "Opportunities linked to the company.",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c577d418-da40-4f85-8020-577931c9ab87",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "17750fc3-4e8c-4b40-91aa-9a684d009afb",
                        "name": "opportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "59a97157-f4ff-4caa-9952-0060fc91501c",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "423d12ec-eeda-453e-bf38-8b15dec99568",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the company",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8d4863a4-d32c-4621-b34d-4e8163a5d096",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "423d12ec-eeda-453e-bf38-8b15dec99568",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8e39e842-80e7-49b0-ba92-c9f1cec68c0a",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6e0f738d-9864-4bdd-a000-880c5bb1bf89",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ef84b97d-ce8b-40ea-9b36-ffd6b2ff4c95",
                    "type": "LINKS",
                    "name": "xLink",
                    "label": "X",
                    "description": "The company Twitter/X account",
                    "icon": "IconBrandX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "809c93ac-d027-4a74-ba0e-10a1ca0cd0a0",
                    "type": "ADDRESS",
                    "name": "address",
                    "label": "Address",
                    "description": "Address of the company",
                    "icon": "IconMap",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "addressLat": null,
                      "addressLng": null,
                      "addressCity": "''",
                      "addressState": "''",
                      "addressCountry": "''",
                      "addressStreet1": "''",
                      "addressStreet2": "''",
                      "addressPostcode": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "900c71d2-3e15-416b-83c1-f5ea1f3c9d47",
                    "type": "NUMBER",
                    "name": "employees",
                    "label": "Employees",
                    "description": "Number of employees in the company",
                    "icon": "IconUsers",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2f917e6f-8b0a-44fd-8f26-ea5fc843d7c2",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments linked to the company",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f1d31fd9-4aab-48a3-9d59-309d3612ccb3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2f917e6f-8b0a-44fd-8f26-ea5fc843d7c2",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "83cd6a46-9e06-4d9d-ba4f-f321794bf6d5",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3e0f5d0e-4d12-4e7d-b589-53e3fa2a65fb",
                    "type": "CURRENCY",
                    "name": "annualRecurringRevenue",
                    "label": "ARR",
                    "description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
                    "icon": "IconMoneybag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "amountMicros": null,
                      "currencyCode": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da756e88-64bb-41d3-91f0-de9604d2cd69",
                    "type": "LINKS",
                    "name": "linkedinLink",
                    "label": "Linkedin",
                    "description": "The company Linkedin account",
                    "icon": "IconBrandLinkedin",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9c0f2648-ce8c-4c25-8cc6-076519844e9c",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the company",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ef815cbe-9e5d-4005-afa2-4326e47a55f2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9c0f2648-ce8c-4c25-8cc6-076519844e9c",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f40cd852-22a2-4d84-a3d9-d911e93d70a2",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b526ed5a-f3fe-4c64-99a5-fc7bfc71e515",
                    "type": "TEXT",
                    "name": "tagline",
                    "label": "Tagline",
                    "description": "Company's Tagline",
                    "icon": "IconAdCircle",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:28.840Z",
                    "updatedAt": "2024-10-24T15:29:28.840Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "63ce0cf2-4bd5-4130-b8cf-25c8cb31cb69",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the company",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9b3f0de4-2e61-4090-a650-ebb96a6f4c11",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "63ce0cf2-4bd5-4130-b8cf-25c8cb31cb69",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "da5b156d-b51e-47e4-a729-7a28c420f588",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0d9743f9-b41d-4f10-969b-f4724daece4f",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "466374e7-9c80-4edb-b93f-3a0844efae2f",
                    "type": "LINKS",
                    "name": "introVideo",
                    "label": "Intro Video",
                    "description": "Company's Intro Video",
                    "icon": "IconVideo",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.138Z",
                    "updatedAt": "2024-10-24T15:29:29.138Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "84220978-b13b-42b9-9dc7-0dc3d4174234",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Company record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9d9c8096-2145-44f1-8cac-551cb34f2b7f",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the company",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ef5f28a-5e52-44df-967c-76d2a3c4a512",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9d9c8096-2145-44f1-8cac-551cb34f2b7f",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "30b7dee5-72e3-4cb4-9eb8-37de6caa9e6e",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59d303b4-ed1a-4bb7-bbd0-d2016599baa2",
                    "type": "RELATION",
                    "name": "accountOwner",
                    "label": "Account Owner",
                    "description": "Your team member responsible for managing the company account",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "01e2ef91-4b8f-4450-839d-96eea529ed2a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "59d303b4-ed1a-4bb7-bbd0-d2016599baa2",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a9f2d185-d219-4b9d-9178-5dcb65195092",
                        "name": "accountOwnerForCompanies"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "359e70fd-a85b-47b6-8b96-8e28db7a09d3",
                    "type": "RELATION",
                    "name": "people",
                    "label": "People",
                    "description": "People linked to the company.",
                    "icon": "IconUsers",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "57751750-603d-4998-a344-d2a5f0d33b65",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "359e70fd-a85b-47b6-8b96-8e28db7a09d3",
                        "name": "people"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "dddcbeca-4d3f-48fa-8e82-fcc3e8d83c57",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "10decf85-67f4-4076-a9e3-ac62e402abc3",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the company",
                    "icon": "IconIconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8b069796-c4cb-4b4e-9fbc-bf5f410ea66d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "10decf85-67f4-4076-a9e3-ac62e402abc3",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4ca01b98-b58a-4f09-bbcd-3b6e2635be33",
                        "name": "company"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "note",
            "namePlural": "notes",
            "labelSingular": "Note",
            "labelPlural": "Notes",
            "description": "A note",
            "icon": "IconNotes",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "2b10e47a-1772-4e52-bba3-2cc694497d97",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5a5a4ba4-7562-4481-ab15-2f0aa2c4b888",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_f20de8d7fc74a405e4083051275",
                    "indexWhereClause": null,
                    "indexType": "GIN",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "65cff842-0216-4168-9b55-981fb99a0270",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "559db87f-4cec-4f40-97d8-260bde9cbb9a"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEy"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "96d73b1b-5ef3-40be-b34c-45a000a04831",
                    "type": "RICH_TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Note body",
                    "icon": "IconFilePencil",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5d8a3e8a-4632-4cda-8c72-c455ebcdc89d",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "559db87f-4cec-4f40-97d8-260bde9cbb9a",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0669eb39-1a9e-4305-8bbf-3fd94b1e6e0c",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2b10e47a-1772-4e52-bba3-2cc694497d97",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Note title",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bc4919b5-59a8-4347-8b5f-a03eb59a8b7a",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "af70c646-59c9-4f57-b863-79c5a1182fdd",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "75d36137-1891-420b-8f9a-e8b3d1426e7f",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Note record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8349efec-852c-4cb2-a0df-4d99582376b8",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the note",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c498e208-e77b-487e-868d-543e64c40221",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8349efec-852c-4cb2-a0df-4d99582376b8",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a026174d-a480-440b-80a0-57277f15d929",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "56884373-9de9-4216-8e86-724f817f7bca",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Relations",
                    "description": "Note targets",
                    "icon": "IconArrowUpRight",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8c69fea-d9b7-4507-84b5-85b232ab98c0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "56884373-9de9-4216-8e86-724f817f7bca",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "76b49c4d-0f2a-429e-9678-c6422fca3d27",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ea583df2-1234-4e07-b5c9-730544aa6f41",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the note.",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1f01dba2-a061-44a5-8524-6b15be1caaee",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ea583df2-1234-4e07-b5c9-730544aa6f41",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8147da26-839b-4345-9111-9f00a692192b",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a1763808-6058-4b2f-9b89-48a8fe5b9cde",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4e5c3bd5-111f-4528-8a50-5b218fa2665b",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Note attachments",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "535a5c18-ff0a-491b-a3e5-102dcb6bec3b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4e5c3bd5-111f-4528-8a50-5b218fa2665b",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "42b46357-5012-46ad-bb45-3d58d02007c3",
                        "name": "note"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "taskTarget",
            "namePlural": "taskTargets",
            "labelSingular": "Task Target",
            "labelPlural": "Task Targets",
            "description": "An task target",
            "icon": "IconCheckbox",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "de8588f9-0c6a-4280-b838-fc8543624223",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "61f95fba-b3e6-425c-8531-339dc308f760",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_4e929e3af362914c41035c4d438",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9b0c8cc8-eff7-4a56-8dfa-aca3f2f7f07e",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "05327fde-d917-49e5-88d1-67e6ee683d44"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0bde0f2b-1e5f-48cd-aba6-fa96f4cd250f",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "51cf65c8-7ff3-4a97-9ce8-bb19c1b95a75"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4fc700aa-c8a4-4f3e-95bc-4a918a1d91b5",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_b0ba7efcd8c529922bf6e858bc1",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a7b64673-b89e-4577-b4f5-ff5eb954b818",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "3fff33a1-f219-4d3b-ae3d-aaa5cce86b56"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0cf62f63-7568-408a-aa7f-8d80fece15fc",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "51cf65c8-7ff3-4a97-9ce8-bb19c1b95a75"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "c22a3316-a07d-442e-b72a-bf50ad418107",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_627d4437c96f22d5d46cc9a85bb",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1f7026f8-3c3a-47fe-997a-c28a507c6167",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "032dfd1e-cc36-4cbd-8f53-35c607cef4f8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3a139a8c-313f-40bb-9728-0912ea5e0fab",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "51cf65c8-7ff3-4a97-9ce8-bb19c1b95a75"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e769f7b2-75ef-4c49-b246-cd2c6c9df2ec",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_cf12e6c92058f11b59852ffdfe3",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8d2acb96-6bfe-4be7-b33f-1d3815f57e54",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "51cf65c8-7ff3-4a97-9ce8-bb19c1b95a75"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "76b360ea-c7d9-4f57-bf68-215b3e3c7373",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "TaskTarget Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.813Z",
                    "updatedAt": "2024-10-24T15:29:29.813Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "23b55de4-fb74-487e-9c64-f6c861fe345f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "76b360ea-c7d9-4f57-bf68-215b3e3c7373",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f848b4f0-a210-4d93-a042-7834b581f23f",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "032dfd1e-cc36-4cbd-8f53-35c607cef4f8",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "TaskTarget task id foreign key",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b8098117-5006-43ed-9f8c-02ab39d89857",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "TaskTarget person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6f584cfa-9971-4a99-b695-0af05986a7d2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b8098117-5006-43ed-9f8c-02ab39d89857",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "064f9c71-25e7-4e52-8535-a48b3001ef35",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f39f31b3-2efc-4fa5-bceb-4b6e4cc467c3",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "05327fde-d917-49e5-88d1-67e6ee683d44",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "TaskTarget company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "30b7dee5-72e3-4cb4-9eb8-37de6caa9e6e",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "TaskTarget company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ef5f28a-5e52-44df-967c-76d2a3c4a512",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "30b7dee5-72e3-4cb4-9eb8-37de6caa9e6e",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9d9c8096-2145-44f1-8cac-551cb34f2b7f",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "65759050-f8de-4c53-ae1c-13f434885011",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "TaskTarget opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ac435bd6-2158-49bd-998f-750f69e2bcfe",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "65759050-f8de-4c53-ae1c-13f434885011",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eb994d72-1d76-4695-ad24-ebce6c04438e",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44304fc9-3a96-410b-a9ff-cf1c237abd22",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02f844ac-78ea-4c14-8b98-891f223fe158",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "TaskTarget Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.812Z",
                    "updatedAt": "2024-10-24T15:29:29.812Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "isForeignKey": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3fff33a1-f219-4d3b-ae3d-aaa5cce86b56",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "TaskTarget opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c5f4a3eb-b29e-4236-b2ee-73670bc788b8",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "TaskTarget task",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a104019e-02f8-460b-aae1-d2734da0c0a1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c5f4a3eb-b29e-4236-b2ee-73670bc788b8",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c4522972-1dde-4cf5-979d-3996bc239a04",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de8588f9-0c6a-4280-b838-fc8543624223",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "33f70c15-5cd8-402c-9163-e62aa68f4073",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "TaskTarget person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "51cf65c8-7ff3-4a97-9ce8-bb19c1b95a75",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "7f195c82-a597-40bf-b407-bcbac63ae3ae",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "viewField",
            "namePlural": "viewFields",
            "labelSingular": "View Field",
            "labelPlural": "View Fields",
            "description": "(System) View Fields",
            "icon": "IconTag",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "8c8f6fed-bbcc-4e5f-b0f5-eba7faa7259f",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "77f85ce7-ea53-43cd-998c-1a799f821088",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_260f80ae1d2ccc67388995d6d05",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8971e8f8-d4e1-4ce5-a468-d1aacbf0f9d3",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "c4c25878-c1f7-4a5e-ae76-f588513d94bd"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjk="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "357ade8f-522d-4aaa-99cf-50b5c8f50ef0",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c4c25878-c1f7-4a5e-ae76-f588513d94bd",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ffed63ab-8b05-4ceb-98a3-05a4dd468678",
                    "type": "NUMBER",
                    "name": "position",
                    "label": "Position",
                    "description": "View Field position",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": 0,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d5aa87d1-6af1-415d-876d-b12625056469",
                    "type": "NUMBER",
                    "name": "size",
                    "label": "Size",
                    "description": "View Field size",
                    "icon": "IconEye",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": 0,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3d3f3de8-8740-4d4f-b837-31e9be8d5dfb",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c8b0398e-24aa-4599-87d7-07a4f2754414",
                    "type": "BOOLEAN",
                    "name": "isVisible",
                    "label": "Visible",
                    "description": "View Field visibility",
                    "icon": "IconEye",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "479a1885-f91c-4baa-bf7a-1b15970acee8",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View Field related view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8c8f6fed-bbcc-4e5f-b0f5-eba7faa7259f",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ab727646-c644-4123-bdb1-40314cb17f19",
                    "type": "UUID",
                    "name": "fieldMetadataId",
                    "label": "Field Metadata Id",
                    "description": "View Field target field",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2753dfc5-35e7-46d6-9ee3-b5c4a977f047",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View Field related view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "983b71fd-2f76-4df7-a3ee-bf2a4fd46ec8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7f195c82-a597-40bf-b407-bcbac63ae3ae",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2753dfc5-35e7-46d6-9ee3-b5c4a977f047",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0e3c098c-c005-444a-9763-2eabc7be9ea8",
                        "name": "viewFields"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "787e9f26-fe97-4b79-b151-059997d096d3",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "activity",
            "namePlural": "activities",
            "labelSingular": "Activity",
            "labelPlural": "Activities",
            "description": "An activity",
            "icon": "IconCheckbox",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "f1a325ac-c72a-431f-9fac-eee6d9757917",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "15fd9f3a-f12f-414c-bb31-8a11d71d6078",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_4fd6a4b57c6237b197275440102",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "60f0703b-b607-4fd5-b147-4096b058fdd9",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "f4b0926e-0062-4108-a618-a31b447da286"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ccb991fa-5fd0-462f-a3c0-0194e41a3d5f",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_29e3cc1255fe5ae28e61841001c",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "19f675d8-ed97-482e-95f2-14740895c665",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "f3f1a617-515b-409a-8729-8decf96d17d3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "ecb8d30a-7bf3-4497-bb13-1f93c8934017",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "0d0ce453-d3ce-4422-82bc-836078530d6b"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE2"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7f102104-464b-4883-97b6-a44f9a1367ba",
                    "type": "DATE_TIME",
                    "name": "dueAt",
                    "label": "Due Date",
                    "description": "Activity due date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f3f1a617-515b-409a-8729-8decf96d17d3",
                    "type": "UUID",
                    "name": "authorId",
                    "label": "Author id (foreign key)",
                    "description": "Activity author id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "39da0b22-b6d1-4ffb-b06a-cff067f3cfa2",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Activity attachments",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d5ed2a81-6683-4803-a30c-8aa4bbc77820",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "39da0b22-b6d1-4ffb-b06a-cff067f3cfa2",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0c6e51a8-3e0f-4afb-98d0-150e292fa05a",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f1a325ac-c72a-431f-9fac-eee6d9757917",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Activity title",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6eb7dff0-c180-4691-99a3-10458a4b6059",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Targets",
                    "description": "Activity targets",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "80887ab9-7ff0-4eae-8e15-42efdd09a328",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6eb7dff0-c180-4691-99a3-10458a4b6059",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "699bc5f0-732b-4f89-a3cf-1608403a7489",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b6d0103a-caa8-4512-b038-f4d0a85c9492",
                    "type": "RELATION",
                    "name": "author",
                    "label": "Author",
                    "description": "Activity author",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8796cc88-6ada-4aa6-97fc-c3bfdb20be24",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b6d0103a-caa8-4512-b038-f4d0a85c9492",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6a2a1799-2eff-4ba2-9869-4568f48656f0",
                        "name": "authoredActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0d0ce453-d3ce-4422-82bc-836078530d6b",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "78357ea5-743a-484e-88b7-bc404fbb1a9d",
                    "type": "RELATION",
                    "name": "comments",
                    "label": "Comments",
                    "description": "Activity comments",
                    "icon": "IconComment",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c564ab2d-d476-47ba-b7d8-10f9127fe138",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "78357ea5-743a-484e-88b7-bc404fbb1a9d",
                        "name": "comments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "dfadf00a-cfa5-4e3f-93b7-9c73f39d9e6f",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6437467d-7756-48f9-97ce-d9e2dff41579",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d46ff69c-38c4-4d42-9fa2-057448bb7322",
                    "type": "DATE_TIME",
                    "name": "reminderAt",
                    "label": "Reminder Date",
                    "description": "Activity reminder date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6d6209d1-ad2e-4cb9-89b7-69235b511e5c",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4888a92e-e781-4745-a2d2-aad0628a9f91",
                    "type": "DATE_TIME",
                    "name": "completedAt",
                    "label": "Completion Date",
                    "description": "Activity completion date",
                    "icon": "IconCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ac71baa1-f3e2-4238-86fd-03fae414e217",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1d73077b-806d-4dce-a9d6-b17ffe179fa9",
                    "type": "TEXT",
                    "name": "type",
                    "label": "Type",
                    "description": "Activity type",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'Note'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f4b0926e-0062-4108-a618-a31b447da286",
                    "type": "UUID",
                    "name": "assigneeId",
                    "label": "Assignee id (foreign key)",
                    "description": "Activity assignee id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a8559f98-d6a7-4bc5-8058-449a846057eb",
                    "type": "RELATION",
                    "name": "assignee",
                    "label": "Assignee",
                    "description": "Activity assignee",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "92636e8d-07d1-4caa-ab11-7c5baf64066b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a8559f98-d6a7-4bc5-8058-449a846057eb",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "aeecdb45-3d56-476e-9200-250179f610d0",
                        "name": "assignedActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "36c09f75-2c79-490f-8b5a-d8aab387bd50",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "03a1db84-74d1-4f38-bf8e-9940fb31cbb4",
                    "type": "TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Activity body",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "73d3f05b-b8e2-42aa-abd9-79e655733d0a",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "blocklist",
            "namePlural": "blocklists",
            "labelSingular": "Blocklist",
            "labelPlural": "Blocklists",
            "description": "Blocklist",
            "icon": "IconForbid2",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "fab9347e-0794-4f57-b79d-f6001cef18e6",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a17fc96e-9f46-4c81-bf9b-508ddd42ceb6",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_76a190ab8a6f439791358d63d60",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "cabc5a43-c5be-485d-bc82-b30362264831",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "837e4e5c-3c89-4757-8b32-4abcb1f13840"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "80c3ed44-a033-4315-b19a-14b18fb0606d",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "f010cbae-a2e1-46d5-82b5-a78f69b47207"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjY="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f13fae43-9519-4a82-b43e-6537977cd139",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fab9347e-0794-4f57-b79d-f6001cef18e6",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ad3546ff-10ed-4494-81db-9a0476ea65fd",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "768846e3-9c79-4e03-a2a4-0ed01d1f18e3",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d318e863-d31a-461e-8a9f-127f50ede62f",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "WorkspaceMember",
                    "description": "WorkspaceMember",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6044381d-93ce-42da-841b-f96b3823720c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "73d3f05b-b8e2-42aa-abd9-79e655733d0a",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d318e863-d31a-461e-8a9f-127f50ede62f",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "71e8bd81-c215-4b89-8a53-5bf7f827dccb",
                        "name": "blocklist"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "837e4e5c-3c89-4757-8b32-4abcb1f13840",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "WorkspaceMember id (foreign key)",
                    "description": "WorkspaceMember id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f010cbae-a2e1-46d5-82b5-a78f69b47207",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "6c3dfa43-d32f-4707-a73b-e2c1d94b2f3b",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "messageParticipant",
            "namePlural": "messageParticipants",
            "labelSingular": "Message Participant",
            "labelPlural": "Message Participants",
            "description": "Message Participants",
            "icon": "IconUserCircle",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "aad83e33-994e-4851-b41a-cc7818d04303",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "1e2914b7-f52d-43ea-8ee2-a6f4a060988e",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_8d0144e4074d86d0cb7094f40c2",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "334aa27e-f853-4cd0-b511-6b5608a771e3",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "fb99609a-cc4c-4a26-8aa5-134f09aea1da"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7add4bd2-a396-4f7a-8c41-215eecbd2088",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_8c4f617db0813d41aef587e49ea",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8d5cd38f-46a3-4713-be05-dc6b77138242",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "7563e9b0-95c5-4217-8217-35389bbe2a60"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f7496c80-c4b2-4c5c-97f4-6271f53e5de5",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "54443e36-59c6-4963-abaf-ead702f463be"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "836a5782-585e-44d8-b12e-acad734ba8a9",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_6d9700e5ae2ab8c294d614e72f6",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "53e5ab96-1498-4705-a4da-9992984976ce",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "54443e36-59c6-4963-abaf-ead702f463be"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "410deb0f-2947-4e58-8b7a-f3e1d377bdc4",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "c841c926-7579-4a43-b162-06b511a006e3"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEy"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ff381668-3a22-4611-a558-f38decda31b7",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8764d202-eaa0-48e7-8912-3a3cde6e8d2b",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f1d5cfa5-1dcb-458d-bd4f-5431c617733d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6c3dfa43-d32f-4707-a73b-e2c1d94b2f3b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8764d202-eaa0-48e7-8912-3a3cde6e8d2b",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a9f67b26-9b35-4d3b-97c0-7e0cf27ec70f",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c841c926-7579-4a43-b162-06b511a006e3",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fe8d9807-bbf2-4eb5-b831-0bb0344c0b9e",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "34674542-34e8-4e1c-bf64-265a92c8d666",
                    "type": "RELATION",
                    "name": "message",
                    "label": "Message",
                    "description": "Message",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b2755a82-01c5-41b1-a34a-560494938e5f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6c3dfa43-d32f-4707-a73b-e2c1d94b2f3b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "34674542-34e8-4e1c-bf64-265a92c8d666",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "33e51e27-22b8-42be-a904-7c4646d26191",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ccc38bb3-016c-4c8f-9301-fb874ede7dc5",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1f8a6261-ab0d-4a00-b57f-33636a3460ad",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "aa6feaca-912a-4b41-a1e5-b9e05a01a609",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6c3dfa43-d32f-4707-a73b-e2c1d94b2f3b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1f8a6261-ab0d-4a00-b57f-33636a3460ad",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a0847e94-3ee7-4207-8295-82d53ceeb05a",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "54443e36-59c6-4963-abaf-ead702f463be",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c7e5de0f-49ad-4a3e-93e3-eff311462dbc",
                    "type": "TEXT",
                    "name": "displayName",
                    "label": "Display Name",
                    "description": "Display Name",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0be8fa41-1a66-4ad7-b579-84b1e3adb9f6",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7563e9b0-95c5-4217-8217-35389bbe2a60",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b00bd6a5-794c-4634-8bf3-cd26bb0d5b10",
                    "type": "SELECT",
                    "name": "role",
                    "label": "Role",
                    "description": "Role",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'from'",
                    "options": [
                      {
                        "id": "65d53e89-2b0f-4e94-b885-68e0e3141df7",
                        "color": "green",
                        "label": "From",
                        "value": "from",
                        "position": 0
                      },
                      {
                        "id": "b384b392-1672-47e0-a4a8-e34daed90c3f",
                        "color": "blue",
                        "label": "To",
                        "value": "to",
                        "position": 1
                      },
                      {
                        "id": "8905b21c-0c67-45c7-9f80-1aee112b3cba",
                        "color": "orange",
                        "label": "Cc",
                        "value": "cc",
                        "position": 2
                      },
                      {
                        "id": "10079cee-ca6f-4aa9-8574-831ff7ba8ff8",
                        "color": "red",
                        "label": "Bcc",
                        "value": "bcc",
                        "position": 3
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aad83e33-994e-4851-b41a-cc7818d04303",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fb99609a-cc4c-4a26-8aa5-134f09aea1da",
                    "type": "UUID",
                    "name": "messageId",
                    "label": "Message id (foreign key)",
                    "description": "Message id foreign key",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "62859a41-9ade-4bd4-af8f-0c01f509299c",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "viewFilterGroup",
            "namePlural": "viewFilterGroups",
            "labelSingular": "View Filter Group",
            "labelPlural": "View Filter Groups",
            "description": "(System) View Filter Groups",
            "icon": "IconFilterBolt",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "9b58b6e1-f401-4150-8f53-76050f3916df",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "47dd9f06-7279-487f-82a1-12688ab3aa05",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_64ce6940a9464cd62484d52fb08",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4a463156-82ea-474f-993b-17bcf7096b1c",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "fcbbb8c6-498d-4db9-b793-231e1c442703"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjg="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b6ce65cf-a55f-47fa-9d76-44874b867167",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "53da6ae5-a92c-4618-95d6-f884ff07084c",
                    "type": "POSITION",
                    "name": "positionInViewFilterGroup",
                    "label": "Position in view filter group",
                    "description": "Position in the parent view filter group",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "98d7b286-b74a-41d1-ab66-1103b0551c65",
                    "type": "SELECT",
                    "name": "logicalOperator",
                    "label": "Logical Operator",
                    "description": "Logical operator for the filter group",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'NOT'",
                    "options": [
                      {
                        "id": "e3875c94-5d84-468b-a43e-ca58aae4286a",
                        "color": "blue",
                        "label": "AND",
                        "value": "AND",
                        "position": 0
                      },
                      {
                        "id": "e74bea3a-0779-4620-8825-51bd25b18a11",
                        "color": "green",
                        "label": "OR",
                        "value": "OR",
                        "position": 1
                      },
                      {
                        "id": "c225578a-ea5f-455b-a45a-3fda020a856f",
                        "color": "red",
                        "label": "NOT",
                        "value": "NOT",
                        "position": 2
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "700f474f-6344-4aca-ac11-37004c76e26a",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9b58b6e1-f401-4150-8f53-76050f3916df",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2d9b2d86-e300-4bdc-ab68-1643aa8156cb",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "301c5b25-7c12-4232-ab4d-2990b956a777",
                    "type": "UUID",
                    "name": "parentViewFilterGroupId",
                    "label": "Parent View Filter Group Id",
                    "description": "Parent View Filter Group",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fcbbb8c6-498d-4db9-b793-231e1c442703",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a5962b65-a1ea-4975-8376-f00daee09467",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "217897db-0d1e-492b-bf36-c5aa4fd1e27a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "62859a41-9ade-4bd4-af8f-0c01f509299c",
                        "nameSingular": "viewFilterGroup",
                        "namePlural": "viewFilterGroups"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a5962b65-a1ea-4975-8376-f00daee09467",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "644ea7c7-a7a0-4a8d-9926-533a853398bd",
                        "name": "viewFilterGroups"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "5fffc618-093f-40c3-acf0-00a0aa69e010",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "workflowEventListener",
            "namePlural": "workflowEventListeners",
            "labelSingular": "WorkflowEventListener",
            "labelPlural": "WorkflowEventListeners",
            "description": "A workflow event listener",
            "icon": null,
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "39e1ce16-3386-4e8d-b2fe-5718d4aac2bc",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5445bafc-6eff-4325-bf04-059f1019b48d",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_9d6a1fb98ccde16ede8c5949d40",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "7d6b0d11-fc2f-47cc-b8b2-4930c8a5be4b",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "1bc70d91-81e8-4fac-a954-f585019a6359"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "eccff2e4-637b-4f59-9ef5-5e5b4517bf25",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "f8964cf3-dff8-47b5-bbac-589b6ed05ab8"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjY="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eb02e8a4-e2ba-4182-8745-31d435a758a2",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "73090d0a-4630-41fa-a786-1bdc190260e3",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f8964cf3-dff8-47b5-bbac-589b6ed05ab8",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "WorkflowEventListener workflow id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7bd009cc-7c3f-4b49-ba97-53712340b8eb",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "WorkflowEventListener workflow",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6571e3cb-d2f2-46d4-b649-893e442db169",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fffc618-093f-40c3-acf0-00a0aa69e010",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7bd009cc-7c3f-4b49-ba97-53712340b8eb",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b6eaead0-4be3-45ce-a57b-8e3e4cb29376",
                        "name": "eventListeners"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "39e1ce16-3386-4e8d-b2fe-5718d4aac2bc",
                    "type": "TEXT",
                    "name": "eventName",
                    "label": "Name",
                    "description": "The workflow event listener name",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9da18492-72c6-4d54-95b2-6584fc966ab0",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1bc70d91-81e8-4fac-a954-f585019a6359",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "view",
            "namePlural": "views",
            "labelSingular": "View",
            "labelPlural": "Views",
            "description": "(System) Views",
            "icon": "IconLayoutCollage",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "63a31505-b15e-43c9-bb6a-963709db7f1a",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE3"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e6d6ae37-9df6-4628-95cc-252269394f6a",
                    "type": "BOOLEAN",
                    "name": "isCompact",
                    "label": "Compact View",
                    "description": "Describes if the view is in compact mode",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": false,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "63a31505-b15e-43c9-bb6a-963709db7f1a",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "View name",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0e3c098c-c005-444a-9763-2eabc7be9ea8",
                    "type": "RELATION",
                    "name": "viewFields",
                    "label": "View Fields",
                    "description": "View Fields",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "983b71fd-2f76-4df7-a3ee-bf2a4fd46ec8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0e3c098c-c005-444a-9763-2eabc7be9ea8",
                        "name": "viewFields"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7f195c82-a597-40bf-b407-bcbac63ae3ae",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2753dfc5-35e7-46d6-9ee3-b5c4a977f047",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "644ea7c7-a7a0-4a8d-9926-533a853398bd",
                    "type": "RELATION",
                    "name": "viewFilterGroups",
                    "label": "View Filter Groups",
                    "description": "View Filter Groups",
                    "icon": "IconFilterBolt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "217897db-0d1e-492b-bf36-c5aa4fd1e27a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "644ea7c7-a7a0-4a8d-9926-533a853398bd",
                        "name": "viewFilterGroups"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "62859a41-9ade-4bd4-af8f-0c01f509299c",
                        "nameSingular": "viewFilterGroup",
                        "namePlural": "viewFilterGroups"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a5962b65-a1ea-4975-8376-f00daee09467",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f7caf904-4b31-42fa-b34e-b77c2143feaf",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "68be4f9b-feee-4d2c-8261-a0f3b07f4bd9",
                    "type": "TEXT",
                    "name": "icon",
                    "label": "Icon",
                    "description": "View icon",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6eb02f2d-b5b1-4f84-8e2c-0f64ac953abc",
                    "type": "TEXT",
                    "name": "type",
                    "label": "Type",
                    "description": "View type",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'table'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da9925f9-e551-47d3-88aa-292e8e36e3cd",
                    "type": "SELECT",
                    "name": "key",
                    "label": "Key",
                    "description": "View key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'INDEX'",
                    "options": [
                      {
                        "id": "a64eca35-f98f-4715-ab85-e870e30c19bd",
                        "color": "red",
                        "label": "Index",
                        "value": "INDEX",
                        "position": 0
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9c7f1615-3a5f-463f-b7ce-3f29380057fe",
                    "type": "RELATION",
                    "name": "viewGroups",
                    "label": "View Groups",
                    "description": "View Groups",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9ced4eaa-f10c-40f9-8604-77e64eb8542b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9c7f1615-3a5f-463f-b7ce-3f29380057fe",
                        "name": "viewGroups"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5f127b7-7c58-4c72-8a41-3dafc678cf0f",
                        "nameSingular": "viewGroup",
                        "namePlural": "viewGroups"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "494f493f-29cd-4b89-9fd6-defee6bd7f1c",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "45d7d4f3-eede-402b-8bcd-c76b2393ae42",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "813d3843-cbab-403b-a1cd-43573606f692",
                    "type": "TEXT",
                    "name": "kanbanFieldMetadataId",
                    "label": "kanbanfieldMetadataId",
                    "description": "View Kanban column field",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59cde067-cd83-4d2c-a86d-95b65766c208",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the view",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "04cdffb4-a2e0-4ecc-948f-25e5c023e42c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "59cde067-cd83-4d2c-a86d-95b65766c208",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "dc9fc7f3-a76f-4bd8-9300-c0418f0b3263",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "20ed76fe-87b2-4d98-8bf6-b1e5b81e1a7c",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f63ff86a-44a3-4d38-bf02-971eb52ce291",
                    "type": "RELATION",
                    "name": "viewFilters",
                    "label": "View Filters",
                    "description": "View Filters",
                    "icon": "IconFilterBolt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "95c113b7-6efb-47fc-bdad-822cb1b2fdf1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f63ff86a-44a3-4d38-bf02-971eb52ce291",
                        "name": "viewFilters"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0d7d5c9f-cccc-4761-a80a-7e96726c43b1",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9e8dac52-ce36-4cc8-9b7b-cee3e679fa36",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3b5c2360-ae45-4709-a76e-f8daf2d81b66",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "View position",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "01929b2c-cb67-41c3-9171-07c0643a0f3f",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "43983f7a-df64-4bfc-bb96-0b4d9aa3aed6",
                    "type": "RELATION",
                    "name": "viewSorts",
                    "label": "View Sorts",
                    "description": "View Sorts",
                    "icon": "IconArrowsSort",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07586930-a211-4f90-a1bb-38331303e795",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "43983f7a-df64-4bfc-bb96-0b4d9aa3aed6",
                        "name": "viewSorts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1f6c7afa-2199-46aa-82cb-ada5c8d44acc",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "59a89070-0f25-4641-ad53-19703ed88bac",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "69feddfe-8372-4454-b8b2-4e53b72beafb",
                    "type": "UUID",
                    "name": "objectMetadataId",
                    "label": "Object Metadata Id",
                    "description": "View target object",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "workflowVersion",
            "namePlural": "workflowVersions",
            "labelSingular": "Workflow Version",
            "labelPlural": "Workflow Versions",
            "description": "A workflow version",
            "icon": "IconSettingsAutomation",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "f782c47d-42e4-4bfc-96c5-007dffd65fa5",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9672ddba-d9ac-4e8a-b0ab-50928d2754dd",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_a362c5eff4a28fcdffdd3bdff16",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "404be4ec-c2a1-41fc-b0aa-8138bc2b51f3",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "07ab8c25-7af6-433e-89bb-6dae114294cd"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9dc41166-be05-4934-8811-5c02690749e0",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Workflow version position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "18e6c02d-49c9-4ef7-b2a2-932cf46a0523",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "WorkflowVersion workflow",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "112cfbaf-80ba-4f7b-a6b9-8f540748a19d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "18e6c02d-49c9-4ef7-b2a2-932cf46a0523",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d093a286-2993-4ccc-9845-e78d0eec4241",
                        "name": "versions"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b3e10cbe-b4b4-4455-abd6-a29116ccb562",
                    "type": "RAW_JSON",
                    "name": "trigger",
                    "label": "Version trigger",
                    "description": "Json object to provide trigger",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f782c47d-42e4-4bfc-96c5-007dffd65fa5",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The workflow version name",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ead784c0-3202-4f3e-be0f-0f8c7d0f10c0",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "22c22e4b-15b4-45b6-ac3e-c16e8dc6cb75",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db7f70e8-1a62-416b-b72a-1dd6ee1582f9",
                    "type": "RAW_JSON",
                    "name": "steps",
                    "label": "Version steps",
                    "description": "Json object to provide steps",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "38e1bdf5-b20f-469d-9c87-13167e573ccb",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline activities linked to the version",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f5000448-99e2-48b5-8c68-a782314a0ee2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "38e1bdf5-b20f-469d-9c87-13167e573ccb",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "088e0cf6-bab7-478a-8d0b-cbd0cf248c6d",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "07ab8c25-7af6-433e-89bb-6dae114294cd",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "WorkflowVersion workflow id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "43c98b70-ac26-4c20-9192-4194a2abd124",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3a3f3717-5ff4-4ed6-8724-0cbe72bd5194",
                    "type": "SELECT",
                    "name": "status",
                    "label": "Version status",
                    "description": "The workflow version status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'DRAFT'",
                    "options": [
                      {
                        "id": "2008cbb9-c17e-4914-a438-3d2ca1896591",
                        "color": "yellow",
                        "label": "Draft",
                        "value": "DRAFT",
                        "position": 0
                      },
                      {
                        "id": "ac075c99-d1fd-4271-a112-82ab9f6fecfd",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 1
                      },
                      {
                        "id": "547029aa-c7cd-4455-9287-ef358744df0b",
                        "color": "red",
                        "label": "Deactivated",
                        "value": "DEACTIVATED",
                        "position": 2
                      },
                      {
                        "id": "27c21974-3da7-4062-99f9-c217ffe9516a",
                        "color": "grey",
                        "label": "Archived",
                        "value": "ARCHIVED",
                        "position": 3
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2e7eac44-d7de-4197-9523-dc2e63dd3e32",
                    "type": "RELATION",
                    "name": "runs",
                    "label": "Runs",
                    "description": "Workflow runs linked to the version.",
                    "icon": "IconRun",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bbb844e8-1726-48db-833d-a3fc47a5bb59",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2e7eac44-d7de-4197-9523-dc2e63dd3e32",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "99af4f6e-f8ef-411c-8409-92c5175e7f49",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4d527ba1-4277-4c3b-9900-b39f41faeae8",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the workflow version",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1b31ee45-18b4-49d7-a75b-40fd22647297",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4d527ba1-4277-4c3b-9900-b39f41faeae8",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "24aadd97-3a32-4845-8046-d3930cf6f757",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "351919bb-5116-40a5-a814-162d25460ad7",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "activityTarget",
            "namePlural": "activityTargets",
            "labelSingular": "Activity Target",
            "labelPlural": "Activity Targets",
            "description": "An activity target",
            "icon": "IconCheckbox",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "5a5c6b21-55b6-44a4-b72d-f09f2d557554",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "924f52b8-7397-4460-8f28-de84922a1aab",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_224c121e7e3114e53f42b5774cb",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4543a451-d588-463b-8068-02c3cf48c6ce",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "c554ea07-198f-4b36-91f1-e8fa0f88c634"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b80fc56f-e86a-4eec-8ae6-f3f6255dbcd4",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "59a8124b-1503-4cef-ba86-462e0b1ce01a"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "32af64f6-0460-42f4-a595-dd237c93c84d",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_899f0157b7ab84de320daec7041",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "285a2ca4-8021-4041-a82b-3daa0505b8ea",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "c554ea07-198f-4b36-91f1-e8fa0f88c634"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "6e7e11d8-10ea-46fd-b34a-d4a66dbea302",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_6eb4b6d76fb7806d24d08bb1766",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "45484e9c-6b87-4bbc-9805-94a6c02ee0b4",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "c554ea07-198f-4b36-91f1-e8fa0f88c634"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "eb902bdb-9a25-4825-92c6-a7f49f9ac39d",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_45db58e96a1bb9769a13a02c828",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "ab285d2c-8cba-45c0-b065-c928eeccdf5f",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "c554ea07-198f-4b36-91f1-e8fa0f88c634"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c554ea07-198f-4b36-91f1-e8fa0f88c634",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5a5c6b21-55b6-44a4-b72d-f09f2d557554",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9b66b4c3-dcdc-4c2c-bacf-993261bba585",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "ActivityTarget opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "52131cfa-4006-45c2-8b7a-bde68c89c737",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9b66b4c3-dcdc-4c2c-bacf-993261bba585",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "56556fda-af85-45e6-9ee7-91058d8f6a0e",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d4082d35-c3cb-412a-8299-c1fa490d73cd",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8f93025f-f458-49fc-ac21-11401e3c9c32",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "ActivityTarget Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.802Z",
                    "updatedAt": "2024-10-24T15:29:29.802Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7b53ce09-89d4-45d6-99b9-d3162c432195",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8f93025f-f458-49fc-ac21-11401e3c9c32",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6d46021e-cabb-4725-bc24-50bd41e9c026",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a4415313-6523-4468-8777-fe52fea9c045",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "ActivityTarget opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "699bc5f0-732b-4f89-a3cf-1608403a7489",
                    "type": "RELATION",
                    "name": "activity",
                    "label": "Activity",
                    "description": "ActivityTarget activity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "80887ab9-7ff0-4eae-8e15-42efdd09a328",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "699bc5f0-732b-4f89-a3cf-1608403a7489",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "787e9f26-fe97-4b79-b151-059997d096d3",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6eb7dff0-c180-4691-99a3-10458a4b6059",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d530c7ee-0ed6-4bf3-870e-e45b2de5fdb2",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "ActivityTarget Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.801Z",
                    "updatedAt": "2024-10-24T15:29:29.801Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "isForeignKey": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f4fa5f62-e227-4f46-a1c3-c2142a55357a",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "ActivityTarget company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59a8124b-1503-4cef-ba86-462e0b1ce01a",
                    "type": "UUID",
                    "name": "activityId",
                    "label": "Activity id (foreign key)",
                    "description": "ActivityTarget activity id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "27eaeac4-b0b9-46cd-a93a-347707ca3899",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "20283378-a926-47d6-a13f-8efc8078faa0",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "ActivityTarget person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d9dccf95-3899-4289-aa59-8efe8913ada5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "20283378-a926-47d6-a13f-8efc8078faa0",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2d93774d-d40d-4277-9f40-2c6801fd7ca4",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8e39e842-80e7-49b0-ba92-c9f1cec68c0a",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "ActivityTarget company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8d4863a4-d32c-4621-b34d-4e8163a5d096",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8e39e842-80e7-49b0-ba92-c9f1cec68c0a",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "423d12ec-eeda-453e-bf38-8b15dec99568",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2a40c5f1-fdf9-46ce-9f07-c57730756796",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "ActivityTarget person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "favorite",
            "namePlural": "favorites",
            "labelSingular": "Favorite",
            "labelPlural": "Favorites",
            "description": "A favorite",
            "icon": "IconHeart",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "a4c4a427-053c-4fd9-91a8-70888f76e7e5",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5d987dc8-ef4d-4558-ad47-ea1c68266b99",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_110d1dc7f0ecd231a18f6784cf3",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "66b3e285-3be0-4b2b-9ba7-f424ce2f2aeb",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "f3319a20-83f7-4400-9e0e-82cd3c1d6b79"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "3df684ea-4cfa-4811-8f4e-79e6b2de714c",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_85f024f9ec673d530d14cf75fe5",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3df05f08-9a35-4518-b2be-2db47f0e7ac9",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "c66abbd4-b4db-4a08-b52a-417ef8dec50a"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "eb7c4d0c-e712-4a2c-9682-d859b18369a1",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_eecddc968e93b9b8ebbfd85dad3",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "cf3ba03f-837c-49de-9501-836fe75af40c",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "0c3baa2f-0131-4d62-b6bd-04df06861f3c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "bf766e0c-6599-4514-a93e-c99dfdaa8dd0",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "a25be0f8-54aa-40f5-97fb-1ffd70da2df0"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "af0ab993-aff0-4adf-9030-a7c5f4674d29",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_7c59b29a053016fc596ddad8a0e",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8c9803c0-04c1-4fec-88db-256d64d8d591",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "7329e951-bd9f-4e1f-9057-032a05405785"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "6fe5b1d1-4881-4823-b080-13e6a9f7e50f",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_1f7e4cb168e77496349c8cefed6",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a40e7dc4-5b74-475c-b187-20797b659b04",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "16e9ab1d-2525-46d7-b46a-d73e248e26ac"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "1c17579d-30b0-4712-89d1-14a247c45b92",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_505a1fccd2804f2472bd92e8720",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": []
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "912511fb-cc6e-483e-9d72-f04daf1ef06c",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_b810a8e37adf5cafd342170ccf8",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "c36c127b-41b7-4fcf-aa13-ced5de4f7aab",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "a25be0f8-54aa-40f5-97fb-1ffd70da2df0"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d99341e7-004b-435e-ba83-6e95257bb0fe",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "28b0dc96-0376-4c32-b30d-bac465d80c8b"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a47ac5a4-0771-44a3-b84a-4af4788a9b9e",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_21d905e0adf19e835f6059a9f3d",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "fafa1ddf-08ec-44b9-8490-9674b2a2c143",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "660a119a-f24e-47b2-b4f2-daf58f5fb3a7"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5e2b1bd2-df67-42f5-b5c7-0d25e5ed788f",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_c3ee83d51bc99ba99fe1998c508",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": []
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "fdf46a6b-169f-423f-9477-98d7123b9862",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_a900d9f809273abe54dc5e166fa",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8d1744e6-da11-49af-b010-a350e7b9c442",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "17f4ef63-d0a2-4408-8a34-fde4bc16285b"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "2bc210a3-c64b-4be6-b895-249d87e53695",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_e14b3424016bea8b7fe220f7761",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8ddaa1e4-44aa-4dba-872f-64a2c4a05061",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "0993cb85-ba36-4a8e-be48-9a7e152101c4"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e8a32699-6436-46a6-aeb7-7f47761f4bf2",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "a25be0f8-54aa-40f5-97fb-1ffd70da2df0"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI4"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "127d61a4-9361-4d01-be0f-c68b7c0870b7",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "24aadd97-3a32-4845-8046-d3930cf6f757",
                    "type": "RELATION",
                    "name": "workflowVersion",
                    "label": "Workflow",
                    "description": "Favorite workflow version",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1b31ee45-18b4-49d7-a75b-40fd22647297",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "24aadd97-3a32-4845-8046-d3930cf6f757",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4d527ba1-4277-4c3b-9900-b39f41faeae8",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "00615218-fb3d-426f-83a6-b3dc67d6575e",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "Favorite Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.804Z",
                    "updatedAt": "2024-10-24T15:29:29.804Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "isForeignKey": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a4c4a427-053c-4fd9-91a8-70888f76e7e5",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a25be0f8-54aa-40f5-97fb-1ffd70da2df0",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "17f4ef63-d0a2-4408-8a34-fde4bc16285b",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Favorite company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4dfb8a78-3edc-4852-a939-a59e240a295a",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "Favorite Rocket",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.805Z",
                    "updatedAt": "2024-10-24T15:29:29.805Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1321e022-08b4-4864-a413-f671e7ea3aaa",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4dfb8a78-3edc-4852-a939-a59e240a295a",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9de25d54-278b-4086-b4d6-08287edbe5e3",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dc9fc7f3-a76f-4bd8-9300-c0418f0b3263",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "Favorite view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "04cdffb4-a2e0-4ecc-948f-25e5c023e42c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "dc9fc7f3-a76f-4bd8-9300-c0418f0b3263",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "59cde067-cd83-4d2c-a86d-95b65766c208",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a026174d-a480-440b-80a0-57277f15d929",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "Favorite note",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c498e208-e77b-487e-868d-543e64c40221",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a026174d-a480-440b-80a0-57277f15d929",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8349efec-852c-4cb2-a0df-4d99582376b8",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0c3baa2f-0131-4d62-b6bd-04df06861f3c",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "Favorite workflow id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0993cb85-ba36-4a8e-be48-9a7e152101c4",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "Favorite task id foreign key",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "16e9ab1d-2525-46d7-b46a-d73e248e26ac",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Favorite person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b808bb46-8266-4bd2-8264-9321e505bfed",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "Favorite workflow",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "29c90b3e-dae6-43b4-8623-51e8b48e6490",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b808bb46-8266-4bd2-8264-9321e505bfed",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "755ba738-be9c-4e22-bb2f-df8ae7026d14",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eae769cb-f90a-49f6-a534-9772b2183304",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "Favorite opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3116f43b-f2df-4895-97be-8f7331f25132",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eae769cb-f90a-49f6-a534-9772b2183304",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "722b3453-6672-49e5-b74f-d6319675d02f",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "28b0dc96-0376-4c32-b30d-bac465d80c8b",
                    "type": "UUID",
                    "name": "favoriteFolderId",
                    "label": "Favorite Folder id (foreign key)",
                    "description": "The folder this favorite belongs to id foreign key",
                    "icon": "IconFolder",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1a4c5ca5-57b4-4017-a919-4fa988664863",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "Favorite view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f248ab3b-833b-43db-9e60-ed6ab456fedb",
                    "type": "RELATION",
                    "name": "workflowRun",
                    "label": "Workflow",
                    "description": "Favorite workflow run",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dd1f9df9-654b-4a49-91f5-ae447dbd83d0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f248ab3b-833b-43db-9e60-ed6ab456fedb",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "71cd4fda-9e00-4953-8232-35add18d7ead",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7329e951-bd9f-4e1f-9057-032a05405785",
                    "type": "UUID",
                    "name": "workflowRunId",
                    "label": "Workflow id (foreign key)",
                    "description": "Favorite workflow run id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "660a119a-f24e-47b2-b4f2-daf58f5fb3a7",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "Favorite note id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c66abbd4-b4db-4a08-b52a-417ef8dec50a",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "Favorite opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da5b156d-b51e-47e4-a729-7a28c420f588",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Favorite company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9b3f0de4-2e61-4090-a650-ebb96a6f4c11",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "da5b156d-b51e-47e4-a729-7a28c420f588",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "63ce0cf2-4bd5-4130-b8cf-25c8cb31cb69",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec745eca-40a8-4b77-b2c0-c65e3d895bd9",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Favorite person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4a177d72-2948-4d14-90fb-69f0c4ff9d2f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ec745eca-40a8-4b77-b2c0-c65e3d895bd9",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a6ffa28a-560b-492c-9c7f-04a93da8e0bb",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "124dd4cd-0209-453d-86f6-ae8a1c8e59eb",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "92c8dfd9-2122-4eed-b6ec-344d8b39d82e",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Favorite workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ffccf9a8-edbf-4bdf-8c39-311674045609",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "92c8dfd9-2122-4eed-b6ec-344d8b39d82e",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7549782c-6c6e-42f4-a786-16816b92e69c",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e161d71b-a9e7-422e-8a6e-13ab66a0f06e",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "Favorite task",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2aff2742-cf44-44f5-be04-3a91c28c9653",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e161d71b-a9e7-422e-8a6e-13ab66a0f06e",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "60977dbe-9321-44c5-b11d-a82cd0efdcc0",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "26970678-89bf-4b25-b5a1-37183134d66a",
                    "type": "RELATION",
                    "name": "favoriteFolder",
                    "label": "Favorite Folder",
                    "description": "The folder this favorite belongs to",
                    "icon": "IconFolder",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ee1c6b24-0205-4f40-9f50-6b0590ff671a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "26970678-89bf-4b25-b5a1-37183134d66a",
                        "name": "favoriteFolder"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ec8bd398-1ba8-4b43-9fc6-14cffb1b15b5",
                        "nameSingular": "favoriteFolder",
                        "namePlural": "favoriteFolders"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5712c594-ea5d-4e5c-a948-08818d10ef16",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f3319a20-83f7-4400-9e0e-82cd3c1d6b79",
                    "type": "UUID",
                    "name": "workflowVersionId",
                    "label": "Workflow id (foreign key)",
                    "description": "Favorite workflow version id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "324f69d9-6361-4cfc-bbfa-5062dbd51dd0",
                    "type": "NUMBER",
                    "name": "position",
                    "label": "Position",
                    "description": "Favorite position",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": 0,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2e51e9a2-7ede-40b8-b6f4-efbb52d04420",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Favorite workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "opportunity",
            "namePlural": "opportunities",
            "labelSingular": "Opportunity",
            "labelPlural": "Opportunities",
            "description": "An opportunity",
            "icon": "IconTargetArrow",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "3a78a9e4-46ee-4b00-a4d0-bd8fc0b1f57b",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "69280885-1908-4cc5-8a83-016e0eb64809",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_425ac6c73ecb993cf9cbc2c2b00",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "810b8153-28cb-4490-bcef-d6c385973140",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "02ed3481-040f-4583-a145-f3b5733506ca"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "3d0e0a7b-9f07-4bf2-9215-a445dabc9a63",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_82cdf247553f960093baa7c6635",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e93eae7e-9bbf-49f6-ae38-ef65973a0702",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "02c617ee-14f5-426e-939d-d3c7311601d2"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7bb69de2-1620-49b5-9557-9c8adaab7849",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_4f469d3a7ee08aefdc099836364",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b8e46abc-0a5a-49e4-8103-a2ed8bd7aaa3",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "02c617ee-14f5-426e-939d-d3c7311601d2"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a400c345-4e8e-44e0-880e-24d34b103187",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "bcc8ffd6-786b-45ed-8154-7e3003212fa1"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "af827dc8-7d7b-4940-8dcf-34391a0d6a33",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_9f96d65260c4676faac27cb6bf3",
                    "indexWhereClause": null,
                    "indexType": "GIN",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1ec2d5e0-7417-4396-87ca-f1213a2bfc82",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "0f7bb446-732e-4d0e-8470-f9d463956ec7"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjIw"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "56556fda-af85-45e6-9ee7-91058d8f6a0e",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the opportunity",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "52131cfa-4006-45c2-8b7a-bde68c89c737",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "56556fda-af85-45e6-9ee7-91058d8f6a0e",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9b66b4c3-dcdc-4c2c-bacf-993261bba585",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "acae9092-f728-427d-a161-7ca98190f08f",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eb994d72-1d76-4695-ad24-ebce6c04438e",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the opportunity",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ac435bd6-2158-49bd-998f-750f69e2bcfe",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eb994d72-1d76-4695-ad24-ebce6c04438e",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "65759050-f8de-4c53-ae1c-13f434885011",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bcc8ffd6-786b-45ed-8154-7e3003212fa1",
                    "type": "SELECT",
                    "name": "stage",
                    "label": "Stage",
                    "description": "Opportunity stage",
                    "icon": "IconProgressCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'NEW'",
                    "options": [
                      {
                        "id": "1f0e0157-a515-4785-8cc0-539e8b172fda",
                        "color": "red",
                        "label": "New",
                        "value": "NEW",
                        "position": 0
                      },
                      {
                        "id": "3e5ffaf5-dadb-4ab4-9c47-26e4883fec66",
                        "color": "purple",
                        "label": "Screening",
                        "value": "SCREENING",
                        "position": 1
                      },
                      {
                        "id": "5bbbde5c-a605-4755-98cd-31a334ee7b1f",
                        "color": "sky",
                        "label": "Meeting",
                        "value": "MEETING",
                        "position": 2
                      },
                      {
                        "id": "d78e4c39-acab-4379-a798-cbc1b3962e61",
                        "color": "turquoise",
                        "label": "Proposal",
                        "value": "PROPOSAL",
                        "position": 3
                      },
                      {
                        "id": "71e65683-6b47-45a7-a392-9178a86f4f4f",
                        "color": "yellow",
                        "label": "Customer",
                        "value": "CUSTOMER",
                        "position": 4
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "722b3453-6672-49e5-b74f-d6319675d02f",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the opportunity",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3116f43b-f2df-4895-97be-8f7331f25132",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "722b3453-6672-49e5-b74f-d6319675d02f",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eae769cb-f90a-49f6-a534-9772b2183304",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02ed3481-040f-4583-a145-f3b5733506ca",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Opportunity company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "556235a0-d375-4d61-a990-ba0c198e5afe",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Opportunity record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3a78a9e4-46ee-4b00-a4d0-bd8fc0b1f57b",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The opportunity name",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0f7bb446-732e-4d0e-8470-f9d463956ec7",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "66417686-4a5f-4dd3-a262-9d3edf36ab82",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments linked to the opportunity",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07be1891-a9d0-4126-91d1-e2e6730186a1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "66417686-4a5f-4dd3-a262-9d3edf36ab82",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "666a9ae3-34b0-4f10-b70f-6fe54023ebe7",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ccc54fa2-9726-47d4-929b-525b7378ec8d",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the opportunity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "86b15a79-9f48-4a47-8ad3-d28270e872aa",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ccc54fa2-9726-47d4-929b-525b7378ec8d",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a7a39d16-972a-406d-8bfe-31f6e5d500eb",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "553a7200-f711-47d5-b158-acfeaaf48211",
                    "type": "RELATION",
                    "name": "pointOfContact",
                    "label": "Point of Contact",
                    "description": "Opportunity point of contact",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ed0294ed-cbfd-4937-8a74-ff92c97db956",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "553a7200-f711-47d5-b158-acfeaaf48211",
                        "name": "pointOfContact"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "27106aaa-6728-449d-81d9-6e2355e64b4f",
                        "name": "pointOfContactForOpportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9f35db4d-1333-4dc1-816b-d006e3df6259",
                    "type": "UUID",
                    "name": "pointOfContactId",
                    "label": "Point of Contact id (foreign key)",
                    "description": "Opportunity point of contact id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02c617ee-14f5-426e-939d-d3c7311601d2",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f237442c-f27b-461e-926d-b42a204d4c6b",
                    "type": "CURRENCY",
                    "name": "amount",
                    "label": "Amount",
                    "description": "Opportunity amount",
                    "icon": "IconCurrencyDollar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "amountMicros": null,
                      "currencyCode": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5d97d02d-cadb-4565-96b0-ad571b27d8f4",
                    "type": "DATE_TIME",
                    "name": "closeDate",
                    "label": "Close date",
                    "description": "Opportunity close date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59a97157-f4ff-4caa-9952-0060fc91501c",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Opportunity company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c577d418-da40-4f85-8020-577931c9ab87",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "59a97157-f4ff-4caa-9952-0060fc91501c",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "17750fc3-4e8c-4b40-91aa-9a684d009afb",
                        "name": "opportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eeb3ff09-06f0-456e-9942-bfca423f4f19",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "310bd81d-2792-4f9c-8138-0574c7bdb695",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "429ed9d9-15c2-4b5f-a97d-41133efa52cb",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b4327c38-7acb-4a3c-9d1e-5505724310e8",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the opportunity.",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9c9cdd5c-bb84-4a76-acdb-b04fb4fddae8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b4327c38-7acb-4a3c-9d1e-5505724310e8",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "46d4fa39-58d0-4903-8dfc-2adf16819699",
                        "name": "opportunity"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "noteTarget",
            "namePlural": "noteTargets",
            "labelSingular": "Note Target",
            "labelPlural": "Note Targets",
            "description": "A note target",
            "icon": "IconCheckbox",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "5837d8c1-0f1a-4f2a-8640-0fcbfcc1737c",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "bd322ad3-3261-4aba-adf5-2ed7ac9959bc",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_56454973bce16e65ee1ae3d2e40",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "46d079cb-6718-4123-833a-47e781471922",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "c706229f-8053-41c1-bd85-26f38ddf2847"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ed1c3b65-c79e-4bda-bfc2-ce04586ed29b",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_19ea95ddb39f610f7dcad4c4336",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3b15d5f2-b2f5-4d65-ae06-f2bf39d90b4c",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "814be0c1-d423-4d2a-9b49-ce677a9836bb"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "401c8b75-40c4-44ff-9aea-4a2973e0f5b5",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_241f0cca089399c8c5954086b8d",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1fe4a392-0ff1-4879-8d16-f40ebda4a1e7",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "814be0c1-d423-4d2a-9b49-ce677a9836bb"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4827946e-d52a-4a01-abf3-d27069807a7c",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "89f74441-923f-4c01-bb90-2bbc76cb5517"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5e72e781-43ea-4bc7-a4b7-3a25079c63fe",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_68bce49f4de05facd5365a3a797",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1c96d885-fcc9-4f10-8d5e-24450a95657b",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "814be0c1-d423-4d2a-9b49-ce677a9836bb"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c706229f-8053-41c1-bd85-26f38ddf2847",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "NoteTarget person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f40cd852-22a2-4d84-a3d9-d911e93d70a2",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "NoteTarget company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ef815cbe-9e5d-4005-afa2-4326e47a55f2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f40cd852-22a2-4d84-a3d9-d911e93d70a2",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9c0f2648-ce8c-4c25-8cc6-076519844e9c",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "90f13bee-ea83-4dcd-ba9f-72a1b89cb55c",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "NoteTarget person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "35f7ff45-dc8c-4581-b796-f0d052b4ca38",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "90f13bee-ea83-4dcd-ba9f-72a1b89cb55c",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e69a9044-3146-4c59-91d4-04b6704b3d74",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "76b49c4d-0f2a-429e-9678-c6422fca3d27",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "NoteTarget note",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8c69fea-d9b7-4507-84b5-85b232ab98c0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "76b49c4d-0f2a-429e-9678-c6422fca3d27",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "56884373-9de9-4216-8e86-724f817f7bca",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5837d8c1-0f1a-4f2a-8640-0fcbfcc1737c",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "89f74441-923f-4c01-bb90-2bbc76cb5517",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "NoteTarget note id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "84abb3aa-9f9b-486e-bc55-f7b189815797",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e8e03688-64f7-430e-8814-8b3056f0210e",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "NoteTarget Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.810Z",
                    "updatedAt": "2024-10-24T15:29:29.810Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "isForeignKey": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f7e6ff02-7c73-4516-af60-d4781bac7203",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a7a39d16-972a-406d-8bfe-31f6e5d500eb",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "NoteTarget opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "86b15a79-9f48-4a47-8ad3-d28270e872aa",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a7a39d16-972a-406d-8bfe-31f6e5d500eb",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ccc54fa2-9726-47d4-929b-525b7378ec8d",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e1c479d2-98ea-4695-a37f-447568ea7ec7",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "NoteTarget company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "11a6b310-2c27-4807-a608-00203c38cb5a",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "NoteTarget opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "814be0c1-d423-4d2a-9b49-ce677a9836bb",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "73dca6dc-4b7f-4062-ac33-3c05508078de",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "NoteTarget Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.810Z",
                    "updatedAt": "2024-10-24T15:29:29.810Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dcfb1a2e-912e-48e8-8e6f-350a4559bbf2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "73dca6dc-4b7f-4062-ac33-3c05508078de",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "26702c98-6f22-4666-bec3-c089400daa81",
                        "name": "noteTargets"
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "33e51e27-22b8-42be-a904-7c4646d26191",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "message",
            "namePlural": "messages",
            "labelSingular": "Message",
            "labelPlural": "Messages",
            "description": "Message",
            "icon": "IconMessage",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "35515752-06b1-433c-aa02-68e704fac6a6",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "3b9be43e-2c83-45ba-a73a-64bd976b8992",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_78fa73d661d632619e17de211e6",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "51ef3f41-d75e-4996-b1c5-3c57a664ad20",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "da9edac3-993a-46aa-8b4e-7b1684d14b42"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0c4a5355-1ca0-4e19-bf8e-8c7eec2bb751",
                    "type": "DATE_TIME",
                    "name": "receivedAt",
                    "label": "Received At",
                    "description": "The date the message was received",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "13b1abf3-aa1c-47c3-ad59-0d97f04bf1c7",
                    "type": "UUID",
                    "name": "messageThreadId",
                    "label": "Message Thread Id id (foreign key)",
                    "description": "Message Thread Id id foreign key",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "29875a79-6fd1-44c0-9c15-caef393823ac",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4efa14a2-0acf-4832-b8cc-49ac2c57177a",
                    "type": "TEXT",
                    "name": "text",
                    "label": "Text",
                    "description": "Text",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "640739c0-7c73-46c6-b356-d4f1b3ea46f7",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9de0a4fe-3f21-4a02-8b81-d24bb90a2655",
                    "type": "TEXT",
                    "name": "headerMessageId",
                    "label": "Header message Id",
                    "description": "Message id from the message header",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "35515752-06b1-433c-aa02-68e704fac6a6",
                    "type": "TEXT",
                    "name": "subject",
                    "label": "Subject",
                    "description": "Subject",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da9edac3-993a-46aa-8b4e-7b1684d14b42",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c0f2c4ac-0516-4fdb-bc2b-e3cbf1f1da1d",
                    "type": "RELATION",
                    "name": "messageChannelMessageAssociations",
                    "label": "Message Channel Association",
                    "description": "Messages from the channel.",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "afb35c8c-63f9-40aa-9c56-e4631c7609a5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "33e51e27-22b8-42be-a904-7c4646d26191",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c0f2c4ac-0516-4fdb-bc2b-e3cbf1f1da1d",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cc017b4f-ba4a-4673-8216-103e580bcd96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c1d07736-8367-4f07-8ea4-6e788cfde082",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ad43950c-c9ea-4670-bebb-a98c4c1fb73a",
                    "type": "RELATION",
                    "name": "messageThread",
                    "label": "Message Thread Id",
                    "description": "Message Thread Id",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "15a52974-a4c1-47b6-abda-ecb68598ec14",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "33e51e27-22b8-42be-a904-7c4646d26191",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ad43950c-c9ea-4670-bebb-a98c4c1fb73a",
                        "name": "messageThread"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19b909fe-1114-4204-948e-83c379e32825",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3d06329b-54d3-4ec0-8f04-deac39f7de2d",
                        "name": "messages"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ccc38bb3-016c-4c8f-9301-fb874ede7dc5",
                    "type": "RELATION",
                    "name": "messageParticipants",
                    "label": "Message Participants",
                    "description": "Message Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b2755a82-01c5-41b1-a34a-560494938e5f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "33e51e27-22b8-42be-a904-7c4646d26191",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ccc38bb3-016c-4c8f-9301-fb874ede7dc5",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6c3dfa43-d32f-4707-a73b-e2c1d94b2f3b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "34674542-34e8-4e1c-bf64-265a92c8d666",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4748655e-6062-45f6-a80d-c6d56de8660e",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "25c4ad74-36ab-4244-bccd-9671df26cd06",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "calendarChannel",
            "namePlural": "calendarChannels",
            "labelSingular": "Calendar Channel",
            "labelPlural": "Calendar Channels",
            "description": "Calendar Channels",
            "icon": "IconCalendar",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "02aa9105-8685-4fd0-aa98-3d6ba75fc7eb",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "6d8d160c-5b38-4dd0-87fe-a3c3716cc2ba",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_3465c79448bacd2f1268e5f6310",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "22601814-dab5-4896-b0a7-7bcd196bd0d2",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "aca498ae-6c12-49d2-b346-4b5adeb8e18b"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE3"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "61e49fb9-c799-4a08-bf3b-4994f3c395f1",
                    "type": "SELECT",
                    "name": "syncStage",
                    "label": "Sync stage",
                    "description": "Sync stage",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "ef0fe879-6e2c-491f-8044-d1516b185304",
                        "color": "blue",
                        "label": "Full calendar event list fetch pending",
                        "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "2b5ca13e-5458-4e62-860d-af21567fd93f",
                        "color": "blue",
                        "label": "Partial calendar event list fetch pending",
                        "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "4def3374-e30b-4f55-aa0a-b32ce09a8354",
                        "color": "orange",
                        "label": "Calendar event list fetch ongoing",
                        "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "68b745cc-35dd-49e1-b1ad-2f27fb9d4a5f",
                        "color": "blue",
                        "label": "Calendar events import pending",
                        "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "8c95989f-7a54-48e2-a55a-08213f7d3881",
                        "color": "orange",
                        "label": "Calendar events import ongoing",
                        "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "96b1760b-c3f1-49f0-8ef1-912974857f99",
                        "color": "red",
                        "label": "Failed",
                        "value": "FAILED",
                        "position": 5
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "21b53dc6-a01a-485d-8d7c-4238c92ac976",
                    "type": "BOOLEAN",
                    "name": "isSyncEnabled",
                    "label": "Is Sync Enabled",
                    "description": "Is Sync Enabled",
                    "icon": "IconRefresh",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d30d576e-859d-4cdf-b09d-7874310dab87",
                    "type": "DATE_TIME",
                    "name": "syncStageStartedAt",
                    "label": "Sync stage started at",
                    "description": "Sync stage started at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c07b20a1-a3f2-4e27-a406-b9e395e41f70",
                    "type": "RELATION",
                    "name": "calendarChannelEventAssociations",
                    "label": "Calendar Channel Event Associations",
                    "description": "Calendar Channel Event Associations",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cf8500e0-feff-4a87-afd8-bdeea613f0aa",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "25c4ad74-36ab-4244-bccd-9671df26cd06",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c07b20a1-a3f2-4e27-a406-b9e395e41f70",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a4c607d4-9d6d-435f-954f-6c6632b54b98",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a0c7ece2-0683-4894-902d-d2467bf080a2",
                        "name": "calendarChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4a20825e-f7d0-4e5a-83f6-3a1075804622",
                    "type": "SELECT",
                    "name": "visibility",
                    "label": "Visibility",
                    "description": "Visibility",
                    "icon": "IconEyeglass",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "8c637b06-0462-4f9c-88b0-7453aefd5fbb",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "0b92b3df-9d34-44dc-985e-c54fc98b338f",
                        "color": "orange",
                        "label": "Share Everything",
                        "value": "SHARE_EVERYTHING",
                        "position": 1
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "91988b27-8200-42cd-91b0-22b65a92d38d",
                    "type": "BOOLEAN",
                    "name": "isContactAutoCreationEnabled",
                    "label": "Is Contact Auto Creation Enabled",
                    "description": "Is Contact Auto Creation Enabled",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aca498ae-6c12-49d2-b346-4b5adeb8e18b",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "38ee6789-8f79-401c-937a-562231ff787c",
                    "type": "DATE_TIME",
                    "name": "syncedAt",
                    "label": "Last sync date",
                    "description": "Last sync date",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "95439290-12ce-4163-8e8f-12378539e11a",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "01a3a94d-60ae-498e-ba4e-3899afd809a4",
                    "type": "RELATION",
                    "name": "connectedAccount",
                    "label": "Connected Account",
                    "description": "Connected Account",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1a1125cc-dbb6-48b0-ac4b-bd45acc9b647",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "25c4ad74-36ab-4244-bccd-9671df26cd06",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "01a3a94d-60ae-498e-ba4e-3899afd809a4",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "af711b7b-2e1a-4c52-a1ec-889a3030beae",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bf3d62dc-45d9-4d05-94cd-00e60fbc5eb8",
                        "name": "calendarChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f138d049-c9c1-468f-9f84-2d743ce8389b",
                    "type": "TEXT",
                    "name": "syncCursor",
                    "label": "Sync Cursor",
                    "description": "Sync Cursor. Used for syncing events from the calendar provider",
                    "icon": "IconReload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e83e6230-a579-45c1-bcfb-f4c878287d8c",
                    "type": "UUID",
                    "name": "connectedAccountId",
                    "label": "Connected Account id (foreign key)",
                    "description": "Connected Account id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02aa9105-8685-4fd0-aa98-3d6ba75fc7eb",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db326109-d181-4193-92aa-85e0252a85d2",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0117e80c-e700-4b8c-827b-8c11545739ee",
                    "type": "SELECT",
                    "name": "syncStatus",
                    "label": "Sync status",
                    "description": "Sync status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "5728b4ae-131b-4171-8ac9-364e2586d2ab",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "bb53da21-ad59-4860-99e7-22ecb321d694",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "3611ae5d-66fb-4566-b3b7-119c2aeaf56b",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "10dd255d-31a0-40d6-87a6-83ba6e678fa4",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "3816e403-6750-47d6-bf3c-212eaa684a7d",
                        "color": "red",
                        "label": "Failed Unknown",
                        "value": "FAILED_UNKNOWN",
                        "position": 5
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7325928d-1f5d-47fe-acba-582975cdf107",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "708041ed-dde9-45dc-bf00-2ecf99b1ce2a",
                    "type": "SELECT",
                    "name": "contactAutoCreationPolicy",
                    "label": "Contact auto creation policy",
                    "description": "Automatically create records for people you participated with in an event.",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                    "options": [
                      {
                        "id": "e48af2cf-5010-42f4-baad-98e83c2dd7ea",
                        "color": "green",
                        "label": "As Participant and Organizer",
                        "value": "AS_PARTICIPANT_AND_ORGANIZER",
                        "position": 0
                      },
                      {
                        "id": "865a9db3-b7c6-4e78-a14f-3f5a1a022332",
                        "color": "orange",
                        "label": "As Participant",
                        "value": "AS_PARTICIPANT",
                        "position": 1
                      },
                      {
                        "id": "c0e1a9dc-a99d-4f78-a907-5d4ea8e0db6a",
                        "color": "blue",
                        "label": "As Organizer",
                        "value": "AS_ORGANIZER",
                        "position": 2
                      },
                      {
                        "id": "e6ec0e14-8432-41cd-8331-3034f5eb0442",
                        "color": "red",
                        "label": "None",
                        "value": "NONE",
                        "position": 3
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cb4bd246-f676-4c7c-90fc-e7ec49ee0131",
                    "type": "NUMBER",
                    "name": "throttleFailureCount",
                    "label": "Throttle Failure Count",
                    "description": "Throttle Failure Count",
                    "icon": "IconX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": 0,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "timelineActivity",
            "namePlural": "timelineActivities",
            "labelSingular": "Timeline Activity",
            "labelPlural": "Timeline Activities",
            "description": "Aggregated / filtered event to be displayed on the timeline",
            "icon": "IconIconTimelineEvent",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "c7da5fc6-0f8a-4f48-85aa-fcad3447f309",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "8fc2eab3-0e1d-4b7c-b657-f54708ec50c3",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_daf6592d1dff4cff3401bf23c67",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d25e9fe1-e8f5-4b34-9f56-2411ae6d7a23",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "66d71066-e06b-4fa0-b679-6acf27a43182",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_b292fe34a9e2d55884febd07e93",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8341bfeb-ab98-4c14-b7a6-beb746e1a624",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5ab33ed0-57f9-4a80-80f7-2675c1d72b5f",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_a98bc2277b52c6dd52303e52c21",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "98bba665-012f-461a-9a77-4da97cb2e3a4",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "e7860189-b3b6-41f4-924d-af22e6e845d4"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "946fbe13-86ba-4342-80e4-05c1b2428f6b",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "be8ce7d2-8f89-4fba-9987-e5b0b0a46e90",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_7e0d952730f13369e3bd9c2f1a9",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "42f88249-622d-4102-b37b-7c4d725dd67e",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "159e6fb2-86f7-45f8-9336-8e4ebba4f5a7",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_84b1e01cb0480e514a6e7ec0095",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "93027b6b-78df-42b7-9485-9f7eda03cf30",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "64f67c90-4011-4162-985c-ceed30ec5880",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_a930d316a6b4f3b81d3f026dd16",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1536cad7-a554-49df-a835-b65dec124ee1",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "c1e1b02f-9a45-4e30-8194-6b90ca7c79bf"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "c36600b4-b604-4d74-af28-bfeb9b03655e",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_6eae0c4202a87f812adf2f2ba6f",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b25e35d0-801a-4983-9505-bc32791dea20",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "6261bc78-a1cd-43f9-b366-389ce2fce91a"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "eb76accb-ef16-4cd1-8420-691d2876f1a7",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_4e40a441ad75df16dd71499529a",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d411bfed-273c-40bd-949a-0ba4d9ff218b",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "f19a1f4e-9bda-4af9-9477-2d1d78468a9d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0c4a6c2e-f5d5-4909-aabf-fb72a3dda8cc",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "24cd167a-ab7e-42bf-9949-8c43dd3aca62",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_2708a99873421942c99ab94da12",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "30615b0d-0122-4423-9b1f-5ac8729a97c3",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "73cc528c-6560-4481-862f-e48ea94b97f4"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "23a33484-4bdb-4d87-91b3-29c58ff227bd",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI5"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6261bc78-a1cd-43f9-b366-389ce2fce91a",
                    "type": "UUID",
                    "name": "workflowRunId",
                    "label": "Workflow Run id (foreign key)",
                    "description": "Event workflow run id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c6fbc26d-bb77-426c-baa8-2400cb4fba27",
                    "type": "TEXT",
                    "name": "linkedRecordCachedName",
                    "label": "Linked Record cached name",
                    "description": "Cached record name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "46d4fa39-58d0-4903-8dfc-2adf16819699",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "Event opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9c9cdd5c-bb84-4a76-acdb-b04fb4fddae8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "46d4fa39-58d0-4903-8dfc-2adf16819699",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b4327c38-7acb-4a3c-9d1e-5505724310e8",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d78d8732-9ac0-4b35-b5ed-9b96e7d35ca3",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "088e0cf6-bab7-478a-8d0b-cbd0cf248c6d",
                    "type": "RELATION",
                    "name": "workflowVersion",
                    "label": "WorkflowVersion",
                    "description": "Event workflow version",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f5000448-99e2-48b5-8c68-a782314a0ee2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "088e0cf6-bab7-478a-8d0b-cbd0cf248c6d",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "59562b2f-df2f-4dbd-961c-7c6d97915805",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "38e1bdf5-b20f-469d-9c87-13167e573ccb",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e7860189-b3b6-41f4-924d-af22e6e845d4",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "Event note id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6f894450-ebe7-4c67-8bc1-e1c68db7141f",
                    "type": "RAW_JSON",
                    "name": "properties",
                    "label": "Event details",
                    "description": "Json value for event details",
                    "icon": "IconListDetails",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8c2fbf9a-4544-4ff3-bd49-0627a7c36cc5",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c7da5fc6-0f8a-4f48-85aa-fcad3447f309",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5b7be502-23df-459a-a604-12141dfee0b1",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "Event task id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c1e1b02f-9a45-4e30-8194-6b90ca7c79bf",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Event workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "73cc528c-6560-4481-862f-e48ea94b97f4",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "Event workflow id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2d191700-fade-4cd2-9aa6-33c2d8facc76",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "Event task",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ae60adb6-1a89-463b-8f3c-6f45fdc13e1f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2d191700-fade-4cd2-9aa6-33c2d8facc76",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c7f903d2-233b-44c8-bf93-db2ec2df97eb",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4af7562e-ff36-49a8-b109-f0a21010c8d4",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "405db354-5276-43d4-90b1-82907d5bf975",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "Event opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "582567a6-b4ab-4605-9e67-87ba3eb13eb7",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "Event workflow",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6c1b91fc-3642-4e7c-ac0f-ca8db5654295",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "582567a6-b4ab-4605-9e67-87ba3eb13eb7",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f127a8ad-9c39-4adf-aecb-7ffb1317dc1b",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2c2d3d67-330e-4b16-a2a4-906c03d1cc62",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "72a2985f-8095-4845-8fda-9b16a72aff34",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Event company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2addab85-c2e0-4a7b-9357-feec790cdaac",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Event person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "29124d90-1170-4283-9c87-717f19d72be6",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Event person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "491d9d4e-12c9-4722-a4ec-b07f03dc8745",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "29124d90-1170-4283-9c87-717f19d72be6",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8675e638-59fe-425c-8e40-15358a4aa385",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "560d6d58-b0c1-4c93-96ce-7ed477585526",
                    "type": "UUID",
                    "name": "linkedObjectMetadataId",
                    "label": "Linked Object Metadata Id",
                    "description": "inked Object Metadata Id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4ca01b98-b58a-4f09-bbcd-3b6e2635be33",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Event company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8b069796-c4cb-4b4e-9fbc-bf5f410ea66d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4ca01b98-b58a-4f09-bbcd-3b6e2635be33",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "10decf85-67f4-4076-a9e3-ac62e402abc3",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "df58f2e7-34d4-4d96-81d3-732d69ef9a2d",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "Timeline Activity Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.798Z",
                    "updatedAt": "2024-10-24T15:29:29.798Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "isForeignKey": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62796cc9-0e93-4dff-8fc4-ff80e5bd1554",
                    "type": "UUID",
                    "name": "linkedRecordId",
                    "label": "Linked Record id",
                    "description": "Linked Record id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f19a1f4e-9bda-4af9-9477-2d1d78468a9d",
                    "type": "UUID",
                    "name": "workflowVersionId",
                    "label": "WorkflowVersion id (foreign key)",
                    "description": "Event workflow version id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "157b3d02-0448-4eb2-89ea-48874d168f85",
                    "type": "DATE_TIME",
                    "name": "happensAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9b92d85e-8582-4b09-a093-c335583958c1",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "Timeline Activity Rocket",
                    "icon": "IconTimeline",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.799Z",
                    "updatedAt": "2024-10-24T15:29:29.799Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fa79944b-9afe-4250-aad0-2aa85b5a4e77",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9b92d85e-8582-4b09-a093-c335583958c1",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba27026b-cbf5-4a99-88d4-e2e6ba4b20d7",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a5d75fbb-67ac-4961-823a-14fb82fe23f6",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8bd70f42-8e5b-4d4c-814b-788e8a0cb5cf",
                    "type": "RELATION",
                    "name": "workflowRun",
                    "label": "Workflow Run",
                    "description": "Event workflow run",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "48734784-6855-4f33-bcef-e55f1937ec90",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8bd70f42-8e5b-4d4c-814b-788e8a0cb5cf",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c05ab724-c04d-4f35-8234-584d4f0e8aa5",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6393f27a-0473-4ebe-a8e3-04d07a3b8c77",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3496d20a-06bf-4b89-9c03-495df3b02415",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Event name",
                    "description": "Event name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2564c692-db11-465b-855e-de84806cd664",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Event workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d0bb647d-b92e-40e6-9a29-2dadace8c7d1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2564c692-db11-465b-855e-de84806cd664",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "63937205-8023-447f-a861-ceda6e84f77a",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8147da26-839b-4345-9111-9f00a692192b",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "Event note",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1f01dba2-a061-44a5-8524-6b15be1caaee",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8147da26-839b-4345-9111-9f00a692192b",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8eebd364-b9f6-421a-8bc6-99122f08f8d6",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ea583df2-1234-4e07-b5c9-730544aa6f41",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "15ad726b-9b53-4865-a920-afecf325111e",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "2011c034-fdd0-4e19-8a52-ea3d91c4df37",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "messageChannel",
            "namePlural": "messageChannels",
            "labelSingular": "Message Channel",
            "labelPlural": "Message Channels",
            "description": "Message Channels",
            "icon": "IconMessage",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "237ed7a8-7da2-4700-a15a-d54a56e4c90f",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4c671b54-0449-48d6-be38-8bc3d85167cd",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_c3af632ce35236d21f8ae1f4cfd",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "717c0dd1-b0c4-4b80-8d2a-6757314f3ccc",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "b6256f76-387e-4c9c-b42f-0221373cab97"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjIw"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a738471d-5902-4d88-9f3a-66d1560f6329",
                    "type": "BOOLEAN",
                    "name": "isContactAutoCreationEnabled",
                    "label": "Is Contact Auto Creation Enabled",
                    "description": "Is Contact Auto Creation Enabled",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6901fad8-5ee5-4467-b3d5-da9fd8d1b5d9",
                    "type": "TEXT",
                    "name": "syncCursor",
                    "label": "Last sync cursor",
                    "description": "Last sync cursor",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0126bef3-6a3c-4006-b287-2a73a8cee92b",
                    "type": "BOOLEAN",
                    "name": "excludeNonProfessionalEmails",
                    "label": "Exclude non professional emails",
                    "description": "Exclude non professional emails",
                    "icon": "IconBriefcase",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f7fd8b6b-c6e0-40a2-9395-5848eac27919",
                    "type": "SELECT",
                    "name": "visibility",
                    "label": "Visibility",
                    "description": "Visibility",
                    "icon": "IconEyeglass",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "1e9f9845-97bd-47da-b84b-b7314aad0353",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "48b39f95-67de-474e-8f0c-77a8f06f3d97",
                        "color": "blue",
                        "label": "Subject",
                        "value": "SUBJECT",
                        "position": 1
                      },
                      {
                        "id": "1a498f96-f924-452b-8d35-6def4e10cfee",
                        "color": "orange",
                        "label": "Share Everything",
                        "value": "SHARE_EVERYTHING",
                        "position": 2
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e2262dae-d10a-4f9a-a956-143dbd6ca96e",
                    "type": "DATE_TIME",
                    "name": "syncedAt",
                    "label": "Last sync date",
                    "description": "Last sync date",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "054bb79d-0493-4ece-a1f7-ec8089a458ef",
                    "type": "SELECT",
                    "name": "syncStatus",
                    "label": "Sync status",
                    "description": "Sync status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "6c07569b-1f17-4473-98d6-c6a2c7d6903a",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "eb0c9f39-a983-4b1e-b269-bd2e56d821b3",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "71ff1513-5231-4119-9a2e-8fbac36ddb3b",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "41041f4d-8ee6-4650-86a0-99c616612f49",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "96bc3c1a-c036-4afc-a8f8-0a95e4083149",
                        "color": "red",
                        "label": "Failed Unknown",
                        "value": "FAILED_UNKNOWN",
                        "position": 5
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "036f82fd-e430-448f-8a1e-9b855c9772fa",
                    "type": "BOOLEAN",
                    "name": "excludeGroupEmails",
                    "label": "Exclude group emails",
                    "description": "Exclude group emails",
                    "icon": "IconUsersGroup",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d1065fbf-221e-4ffb-9acd-423f6f97e919",
                    "type": "RELATION",
                    "name": "messageChannelMessageAssociations",
                    "label": "Message Channel Association",
                    "description": "Messages from the channel.",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f808c0da-79a8-4a6c-b1e0-eda979e0638c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2011c034-fdd0-4e19-8a52-ea3d91c4df37",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d1065fbf-221e-4ffb-9acd-423f6f97e919",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cc017b4f-ba4a-4673-8216-103e580bcd96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4cb9f95f-7c57-416e-8608-aab68ab4807d",
                        "name": "messageChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fc47dcff-f14f-4670-9cfb-2ba495fb5eb4",
                    "type": "NUMBER",
                    "name": "throttleFailureCount",
                    "label": "Throttle Failure Count",
                    "description": "Throttle Failure Count",
                    "icon": "IconX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": 0,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ed87416e-33e4-4932-a2c4-c779e45e9e28",
                    "type": "SELECT",
                    "name": "syncStage",
                    "label": "Sync stage",
                    "description": "Sync stage",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "28ec2858-be6e-4d40-bf6d-a8f6497f4b63",
                        "color": "blue",
                        "label": "Full messages list fetch pending",
                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "fa583d7f-cfb5-459c-b089-3e57a41c73c6",
                        "color": "blue",
                        "label": "Partial messages list fetch pending",
                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "f2933485-2abe-4590-af3f-c9e44195f2ca",
                        "color": "orange",
                        "label": "Messages list fetch ongoing",
                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "ad96a7e1-58ec-4128-9291-3350ea244df3",
                        "color": "blue",
                        "label": "Messages import pending",
                        "value": "MESSAGES_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "a5f9dd92-bfd1-4065-99a7-ed4691be1932",
                        "color": "orange",
                        "label": "Messages import ongoing",
                        "value": "MESSAGES_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "bcdf0a02-d2ae-4972-8886-9e37a8433f0a",
                        "color": "red",
                        "label": "Failed",
                        "value": "FAILED",
                        "position": 5
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "19d24c43-dea7-449f-b3c6-30204d70a433",
                    "type": "UUID",
                    "name": "connectedAccountId",
                    "label": "Connected Account id (foreign key)",
                    "description": "Connected Account id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b6256f76-387e-4c9c-b42f-0221373cab97",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2738ee6a-bae1-4761-80a7-7ab9c72f23c1",
                    "type": "SELECT",
                    "name": "type",
                    "label": "Type",
                    "description": "Channel Type",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'email'",
                    "options": [
                      {
                        "id": "205a4e0b-e10a-4838-a4f8-e3d682fb07d5",
                        "color": "green",
                        "label": "Email",
                        "value": "email",
                        "position": 0
                      },
                      {
                        "id": "366316a5-f664-4f66-af40-b650055982a0",
                        "color": "blue",
                        "label": "SMS",
                        "value": "sms",
                        "position": 1
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c7cdab61-42f7-456a-af9d-eb4c9fb4ee91",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62027f4e-755d-4c9a-ab8d-af0c05e4b5f8",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "47d3bbfc-ae5d-4c28-a352-574e0124d281",
                    "type": "DATE_TIME",
                    "name": "syncStageStartedAt",
                    "label": "Sync stage started at",
                    "description": "Sync stage started at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fda04e4a-b765-4063-894d-b1bfabea7880",
                    "type": "SELECT",
                    "name": "contactAutoCreationPolicy",
                    "label": "Contact auto creation policy",
                    "description": "Automatically create People records when receiving or sending emails",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'SENT'",
                    "options": [
                      {
                        "id": "594dbbed-3a8c-466a-b4a8-a67221a75284",
                        "color": "green",
                        "label": "Sent and Received",
                        "value": "SENT_AND_RECEIVED",
                        "position": 0
                      },
                      {
                        "id": "04fdf389-3539-43b1-8da3-f47093c08b87",
                        "color": "blue",
                        "label": "Sent",
                        "value": "SENT",
                        "position": 1
                      },
                      {
                        "id": "2b7c125c-fad7-4962-adc5-a8ad7efe95d8",
                        "color": "red",
                        "label": "None",
                        "value": "NONE",
                        "position": 2
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "51e51f74-046f-4dbe-92a9-b63583a32984",
                    "type": "RELATION",
                    "name": "connectedAccount",
                    "label": "Connected Account",
                    "description": "Connected Account",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6ede8b89-8c0e-4e9d-b2e0-5f4ecd853b9f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2011c034-fdd0-4e19-8a52-ea3d91c4df37",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "51e51f74-046f-4dbe-92a9-b63583a32984",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "af711b7b-2e1a-4c52-a1ec-889a3030beae",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bd7eb5c9-5e3b-4d68-a6de-39f217e6cdc9",
                        "name": "messageChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08386596-cd30-48d9-b4c4-652720c36a14",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8a5e9c8c-06e5-473a-a081-79a656cbd92e",
                    "type": "BOOLEAN",
                    "name": "isSyncEnabled",
                    "label": "Is Sync Enabled",
                    "description": "Is Sync Enabled",
                    "icon": "IconRefresh",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": true,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "237ed7a8-7da2-4700-a15a-d54a56e4c90f",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "1f6c7afa-2199-46aa-82cb-ada5c8d44acc",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "viewSort",
            "namePlural": "viewSorts",
            "labelSingular": "View Sort",
            "labelPlural": "View Sorts",
            "description": "(System) View Sorts",
            "icon": "IconArrowsSort",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "ef09650c-0f91-496a-9821-6da3797a0e9f",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "523b1d6d-29c3-416e-a6c8-e7493a5f0b5a",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_a01889a3e5b30d56447736329aa",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": []
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjc="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "421199a1-67d8-4491-ad07-873e3ebef8c6",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ef09650c-0f91-496a-9821-6da3797a0e9f",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8c58d185-4b62-4d66-8711-3d60ef8f9120",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "77b35199-dbd1-4aab-9aab-466f679e4cc8",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View Sort related view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e137e42c-713e-4a45-aa9e-8448dc6e5af8",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f871207d-4fba-47ba-888a-1345c9fddb88",
                    "type": "TEXT",
                    "name": "direction",
                    "label": "Direction",
                    "description": "View Sort direction",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'asc'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59a89070-0f25-4641-ad53-19703ed88bac",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View Sort related view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07586930-a211-4f90-a1bb-38331303e795",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1f6c7afa-2199-46aa-82cb-ada5c8d44acc",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "59a89070-0f25-4641-ad53-19703ed88bac",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "43983f7a-df64-4bfc-bb96-0b4d9aa3aed6",
                        "name": "viewSorts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1a1e4ea5-8ee8-44da-8b19-36aa5391162b",
                    "type": "UUID",
                    "name": "fieldMetadataId",
                    "label": "Field Metadata Id",
                    "description": "View Sort target field",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "1dd5f673-a00c-4686-a746-b0d92c6363fb",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "calendarEventParticipant",
            "namePlural": "calendarEventParticipants",
            "labelSingular": "Calendar event participant",
            "labelPlural": "Calendar event participants",
            "description": "Calendar event participants",
            "icon": "IconCalendar",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "068f360c-0d10-4b9f-b69e-2e412b69873a",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "42539889-69b1-4fd3-a9e9-f5cf192b644d",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_2bf094726f6d91639302c1c143d",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9bf85f5e-11e0-4363-877f-11b7858c67e4",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "5e28e033-f972-442d-9af8-d58d46a774ea"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "08ac5e0d-19ec-45f8-ad50-fcbb5a2fd814",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_dd22aee9059fd7002165df6d8cc",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d764b9bc-a0e4-46c6-b157-b1fe225cbc62",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "9ca918e9-7d24-4813-b49d-f803c7aa6a31"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "213fae24-3fbf-4253-9343-e4b5caef38a1",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_0da422bbe7adbabb8144c696ebd",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9c98320c-de66-44fb-a510-e6763e93c836",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "9ca918e9-7d24-4813-b49d-f803c7aa6a31"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e715e318-0285-496b-a619-3d2d3fe9aa25",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "58296a68-c423-4ad8-98b4-624d3eeb64b5"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "58296a68-c423-4ad8-98b4-624d3eeb64b5",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "068f360c-0d10-4b9f-b69e-2e412b69873a",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "557aa783-fac3-4190-a668-6296a43c65e3",
                    "type": "BOOLEAN",
                    "name": "isOrganizer",
                    "label": "Is Organizer",
                    "description": "Is Organizer",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": false,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "510d4e67-863f-40bf-bf14-582f39203730",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5e28e033-f972-442d-9af8-d58d46a774ea",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Workspace Member id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "daa5ecb7-b085-46dd-9d60-8a1c7d426288",
                    "type": "TEXT",
                    "name": "displayName",
                    "label": "Display Name",
                    "description": "Display Name",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f04a1994-1fa0-4b81-b063-f88116da0ee2",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0eb22d69-f743-4700-9d7c-77672b0dd2ed",
                    "type": "UUID",
                    "name": "calendarEventId",
                    "label": "Event ID id (foreign key)",
                    "description": "Event ID id foreign key",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e36f35f7-0c8b-4d4b-a5d1-fbf0995e2575",
                    "type": "SELECT",
                    "name": "responseStatus",
                    "label": "Response Status",
                    "description": "Response Status",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'NEEDS_ACTION'",
                    "options": [
                      {
                        "id": "8b3fff27-a286-4386-a038-ec9127ea0cc4",
                        "color": "orange",
                        "label": "Needs Action",
                        "value": "NEEDS_ACTION",
                        "position": 0
                      },
                      {
                        "id": "017d60e0-a243-4be6-b99c-6530e82d068b",
                        "color": "red",
                        "label": "Declined",
                        "value": "DECLINED",
                        "position": 1
                      },
                      {
                        "id": "bb5f84d8-4e83-4b7d-b4ef-9ad069b37a50",
                        "color": "yellow",
                        "label": "Tentative",
                        "value": "TENTATIVE",
                        "position": 2
                      },
                      {
                        "id": "ba5f2f62-d9b8-4a29-bb63-6ba6da66cc56",
                        "color": "green",
                        "label": "Accepted",
                        "value": "ACCEPTED",
                        "position": 3
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ecd417ae-edf2-4802-87d3-95b74e5a94ac",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Workspace Member",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1aa34ced-34ce-4330-a5bb-dc1ff5a321fc",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1dd5f673-a00c-4686-a746-b0d92c6363fb",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ecd417ae-edf2-4802-87d3-95b74e5a94ac",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a6a8c2a3-cc39-4e0d-9469-5605bf0279fa",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2a0d2586-45ea-45eb-9d1e-7799be1ecafd",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "49a87187-de28-486b-a041-645895f9f7d3",
                    "type": "RELATION",
                    "name": "calendarEvent",
                    "label": "Event ID",
                    "description": "Event ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0c9e22cf-77c1-4418-b338-0e79a76492db",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1dd5f673-a00c-4686-a746-b0d92c6363fb",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "49a87187-de28-486b-a041-645895f9f7d3",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e9a943b9-590c-468f-9f22-fc8eda8f3110",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "217f48b9-db54-4584-a68b-6201cf7d6f91",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44880d7a-dd04-4c2e-819d-617983bd8dc1",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0c2200ef-cf19-456a-b3f7-f796eb8deaed",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "157714be-d73f-44b6-9048-7e06cb1a0af4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1dd5f673-a00c-4686-a746-b0d92c6363fb",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0c2200ef-cf19-456a-b3f7-f796eb8deaed",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6fea0c2c-0458-4c4e-91af-5996bfb6b59d",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9ca918e9-7d24-4813-b49d-f803c7aa6a31",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "19b909fe-1114-4204-948e-83c379e32825",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "messageThread",
            "namePlural": "messageThreads",
            "labelSingular": "Message Thread",
            "labelPlural": "Message Threads",
            "description": "Message Thread",
            "icon": "IconMessage",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "01295250-f525-44fd-83c4-bae1dc76f7f0",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "01295250-f525-44fd-83c4-bae1dc76f7f0",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f81d174d-e533-4ef8-81a1-92a024bcd24c",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "97c6b122-19e2-4e03-903b-9356b843143f",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3d06329b-54d3-4ec0-8f04-deac39f7de2d",
                    "type": "RELATION",
                    "name": "messages",
                    "label": "Messages",
                    "description": "Messages from the thread.",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "15a52974-a4c1-47b6-abda-ecb68598ec14",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19b909fe-1114-4204-948e-83c379e32825",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3d06329b-54d3-4ec0-8f04-deac39f7de2d",
                        "name": "messages"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "33e51e27-22b8-42be-a904-7c4646d26191",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ad43950c-c9ea-4670-bebb-a98c4c1fb73a",
                        "name": "messageThread"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cd27356f-4390-4b66-9d12-098b2b351cc5",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "person",
            "namePlural": "people",
            "labelSingular": "Person",
            "labelPlural": "People",
            "description": "A person",
            "icon": "IconUser",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "c0e32dc9-f8de-44dd-8b93-079b0a811d13",
            "imageIdentifierFieldMetadataId": "ba942bbf-ecdc-4045-af71-f54172c01d4b",
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f8ae7edd-b003-43cd-bf0a-f266fd9a84d2",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_6a862a788ac6ce967afa06df812",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "c68175b9-aa8a-422c-97fa-b064b082054b",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "8a541862-5f02-49cd-9e12-16df3bf1777e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "aeeec09c-72f1-4a4c-b06f-2b29d3986393",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "de5970e9-ba53-4faf-ba2b-57233dff1968"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f666de80-9964-459c-9cf4-0be0cd171acf",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_UNIQUE_87914cd3ce963115f8cb943e2ac",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": true,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8a07db77-1090-4669-94af-5774e7592c6b",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "83adfbf6-9007-43ce-97f7-dc42c9d4d740"
                          }
                        }
                      ]
                    }
                  }
                },
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "bbded47d-e22c-49f9-8c16-462fd09035b6",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_bbd7aec1976fc684a0a5e4816c9",
                    "indexWhereClause": null,
                    "indexType": "GIN",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "004dcf26-5804-47d3-9b2e-07ba03a74c1f",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "c48f1f00-1298-43ea-8dc9-ff917796a564"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI5"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c48f1f00-1298-43ea-8dc9-ff917796a564",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ca4c3dc1-7365-40ab-a40b-86338461f655",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Person record Position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9bf5b981-1617-4129-bf48-a4790efe315c",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments linked to the contact.",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b1e512da-3b6b-4579-a151-3f52fa688fe9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9bf5b981-1617-4129-bf48-a4790efe315c",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e18e8353-d96c-4824-b076-5f9b815a1578",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "83b47cc7-ba0b-4e2e-8699-407b7372bcc0",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8a541862-5f02-49cd-9e12-16df3bf1777e",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Contact’s company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "56f21460-83a8-4dce-8dd8-c6c24bcf7589",
                    "type": "LINKS",
                    "name": "xLink",
                    "label": "X",
                    "description": "Contact’s X/Twitter account",
                    "icon": "IconBrandX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "064f9c71-25e7-4e52-8535-a48b3001ef35",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the contact",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6f584cfa-9971-4a99-b695-0af05986a7d2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "064f9c71-25e7-4e52-8535-a48b3001ef35",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8cafcbf3-9251-4609-8e25-5fb3142aaf2e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b8098117-5006-43ed-9f8c-02ab39d89857",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "83adfbf6-9007-43ce-97f7-dc42c9d4d740",
                    "type": "EMAILS",
                    "name": "emails",
                    "label": "Emails",
                    "description": "Contact’s Emails",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": true,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "primaryEmail": "''",
                      "additionalEmails": null
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2d93774d-d40d-4277-9f40-2c6801fd7ca4",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the contact",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d9dccf95-3899-4289-aa59-8efe8913ada5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2d93774d-d40d-4277-9f40-2c6801fd7ca4",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "52d5051d-6e03-4096-b35e-aeb2a16a8f56",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "20283378-a926-47d6-a13f-8efc8078faa0",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a4ae5e41-2e5b-412d-98aa-0a9ac231abf0",
                    "type": "RATING",
                    "name": "performanceRating",
                    "label": "Performance Rating",
                    "description": "Person's Performance Rating",
                    "icon": "IconStars",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.713Z",
                    "updatedAt": "2024-10-24T15:29:29.713Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "342b3c81-05e9-419d-b734-ec259b33e107",
                        "label": "1",
                        "value": "RATING_1",
                        "position": 0
                      },
                      {
                        "id": "3193a7d9-5538-44db-b73b-bc58c63b7533",
                        "label": "2",
                        "value": "RATING_2",
                        "position": 1
                      },
                      {
                        "id": "e7a73fec-dd78-48c6-a6b3-6c87cb12835e",
                        "label": "3",
                        "value": "RATING_3",
                        "position": 2
                      },
                      {
                        "id": "6b6e6ef5-9f05-4dac-b9ae-a19844ca8ae6",
                        "label": "4",
                        "value": "RATING_4",
                        "position": 3
                      },
                      {
                        "id": "c6135f40-7bd0-4295-9108-b5f52112b3f6",
                        "label": "5",
                        "value": "RATING_5",
                        "position": 4
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "407615e5-59cd-480e-831d-bc1edbbcb47f",
                    "type": "PHONES",
                    "name": "whatsapp",
                    "label": "Whatsapp",
                    "description": "Contact's Whatsapp Number",
                    "icon": "IconBrandWhatsapp",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.544Z",
                    "updatedAt": "2024-10-24T15:29:29.544Z",
                    "defaultValue": [
                      {
                        "additionalPhones": {},
                        "primaryPhoneNumber": "",
                        "primaryPhoneCountryCode": ""
                      }
                    ],
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7229c283-cef7-410b-854e-b91d472c1797",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5a937c4d-f9d8-4169-b88c-f7b9e605c28a",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "569d8418-9dc2-4109-82cb-f259e30d2d96",
                    "type": "MULTI_SELECT",
                    "name": "workPreference",
                    "label": "Work Preference",
                    "description": "Person's Work Preference",
                    "icon": "IconHome",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.630Z",
                    "updatedAt": "2024-10-24T15:29:29.630Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "5eb374e9-d7dd-4302-a647-cc531bdb013e",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "d261aafb-c2d2-4e83-b733-16ebe794ad6e",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "8711124b-acb4-4054-b6b8-2fcb31d1c66a",
                        "color": "sky",
                        "label": "Remote Work",
                        "value": "REMOTE_WORK",
                        "position": 2
                      }
                    ],
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a0847e94-3ee7-4207-8295-82d53ceeb05a",
                    "type": "RELATION",
                    "name": "messageParticipants",
                    "label": "Message Participants",
                    "description": "Message Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "aa6feaca-912a-4b41-a1e5-b9e05a01a609",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a0847e94-3ee7-4207-8295-82d53ceeb05a",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6c3dfa43-d32f-4707-a73b-e2c1d94b2f3b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1f8a6261-ab0d-4a00-b57f-33636a3460ad",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "852ab922-1c92-4844-a7d4-4c1addeeac51",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "55ccdd8d-5af4-448b-a44b-cc7ee4f99c54",
                    "type": "LINKS",
                    "name": "linkedinLink",
                    "label": "Linkedin",
                    "description": "Contact’s Linkedin account",
                    "icon": "IconBrandLinkedin",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "27106aaa-6728-449d-81d9-6e2355e64b4f",
                    "type": "RELATION",
                    "name": "pointOfContactForOpportunities",
                    "label": "Linked Opportunities",
                    "description": "List of opportunities for which that person is the point of contact",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ed0294ed-cbfd-4937-8a74-ff92c97db956",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "27106aaa-6728-449d-81d9-6e2355e64b4f",
                        "name": "pointOfContactForOpportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "453de1b3-d6ed-4a4b-9eb9-2a14d4ec32f2",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "553a7200-f711-47d5-b158-acfeaaf48211",
                        "name": "pointOfContact"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6fea0c2c-0458-4c4e-91af-5996bfb6b59d",
                    "type": "RELATION",
                    "name": "calendarEventParticipants",
                    "label": "Calendar Event Participants",
                    "description": "Calendar Event Participants",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "157714be-d73f-44b6-9048-7e06cb1a0af4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6fea0c2c-0458-4c4e-91af-5996bfb6b59d",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1dd5f673-a00c-4686-a746-b0d92c6363fb",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0c2200ef-cf19-456a-b3f7-f796eb8deaed",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b79b91a1-7b93-45c4-b30f-ed599c711f53",
                    "type": "PHONES",
                    "name": "phones",
                    "label": "Phones",
                    "description": "Contact’s phone numbers",
                    "icon": "IconPhone",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "additionalPhones": null,
                      "primaryPhoneNumber": "''",
                      "primaryPhoneCountryCode": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c0e32dc9-f8de-44dd-8b93-079b0a811d13",
                    "type": "FULL_NAME",
                    "name": "name",
                    "label": "Name",
                    "description": "Contact’s name",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "lastName": "''",
                      "firstName": "''"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fb083ea3-e6bb-4247-9dc2-7369e7e63c26",
                    "type": "TEXT",
                    "name": "intro",
                    "label": "Intro",
                    "description": "Contact's Intro",
                    "icon": "IconNote",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:29.463Z",
                    "updatedAt": "2024-10-24T15:29:29.463Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8675e638-59fe-425c-8e40-15358a4aa385",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Events",
                    "description": "Events linked to the person",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "491d9d4e-12c9-4722-a4ec-b07f03dc8745",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8675e638-59fe-425c-8e40-15358a4aa385",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "22173ccf-2427-45a0-9524-a55d43c1aa20",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "29124d90-1170-4283-9c87-717f19d72be6",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ba942bbf-ecdc-4045-af71-f54172c01d4b",
                    "type": "TEXT",
                    "name": "avatarUrl",
                    "label": "Avatar",
                    "description": "Contact’s avatar",
                    "icon": "IconFileUpload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9fd096b1-59ac-4afe-b497-3dad068c625e",
                    "type": "TEXT",
                    "name": "jobTitle",
                    "label": "Job Title",
                    "description": "Contact’s job title",
                    "icon": "IconBriefcase",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dddcbeca-4d3f-48fa-8e82-fcc3e8d83c57",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Contact’s company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "57751750-603d-4998-a344-d2a5f0d33b65",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "dddcbeca-4d3f-48fa-8e82-fcc3e8d83c57",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f807867-5361-49b7-805a-222f42d32940",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "359e70fd-a85b-47b6-8b96-8e28db7a09d3",
                        "name": "people"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "845a8579-b001-4435-8fcb-0873cefb5db1",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e69a9044-3146-4c59-91d4-04b6704b3d74",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the contact",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "35f7ff45-dc8c-4581-b796-f0d052b4ca38",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e69a9044-3146-4c59-91d4-04b6704b3d74",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "36ef9a47-1c75-4394-bd6b-aa4baf83a62d",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "90f13bee-ea83-4dcd-ba9f-72a1b89cb55c",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a6ffa28a-560b-492c-9c7f-04a93da8e0bb",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the contact",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4a177d72-2948-4d14-90fb-69f0c4ff9d2f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "19237d53-1b79-4177-a0c3-8aa15805d979",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a6ffa28a-560b-492c-9c7f-04a93da8e0bb",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4606e434-8a8d-446e-acdc-bbf02b1fbee8",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ec745eca-40a8-4b77-b2c0-c65e3d895bd9",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a06f2572-6284-4595-8fa1-554b96b7a6da",
                    "type": "TEXT",
                    "name": "city",
                    "label": "City",
                    "description": "Contact’s city",
                    "icon": "IconMap",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de5970e9-ba53-4faf-ba2b-57233dff1968",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "0d7d5c9f-cccc-4761-a80a-7e96726c43b1",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "viewFilter",
            "namePlural": "viewFilters",
            "labelSingular": "View Filter",
            "labelPlural": "View Filters",
            "description": "(System) View Filters",
            "icon": "IconFilterBolt",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "80566666-e4cf-41c7-a895-cdb83d3cae17",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "57ec870a-479e-4c35-bb80-34a0ad8b60bd",
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "name": "IDX_5653b106ee9a9e3d5c1c790419a",
                    "indexWhereClause": null,
                    "indexType": "BTREE",
                    "isUnique": false,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "26938a0d-410c-493f-9c97-c8158b58ea6f",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 1,
                            "fieldMetadataId": "61c26402-5e57-4f9f-92ee-da7395a9bfb6"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "789ca464-84c1-4370-8f9e-a2f5f639918b",
                            "createdAt": "2024-10-24T15:29:25.797Z",
                            "updatedAt": "2024-10-24T15:29:25.797Z",
                            "order": 0,
                            "fieldMetadataId": "aca71b52-de9f-428d-b61d-7b41f2fd592d"
                          }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "80566666-e4cf-41c7-a895-cdb83d3cae17",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e328c903-cc7e-4e77-b4d3-caf5fc6949bd",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9e8dac52-ce36-4cc8-9b7b-cee3e679fa36",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View Filter related view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "95c113b7-6efb-47fc-bdad-822cb1b2fdf1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0d7d5c9f-cccc-4761-a80a-7e96726c43b1",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9e8dac52-ce36-4cc8-9b7b-cee3e679fa36",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5e283b2f-7b60-4a53-a77b-58ed05e8c8f0",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f63ff86a-44a3-4d38-bf02-971eb52ce291",
                        "name": "viewFilters"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aca71b52-de9f-428d-b61d-7b41f2fd592d",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View Filter related view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1dc62e05-27e8-4e30-9b80-8b55c812a044",
                    "type": "TEXT",
                    "name": "value",
                    "label": "Value",
                    "description": "View Filter value",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "61c26402-5e57-4f9f-92ee-da7395a9bfb6",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fa5c1c6a-02bc-425c-9a8f-c6b256b1d68c",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "31d2f65e-9bcb-40dc-b704-58ec3bf3e233",
                    "type": "TEXT",
                    "name": "displayValue",
                    "label": "Display Value",
                    "description": "View Filter Display Value",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8150b5db-46c0-4608-a7bc-eea012ac7150",
                    "type": "UUID",
                    "name": "viewFilterGroupId",
                    "label": "View Filter Group Id",
                    "description": "View Filter Group",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db340124-44c7-42dd-865b-1a8c18a4198b",
                    "type": "UUID",
                    "name": "fieldMetadataId",
                    "label": "Field Metadata Id",
                    "description": "View Filter target field",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d85d8a92-0865-42a6-ba93-854006fa79ad",
                    "type": "POSITION",
                    "name": "positionInViewFilterGroup",
                    "label": "Position in view filter group",
                    "description": "Position in the view filter group",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ce1b88dd-13fc-4c45-985d-d4a33bc3e08d",
                    "type": "TEXT",
                    "name": "operand",
                    "label": "Operand",
                    "description": "View Filter operand",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "'Contains'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "017aaa3f-0830-4983-ac8e-5ccc951f3066",
            "dataSourceId": "40fa1662-25d3-4ff7-a5e6-4c7bb69fd661",
            "nameSingular": "apiKey",
            "namePlural": "apiKeys",
            "labelSingular": "API Key",
            "labelPlural": "API Keys",
            "description": "An API key",
            "icon": "IconRobot",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-24T15:29:25.797Z",
            "updatedAt": "2024-10-24T15:29:25.797Z",
            "labelIdentifierFieldMetadataId": "6ee1cc85-a8a0-430c-84ec-f489a66fa232",
            "imageIdentifierFieldMetadataId": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": []
            },
            "fields": {
              "__typename": "ObjectFieldsConnection",
              "pageInfo": {
                "__typename": "PageInfo",
                "hasNextPage": false,
                "hasPreviousPage": false,
                "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
                "endCursor": "YXJyYXljb25uZWN0aW9uOjY="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "68f30fa5-0288-4910-ac3d-0ee0b89e44b6",
                    "type": "DATE_TIME",
                    "name": "revokedAt",
                    "label": "Revocation date",
                    "description": "ApiKey revocation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6ee1cc85-a8a0-430c-84ec-f489a66fa232",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "ApiKey name",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37a31cb8-9386-4f4c-a4fd-2de29e02dcd0",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "564aed3a-c760-4a26-9283-56289cfea82f",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7d154bcb-2d33-4a5c-8ff4-97aa60946815",
                    "type": "DATE_TIME",
                    "name": "expiresAt",
                    "label": "Expiration date",
                    "description": "ApiKey expiration date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c1924e66-3b25-4560-ae45-cc980f6b339e",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "uuid",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a915082e-c13c-44e6-82f2-0bb8ff610467",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-24T15:29:25.797Z",
                    "updatedAt": "2024-10-24T15:29:25.797Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                }
              ]
            }
          }
        }
      ]
    }
  } as ObjectMetadataItemsQuery;

