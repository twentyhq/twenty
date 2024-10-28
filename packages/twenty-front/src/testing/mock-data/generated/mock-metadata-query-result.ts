import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
// ⚠️ WARNING ⚠️: Be sure to activate the workflow feature flag (IsWorkflowEnabled) before updating that mock.

export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery = {
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
            "id": "fc93fc8e-1373-46fc-9117-ded99af0f5fc",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "776202e9-2d30-452f-b7ab-f5a2027dfea7",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7d1b3ccd-a89f-421e-bb31-6134691d8b16",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "75836ace-93b9-4b8d-a636-b93c6b0d7f40",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "8f0d7cbf-ef88-4597-98ff-e6620d894b98"
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
                    "id": "7c0edf6e-7353-48e0-9ef0-8e61853a6ba6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5e47bbf3-9925-45e0-9e69-fde485e69b86",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "15414068-e3e9-4a12-a444-384b450c6fab",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a7bdc6df-96ff-4479-b4f5-907722d7deff",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'NOT'",
                    "options": [
                      {
                        "id": "7a9153f2-afe1-4eaf-bfe0-30d4c83dd89e",
                        "color": "blue",
                        "label": "AND",
                        "value": "AND",
                        "position": 0
                      },
                      {
                        "id": "12616af2-7935-4766-b56a-98e9949088fe",
                        "color": "green",
                        "label": "OR",
                        "value": "OR",
                        "position": 1
                      },
                      {
                        "id": "eab57925-62d3-4714-a9c6-c030122a9d8b",
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
                    "id": "776202e9-2d30-452f-b7ab-f5a2027dfea7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "69fe9804-39e6-4ce3-bb3f-47f63d1534f8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8f0d7cbf-ef88-4597-98ff-e6620d894b98",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "de8572fa-1be8-4bd7-b0c9-eb7e3f56bcba",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e0d1825a-1004-48c3-b97c-eb36ac1798cd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "21842052-73e8-4550-9f1b-6bd297e0bd7f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fc93fc8e-1373-46fc-9117-ded99af0f5fc",
                        "nameSingular": "viewFilterGroup",
                        "namePlural": "viewFilterGroups"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e0d1825a-1004-48c3-b97c-eb36ac1798cd",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5a36e136-d881-44a0-bfeb-a281bda5053b",
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
            "id": "fbfc7dc8-ea47-41a4-bdc4-e47658a119d8",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "e08f4228-fa10-4464-a6e2-21dc1d91e199",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "cfae839e-4e68-4895-8319-51086ca0c020",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "c4b83f28-2ba8-4d3a-8ba9-9bad93736285",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "84cfc195-933b-40ca-8d84-7b2bb4810e86"
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
                    "id": "21bf8246-b8ae-4234-a47a-60d4657f6b40",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "16c93d05-a429-46b5-9d30-12d0e73f48dd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fe02c19c-3285-4974-b8b6-63b94d343f2e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fbfc7dc8-ea47-41a4-bdc4-e47658a119d8",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "16c93d05-a429-46b5-9d30-12d0e73f48dd",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c91b43a9-6db6-49d6-98e1-39831097967d",
                        "name": "blocklist"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "84cfc195-933b-40ca-8d84-7b2bb4810e86",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "173c72e3-339f-4643-88a4-3c4b65b822ca",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d31d3e6c-2132-4c91-893a-003eb9d379a3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e08f4228-fa10-4464-a6e2-21dc1d91e199",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ead48d3e-4cba-4107-97ad-337647206be0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "eaa4134f-850e-451d-88b6-ea20cfacbf79",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "T",
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5da83184-99e8-4c1e-b1e0-eaeee82bd546",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "bc57404b-853d-471e-a286-3b026c0ea662",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "daf4ea5f-0f48-491a-a1dc-9855994bf1a6"
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
                    "id": "be58c5c5-2cad-4b4d-8aef-f26a27e0b0c3",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_d01a000cf26e1225d894dc3d364",
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
                            "id": "b6576107-8a8e-4993-a362-5c439eb8dbeb",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "dd4769b6-e31e-4d03-821c-5a40f68714a4"
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
                    "id": "a3ff5227-0a58-4fc2-8c4b-1bcfa811cf08",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ff682e38-6b4c-4ef3-8b18-2330e8554a03",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a3ff5227-0a58-4fc2-8c4b-1bcfa811cf08",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b9500e3c-cdde-4f6b-aba9-018d1910f00a",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c55a48b9-a8dc-46ed-bc29-c43b96b323c6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "75564271-7975-4d11-b8e6-4f21ce680dab",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c55a48b9-a8dc-46ed-bc29-c43b96b323c6",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "aee23b44-ffd2-4959-9e5b-5c6fce70f8f9",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "054b05d6-0ca2-45f6-b1a3-f28c26b313d7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0b00ba40-500c-4260-ac06-8bccb2bbb54c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d40c6458-4553-4991-9247-1b1aed03234e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0b00ba40-500c-4260-ac06-8bccb2bbb54c",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e21060bf-f6ff-4ec0-b77a-39b2e1d8a7a0",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "daf4ea5f-0f48-491a-a1dc-9855994bf1a6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0ac57bad-aeaa-480f-af46-28c830e8edcf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c6043e2a-ae3d-41dc-adf6-b136b5c8a63a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7862131a-436a-4a0e-86dd-747c56ce5143",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2043977f-a98e-4726-9ccd-921309ef26d3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2ea6b954-6088-4cfc-9986-bb35f72973cb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2043977f-a98e-4726-9ccd-921309ef26d3",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4d22ea94-3f2f-405c-8140-1c8941fc9d4d",
                        "name": "assignedTasks"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7bb5965f-549b-4c07-a0b5-5cb4fc26e060",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d12c79bc-0c65-4c9a-bdc3-db1cb5c34218",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "da980aa5-9ea1-4af3-a05c-d87babe24bf6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "dd4769b6-e31e-4d03-821c-5a40f68714a4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "eaa4134f-850e-451d-88b6-ea20cfacbf79",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f1f25e51-a735-4efb-b5ad-31c7fa18c21a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'TODO'",
                    "options": [
                      {
                        "id": "73234d5b-21da-46c2-94f8-1d9745914189",
                        "color": "sky",
                        "label": "To do",
                        "value": "TODO",
                        "position": 0
                      },
                      {
                        "id": "633ced11-a65b-4e16-8f93-56f37c8b7f6a",
                        "color": "purple",
                        "label": "In progress",
                        "value": "IN_PROGESS",
                        "position": 1
                      },
                      {
                        "id": "b564b414-f257-46dc-91e8-141c76a360d0",
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
                    "id": "06d9a650-8b92-4be3-9b71-dfa72c7390dc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7dccef4e-3972-40f8-bfdc-457ec470a3c7",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "06d9a650-8b92-4be3-9b71-dfa72c7390dc",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "75333ac2-70ef-4146-982f-c65d2fbd453c",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd9a2a81-ca93-401a-963c-3ab3999c78a4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "5085f0ea-31c0-44d5-bb38-d7df039f59a6",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "b57534a8-68cc-483e-a22a-6a8ff674f81e",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "310ff27b-9613-4088-8b4e-0d6e78cbc534",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "27c6e7ab-5489-471c-94f9-3fcc2686547e"
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
                    "id": "b061e4df-d1a5-407e-85b0-c8b6742cc6d1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "62c63ff0-c116-4afb-8163-d0fa733cbe79",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1a0effa2-aba6-4ebb-a794-fd2681e95de8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0bc907ac-e3da-4764-923d-8c636dccec80",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9c8ac5b8-1c0c-48a3-bc40-11e340ab07cb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0bc907ac-e3da-4764-923d-8c636dccec80",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ecb63ce6-0bc5-4f42-8736-1197004bdab2",
                        "name": "versions"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1a6a2bb8-0c69-48e1-a79d-afb87037c2bd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3cb4147c-abc4-4044-8c89-6c6f2069f61f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d0f1abf3-7cc5-404b-bdf7-eb7e72c17c83",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "10051087-72cf-4778-97db-6d25c1200bc4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d0f1abf3-7cc5-404b-bdf7-eb7e72c17c83",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b9fa70a9-38e9-4444-a341-6b755c5910ae",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "13796f4d-7b8d-4cdc-9b32-fa310f604696",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b15e5813-0e60-4a34-ba3a-0db6eb69e6e7",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "13796f4d-7b8d-4cdc-9b32-fa310f604696",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9198046b-a09c-44c5-9838-dbe2947814d7",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ee897771-6fa3-4b58-a143-215cc9073876",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "312a9542-8737-4f92-851c-c4fcc9ba5ddf",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ee897771-6fa3-4b58-a143-215cc9073876",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f3f5fa9f-c49f-49a9-8ad7-008c59659826",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02a567ed-7188-43a1-98f8-5b9c64092bdb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "88aa6cc9-d89e-427a-9988-fb0416ec70e3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2a84fc2f-d395-4aec-9b41-81e1f92bc2ec",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'DRAFT'",
                    "options": [
                      {
                        "id": "ca7b4cb7-6b61-4c71-925f-6fff19f9fccc",
                        "color": "yellow",
                        "label": "Draft",
                        "value": "DRAFT",
                        "position": 0
                      },
                      {
                        "id": "9187d782-39ed-40c6-b813-00006236b2b9",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 1
                      },
                      {
                        "id": "0f8714e4-efcd-45c7-8f92-41e6643b15bc",
                        "color": "red",
                        "label": "Deactivated",
                        "value": "DEACTIVATED",
                        "position": 2
                      },
                      {
                        "id": "ff1efabc-7ef6-4de1-80c3-c1abfcde1511",
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
                    "id": "27c6e7ab-5489-471c-94f9-3fcc2686547e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5085f0ea-31c0-44d5-bb38-d7df039f59a6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "ee4721ca-97c9-46ab-91ff-e4d6c03aa95b",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "d52c7759-6e93-4418-afbc-ef284be39dbc",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "11e8b7a3-f330-44d9-9950-7e445acc6d27",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "a0f250cb-85de-43dd-8733-34c372239f04",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "fd247084-a7b1-4125-85e5-f876d33ea345"
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
                    "id": "91e3241a-3830-4198-9bb9-6dd83d86c8dc",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "8cbeee62-c775-4842-9666-3c13161436ae",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "9beb3572-df92-4c32-83d2-0ffd242b6b50"
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
                    "id": "d52c7759-6e93-4418-afbc-ef284be39dbc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d69b34f6-4f49-4143-aed8-d4c496ae5a52",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f55623b1-bbdd-43ca-a2d1-74766a47d226",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a8e13550-cd8c-464f-b868-ac54c48186ac",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ee4721ca-97c9-46ab-91ff-e4d6c03aa95b",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f55623b1-bbdd-43ca-a2d1-74766a47d226",
                        "name": "calendarChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b0678eb5-f8e9-42c3-b7b8-963d8724ec1e",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ac74b9ba-c03c-4b1b-8638-4a7f224ddd3c",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fde5e6b2-34e7-4d9d-af50-439789248085",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9beb3572-df92-4c32-83d2-0ffd242b6b50",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ad726f07-0922-42cc-b60b-ef52cc983239",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3cd9c300-6947-44e1-a3e1-c2a9bd0c2557",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fd247084-a7b1-4125-85e5-f876d33ea345",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6ff4c2b5-2aa9-4a1f-be0b-cbff99aef4b8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9dc14dcc-406a-4a07-8a8d-864959aa827f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ee4721ca-97c9-46ab-91ff-e4d6c03aa95b",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6ff4c2b5-2aa9-4a1f-be0b-cbff99aef4b8",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e611e519-8de3-4fd8-b030-9193aeeb5f3b",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "170cb74a-42a7-4bbf-ba7b-f4137b4a2104",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b95968c4-33e1-4f84-9967-7164bdbbca2a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "7de6e3fc-edc8-4026-b269-7dd057498709",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "92ec7939-18d1-4f10-a6d2-8b4e60a0c484",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "5ee79b4f-d176-491e-81f3-508b465eef96",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "f4ed772f-6d1b-4f41-ba78-6396d6bb75fa"
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
                    "id": "f6af1c88-76aa-4f3b-8f3c-616700cec1ca",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "8407563b-2785-49a6-be90-f5b52c89056a",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "f4ed772f-6d1b-4f41-ba78-6396d6bb75fa"
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
                    "id": "d0493a46-b3b9-45fc-94a5-b14b5b507cd8",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "58e045a2-3eec-44c0-a1cb-0de604e6b367",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "f4ed772f-6d1b-4f41-ba78-6396d6bb75fa"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "29ae8a25-01bd-4d26-92dc-98fb63818328",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "d164eb77-4284-4d71-872c-b110bbee22aa"
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
                    "id": "a26518f6-aa1f-47bf-9ae7-c21af5192c0a",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_cf12e6c92058f11b59852ffdfe3",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7de6e3fc-edc8-4026-b269-7dd057498709",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e6cdf7e3-4d36-4279-8cf0-f779be9ac35e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "123ef09a-c54d-4497-b611-7948c40c6965",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e6cdf7e3-4d36-4279-8cf0-f779be9ac35e",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4e480667-f91d-418e-a562-defb5a1231d1",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "22c4e9ee-63a1-4b33-a4d5-d6540590a51f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "81869026-ca67-406e-b120-1a6c9ff7e7bd",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "22c4e9ee-63a1-4b33-a4d5-d6540590a51f",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0ae3438e-4f87-4dec-a83a-0b61b8b4b8fb",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7da436ce-7dad-4db5-b709-251a587c4988",
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
                    "createdAt": "2024-10-28T09:49:21.503Z",
                    "updatedAt": "2024-10-28T09:49:21.503Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f2dcc87a-92cd-4323-a351-bf0973dd947a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7da436ce-7dad-4db5-b709-251a587c4988",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4c54e798-e4c5-4335-9885-a38647ae7006",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd644bf0-72c9-4847-8425-936a2df90149",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d164eb77-4284-4d71-872c-b110bbee22aa",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "11f09a46-c2b6-4ea7-9373-9806713ebe04",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "95f77004-97da-485f-89d7-e9b74875d196",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "11f09a46-c2b6-4ea7-9373-9806713ebe04",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a689297a-db39-402c-9ca9-5cb8e7286137",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f4ed772f-6d1b-4f41-ba78-6396d6bb75fa",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "aee23b44-ffd2-4959-9e5b-5c6fce70f8f9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "75564271-7975-4d11-b8e6-4f21ce680dab",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "aee23b44-ffd2-4959-9e5b-5c6fce70f8f9",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c55a48b9-a8dc-46ed-bc29-c43b96b323c6",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aeb926f8-ae90-458b-b6c1-7aad610793f9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a9939e74-194a-4198-a177-a2d5b60dd0d6",
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
                    "createdAt": "2024-10-28T09:49:21.503Z",
                    "updatedAt": "2024-10-28T09:49:21.503Z",
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
                    "id": "63ff15e9-0d12-4d35-ab44-4dc762ca09a8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "461b12d8-1e19-4dff-a0f6-ec170458b918",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "140f8972-ff94-4bd8-9719-7aa95b15f2d0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "e611e519-8de3-4fd8-b030-9193aeeb5f3b",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "3a7ef1bb-a11c-4450-add3-4e93a09c54cd",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
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
                    "id": "f1901232-c68b-4c2d-99df-e55698de4fbe",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5ddaabe2-6725-49bd-b481-4085c10ba1d1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d84a0e51-0778-4f89-afee-fcac3c360e4d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f7a8f071-6ffc-4b8f-b59a-f04d8b4d5bec",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8be68a09-8a57-4890-995e-adc71252fd59",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3a7ef1bb-a11c-4450-add3-4e93a09c54cd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3a7f2e8c-49e9-493e-9f38-45d21a36e6dc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "884567c5-6f3c-402f-ae6f-359dd3d473bb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "067b2c09-88a0-4110-81e9-d283ace096f7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "170cb74a-42a7-4bbf-ba7b-f4137b4a2104",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9dc14dcc-406a-4a07-8a8d-864959aa827f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e611e519-8de3-4fd8-b030-9193aeeb5f3b",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "170cb74a-42a7-4bbf-ba7b-f4137b4a2104",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ee4721ca-97c9-46ab-91ff-e4d6c03aa95b",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6ff4c2b5-2aa9-4a1f-be0b-cbff99aef4b8",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5fc49026-3dff-4521-8bed-db55f358f54c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8b443db7-5aa0-4a31-b9c0-0b98823a499b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0188ee08-21c3-4103-82d0-404f3ee47850",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b19f483d-3e03-40f5-96bb-7ec2f4c4fb74",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7d252fa5-bbe4-4ae5-a86b-7f24ac2c8f27",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e611e519-8de3-4fd8-b030-9193aeeb5f3b",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b19f483d-3e03-40f5-96bb-7ec2f4c4fb74",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e2ef8f32-a884-41c7-83f9-ab8c95f16333",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "650266d1-dcf3-472d-8769-dab6d613fc51",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5b8caa89-6c65-46a9-9c34-d94117a4a1f7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2a037646-cad6-484b-a2ee-a2131dc9456b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e72c2727-ae9d-4b10-8df6-0d94ba8eb308",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a225adcc-41e1-4078-885a-22f3f0761a72",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "e4267d6a-3bac-4051-b7e8-e64735e1a37d",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "0bdbe21f-7269-47c5-ad94-3ed0b6fb9b7c",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
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
                    "id": "1a99f1b7-e36d-465d-bbb7-530d7af81050",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5abf2c2b-0e07-476f-b323-5db004554fc6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c7ea861b-b104-42f1-823e-01b9e2f97bc9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d6bff80d-def0-4b07-8472-bcec49e17811",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0bdbe21f-7269-47c5-ad94-3ed0b6fb9b7c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6c6d5266-032f-4163-ba52-12ae29ef3685",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0b439e18-1add-4e63-94ae-223df5bb1142",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "a95cac70-3509-43b1-ade0-6c169621bb67",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9ffe303e-a558-456b-9050-83deea8c63fb",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "6b080091-5cc0-4626-9a2b-5ad447368784",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "d5aacf48-f1dd-4bf6-ac22-cde1fcf27e81"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d8bf5410-290c-4c8d-be63-243b7cc8ad7a",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23"
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
                    "id": "f9be563f-5c7f-42ae-93af-220754306fe9",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "c96bdabd-fdd1-471c-acaf-7a19e909c07b",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23"
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
                    "id": "3e4dcd62-6332-4e72-8def-e687aa1047b7",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "304b8046-37f3-42e6-8551-09390f3263e5",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "0795b330-7483-497f-8a53-07a8ca6d6899"
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
                    "id": "e3fd38bd-ea45-4813-928a-56490600ac00",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_505a1fccd2804f2472bd92e8720",
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
                            "id": "aa1247a1-3d16-492a-a4f1-24897f2b8d5b",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "ed975436-4817-4f96-864b-1f86938aeda4"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f8ac5cd0-3508-49f1-8838-60c4915e682e",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23"
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
                    "id": "1ea0c3a3-1306-4fcc-b01b-d6bc3197c0ce",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_c3ee83d51bc99ba99fe1998c508",
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
                            "id": "c36e89ff-7ccc-48b4-a7f5-17dfeea51ab1",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "86396fd1-30d3-4e7e-a721-2de10b9e28d3",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "a9548d35-0fc1-461d-aec6-a802fdb28f38"
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
                    "id": "ac3a16c6-d47b-4945-add9-9c4769c2c4af",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_eecddc968e93b9b8ebbfd85dad3",
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
                    "id": "76edcc7f-da01-44ec-8837-6da270ffd46d",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "5f478cf2-18bb-43de-9f1a-e15088d03828",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "661b6556-4ff9-4b48-a193-076d515aede0",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "f07ebbcc-7127-4c17-aee2-d93b3fb59466"
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
                    "id": "356c003f-aecf-45d8-af7d-195d2cd21f53",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "c91d98fb-e6c6-41c8-92b7-1fc0f0f73f38",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "577d0038-d4a3-4330-bfad-98ef6566f8d7",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "0a36b4a7-864e-40ac-b089-b24051ff4b36"
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
                    "id": "2e3326d6-15e3-41b5-bec5-61560f357af2",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_1f7e4cb168e77496349c8cefed6",
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
                    "id": "de14ccf7-e32c-4ebb-a92a-b5110aaa26af",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "917594b5-a9c8-4e89-bf14-ca3378e4c41d",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "04da9607-ecf1-4fb8-9d32-dd5102e41915"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "036dd06e-2656-479b-95e2-692b4a103c4a",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23"
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
                    "id": "c9887b13-3baa-4ece-b2ce-28994c798612",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_b810a8e37adf5cafd342170ccf8",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI4"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d6f6e735-1a37-4525-a37c-1e77e62b499f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c3cd5551-3054-4386-9afa-3fa99bce1d71",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d6f6e735-1a37-4525-a37c-1e77e62b499f",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ec9deb44-5963-4cfc-a986-4efd327dfa6d",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0795b330-7483-497f-8a53-07a8ca6d6899",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b9fa70a9-38e9-4444-a341-6b755c5910ae",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "10051087-72cf-4778-97db-6d25c1200bc4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b9fa70a9-38e9-4444-a341-6b755c5910ae",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d0f1abf3-7cc5-404b-bdf7-eb7e72c17c83",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "75333ac2-70ef-4146-982f-c65d2fbd453c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7dccef4e-3972-40f8-bfdc-457ec470a3c7",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "75333ac2-70ef-4146-982f-c65d2fbd453c",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "06d9a650-8b92-4be3-9b71-dfa72c7390dc",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "74d3978a-6729-4885-93de-26a105ee699d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ce57bc57-0f73-4a8d-9776-9eea4f15bf4d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "74d3978a-6729-4885-93de-26a105ee699d",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e396d5b2-7215-4e89-99de-a4bc8cd5c147",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37153de2-8aea-4d4c-af40-797684c7b0ba",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d5aacf48-f1dd-4bf6-ac22-cde1fcf27e81",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "64f7992d-58ee-4be2-82b0-60bd2ee8b2f2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f07ebbcc-7127-4c17-aee2-d93b3fb59466",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a9548d35-0fc1-461d-aec6-a802fdb28f38",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1052e0c8-6907-4fda-8860-4be5c620402d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "75cd65ed-561a-493b-abd0-36e2aea9dc14",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1052e0c8-6907-4fda-8860-4be5c620402d",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f696d1ae-bf72-41d1-ae56-85b673fd8170",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5071a0e7-e297-465f-a84c-cffa89ca9cb5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4f5b5137-df89-45b8-a6b5-afbbaa0c5982",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5071a0e7-e297-465f-a84c-cffa89ca9cb5",
                        "name": "favoriteFolder"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "847addd4-190d-4160-a037-a7b2163b1288",
                        "nameSingular": "favoriteFolder",
                        "namePlural": "favoriteFolders"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c67edf4d-60bb-4296-9478-de58bd67f5e2",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "be3f9e9b-b401-482c-b7f7-1a6f63d3c148",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "68ed4276-0bda-4976-a371-9e3d608063e6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "be3f9e9b-b401-482c-b7f7-1a6f63d3c148",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0e2732fa-73a9-421d-9898-dffe993c2962",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db670533-08dc-48da-a809-d0c2ab416e04",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "28486f3f-e811-44a7-8cf2-0e38b64b7916",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "087b2978-3016-447c-a3bf-eadd5977e1cb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "64bf036c-397f-4138-9ab4-64671651c2b2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "087b2978-3016-447c-a3bf-eadd5977e1cb",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "de40ab29-ffb2-4446-8479-7c70568e80e9",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "280337ed-e49f-4271-89a6-d197b60df5ee",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1204be17-217d-42b2-b113-91139b4ea16d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "280337ed-e49f-4271-89a6-d197b60df5ee",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e098ffa7-947c-40a3-9c8c-93f43bad8899",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fb3c7ba3-118e-467d-bc4a-47a9545bdef2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ff5109a4-8699-41f0-98d0-287c45afdba6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fb3c7ba3-118e-467d-bc4a-47a9545bdef2",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0bf188a0-efbd-493e-8360-e38883284085",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a95cac70-3509-43b1-ade0-6c169621bb67",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "04da9607-ecf1-4fb8-9d32-dd5102e41915",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ed975436-4817-4f96-864b-1f86938aeda4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0a36b4a7-864e-40ac-b089-b24051ff4b36",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "457e3c49-e29a-4133-a585-79eec8db2891",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "770d5755-c9ac-4047-8d3e-e9f762d7d8fd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fd2e2f77-635b-4dcb-88f5-0b6004ba7b23",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e700f2b6-4830-4e15-b3fa-edb9594cde3d",
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
                    "createdAt": "2024-10-28T09:49:21.494Z",
                    "updatedAt": "2024-10-28T09:49:21.494Z",
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
                    "id": "9d4dbed7-2547-4fad-8293-5909d7a40058",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c0c0459d-fbaf-4842-9e69-01aeaf2a1630",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9d4dbed7-2547-4fad-8293-5909d7a40058",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d2e95a40-3664-4c75-8495-317f28f4e5a9",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bb7a4488-a03b-4764-92c3-be9c494d0b3a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1f0e0ebf-23c2-4652-8727-a6b5caa9b2f2",
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
                    "createdAt": "2024-10-28T09:49:21.495Z",
                    "updatedAt": "2024-10-28T09:49:21.495Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c4fd1913-5132-411f-8466-0f2686c24b32",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1f0e0ebf-23c2-4652-8727-a6b5caa9b2f2",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f1c28f9b-2c85-4478-b195-8daf77d064e6",
                        "name": "favorites"
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
            "id": "e2ef8f32-a884-41c7-83f9-ab8c95f16333",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "de81ce49-1e0f-436d-8cfe-4b04df747a02",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "84d0af15-12a7-4004-b213-05ff4d3169f2",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_dd22aee9059fd7002165df6d8cc",
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
                    "id": "aed2947e-d4e0-4f23-9672-6faa688e2fc6",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_2bf094726f6d91639302c1c143d",
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
                    "id": "1b02a012-df65-4031-98c4-b9b5acb99b7f",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "3fef41c4-fe75-4c29-8a89-5cbe67263ca4",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "756211b3-a6d2-4d94-861d-5252dc02b718"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f6362cd2-9a3e-41e5-ab21-ef18ea85b75f",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "5467ceff-aeb5-40d1-8cae-64f5725f9d6d"
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
                    "id": "7015c706-4310-47de-962b-7cf01c620a8b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "59fb2bf8-630f-4e90-8f41-4ee436b8c43b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b8f31678-f7a2-4051-8539-10d597072028",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e63dc5b4-6190-4e5f-876d-2e5abb16d005",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e2ef8f32-a884-41c7-83f9-ab8c95f16333",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b8f31678-f7a2-4051-8539-10d597072028",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "31272359-3bc5-4bf9-920b-e5f5f51f8545",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5467ceff-aeb5-40d1-8cae-64f5725f9d6d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3b7e098b-097c-456f-a2b0-7fd3070661d7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "756211b3-a6d2-4d94-861d-5252dc02b718",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "82ff3c28-e39f-41ff-88a0-0b9886ee0abd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "426c1d2d-7208-4bea-948b-0f92e6526557",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d4d2721a-d144-4d33-b2ff-96df314f8923",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e2ef8f32-a884-41c7-83f9-ab8c95f16333",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "426c1d2d-7208-4bea-948b-0f92e6526557",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "39e5cad6-c5ed-4b39-b3b9-96f03ee747fd",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1b4cee02-0619-4dc3-8d96-f932e9c02cb6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "de81ce49-1e0f-436d-8cfe-4b04df747a02",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c1afb30d-97cd-4390-abf6-215942676500",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8348288f-3382-4f92-a7d3-d8ee4605802b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'NEEDS_ACTION'",
                    "options": [
                      {
                        "id": "139c2109-36e6-4170-adaa-eb0f5a73859a",
                        "color": "orange",
                        "label": "Needs Action",
                        "value": "NEEDS_ACTION",
                        "position": 0
                      },
                      {
                        "id": "cec7190c-c54d-4b67-92dc-af435fe307dc",
                        "color": "red",
                        "label": "Declined",
                        "value": "DECLINED",
                        "position": 1
                      },
                      {
                        "id": "f1327adf-5e78-45e2-b828-96586f27e813",
                        "color": "yellow",
                        "label": "Tentative",
                        "value": "TENTATIVE",
                        "position": 2
                      },
                      {
                        "id": "fedac9e3-39f9-4ea6-9b9b-446a18ac4263",
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
                    "id": "650266d1-dcf3-472d-8769-dab6d613fc51",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7d252fa5-bbe4-4ae5-a86b-7f24ac2c8f27",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e2ef8f32-a884-41c7-83f9-ab8c95f16333",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "650266d1-dcf3-472d-8769-dab6d613fc51",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e611e519-8de3-4fd8-b030-9193aeeb5f3b",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b19f483d-3e03-40f5-96bb-7ec2f4c4fb74",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8cf72819-b66e-4368-8576-089d6ea3508f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "d6ba01af-a2fd-4361-b10a-b7d899dcb63f",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "a3c4aa95-7f2e-4cd8-8191-c2a42acc7c59",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "3acad75d-960c-4454-9837-1cdc7045a01c",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "92f1e61b-eca3-4e13-bc6d-eb88c342083b",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "f04378b9-b33a-4af2-a4a6-eecada3ccb54"
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
                    "id": "6dc2868e-9248-42ff-a1ed-e69d32e8ba66",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "9473dcc2-30e2-4023-8dfa-77c7af0c2857",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "f04378b9-b33a-4af2-a4a6-eecada3ccb54"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4e98d4c3-49f8-4ed3-8dd8-d8b1410076c8",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "f7fe2bf4-ec36-4d01-97b1-3b89953cc012"
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
                    "id": "7667c210-cc56-4a39-83d9-a9e3dd350532",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "7a2a8af3-d44e-4ca1-879e-066656af701f",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "c43021aa-be08-4338-8657-5a58038e0a11"
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
                    "id": "cbde45da-d7d7-4b4a-9307-bd6437b22889",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "bc414cec-3626-4e78-a56a-41c90179bb40",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "56b9b797-f6f8-4f50-be7d-535715ad2c91",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9172edc5-2438-48ce-ba72-b4b5427d6262",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4c1a33e5-bf82-4a55-ad88-5f497c43a4ed",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d6ba01af-a2fd-4361-b10a-b7d899dcb63f",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9172edc5-2438-48ce-ba72-b4b5427d6262",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eb2a800a-007e-4962-b214-4369d7b57eab",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "734e9c4d-0177-4950-9dbe-088c18e78949",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b60f2f7d-029f-4b48-b119-56995345abc5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d6ba01af-a2fd-4361-b10a-b7d899dcb63f",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "734e9c4d-0177-4950-9dbe-088c18e78949",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2464d046-64cb-42bc-881d-0f2c1b6f462c",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "07cbbd25-d033-47ee-8a31-7e37c102a4d4",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4d5a3c60-9abf-491d-a959-941a1e061392",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f04378b9-b33a-4af2-a4a6-eecada3ccb54",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f7fe2bf4-ec36-4d01-97b1-3b89953cc012",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "30d4fc60-5056-4ae4-923f-153322033c08",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b742b77e-6983-40c4-bc9e-3b8aa3fd383d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'from'",
                    "options": [
                      {
                        "id": "dc061498-13bf-4928-9565-5932aad29cdc",
                        "color": "green",
                        "label": "From",
                        "value": "from",
                        "position": 0
                      },
                      {
                        "id": "95ce233d-7d99-4779-ad8c-ba88e4107476",
                        "color": "blue",
                        "label": "To",
                        "value": "to",
                        "position": 1
                      },
                      {
                        "id": "8cafdc5e-22f9-4d62-935d-cc58fae7e621",
                        "color": "orange",
                        "label": "Cc",
                        "value": "cc",
                        "position": 2
                      },
                      {
                        "id": "52360916-7548-4962-a8c0-d46be325fbff",
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
                    "id": "c43021aa-be08-4338-8657-5a58038e0a11",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6aa79178-8caa-41bd-b18e-a7a38e98aa01",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b201913-53a1-454a-994f-2a1cb7e06375",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d6ba01af-a2fd-4361-b10a-b7d899dcb63f",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6aa79178-8caa-41bd-b18e-a7a38e98aa01",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b8660459-21af-4ed0-b5bc-54adebef7f8a",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a3c4aa95-7f2e-4cd8-8191-c2a42acc7c59",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "d5f6ebb1-6f82-4357-99f9-6841c949d5c4",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "d505c362-a0e5-44b5-9cb1-6ed0243ffd9c",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "05423c3d-af27-485d-8a8f-473b7dcc77d5",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_a01889a3e5b30d56447736329aa",
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
                            "id": "2cec4581-7a07-485c-9143-96a797d5be41",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "8fd49070-8e33-47da-8558-3e8dd3dae6d5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8a4fa918-54fd-45f4-97ce-786142b028a0",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "2c182d14-a562-447c-8416-0b3b04d8cc7b"
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjc="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8fd49070-8e33-47da-8558-3e8dd3dae6d5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "83385fb1-293a-4398-9a98-51b8d6a106da",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "cd2b6303-023b-4bed-b649-321c27eaa197",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b36ed605-5746-4da7-9cd1-483803602b8b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d5f6ebb1-6f82-4357-99f9-6841c949d5c4",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cd2b6303-023b-4bed-b649-321c27eaa197",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "54ad819b-22f3-497c-8b97-cf6b4743d9ee",
                        "name": "viewSorts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "857643bb-636d-41f8-a8b0-ad2f6ce78b78",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b878fa81-e18d-41ee-b4ce-b13e25fce17a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d505c362-a0e5-44b5-9cb1-6ed0243ffd9c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2c182d14-a562-447c-8416-0b3b04d8cc7b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b3f26ffe-8175-4d2f-8c6a-a7d08ad1bcdf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:21.483Z",
            "updatedAt": "2024-10-28T09:49:21.483Z",
            "labelIdentifierFieldMetadataId": null,
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "733340d9-8d6a-4f11-a25f-b349adf7f745",
                    "createdAt": "2024-10-28T09:49:21.514Z",
                    "updatedAt": "2024-10-28T09:49:21.514Z",
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
                            "id": "21e3f157-03d0-4ae1-92fd-ee91040a600b",
                            "createdAt": "2024-10-28T09:49:21.514Z",
                            "updatedAt": "2024-10-28T09:49:21.514Z",
                            "order": 0,
                            "fieldMetadataId": "42b5b478-9a8c-49fe-bb58-0740647bf793"
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
                    "id": "f1c28f9b-2c85-4478-b195-8daf77d064e6",
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
                    "createdAt": "2024-10-28T09:49:21.495Z",
                    "updatedAt": "2024-10-28T09:49:21.495Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c4fd1913-5132-411f-8466-0f2686c24b32",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f1c28f9b-2c85-4478-b195-8daf77d064e6",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1f0e0ebf-23c2-4652-8727-a6b5caa9b2f2",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "98e3c0b4-90cd-43eb-95c4-475dba53a403",
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
                    "createdAt": "2024-10-28T09:49:21.489Z",
                    "updatedAt": "2024-10-28T09:49:21.489Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3a997b67-5e24-4be0-8b12-1b019bd9f1b1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "98e3c0b4-90cd-43eb-95c4-475dba53a403",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "35018f16-5cba-49d9-b7ec-5e7ecd45fa62",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8c912afc-dedf-4715-bc2c-e9dfb4892ad3",
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
                    "createdAt": "2024-10-28T09:49:21.483Z",
                    "updatedAt": "2024-10-28T09:49:21.483Z",
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
                    "id": "c6599197-e499-43a2-9a84-530ca48f1396",
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
                    "createdAt": "2024-10-28T09:49:21.483Z",
                    "updatedAt": "2024-10-28T09:49:21.483Z",
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
                    "id": "eee4ab55-21fd-43ce-9a9f-a54a60589f88",
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
                    "createdAt": "2024-10-28T09:49:21.492Z",
                    "updatedAt": "2024-10-28T09:49:21.492Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dbef0980-3fab-42d5-9253-520f0c4257ab",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eee4ab55-21fd-43ce-9a9f-a54a60589f88",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8ddb6a12-2ed8-4b5a-a6e4-08c51bd61679",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "babb51d3-0db7-468f-8507-1c314b743f08",
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
                    "createdAt": "2024-10-28T09:49:21.483Z",
                    "updatedAt": "2024-10-28T09:49:21.483Z",
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
                    "id": "ce2ed695-d54e-434e-a2f6-a795409c8134",
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
                    "createdAt": "2024-10-28T09:49:21.483Z",
                    "updatedAt": "2024-10-28T09:49:21.483Z",
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
                    "id": "286690e2-2627-4534-a317-c1a62a9179ce",
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
                    "createdAt": "2024-10-28T09:49:21.483Z",
                    "updatedAt": "2024-10-28T09:49:21.483Z",
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
                    "id": "ce7ad4bf-5487-4ec5-a743-b0b200159656",
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
                    "createdAt": "2024-10-28T09:49:21.483Z",
                    "updatedAt": "2024-10-28T09:49:21.483Z",
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
                    "id": "4c54e798-e4c5-4335-9885-a38647ae7006",
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
                    "createdAt": "2024-10-28T09:49:21.503Z",
                    "updatedAt": "2024-10-28T09:49:21.503Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f2dcc87a-92cd-4323-a351-bf0973dd947a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4c54e798-e4c5-4335-9885-a38647ae7006",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7da436ce-7dad-4db5-b709-251a587c4988",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ee3042c3-09ef-4b72-8d6c-c7aefd5cf38b",
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
                    "createdAt": "2024-10-28T09:49:21.483Z",
                    "updatedAt": "2024-10-28T09:49:21.483Z",
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
                    "id": "42b5b478-9a8c-49fe-bb58-0740647bf793",
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
                    "createdAt": "2024-10-28T09:49:21.512Z",
                    "updatedAt": "2024-10-28T09:49:21.512Z",
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
                    "id": "dcaff525-fa08-4197-b802-7f47bf7cb292",
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
                    "createdAt": "2024-10-28T09:49:21.498Z",
                    "updatedAt": "2024-10-28T09:49:21.498Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "684de211-70f4-44f1-8f0c-bb4f52f334b4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "dcaff525-fa08-4197-b802-7f47bf7cb292",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4792c859-bd30-49a4-879b-4c529a66655b",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eb83f3b6-4c04-42ed-ac7a-0563d240c80f",
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
                    "createdAt": "2024-10-28T09:49:21.501Z",
                    "updatedAt": "2024-10-28T09:49:21.501Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5bf418ff-7576-43e3-bd85-7a04d7332909",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eb83f3b6-4c04-42ed-ac7a-0563d240c80f",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2b6a5f75-61b7-4f24-aad8-84be25c3b311",
                        "name": "rocket"
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
            "id": "b0678eb5-f8e9-42c3-b7b8-963d8724ec1e",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "c9d69bd6-24ad-4262-8b40-ad41cc84f8ae",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f1edcd55-41f3-4bdb-9ec3-550131252ce2",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "0ec71d58-e6d4-4688-bcb7-a7e9c3c0f39b",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "775daca9-1264-4835-835b-c6ff421964d9"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "c57502b6-a8e3-4ad5-9c54-8e5a03241954",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "936dac0e-d11e-419a-889c-68ac76a2f279"
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
                    "id": "ebee7ecf-e4cb-46ea-ab39-71246f708eb2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2e85e8c4-8f91-4187-a8f8-e346cce2a62d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e8a23a86-1230-41db-b372-31b6f402b9b6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "6939c2da-99af-43f5-b0ae-5a0162d63295",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "fa14c848-6fcd-4520-a0da-c77cbc7a8c78",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "39da5558-2128-4b20-9030-1f1d034bb490",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "9befb05f-a7cf-4819-a616-541a882f16fa",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "6c835f2f-9fe5-4d55-ad1d-2ff159acb254",
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
                    "id": "74d24e46-76e3-4858-9d65-36b885386308",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "01b4b49d-d908-48ea-84f0-179ca55f40cc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5aeec448-448e-48bf-8591-d88aa169fe1e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b0678eb5-f8e9-42c3-b7b8-963d8724ec1e",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "01b4b49d-d908-48ea-84f0-179ca55f40cc",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "753f7ffb-1e8b-4a38-8a7e-dcd8e1b86b70",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fa268e46-b8b5-484c-b422-ce14ef9ed873",
                        "name": "calendarChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7c0e067a-ae9a-48da-a1d2-d2c3264a05a5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "a20e22e4-de88-4ce9-833d-d1979d90d775",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "e12912c3-4a79-4d12-931b-10e839809006",
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
                    "id": "e6bf1d5f-f375-4258-8667-28c9c9ce4155",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c9d69bd6-24ad-4262-8b40-ad41cc84f8ae",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "00aceac0-0f09-4a30-b772-2ce6a8cf7016",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0e35dfad-8b47-41e4-af69-df127a5772d7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ddd271f0-0c82-4472-bd45-5c45533dd0e4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0250a119-b10a-49a5-a65f-da2ecdd76fad",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "775daca9-1264-4835-835b-c6ff421964d9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ac74b9ba-c03c-4b1b-8638-4a7f224ddd3c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a8e13550-cd8c-464f-b868-ac54c48186ac",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b0678eb5-f8e9-42c3-b7b8-963d8724ec1e",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ac74b9ba-c03c-4b1b-8638-4a7f224ddd3c",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ee4721ca-97c9-46ab-91ff-e4d6c03aa95b",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f55623b1-bbdd-43ca-a2d1-74766a47d226",
                        "name": "calendarChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1e4ce316-63b8-4ebc-b218-43943f0cb20c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "936dac0e-d11e-419a-889c-68ac76a2f279",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "08edbc01-b3aa-4dc3-b45d-c63a3c9278eb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                    "options": [
                      {
                        "id": "ec0c6fad-8e1e-41ff-bee6-7f364cb91194",
                        "color": "green",
                        "label": "As Participant and Organizer",
                        "value": "AS_PARTICIPANT_AND_ORGANIZER",
                        "position": 0
                      },
                      {
                        "id": "225d5007-db33-4bbb-ba6e-0aad05ad3c20",
                        "color": "orange",
                        "label": "As Participant",
                        "value": "AS_PARTICIPANT",
                        "position": 1
                      },
                      {
                        "id": "8883d08d-d6d8-40a3-abd9-5580ffab377b",
                        "color": "blue",
                        "label": "As Organizer",
                        "value": "AS_ORGANIZER",
                        "position": 2
                      },
                      {
                        "id": "4d0fd628-c9f7-4a1f-8526-86cae0fff49b",
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
                    "id": "0272a5b9-b26b-4ed8-9789-af4402db222b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "d6a2b1dd-a502-44f6-9260-a54ea8602c3e",
                        "color": "blue",
                        "label": "Full calendar event list fetch pending",
                        "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "32eefb2f-b86a-4758-8830-c2de0f13e319",
                        "color": "blue",
                        "label": "Partial calendar event list fetch pending",
                        "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "76bc6088-3c9e-40e3-85cf-620717b67d6b",
                        "color": "orange",
                        "label": "Calendar event list fetch ongoing",
                        "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "79a8e379-cfa9-4010-aa2a-864a078467bd",
                        "color": "blue",
                        "label": "Calendar events import pending",
                        "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "86033ef4-12e8-45c7-a279-2147a6d22c1d",
                        "color": "orange",
                        "label": "Calendar events import ongoing",
                        "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "8f77903d-efc7-417a-9c2f-1a44db6f5a35",
                        "color": "red",
                        "label": "Failed",
                        "value": "FAILED",
                        "position": 5
                      }
                    ],
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
            "id": "a20d54bd-5dd1-41ad-aef0-195895d13f7a",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "b718a44a-2bab-4efd-bab8-9d3ec1715a5d",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "2911997a-126c-4b04-900e-98fb1c8f9cc2",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "4e4cbe2e-9950-4cba-bbfb-c7d80d9ffc78",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "2a400960-2870-4876-a432-587054404a87"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "2e242074-098a-4c95-850e-2049e3603bbc",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "494f6bac-0a41-4c7f-84e7-eb8aa34d2fd8"
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
                    "id": "5537790f-6c7a-4049-9bbb-51f7e8b97bc8",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "bd1db766-b8b8-43a2-845a-49c4d9dd2994",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "494f6bac-0a41-4c7f-84e7-eb8aa34d2fd8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4936c8d3-07e8-4a97-8125-eec0068fb002",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "9d1c0524-fbf0-40b7-8868-b6b4f98e19e7"
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
                    "id": "494f6bac-0a41-4c7f-84e7-eb8aa34d2fd8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7f389f52-eb21-446a-9f73-83a614d2bd43",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "438b89eb-eb6a-4f66-859f-ea9e383d1808",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9d1c0524-fbf0-40b7-8868-b6b4f98e19e7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0bcc3fb6-6655-4ba4-ad86-0baa6829f4e2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fd5499c3-9d0a-491f-bbca-281ec646751d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a20d54bd-5dd1-41ad-aef0-195895d13f7a",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0bcc3fb6-6655-4ba4-ad86-0baa6829f4e2",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f9470104-3773-4643-b6ba-0a48b70623e8",
                        "name": "authoredComments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f34ec3ed-3174-410f-a1f6-fd253035d1a4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "14a22a68-54ae-4d6b-9152-6b256f33b0d2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "954dff50-9f1d-4f3a-b813-284513cd8c18",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a20d54bd-5dd1-41ad-aef0-195895d13f7a",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "14a22a68-54ae-4d6b-9152-6b256f33b0d2",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f0a59b1e-8e64-4eed-999b-7fa3e708f045",
                        "name": "comments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2a400960-2870-4876-a432-587054404a87",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b718a44a-2bab-4efd-bab8-9d3ec1715a5d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "9d4ccb02-6744-419e-b0b3-a2587b1357d1",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "2cff5514-88bd-4311-96bb-cfb52c1e8240",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "92f61f97-497f-433b-a687-19717ad1e8df",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "e278f6aa-9062-498c-9177-a4b446bba695",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "34655313-d3e6-4fe7-b4d6-35da411f11db"
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
                    "id": "2cff5514-88bd-4311-96bb-cfb52c1e8240",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "83760735-abeb-4f85-a07f-29292e449ba7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "78a6ae20-a1be-4023-9fb2-b9f5a39bbbab",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "79729fe9-471f-4693-a447-c6476ff7e4eb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8835024e-2b18-49da-ac37-a115adaff4ec",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ed939808-ef87-49b0-adff-8d9145e3b808",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "222a7f86-b2a2-41be-8bc3-1c6d1fef8481",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9d4ccb02-6744-419e-b0b3-a2587b1357d1",
                        "nameSingular": "viewGroup",
                        "namePlural": "viewGroups"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ed939808-ef87-49b0-adff-8d9145e3b808",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6c67a3bb-7006-42b7-9ebf-5466c6c3b347",
                        "name": "viewGroups"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ba827f02-7822-42fa-a94d-6853d385d067",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1c236ce9-ea1d-4bb9-b69e-d762add1cc21",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7adb2727-39b7-478a-beb9-c3704909e61f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "34655313-d3e6-4fe7-b4d6-35da411f11db",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "9caad004-2080-4017-b2db-5a3da930fe94",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "3fcb44d5-6c65-475d-a05b-710897b9d891",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "50754978-60ce-4735-a203-1af37882d8cc",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_e47451872f70c8f187a6b460ac7",
                    "indexWhereClause": null,
                    "indexType": "GIN",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI2"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "19561737-d8f0-475d-925b-400e6591346e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "d66e2b6e-f618-43da-93b9-16c49cedeb04",
                        "color": "sky",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "0a6685a9-aa20-467b-9276-10771e1a19b2",
                        "color": "red",
                        "label": "24HRS",
                        "value": "HOUR_24",
                        "position": 1
                      },
                      {
                        "id": "ac741992-3a04-4301-8d38-e882861db64a",
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
                    "id": "fbfa4073-b7b4-4115-98a6-47ae907d7fb1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e55e4ce6-6bf1-4d3f-8c1c-1b74266bca71",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fbfa4073-b7b4-4115-98a6-47ae907d7fb1",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0eaa26ac-5007-47b6-8e5e-aae25a1b6c6c",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0094c244-ceb4-4c00-9999-31c60a677570",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a0de2b9f-4baa-4c6a-850e-718f1d5be281",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0920252e-9a61-4bd3-a912-f35f82527fc8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ad5b1782-e2da-49f9-8627-f308cd9fa076",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0920252e-9a61-4bd3-a912-f35f82527fc8",
                        "name": "authoredAttachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8cd0c94f-ae34-4ad5-91df-7a814647e98a",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "068c484f-8f37-43a4-ad1f-288d96b61a6a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e8aabb0b-8fce-494d-8077-b043a3a67d43",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "70bb0974-11fe-42bd-bfc8-040d83ce530a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e8aabb0b-8fce-494d-8077-b043a3a67d43",
                        "name": "assignedActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9ac04623-fdf4-4bcd-9418-23d349401d98",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "361c75d7-7682-4afb-9562-a30cd7877f96",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8cb09fbb-ba97-408b-bd36-0519548654ce",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "361c75d7-7682-4afb-9562-a30cd7877f96",
                        "name": "accountOwnerForCompanies"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f2bc2720-de18-415d-b07e-6d638a1217fd",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4e2b9703-1438-493e-8e17-96bc694c4079",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b29cdecd-c3eb-43d9-b457-0fada2a4c5c8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'system'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "39e5cad6-c5ed-4b39-b3b9-96f03ee747fd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d4d2721a-d144-4d33-b2ff-96df314f8923",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "39e5cad6-c5ed-4b39-b3b9-96f03ee747fd",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e2ef8f32-a884-41c7-83f9-ab8c95f16333",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "426c1d2d-7208-4bea-948b-0f92e6526557",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c91b43a9-6db6-49d6-98e1-39831097967d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fe02c19c-3285-4974-b8b6-63b94d343f2e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c91b43a9-6db6-49d6-98e1-39831097967d",
                        "name": "blocklist"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fbfc7dc8-ea47-41a4-bdc4-e47658a119d8",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "16c93d05-a429-46b5-9d30-12d0e73f48dd",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f4264ef6-1407-44c0-b892-26ed2b4ef903",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e098ffa7-947c-40a3-9c8c-93f43bad8899",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1204be17-217d-42b2-b113-91139b4ea16d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e098ffa7-947c-40a3-9c8c-93f43bad8899",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "280337ed-e49f-4271-89a6-d197b60df5ee",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "22b1101d-3c61-43d8-83d1-2e08da724169",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d86cb5a6-f6be-4f80-9ff5-42c7e61d8dad",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "22b1101d-3c61-43d8-83d1-2e08da724169",
                        "name": "auditLogs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4a81a6d9-c484-4f31-9e0f-2d9a7782e109",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5b46d5d8-a2f2-4d42-a7bc-7d82a09cce2d",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5055ed20-1d80-4c05-822c-c8b29e7300cd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3fcb44d5-6c65-475d-a05b-710897b9d891",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9f4341f7-5e56-41ce-9356-36705a90a92b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "bef8e3bb-e9c0-41fd-8edf-f81e831d2e50",
                        "color": "turquoise",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "a9380ce6-08de-4e12-8a0e-382e9891f533",
                        "color": "red",
                        "label": "Month First",
                        "value": "MONTH_FIRST",
                        "position": 1
                      },
                      {
                        "id": "19c73ce0-a9d2-48e3-aa68-cbd96d1fe729",
                        "color": "purple",
                        "label": "Day First",
                        "value": "DAY_FIRST",
                        "position": 2
                      },
                      {
                        "id": "bffd9cd6-8f48-4792-beea-665e6562781e",
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
                    "id": "eb2a800a-007e-4962-b214-4369d7b57eab",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4c1a33e5-bf82-4a55-ad88-5f497c43a4ed",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eb2a800a-007e-4962-b214-4369d7b57eab",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d6ba01af-a2fd-4361-b10a-b7d899dcb63f",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9172edc5-2438-48ce-ba72-b4b5427d6262",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4d22ea94-3f2f-405c-8140-1c8941fc9d4d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2ea6b954-6088-4cfc-9986-bb35f72973cb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4d22ea94-3f2f-405c-8140-1c8941fc9d4d",
                        "name": "assignedTasks"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2043977f-a98e-4726-9ccd-921309ef26d3",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "122116cf-f1c3-4d9b-bc14-ad6789c0237d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d7a7b64b-66f2-4652-bd5b-7cce55c5e1ed",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f9470104-3773-4643-b6ba-0a48b70623e8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fd5499c3-9d0a-491f-bbca-281ec646751d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f9470104-3773-4643-b6ba-0a48b70623e8",
                        "name": "authoredComments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a20d54bd-5dd1-41ad-aef0-195895d13f7a",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0bcc3fb6-6655-4ba4-ad86-0baa6829f4e2",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9fdc90bc-1746-4915-90b1-b00bce796d90",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0513b127-2ea1-4182-aab7-066b307dec80",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9fdc90bc-1746-4915-90b1-b00bce796d90",
                        "name": "authoredActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4ee44f77-3e37-4685-bf78-5d352677b8e0",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7367c4fc-0b58-4d57-b5b5-b379ee86a0aa",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bc24df17-e95b-437a-a8a9-dfde46bb2158",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7367c4fc-0b58-4d57-b5b5-b379ee86a0aa",
                        "name": "connectedAccounts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "753f7ffb-1e8b-4a38-8a7e-dcd8e1b86b70",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "696b78a1-ea3f-46a8-9352-0d8e8cb714e4",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a70d01e0-d3e4-4f67-bc79-8ee025b1eb09",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "345ee112-29b4-4491-bf1d-b5c6f64190d7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'en'",
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
            "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "2adbc211-f042-4d42-9dc7-062ddf00a059",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
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
                    "id": "c56d0ead-f164-4617-a75b-6050eea27e50",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3ad8b5d3-6956-43e1-8caf-b0af8dee0861",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "54ad819b-22f3-497c-8b97-cf6b4743d9ee",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b36ed605-5746-4da7-9cd1-483803602b8b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "54ad819b-22f3-497c-8b97-cf6b4743d9ee",
                        "name": "viewSorts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d5f6ebb1-6f82-4357-99f9-6841c949d5c4",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cd2b6303-023b-4bed-b649-321c27eaa197",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d4338c7e-3cf9-4fc0-8165-834dd3a33aa1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'INDEX'",
                    "options": [
                      {
                        "id": "fafb9808-e967-4cbe-91fb-28d5303cd688",
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
                    "id": "5ba448e1-19b2-4e52-b831-35837e81abed",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5a36e136-d881-44a0-bfeb-a281bda5053b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "21842052-73e8-4550-9f1b-6bd297e0bd7f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5a36e136-d881-44a0-bfeb-a281bda5053b",
                        "name": "viewFilterGroups"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fc93fc8e-1373-46fc-9117-ded99af0f5fc",
                        "nameSingular": "viewFilterGroup",
                        "namePlural": "viewFilterGroups"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e0d1825a-1004-48c3-b97c-eb36ac1798cd",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a9a23272-7420-4638-8e82-ed04a5ae5767",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "44985b53-8087-4a73-bcbc-56bb9c911af3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9ea935bc-63f8-4a4e-8f95-99009ce1d8a2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9f0722cc-1caa-4609-af5f-edc9c781f53d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6c67a3bb-7006-42b7-9ebf-5466c6c3b347",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "222a7f86-b2a2-41be-8bc3-1c6d1fef8481",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6c67a3bb-7006-42b7-9ebf-5466c6c3b347",
                        "name": "viewGroups"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9d4ccb02-6744-419e-b0b3-a2587b1357d1",
                        "nameSingular": "viewGroup",
                        "namePlural": "viewGroups"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ed939808-ef87-49b0-adff-8d9145e3b808",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1417f75b-b529-4d06-8571-292f8e549fdd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ff80ec00-bcad-4847-9666-5e8df8dae2c3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1417f75b-b529-4d06-8571-292f8e549fdd",
                        "name": "viewFilters"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1f45dbdd-37f1-43d6-b128-c6befafb7733",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "47a8dcb7-b48b-4679-a377-f716e5479895",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a9f0c474-951d-48be-bce2-29e9a3488dc4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f696d1ae-bf72-41d1-ae56-85b673fd8170",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "75cd65ed-561a-493b-abd0-36e2aea9dc14",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f696d1ae-bf72-41d1-ae56-85b673fd8170",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1052e0c8-6907-4fda-8860-4be5c620402d",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "921f5c4d-fc8e-44b4-b516-22a52cc7bff7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b72c7f80-7876-420e-9f4e-1b5478e99b28",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2adbc211-f042-4d42-9dc7-062ddf00a059",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "bfd2171a-1af5-4ecb-ae8b-dc172b6ec5d9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "58a47d58-b90c-408d-b1b7-7ec1e09b7d40",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bfd2171a-1af5-4ecb-ae8b-dc172b6ec5d9",
                        "name": "viewFields"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7e26edf9-db91-467a-9a33-901c0d9a0c2e",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f3792831-d031-46e7-ae3a-3c38dbf18d39",
                        "name": "view"
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
            "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "566cb7b1-822a-4b9c-b511-2e2c67def731",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f1e0c7c0-5a99-4df4-9720-4d4658f30195",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "cfbbba76-3eab-4894-9d4f-27962bb16375",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "52307125-279d-415b-accf-4522ec66c769"
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
                    "id": "4ce6354e-4748-442e-bf20-5b747b217dc2",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "67feb664-014e-40c7-bcae-ad27eb811b3a",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "52307125-279d-415b-accf-4522ec66c769"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "df388b95-d519-47bd-8b15-394059cb0097",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "eb71f013-d0f8-48ed-9c0d-74027af8effd"
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
                    "id": "7899de38-18cf-4d8b-aef3-dd959461752b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "eb71f013-d0f8-48ed-9c0d-74027af8effd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "52307125-279d-415b-accf-4522ec66c769",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f081b9f6-b59c-4c27-a7e5-80fc3a94ccfc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5285758c-733f-4285-810c-70e0ffdf2992",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "03f1f3c4-ecb4-4c50-868f-627f1f634dd1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "566cb7b1-822a-4b9c-b511-2e2c67def731",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9e34121a-6a68-4dbf-968a-9dc7b41f66a7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a595c58f-d7e7-4786-9315-cb2a1a0f638d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9e34121a-6a68-4dbf-968a-9dc7b41f66a7",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eddd7d16-4a8a-48b5-a69f-b2b339200260",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1669eefe-4fe4-4ba3-93b4-03f9e7524ef4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "4ee44f77-3e37-4685-bf78-5d352677b8e0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0513b127-2ea1-4182-aab7-066b307dec80",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4ee44f77-3e37-4685-bf78-5d352677b8e0",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9fdc90bc-1746-4915-90b1-b00bce796d90",
                        "name": "authoredActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f0a59b1e-8e64-4eed-999b-7fa3e708f045",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "954dff50-9f1d-4f3a-b813-284513cd8c18",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f0a59b1e-8e64-4eed-999b-7fa3e708f045",
                        "name": "comments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a20d54bd-5dd1-41ad-aef0-195895d13f7a",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "14a22a68-54ae-4d6b-9152-6b256f33b0d2",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "80dba865-6cb3-4440-a73d-16ef4d4df4ac",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "922156b4-391c-41ce-882a-54caa525d620",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c4e53d66-68c4-427d-91c4-8ebcf6893550",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "922156b4-391c-41ce-882a-54caa525d620",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "09417b26-fe5b-407a-8e63-4bf712a22f46",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9ac04623-fdf4-4bcd-9418-23d349401d98",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "70bb0974-11fe-42bd-bfc8-040d83ce530a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9ac04623-fdf4-4bcd-9418-23d349401d98",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e8aabb0b-8fce-494d-8077-b043a3a67d43",
                        "name": "assignedActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5fbf4480-4b5a-454c-8bd4-4af6c3098cc7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f2787af5-0853-4bab-9353-6a1a90ae4bd7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c0f38c53-089b-45d4-b414-2c9dc7325dae",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "da42c5e5-c80b-4a49-a176-4515841b4b42",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "C",
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ca5176ce-168c-412f-b2f9-244aa026626a",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_fb1f4905546cfc6d70a971c76f7",
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
                            "id": "75ce02e0-9bdc-4220-870b-e4ec6459bab4",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "841a240f-57f9-47e6-8010-c12f4b06754a"
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
                    "id": "44442f61-b3c3-438a-a5a5-51d9a39382fc",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_123501237187c835ede626367b7",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI4"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d2e95a40-3664-4c75-8495-317f28f4e5a9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c0c0459d-fbaf-4842-9e69-01aeaf2a1630",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d2e95a40-3664-4c75-8495-317f28f4e5a9",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9d4dbed7-2547-4fad-8293-5909d7a40058",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "14cdf989-9259-4256-90e7-53f40d13f167",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ac8e563c-2c41-41ad-8bb8-0b13b4da337e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2cec3c41-9679-4806-aa69-cc7a67a5b440",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ac8e563c-2c41-41ad-8bb8-0b13b4da337e",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9eb278a6-ae8f-4907-a733-a81134512d29",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4e480667-f91d-418e-a562-defb5a1231d1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "123ef09a-c54d-4497-b611-7948c40c6965",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4e480667-f91d-418e-a562-defb5a1231d1",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e6cdf7e3-4d36-4279-8cf0-f779be9ac35e",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "029dd967-c8ae-41ce-9f72-747e574824fe",
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
                    "createdAt": "2024-10-28T09:49:21.041Z",
                    "updatedAt": "2024-10-28T09:49:21.041Z",
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
                    "id": "2b1c0c80-38a3-4463-b864-7f8b5ead5501",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3c82f79b-4aec-4eb5-8fcc-25e557d3879e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2b1c0c80-38a3-4463-b864-7f8b5ead5501",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4b485aa6-a01b-40eb-88a0-116645ab855d",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "714c46ec-6f92-4375-a212-fbaa1b92f99e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ea1e86ea-dfcd-4487-b9a1-d5c712c65428",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d2093490-cbd9-45ad-917a-7ab7a450cbb0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "952a8757-56e7-4fac-be92-65216fce9efa",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e79427d5-7e7b-4d3e-8a17-c95ca08607a0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "952a8757-56e7-4fac-be92-65216fce9efa",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "94217fdc-7905-43c5-9491-2cf16eb4ab1c",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f1f7a13b-6e65-4c8e-bb41-192a037980c0",
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
                    "createdAt": "2024-10-28T09:49:20.762Z",
                    "updatedAt": "2024-10-28T09:49:20.762Z",
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
                    "id": "e1e87375-6ff4-49e0-936c-f44aac66270a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2c79fe38-1ca1-4536-b961-91801f186a7e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0dc2a019-640f-4da5-b0ce-1617941e7abb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a9796df6-9878-41ff-9f03-96f12da3002f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "da42c5e5-c80b-4a49-a176-4515841b4b42",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c2d07047-bdde-4da2-99d6-271dcc99e6c4",
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
                    "createdAt": "2024-10-28T09:49:20.863Z",
                    "updatedAt": "2024-10-28T09:49:20.863Z",
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
                    "id": "d2e64a22-73cb-4864-8d9f-9d4bc9f41860",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e4639f90-c85b-46d9-91f6-40162c20ec2f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d2e64a22-73cb-4864-8d9f-9d4bc9f41860",
                        "name": "people"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1860acd1-533e-4139-a89f-d8bef201d2eb",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "56e50351-c9a6-4f5d-af67-f07162f021e2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fb28d72d-d130-46e0-ab8c-36b57769c6a0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "18edafef-b1cd-410a-80c2-f900516d5b21",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "231c6bb6-c8fd-4aeb-9f73-d1327996fa0a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "18edafef-b1cd-410a-80c2-f900516d5b21",
                        "name": "opportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5e18b24e-c35f-4a6f-92e1-98e9c919acaf",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "841a240f-57f9-47e6-8010-c12f4b06754a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c12fe6ac-f1d8-4790-ae62-c24619bf1a0d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e8d39e9b-1071-4ac9-aaf8-bfb065427bb0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c12fe6ac-f1d8-4790-ae62-c24619bf1a0d",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "635523d0-0bf3-470e-90d3-eba2bc5d576b",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e03d2ca5-78e6-4a93-8b1b-a001cbfb0a2b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "936f3c51-ebce-49a0-8bfd-71d47aace02d",
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
                    "createdAt": "2024-10-28T09:49:20.953Z",
                    "updatedAt": "2024-10-28T09:49:20.953Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "1a8f7eb5-7393-4c4a-a930-507c55ff89d6",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "c73f33ad-d4d8-45b4-b5f4-08f8a84f56b9",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "a40301a1-6647-4ea5-bf15-32c64542caf7",
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
                    "id": "f1811122-7989-4c00-8402-3074a3743791",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5054ae83-3e3a-43d6-a321-5565f5998ae4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f2bc2720-de18-415d-b07e-6d638a1217fd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8cb09fbb-ba97-408b-bd36-0519548654ce",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f2bc2720-de18-415d-b07e-6d638a1217fd",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "361c75d7-7682-4afb-9562-a30cd7877f96",
                        "name": "accountOwnerForCompanies"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4832a875-5d27-4a50-a585-debc5fafa22c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "847addd4-190d-4160-a037-a7b2163b1288",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "a0b9af02-ad40-42d6-b050-dfbc63bc7801",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
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
                    "id": "c04507fd-1e15-48dc-9fb9-8f4a89a19bcd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f38806d5-566d-45bc-9dd6-98659e35cca4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "17ec9355-6225-4666-8fec-2848d5618e17",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a0b9af02-ad40-42d6-b050-dfbc63bc7801",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c67edf4d-60bb-4296-9478-de58bd67f5e2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4f5b5137-df89-45b8-a6b5-afbbaa0c5982",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "847addd4-190d-4160-a037-a7b2163b1288",
                        "nameSingular": "favoriteFolder",
                        "namePlural": "favoriteFolders"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c67edf4d-60bb-4296-9478-de58bd67f5e2",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5071a0e7-e297-465f-a84c-cffa89ca9cb5",
                        "name": "favoriteFolder"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "48a61538-0804-4827-bdf2-1a2deff8b94b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0788a999-5777-4829-be54-db5e8a821fbb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "7e26edf9-db91-467a-9a33-901c0d9a0c2e",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "c8d1d507-0468-43c9-af80-382a20bb45eb",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d79be1ce-e442-4994-bd82-a4fcd9338639",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "62a3ca02-2e47-479c-9352-91d9ce41760d",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "f1e9718e-efdb-4870-9f2a-614aec8e1512"
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
                    "id": "31d75a2d-a84d-41f0-9d55-041f7cbb25f4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "40dc77bf-0955-4e86-a0f5-fded1d64cb08",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c8d1d507-0468-43c9-af80-382a20bb45eb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c9c3c40d-dfb2-4aa1-b368-3e4c13ff0e34",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0432f849-7311-4642-b7a6-bc6aca97ac1e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b99b3896-f16f-40d5-aead-14d78cd48532",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c7a0631f-e67e-4066-bcb2-6ab350a5f432",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "807173fc-415a-4a61-a6a0-ce45149a2520",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f3792831-d031-46e7-ae3a-3c38dbf18d39",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "58a47d58-b90c-408d-b1b7-7ec1e09b7d40",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7e26edf9-db91-467a-9a33-901c0d9a0c2e",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f3792831-d031-46e7-ae3a-3c38dbf18d39",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bfd2171a-1af5-4ecb-ae8b-dc172b6ec5d9",
                        "name": "viewFields"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f1e9718e-efdb-4870-9f2a-614aec8e1512",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "3efc006b-6681-4b6b-bf4b-6ccedf8e1941",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ce05f7de-8eb7-424f-9bd1-34963ba105df",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "98e5162f-f96f-46ad-ab71-066a6cdcc49e",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "6d42b941-c123-4245-937e-7d4636c78282"
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
                    "id": "f2baab4e-5154-4576-80c3-ee482ef566c6",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_56454973bce16e65ee1ae3d2e40",
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
                    "id": "0ff43064-2ed1-4226-87bb-0a51eed83e71",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_19ea95ddb39f610f7dcad4c4336",
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
                    "id": "1059ccd1-bb61-4eb6-af9b-a7e69997a557",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "103c7080-0aeb-4cbf-b400-83495eb0c60a",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "32354132-f4b8-454e-9964-ee7f067e372c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "7f4f145f-3898-4e50-819c-64e01bf8505d",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "55d1b752-e36f-4085-b4b3-03c9056fa30a"
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
                    "id": "9eb278a6-ae8f-4907-a733-a81134512d29",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2cec3c41-9679-4806-aa69-cc7a67a5b440",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9eb278a6-ae8f-4907-a733-a81134512d29",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ac8e563c-2c41-41ad-8bb8-0b13b4da337e",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "32354132-f4b8-454e-9964-ee7f067e372c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a26db9a8-5a2e-4e1d-abcc-22c7874c64cb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "96d29b00-ad69-413e-b8ea-19488246aa4f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d1a60519-c0c7-421e-8a48-c7c9110b8bf3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "96d29b00-ad69-413e-b8ea-19488246aa4f",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ff431c43-b3a1-4400-80de-6843bdf847bf",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6d42b941-c123-4245-937e-7d4636c78282",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2d50c531-db12-4a0f-9082-44cf686766be",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0840636a-659b-4efa-b0cb-7d360fba4695",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3072b070-09bc-4906-8535-e356e899ccd8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0840636a-659b-4efa-b0cb-7d360fba4695",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d23fe226-0ad7-46e4-8155-dd3ce98c10f5",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0158728e-cc8e-4312-bc4b-1bc636f3dbe4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3efc006b-6681-4b6b-bf4b-6ccedf8e1941",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e3815b25-de00-4651-8a4b-41991e218f00",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dec819b7-0dc2-47df-af02-4ae56ec20ce2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e3815b25-de00-4651-8a4b-41991e218f00",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0d50f9a7-0129-4890-8e5b-ae192dd8c805",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2b6a5f75-61b7-4f24-aad8-84be25c3b311",
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
                    "createdAt": "2024-10-28T09:49:21.501Z",
                    "updatedAt": "2024-10-28T09:49:21.501Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5bf418ff-7576-43e3-bd85-7a04d7332909",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2b6a5f75-61b7-4f24-aad8-84be25c3b311",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eb83f3b6-4c04-42ed-ac7a-0563d240c80f",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "55d1b752-e36f-4085-b4b3-03c9056fa30a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "095fb7a0-0092-43bc-a404-660dbd0c4d24",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6109fae5-56d6-46ce-9298-e28ddbbe2ac5",
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
                    "createdAt": "2024-10-28T09:49:21.500Z",
                    "updatedAt": "2024-10-28T09:49:21.500Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": {
                      "isForeignKey": true
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
            "id": "7a05c542-e57d-4ee6-be87-4d5386eaa41e",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "20984ac1-2bfd-4288-83cc-f9cfd095072e",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "8013d6e6-7aa0-4c59-bf64-bce4c2e8f0e1",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "2e009510-b9d7-4116-be08-bf15f228afff",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "02ede0d5-c7f2-45b0-a340-9733f3c065c8"
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
                    "id": "884fb3de-e555-4bc5-a295-0c1e75987e54",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'SENT'",
                    "options": [
                      {
                        "id": "3347e225-ab12-4460-9cd0-e3ea6b0c546c",
                        "color": "green",
                        "label": "Sent and Received",
                        "value": "SENT_AND_RECEIVED",
                        "position": 0
                      },
                      {
                        "id": "53ab3cdb-162b-4e85-8635-b0eec6f084fc",
                        "color": "blue",
                        "label": "Sent",
                        "value": "SENT",
                        "position": 1
                      },
                      {
                        "id": "3512c903-3d71-4d2b-a390-3d47533d756b",
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
                    "id": "18d59c88-fae5-439b-8900-c85a2348162c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ec94dda2-b3f9-4541-9b36-fb8c1e0e507c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d01f688f-3bb6-4ee2-ab8d-abcf89105850",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f39dc730-0409-4894-8bee-f7ddb8c02947",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7a05c542-e57d-4ee6-be87-4d5386eaa41e",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d01f688f-3bb6-4ee2-ab8d-abcf89105850",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "74f83621-f1d1-41ff-ba14-7b8a245f7b33",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f70a2fde-c1a6-407b-a93e-bf682c1e2aaf",
                        "name": "messageChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2fc55285-8613-49b7-9a76-0ad2e5cfd24b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d72d9c14-d33e-41e1-88fd-f6203a1f6b0d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "d9646b97-b0b3-4799-a953-f48cf7b65779",
                        "color": "blue",
                        "label": "Full messages list fetch pending",
                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "d4115235-1df1-48a1-a3de-1dcd10ca1e72",
                        "color": "blue",
                        "label": "Partial messages list fetch pending",
                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "8b25da8a-b2cb-4aca-8aef-d88a6901bac6",
                        "color": "orange",
                        "label": "Messages list fetch ongoing",
                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "316e72c1-c097-43b8-8e51-1888e6c2ef1f",
                        "color": "blue",
                        "label": "Messages import pending",
                        "value": "MESSAGES_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "ab5b77f8-b255-47fd-9fcd-c7531e1fe50e",
                        "color": "orange",
                        "label": "Messages import ongoing",
                        "value": "MESSAGES_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "6e5cdab5-7795-4841-b885-fb4c10a888d9",
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
                    "id": "0f82fb63-d4a7-43a7-82af-19a893672a4c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "bdfce19f-9238-41d3-afdd-d778b4f651da",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ca557d70-5713-44c8-ae88-6ef3fa7ae3ed",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "0e171afd-85f3-4b32-b9a2-a5e8803b8651",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "83f6c171-24de-4c1e-aec3-5f46f4c2a076",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "06b73257-3e80-462c-a54c-1431a09c9303",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "35653207-8d1e-4d3a-8e7c-5f1527a6ab47",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "ee823075-3c29-457f-b8e7-ce68358ccf81",
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
                    "id": "d6cf9230-7fce-4128-aea8-6707cebd39aa",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "59ab4095-79ba-48dd-8a83-2b9c8dd23b17",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6a1b2a37-9f5b-4c65-be97-44c08d900cb3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3c615759-7b57-4b08-a6a0-3cd40dd61e7b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "866de170-d578-45ee-a13d-6863d644c0f8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7a05c542-e57d-4ee6-be87-4d5386eaa41e",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3c615759-7b57-4b08-a6a0-3cd40dd61e7b",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "753f7ffb-1e8b-4a38-8a7e-dcd8e1b86b70",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2782fce9-2169-4d7b-a7df-413a44d95bd6",
                        "name": "messageChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0dd022ec-f842-49a8-85c2-90d9b913ce99",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "bd68e71c-ea41-4df6-ad91-96c53a83b5bb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "20984ac1-2bfd-4288-83cc-f9cfd095072e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1ac88009-3b92-46da-8742-a4d37ec0bbeb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "02ede0d5-c7f2-45b0-a340-9733f3c065c8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a5f49c8e-1c81-4949-9c5b-92d15b352957",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "636be54a-3745-4eb9-8342-563f39405cdb",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "48fe964e-3647-4275-8715-c00c4ea7aea9",
                        "color": "blue",
                        "label": "Subject",
                        "value": "SUBJECT",
                        "position": 1
                      },
                      {
                        "id": "21110e08-8acc-430a-ba50-3808dde1a08a",
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
                    "id": "5cb5de04-e3b2-42c9-bd10-adaba0acf6f3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0eb380f1-0121-4463-a0ae-ba8ff8ddb717",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'email'",
                    "options": [
                      {
                        "id": "7716fdd6-b539-438b-8628-c4f1a85ad222",
                        "color": "green",
                        "label": "Email",
                        "value": "email",
                        "position": 0
                      },
                      {
                        "id": "02bbf06d-daaa-4d28-b8a8-76f6c6239425",
                        "color": "blue",
                        "label": "SMS",
                        "value": "sms",
                        "position": 1
                      }
                    ],
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
            "id": "753f7ffb-1e8b-4a38-8a7e-dcd8e1b86b70",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "691d9a33-dd6c-43eb-93f5-771e734872b5",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "6b9c4715-8efe-4709-b1d4-7abc18bfd624",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "cd66efe9-1404-4425-b9ad-7a7522f35306",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "a8cd3b79-49dc-4693-af10-deda635d0205"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "949371f2-9d0c-4a82-8257-0273ef39e99f",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "3aee003d-bdd3-4de8-923d-4a4b4899b8cb"
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
                    "id": "ea4fe3ee-67b7-4e3f-a232-4224e8efd738",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "691d9a33-dd6c-43eb-93f5-771e734872b5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7d37c9f0-8784-4776-abd1-cba447443973",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "75ecb84b-605b-42a2-9918-4a933d053c8e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b7abd16e-df4f-4583-a779-f571d3ae06a1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a8cd3b79-49dc-4693-af10-deda635d0205",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "567a2ac3-79df-4c1f-822b-66669b848b07",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b86df1ff-a4b3-4dd9-bb4e-63fc500ca6d6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b2051615-b713-4607-a546-ad28f94215f1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fa268e46-b8b5-484c-b422-ce14ef9ed873",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5aeec448-448e-48bf-8591-d88aa169fe1e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "753f7ffb-1e8b-4a38-8a7e-dcd8e1b86b70",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fa268e46-b8b5-484c-b422-ce14ef9ed873",
                        "name": "calendarChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b0678eb5-f8e9-42c3-b7b8-963d8724ec1e",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "01b4b49d-d908-48ea-84f0-179ca55f40cc",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3aee003d-bdd3-4de8-923d-4a4b4899b8cb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "4f03fa58-acf0-4f96-bdcf-cfa3f196fc63",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2782fce9-2169-4d7b-a7df-413a44d95bd6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "866de170-d578-45ee-a13d-6863d644c0f8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "753f7ffb-1e8b-4a38-8a7e-dcd8e1b86b70",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2782fce9-2169-4d7b-a7df-413a44d95bd6",
                        "name": "messageChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7a05c542-e57d-4ee6-be87-4d5386eaa41e",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3c615759-7b57-4b08-a6a0-3cd40dd61e7b",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "696b78a1-ea3f-46a8-9352-0d8e8cb714e4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bc24df17-e95b-437a-a8a9-dfde46bb2158",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "753f7ffb-1e8b-4a38-8a7e-dcd8e1b86b70",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "696b78a1-ea3f-46a8-9352-0d8e8cb714e4",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7367c4fc-0b58-4d57-b5b5-b379ee86a0aa",
                        "name": "connectedAccounts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3bfab740-dbd4-438d-82d7-2080a7e2da2f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "050782f2-17fa-4f40-be50-d01e3634491c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "74f83621-f1d1-41ff-ba14-7b8a245f7b33",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "e0484a4f-70a6-4dbd-80a1-aa962295c391",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "22561e41-5ce0-4ee6-af3f-64a1023207df",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_63953e5f88351922043480b8801",
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
                            "id": "8092f0e8-ae2b-4bfc-8422-ac698cfb433b",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "62692561-27d1-4cb9-9310-b947a65f717f"
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
                    "id": "24e33c4a-8171-4a85-a938-839a740b4f4a",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "547e8a08-09ca-48cd-9bc3-2769d12f453f",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "20408165-250b-44f8-b1e8-bc3fde0ac3b9"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "ecc1fe9b-5abb-49c5-8313-a693ddac5c07",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "c8ee66e3-3e75-48c0-841c-f3df71b6255b"
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEw"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ed6fef1f-6b90-43b6-9e9f-6312a441bad6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6a95e481-979a-4e25-8d5e-c49a025f80ee",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c8ee66e3-3e75-48c0-841c-f3df71b6255b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "20408165-250b-44f8-b1e8-bc3fde0ac3b9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "62692561-27d1-4cb9-9310-b947a65f717f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0e689459-aef3-4121-a7a8-6d2708d7c915",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "401d1b57-7141-4926-8706-bbef651949ad",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "74f83621-f1d1-41ff-ba14-7b8a245f7b33",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0e689459-aef3-4121-a7a8-6d2708d7c915",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2464d046-64cb-42bc-881d-0f2c1b6f462c",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "20d6d170-2a5a-4e81-8b52-ae01e445f4d2",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cfa1d29c-accb-44d6-a2c8-917419f08c9e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'INCOMING'",
                    "options": [
                      {
                        "id": "917e2812-50e9-48ad-a34b-27341d27882c",
                        "color": "green",
                        "label": "Incoming",
                        "value": "INCOMING",
                        "position": 0
                      },
                      {
                        "id": "dc378d3c-d951-4417-ac2b-9afcdec03b00",
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
                    "id": "c39fb477-470e-467c-ad36-b0f96adbba96",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f70a2fde-c1a6-407b-a93e-bf682c1e2aaf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f39dc730-0409-4894-8bee-f7ddb8c02947",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "74f83621-f1d1-41ff-ba14-7b8a245f7b33",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f70a2fde-c1a6-407b-a93e-bf682c1e2aaf",
                        "name": "messageChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7a05c542-e57d-4ee6-be87-4d5386eaa41e",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d01f688f-3bb6-4ee2-ab8d-abcf89105850",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e7b03409-5340-41e0-a2d2-c8077a57f924",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e0484a4f-70a6-4dbd-80a1-aa962295c391",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "6499915a-d7e1-4bc9-bf56-dbda95012532",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "bf852a79-5af3-47f8-a0ab-e0ae8dd11cfb",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
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
                    "id": "07cbb8a2-b6ae-4e96-b23a-6f11bcdd1d95",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "79073dbc-e134-4ed2-8a11-865232002081",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07df7df7-86d8-43db-927e-0c73bc2b9eda",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6499915a-d7e1-4bc9-bf56-dbda95012532",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "79073dbc-e134-4ed2-8a11-865232002081",
                        "name": "messages"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2464d046-64cb-42bc-881d-0f2c1b6f462c",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "81a88c76-dd6a-41cc-a2e2-6b4895108ff7",
                        "name": "messageThread"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "35ef156f-a743-447d-87f1-56a03399b9f5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1c60823f-cb00-4248-af59-afd350f0d902",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "bf852a79-5af3-47f8-a0ab-e0ae8dd11cfb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "5db2600f-08e2-4da3-bcf1-280e66181c2c",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "a296807a-78e7-433e-944b-58cd5e1aa5d2",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
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
                    "id": "2726339c-7444-4681-a681-9546f57faca2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "cd25eeb6-1d05-4e29-b298-e89587a33b10",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9be679f3-9aab-458e-b157-d2c32ba67a24",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a296807a-78e7-433e-944b-58cd5e1aa5d2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "94d76c56-5421-427a-8623-2a8a91d08924",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2513b488-c30e-4ee5-9a25-f3438f6be30e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ead0bfce-7a2b-4730-8523-713629d2907e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "4d666f4f-2169-4be4-aee8-13a6333942da",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "61e79933-cc98-49e4-8f95-3c4dfcc55714",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "f4b3d34e-82a9-4bfa-b87e-4b8e216c30d2",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "1da48820-048c-45f4-8c9d-f463d3237bb4"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d09ba80e-919d-4ee5-bbc7-afa574770e54",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "bff093ec-8b0d-4e4f-8570-2ee1f3736e69"
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
                    "id": "1a3d2ad2-2978-41f2-b1cb-d59f9936e0b6",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "f7553f26-51f5-4a7b-ae2e-4a9e42b8e5c3",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "9b41c34c-955f-4e7e-b08c-6a5a42d4814f"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "08c6a551-8915-4be8-851f-a431b7a617ca",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "bff093ec-8b0d-4e4f-8570-2ee1f3736e69"
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
                    "id": "80e6d31f-eb3f-4d71-be6d-4b9d40df008c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2a721d01-4dc8-4641-82c8-43b2516aef78",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "80e6d31f-eb3f-4d71-be6d-4b9d40df008c",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "51b09020-38a9-4037-ae2d-38263403db07",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1fe910c9-2c02-4595-a0cc-6487b6e07c58",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0fb3babc-fc7b-4f59-9da7-822bff22e24d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "96101761-0c71-4721-95a0-26b0d651bc52",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9b41c34c-955f-4e7e-b08c-6a5a42d4814f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "bff093ec-8b0d-4e4f-8570-2ee1f3736e69",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1fe21a15-4016-4157-a01a-cb8aa87b36bc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'NOT_STARTED'",
                    "options": [
                      {
                        "id": "58d1290f-abcb-4ceb-8d7b-dfcc53556646",
                        "color": "grey",
                        "label": "Not started",
                        "value": "NOT_STARTED",
                        "position": 0
                      },
                      {
                        "id": "f22a6091-b6ed-427c-b67e-7eb78a225039",
                        "color": "yellow",
                        "label": "Running",
                        "value": "RUNNING",
                        "position": 1
                      },
                      {
                        "id": "6d891ac0-5925-4b6a-9338-e267819ec268",
                        "color": "green",
                        "label": "Completed",
                        "value": "COMPLETED",
                        "position": 2
                      },
                      {
                        "id": "6b070a20-c267-46c0-a6cf-5fc99eac132a",
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
                    "id": "386c08f6-329b-45ea-913e-09a62db88d6b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "4d666f4f-2169-4be4-aee8-13a6333942da",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d42c834d-aed9-46c3-a30c-3ba57cc1b526",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "68621d3f-478f-495e-b4a9-bc730f6588fe",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1da48820-048c-45f4-8c9d-f463d3237bb4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "12356d18-5ef8-474c-8915-977ff47c3333",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b1632bdc-1c42-436d-a64e-3c5cb816b991",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ec9deb44-5963-4cfc-a986-4efd327dfa6d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c3cd5551-3054-4386-9afa-3fa99bce1d71",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ec9deb44-5963-4cfc-a986-4efd327dfa6d",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d6f6e735-1a37-4525-a37c-1e77e62b499f",
                        "name": "workflowRun"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9198046b-a09c-44c5-9838-dbe2947814d7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b15e5813-0e60-4a34-ba3a-0db6eb69e6e7",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9198046b-a09c-44c5-9838-dbe2947814d7",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "13796f4d-7b8d-4cdc-9b32-fa310f604696",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f9b24055-33cb-4976-b5a2-8f0a7d665249",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "20e840db-8737-4fa4-80f2-ded6da3d3655",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f9b24055-33cb-4976-b5a2-8f0a7d665249",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "41e6f0bc-d28c-4e97-80d2-ee05aa1eb685",
                        "name": "workflowRun"
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
            "id": "4a81a6d9-c484-4f31-9e0f-2d9a7782e109",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "be43106b-f8dc-4fcb-9724-38c11fc9e543",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7f3a6b73-92ad-4f1f-8b28-6ea155ca6ebe",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "92648643-095d-40cc-bc78-97111bbff0c2",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "a9488291-6192-4417-bdc2-a0a437ee24eb"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "77fbe7b9-0b8c-4618-8979-098366cbbf47",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "e57c3697-38f5-4805-a8f1-dcab7ce550e4"
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
                    "id": "be43106b-f8dc-4fcb-9724-38c11fc9e543",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "70284478-b207-4fe8-9e93-a529a1c9ba72",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fc382e68-bff7-4cd3-b07b-6ca1fca2ba55",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e57c3697-38f5-4805-a8f1-dcab7ce550e4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "aa0e0656-cad0-459d-9b79-2bc1ee930e7b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a9488291-6192-4417-bdc2-a0a437ee24eb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5b46d5d8-a2f2-4d42-a7bc-7d82a09cce2d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d86cb5a6-f6be-4f80-9ff5-42c7e61d8dad",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4a81a6d9-c484-4f31-9e0f-2d9a7782e109",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5b46d5d8-a2f2-4d42-a7bc-7d82a09cce2d",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "22b1101d-3c61-43d8-83d1-2e08da724169",
                        "name": "auditLogs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5e35701f-e9db-4f8e-9994-0c05dade39c0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5e49fd8a-7fe7-41fb-9122-0fb98b0895c6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "51f7c526-8af4-4035-a940-e69e69223c47",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6d21b6d5-07d0-4be1-97f0-3462a68c536c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5a43c243-508a-423b-aeea-4f063f7de7be",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "eeaa21a8-a753-48e2-93e9-aefdc032d30d",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "W",
            "isLabelSyncedWithName": false,
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
                    "id": "05e979d3-4a0e-483f-8743-86c38ae3a37f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "20d7db2a-cf29-4e9c-aa39-fd88c8966caf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3379347b-4920-462e-b2f6-977e4b6fca51",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "20d7db2a-cf29-4e9c-aa39-fd88c8966caf",
                        "name": "eventListeners"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3da89615-5f08-4997-96d6-b550fc7edc8c",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8d3e4c9c-7d6f-4e13-8d70-741962aa9109",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ddbdc3b2-aff8-4639-bae0-0f29669d2610",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "eeaa21a8-a753-48e2-93e9-aefdc032d30d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "51b09020-38a9-4037-ae2d-38263403db07",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2a721d01-4dc8-4641-82c8-43b2516aef78",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "51b09020-38a9-4037-ae2d-38263403db07",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "80e6d31f-eb3f-4d71-be6d-4b9d40df008c",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1105ca43-c8ef-4a40-b03a-e0db4d8fdc7c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "4d4d36f5-adbb-4971-8773-4d47c7526d31",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "96927c35-8d9e-4b48-8a41-28a14193c301",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4d4d36f5-adbb-4971-8773-4d47c7526d31",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b1defda7-f432-45af-b54b-5e70afc42ea5",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cb250a94-3b1a-486e-9237-de05805d07f3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ecb63ce6-0bc5-4f42-8736-1197004bdab2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9c8ac5b8-1c0c-48a3-bc40-11e340ab07cb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ecb63ce6-0bc5-4f42-8736-1197004bdab2",
                        "name": "versions"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0bc907ac-e3da-4764-923d-8c636dccec80",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "17342239-5916-4c90-897e-728ed781632b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c844cede-a824-4431-a9bf-1dc24649be37",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e396d5b2-7215-4e89-99de-a4bc8cd5c147",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ce57bc57-0f73-4a8d-9776-9eea4f15bf4d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e396d5b2-7215-4e89-99de-a4bc8cd5c147",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "74d3978a-6729-4885-93de-26a105ee699d",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "860806f2-9bf2-4210-a884-ffee68065c93",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "3da89615-5f08-4997-96d6-b550fc7edc8c",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "ca07ac97-cfc7-41b8-959c-62848aaefa5d",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9980ab80-8d32-4b08-b85e-1b46e0deeaab",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "3e91c39c-002c-41df-b514-932adeddcba1",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "57d214ce-7c5c-40a9-b9b5-a3401ca30656"
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
                    "id": "b18d7cd4-ae80-4403-881c-747599497351",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8d3e4c9c-7d6f-4e13-8d70-741962aa9109",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3379347b-4920-462e-b2f6-977e4b6fca51",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3da89615-5f08-4997-96d6-b550fc7edc8c",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8d3e4c9c-7d6f-4e13-8d70-741962aa9109",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "20d7db2a-cf29-4e9c-aa39-fd88c8966caf",
                        "name": "eventListeners"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e65fbf4e-84ad-4bc4-ae25-90dacbe02d38",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "57d214ce-7c5c-40a9-b9b5-a3401ca30656",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3d8754ff-c0a8-4dfe-b03c-7c845c0d0b63",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "97076d27-7b57-4c81-bb56-020c162ddb72",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ca07ac97-cfc7-41b8-959c-62848aaefa5d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "0700c982-9553-4d65-9199-9795f9f68027",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e8562fb5-caf8-4125-b5b4-e7c2c5c052a3",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_91e687ea21123af4e02c9a07a43",
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
                    "id": "f18cc79f-ff84-4a2a-9237-24da99519f19",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "2a65e489-183c-4eb8-92af-ed8aa5f416f3",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "824fd253-86bf-4250-b707-7eba0272ba15"
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
                    "id": "236dedfd-9e3f-46ef-ba2a-e9e6d44681b9",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "e109a15c-55b7-4473-a0c5-d20d14166533",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "cdbd9ddf-c629-4dd1-989b-ed1129f94700"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "c83504e1-2d29-4947-98c0-89166813599a",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "824fd253-86bf-4250-b707-7eba0272ba15"
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
                    "id": "3d67562f-38fa-454d-90bd-6eb3166bc31c",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "c8f2575d-34c7-4bc1-b6ad-7bbf616d2ec0",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "824fd253-86bf-4250-b707-7eba0272ba15"
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
                    "id": "83c314a3-dd86-4739-a6d1-9832a1940a3e",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "b6134708-80e5-43a0-b74c-0c816b82d96f",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "824fd253-86bf-4250-b707-7eba0272ba15"
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
                    "id": "e340d727-e0ac-405b-9a35-6c050d7de689",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "62f71ef5-3d91-4a38-806c-55c108003c11",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "824fd253-86bf-4250-b707-7eba0272ba15"
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
                    "id": "6dfbd18a-0d12-4d09-b369-df87658eeb05",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "08dcc534-f060-409d-826e-f5438e2ebce8",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "824fd253-86bf-4250-b707-7eba0272ba15"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "ae1c2562-ce15-4ca4-aabc-0c5c8b154f03",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "c0413bed-a7e1-4990-9a7f-d34d65f46eb1"
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
                    "id": "b9500e3c-cdde-4f6b-aba9-018d1910f00a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ff682e38-6b4c-4ef3-8b18-2330e8554a03",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b9500e3c-cdde-4f6b-aba9-018d1910f00a",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a3ff5227-0a58-4fc2-8c4b-1bcfa811cf08",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4792c859-bd30-49a4-879b-4c529a66655b",
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
                    "createdAt": "2024-10-28T09:49:21.498Z",
                    "updatedAt": "2024-10-28T09:49:21.498Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "684de211-70f4-44f1-8f0c-bb4f52f334b4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4792c859-bd30-49a4-879b-4c529a66655b",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "dcaff525-fa08-4197-b802-7f47bf7cb292",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9fc481e4-87ed-444a-bf06-4224210f8837",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a32e7621-f339-4f45-87c1-5078557c913c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1e17b7f5-a6a2-4e5f-a593-0e7eafb34ad7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8cd0c94f-ae34-4ad5-91df-7a814647e98a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ad5b1782-e2da-49f9-8627-f308cd9fa076",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8cd0c94f-ae34-4ad5-91df-7a814647e98a",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0920252e-9a61-4bd3-a912-f35f82527fc8",
                        "name": "authoredAttachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e945d0a0-a62c-469e-9ef8-42be21baa41f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7306733e-8cb2-43d9-b53e-bad497db981c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6a32dbae-6d07-4106-b19f-8b4f5c502e2a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "52a31d8b-6ae4-43d5-942f-ab7b493679d1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6a32dbae-6d07-4106-b19f-8b4f5c502e2a",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7dcac06b-3cbb-4ae3-b9fe-a693756a22cd",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "824fd253-86bf-4250-b707-7eba0272ba15",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b666be7f-f3fd-491a-9310-e09dc78f88c6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "cdbd9ddf-c629-4dd1-989b-ed1129f94700",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c0413bed-a7e1-4990-9a7f-d34d65f46eb1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e9db199f-d918-4431-a2d2-760ab6e5515b",
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
                    "createdAt": "2024-10-28T09:49:21.497Z",
                    "updatedAt": "2024-10-28T09:49:21.497Z",
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
                    "id": "635523d0-0bf3-470e-90d3-eba2bc5d576b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e8d39e9b-1071-4ac9-aaf8-bfb065427bb0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "635523d0-0bf3-470e-90d3-eba2bc5d576b",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c12fe6ac-f1d8-4790-ae62-c24619bf1a0d",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "91682786-6616-4b21-ae9e-18e9fee240ff",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8c871e46-a6bc-4a14-b48a-7e2231e7ddb9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "91682786-6616-4b21-ae9e-18e9fee240ff",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5928d611-50be-4733-8cb9-ed75f0b00454",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "329cb8eb-5d12-41b2-b644-6c6b2e95dc33",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9e03e325-045d-4bd7-b318-8e7eb1a23ec8",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2928a10e-0b38-4f92-890c-0ec94f041da2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "65f4b783-34c4-488d-ba31-4acaa1c1a195",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c098a218-fe85-4377-903d-9c110d505538",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f01b3377-ac15-486a-9f03-b564b843cd8c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c098a218-fe85-4377-903d-9c110d505538",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3f107718-3519-4238-8674-ebf4ecc9a76e",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eddd7d16-4a8a-48b5-a69f-b2b339200260",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a595c58f-d7e7-4786-9315-cb2a1a0f638d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eddd7d16-4a8a-48b5-a69f-b2b339200260",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9e34121a-6a68-4dbf-968a-9dc7b41f66a7",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0700c982-9553-4d65-9199-9795f9f68027",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "98f5e4d2-ed3b-4fbd-8b45-3fdf4660f638",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "N",
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4c2087f9-bbb2-4f81-8f3b-c5f86b047b64",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_f20de8d7fc74a405e4083051275",
                    "indexWhereClause": null,
                    "indexType": "GIN",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEy"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "98f5e4d2-ed3b-4fbd-8b45-3fdf4660f638",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7dcac06b-3cbb-4ae3-b9fe-a693756a22cd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "52a31d8b-6ae4-43d5-942f-ab7b493679d1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7dcac06b-3cbb-4ae3-b9fe-a693756a22cd",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6a32dbae-6d07-4106-b19f-8b4f5c502e2a",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3360618a-76b0-4079-85cf-8fa41324899c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0e2732fa-73a9-421d-9898-dffe993c2962",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "68ed4276-0bda-4976-a371-9e3d608063e6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0e2732fa-73a9-421d-9898-dffe993c2962",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "be3f9e9b-b401-482c-b7f7-1a6f63d3c148",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0d50f9a7-0129-4890-8e5b-ae192dd8c805",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dec819b7-0dc2-47df-af02-4ae56ec20ce2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0d50f9a7-0129-4890-8e5b-ae192dd8c805",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e3815b25-de00-4651-8a4b-41991e218f00",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fcf5953c-b22a-4da1-a654-6adfdfe09d12",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "421d51c5-dc74-44d4-bb2f-e9c4c381c718",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3f132667-8b21-4959-b3d5-4e7b131c3bfb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5b0a8a3d-2aa3-4531-bf46-5bedb0bf4c23",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a49afb2c-ba43-427b-9726-a7558931c97e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1150fdc9-47e9-4690-afb8-86658f47db4d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "24ead4a4-da37-4cf6-af77-ea5dcf42d4c7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1169ed0d-fe77-46aa-962c-6d74ad111369",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eb2a0645-678c-40bb-b606-764aee9064ec",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1169ed0d-fe77-46aa-962c-6d74ad111369",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c23010a0-d557-4b78-8e33-99c446ababe2",
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
            "id": "2464d046-64cb-42bc-881d-0f2c1b6f462c",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "4ad8c83f-48f0-49c0-a6ee-b9138f0626ad",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5f6f12dd-9daf-46ff-90b2-598f8ef7d855",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "92d4d463-383b-4698-a4a9-3b827d95bec2",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "6c26b44d-197e-4270-9bd4-8a6d934191cf"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "58d9f2a1-6a5a-419b-9102-d17536c779c9",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "846a3fa1-8f08-405c-8d30-d3d5c3eb1e39"
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
                    "id": "846a3fa1-8f08-405c-8d30-d3d5c3eb1e39",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1228b857-788c-4534-afca-c0cd838215ab",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "20d6d170-2a5a-4e81-8b52-ae01e445f4d2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "401d1b57-7141-4926-8706-bbef651949ad",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2464d046-64cb-42bc-881d-0f2c1b6f462c",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "20d6d170-2a5a-4e81-8b52-ae01e445f4d2",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "74f83621-f1d1-41ff-ba14-7b8a245f7b33",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0e689459-aef3-4121-a7a8-6d2708d7c915",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "289c4d15-0070-4d12-9a5b-536670877a19",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3714f031-da61-40c2-8500-c1de3a08bb66",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "4ad8c83f-48f0-49c0-a6ee-b9138f0626ad",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "07cbbd25-d033-47ee-8a31-7e37c102a4d4",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b60f2f7d-029f-4b48-b119-56995345abc5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2464d046-64cb-42bc-881d-0f2c1b6f462c",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "07cbbd25-d033-47ee-8a31-7e37c102a4d4",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d6ba01af-a2fd-4361-b10a-b7d899dcb63f",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "734e9c4d-0177-4950-9dbe-088c18e78949",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6c26b44d-197e-4270-9bd4-8a6d934191cf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "87c4b6f4-c45c-40d7-895b-3aa48d808159",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "014e586b-1a60-4e99-939e-9af823b8ffbe",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "81a88c76-dd6a-41cc-a2e2-6b4895108ff7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07df7df7-86d8-43db-927e-0c73bc2b9eda",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2464d046-64cb-42bc-881d-0f2c1b6f462c",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "81a88c76-dd6a-41cc-a2e2-6b4895108ff7",
                        "name": "messageThread"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6499915a-d7e1-4bc9-bf56-dbda95012532",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "79073dbc-e134-4ed2-8a11-865232002081",
                        "name": "messages"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "97251ee8-035a-4e64-aac6-b4ca43c5c9b2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "1f45dbdd-37f1-43d6-b128-c6befafb7733",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "bb89f33d-21b4-4f8e-a67e-6124914bfbc5",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "41aa80f9-02df-4c42-9213-8d9fe2d67f62",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "0fd6e53c-998a-4b91-b07a-ef8c2b2eeda7",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "06310097-b89b-4dc0-b566-df02bf5526a5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d5504c9b-eaed-48b5-9fdb-a228fdc0bfd9",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "8861239d-fc3d-4433-a048-5c07baef66c2"
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
                    "id": "0b2bf396-02e6-4553-b331-0be64c299523",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "06310097-b89b-4dc0-b566-df02bf5526a5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "3461f580-9cc2-48e2-8815-416810c1f921",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "bb89f33d-21b4-4f8e-a67e-6124914bfbc5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1740745d-bea8-484b-95ea-38c5e447cdcd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'Contains'",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ffc44538-48d7-4c74-8b0b-7b96ea0f5ee2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7d4fbdee-63c4-4392-9e21-a6f332553554",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5dbad373-0dab-4932-9bc3-cb4a57c90455",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "47a8dcb7-b48b-4679-a377-f716e5479895",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ff80ec00-bcad-4847-9666-5e8df8dae2c3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1f45dbdd-37f1-43d6-b128-c6befafb7733",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "47a8dcb7-b48b-4679-a377-f716e5479895",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8f3aebe9-9795-4667-8096-8215d1dd4158",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1417f75b-b529-4d06-8571-292f8e549fdd",
                        "name": "viewFilters"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e6e9e49b-be40-457f-b7e2-403fe21602bf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8861239d-fc3d-4433-a048-5c07baef66c2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "d8d314f0-930a-40c9-9d18-791b09c67c68",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
            "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "82428db9-e454-4421-b8f0-bb0a8b700228",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "O",
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f90b6c02-1032-4b41-96d8-66fe2962f245",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "960f81c3-d8de-454b-856c-93fd65f743d1",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "0489a929-bd99-4360-ad1d-d028a17faf2f"
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
                    "id": "312f2ba8-07c8-4a71-a29f-9b15ca319eaa",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "9033ce7e-11af-4234-b8bb-9a2071cc8332",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "7a6fd445-4374-4f09-84c1-10eb29709a23"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b10ba6a5-cbb7-4ca5-97c0-f5cf790492fb",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "9b0143af-217a-49b9-bfb0-f04fee823a71"
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
                    "id": "c8142c10-b193-4b13-b465-85d827bbc8da",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "23f409b8-0d74-4fd4-b169-202c97e2d190",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "f2621781-0e27-4004-9880-5f4a350e02b6"
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
                    "id": "fc4bc72d-ecdd-47e1-9ed5-7bf253633e2a",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "04875960-0333-434a-a384-a24d62a01a95",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "a979d66f-fd90-49b7-8a53-9e4364d17c7e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3f59e9c1-0ac5-4593-b41c-f10bbc2f380c",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "9b0143af-217a-49b9-bfb0-f04fee823a71"
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
                    "id": "7208a44d-4b4b-49c0-b1da-fa15b2f87feb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a675311d-eac8-40d1-b62b-12253871677d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0489a929-bd99-4360-ad1d-d028a17faf2f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f5f0d4ec-d724-4111-bac4-e634e19b7a69",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9b0143af-217a-49b9-bfb0-f04fee823a71",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a979d66f-fd90-49b7-8a53-9e4364d17c7e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b7690f3c-0644-44fb-87e0-8ba5c69a2cd5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eb4cfc95-21b4-4858-b01a-25df1649cc35",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b7690f3c-0644-44fb-87e0-8ba5c69a2cd5",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e922c1dc-c36b-4b65-84dc-6885104ad4e3",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5928d611-50be-4733-8cb9-ed75f0b00454",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8c871e46-a6bc-4a14-b48a-7e2231e7ddb9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5928d611-50be-4733-8cb9-ed75f0b00454",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "91682786-6616-4b21-ae9e-18e9fee240ff",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5397ed72-1150-47f6-b53f-99c18599065d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "92a730d1-8d90-4fe7-b757-ee4f6fab7dec",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0ae3438e-4f87-4dec-a83a-0b61b8b4b8fb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "81869026-ca67-406e-b120-1a6c9ff7e7bd",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0ae3438e-4f87-4dec-a83a-0b61b8b4b8fb",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "22c4e9ee-63a1-4b33-a4d5-d6540590a51f",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7a6fd445-4374-4f09-84c1-10eb29709a23",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": "'NEW'",
                    "options": [
                      {
                        "id": "30013151-7034-46cf-a821-cc74908aeec6",
                        "color": "red",
                        "label": "New",
                        "value": "NEW",
                        "position": 0
                      },
                      {
                        "id": "2092bfe7-282a-415b-a18a-8dd6e88e2a5c",
                        "color": "purple",
                        "label": "Screening",
                        "value": "SCREENING",
                        "position": 1
                      },
                      {
                        "id": "eea5ca70-4f13-4bd5-b5d3-bc97f39f7014",
                        "color": "sky",
                        "label": "Meeting",
                        "value": "MEETING",
                        "position": 2
                      },
                      {
                        "id": "9ed2ab61-f690-4cbd-b9b3-6fbfa6742465",
                        "color": "turquoise",
                        "label": "Proposal",
                        "value": "PROPOSAL",
                        "position": 3
                      },
                      {
                        "id": "c61ab829-fd88-4130-9bec-841a07b18623",
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
                    "id": "bb465431-c720-4a54-a821-946549398335",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4c7ae4bf-c9dd-42ce-b4e5-53204585eb4d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bb465431-c720-4a54-a821-946549398335",
                        "name": "pointOfContact"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fdea628a-0120-4fcb-bb39-a6f51bddd48f",
                        "name": "pointOfContactForOpportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de40ab29-ffb2-4446-8479-7c70568e80e9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "64bf036c-397f-4138-9ab4-64671651c2b2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "de40ab29-ffb2-4446-8479-7c70568e80e9",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "087b2978-3016-447c-a3bf-eadd5977e1cb",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3adc2a96-bf26-4f88-8b59-91aeff6edf01",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ff431c43-b3a1-4400-80de-6843bdf847bf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d1a60519-c0c7-421e-8a48-c7c9110b8bf3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ff431c43-b3a1-4400-80de-6843bdf847bf",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "96d29b00-ad69-413e-b8ea-19488246aa4f",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5e18b24e-c35f-4a6f-92e1-98e9c919acaf",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "231c6bb6-c8fd-4aeb-9f73-d1327996fa0a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5e18b24e-c35f-4a6f-92e1-98e9c919acaf",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "18edafef-b1cd-410a-80c2-f900516d5b21",
                        "name": "opportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f2621781-0e27-4004-9880-5f4a350e02b6",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "82428db9-e454-4421-b8f0-bb0a8b700228",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a102498f-0fb9-46b0-ac82-04a939e8825f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "592b8500-3c47-4142-8031-513f18eab0b9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a102498f-0fb9-46b0-ac82-04a939e8825f",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "85309644-37f5-4746-95fc-13e12e7b170e",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37be0d8d-91a4-437e-8283-042a5e6dd5e7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": {
                      "name": "''",
                      "source": "'MANUAL'"
                    },
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
            "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "8197919f-c83b-4ee4-9015-87d4afde7749",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "64145478-e7ef-40d1-8612-b6f263e7d81d",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "590731d7-9e9d-4d80-b23e-2143f04299c5",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "09ddbfd5-894e-475e-8205-659e429a01c3"
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
                    "id": "32e603e9-cde3-488f-8236-42c8723173de",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "385c3408-34f6-49e5-b0f7-9be55905fecc",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "09ddbfd5-894e-475e-8205-659e429a01c3"
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
                    "id": "91d7fa9c-343e-4a6a-9767-8642ac9aa7d2",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "65e5e523-c0b8-4399-b756-1c6ad145153d",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "fcbb6943-9ba0-4c0c-ba23-273c821fd6cc"
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
                    "id": "a11680de-9022-4a84-a211-67ecbfbe5fd3",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "519beda6-024b-4983-b960-a09ccc66e907",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "ba43bde7-590e-447b-968e-4c1fbe473ebd"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b07d54aa-96e0-473e-a60f-7a5be7b2e621",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "09ddbfd5-894e-475e-8205-659e429a01c3"
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
                    "id": "c85507a1-a1dd-4936-828a-083282c65e91",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "80600ee1-1085-40b3-94fa-9bbf7bdae303",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "20ccdfc4-9e0d-40f8-887a-cd6547f45608"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9bc875b8-67e6-470c-a7d4-887a7a9d62f3",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "09ddbfd5-894e-475e-8205-659e429a01c3"
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
                    "id": "03828c6d-2ab1-42e5-83ce-7b5e15bb5915",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "cc21eb24-a5f4-411a-8c1e-d08e9a1a22aa",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "5685d09c-bb0e-4b07-b2d2-7fb6954b7367"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "71fea341-6a81-4660-9fa6-89f8d6ea597a",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "09ddbfd5-894e-475e-8205-659e429a01c3"
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
                    "id": "e386f61e-6c27-490e-8881-f8828d7a9cb9",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "5e744214-6423-469b-b59a-5115afe7d31f",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "488470fd-85df-4057-85af-6169e21696c7"
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
                    "id": "5eb53b44-f72c-4678-a1a9-d985ce7f4ba4",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "459943b3-810a-4805-a791-fc3616e05065",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "80ebd941-bb1d-42d5-8322-acb01b54946b"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "17988a9d-d946-433c-b13a-a5a9cae8c417",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "09ddbfd5-894e-475e-8205-659e429a01c3"
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
                    "id": "9e61dedb-c544-4402-b712-cb2a354d4b7a",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "94572303-7bfc-4845-a7a4-528511086c43",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "09ddbfd5-894e-475e-8205-659e429a01c3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "dc6561ce-c67d-4b0f-857d-66afb8c1c250",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "e9bf850b-18ec-4efa-bc1d-f016a3c5c473"
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
                    "id": "e9bf850b-18ec-4efa-bc1d-f016a3c5c473",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8197919f-c83b-4ee4-9015-87d4afde7749",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0eaa26ac-5007-47b6-8e5e-aae25a1b6c6c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e55e4ce6-6bf1-4d3f-8c1c-1b74266bca71",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0eaa26ac-5007-47b6-8e5e-aae25a1b6c6c",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9caad004-2080-4017-b2db-5a3da930fe94",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fbfa4073-b7b4-4115-98a6-47ae907d7fb1",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6c61d047-5970-4e42-b537-2e86dab0b59d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "c23010a0-d557-4b78-8e33-99c446ababe2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eb2a0645-678c-40bb-b606-764aee9064ec",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c23010a0-d557-4b78-8e33-99c446ababe2",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2b9c8ba0-ced5-4957-834f-37a248e0de5e",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1169ed0d-fe77-46aa-962c-6d74ad111369",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f36b0b73-cbee-4fd0-b94f-c3e041194cb2",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "488470fd-85df-4057-85af-6169e21696c7",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "80ebd941-bb1d-42d5-8322-acb01b54946b",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "108bc411-e41b-43b7-a004-e3ffc449816e",
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
                    "createdAt": "2024-10-28T09:49:21.488Z",
                    "updatedAt": "2024-10-28T09:49:21.488Z",
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
                    "id": "a2b0393f-0c91-45bf-98d1-8c90ad1f0f7c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c0e2ac61-b2e0-4168-8898-7a4cd2bab336",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a2b0393f-0c91-45bf-98d1-8c90ad1f0f7c",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4f968348-7528-4e6c-a7da-d664e4250f8e",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e21060bf-f6ff-4ec0-b77a-39b2e1d8a7a0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d40c6458-4553-4991-9247-1b1aed03234e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e21060bf-f6ff-4ec0-b77a-39b2e1d8a7a0",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f7722121-0ff7-4f11-b7a0-4f0655a7d2e0",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0b00ba40-500c-4260-ac06-8bccb2bbb54c",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6c780eba-2558-4655-99d4-ab5fb452864c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5f6ca097-b7b6-4c8d-b9ea-c89114390770",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "e922c1dc-c36b-4b65-84dc-6885104ad4e3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eb4cfc95-21b4-4858-b01a-25df1649cc35",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e922c1dc-c36b-4b65-84dc-6885104ad4e3",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b7690f3c-0644-44fb-87e0-8ba5c69a2cd5",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b1defda7-f432-45af-b54b-5e70afc42ea5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "96927c35-8d9e-4b48-8a41-28a14193c301",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b1defda7-f432-45af-b54b-5e70afc42ea5",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "466596ea-a521-43b5-b4a6-ef8e862448e7",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4d4d36f5-adbb-4971-8773-4d47c7526d31",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "20ccdfc4-9e0d-40f8-887a-cd6547f45608",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "09ddbfd5-894e-475e-8205-659e429a01c3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "35018f16-5cba-49d9-b7ec-5e7ecd45fa62",
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
                    "createdAt": "2024-10-28T09:49:21.489Z",
                    "updatedAt": "2024-10-28T09:49:21.489Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3a997b67-5e24-4be0-8b12-1b019bd9f1b1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "35018f16-5cba-49d9-b7ec-5e7ecd45fa62",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "98e3c0b4-90cd-43eb-95c4-475dba53a403",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9eb733f3-a043-4c6f-97fe-6fd523301104",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fcbb6943-9ba0-4c0c-ba23-273c821fd6cc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "ba43bde7-590e-447b-968e-4c1fbe473ebd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "6d71128b-a8b8-4a13-9359-845c82727dfc",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "9bbcce56-634e-430d-83e0-3f6d242dc0de",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "61e05e92-091c-455c-a30c-f7aac4a38435",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8a0f4530-3530-432e-a719-f28410ece393",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f3f5fa9f-c49f-49a9-8ad7-008c59659826",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "312a9542-8737-4f92-851c-c4fcc9ba5ddf",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f3f5fa9f-c49f-49a9-8ad7-008c59659826",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f552f5b0-d1f2-41ce-98ad-3f22e4ffb74b",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ee897771-6fa3-4b58-a143-215cc9073876",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3fbd8aca-6152-4b81-a29b-9bf4032643cd",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "41e6f0bc-d28c-4e97-80d2-ee05aa1eb685",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "20e840db-8737-4fa4-80f2-ded6da3d3655",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "41e6f0bc-d28c-4e97-80d2-ee05aa1eb685",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4da13d65-4254-4e6f-8872-051f6285a75a",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f9b24055-33cb-4976-b5a2-8f0a7d665249",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5685d09c-bb0e-4b07-b2d2-7fb6954b7367",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "94217fdc-7905-43c5-9491-2cf16eb4ab1c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e79427d5-7e7b-4d3e-8a17-c95ca08607a0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "94217fdc-7905-43c5-9491-2cf16eb4ab1c",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "952a8757-56e7-4fac-be92-65216fce9efa",
                        "name": "timelineActivities"
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
            "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "fee1355b-6780-4843-a2d2-fa969ceb5072",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ab0e184e-9d2b-49bd-ad7c-c9e5b3aae554",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "834a03e2-a1c3-4313-ab1d-92bf774ef864",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "a9b40c1b-ba1e-4f37-bf84-e6bac9ff4e6e"
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
                    "id": "790e036e-c6b4-44f3-9d3b-ccc16bf54afb",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "name": "IDX_45db58e96a1bb9769a13a02c828",
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
                    "id": "d9713145-7052-4213-9392-9d6c66b49294",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "9461655f-171e-443f-b3e1-99c8d60305bc",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "60d44633-7543-4e78-afe3-ecd0d7c3c9c9"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e25688c0-bb42-4a02-a5df-063f599b05a5",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 1,
                            "fieldMetadataId": "a9b40c1b-ba1e-4f37-bf84-e6bac9ff4e6e"
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
                    "id": "55275c6f-2151-4a9a-9d71-4ec2ce9affff",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "dd149ae6-3dd8-473e-9b84-d4b0cd45a1e1",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "8afe7948-03f9-4a0a-9cd9-5a56942243a1"
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
                    "id": "4b485aa6-a01b-40eb-88a0-116645ab855d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3c82f79b-4aec-4eb5-8fcc-25e557d3879e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4b485aa6-a01b-40eb-88a0-116645ab855d",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2b1c0c80-38a3-4463-b864-7f8b5ead5501",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d01e31f9-0d69-45a4-9b09-e5f549492c35",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2410d24f-f02c-47e0-a640-6b0aef5649f1",
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
                    "createdAt": "2024-10-28T09:49:21.492Z",
                    "updatedAt": "2024-10-28T09:49:21.492Z",
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
                    "id": "728a005b-4e1e-425c-b050-d96f19a1894a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a9b40c1b-ba1e-4f37-bf84-e6bac9ff4e6e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "5c7f3820-e78a-4375-b0c8-c372d7da51e1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c7274687-5269-4947-be1c-368353f14a4c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5c7f3820-e78a-4375-b0c8-c372d7da51e1",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7bd3fe0e-adde-41d9-9307-7996f8392869",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5c070587-2985-4574-837a-32d3fcfb55db",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8ddb6a12-2ed8-4b5a-a6e4-08c51bd61679",
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
                    "createdAt": "2024-10-28T09:49:21.492Z",
                    "updatedAt": "2024-10-28T09:49:21.492Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dbef0980-3fab-42d5-9253-520f0c4257ab",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8ddb6a12-2ed8-4b5a-a6e4-08c51bd61679",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d2a4b529-1b49-4246-9bd8-833febc134f8",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eee4ab55-21fd-43ce-9a9f-a54a60589f88",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "85309644-37f5-4746-95fc-13e12e7b170e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "592b8500-3c47-4142-8031-513f18eab0b9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "85309644-37f5-4746-95fc-13e12e7b170e",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a102498f-0fb9-46b0-ac82-04a939e8825f",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08fd9873-d49e-4bc3-baaf-39895294ae9c",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "60d44633-7543-4e78-afe3-ecd0d7c3c9c9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fee1355b-6780-4843-a2d2-fa969ceb5072",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "8afe7948-03f9-4a0a-9cd9-5a56942243a1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "09417b26-fe5b-407a-8e63-4bf712a22f46",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c4e53d66-68c4-427d-91c4-8ebcf6893550",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "09417b26-fe5b-407a-8e63-4bf712a22f46",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8db190a6-9b5e-462c-bab6-e98a5b6bd7bc",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "922156b4-391c-41ce-882a-54caa525d620",
                        "name": "activityTargets"
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
            "id": "04527737-3f49-48dd-b40c-a87b65846900",
            "dataSourceId": "9a08d1cb-13e6-4a06-b5a6-d9b8562a48f6",
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
            "createdAt": "2024-10-28T09:49:17.452Z",
            "updatedAt": "2024-10-28T09:49:17.452Z",
            "labelIdentifierFieldMetadataId": "fdee9f12-1cc2-4e41-b9a2-e33fd6243eb3",
            "imageIdentifierFieldMetadataId": "f90cce42-d980-4611-8d81-d6797420f1ef",
            "shortcut": "P",
            "isLabelSyncedWithName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "b507a831-a382-4818-b531-c1bfd38478d9",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "0ccef8d5-73f1-46f9-b04e-9d0ef1b874f5",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "7770c4ac-38f1-4fa0-9b36-18a23da3ce20"
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
                    "id": "54a49df2-effe-4de8-bfc7-cb211eb5b0b2",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "478fe886-855e-4d32-9c4d-d6b8dc8f0a00",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "82546fdb-6354-42a0-9dbd-b278ddfa1557"
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
                    "id": "9798126c-7376-419c-93c1-6779942d8076",
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                            "id": "b8fad34d-b6ca-4bfa-b3aa-34cbc82a2907",
                            "createdAt": "2024-10-28T09:49:17.452Z",
                            "updatedAt": "2024-10-28T09:49:17.452Z",
                            "order": 0,
                            "fieldMetadataId": "6e945645-533a-4fac-8201-56f9e08b116a"
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
                    "id": "bf755e18-47b7-44dd-a5a4-768c1e0a45b0",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a689297a-db39-402c-9ca9-5cb8e7286137",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "95f77004-97da-485f-89d7-e9b74875d196",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a689297a-db39-402c-9ca9-5cb8e7286137",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "eb1c2d06-f7ef-4198-ba9d-10c4ddbd2f3e",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "11f09a46-c2b6-4ea7-9373-9806713ebe04",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5bae78cf-08c8-4127-9c78-09f4cd33a5c1",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "2c173d60-d8bb-4a32-8313-09fafade6406",
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
                    "createdAt": "2024-10-28T09:49:21.395Z",
                    "updatedAt": "2024-10-28T09:49:21.395Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "221fc823-c8d1-4ca2-87e9-6005e2e04db2",
                        "label": "1",
                        "value": "RATING_1",
                        "position": 0
                      },
                      {
                        "id": "7f3f3145-8234-4c5d-9a9c-df4af761a2a6",
                        "label": "2",
                        "value": "RATING_2",
                        "position": 1
                      },
                      {
                        "id": "568fdf0d-33f7-40b0-b137-b693fc5b58ec",
                        "label": "3",
                        "value": "RATING_3",
                        "position": 2
                      },
                      {
                        "id": "6140a2c6-55b8-4932-8ccc-09c9ffe0e1b8",
                        "label": "4",
                        "value": "RATING_4",
                        "position": 3
                      },
                      {
                        "id": "afcf6686-f8e3-4fab-a094-59005860e61f",
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
                    "id": "b7d688b6-da52-4903-a087-839ce027062e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "31272359-3bc5-4bf9-920b-e5f5f51f8545",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e63dc5b4-6190-4e5f-876d-2e5abb16d005",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "31272359-3bc5-4bf9-920b-e5f5f51f8545",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e2ef8f32-a884-41c7-83f9-ab8c95f16333",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b8f31678-f7a2-4051-8539-10d597072028",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6e945645-533a-4fac-8201-56f9e08b116a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b02734c9-e80f-443c-9a04-f3c1da602696",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "a398ac84-d96e-46db-a2b5-ce817d5de69e",
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
                    "createdAt": "2024-10-28T09:49:21.308Z",
                    "updatedAt": "2024-10-28T09:49:21.308Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "88767f7e-7ed9-4ab0-b336-ba33fb5081ec",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "d8ea2813-f35d-4621-b31f-7bef88960d0b",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "d3303939-ccbc-4f43-b034-38088e68e644",
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
                    "id": "56fd74bb-4df7-43b5-ae53-98ade097f076",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "0bf188a0-efbd-493e-8360-e38883284085",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ff5109a4-8699-41f0-98d0-287c45afdba6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0bf188a0-efbd-493e-8360-e38883284085",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e32ea8b8-5f81-4089-9bad-c8c89b79dd31",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fb3c7ba3-118e-467d-bc4a-47a9545bdef2",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e21a90e5-7619-4ceb-9cbf-3a7f91b720f3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fdea628a-0120-4fcb-bb39-a6f51bddd48f",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4c7ae4bf-c9dd-42ce-b4e5-53204585eb4d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fdea628a-0120-4fcb-bb39-a6f51bddd48f",
                        "name": "pointOfContactForOpportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1bf453f8-9a83-4a2a-9ccf-7b5025858a72",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bb465431-c720-4a54-a821-946549398335",
                        "name": "pointOfContact"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bf932e36-2fa3-435d-a649-c44a7478a62d",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "f90cce42-d980-4611-8d81-d6797420f1ef",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7770c4ac-38f1-4fa0-9b36-18a23da3ce20",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "1860acd1-533e-4139-a89f-d8bef201d2eb",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e4639f90-c85b-46d9-91f6-40162c20ec2f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1860acd1-533e-4139-a89f-d8bef201d2eb",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "85b2c25a-a7c0-4421-93ee-f3e73306408d",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d2e64a22-73cb-4864-8d9f-9d4bc9f41860",
                        "name": "people"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "82546fdb-6354-42a0-9dbd-b278ddfa1557",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "7bd3fe0e-adde-41d9-9307-7996f8392869",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c7274687-5269-4947-be1c-368353f14a4c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7bd3fe0e-adde-41d9-9307-7996f8392869",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "106e56ff-3c8f-43c5-b56c-579d12c36cbd",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5c7f3820-e78a-4375-b0c8-c372d7da51e1",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b8b845df-957f-447e-ac30-e49e4974bf49",
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
                    "createdAt": "2024-10-28T09:49:21.129Z",
                    "updatedAt": "2024-10-28T09:49:21.129Z",
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
                    "id": "4f968348-7528-4e6c-a7da-d664e4250f8e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c0e2ac61-b2e0-4168-8898-7a4cd2bab336",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4f968348-7528-4e6c-a7da-d664e4250f8e",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11246f2e-4aef-426d-8363-c20cfabb8ffe",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a2b0393f-0c91-45bf-98d1-8c90ad1f0f7c",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7b21179c-c83f-4953-8e83-4c9973a0a556",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fc61dce9-870d-4271-97cb-9ebb83d68e0a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fc67381c-e2de-407e-88d3-30937bd7a919",
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
                    "createdAt": "2024-10-28T09:49:21.217Z",
                    "updatedAt": "2024-10-28T09:49:21.217Z",
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
                    "id": "7d61ae90-a939-4f93-82c6-c8c2f5213a29",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "fdee9f12-1cc2-4e41-b9a2-e33fd6243eb3",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
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
                    "id": "b8660459-21af-4ed0-b5bc-54adebef7f8a",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b201913-53a1-454a-994f-2a1cb7e06375",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b8660459-21af-4ed0-b5bc-54adebef7f8a",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d6ba01af-a2fd-4361-b10a-b7d899dcb63f",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6aa79178-8caa-41bd-b18e-a7a38e98aa01",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3f107718-3519-4238-8674-ebf4ecc9a76e",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f01b3377-ac15-486a-9f03-b564b843cd8c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3f107718-3519-4238-8674-ebf4ecc9a76e",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2cb0c7bd-4722-48e9-9f55-6f7c3d2c10df",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c098a218-fe85-4377-903d-9c110d505538",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d23fe226-0ad7-46e4-8155-dd3ce98c10f5",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3072b070-09bc-4906-8535-e356e899ccd8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "04527737-3f49-48dd-b40c-a87b65846900",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d23fe226-0ad7-46e4-8155-dd3ce98c10f5",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7bf51998-d73a-41cb-aab1-740488180d1f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0840636a-659b-4efa-b0cb-7d360fba4695",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e066a657-65fb-4ddd-8289-1c56b29bc7e9",
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
                    "createdAt": "2024-10-28T09:49:17.452Z",
                    "updatedAt": "2024-10-28T09:49:17.452Z",
                    "defaultValue": {
                      "primaryLinkUrl": "''",
                      "secondaryLinks": null,
                      "primaryLinkLabel": "''"
                    },
                    "options": null,
                    "settings": null,
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

