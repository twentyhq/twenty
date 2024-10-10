import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
// ⚠️ WARNING ⚠️: Be sure to activate the workflow feature flag (IsWorkflowEnabled) before updating that mock.
export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery =
{
    "objects": {
      "__typename": "ObjectConnection",
      "pageInfo": {
        "__typename": "PageInfo",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
        "endCursor": "YXJyYXljb25uZWN0aW9uOjM3"
      },
      "edges": [
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "fcf67a5e-7542-441f-8d1f-e5eb772bfc43",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "28ce3df6-76ca-4589-b3b2-49d00d39cedc",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "6889de35-d675-424c-ac00-28f4bc91868c",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_9564690e029f3f186dff29c9c88",
                    "indexWhereClause": "\"deletedAt\" IS NULL",
                    "indexType": "BTREE",
                    "isUnique": true,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f1a1ede2-0d06-4b95-b541-5a47217ce2f9",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "d12d0f7b-6b5e-46dd-978d-5b575a5246b9"
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
                    "id": "20591aa7-8f57-4724-90b3-9e70c79a2d72",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "f3b32b85-b7e9-4431-ad12-60118d79371b",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "ec47b765-54e2-4548-a731-cad02976821d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a4f30899-7707-4f96-86fd-c3a4a40d0c5e",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "d12d0f7b-6b5e-46dd-978d-5b575a5246b9"
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
                    "id": "28ce3df6-76ca-4589-b3b2-49d00d39cedc",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5ded5927-3b13-4556-9462-bcd91ac8a6c5",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b2ed26fe-ec17-46f7-baa9-6a37f66a9434",
                    "type": "UUID",
                    "name": "fieldMetadataId",
                    "label": "Field Metadata Id",
                    "description": "View Sort target field",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d12d0f7b-6b5e-46dd-978d-5b575a5246b9",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View Sort related view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8ce72228-53f6-416b-b5f3-65212972b6d0",
                    "type": "TEXT",
                    "name": "direction",
                    "label": "Direction",
                    "description": "View Sort direction",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e7d47a1f-d076-422d-b0e6-10863f65a064",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "13cc13d8-dc2f-4aec-a5fb-e3cfdaab968e",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View Sort related view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b0ad182-a327-46dc-b0ca-ad82db3c04a0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcf67a5e-7542-441f-8d1f-e5eb772bfc43",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "13cc13d8-dc2f-4aec-a5fb-e3cfdaab968e",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e92c2801-2f4e-4cc8-a514-92db7cee62ae",
                        "name": "viewSorts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec47b765-54e2-4548-a731-cad02976821d",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "fbe30229-d7ed-4a7d-8f9c-9c12e4cb5a9a",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "b131a8c1-6c95-40cb-abd3-4a15a4ad3802",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "778e72a6-3683-4ae7-9f3f-41bc957ed6b4",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "0b5b65d8-e2d7-4f0a-b93b-b220a2021d2d",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6ec1183f-087f-41a4-9ec4-8b00aa5c25ff"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e36a6256-db5f-488e-a9c4-65792f9d0132",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "bd93110e-b281-4a48-8017-aed6ca96aeee"
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
                    "id": "e5a20914-2ed0-41c6-8c9f-46ad438edff9",
                    "type": "SELECT",
                    "name": "contactAutoCreationPolicy",
                    "label": "Contact auto creation policy",
                    "description": "Automatically create records for people you participated with in an event.",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                    "options": [
                      {
                        "id": "1a7eca4c-5362-41c9-8951-a1397cc6f959",
                        "color": "green",
                        "label": "As Participant and Organizer",
                        "value": "AS_PARTICIPANT_AND_ORGANIZER",
                        "position": 0
                      },
                      {
                        "id": "cf474b3e-2b4e-4098-b7e3-f5f03ebe72dc",
                        "color": "orange",
                        "label": "As Participant",
                        "value": "AS_PARTICIPANT",
                        "position": 1
                      },
                      {
                        "id": "9651c9da-3850-486b-8fc0-b660f51d49bf",
                        "color": "blue",
                        "label": "As Organizer",
                        "value": "AS_ORGANIZER",
                        "position": 2
                      },
                      {
                        "id": "0244acf3-02b2-4413-bcca-58d4da363725",
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
                    "id": "ed93c333-8763-4169-8cfe-8a58c8f1b343",
                    "type": "RELATION",
                    "name": "calendarChannelEventAssociations",
                    "label": "Calendar Channel Event Associations",
                    "description": "Calendar Channel Event Associations",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4752f9f1-bb95-40d9-b74b-5bd89b7e03f2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fbe30229-d7ed-4a7d-8f9c-9c12e4cb5a9a",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ed93c333-8763-4169-8cfe-8a58c8f1b343",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3079242e-d743-40e3-a308-4ec9a802b798",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b35edc28-b3fc-47f7-a2e0-66415eb73ae3",
                        "name": "calendarChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fd050dee-68fd-4f7b-87f2-e70883811e6d",
                    "type": "BOOLEAN",
                    "name": "isSyncEnabled",
                    "label": "Is Sync Enabled",
                    "description": "Is Sync Enabled",
                    "icon": "IconRefresh",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "2c6170dc-142e-4794-a1bd-6fb735163633",
                    "type": "DATE_TIME",
                    "name": "syncStageStartedAt",
                    "label": "Sync stage started at",
                    "description": "Sync stage started at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b131a8c1-6c95-40cb-abd3-4a15a4ad3802",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "13ecb5cc-a3ab-4b15-80a0-0a4092cfbeb3",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "405e6dbf-b007-41b7-be92-4678be2e287a",
                    "type": "TEXT",
                    "name": "syncCursor",
                    "label": "Sync Cursor",
                    "description": "Sync Cursor. Used for syncing events from the calendar provider",
                    "icon": "IconReload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a07da64b-b1b6-4950-a0c6-6c4162863e2e",
                    "type": "NUMBER",
                    "name": "throttleFailureCount",
                    "label": "Throttle Failure Count",
                    "description": "Throttle Failure Count",
                    "icon": "IconX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "373148b5-5c76-43e4-a470-1d809489e909",
                    "type": "SELECT",
                    "name": "visibility",
                    "label": "Visibility",
                    "description": "Visibility",
                    "icon": "IconEyeglass",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "a61999d1-b2ab-4a5b-936b-28be637110e3",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "09936cba-8c67-4999-8a8e-3cc61d7ba16b",
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
                    "id": "6ec1183f-087f-41a4-9ec4-8b00aa5c25ff",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "2d7673b7-2001-44b2-ba7b-cda5d0b433ec",
                    "type": "RELATION",
                    "name": "connectedAccount",
                    "label": "Connected Account",
                    "description": "Connected Account",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e590dec6-9848-443a-80c9-63bc89a4ae41",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fbe30229-d7ed-4a7d-8f9c-9c12e4cb5a9a",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2d7673b7-2001-44b2-ba7b-cda5d0b433ec",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c50305ed-cb52-433f-9c6a-571990fce400",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cbc2374b-bd0a-4189-a99c-d17533ae009f",
                        "name": "calendarChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de2989dc-62c2-4814-9ece-b4cb52364c58",
                    "type": "SELECT",
                    "name": "syncStatus",
                    "label": "Sync status",
                    "description": "Sync status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "9d71e14f-a90f-4602-80cd-021e421294a6",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "7a9fdf8a-d73b-41c9-872d-5cd38d37ee72",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "435e1682-1320-4dde-8af6-df2081233301",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "961a01b1-718a-48e5-b4f3-3a5dba8c97e6",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "aabb0e92-fe8a-49c1-85e1-457b3b0f09d8",
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
                    "id": "2567f0d8-2974-405a-b922-bb675475262b",
                    "type": "SELECT",
                    "name": "syncStage",
                    "label": "Sync stage",
                    "description": "Sync stage",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "ca588b79-465a-484b-9e1c-fb2147310d7c",
                        "color": "blue",
                        "label": "Full calendar event list fetch pending",
                        "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "a14b20c2-036d-4b24-89e5-db6cd0eed8de",
                        "color": "blue",
                        "label": "Partial calendar event list fetch pending",
                        "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "22182450-c5d5-4859-8499-1a84c4c68d11",
                        "color": "orange",
                        "label": "Calendar event list fetch ongoing",
                        "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "a91c2e05-c9a0-45af-976b-d062922b9d04",
                        "color": "blue",
                        "label": "Calendar events import pending",
                        "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "12ff90a8-b328-4f5a-a9eb-004c822d36cf",
                        "color": "orange",
                        "label": "Calendar events import ongoing",
                        "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "1212570f-1410-4f0f-87c2-a050b2785206",
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
                    "id": "38731b72-1705-4074-a1ef-fd2c4faf8bc1",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "03332be7-e758-4e3e-a13c-c228806a5774",
                    "type": "DATE_TIME",
                    "name": "syncedAt",
                    "label": "Last sync date",
                    "description": "Last sync date",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5c38e161-7ecf-42a1-a5ef-0c684b8158e7",
                    "type": "BOOLEAN",
                    "name": "isContactAutoCreationEnabled",
                    "label": "Is Contact Auto Creation Enabled",
                    "description": "Is Contact Auto Creation Enabled",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "bd93110e-b281-4a48-8017-aed6ca96aeee",
                    "type": "UUID",
                    "name": "connectedAccountId",
                    "label": "Connected Account id (foreign key)",
                    "description": "Connected Account id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "03e181f9-4d68-4e59-92f3-af786949455e",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "2494a770-7e3c-49c7-a7be-8bef10b3736b",
            "imageIdentifierFieldMetadataId": null,
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec21cbc4-89bc-4baa-aae2-2102166be735",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the contact",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "34132629-ef7f-4d04-ab86-ee26e60b9538",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ec21cbc4-89bc-4baa-aae2-2102166be735",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "644f2b4e-4e93-4dab-8a8e-5e1425c3f056",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "720c2262-50e6-4882-8448-ec86f0a71340",
                    "type": "MULTI_SELECT",
                    "name": "statuses",
                    "label": "Statuses",
                    "description": "The current statuses of the workflow versions",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3f4fcd44-cb32-4375-8996-307042f4d45a",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Workflow record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5d9cefd3-ab9c-4d86-af26-7dc4bc6ac36d",
                    "type": "RELATION",
                    "name": "eventListeners",
                    "label": "Event Listeners",
                    "description": "Workflow event listeners linked to the workflow.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "61d64cbd-b235-4479-8a80-0a7f86982f0f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5d9cefd3-ab9c-4d86-af26-7dc4bc6ac36d",
                        "name": "eventListeners"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61d31abc-4d2c-4564-b93f-c48c35828bbe",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "31f59427-bc04-4bf4-a33b-c0209595ee23",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "90ef530a-9b4b-4ba5-bfa9-769d509a7ea5",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6fd7eec7-9b91-4f6f-b83a-355a6eb87b60",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3f0f2906-3d2a-4664-b781-cbe79ed27dde",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "16e76341-0dec-4add-a307-bd7f545f3edd",
                    "type": "RELATION",
                    "name": "runs",
                    "label": "Runs",
                    "description": "Workflow runs linked to the workflow.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "505e85a0-8554-4e6c-8570-df13ea7a8b7e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "16e76341-0dec-4add-a307-bd7f545f3edd",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d5e48c49-d306-4107-8715-d20f2e484eed",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e47fd4b6-da88-4930-9073-e67f886ddfa6",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1b3bcd98-321c-4240-82ec-ac66b1bf884d",
                    "type": "RELATION",
                    "name": "versions",
                    "label": "Versions",
                    "description": "Workflow versions linked to the workflow.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ecb54a5-05e5-4ed6-98a3-5d0ff5f354e6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1b3bcd98-321c-4240-82ec-ac66b1bf884d",
                        "name": "versions"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "89bd95ae-6215-4834-9bd0-871cfb20335a",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bf6407f0-67e9-42de-8086-178d7f68104f",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2494a770-7e3c-49c7-a7be-8bef10b3736b",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The workflow name",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7c23f6cf-4be7-4e0f-9bdf-88cd7128c10b",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "bd51f892-f9b4-4df1-9379-f939c04c1051",
                    "type": "TEXT",
                    "name": "lastPublishedVersionId",
                    "label": "Last published Version Id",
                    "description": "The workflow last published version id",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "c6bf9a58-65c6-4729-acec-783a51379d2c",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ff02d21f-a19c-4eac-9e16-42493a65a82c",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5f3e02ed-fc4b-476e-89b4-f3b48b790247",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "78bf2c3d-ad41-4826-b355-ce426a83d9bc",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "f4e76d5d-d955-4c2b-9ffb-9d37326abfce"
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
                    "id": "dd61a928-76dd-4828-b8d2-885dc66c9b32",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "d462f191-db69-4d60-8a79-b3c409229351",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "b6722de3-fe95-4372-b036-deda19b6a848"
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
                    "id": "b6419055-258c-4e50-8f48-253aabcfc508",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "a3ee442b-3687-4462-b8ea-61c99862eb8d",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "f4e76d5d-d955-4c2b-9ffb-9d37326abfce"
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
                    "id": "76e9daa5-1200-489f-95b8-70bc992c0809",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "5009be18-1815-4e80-b911-cc82719b822a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "f4e76d5d-d955-4c2b-9ffb-9d37326abfce"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "65f456fc-36df-446b-8836-b36bcbe5fead",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "3ba133ce-8a1b-444f-b772-cce88f70865e"
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
                    "id": "d327f66e-3541-44f6-ba76-666af3d00e05",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_30f969e0ec549acca94396d3efe",
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
                    "id": "06d38899-b7ba-4aea-8a3f-876ec9119126",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "c474ae69-0422-4944-a78e-310c72370a1c",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "a012a26e-3467-48e4-b607-315fcc3d8ef5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "807911c2-9e98-4a66-a319-dffc8eee2bce",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "f4e76d5d-d955-4c2b-9ffb-9d37326abfce"
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
                    "id": "18939408-0d01-4736-b9bf-be5c7ecdea71",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "Attachment opportunity",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dd05a326-14d5-41ff-8120-0bba1663105e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "18939408-0d01-4736-b9bf-be5c7ecdea71",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4eca7cd7-9d54-48ff-9de9-af0388a8a637",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c6bf9a58-65c6-4729-acec-783a51379d2c",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Attachment name",
                    "icon": "IconFileUpload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b447deea-334b-4964-92b8-49dbcf34fdff",
                    "type": "RELATION",
                    "name": "author",
                    "label": "Author",
                    "description": "Attachment author",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9f7d9955-d1ef-4310-ade2-6e39e18ac463",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b447deea-334b-4964-92b8-49dbcf34fdff",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d26af909-9e54-470e-bbe3-aea6551d8497",
                        "name": "authoredAttachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "406fe7af-c22a-4410-97a5-0b0897e768f3",
                    "type": "RELATION",
                    "name": "activity",
                    "label": "Activity",
                    "description": "Attachment activity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "03d17e51-cbbb-405b-b709-822d579f360e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "406fe7af-c22a-4410-97a5-0b0897e768f3",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0b73d2a3-92ba-4b7b-8d28-93456b551ca8",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3ba133ce-8a1b-444f-b772-cce88f70865e",
                    "type": "UUID",
                    "name": "activityId",
                    "label": "Activity id (foreign key)",
                    "description": "Attachment activity id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f46d2c4c-50d2-4a37-9d97-ed6673982ab7",
                    "type": "TEXT",
                    "name": "fullPath",
                    "label": "Full path",
                    "description": "Attachment full path",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "66699475-ef79-4904-9dcb-edd4ace47f9e",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "Attachment Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.856Z",
                    "updatedAt": "2024-10-10T10:10:43.856Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b41eafa1-7da0-47eb-a36f-b5eed5215edf",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "66699475-ef79-4904-9dcb-edd4ace47f9e",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f7a72394-cbab-43d1-9bdb-be441cc62810",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b6722de3-fe95-4372-b036-deda19b6a848",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Attachment person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f4e76d5d-d955-4c2b-9ffb-9d37326abfce",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1f03ad66-6712-478b-a48b-ec1f47f9bcaf",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7462e20b-46dd-43bf-8438-d909d3f3adb7",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "Attachment task id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "96aedc8e-0455-4bee-9f6f-c9479865af95",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a012a26e-3467-48e4-b607-315fcc3d8ef5",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "Attachment note id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "36c09b0a-1c51-4925-9200-841242402549",
                    "type": "UUID",
                    "name": "authorId",
                    "label": "Author id (foreign key)",
                    "description": "Attachment author id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e0ddec51-3ba5-46e1-b36c-6bb89daebb38",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "be29dab0-26a7-435f-aae3-eb38885e6cff",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "Attachment opportunity id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ca40d4a8-c008-4aae-b7da-6cd6a42ab7b6",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Attachment company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6834c19d-c26f-4833-9cdc-498de38555e0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ca40d4a8-c008-4aae-b7da-6cd6a42ab7b6",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4428b809-b5c5-48d6-afed-855da31fe792",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ff044e6a-662d-4c79-8a9a-e039522e4053",
                    "type": "TEXT",
                    "name": "type",
                    "label": "Type",
                    "description": "Attachment type",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1c36a660-13dc-4880-b413-9e1eb24c6b10",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Attachment person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "30794a7b-e54f-480f-93a8-7f48120ef3b6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1c36a660-13dc-4880-b413-9e1eb24c6b10",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e00f3755-56ee-498a-bae6-328a1936ca64",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e14c3ddd-a8c4-476d-87d2-087fac4779a7",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "Attachment task",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d269c8f-37b9-455a-9488-f61f800df2b0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e14c3ddd-a8c4-476d-87d2-087fac4779a7",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "303bd5ff-55bf-430b-9b81-84a42115934d",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fc23bd8e-0632-49f6-986a-91736b0afdba",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "Attachment note",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6c63eb07-5ba9-4799-b5e9-176275865f15",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fc23bd8e-0632-49f6-986a-91736b0afdba",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c6f5bb13-02f2-4b0b-a067-0f89a3d14a54",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c29223f9-a698-4b8b-b0aa-9cfd9638f290",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "Attachment Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.852Z",
                    "updatedAt": "2024-10-10T10:10:43.852Z",
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
                    "id": "b48e708a-e471-4897-a24b-a29575fb0caf",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Attachment company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "310a289f-b06a-41ec-bbf6-e69c43a22c42",
            "imageIdentifierFieldMetadataId": "9f6cbcbe-ecf5-4c4d-bb0d-d4ec02a11739",
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5e45d9bb-db0b-462a-a961-e5ed47437fe3",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_87914cd3ce963115f8cb943e2ac",
                    "indexWhereClause": "\"deletedAt\" IS NULL AND  \"emailsPrimaryEmail\" != ''",
                    "indexType": "BTREE",
                    "isUnique": true,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d08c8a17-a5d5-48ea-a19d-295cc765bcbb",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "4e04c524-05ac-4370-a46a-25424a2c3b4c"
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
                    "id": "a91bbe5a-1bdd-46da-b73c-3d147f149ca5",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "e12508b9-11f0-4771-b9dc-10a8c6fe1123",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "22eb127e-0fa6-4e59-b2ce-c41505d3d475"
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
                    "id": "2757667a-de90-48c6-90ee-b29c2c6a5520",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "4c99502f-aef7-4c01-9516-fe66c6046d59",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "d3efd206-47f5-4238-9005-558d5b019719"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "af9a7048-e7c2-41d3-85da-174ed62d0438",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "956985dc-4b0e-4661-bba9-2ddb836cb75c"
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
                    "id": "5f745803-d82b-472b-bc01-4cd3b368479d",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Contact’s company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c0ca545f-2f03-471b-a1d2-d535472e0563",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5f745803-d82b-472b-bc01-4cd3b368479d",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0521dfb9-bde4-4ecc-be46-44fa1f9b192c",
                        "name": "people"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e10a1544-00ae-43ad-bf33-f8036a561997",
                    "type": "LINKS",
                    "name": "linkedinLink",
                    "label": "Linkedin",
                    "description": "Contact’s Linkedin account",
                    "icon": "IconBrandLinkedin",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "4e04c524-05ac-4370-a46a-25424a2c3b4c",
                    "type": "EMAILS",
                    "name": "emails",
                    "label": "Emails",
                    "description": "Contact’s Emails",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "310a289f-b06a-41ec-bbf6-e69c43a22c42",
                    "type": "FULL_NAME",
                    "name": "name",
                    "label": "Name",
                    "description": "Contact’s name",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "822c7a46-b2d0-4201-bbc2-d77cf4d73b6a",
                    "type": "RELATION",
                    "name": "messageParticipants",
                    "label": "Message Participants",
                    "description": "Message Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "849b09fc-a42c-421d-b76c-b34c30deb651",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "822c7a46-b2d0-4201-bbc2-d77cf4d73b6a",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b47f4ecf-d8cc-4dab-acb3-ff52c476f306",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "89d460a1-cfb8-40f4-8bcf-1bcf6ab6bc1d",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8becea19-883d-49e4-bacc-8f18d1bd4aa6",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "192545ed-39c4-4fdd-94f3-cb11703673b3",
                    "type": "RATING",
                    "name": "performanceRating",
                    "label": "Performance Rating",
                    "description": "Person's Performance Rating",
                    "icon": "IconStars",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.513Z",
                    "updatedAt": "2024-10-10T10:10:43.513Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "1f51dd55-061d-46cc-aba6-f369340635a0",
                        "label": "1",
                        "value": "RATING_1",
                        "position": 0
                      },
                      {
                        "id": "17e1525f-6364-4c9e-a081-8f187bc3356b",
                        "label": "2",
                        "value": "RATING_2",
                        "position": 1
                      },
                      {
                        "id": "f1bef866-aceb-4b75-9290-4b14ecd3d795",
                        "label": "3",
                        "value": "RATING_3",
                        "position": 2
                      },
                      {
                        "id": "68a655d4-cbb9-40de-b493-fbc50a8d257f",
                        "label": "4",
                        "value": "RATING_4",
                        "position": 3
                      },
                      {
                        "id": "514f9f75-13d4-46a7-931d-cd7e9e6eba02",
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
                    "id": "35ae8069-7e08-4f46-92cb-dc980308d1c8",
                    "type": "PHONES",
                    "name": "whatsapp",
                    "label": "Whatsapp",
                    "description": "Contact's Whatsapp Number",
                    "icon": "IconBrandWhatsapp",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:43.040Z",
                    "updatedAt": "2024-10-10T10:10:43.040Z",
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
                    "id": "32032cb0-3e61-495b-a1f4-6fdab47b6efb",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the contact",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ea5b1ad0-e9a6-40e6-b1db-5d0e6f53e30a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "32032cb0-3e61-495b-a1f4-6fdab47b6efb",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "65684024-9b7f-4fad-9402-eab2668a2788",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f3e927e5-f307-41dc-9c11-65bd6e8f3412",
                    "type": "TEXT",
                    "name": "city",
                    "label": "City",
                    "description": "Contact’s city",
                    "icon": "IconMap",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fbf1ac7f-7763-4489-96d9-1476be46c343",
                    "type": "RELATION",
                    "name": "pointOfContactForOpportunities",
                    "label": "Linked Opportunities",
                    "description": "List of opportunities for which that person is the point of contact",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ed26f057-0da9-4327-87aa-b295591e27a0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fbf1ac7f-7763-4489-96d9-1476be46c343",
                        "name": "pointOfContactForOpportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c4dfccd3-db51-4462-96d6-0fde15dedef5",
                        "name": "pointOfContact"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b98feb12-3de4-493a-9bdc-d2eaf62c54a7",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d690ca53-e76e-4c7d-b11d-c9ee58d51b0d",
                    "type": "RELATION",
                    "name": "calendarEventParticipants",
                    "label": "Calendar Event Participants",
                    "description": "Calendar Event Participants",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d409c654-a378-431d-8687-3d8cb195b324",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d690ca53-e76e-4c7d-b11d-c9ee58d51b0d",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b763c893-db54-4b48-bafa-9a9011e983df",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ed536554-4ed6-4889-b6c5-87110383d0d8",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "22eb127e-0fa6-4e59-b2ce-c41505d3d475",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "615d7c0b-afec-4296-b3ec-380457bd7b8f",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Events",
                    "description": "Events linked to the person",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "712b602d-cc26-48ee-b275-6c63d3f3a2bb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "615d7c0b-afec-4296-b3ec-380457bd7b8f",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "da68a893-dded-4c0e-8b12-b3abe633db06",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "07c5184f-cd43-473e-9573-410cade7e908",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the contact",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "386131d5-bf89-41e8-a69f-0dc797a96b6d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "07c5184f-cd43-473e-9573-410cade7e908",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e9f004e4-b8d8-410d-83f0-88271072deab",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "94034d9f-b9a7-434a-aad8-68b2a4440e93",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the contact",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f6e2e187-ef3b-4a00-9c71-77ec8f0c3056",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "94034d9f-b9a7-434a-aad8-68b2a4440e93",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "05502bd5-0d47-451f-b5b2-b7b461b582ef",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f16bab5c-5a28-4961-a5e6-bc765fa530da",
                    "type": "PHONES",
                    "name": "phones",
                    "label": "Phones",
                    "description": "Contact’s phone numbers",
                    "icon": "IconPhone",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a303ea4b-7c76-4491-bf43-83e633d951e6",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Person record Position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e00f3755-56ee-498a-bae6-328a1936ca64",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments linked to the contact.",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "30794a7b-e54f-480f-93a8-7f48120ef3b6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e00f3755-56ee-498a-bae6-328a1936ca64",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1c36a660-13dc-4880-b413-9e1eb24c6b10",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "588265bf-e0be-407b-990f-46403df4963e",
                    "type": "TEXT",
                    "name": "intro",
                    "label": "Intro",
                    "description": "Contact's Intro",
                    "icon": "IconNote",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:42.791Z",
                    "updatedAt": "2024-10-10T10:10:42.791Z",
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
                    "id": "956985dc-4b0e-4661-bba9-2ddb836cb75c",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Contact’s company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9f6cbcbe-ecf5-4c4d-bb0d-d4ec02a11739",
                    "type": "TEXT",
                    "name": "avatarUrl",
                    "label": "Avatar",
                    "description": "Contact’s avatar",
                    "icon": "IconFileUpload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "bc6d0cfd-0ab9-4777-8929-b554b03c4f8b",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "48ea88fe-b537-4089-ba18-744300565ccf",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the contact",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "95b5170c-0636-4e78-b11c-6714291eed02",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "48ea88fe-b537-4089-ba18-744300565ccf",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d42bd54b-de2c-4890-a31e-b82be9fb5eb6",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b5bd2653-f7a7-4d5b-ac76-c7faf61b55ac",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "36e7e226-0014-4350-9447-4e52a7693a66",
                    "type": "LINKS",
                    "name": "xLink",
                    "label": "X",
                    "description": "Contact’s X/Twitter account",
                    "icon": "IconBrandX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f653c6b5-f4d7-4071-9e70-20a9f62b04cd",
                    "type": "TEXT",
                    "name": "jobTitle",
                    "label": "Job Title",
                    "description": "Contact’s job title",
                    "icon": "IconBriefcase",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f753741d-8f45-426f-8c75-c8088e6f8150",
                    "type": "MULTI_SELECT",
                    "name": "workPreference",
                    "label": "Work Preference",
                    "description": "Person's Work Preference",
                    "icon": "IconHome",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.272Z",
                    "updatedAt": "2024-10-10T10:10:43.272Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "4fa78096-ead8-4fb0-b4fa-780bf01e0637",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "0b9cf67e-f537-4b9d-8e89-6f2421a1efe9",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "ddb38992-0d1c-496e-9845-a4d5c69af144",
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
                    "id": "d3efd206-47f5-4238-9005-558d5b019719",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "d5e48c49-d306-4107-8715-d20f2e484eed",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
            "nameSingular": "workflowRun",
            "namePlural": "workflowRuns",
            "labelSingular": "Workflow Run",
            "labelPlural": "Workflow Runs",
            "description": "A workflow run",
            "icon": "IconHistory",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "ae7f5c78-873b-4f91-8e2e-db4e127e2fb8",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "206fe97c-b761-4c17-8431-777a708a19af",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "b21863d3-27b4-4334-a41e-a7e8b45e9a92",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "1bb62a19-3ea1-4bba-8405-fe9bbe56a791"
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
                    "id": "f129ec99-4451-4c8c-8c51-61804c414cff",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "bfe6fbc3-e60d-42b5-9274-b109eaed1aeb",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "d4022caa-d830-43de-9e79-c408b3d57f31"
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE0"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4d94d75f-26e2-4795-81ca-30d7239f8047",
                    "type": "DATE_TIME",
                    "name": "startedAt",
                    "label": "Workflow run started at",
                    "description": "Workflow run started at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f1376046-4f79-4beb-a63f-e692d6fa08a9",
                    "type": "UUID",
                    "name": "workflowVersionId",
                    "label": "Workflow version id (foreign key)",
                    "description": "Workflow version linked to the run. id foreign key",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "946b0d2d-b57e-4268-97cd-0a4846df50a9",
                    "type": "RELATION",
                    "name": "workflowVersion",
                    "label": "Workflow version",
                    "description": "Workflow version linked to the run.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c888d0c7-a407-49fa-bfa5-5bdf33845cf8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d5e48c49-d306-4107-8715-d20f2e484eed",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "946b0d2d-b57e-4268-97cd-0a4846df50a9",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "89bd95ae-6215-4834-9bd0-871cfb20335a",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f7492f09-f4e9-4f2b-9733-8aca7a0d03b3",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d7d106f5-2b92-4ad7-96c8-b2f1bcc961c2",
                    "type": "DATE_TIME",
                    "name": "endedAt",
                    "label": "Workflow run ended at",
                    "description": "Workflow run ended at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e47fd4b6-da88-4930-9073-e67f886ddfa6",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "Workflow linked to the run.",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "505e85a0-8554-4e6c-8570-df13ea7a8b7e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d5e48c49-d306-4107-8715-d20f2e484eed",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e47fd4b6-da88-4930-9073-e67f886ddfa6",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "16e76341-0dec-4add-a307-bd7f545f3edd",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e25eae62-6a1b-42ba-b146-45c1c518ecc7",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6efa90b3-60ec-4d7f-a9dd-495157535b20",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1bb62a19-3ea1-4bba-8405-fe9bbe56a791",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b404dd0f-a5ad-4d23-82bb-c472accf1dd4",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "bcf758fa-3de7-4326-b289-11ae9c1e2535",
                    "type": "SELECT",
                    "name": "status",
                    "label": "Workflow run status",
                    "description": "Workflow run status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'NOT_STARTED'",
                    "options": [
                      {
                        "id": "7fd34721-5817-4734-b677-79ecbd52730a",
                        "color": "grey",
                        "label": "Not started",
                        "value": "NOT_STARTED",
                        "position": 0
                      },
                      {
                        "id": "173e639f-843e-4845-ba54-ff0b88ae43ee",
                        "color": "yellow",
                        "label": "Running",
                        "value": "RUNNING",
                        "position": 1
                      },
                      {
                        "id": "0d8895a8-9108-4a42-8b44-6c615bbcff29",
                        "color": "green",
                        "label": "Completed",
                        "value": "COMPLETED",
                        "position": 2
                      },
                      {
                        "id": "b9f0c962-833d-4bb4-aa1a-fca8030c8251",
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
                    "id": "5cdaf7d6-9a54-48e7-a42d-2a25a9e62768",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Workflow run position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ae7f5c78-873b-4f91-8e2e-db4e127e2fb8",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Name of the workflow run",
                    "icon": "IconText",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b6ecee6d-d06a-4b93-9bfa-806737c46d4e",
                    "type": "RAW_JSON",
                    "name": "output",
                    "label": "Output",
                    "description": "Json object to provide output of the workflow run",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dd167eb5-f294-46e3-9355-19dd8dfd3ed2",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d4022caa-d830-43de-9e79-c408b3d57f31",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "Workflow linked to the run. id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "d110c026-327b-4536-8b47-8d9a6b2efe6c",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "f6609041-559f-4213-a3e6-6ddc8baeee85",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e08ec658-2353-4cfe-95c7-c553e6a5c763",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "f11e5809-2dc8-4fc4-b8cb-23a55b8a71a6",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "8ce55116-2f3b-468d-859e-44353616988b"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e5c696bf-7189-4e93-8161-4e71f0d47408",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "6e1c59bd-d066-4ddd-bb56-8f115c452b42"
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
                    "id": "6e1c59bd-d066-4ddd-bb56-8f115c452b42",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "WorkspaceMember id (foreign key)",
                    "description": "WorkspaceMember id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9b6fa89e-df67-4305-b307-c98c84bc2c9b",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c7465568-7c6b-48db-8637-2a2e5e13ba7c",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "95e970ca-55e4-4762-8630-9d8be73ce533",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "WorkspaceMember",
                    "description": "WorkspaceMember",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "587905a0-4b1b-4af9-ae29-ec2e45b9ae1a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d110c026-327b-4536-8b47-8d9a6b2efe6c",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "95e970ca-55e4-4762-8630-9d8be73ce533",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "907513f2-6204-4d25-ab6e-9cf1b721313a",
                        "name": "blocklist"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f6609041-559f-4213-a3e6-6ddc8baeee85",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dcc9fe92-e12b-415f-9ce4-da71d89b496c",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8ce55116-2f3b-468d-859e-44353616988b",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "c69856d0-9cb6-49f8-947e-73928dcef1aa",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "f21142fb-9877-4ea2-9d39-c246b86b4cad",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "660e6970-8c1e-4b27-abe4-dea8d44008f7",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "cb8bcea0-8006-432e-8e5d-d8bd7afbb10a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "3fd8d736-a59f-45dc-8ccc-8f1fce7e13f3"
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
                    "id": "10c99091-0144-4c05-97fe-7ca7f86a1227",
                    "type": "BOOLEAN",
                    "name": "excludeNonProfessionalEmails",
                    "label": "Exclude non professional emails",
                    "description": "Exclude non professional emails",
                    "icon": "IconBriefcase",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "946ffac2-083c-4e69-9136-3315c554ae78",
                    "type": "BOOLEAN",
                    "name": "isSyncEnabled",
                    "label": "Is Sync Enabled",
                    "description": "Is Sync Enabled",
                    "icon": "IconRefresh",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f21142fb-9877-4ea2-9d39-c246b86b4cad",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "4e803589-cd47-41a2-8a8a-08de42c62f68",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "2dbca2ab-2020-4330-9f95-0e56067a9f02",
                    "type": "BOOLEAN",
                    "name": "excludeGroupEmails",
                    "label": "Exclude group emails",
                    "description": "Exclude group emails",
                    "icon": "IconUsersGroup",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e4f798d4-da66-4a31-8f17-9ae0dcd8531d",
                    "type": "UUID",
                    "name": "connectedAccountId",
                    "label": "Connected Account id (foreign key)",
                    "description": "Connected Account id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3fd8d736-a59f-45dc-8ccc-8f1fce7e13f3",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "970e303a-26af-45fe-af80-273434a71403",
                    "type": "BOOLEAN",
                    "name": "isContactAutoCreationEnabled",
                    "label": "Is Contact Auto Creation Enabled",
                    "description": "Is Contact Auto Creation Enabled",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "964477c7-f825-47cf-a0b2-d21083d7427c",
                    "type": "SELECT",
                    "name": "syncStatus",
                    "label": "Sync status",
                    "description": "Sync status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "a7fbd3bb-f528-489b-8b67-95dd13bc2e8f",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "bdbb9b7b-3872-498b-8b15-e15379e72f6f",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "6abb5df1-a5bb-4a3f-b848-74f2b05506a6",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "0fcdb21a-ffca-4aee-825f-82c3419bd0d8",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "ecc4bac5-2074-4589-8d30-85bc4d96c6dc",
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
                    "id": "8aac9ad4-54fc-4bf1-9880-c700dd701a7a",
                    "type": "DATE_TIME",
                    "name": "syncStageStartedAt",
                    "label": "Sync stage started at",
                    "description": "Sync stage started at",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "476fdbd9-6ca3-4173-9a1b-45369d7f2afa",
                    "type": "NUMBER",
                    "name": "throttleFailureCount",
                    "label": "Throttle Failure Count",
                    "description": "Throttle Failure Count",
                    "icon": "IconX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8910781f-23f6-4cf2-ac05-4836d6bc4867",
                    "type": "DATE_TIME",
                    "name": "syncedAt",
                    "label": "Last sync date",
                    "description": "Last sync date",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "735c26dc-ce5c-496a-8d78-43576ea81564",
                    "type": "SELECT",
                    "name": "syncStage",
                    "label": "Sync stage",
                    "description": "Sync stage",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "db25acec-d72a-49b9-be93-af603538f7b7",
                        "color": "blue",
                        "label": "Full messages list fetch pending",
                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "c5e7e804-311e-4509-af84-03606da034c2",
                        "color": "blue",
                        "label": "Partial messages list fetch pending",
                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "a3775e4c-6007-4cf5-b270-15ce9c33ac75",
                        "color": "orange",
                        "label": "Messages list fetch ongoing",
                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "95df14f4-4b11-4dec-aebb-8fd1f346980c",
                        "color": "blue",
                        "label": "Messages import pending",
                        "value": "MESSAGES_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "8ff4c1b7-3058-4e60-97bb-88da8834095c",
                        "color": "orange",
                        "label": "Messages import ongoing",
                        "value": "MESSAGES_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "f19970ba-eb3d-43b7-a7f7-5ca1c070d01e",
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
                    "id": "35647194-cd60-49cc-b886-c05d149c170f",
                    "type": "SELECT",
                    "name": "type",
                    "label": "Type",
                    "description": "Channel Type",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'email'",
                    "options": [
                      {
                        "id": "c032a9da-1491-4c2f-974f-9d2566791d5a",
                        "color": "green",
                        "label": "Email",
                        "value": "email",
                        "position": 0
                      },
                      {
                        "id": "baf44c35-af09-4263-870a-32ad9c7462e3",
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
                    "id": "a6d9d6ec-755d-43ee-8b28-eaca1b470f5f",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "abf17270-65d3-4ba1-a684-333efd6b52f3",
                    "type": "SELECT",
                    "name": "visibility",
                    "label": "Visibility",
                    "description": "Visibility",
                    "icon": "IconEyeglass",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "48c89f54-10b4-462c-b03c-5c42370e210a",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "d27f86ae-30fa-48c0-a9ec-bf300c3d6b7f",
                        "color": "blue",
                        "label": "Subject",
                        "value": "SUBJECT",
                        "position": 1
                      },
                      {
                        "id": "4f56e13e-4047-409b-83a4-0bfa3910a453",
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
                    "id": "8f7c4c69-3a6e-496d-b4fa-02320efa0f45",
                    "type": "RELATION",
                    "name": "connectedAccount",
                    "label": "Connected Account",
                    "description": "Connected Account",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "018fb675-27d6-491e-a188-96496ed74f66",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c69856d0-9cb6-49f8-947e-73928dcef1aa",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8f7c4c69-3a6e-496d-b4fa-02320efa0f45",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c50305ed-cb52-433f-9c6a-571990fce400",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "21eb38fc-6df3-4167-bf17-fe85ef810d91",
                        "name": "messageChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8da2fe06-a283-4756-b196-8458cc1e1349",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1e83db22-7076-4b3e-b65b-8402d3805284",
                    "type": "RELATION",
                    "name": "messageChannelMessageAssociations",
                    "label": "Message Channel Association",
                    "description": "Messages from the channel.",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0847fe5d-a6d5-4e7c-9223-c2a49f5fa53c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c69856d0-9cb6-49f8-947e-73928dcef1aa",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1e83db22-7076-4b3e-b65b-8402d3805284",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "29e86006-3c57-4db1-a0db-edec0bf1ae96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8115efbd-d457-45f1-abe5-298fd078dbfe",
                        "name": "messageChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "841aff09-24a1-4850-823d-a50c8f5d8cbc",
                    "type": "SELECT",
                    "name": "contactAutoCreationPolicy",
                    "label": "Contact auto creation policy",
                    "description": "Automatically create People records when receiving or sending emails",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'SENT'",
                    "options": [
                      {
                        "id": "6f4f7c41-c649-4251-9ba7-f0a4c0eb73c5",
                        "color": "green",
                        "label": "Sent and Received",
                        "value": "SENT_AND_RECEIVED",
                        "position": 0
                      },
                      {
                        "id": "a8d7959d-6418-4f03-ae2b-409dd576391a",
                        "color": "blue",
                        "label": "Sent",
                        "value": "SENT",
                        "position": 1
                      },
                      {
                        "id": "9c581f95-ee2d-4fd4-aed6-e4a98da8b71f",
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
                    "id": "a2f1d016-7082-4f1f-af87-d5ac6a20e476",
                    "type": "TEXT",
                    "name": "syncCursor",
                    "label": "Last sync cursor",
                    "description": "Last sync cursor",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "c50305ed-cb52-433f-9c6a-571990fce400",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "6db54214-f24e-4501-828c-5ac5f7b3023b",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "60aa2504-a5d5-4b2b-ae6d-e22e2111b29d",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "2cd1bfa8-89cc-442e-9b48-9b5c74034020",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "68439873-16e4-4413-8bd8-e99a7ae50a0b"
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
                    "id": "73cf743c-923d-46df-8e11-3e78b88b3595",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ef613aa5-06d1-4fc9-a522-5e6816626609",
                    "type": "TEXT",
                    "name": "lastSyncHistoryId",
                    "label": "Last sync history ID",
                    "description": "Last sync history ID",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "4f3c2c91-e642-4857-81ef-3e4a847425a0",
                    "type": "DATE_TIME",
                    "name": "authFailedAt",
                    "label": "Auth failed at",
                    "description": "Auth failed at",
                    "icon": "IconX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ac6d3318-e885-49a6-bb6d-9ed9c665f9ee",
                    "type": "UUID",
                    "name": "accountOwnerId",
                    "label": "Account Owner id (foreign key)",
                    "description": "Account Owner id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6db54214-f24e-4501-828c-5ac5f7b3023b",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "handle",
                    "description": "The account handle (email, username, phone number, etc.)",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "16595555-f9bb-4502-b561-d08653fe5f59",
                    "type": "TEXT",
                    "name": "accessToken",
                    "label": "Access Token",
                    "description": "Messaging provider access token",
                    "icon": "IconKey",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "21eb38fc-6df3-4167-bf17-fe85ef810d91",
                    "type": "RELATION",
                    "name": "messageChannels",
                    "label": "Message Channels",
                    "description": "Message Channels",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "018fb675-27d6-491e-a188-96496ed74f66",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c50305ed-cb52-433f-9c6a-571990fce400",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "21eb38fc-6df3-4167-bf17-fe85ef810d91",
                        "name": "messageChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c69856d0-9cb6-49f8-947e-73928dcef1aa",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8f7c4c69-3a6e-496d-b4fa-02320efa0f45",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c1608a8d-4925-402b-9b77-50c4bcd919d2",
                    "type": "TEXT",
                    "name": "refreshToken",
                    "label": "Refresh Token",
                    "description": "Messaging provider refresh token",
                    "icon": "IconKey",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0209d4a4-aeaf-4eeb-b5fb-4f376f76dbdc",
                    "type": "ARRAY",
                    "name": "scopes",
                    "label": "Scopes",
                    "description": "Scopes",
                    "icon": "IconSettings",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f032e498-d21c-4f35-b362-d02f3bf9d482",
                    "type": "TEXT",
                    "name": "handleAliases",
                    "label": "Handle Aliases",
                    "description": "Handle Aliases",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "af83b685-6358-48fd-aecc-4f95ebefb30a",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7c6d6258-086d-4b85-a66c-a1526a7e6bf7",
                    "type": "TEXT",
                    "name": "provider",
                    "label": "provider",
                    "description": "The account provider",
                    "icon": "IconSettings",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "cbc2374b-bd0a-4189-a99c-d17533ae009f",
                    "type": "RELATION",
                    "name": "calendarChannels",
                    "label": "Calendar Channels",
                    "description": "Calendar Channels",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e590dec6-9848-443a-80c9-63bc89a4ae41",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c50305ed-cb52-433f-9c6a-571990fce400",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cbc2374b-bd0a-4189-a99c-d17533ae009f",
                        "name": "calendarChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fbe30229-d7ed-4a7d-8f9c-9c12e4cb5a9a",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2d7673b7-2001-44b2-ba7b-cda5d0b433ec",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d65e4fb3-9efd-4080-99a8-c71f4c05789f",
                    "type": "RELATION",
                    "name": "accountOwner",
                    "label": "Account Owner",
                    "description": "Account Owner",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "310efb99-b450-47f1-88a5-21d8305c2d3f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c50305ed-cb52-433f-9c6a-571990fce400",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d65e4fb3-9efd-4080-99a8-c71f4c05789f",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a12e4220-3abd-4632-9d01-d8eff3620aca",
                        "name": "connectedAccounts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "68439873-16e4-4413-8bd8-e99a7ae50a0b",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a4dd6088-5031-4888-9509-14431a225416",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "52d60758-a4f4-4cd6-a063-dac8ad78903b",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e5ed05ae-5f3b-4f35-9abb-9c48bbd20463",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "281eebde-0040-4aac-8180-5c40459e946b",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "185942ec-cfb8-44ee-8ad9-77cb01412866"
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
                    "id": "95bebf8f-1a82-499a-9207-a9c8bd91b173",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_2a32339058d0b6910b0834ddf81",
                    "indexWhereClause": "\"deletedAt\" IS NULL AND \"domainNamePrimaryLinkUrl\" != ''",
                    "indexType": "BTREE",
                    "isUnique": true,
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
                    "id": "8f87b387-83d6-408a-adfc-053db16854b2",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_fb1f4905546cfc6d70a971c76f7",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI4"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "34bb1458-560b-49bd-a956-0165b00d6963",
                    "type": "UUID",
                    "name": "accountOwnerId",
                    "label": "Account Owner id (foreign key)",
                    "description": "Your team member responsible for managing the company account id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "48b025a9-0127-447b-93f1-5be37e9f0e60",
                    "type": "LINKS",
                    "name": "xLink",
                    "label": "X",
                    "description": "The company Twitter/X account",
                    "icon": "IconBrandX",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8df4cc6e-4b3b-42ca-b823-de4ff38e77bc",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the company",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a460b300-81f5-4a2b-b3fd-367fa13b2689",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8df4cc6e-4b3b-42ca-b823-de4ff38e77bc",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4e90cb8a-6e79-41d3-9559-49283a6e576b",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "185942ec-cfb8-44ee-8ad9-77cb01412866",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "adc091de-588d-4d74-a46b-5284411525ed",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "4428b809-b5c5-48d6-afed-855da31fe792",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments linked to the company",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6834c19d-c26f-4833-9cdc-498de38555e0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4428b809-b5c5-48d6-afed-855da31fe792",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ca40d4a8-c008-4aae-b7da-6cd6a42ab7b6",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6470e363-cfe4-491b-ad94-fae0610937af",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the company",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5e297614-7b54-4900-a899-aa0d624a5ba2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6470e363-cfe4-491b-ad94-fae0610937af",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "255f0939-a37e-49b1-b24d-bb73cdb608b7",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "374bbb13-5456-4fc3-9e32-547341392841",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f80317b9-005a-4952-a8d5-4742b5a658fa",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the company",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6eedbb9a-252d-4c04-9bfa-207b2dca0cb4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f80317b9-005a-4952-a8d5-4742b5a658fa",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a6901330-5460-4053-923a-de5b0f45a7cc",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "724d6849-b210-4e65-a988-90dedb71a6f6",
                    "type": "LINKS",
                    "name": "introVideo",
                    "label": "Intro Video",
                    "description": "Company's Intro Video",
                    "icon": "IconVideo",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:42.030Z",
                    "updatedAt": "2024-10-10T10:10:42.030Z",
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
                    "id": "0521dfb9-bde4-4ecc-be46-44fa1f9b192c",
                    "type": "RELATION",
                    "name": "people",
                    "label": "People",
                    "description": "People linked to the company.",
                    "icon": "IconUsers",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c0ca545f-2f03-471b-a1d2-d535472e0563",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0521dfb9-bde4-4ecc-be46-44fa1f9b192c",
                        "name": "people"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5f745803-d82b-472b-bc01-4cd3b368479d",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "590407af-4933-4fc3-bea0-dde56eda710d",
                    "type": "NUMBER",
                    "name": "employees",
                    "label": "Employees",
                    "description": "Number of employees in the company",
                    "icon": "IconUsers",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "85d12508-837a-48c6-b1bf-fc3078cedd77",
                    "type": "CURRENCY",
                    "name": "annualRecurringRevenue",
                    "label": "ARR",
                    "description": "Annual Recurring Revenue: The actual or estimated annual revenue of the company",
                    "icon": "IconMoneybag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "78a76f9e-0b46-4eb0-a97d-d189c8ca2396",
                    "type": "BOOLEAN",
                    "name": "visaSponsorship",
                    "label": "Visa Sponsorship",
                    "description": "Company's Visa Sponsorship Policy",
                    "icon": "IconBrandVisa",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:42.538Z",
                    "updatedAt": "2024-10-10T10:10:42.538Z",
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
                    "id": "36e3f45a-bfd6-42c9-a69d-8ef4e8f0a72f",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Company record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f6ea7bc6-b34f-4fc2-a6c7-522597c058ea",
                    "type": "TEXT",
                    "name": "tagline",
                    "label": "Tagline",
                    "description": "Company's Tagline",
                    "icon": "IconAdCircle",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:41.672Z",
                    "updatedAt": "2024-10-10T10:10:41.672Z",
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
                    "id": "4a8532e1-9f79-4b92-acb7-c7527184ce8e",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d9d10a0e-571d-4bc8-996b-082d2d89e1a2",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "10a88900-9f37-459c-bc05-c6125f2ee063",
                    "type": "RELATION",
                    "name": "opportunities",
                    "label": "Opportunities",
                    "description": "Opportunities linked to the company.",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e7c1a6b3-61ec-42bb-af19-1f31d1f3e928",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "10a88900-9f37-459c-bc05-c6125f2ee063",
                        "name": "opportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "99d6af13-43d9-40e0-8389-bd49214cc2e6",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "28af1f5a-64c3-41f0-adda-e4dd33c6e7e1",
                    "type": "ADDRESS",
                    "name": "address",
                    "label": "Address",
                    "description": "Address of the company",
                    "icon": "IconMap",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fee0bcfe-c787-4859-99fd-662d32eb0488",
                    "type": "LINKS",
                    "name": "linkedinLink",
                    "label": "Linkedin",
                    "description": "The company Linkedin account",
                    "icon": "IconBrandLinkedin",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b3eec79d-906a-4123-8abc-5ba5c35e4aef",
                    "type": "MULTI_SELECT",
                    "name": "workPolicy",
                    "label": "Work Policy",
                    "description": "Company's Work Policy",
                    "icon": "IconHome",
                    "isCustom": true,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:42.289Z",
                    "updatedAt": "2024-10-10T10:10:42.289Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "95381ede-9b90-4ee1-ac17-a489fcc25acd",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "e794ebee-4647-4197-b787-a3f349dcce1d",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "ca108562-89ed-4228-98fb-6711ddacfef4",
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
                    "id": "5bdc296c-dad9-41b0-90f9-f6006e07cfe1",
                    "type": "RELATION",
                    "name": "accountOwner",
                    "label": "Account Owner",
                    "description": "Your team member responsible for managing the company account",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7ffb5a2a-241f-4734-962c-6c26c087653b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5bdc296c-dad9-41b0-90f9-f6006e07cfe1",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "560d1ba4-34ad-4698-b196-32dc527cd5fc",
                        "name": "accountOwnerForCompanies"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9659de96-9bb5-49fe-98ff-a1463e8f5d5e",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a937672c-1dc1-4432-aa3e-ffcc755358d4",
                    "type": "BOOLEAN",
                    "name": "idealCustomerProfile",
                    "label": "ICP",
                    "description": "Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you",
                    "icon": "IconTarget",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "91b5c9d6-63ef-475a-9ef7-eff1d3b5a9ff",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the company",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0bf301ce-647d-44b3-b3d8-ad588ceb8e07",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "91b5c9d6-63ef-475a-9ef7-eff1d3b5a9ff",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "94619863-e0f8-444a-bdcc-bdcd8290a7e9",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "52d60758-a4f4-4cd6-a063-dac8ad78903b",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The company name",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d4aea8ed-1ca8-4afa-85cf-51781e6ca1ef",
                    "type": "LINKS",
                    "name": "domainName",
                    "label": "Domain Name",
                    "description": "The company website URL. We use this url to fetch the company icon",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3fc669ba-ec50-4e38-9180-2d7e71ea225e",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the company",
                    "icon": "IconIconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "893bb948-313d-4046-81aa-5ea5504e6c6c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3fc669ba-ec50-4e38-9180-2d7e71ea225e",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9c46aa1d-1d00-4126-89ae-19e49f2e84ca",
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
            "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "080e50db-9b7d-4d02-a437-7f0bbab5b647",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9cbc51e2-65d8-4f0f-8a46-53f51ad5ec7e",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_ee5298b25512b38b29390e084f7",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE1"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "528a69ea-45b7-465f-bc9f-695da2e798b8",
                    "type": "RICH_TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Task body",
                    "icon": "IconFilePencil",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ced7fdd9-ca1e-448b-973b-e88a3845f429",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0225e626-79ed-4ccf-af88-aca7c58a6934",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1e5f80b1-667a-4a0c-bd47-00cf13ac8da2",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Relations",
                    "description": "Task targets",
                    "icon": "IconArrowUpRight",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b5cd03ba-6964-453c-98f6-7eab5ccbd4df",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1e5f80b1-667a-4a0c-bd47-00cf13ac8da2",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d8060fac-4b47-46d0-a614-5ab801b3c4e6",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "080e50db-9b7d-4d02-a437-7f0bbab5b647",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Task title",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "feaf0f5e-a086-4d65-b321-e3c82907b59a",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the task",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6472763e-9107-42b5-bf2d-946fbe7002cf",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "feaf0f5e-a086-4d65-b321-e3c82907b59a",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e4648dbf-9715-486b-bcdc-6c76cfdca044",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9457be77-dd19-4237-8645-9bab4ffa5363",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the task.",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "14b81c03-ee47-4bb4-99fa-d24cec46c555",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9457be77-dd19-4237-8645-9bab4ffa5363",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "043c4255-54fd-417b-a068-8481cab74a9c",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "410e287d-76f9-41b4-a3e9-2ce0b493e6be",
                    "type": "DATE_TIME",
                    "name": "dueAt",
                    "label": "Due Date",
                    "description": "Task due date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "60565239-0b6c-4e65-a13b-30940705ea5d",
                    "type": "SELECT",
                    "name": "status",
                    "label": "Status",
                    "description": "Task status",
                    "icon": "IconCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'TODO'",
                    "options": [
                      {
                        "id": "ff871113-cb29-4770-9d8a-998cf15cfeca",
                        "color": "sky",
                        "label": "To do",
                        "value": "TODO",
                        "position": 0
                      },
                      {
                        "id": "89819c44-8254-494a-a235-69e76d854fe0",
                        "color": "purple",
                        "label": "In progress",
                        "value": "IN_PROGESS",
                        "position": 1
                      },
                      {
                        "id": "90ebebbe-6c76-44d0-b47d-ae6804ddef04",
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
                    "id": "b043b659-8ee2-4d73-af0c-8af9e0a192fd",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "303bd5ff-55bf-430b-9b81-84a42115934d",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Task attachments",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d269c8f-37b9-455a-9488-f61f800df2b0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "303bd5ff-55bf-430b-9b81-84a42115934d",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e14c3ddd-a8c4-476d-87d2-087fac4779a7",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d8808402-8017-4182-9311-758529282e33",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Task record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "662822a2-18f3-4e4a-a950-512ec8616191",
                    "type": "RELATION",
                    "name": "assignee",
                    "label": "Assignee",
                    "description": "Task assignee",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "653ef9e8-9041-43a8-860f-cefe5c7e7a9a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "662822a2-18f3-4e4a-a950-512ec8616191",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2963aae7-8a1d-45fc-9a17-7cb06779b674",
                        "name": "assignedTasks"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f01f1aab-038b-423f-b3f3-8026584c3024",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5f45b2fa-a999-40e0-a704-b435e5afbf5a",
                    "type": "UUID",
                    "name": "assigneeId",
                    "label": "Assignee id (foreign key)",
                    "description": "Task assignee id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "da899b6b-0783-4f0d-bf96-28e7bbfbe83c",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "b763c893-db54-4b48-bafa-9a9011e983df",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "b8583fac-10c9-4a88-9319-e1f26c111d65",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "33eb0c6b-b7be-4d3c-8a25-eb893aee9397",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "706b2dfa-55a5-4ad2-9e28-5e131cc28980",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "46145033-8038-4e39-8441-783a600663d6"
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
                    "id": "a3f48f32-2f0f-442e-bf83-aa76689cece5",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "20dfb2dd-8977-461d-9f7f-83474a31cd80",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "46145033-8038-4e39-8441-783a600663d6"
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
                    "id": "639ccd7b-818a-4c7e-ab20-5f01317f63e2",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "06dcb3ba-418d-496f-afca-2d44f4afdba0",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "46145033-8038-4e39-8441-783a600663d6"
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
                    "id": "5b3eeaee-d1da-48f4-815c-f9ce9453d6fc",
                    "type": "BOOLEAN",
                    "name": "isOrganizer",
                    "label": "Is Organizer",
                    "description": "Is Organizer",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ad97d989-bfb9-4c50-b251-faa2b85cd0e5",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9dd534f9-7db8-489c-9402-61cdd3f9fa97",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Workspace Member id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "98b971a8-e727-4d10-b423-988a714cac5a",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "08a5c778-9346-487b-a973-486f6a173c29",
                    "type": "RELATION",
                    "name": "calendarEvent",
                    "label": "Event ID",
                    "description": "Event ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "44e5902e-99ab-4112-9908-f4e361c9fecb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b763c893-db54-4b48-bafa-9a9011e983df",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "08a5c778-9346-487b-a973-486f6a173c29",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8ca22e34-05e4-4cf4-a720-8a8b3f340256",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "89b1660e-f738-48e6-aae8-89b3cb5c6b73",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b8583fac-10c9-4a88-9319-e1f26c111d65",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "46145033-8038-4e39-8441-783a600663d6",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e0e5e62e-cae0-46b2-ae18-0dcbd8b2eb5e",
                    "type": "TEXT",
                    "name": "displayName",
                    "label": "Display Name",
                    "description": "Display Name",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "84206153-cfad-4e5b-bda6-3869b7fefa6d",
                    "type": "SELECT",
                    "name": "responseStatus",
                    "label": "Response Status",
                    "description": "Response Status",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'NEEDS_ACTION'",
                    "options": [
                      {
                        "id": "69745043-cd6b-4fb2-b142-0466b00f6b83",
                        "color": "orange",
                        "label": "Needs Action",
                        "value": "NEEDS_ACTION",
                        "position": 0
                      },
                      {
                        "id": "199cd72b-5f1a-40ce-8c09-cc6e4924715f",
                        "color": "red",
                        "label": "Declined",
                        "value": "DECLINED",
                        "position": 1
                      },
                      {
                        "id": "7dd3f318-9c28-4ea0-8e62-1e3a34de108a",
                        "color": "yellow",
                        "label": "Tentative",
                        "value": "TENTATIVE",
                        "position": 2
                      },
                      {
                        "id": "846f981d-2d49-47b5-9be6-bef12a1444c0",
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
                    "id": "bec01164-379d-49dd-84cd-56fed48d5b47",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Workspace Member",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d4f72554-d396-440c-be8c-e724424ef6b1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b763c893-db54-4b48-bafa-9a9011e983df",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bec01164-379d-49dd-84cd-56fed48d5b47",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3acf8d2b-cf5c-49ec-8c07-d1176778aae5",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8e9e35e9-99cf-43bc-b0eb-b4dec68ce9f4",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "943adc28-cc59-426f-a343-bb092b228446",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8db041de-474c-4c33-a1bb-36f4d494e04d",
                    "type": "UUID",
                    "name": "calendarEventId",
                    "label": "Event ID id (foreign key)",
                    "description": "Event ID id foreign key",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ed536554-4ed6-4889-b6c5-87110383d0d8",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d409c654-a378-431d-8687-3d8cb195b324",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b763c893-db54-4b48-bafa-9a9011e983df",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ed536554-4ed6-4889-b6c5-87110383d0d8",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d690ca53-e76e-4c7d-b11d-c9ee58d51b0d",
                        "name": "calendarEventParticipants"
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
            "id": "b47f4ecf-d8cc-4dab-acb3-ff52c476f306",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "97badb5b-6ad5-4188-a072-50faa94b6e50",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "c9da5386-d1e0-4154-81c8-675a1b2bba79",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "b271d0b0-b9c3-4034-b48a-6da05450dd6c",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "b3784188-ebdd-4a80-8d9b-a4408252c1bd"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f52f8597-c684-4da9-aeaf-983404890229",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "d5507105-0d51-4f0b-95bd-5f3e1884dc5d"
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
                    "id": "244e06fc-0c4d-4d44-bd31-80ad25b87d53",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "f6ae1b01-9622-41bd-a346-0ef64095f69a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "d5507105-0d51-4f0b-95bd-5f3e1884dc5d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b263a05b-a2a0-48c1-8579-67e5b0e0babe",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "4dcb4581-f72e-4761-8827-85a15dd0bc71"
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
                    "id": "e181d3a7-4768-437a-a794-1cf9e38a8669",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "d3ebb2d3-47ac-48fd-a12c-dd0cd7d91b6f",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "d5507105-0d51-4f0b-95bd-5f3e1884dc5d"
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
                    "id": "f923e59f-739c-41ec-a4cb-c4adb9e005b0",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a55b34c4-89e1-4196-9220-c580b0bb5606",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b47f4ecf-d8cc-4dab-acb3-ff52c476f306",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f923e59f-739c-41ec-a4cb-c4adb9e005b0",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "633bbfac-7502-4eb3-91fa-8c845855c971",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d5507105-0d51-4f0b-95bd-5f3e1884dc5d",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "97badb5b-6ad5-4188-a072-50faa94b6e50",
                    "type": "TEXT",
                    "name": "handle",
                    "label": "Handle",
                    "description": "Handle",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "538fe05f-5d53-44b0-8b3c-462dde358bd2",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "921aac79-c62e-4f4c-b423-1cbc4ddde6c0",
                    "type": "SELECT",
                    "name": "role",
                    "label": "Role",
                    "description": "Role",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'from'",
                    "options": [
                      {
                        "id": "51f1d6b7-d7d1-4bfc-b5cd-6996b1004ef4",
                        "color": "green",
                        "label": "From",
                        "value": "from",
                        "position": 0
                      },
                      {
                        "id": "317310f5-a9d0-4d2d-b075-3d52a6c82312",
                        "color": "blue",
                        "label": "To",
                        "value": "to",
                        "position": 1
                      },
                      {
                        "id": "bd3f46c6-5f60-418c-9eea-0c5cc7009d4b",
                        "color": "orange",
                        "label": "Cc",
                        "value": "cc",
                        "position": 2
                      },
                      {
                        "id": "f92cc558-40bc-416f-811c-f666e4e7b009",
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
                    "id": "faac9620-995a-4129-ba48-d98ca7a5ac2f",
                    "type": "RELATION",
                    "name": "message",
                    "label": "Message",
                    "description": "Message",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c1f8778a-70f9-45df-b22c-47226c82293b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b47f4ecf-d8cc-4dab-acb3-ff52c476f306",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "faac9620-995a-4129-ba48-d98ca7a5ac2f",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1131b488-e2f9-4053-8723-f85bdfee4599",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b1a35bdf-8af7-4668-a137-fe22168ff254",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b3784188-ebdd-4a80-8d9b-a4408252c1bd",
                    "type": "UUID",
                    "name": "messageId",
                    "label": "Message id (foreign key)",
                    "description": "Message id foreign key",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "2209b7cc-99ad-4cc3-acca-6c61971d0cc5",
                    "type": "TEXT",
                    "name": "displayName",
                    "label": "Display Name",
                    "description": "Display Name",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "89d460a1-cfb8-40f4-8bcf-1bcf6ab6bc1d",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "849b09fc-a42c-421d-b76c-b34c30deb651",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b47f4ecf-d8cc-4dab-acb3-ff52c476f306",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "89d460a1-cfb8-40f4-8bcf-1bcf6ab6bc1d",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "822c7a46-b2d0-4201-bbc2-d77cf4d73b6a",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a0151625-4f82-4b6a-b319-1fbe806da982",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "4dcb4581-f72e-4761-8827-85a15dd0bc71",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "82a947aa-674e-418c-9a66-0c27928ee267",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "414b4f4f-a97a-415d-9cd8-629de83774e9",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "a313c797-df82-484c-9f83-d8fe33f45580",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "132a9495-fca0-4285-905f-c3dee23961f2",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "ebd072c5-872d-4c10-8475-67a469dcf25c",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "4dabf71a-ea79-4518-bf7a-7fbacdf1298d"
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
                    "id": "82262802-5ed0-48da-a8bf-6904724a3b99",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "4ea1c938-aa85-4f8b-8af2-0cead42b8a2a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "dbc28c44-c9c7-48b9-b810-debaa2eb506a"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "5610a4bd-4327-433a-9243-5964a515a5ff",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "cefdee0b-ffbc-46c5-b834-c799251b6a48"
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
                    "id": "5e9c6bf6-8bf9-493d-96a4-5d6e537b905c",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "59999433-d97e-42b8-af06-aa786224304a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "dbc28c44-c9c7-48b9-b810-debaa2eb506a"
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
                    "id": "44d220ac-0644-4ad5-9753-6dd5db62c6dd",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "fc79bb85-4c7b-4fb6-809a-b0deefb8ea41",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "dbc28c44-c9c7-48b9-b810-debaa2eb506a"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b51c4f6f-ae3a-4409-93e1-639ab44b826a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "8f46a79c-4cb0-4e8a-9fc3-ad39b224ec1d"
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
                    "id": "2d0178b0-8f1d-41e4-b748-beade6f2fc1a",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "NoteTarget Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.871Z",
                    "updatedAt": "2024-10-10T10:10:43.871Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cc092c29-9589-4bda-a62b-868e6df4204a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2d0178b0-8f1d-41e4-b748-beade6f2fc1a",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d6282065-b652-4e4e-902e-fd31af653e59",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f8be5b26-cbab-4624-8ddd-291e1fe6d800",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "NoteTarget opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d18220ef-e6b5-46aa-9a38-c0a93ddc0d0d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f8be5b26-cbab-4624-8ddd-291e1fe6d800",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "62cb5fc3-bfe1-48a1-b888-15c7957b8ff5",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "918d02f8-b9f1-483a-83c8-ba7a7f3537c3",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "NoteTarget Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.866Z",
                    "updatedAt": "2024-10-10T10:10:43.866Z",
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
                    "id": "d2eaf580-1be5-4c44-bc14-7fe4bf824cce",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "NoteTarget note id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a313c797-df82-484c-9f83-d8fe33f45580",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8f46a79c-4cb0-4e8a-9fc3-ad39b224ec1d",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "NoteTarget opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "cefdee0b-ffbc-46c5-b834-c799251b6a48",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "NoteTarget company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e9f004e4-b8d8-410d-83f0-88271072deab",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "NoteTarget person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "386131d5-bf89-41e8-a69f-0dc797a96b6d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e9f004e4-b8d8-410d-83f0-88271072deab",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "07c5184f-cd43-473e-9573-410cade7e908",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fc119ac3-d857-4471-8b3a-55df9b5e66a0",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "NoteTarget note",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "55b6d0dd-62c7-4608-b497-03d1a8fcce27",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fc119ac3-d857-4471-8b3a-55df9b5e66a0",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "11c55282-1105-4885-85fa-422e74f5ea41",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4dabf71a-ea79-4518-bf7a-7fbacdf1298d",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "NoteTarget person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a6901330-5460-4053-923a-de5b0f45a7cc",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "NoteTarget company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6eedbb9a-252d-4c04-9bfa-207b2dca0cb4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a6901330-5460-4053-923a-de5b0f45a7cc",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f80317b9-005a-4952-a8d5-4742b5a658fa",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dbc28c44-c9c7-48b9-b810-debaa2eb506a",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f9d51301-c8d8-4f6c-9161-06200b0e0dbd",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e59e1b1e-9032-4532-8fd3-3423ba3d41a8",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "9f8a7079-5cdd-4859-9e9b-2a0778b5c81d",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "b949adfb-086e-44b3-990b-a424fb8e91d8",
            "imageIdentifierFieldMetadataId": null,
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjU="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b7f09e21-9761-4e0c-bd83-de79371c27aa",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ce304976-1952-4a50-bcc7-da3dfa57c583",
                    "type": "RELATION",
                    "name": "messages",
                    "label": "Messages",
                    "description": "Messages from the thread.",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9eab65f8-3ac5-422c-90e6-bc80fe74dc91",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f8a7079-5cdd-4859-9e9b-2a0778b5c81d",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ce304976-1952-4a50-bcc7-da3dfa57c583",
                        "name": "messages"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1131b488-e2f9-4053-8723-f85bdfee4599",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0676a444-72f7-432a-9ba1-987bd8f180d2",
                        "name": "messageThread"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62fd6065-2acf-4f1f-bc9c-d3da8965c606",
                    "type": "RELATION",
                    "name": "subscribers",
                    "label": "Message Thread Subscribers",
                    "description": "Message Thread Subscribers",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "02bb6d86-d842-4c02-a232-5d0e8dc3b387",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f8a7079-5cdd-4859-9e9b-2a0778b5c81d",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "62fd6065-2acf-4f1f-bc9c-d3da8965c606",
                        "name": "subscribers"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "77dae991-af08-4495-a4d2-71a094a1b8a0",
                        "nameSingular": "messageThreadSubscriber",
                        "namePlural": "messageThreadSubscriber"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b897e2f4-f319-4467-a4d8-6a782b1ee7c2",
                        "name": "messageThread"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7e622c7c-08b2-4aa4-b67a-5a6f5bf667a6",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7507b2ec-137f-4f9a-b5a2-7e9d3170ca0f",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b949adfb-086e-44b3-990b-a424fb8e91d8",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "985fa076-d32c-433e-83ee-6bd78522e2c7",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
            "nameSingular": "apiKey",
            "namePlural": "apiKeys",
            "labelSingular": "Api Key",
            "labelPlural": "Api Keys",
            "description": "An api key",
            "icon": "IconRobot",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "21fa19af-aff5-496c-8da7-04edf5ff53b2",
            "imageIdentifierFieldMetadataId": null,
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
                    "id": "d8fbb1d8-ec51-4969-8591-4b884cb23a80",
                    "type": "DATE_TIME",
                    "name": "expiresAt",
                    "label": "Expiration date",
                    "description": "ApiKey expiration date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8739d4ed-0ee3-424a-b7fb-e79f526210cb",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d352910e-df52-4c74-800b-f834fb79078d",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f3a8ac6d-6847-42d7-8388-e1a4e291c314",
                    "type": "DATE_TIME",
                    "name": "revokedAt",
                    "label": "Revocation date",
                    "description": "ApiKey revocation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c8f55236-ac4a-4f1a-8f59-629fbdbae8d4",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "21fa19af-aff5-496c-8da7-04edf5ff53b2",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "ApiKey name",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "cd27e955-f142-4642-996d-1ad3a0a4b58b",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:43.769Z",
            "updatedAt": "2024-10-10T10:10:43.769Z",
            "labelIdentifierFieldMetadataId": null,
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "1b341dab-21ce-4b3b-b4df-d2d1fe332722",
                    "createdAt": "2024-10-10T10:10:43.946Z",
                    "updatedAt": "2024-10-10T10:10:43.946Z",
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
                            "id": "8e5fcdee-9c28-43ea-bfb2-9d468bd743d1",
                            "createdAt": "2024-10-10T10:10:43.946Z",
                            "updatedAt": "2024-10-10T10:10:43.946Z",
                            "order": 0,
                            "fieldMetadataId": "7ef215be-fb78-4fdf-a514-49d783f37e89"
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
                    "id": "52cc9eb1-a434-4612-b79b-21397f9c6883",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the Rocket",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.890Z",
                    "updatedAt": "2024-10-10T10:10:43.890Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "934db1fd-f237-4d82-9751-5b42d1bf28f4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "52cc9eb1-a434-4612-b79b-21397f9c6883",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "48b3f70e-ceb3-45f1-87b4-739eaca8a5ab",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7ef215be-fb78-4fdf-a514-49d783f37e89",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": null,
                    "isCustom": false,
                    "isActive": false,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.940Z",
                    "updatedAt": "2024-10-10T10:10:43.940Z",
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
                    "id": "1d7c2a23-513a-4d54-ac5a-53a95f466894",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:43.769Z",
                    "updatedAt": "2024-10-10T10:10:43.769Z",
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
                    "id": "42f8bf35-99f7-4a80-804d-9b20e39ba4c1",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the Rocket",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.814Z",
                    "updatedAt": "2024-10-10T10:10:43.814Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ffc752cb-1098-486a-9aa5-05ec26c552ef",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "42f8bf35-99f7-4a80-804d-9b20e39ba4c1",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "75b31579-ebe3-436a-9ce3-a5dc4098a6e2",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4918b79b-1fba-486d-89e3-ea7e9b7b5d48",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:43.769Z",
                    "updatedAt": "2024-10-10T10:10:43.769Z",
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
                    "id": "6e79a431-e003-4826-9bb8-6e57bcaa7e96",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:43.769Z",
                    "updatedAt": "2024-10-10T10:10:43.769Z",
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
                    "id": "e514740e-e163-426e-9774-faf4d20e4160",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities tied to the Rocket",
                    "icon": "IconIconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.789Z",
                    "updatedAt": "2024-10-10T10:10:43.789Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5d81a4f8-fd1a-405f-9417-ea46aa9408cb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e514740e-e163-426e-9774-faf4d20e4160",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cee15291-45a0-49b3-90aa-40cc6f9db3c0",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9eca85d1-b2e9-4ccd-b3b8-8d0c5e47b807",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:43.769Z",
                    "updatedAt": "2024-10-10T10:10:43.769Z",
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
                    "id": "4a66a2d1-4a38-4abe-af93-1a4fe5208807",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:43.769Z",
                    "updatedAt": "2024-10-10T10:10:43.769Z",
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
                    "id": "86c35ae8-9dbb-4453-b604-cb291c0878a3",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Deletion date",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.769Z",
                    "updatedAt": "2024-10-10T10:10:43.769Z",
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
                    "id": "d6282065-b652-4e4e-902e-fd31af653e59",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the Rocket",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.871Z",
                    "updatedAt": "2024-10-10T10:10:43.871Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cc092c29-9589-4bda-a62b-868e6df4204a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d6282065-b652-4e4e-902e-fd31af653e59",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2d0178b0-8f1d-41e4-b748-beade6f2fc1a",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a4642d67-ab79-4565-8b4d-1fa17e9455ab",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.769Z",
                    "updatedAt": "2024-10-10T10:10:43.769Z",
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
                    "id": "fa863d91-9bc8-4672-91db-af1c8741d5f7",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites tied to the Rocket",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.838Z",
                    "updatedAt": "2024-10-10T10:10:43.838Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "767ab10c-d41f-4964-811d-4602defa8dec",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fa863d91-9bc8-4672-91db-af1c8741d5f7",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "382e40c1-584e-4094-80e8-c7724727533e",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f7a72394-cbab-43d1-9bdb-be441cc62810",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments tied to the Rocket",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.856Z",
                    "updatedAt": "2024-10-10T10:10:43.856Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b41eafa1-7da0-47eb-a36f-b5eed5215edf",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f7a72394-cbab-43d1-9bdb-be441cc62810",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "66699475-ef79-4904-9dcb-edd4ace47f9e",
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
            "id": "8ca22e34-05e4-4cf4-a720-8a8b3f340256",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "0e444a1d-4479-4d88-9208-6af7bde5d3ba",
            "imageIdentifierFieldMetadataId": null,
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
                    "id": "2db4363a-6532-4f36-8452-bf564b03e3d7",
                    "type": "TEXT",
                    "name": "location",
                    "label": "Location",
                    "description": "Location",
                    "icon": "IconMapPin",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "89b1660e-f738-48e6-aae8-89b3cb5c6b73",
                    "type": "RELATION",
                    "name": "calendarEventParticipants",
                    "label": "Event Participants",
                    "description": "Event Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "44e5902e-99ab-4112-9908-f4e361c9fecb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8ca22e34-05e4-4cf4-a720-8a8b3f340256",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "89b1660e-f738-48e6-aae8-89b3cb5c6b73",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b763c893-db54-4b48-bafa-9a9011e983df",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "08a5c778-9346-487b-a973-486f6a173c29",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "71062d48-72da-45bb-8f95-e2b4f5e1ba9e",
                    "type": "DATE_TIME",
                    "name": "startsAt",
                    "label": "Start Date",
                    "description": "Start Date",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0e444a1d-4479-4d88-9208-6af7bde5d3ba",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Title",
                    "icon": "IconH1",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "33a34d36-f89b-46a1-aa8c-45b79c992b92",
                    "type": "RELATION",
                    "name": "calendarChannelEventAssociations",
                    "label": "Calendar Channel Event Associations",
                    "description": "Calendar Channel Event Associations",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cfc95e5b-588d-42c4-b935-e3fed40aa399",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8ca22e34-05e4-4cf4-a720-8a8b3f340256",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "33a34d36-f89b-46a1-aa8c-45b79c992b92",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3079242e-d743-40e3-a308-4ec9a802b798",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "beb73da7-788e-46f4-9a83-97c7d496fca6",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "364a79e6-3a38-4161-b750-95929c11baa0",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d334903a-553d-4320-ba07-60bdf8969c83",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9a762924-f174-4168-8905-068aa7d71844",
                    "type": "TEXT",
                    "name": "conferenceSolution",
                    "label": "Conference Solution",
                    "description": "Conference Solution",
                    "icon": "IconScreenShare",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e0ac7c71-fa6f-4b06-a4d5-6ee9fa058c80",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "60aab9bc-d65b-4466-b5d6-3f8498db5224",
                    "type": "TEXT",
                    "name": "iCalUID",
                    "label": "iCal UID",
                    "description": "iCal UID",
                    "icon": "IconKey",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1e13ebe8-b07d-44e5-a27a-e8df2e38129e",
                    "type": "DATE_TIME",
                    "name": "endsAt",
                    "label": "End Date",
                    "description": "End Date",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3043b90b-6464-45c3-be33-640826a4bda4",
                    "type": "BOOLEAN",
                    "name": "isCanceled",
                    "label": "Is canceled",
                    "description": "Is canceled",
                    "icon": "IconCalendarCancel",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e74db866-ceb1-47b4-bc29-93c0db297b3d",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9e7e78ac-1c74-474c-ab23-4408b2629e47",
                    "type": "DATE_TIME",
                    "name": "externalCreatedAt",
                    "label": "Creation DateTime",
                    "description": "Creation DateTime",
                    "icon": "IconCalendarPlus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "963c7d78-3658-4b9e-97fc-c004b2a4966b",
                    "type": "BOOLEAN",
                    "name": "isFullDay",
                    "label": "Is Full Day",
                    "description": "Is Full Day",
                    "icon": "Icon24Hours",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8143dfdc-805f-401c-8b8e-49f7ea91d71b",
                    "type": "TEXT",
                    "name": "description",
                    "label": "Description",
                    "description": "Description",
                    "icon": "IconFileDescription",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "90d62bf9-3c12-4a12-96cb-c96ffe3357b9",
                    "type": "DATE_TIME",
                    "name": "externalUpdatedAt",
                    "label": "Update DateTime",
                    "description": "Update DateTime",
                    "icon": "IconCalendarCog",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6f01a54d-0760-4c47-83ab-09e100133909",
                    "type": "LINKS",
                    "name": "conferenceLink",
                    "label": "Meet Link",
                    "description": "Meet Link",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
        },
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "89bd95ae-6215-4834-9bd0-871cfb20335a",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
            "nameSingular": "workflowVersion",
            "namePlural": "workflowVersions",
            "labelSingular": "Workflow Version",
            "labelPlural": "Workflow Versions",
            "description": "A workflow version",
            "icon": "IconVersions",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "66edf1af-24cf-4870-9fda-cd89c74bbade",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ea42ae2b-f33e-4feb-ab6b-fe9b4ce14212",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "0748f52c-e621-42ff-8778-cd19027b2457",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "ab47d660-21b9-4b38-b09e-ae84dc109dcd"
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
                    "id": "27942282-908a-4b07-9af5-b85c883a0e10",
                    "type": "RAW_JSON",
                    "name": "trigger",
                    "label": "Version trigger",
                    "description": "Json object to provide trigger",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a68de7e7-956a-4a55-98b1-dbe4c12ad5db",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f7492f09-f4e9-4f2b-9733-8aca7a0d03b3",
                    "type": "RELATION",
                    "name": "runs",
                    "label": "Runs",
                    "description": "Workflow runs linked to the version.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c888d0c7-a407-49fa-bfa5-5bdf33845cf8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "89bd95ae-6215-4834-9bd0-871cfb20335a",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f7492f09-f4e9-4f2b-9733-8aca7a0d03b3",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d5e48c49-d306-4107-8715-d20f2e484eed",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "946b0d2d-b57e-4268-97cd-0a4846df50a9",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e6279526-c21a-4515-8d38-55d61eb8d08e",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "bb907583-d738-43a9-ad44-277e0945d906",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "WorkflowVersion workflow id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d1845f40-a6b7-4ea4-bc3d-dd6604ae9e26",
                    "type": "SELECT",
                    "name": "status",
                    "label": "Version status",
                    "description": "The workflow version status",
                    "icon": "IconStatusChange",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'DRAFT'",
                    "options": [
                      {
                        "id": "163dd5a4-db9c-4a0d-bc4c-6c8580df42e2",
                        "color": "yellow",
                        "label": "Draft",
                        "value": "DRAFT",
                        "position": 0
                      },
                      {
                        "id": "317950e1-c09d-46db-840a-fb575235e32b",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 1
                      },
                      {
                        "id": "1f716fa6-6e70-4de2-bb67-3149e230698e",
                        "color": "red",
                        "label": "Deactivated",
                        "value": "DEACTIVATED",
                        "position": 2
                      },
                      {
                        "id": "721d4886-d4d9-4f5a-94f8-d359931ce217",
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
                    "id": "ab47d660-21b9-4b38-b09e-ae84dc109dcd",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "66edf1af-24cf-4870-9fda-cd89c74bbade",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The workflow version name",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6fc2bb52-9807-466d-baa7-a2d88f7ecd1a",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Workflow version position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1134d634-433f-4f32-8edf-4e05dba95846",
                    "type": "RAW_JSON",
                    "name": "steps",
                    "label": "Version steps",
                    "description": "Json object to provide steps",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "bf6407f0-67e9-42de-8086-178d7f68104f",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "WorkflowVersion workflow",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ecb54a5-05e5-4ed6-98a3-5d0ff5f354e6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "89bd95ae-6215-4834-9bd0-871cfb20335a",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bf6407f0-67e9-42de-8086-178d7f68104f",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1b3bcd98-321c-4240-82ec-ac66b1bf884d",
                        "name": "versions"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "921c24b1-999e-436c-8a3a-217bdd29237f",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "815a45be-7875-4851-b72f-bfe5ca671507",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "606b9e54-dad8-4778-8d37-4f614596bd73",
            "imageIdentifierFieldMetadataId": null,
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEx"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d4b0c0a9-da4e-45a3-8280-cea65f6ab4c3",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "96c23d5d-24d0-4173-805e-ddeeb9854c6c",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "11c55282-1105-4885-85fa-422e74f5ea41",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Relations",
                    "description": "Note targets",
                    "icon": "IconArrowUpRight",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "55b6d0dd-62c7-4608-b497-03d1a8fcce27",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "11c55282-1105-4885-85fa-422e74f5ea41",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fc119ac3-d857-4471-8b3a-55df9b5e66a0",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c6f5bb13-02f2-4b0b-a067-0f89a3d14a54",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Note attachments",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6c63eb07-5ba9-4799-b5e9-176275865f15",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c6f5bb13-02f2-4b0b-a067-0f89a3d14a54",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fc23bd8e-0632-49f6-986a-91736b0afdba",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "606b9e54-dad8-4778-8d37-4f614596bd73",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Note title",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0906473a-c421-41ff-8ea6-67d32c21d895",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the note.",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "150c8992-cdbe-40d9-8643-a325105a698c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0906473a-c421-41ff-8ea6-67d32c21d895",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0ab3c0d0-1e83-4398-bdf0-36d765f088e0",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1b641973-4972-452a-867d-7559adc195b9",
                    "type": "RICH_TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Note body",
                    "icon": "IconFilePencil",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ef30590b-501a-4485-81f0-52c7f5596039",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0ae2b3fc-8bfa-4ecb-9d0a-100b2317c02a",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8ff68850-533a-455a-90b3-c237bbb201ab",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Note record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "61bd7812-f2f2-4c7a-903e-0a9ab13e011e",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7306a856-e542-4b3f-99c2-985d150179bc",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the note",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "22920e78-bb9b-45c4-bcde-c70c2626c908",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7306a856-e542-4b3f-99c2-985d150179bc",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ec4d3e98-d8d7-4b39-a18f-baf4271ff464",
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
            "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "8469bc74-24bd-4ed4-9e0d-253bee4c814b",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "852741f4-dfb0-470d-b77c-605eebf896b8",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "948ff9ad-25b5-4e54-951a-a70757fe5880",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fd86cda1-e938-4b2a-80a7-0ff9805ed3f9"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "aa75c81a-d400-4063-93a6-90975158835b",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "1224fb05-bcf5-4fa2-88cd-eb42043e6803"
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
                    "id": "88a7fe0b-b827-4db9-b27d-3a26ae64d63a",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "0d690485-a174-4a64-87a8-0937164cc93f",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "381fcbc8-331d-4d8d-bee1-209060e6bfcd"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "fa2ad99b-d763-4f96-afb0-5a1432b4ef49",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fd86cda1-e938-4b2a-80a7-0ff9805ed3f9"
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
                    "id": "69e1cd68-7928-4a31-abb8-6c1cc4e61537",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "b199895f-7688-4c3c-b8bd-d676e6440b49",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fd86cda1-e938-4b2a-80a7-0ff9805ed3f9"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8b5813b2-2dd0-4a21-add3-206e0be55d27",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "d3d77144-7237-4433-8184-3d02d93bb7be"
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
                    "id": "f27771ac-19ef-41db-8686-312353fedd98",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "511a3091-2cf4-4cc0-86b4-00023ee46fab",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "a58b79a9-73de-4516-b391-b718f1318c93"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "50c7a0dc-2f80-49aa-adc1-cbfee71eaccc",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fd86cda1-e938-4b2a-80a7-0ff9805ed3f9"
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
                    "id": "05c53956-c18d-4674-8586-0232401b0a39",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "b1819b14-6a2e-4ed9-b38c-fd38dde402a5",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fd86cda1-e938-4b2a-80a7-0ff9805ed3f9"
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
                    "id": "1a81d61d-2b94-408e-b1a1-9e3d8c4a6382",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "8b17f636-d95e-4c5e-b3c6-2162885d4cdb",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "ef08a551-8b88-49b2-a15a-0105482e4e6d"
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjIz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "daa01e46-5127-4cfd-aae1-bb0a0f9a4746",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Event workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fe08e066-6693-441d-a2cc-4d68595bd942",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "daa01e46-5127-4cfd-aae1-bb0a0f9a4746",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "faa10ca1-ab1c-462f-94d1-956f6f1e0a29",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da68a893-dded-4c0e-8b12-b3abe633db06",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Event person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "712b602d-cc26-48ee-b275-6c63d3f3a2bb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "da68a893-dded-4c0e-8b12-b3abe633db06",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "615d7c0b-afec-4296-b3ec-380457bd7b8f",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6fcea013-b441-4382-94fa-4905ef95c9c4",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fd86cda1-e938-4b2a-80a7-0ff9805ed3f9",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "bbd3a6b0-9e5b-4f88-bfbd-a0d9573ce952",
                    "type": "TEXT",
                    "name": "linkedRecordCachedName",
                    "label": "Linked Record cached name",
                    "description": "Cached record name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "41e8a39b-7ce7-4504-983b-d1f9a2e71a5f",
                    "type": "DATE_TIME",
                    "name": "happensAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "cee15291-45a0-49b3-90aa-40cc6f9db3c0",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "Timeline Activity Rocket",
                    "icon": "IconTimeline",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.789Z",
                    "updatedAt": "2024-10-10T10:10:43.789Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5d81a4f8-fd1a-405f-9417-ea46aa9408cb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cee15291-45a0-49b3-90aa-40cc6f9db3c0",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e514740e-e163-426e-9774-faf4d20e4160",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0ab3c0d0-1e83-4398-bdf0-36d765f088e0",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "Event note",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "150c8992-cdbe-40d9-8643-a325105a698c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0ab3c0d0-1e83-4398-bdf0-36d765f088e0",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0906473a-c421-41ff-8ea6-67d32c21d895",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ddecdbd5-a81c-45a6-a75e-790e98024a5b",
                    "type": "UUID",
                    "name": "linkedRecordId",
                    "label": "Linked Record id",
                    "description": "Linked Record id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "2badd424-e1bd-49cd-83d1-09559d1b5671",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "Event opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "18d4b482-a87f-42ac-bc6b-bf4fd66f2642",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2badd424-e1bd-49cd-83d1-09559d1b5671",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5116568f-0d0e-4f2c-bfb4-cc8693d2af5e",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d3d77144-7237-4433-8184-3d02d93bb7be",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Event person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "043c4255-54fd-417b-a068-8481cab74a9c",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "Event task",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "14b81c03-ee47-4bb4-99fa-d24cec46c555",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "043c4255-54fd-417b-a068-8481cab74a9c",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9457be77-dd19-4237-8645-9bab4ffa5363",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b5604b1b-070c-47a8-b1f8-83e65f069526",
                    "type": "UUID",
                    "name": "linkedObjectMetadataId",
                    "label": "Linked Object Metadata Id",
                    "description": "inked Object Metadata Id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a58b79a9-73de-4516-b391-b718f1318c93",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "Event task id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7385873b-ec2d-4318-a35c-1f864768bbd8",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "Timeline Activity Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.783Z",
                    "updatedAt": "2024-10-10T10:10:43.783Z",
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
                    "id": "ef08a551-8b88-49b2-a15a-0105482e4e6d",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "Event opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1224fb05-bcf5-4fa2-88cd-eb42043e6803",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "Event note id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a928f3d0-5fb8-4a19-b4e1-94597c09c183",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Event workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "838bf42e-1942-473f-b959-c4f04c6913a7",
                    "type": "RAW_JSON",
                    "name": "properties",
                    "label": "Event details",
                    "description": "Json value for event details",
                    "icon": "IconListDetails",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3569b955-0767-43d6-98b4-cd960a738c1b",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "381fcbc8-331d-4d8d-bee1-209060e6bfcd",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Event company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8469bc74-24bd-4ed4-9e0d-253bee4c814b",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9c46aa1d-1d00-4126-89ae-19e49f2e84ca",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Event company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "893bb948-313d-4046-81aa-5ea5504e6c6c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9c46aa1d-1d00-4126-89ae-19e49f2e84ca",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3fc669ba-ec50-4e38-9180-2d7e71ea225e",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2194f9fa-8602-4cc1-b134-68340c76aaef",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Event name",
                    "description": "Event name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "77dae991-af08-4495-a4d2-71a094a1b8a0",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
            "nameSingular": "messageThreadSubscriber",
            "namePlural": "messageThreadSubscriber",
            "labelSingular": "Message Thread Subscriber",
            "labelPlural": "Message Threads Subscribers",
            "description": "Message Thread Subscribers",
            "icon": "IconPerson",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": true,
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "976e77a4-7352-400c-b9af-63164dfc4166",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "071562c9-5df0-494c-82f5-df30d3c700d3",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_fe68af1fc8af6f8e46b1486c0bc",
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
                            "id": "071050a6-4501-4a9f-bb47-eae810d075df",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6e1eac96-01e5-4e71-8534-a5f81a7bc059"
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
                    "id": "af70bb97-0c7d-49c3-bfd5-0833e58ad0f0",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_7fd3ae1ed406447542f08700557",
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
                            "id": "2926c994-5287-4b0b-9791-23cb667fc69c",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6e1eac96-01e5-4e71-8534-a5f81a7bc059"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f603625a-4116-46a4-bf4d-ad51e0cb708a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "d3d96d28-e8bc-4624-962f-5c75d499efbb"
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
                    "id": "0419280a-c574-48f5-894c-d54d380af218",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Workspace Member that is part of the message thread id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a4aa96c8-8621-4a6c-bdc8-288a216f1c3a",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "976e77a4-7352-400c-b9af-63164dfc4166",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d3d96d28-e8bc-4624-962f-5c75d499efbb",
                    "type": "UUID",
                    "name": "messageThreadId",
                    "label": "Message Thread id (foreign key)",
                    "description": "Message Thread id foreign key",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b897e2f4-f319-4467-a4d8-6a782b1ee7c2",
                    "type": "RELATION",
                    "name": "messageThread",
                    "label": "Message Thread",
                    "description": "Message Thread",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "02bb6d86-d842-4c02-a232-5d0e8dc3b387",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "77dae991-af08-4495-a4d2-71a094a1b8a0",
                        "nameSingular": "messageThreadSubscriber",
                        "namePlural": "messageThreadSubscriber"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b897e2f4-f319-4467-a4d8-6a782b1ee7c2",
                        "name": "messageThread"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f8a7079-5cdd-4859-9e9b-2a0778b5c81d",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "62fd6065-2acf-4f1f-bc9c-d3da8965c606",
                        "name": "subscribers"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6e1eac96-01e5-4e71-8534-a5f81a7bc059",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "497ff05c-5bac-4872-99eb-9dc3836de88e",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f7e4d070-009a-49c9-9265-d78c2236400a",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Workspace Member that is part of the message thread",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "306d2312-a2bd-4f00-9684-07575aef67b0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "77dae991-af08-4495-a4d2-71a094a1b8a0",
                        "nameSingular": "messageThreadSubscriber",
                        "namePlural": "messageThreadSubscriber"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f7e4d070-009a-49c9-9265-d78c2236400a",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "af7d20bf-77c5-496d-adde-7a7b005d29f1",
                        "name": "messageThreadSubscribers"
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
            "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "04ba42b4-81dc-4e3b-ab16-736e3b2d1fda",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "99b9153a-0cb1-48fa-907a-e454a478415b",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "6a03ae91-23b3-4c5c-8d41-f93a3d1148bf",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "bf769e68-a193-4215-981e-0a5e6f992204"
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
                    "id": "847d44f3-6455-415d-b173-4db5a4ba98a2",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "87c4dbf9-19eb-45a8-b551-cc9e77713691",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "63586839-0883-49f8-b06d-22ad6d7ba15c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "7f77c333-2c3f-4599-86b5-2da2ad4ee3c2",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "9493303f-87d7-401a-9065-736325dad2a5"
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
                    "id": "73cf35e8-5b45-496c-9499-6d2eb4c42e43",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "0b7d8c24-d6b6-4086-98be-42ff9b7e0193",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "37105c9d-ebfe-483e-b320-5cceb930af7e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "729dabfa-99d4-4767-b32b-d23f73893297",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "63586839-0883-49f8-b06d-22ad6d7ba15c"
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
                    "id": "1c222b64-725e-4213-b80c-de3d3c320667",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "2c62d133-bad5-4cf4-86f4-d2e635b23497",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "26a8cf19-bd1e-45b0-ad6f-77a5d2fcacfb"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "333b51c4-6900-4b44-85a6-90b6d6a822b4",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "63586839-0883-49f8-b06d-22ad6d7ba15c"
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
                    "id": "bf769e68-a193-4215-981e-0a5e6f992204",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "TaskTarget company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "65684024-9b7f-4fad-9402-eab2668a2788",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "TaskTarget person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ea5b1ad0-e9a6-40e6-b1db-5d0e6f53e30a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "65684024-9b7f-4fad-9402-eab2668a2788",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "32032cb0-3e61-495b-a1f4-6fdab47b6efb",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "75e38cb3-e293-4265-b146-e8a9ee43018a",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "63586839-0883-49f8-b06d-22ad6d7ba15c",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "26a8cf19-bd1e-45b0-ad6f-77a5d2fcacfb",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "TaskTarget opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "255f0939-a37e-49b1-b24d-bb73cdb608b7",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "TaskTarget company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5e297614-7b54-4900-a899-aa0d624a5ba2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "255f0939-a37e-49b1-b24d-bb73cdb608b7",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6470e363-cfe4-491b-ad94-fae0610937af",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "04ba42b4-81dc-4e3b-ab16-736e3b2d1fda",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "eb32968f-4ee1-4e16-a560-8ca0ad961f1c",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "TaskTarget opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1d4c3802-9799-4701-9e06-d806e796721f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eb32968f-4ee1-4e16-a560-8ca0ad961f1c",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "19cc8224-a9c0-439c-b702-e23bedf1f865",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "48b3f70e-ceb3-45f1-87b4-739eaca8a5ab",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "TaskTarget Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.890Z",
                    "updatedAt": "2024-10-10T10:10:43.890Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "934db1fd-f237-4d82-9751-5b42d1bf28f4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "48b3f70e-ceb3-45f1-87b4-739eaca8a5ab",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "52cc9eb1-a434-4612-b79b-21397f9c6883",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aee746ea-6e64-4d77-b81e-2f283edeec42",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "TaskTarget Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.888Z",
                    "updatedAt": "2024-10-10T10:10:43.888Z",
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
                    "id": "d8060fac-4b47-46d0-a614-5ab801b3c4e6",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "TaskTarget task",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b5cd03ba-6964-453c-98f6-7eab5ccbd4df",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d8060fac-4b47-46d0-a614-5ab801b3c4e6",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1e5f80b1-667a-4a0c-bd47-00cf13ac8da2",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f9fd2fac-835e-42bd-91f6-02a432fe974f",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "37105c9d-ebfe-483e-b320-5cceb930af7e",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "TaskTarget task id foreign key",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9493303f-87d7-401a-9065-736325dad2a5",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "TaskTarget person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "7d9110e6-a23f-4aad-9af7-5a4cbd7cabb1",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7b662673-c6c7-4a9a-8b69-4ca215e1f8e2",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "74c625b9-1fe0-4105-842c-9c8945461678",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fed0cd8f-c25a-45f6-87ba-dd2db4beff3b"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "233355fd-68a9-4941-b7ee-4be6cd7d8ad5",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "35f975da-e0eb-455b-8596-4cf2afac6070"
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
                    "id": "efea121c-f344-486f-92e0-c25a6eabb22b",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_9f96d65260c4676faac27cb6bf3",
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
                    "id": "c6c99f3a-f473-435e-8629-c99a0aaa021a",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "8e875d84-5ae8-4117-8059-039e9f0fdab7",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "7e30692d-99b9-4f80-be37-2b41053ea1c4"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1394e93c-a701-4b48-8bad-aff57679ba61",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fed0cd8f-c25a-45f6-87ba-dd2db4beff3b"
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
                    "id": "72cec711-5c9a-4106-9281-fc694c599b85",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "d9eb018a-f089-490f-8d26-832421b7fc87",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "fed0cd8f-c25a-45f6-87ba-dd2db4beff3b"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "742df534-10d3-4b62-b562-f8a82bb22f99",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "4d454788-df82-4c97-91e8-2f90bba5dab4"
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
                    "id": "c4dfccd3-db51-4462-96d6-0fde15dedef5",
                    "type": "RELATION",
                    "name": "pointOfContact",
                    "label": "Point of Contact",
                    "description": "Opportunity point of contact",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ed26f057-0da9-4327-87aa-b295591e27a0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c4dfccd3-db51-4462-96d6-0fde15dedef5",
                        "name": "pointOfContact"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fbf1ac7f-7763-4489-96d9-1476be46c343",
                        "name": "pointOfContactForOpportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4d454788-df82-4c97-91e8-2f90bba5dab4",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Opportunity company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "047f7bf8-fa80-4f83-aea6-fe2dbca99490",
                    "type": "DATE_TIME",
                    "name": "closeDate",
                    "label": "Close date",
                    "description": "Opportunity close date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "14999e90-7a5a-432b-a0d6-26baf6889285",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "da64021d-4194-4814-90ff-b7874836010d",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "765a34c3-2ae6-4f67-8fad-a3db5eb8fffd",
                    "type": "TS_VECTOR",
                    "name": "searchVector",
                    "label": "Search vector",
                    "description": "Field used for full-text search",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7d9110e6-a23f-4aad-9af7-5a4cbd7cabb1",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The opportunity name",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "19cc8224-a9c0-439c-b702-e23bedf1f865",
                    "type": "RELATION",
                    "name": "taskTargets",
                    "label": "Tasks",
                    "description": "Tasks tied to the opportunity",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1d4c3802-9799-4701-9e06-d806e796721f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "19cc8224-a9c0-439c-b702-e23bedf1f865",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "76295ff7-4972-424e-8499-bce96bb8aa7d",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eb32968f-4ee1-4e16-a560-8ca0ad961f1c",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7e30692d-99b9-4f80-be37-2b41053ea1c4",
                    "type": "SELECT",
                    "name": "stage",
                    "label": "Stage",
                    "description": "Opportunity stage",
                    "icon": "IconProgressCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'NEW'",
                    "options": [
                      {
                        "id": "839cb787-d2f3-47f4-b89f-c3d01cfb47b0",
                        "color": "red",
                        "label": "New",
                        "value": "NEW",
                        "position": 0
                      },
                      {
                        "id": "6d94aee2-73e4-4ad5-b27a-aa28c4fdc6a6",
                        "color": "purple",
                        "label": "Screening",
                        "value": "SCREENING",
                        "position": 1
                      },
                      {
                        "id": "05495538-8582-41c8-a8c8-ffef69649370",
                        "color": "sky",
                        "label": "Meeting",
                        "value": "MEETING",
                        "position": 2
                      },
                      {
                        "id": "ecfd50b5-7135-4e60-b8a3-414370448396",
                        "color": "turquoise",
                        "label": "Proposal",
                        "value": "PROPOSAL",
                        "position": 3
                      },
                      {
                        "id": "1c605ba6-348e-40ba-aceb-5d763e642516",
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
                    "id": "35f975da-e0eb-455b-8596-4cf2afac6070",
                    "type": "UUID",
                    "name": "pointOfContactId",
                    "label": "Point of Contact id (foreign key)",
                    "description": "Opportunity point of contact id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "62cb5fc3-bfe1-48a1-b888-15c7957b8ff5",
                    "type": "RELATION",
                    "name": "noteTargets",
                    "label": "Notes",
                    "description": "Notes tied to the opportunity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d18220ef-e6b5-46aa-9a38-c0a93ddc0d0d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "62cb5fc3-bfe1-48a1-b888-15c7957b8ff5",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ae64d93e-1c87-4794-9f32-8554f1b940ab",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f8be5b26-cbab-4624-8ddd-291e1fe6d800",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "072e3804-4323-4bb0-8c90-650272d74b52",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Activities",
                    "description": "Activities tied to the opportunity",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b10779e5-eebb-4717-a216-a6bf5ecf5f47",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "072e3804-4323-4bb0-8c90-650272d74b52",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0d8726a1-21a6-4a83-8df9-954be9e98735",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "99d6af13-43d9-40e0-8389-bd49214cc2e6",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Opportunity company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e7c1a6b3-61ec-42bb-af19-1f31d1f3e928",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "99d6af13-43d9-40e0-8389-bd49214cc2e6",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "10a88900-9f37-459c-bc05-c6125f2ee063",
                        "name": "opportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ee7a0124-ecd8-41c8-9da6-cedc12870505",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8aa82500-f12b-447e-8cfc-6402567d4d10",
                    "type": "ACTOR",
                    "name": "createdBy",
                    "label": "Created by",
                    "description": "The creator of the record",
                    "icon": "IconCreativeCommonsSa",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f4e65092-a9a5-4ac5-bd97-b052995d0c9c",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the opportunity",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dca2ae4d-5653-4207-b6df-0b7302aafe8b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f4e65092-a9a5-4ac5-bd97-b052995d0c9c",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "692d1732-a2d3-4b23-98e4-80dc28fd2456",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0b62a39e-8587-4c91-8c9a-67143ef78c00",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "Opportunity record position",
                    "icon": "IconHierarchy2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5116568f-0d0e-4f2c-bfb4-cc8693d2af5e",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Timeline Activities",
                    "description": "Timeline Activities linked to the opportunity.",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "18d4b482-a87f-42ac-bc6b-bf4fd66f2642",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5116568f-0d0e-4f2c-bfb4-cc8693d2af5e",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2badd424-e1bd-49cd-83d1-09559d1b5671",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4eca7cd7-9d54-48ff-9de9-af0388a8a637",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Attachments linked to the opportunity",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dd05a326-14d5-41ff-8120-0bba1663105e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4eca7cd7-9d54-48ff-9de9-af0388a8a637",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "18939408-0d01-4736-b9bf-be5c7ecdea71",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fed0cd8f-c25a-45f6-87ba-dd2db4beff3b",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "47e7d0e2-cbff-41d5-9223-df4733f10354",
                    "type": "CURRENCY",
                    "name": "amount",
                    "label": "Amount",
                    "description": "Opportunity amount",
                    "icon": "IconCurrencyDollar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": {
                      "amountMicros": null,
                      "currencyCode": "''"
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
            "id": "6b583fb1-f04d-446d-a70d-cbf2a5260e7e",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "27f98d29-43c2-4f8d-a254-8160f67c81ea",
            "imageIdentifierFieldMetadataId": null,
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
                    "id": "27f98d29-43c2-4f8d-a254-8160f67c81ea",
                    "type": "TEXT",
                    "name": "targetUrl",
                    "label": "Target Url",
                    "description": "Webhook target url",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ae28a45e-5a9f-4145-83b3-6a6f06fa3fd1",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "45f49271-dbf2-4a35-bcce-544e06c76dcb",
                    "type": "TEXT",
                    "name": "operation",
                    "label": "Operation",
                    "description": "Webhook operation",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7a288e92-f4cf-4434-b67d-888c9bbba4cb",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d77877e9-ad40-469a-88d0-7179f96dfcb5",
                    "type": "TEXT",
                    "name": "description",
                    "label": "Description",
                    "description": null,
                    "icon": "IconInfo",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "86e41708-c6b2-44b1-9001-207e17b2b915",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "df6c2482-d094-45f7-9914-e47d4d92fd1d",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "61d31abc-4d2c-4564-b93f-c48c35828bbe",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "310b424e-da0a-40fc-ab7e-443cdcbbc343",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "49d35969-c335-451f-aba4-f7a444752c1a",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "83332d39-1ad2-4d13-8f9e-8cf1a0cb9f42",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "88fc9870-9ff3-4294-b44a-f81e2776f59e"
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
                    "id": "ed242f28-f870-4e8c-8c84-7863493b9566",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "88fc9870-9ff3-4294-b44a-f81e2776f59e",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "310b424e-da0a-40fc-ab7e-443cdcbbc343",
                    "type": "TEXT",
                    "name": "eventName",
                    "label": "Name",
                    "description": "The workflow event listener name",
                    "icon": "IconPhoneCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1a45047b-9ced-49a7-8787-1457443278af",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "WorkflowEventListener workflow id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "31f59427-bc04-4bf4-a33b-c0209595ee23",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "WorkflowEventListener workflow",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "61d64cbd-b235-4479-8a80-0a7f86982f0f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61d31abc-4d2c-4564-b93f-c48c35828bbe",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "31f59427-bc04-4bf4-a33b-c0209595ee23",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5d9cefd3-ab9c-4d86-af26-7dc4bc6ac36d",
                        "name": "eventListeners"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d328a74c-4dff-4c83-9a92-070b36552163",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "60b3d58e-c117-4980-ba22-e544796caf1c",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "283808c2-6956-4777-9d2e-7af13088aad5",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "efc9c0ae-cd82-442e-acb6-8e06dcefe93d",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "65416e8a-8d01-4d87-8239-7a534834b726",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "b75d0e9c-5e19-460d-b12a-5abb2e0ca8c4"
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
                    "id": "4da6770a-b9d8-4c9e-bba0-9125f54232f7",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "65f49b67-f3f4-4188-987d-8607281589a9",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "fb3b4a38-5dcb-489d-aa52-0ad8129ae60a"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a8ba80e4-d2c1-485e-a398-6c001f6b5e50",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6932a7a8-fb46-4fe3-a610-6972ff70fcb8"
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
                    "id": "73834f3c-6833-46f7-9bc1-954faf03b92d",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "86788735-5b9f-4da0-bca9-528a17587f2e",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "f1b1bc95-3ff5-4282-a4fa-a292530505ca"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "83375d12-21da-40e2-901f-464652fe9b60",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6932a7a8-fb46-4fe3-a610-6972ff70fcb8"
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
                    "id": "a37d5b2e-65a6-41d6-9e50-288b745570a2",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "846777ca-c626-4a73-8e27-07e4336e87cd",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "280d8a14-0dfd-404b-bdfb-7eea55dcd088"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "55da7589-fb86-4c75-ab57-5208ecfa86f7",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6932a7a8-fb46-4fe3-a610-6972ff70fcb8"
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
                    "id": "626d7764-95f5-40f6-8d5e-afbc236e8399",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "3769c418-f9f1-4ae9-a32f-d12ab16415e3",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "206ee239-173a-4e6a-8182-9bceb899ef6e"
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
                    "id": "f8fe5349-0955-4248-a837-327ce1027910",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "99e3d2d3-c6df-46bc-8a2c-1d489b5715e2",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "fb7be09d-09ea-4023-a0cc-e5c47b85230b",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "fb3ff94e-dcb9-4e60-a3ef-bb34b1b17f59"
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
                    "id": "dbe778bb-35a3-435f-94f7-ccbe3edf9582",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "1a494b44-fd4d-4b1c-8ffd-72319b5b53d2",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6932a7a8-fb46-4fe3-a610-6972ff70fcb8"
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
                    "id": "206ee239-173a-4e6a-8182-9bceb899ef6e",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "Favorite opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "644f2b4e-4e93-4dab-8a8e-5e1425c3f056",
                    "type": "RELATION",
                    "name": "workflow",
                    "label": "Workflow",
                    "description": "Favorite workflow",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "34132629-ef7f-4d04-ab86-ee26e60b9538",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "644f2b4e-4e93-4dab-8a8e-5e1425c3f056",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f73f1de8-62c1-4920-878e-e59af3eb64e8",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ec21cbc4-89bc-4baa-aae2-2102166be735",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6932a7a8-fb46-4fe3-a610-6972ff70fcb8",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5a7328da-ff06-414e-8997-c141e212a218",
                    "type": "UUID",
                    "name": "workflowId",
                    "label": "Workflow id (foreign key)",
                    "description": "Favorite workflow id foreign key",
                    "icon": "IconSettingsAutomation",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fb3ff94e-dcb9-4e60-a3ef-bb34b1b17f59",
                    "type": "UUID",
                    "name": "noteId",
                    "label": "Note id (foreign key)",
                    "description": "Favorite note id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d42bd54b-de2c-4890-a31e-b82be9fb5eb6",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "Favorite person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "95b5170c-0636-4e78-b11c-6714291eed02",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d42bd54b-de2c-4890-a31e-b82be9fb5eb6",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "48ea88fe-b537-4089-ba18-744300565ccf",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "382e40c1-584e-4094-80e8-c7724727533e",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "Favorite Rocket",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.838Z",
                    "updatedAt": "2024-10-10T10:10:43.838Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "767ab10c-d41f-4964-811d-4602defa8dec",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "382e40c1-584e-4094-80e8-c7724727533e",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fa863d91-9bc8-4672-91db-af1c8741d5f7",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "69900f1c-68bc-4dba-a944-03765de92ffc",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "Favorite company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "280d8a14-0dfd-404b-bdfb-7eea55dcd088",
                    "type": "UUID",
                    "name": "taskId",
                    "label": "Task id (foreign key)",
                    "description": "Favorite task id foreign key",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "283808c2-6956-4777-9d2e-7af13088aad5",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fede373e-4961-4516-9f82-fe7aa88642f6",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Favorite workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "699f772b-31aa-46f6-86c3-d09182c170a8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fede373e-4961-4516-9f82-fe7aa88642f6",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cf513084-4005-422e-aae2-4d71764fb05c",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "083be68f-35b4-4568-9239-19ff32032863",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "Favorite view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "09553777-690b-47be-a364-fd759692b17a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "083be68f-35b4-4568-9239-19ff32032863",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ae18df9f-9d28-4e4b-8389-c108afbfdce0",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b75d0e9c-5e19-460d-b12a-5abb2e0ca8c4",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "Favorite person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fedf2685-e90f-4e16-8a5a-788e3e257a95",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "Favorite Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.832Z",
                    "updatedAt": "2024-10-10T10:10:43.832Z",
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
                    "id": "ab2847b2-3a96-43ac-913c-1d520ecdf34e",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d1c5b2ad-875c-400d-a319-0f9d455fcfc1",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5e4f6d00-ab4b-4b24-9bf1-1cb37378dba5",
                    "type": "NUMBER",
                    "name": "position",
                    "label": "Position",
                    "description": "Favorite position",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e4648dbf-9715-486b-bcdc-6c76cfdca044",
                    "type": "RELATION",
                    "name": "task",
                    "label": "Task",
                    "description": "Favorite task",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6472763e-9107-42b5-bf2d-946fbe7002cf",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e4648dbf-9715-486b-bcdc-6c76cfdca044",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "feaf0f5e-a086-4d65-b321-e3c82907b59a",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec4d3e98-d8d7-4b39-a18f-baf4271ff464",
                    "type": "RELATION",
                    "name": "note",
                    "label": "Note",
                    "description": "Favorite note",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "22920e78-bb9b-45c4-bcde-c70c2626c908",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ec4d3e98-d8d7-4b39-a18f-baf4271ff464",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "815a45be-7875-4851-b72f-bfe5ca671507",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7306a856-e542-4b3f-99c2-985d150179bc",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f1b1bc95-3ff5-4282-a4fa-a292530505ca",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "Favorite view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fb3b4a38-5dcb-489d-aa52-0ad8129ae60a",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Favorite workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "692d1732-a2d3-4b23-98e4-80dc28fd2456",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "Favorite opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dca2ae4d-5653-4207-b6df-0b7302aafe8b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "692d1732-a2d3-4b23-98e4-80dc28fd2456",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f4e65092-a9a5-4ac5-bd97-b052995d0c9c",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "94619863-e0f8-444a-bdcc-bdcd8290a7e9",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "Favorite company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0bf301ce-647d-44b3-b3d8-ad588ceb8e07",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "94619863-e0f8-444a-bdcc-bdcd8290a7e9",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "91b5c9d6-63ef-475a-9ef7-eff1d3b5a9ff",
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
            "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "64ab5f98-e570-4484-94e7-c0633e219e1c",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "56b5a335-3dd9-4da2-b07a-d55112fc2d2b",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "d83a4a64-5991-411f-a6b0-8da3ae027245",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "dd03eb65-fc75-4444-8720-4fa47fbd7d59"
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
                    "id": "47789675-5340-462c-be46-f6146669e9be",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "6fd22cea-497d-4e92-8bc5-fa4c82cc55db",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "9fe5c887-a495-4037-b3a5-c3e46347a4d5"
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
                    "id": "f25922a6-0164-4043-8a82-c48d10047117",
                    "type": "DATE_TIME",
                    "name": "dueAt",
                    "label": "Due Date",
                    "description": "Activity due date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "281ae1d1-35bc-4f11-aaa3-b746aff0f6a0",
                    "type": "DATE_TIME",
                    "name": "completedAt",
                    "label": "Completion Date",
                    "description": "Activity completion date",
                    "icon": "IconCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "37b67fc8-9ab9-478b-a8a0-10f47ff4c702",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0b73d2a3-92ba-4b7b-8d28-93456b551ca8",
                    "type": "RELATION",
                    "name": "attachments",
                    "label": "Attachments",
                    "description": "Activity attachments",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "03d17e51-cbbb-405b-b709-822d579f360e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0b73d2a3-92ba-4b7b-8d28-93456b551ca8",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "406fe7af-c22a-4410-97a5-0b0897e768f3",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "47fe492f-f3dc-411c-9d71-13ec7db1afa8",
                    "type": "RELATION",
                    "name": "author",
                    "label": "Author",
                    "description": "Activity author",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "752ba769-4bb7-44ba-aa1c-15526717b267",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "47fe492f-f3dc-411c-9d71-13ec7db1afa8",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a54fba04-9275-48ae-828b-e880b6204680",
                        "name": "authoredActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fdaf4abc-4a70-4f90-86d1-c7900846f26f",
                    "type": "RELATION",
                    "name": "activityTargets",
                    "label": "Targets",
                    "description": "Activity targets",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "44d11033-3c9f-4f72-82a6-095a05da721b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fdaf4abc-4a70-4f90-86d1-c7900846f26f",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "805b7a19-1764-458c-a6d0-449781fdc272",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4012afe5-6685-42b8-a5cb-048bbfa7a9a5",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dd03eb65-fc75-4444-8720-4fa47fbd7d59",
                    "type": "UUID",
                    "name": "authorId",
                    "label": "Author id (foreign key)",
                    "description": "Activity author id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "42f2cebd-e58e-44ff-a2f6-45d892cc6169",
                    "type": "RELATION",
                    "name": "assignee",
                    "label": "Assignee",
                    "description": "Activity assignee",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1ccb9704-f27d-4680-9c17-1b91e603f959",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "42f2cebd-e58e-44ff-a2f6-45d892cc6169",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7306e298-2895-4f78-bf5f-e0b138741eef",
                        "name": "assignedActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a0029e26-7f08-4961-9984-76a39ba84af4",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "64ab5f98-e570-4484-94e7-c0633e219e1c",
                    "type": "TEXT",
                    "name": "title",
                    "label": "Title",
                    "description": "Activity title",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9fe5c887-a495-4037-b3a5-c3e46347a4d5",
                    "type": "UUID",
                    "name": "assigneeId",
                    "label": "Assignee id (foreign key)",
                    "description": "Activity assignee id foreign key",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "af7ab078-d00b-4864-a053-cd32c2a692e2",
                    "type": "TEXT",
                    "name": "type",
                    "label": "Type",
                    "description": "Activity type",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "2c555ddf-7522-4911-8447-fdc6c8d6c7d5",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "40bebe70-8067-4880-a726-76006c17ddbb",
                    "type": "RELATION",
                    "name": "comments",
                    "label": "Comments",
                    "description": "Activity comments",
                    "icon": "IconComment",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5fadc17c-d146-427a-9569-eea8b8be237c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "40bebe70-8067-4880-a726-76006c17ddbb",
                        "name": "comments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4639806a-115d-415c-89c9-f0c71414ff80",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6f14f546-625a-4db6-9c80-04b5f8fa4347",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "84c18447-4f3b-48d4-938f-6ec2d1e4b5bb",
                    "type": "DATE_TIME",
                    "name": "reminderAt",
                    "label": "Reminder Date",
                    "description": "Activity reminder date",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fd7737f5-3c12-47f7-ac3a-295596ea63d9",
                    "type": "TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Activity body",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "7b2d3fff-8d0a-4761-9b1a-b6a90387b686",
            "imageIdentifierFieldMetadataId": null,
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjE1"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "854f01a8-a509-4782-9fc9-2ca88175a3d4",
                    "type": "TEXT",
                    "name": "type",
                    "label": "Type",
                    "description": "View type",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1594c000-0c37-4f8e-8002-798158401c2c",
                    "type": "BOOLEAN",
                    "name": "isCompact",
                    "label": "Compact View",
                    "description": "Describes if the view is in compact mode",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8caacd81-928b-449c-aba5-fd7320795c44",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dc6c4e70-6e22-402a-95e7-e2cc2f8e8bdd",
                    "type": "SELECT",
                    "name": "key",
                    "label": "Key",
                    "description": "View key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'INDEX'",
                    "options": [
                      {
                        "id": "5b8ba944-eecd-4a47-8964-ea9535968abb",
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
                    "id": "ae18df9f-9d28-4e4b-8389-c108afbfdce0",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the view",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "09553777-690b-47be-a364-fd759692b17a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ae18df9f-9d28-4e4b-8389-c108afbfdce0",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "083be68f-35b4-4568-9239-19ff32032863",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7b2d3fff-8d0a-4761-9b1a-b6a90387b686",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "View name",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6148ee2e-a119-41ed-8398-18d92b493495",
                    "type": "UUID",
                    "name": "objectMetadataId",
                    "label": "Object Metadata Id",
                    "description": "View target object",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "345d1359-934d-40a9-819b-15cbe87f777d",
                    "type": "RELATION",
                    "name": "viewFilters",
                    "label": "View Filters",
                    "description": "View Filters",
                    "icon": "IconFilterBolt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bc724836-9614-47a1-97b8-f745b05aad35",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "345d1359-934d-40a9-819b-15cbe87f777d",
                        "name": "viewFilters"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3ab48e1c-1b68-4e80-a177-7a75276e7424",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c69e2c07-8ff2-4a47-ad34-9f96f04b0d5e",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "77719194-2bc7-4f61-9862-6f5089bb7726",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e6ab5fb6-1d93-49e9-8a0a-10df12a7a261",
                    "type": "TEXT",
                    "name": "icon",
                    "label": "Icon",
                    "description": "View icon",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e92c2801-2f4e-4cc8-a514-92db7cee62ae",
                    "type": "RELATION",
                    "name": "viewSorts",
                    "label": "View Sorts",
                    "description": "View Sorts",
                    "icon": "IconArrowsSort",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b0ad182-a327-46dc-b0ca-ad82db3c04a0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e92c2801-2f4e-4cc8-a514-92db7cee62ae",
                        "name": "viewSorts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcf67a5e-7542-441f-8d1f-e5eb772bfc43",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "13cc13d8-dc2f-4aec-a5fb-e3cfdaab968e",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d571339f-8f8f-47d8-b31e-c1ae36cf235e",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3feda1bf-cab9-455d-8fae-02c9c5f43864",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "18331138-feeb-4c95-8c85-456078193766",
                    "type": "POSITION",
                    "name": "position",
                    "label": "Position",
                    "description": "View position",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "23af5b77-9dcb-4954-86cf-2976f2e81ed0",
                    "type": "TEXT",
                    "name": "kanbanFieldMetadataId",
                    "label": "kanbanfieldMetadataId",
                    "description": "View Kanban column field",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f1a513ec-e2f4-454e-8bd1-aef9980aaac5",
                    "type": "RELATION",
                    "name": "viewFields",
                    "label": "View Fields",
                    "description": "View Fields",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ce5e3cc-3bc7-41d6-b225-0ecf939326e8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f1a513ec-e2f4-454e-8bd1-aef9980aaac5",
                        "name": "viewFields"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4b041359-f7e5-44e1-bacc-b69a2f65d8f8",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f60ccbd0-c8f1-4592-9aaa-f203493d2fe9",
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
            "id": "4b041359-f7e5-44e1-bacc-b69a2f65d8f8",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "fcfc127e-e65c-4007-9b68-0fd78c928f65",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "1e7f129f-2b8a-41cd-b4fc-c3f30be47b5b",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "name": "IDX_6d269465206d2f3e283ce479b2e",
                    "indexWhereClause": "\"deletedAt\" IS NULL",
                    "indexType": "BTREE",
                    "isUnique": true,
                    "indexFieldMetadatas": {
                      "__typename": "IndexIndexFieldMetadatasConnection",
                      "edges": [
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0f1f4204-efca-4d4d-bcae-a466a3af6f51",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "b1f73bb6-5a25-4396-97bb-21697899c9d6"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "7f3b1ab9-8fe4-4614-95c2-84fa928f8f88",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "32dceebd-76f8-45e0-b7f8-14fdeedbc79f"
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
                    "id": "dfd2907a-e232-4574-a14a-d8a9ef873c2d",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "ebd2c20c-4f56-4b6a-8e58-6ed6f099ba1a",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "5ccd16c3-81fa-45d3-85f5-9d72e58fe089"
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
                    "id": "b1f73bb6-5a25-4396-97bb-21697899c9d6",
                    "type": "UUID",
                    "name": "fieldMetadataId",
                    "label": "Field Metadata Id",
                    "description": "View Field target field",
                    "icon": "IconTag",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "224bfc27-9987-4c32-a43d-d34120cc602b",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "9717cff9-ee84-4890-916b-bfc008bd765c",
                    "type": "BOOLEAN",
                    "name": "isVisible",
                    "label": "Visible",
                    "description": "View Field visibility",
                    "icon": "IconEye",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5ccd16c3-81fa-45d3-85f5-9d72e58fe089",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "fcfc127e-e65c-4007-9b68-0fd78c928f65",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "32dceebd-76f8-45e0-b7f8-14fdeedbc79f",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View Field related view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1c0f6161-0b57-40ed-b087-a521eeba93e5",
                    "type": "NUMBER",
                    "name": "size",
                    "label": "Size",
                    "description": "View Field size",
                    "icon": "IconEye",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3747509e-9f2b-4166-98cb-5d7689f08d0a",
                    "type": "NUMBER",
                    "name": "position",
                    "label": "Position",
                    "description": "View Field position",
                    "icon": "IconList",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f60ccbd0-c8f1-4592-9aaa-f203493d2fe9",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View Field related view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ce5e3cc-3bc7-41d6-b225-0ecf939326e8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4b041359-f7e5-44e1-bacc-b69a2f65d8f8",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f60ccbd0-c8f1-4592-9aaa-f203493d2fe9",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f1a513ec-e2f4-454e-8bd1-aef9980aaac5",
                        "name": "viewFields"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec0a12b3-8151-4177-8bb6-503595bf26c4",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "4639806a-115d-415c-89c9-f0c71414ff80",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "b38cf2fe-7813-4b17-aea8-d060ae3123b6",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "76408ecf-caea-40ff-9d2e-15bfc82f71b7",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "124b08b4-d173-4928-a773-1cf98bda42f2",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "5888ff33-426d-4e28-8335-13a2cbe67193"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "75db7cb8-5955-4467-9b2b-18a1ca5feab5",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "c0ba00ca-618e-441e-9078-1bc3b27ed265"
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
                    "id": "a55561ec-5e53-41fe-bf98-602c1922a0bf",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "7bc1d326-fe00-4c1d-977e-8f98977a9583",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "42e3a5ba-c25a-4506-b6a2-efa3f1239ec1"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "2081e2e8-4922-4573-ac48-407b0a423db1",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "5888ff33-426d-4e28-8335-13a2cbe67193"
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
                    "id": "b38cf2fe-7813-4b17-aea8-d060ae3123b6",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "42e3a5ba-c25a-4506-b6a2-efa3f1239ec1",
                    "type": "UUID",
                    "name": "authorId",
                    "label": "Author id (foreign key)",
                    "description": "Comment author id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5888ff33-426d-4e28-8335-13a2cbe67193",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e76dc95e-dd97-488d-9a85-260ad58915fb",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c8eb0c64-e7d0-4818-a216-0dcfe53616bf",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c0ba00ca-618e-441e-9078-1bc3b27ed265",
                    "type": "UUID",
                    "name": "activityId",
                    "label": "Activity id (foreign key)",
                    "description": "Comment activity id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6f14f546-625a-4db6-9c80-04b5f8fa4347",
                    "type": "RELATION",
                    "name": "activity",
                    "label": "Activity",
                    "description": "Comment activity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5fadc17c-d146-427a-9569-eea8b8be237c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4639806a-115d-415c-89c9-f0c71414ff80",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6f14f546-625a-4db6-9c80-04b5f8fa4347",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "40bebe70-8067-4880-a726-76006c17ddbb",
                        "name": "comments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2cc2b8d6-1218-4573-b693-533622919df6",
                    "type": "TEXT",
                    "name": "body",
                    "label": "Body",
                    "description": "Comment body",
                    "icon": "IconLink",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c03f44dd-3439-4d9c-a86e-f9d75bd6af7e",
                    "type": "RELATION",
                    "name": "author",
                    "label": "Author",
                    "description": "Comment author",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "01ed6f59-e77b-452b-8ec5-2ee4802eab57",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4639806a-115d-415c-89c9-f0c71414ff80",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c03f44dd-3439-4d9c-a86e-f9d75bd6af7e",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "50c8e931-cbd5-4ac6-8c41-ae34cfbd1179",
                        "name": "authoredComments"
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
            "id": "3ab48e1c-1b68-4e80-a177-7a75276e7424",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "683aa4f0-4a02-4cf3-aeaa-3ccda4f13124",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "fd8a5d23-9b1c-440b-8236-20258a24932d",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "336005f8-10c8-49a3-bf44-c9d5d74a9ccd",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "8013a03a-a62f-498a-ba6d-7f45c13a07c6"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3950c8cf-cdce-45df-b330-e9d5fa33c904",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "c86dd57b-99f5-4e4a-81fb-c1bbdf5ce595"
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
                    "id": "fe1379ee-7be6-4747-ba29-a46c854db0e7",
                    "type": "TEXT",
                    "name": "value",
                    "label": "Value",
                    "description": "View Filter value",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "683aa4f0-4a02-4cf3-aeaa-3ccda4f13124",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1e8a0450-4e0f-43d4-b65d-4cbd38c9913c",
                    "type": "TEXT",
                    "name": "displayValue",
                    "label": "Display Value",
                    "description": "View Filter Display Value",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7e20167a-6963-4740-bddf-991d84109298",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8013a03a-a62f-498a-ba6d-7f45c13a07c6",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "47366e18-8471-4e07-9f1a-63028d5bfa77",
                    "type": "TEXT",
                    "name": "operand",
                    "label": "Operand",
                    "description": "View Filter operand",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8f638bdb-f688-41af-b935-509d01ed13f4",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c86dd57b-99f5-4e4a-81fb-c1bbdf5ce595",
                    "type": "UUID",
                    "name": "viewId",
                    "label": "View id (foreign key)",
                    "description": "View Filter related view id foreign key",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c69e2c07-8ff2-4a47-ad34-9f96f04b0d5e",
                    "type": "RELATION",
                    "name": "view",
                    "label": "View",
                    "description": "View Filter related view",
                    "icon": "IconLayoutCollage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bc724836-9614-47a1-97b8-f745b05aad35",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3ab48e1c-1b68-4e80-a177-7a75276e7424",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c69e2c07-8ff2-4a47-ad34-9f96f04b0d5e",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5bed516c-3d2f-46f1-886a-b34151ef26c7",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "345d1359-934d-40a9-819b-15cbe87f777d",
                        "name": "viewFilters"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "95352355-70cd-4e57-8f73-90e43f570e58",
                    "type": "UUID",
                    "name": "fieldMetadataId",
                    "label": "Field Metadata Id",
                    "description": "View Filter target field",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "3079242e-d743-40e3-a308-4ec9a802b798",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "879c17f9-59a2-4012-a593-2a0f80f34fde",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "b00a5af5-5dc7-43a5-8983-6711e689938a",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "1839e3e9-237c-4cba-abf4-2e26ce2d6ff9",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "f8a6abc6-e03b-4bf2-ba71-2baa39a10b38"
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
                    "id": "e9f08024-b2e1-4e1e-acb0-f7cccccc7383",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "02d7d296-90df-4069-8d5e-f23cb33afdd9",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "6472959d-b1b9-4b1e-a9a7-a81bff6de70a"
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
                    "id": "b35edc28-b3fc-47f7-a2e0-66415eb73ae3",
                    "type": "RELATION",
                    "name": "calendarChannel",
                    "label": "Channel ID",
                    "description": "Channel ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4752f9f1-bb95-40d9-b74b-5bd89b7e03f2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3079242e-d743-40e3-a308-4ec9a802b798",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b35edc28-b3fc-47f7-a2e0-66415eb73ae3",
                        "name": "calendarChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fbe30229-d7ed-4a7d-8f9c-9c12e4cb5a9a",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ed93c333-8763-4169-8cfe-8a58c8f1b343",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "beb73da7-788e-46f4-9a83-97c7d496fca6",
                    "type": "RELATION",
                    "name": "calendarEvent",
                    "label": "Event ID",
                    "description": "Event ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cfc95e5b-588d-42c4-b935-e3fed40aa399",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3079242e-d743-40e3-a308-4ec9a802b798",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "beb73da7-788e-46f4-9a83-97c7d496fca6",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8ca22e34-05e4-4cf4-a720-8a8b3f340256",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "33a34d36-f89b-46a1-aa8c-45b79c992b92",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1e8e3942-0300-471a-b050-409af39f3d6d",
                    "type": "UUID",
                    "name": "calendarChannelId",
                    "label": "Channel ID id (foreign key)",
                    "description": "Channel ID id foreign key",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "879c17f9-59a2-4012-a593-2a0f80f34fde",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6472959d-b1b9-4b1e-a9a7-a81bff6de70a",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dd61bf84-aa96-44b6-a160-13fe0a7583eb",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "f8a6abc6-e03b-4bf2-ba71-2baa39a10b38",
                    "type": "UUID",
                    "name": "calendarEventId",
                    "label": "Event ID id (foreign key)",
                    "description": "Event ID id foreign key",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7fa0d7b6-6813-44a7-baae-870757a997db",
                    "type": "TEXT",
                    "name": "eventExternalId",
                    "label": "Event external ID",
                    "description": "Event external ID",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "51d51a9b-34ff-41ff-a600-bae3affc065a",
                    "type": "TEXT",
                    "name": "recurringEventExternalId",
                    "label": "Recurring Event ID",
                    "description": "Recurring Event ID",
                    "icon": "IconHistory",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "39dda0ac-06da-4612-9f72-ed60a1651861",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "29e86006-3c57-4db1-a0db-edec0bf1ae96",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "7cb231af-dc7c-4bde-866d-59fe4fb9ff8a",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "42d98b94-63c1-47d4-bda2-52fd3d2e93f1",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "8c5c92d3-2104-4af1-a807-bbe15a9cabdb",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "dad54cf3-4804-46bb-966a-ce230961c68b"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "6f93d092-d369-4e38-89b0-4dc8b142d188",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "1d05e02a-5e1c-423d-a31f-1a4b9363d1d4"
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
                    "id": "85bc05bb-4a09-49cc-9257-d85b30065db8",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "847c7b0f-5c05-47f6-93af-b0e462b112b0",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "a68b5c12-22ea-4c0f-afea-78c40b8744d2"
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
                    "id": "0fb7ec53-30de-4625-8cfb-40a54eda391b",
                    "type": "SELECT",
                    "name": "direction",
                    "label": "Direction",
                    "description": "Message Direction",
                    "icon": "IconDirection",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'INCOMING'",
                    "options": [
                      {
                        "id": "9b586bc0-7153-4aff-80d2-1b52db7ec866",
                        "color": "green",
                        "label": "Incoming",
                        "value": "INCOMING",
                        "position": 0
                      },
                      {
                        "id": "b653efde-118e-4b6c-ba9b-242f4890c76c",
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
                    "id": "b22a14c9-3fab-4e76-924b-cd17e709271a",
                    "type": "TEXT",
                    "name": "messageThreadExternalId",
                    "label": "Thread External Id",
                    "description": "Thread id from the messaging provider",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "4d4c4699-dfd7-4e42-8c33-0a8cd8b8f6d7",
                    "type": "TEXT",
                    "name": "messageExternalId",
                    "label": "Message External Id",
                    "description": "Message id from the messaging provider",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7cb231af-dc7c-4bde-866d-59fe4fb9ff8a",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "75d1275c-9229-401f-8b05-1dc8640a863a",
                    "type": "RELATION",
                    "name": "message",
                    "label": "Message Id",
                    "description": "Message Id",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7678708a-5e01-4fb1-9087-36270ceb7627",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "29e86006-3c57-4db1-a0db-edec0bf1ae96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "75d1275c-9229-401f-8b05-1dc8640a863a",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1131b488-e2f9-4053-8723-f85bdfee4599",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9da8821d-bb6e-43fa-ad08-d9f79d656dd7",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1d05e02a-5e1c-423d-a31f-1a4b9363d1d4",
                    "type": "UUID",
                    "name": "messageChannelId",
                    "label": "Message Channel Id id (foreign key)",
                    "description": "Message Channel Id id foreign key",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "6919f6a0-1d66-4f85-8971-01fe66ea9509",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dad54cf3-4804-46bb-966a-ce230961c68b",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "a68b5c12-22ea-4c0f-afea-78c40b8744d2",
                    "type": "UUID",
                    "name": "messageId",
                    "label": "Message Id id (foreign key)",
                    "description": "Message Id id foreign key",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "98112809-cc70-43a5-9394-6539a19bd14d",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "8115efbd-d457-45f1-abe5-298fd078dbfe",
                    "type": "RELATION",
                    "name": "messageChannel",
                    "label": "Message Channel Id",
                    "description": "Message Channel Id",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0847fe5d-a6d5-4e7c-9223-c2a49f5fa53c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "29e86006-3c57-4db1-a0db-edec0bf1ae96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8115efbd-d457-45f1-abe5-298fd078dbfe",
                        "name": "messageChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c69856d0-9cb6-49f8-947e-73928dcef1aa",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1e83db22-7076-4b3e-b65b-8402d3805284",
                        "name": "messageChannelMessageAssociations"
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
            "id": "1131b488-e2f9-4053-8723-f85bdfee4599",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "0d6a3491-552a-4fa0-a120-85d49e353797",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "458e7338-4fb1-4781-9684-02b83dc115f0",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "dcbb74df-f1d8-43bf-bf63-57164e731c2e",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "d1ba0c94-4ac8-447c-a3ab-90c2fbdde519"
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
                    "id": "6cee2976-aa4b-446e-9427-e050aab81843",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d1ba0c94-4ac8-447c-a3ab-90c2fbdde519",
                    "type": "UUID",
                    "name": "messageThreadId",
                    "label": "Message Thread Id id (foreign key)",
                    "description": "Message Thread Id id foreign key",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "64a14bc9-dcb0-4ef5-adae-5ee3a0fffde3",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5b682096-6b42-4d51-b735-f86a03a5dabc",
                    "type": "TEXT",
                    "name": "headerMessageId",
                    "label": "Header message Id",
                    "description": "Message id from the message header",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dd6ad5f7-6443-4382-b996-e937700a679e",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0d6a3491-552a-4fa0-a120-85d49e353797",
                    "type": "TEXT",
                    "name": "subject",
                    "label": "Subject",
                    "description": "Subject",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "b1a35bdf-8af7-4668-a137-fe22168ff254",
                    "type": "RELATION",
                    "name": "messageParticipants",
                    "label": "Message Participants",
                    "description": "Message Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c1f8778a-70f9-45df-b22c-47226c82293b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1131b488-e2f9-4053-8723-f85bdfee4599",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b1a35bdf-8af7-4668-a137-fe22168ff254",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b47f4ecf-d8cc-4dab-acb3-ff52c476f306",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "faac9620-995a-4129-ba48-d98ca7a5ac2f",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9da8821d-bb6e-43fa-ad08-d9f79d656dd7",
                    "type": "RELATION",
                    "name": "messageChannelMessageAssociations",
                    "label": "Message Channel Association",
                    "description": "Messages from the channel.",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7678708a-5e01-4fb1-9087-36270ceb7627",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1131b488-e2f9-4053-8723-f85bdfee4599",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9da8821d-bb6e-43fa-ad08-d9f79d656dd7",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "29e86006-3c57-4db1-a0db-edec0bf1ae96",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "75d1275c-9229-401f-8b05-1dc8640a863a",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b855b3d3-aebe-47d9-b12f-bce95c41e9aa",
                    "type": "TEXT",
                    "name": "text",
                    "label": "Text",
                    "description": "Text",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "da5b7510-10bb-4438-b4ea-10a9be954ab0",
                    "type": "DATE_TIME",
                    "name": "receivedAt",
                    "label": "Received At",
                    "description": "The date the message was received",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "dd86cca5-4fbe-49be-9194-63e18ca540e7",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0676a444-72f7-432a-9ba1-987bd8f180d2",
                    "type": "RELATION",
                    "name": "messageThread",
                    "label": "Message Thread Id",
                    "description": "Message Thread Id",
                    "icon": "IconHash",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9eab65f8-3ac5-422c-90e6-bc80fe74dc91",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1131b488-e2f9-4053-8723-f85bdfee4599",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0676a444-72f7-432a-9ba1-987bd8f180d2",
                        "name": "messageThread"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f8a7079-5cdd-4859-9e9b-2a0778b5c81d",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ce304976-1952-4a50-bcc7-da3dfa57c583",
                        "name": "messages"
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
            "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "07d80638-8f4f-4910-a59b-080d6cc4e9f9",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "b012a9ed-2380-451c-abe4-9a72ba28a72c",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "04c30e02-eb47-4ef0-b9d6-6130e5256446",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "5c91d560-c2c5-492f-88da-7a71499897d6"
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
                    "id": "00223915-3715-48cc-890f-2cb2a80271c7",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "aede5852-2003-4c05-aa50-92ac86f491b8",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "aa4c5aeb-52b2-4824-8427-3b15f2f3d73e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b747b725-9159-41ff-9093-40ea7a10e3a5",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "371ad110-b90b-4e9d-8f9d-69bd9484e20c"
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
                    "id": "e3f23ad9-60ac-4c7b-9cad-b2878c88cc5e",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "12f7746b-ceee-4416-a783-be712dc4a9c4",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "49ac677e-a949-4a49-b661-cee988172d7b"
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
                    "id": "daf56e3d-231b-486d-bfde-ff1269fe79c5",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "ffe7ecaf-55b2-4843-a3ae-137ff103884f",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "371ad110-b90b-4e9d-8f9d-69bd9484e20c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "76715fb3-f6b1-4131-9934-71d3b5758e1c",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "c2073fa7-af10-40ff-aefb-3e5c34b98d61"
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
                    "id": "49ac677e-a949-4a49-b661-cee988172d7b",
                    "type": "UUID",
                    "name": "personId",
                    "label": "Person id (foreign key)",
                    "description": "ActivityTarget person id foreign key",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0abb1d02-a846-4055-8e83-481b5acf927b",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "75b31579-ebe3-436a-9ce3-a5dc4098a6e2",
                    "type": "RELATION",
                    "name": "rocket",
                    "label": "Rocket",
                    "description": "ActivityTarget Rocket",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.814Z",
                    "updatedAt": "2024-10-10T10:10:43.814Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ffc752cb-1098-486a-9aa5-05ec26c552ef",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "75b31579-ebe3-436a-9ce3-a5dc4098a6e2",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "907277e2-4d4f-48db-b744-1fe2e734d62a",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "42f8bf35-99f7-4a80-804d-9b20e39ba4c1",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "805b7a19-1764-458c-a6d0-449781fdc272",
                    "type": "RELATION",
                    "name": "activity",
                    "label": "Activity",
                    "description": "ActivityTarget activity",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "44d11033-3c9f-4f72-82a6-095a05da721b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "805b7a19-1764-458c-a6d0-449781fdc272",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fdaf4abc-4a70-4f90-86d1-c7900846f26f",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eb07e13c-54c2-4203-aa82-d2cb8b95ef0a",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "371ad110-b90b-4e9d-8f9d-69bd9484e20c",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0d8726a1-21a6-4a83-8df9-954be9e98735",
                    "type": "RELATION",
                    "name": "opportunity",
                    "label": "Opportunity",
                    "description": "ActivityTarget opportunity",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b10779e5-eebb-4717-a216-a6bf5ecf5f47",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0d8726a1-21a6-4a83-8df9-954be9e98735",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7543c52b-1d38-4c23-82c3-4ebd42c37a73",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "072e3804-4323-4bb0-8c90-650272d74b52",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4e90cb8a-6e79-41d3-9559-49283a6e576b",
                    "type": "RELATION",
                    "name": "company",
                    "label": "Company",
                    "description": "ActivityTarget company",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a460b300-81f5-4a2b-b3fd-367fa13b2689",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4e90cb8a-6e79-41d3-9559-49283a6e576b",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8df4cc6e-4b3b-42ca-b823-de4ff38e77bc",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "05502bd5-0d47-451f-b5b2-b7b461b582ef",
                    "type": "RELATION",
                    "name": "person",
                    "label": "Person",
                    "description": "ActivityTarget person",
                    "icon": "IconUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f6e2e187-ef3b-4a00-9c71-77ec8f0c3056",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0f5e9320-3871-4d80-bba8-bef24b138db1",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "05502bd5-0d47-451f-b5b2-b7b461b582ef",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "df38c335-d5e8-4a57-a591-6bc073e68600",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "94034d9f-b9a7-434a-aad8-68b2a4440e93",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "07d80638-8f4f-4910-a59b-080d6cc4e9f9",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "aa4c5aeb-52b2-4824-8427-3b15f2f3d73e",
                    "type": "UUID",
                    "name": "companyId",
                    "label": "Company id (foreign key)",
                    "description": "ActivityTarget company id foreign key",
                    "icon": "IconBuildingSkyscraper",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c2073fa7-af10-40ff-aefb-3e5c34b98d61",
                    "type": "UUID",
                    "name": "activityId",
                    "label": "Activity id (foreign key)",
                    "description": "ActivityTarget activity id foreign key",
                    "icon": "IconNotes",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5c91d560-c2c5-492f-88da-7a71499897d6",
                    "type": "UUID",
                    "name": "opportunityId",
                    "label": "Opportunity id (foreign key)",
                    "description": "ActivityTarget opportunity id foreign key",
                    "icon": "IconTargetArrow",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "c6bce3e3-16e3-4e31-88b1-4f735cfe2ff7",
                    "type": "UUID",
                    "name": "rocketId",
                    "label": "Rocket ID (foreign key)",
                    "description": "ActivityTarget Rocket id foreign key",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:43.809Z",
                    "updatedAt": "2024-10-10T10:10:43.809Z",
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
            "id": "0d1c7b01-b99a-44e8-80c9-959b8bce280b",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "e8606600-b4fe-44db-be2a-8d72f0acd641",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ee889c8e-7537-41fd-a9c2-a30abb41bb4d",
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                            "id": "e7b34d2c-297e-40b9-a192-2689d27a77d1",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 0,
                            "fieldMetadataId": "32103c54-7d55-49a9-95c5-0afe45aa9b75"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "25449cbb-453e-49e1-90d0-c62e23c7c510",
                            "createdAt": "2024-10-10T10:10:28.664Z",
                            "updatedAt": "2024-10-10T10:10:28.664Z",
                            "order": 1,
                            "fieldMetadataId": "64ff7973-3399-4627-892c-4d3518923d9a"
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
                    "id": "e8606600-b4fe-44db-be2a-8d72f0acd641",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Event name",
                    "description": "Event name/type",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "11a7abd8-cecf-4a4d-a8ae-87a4684d93f2",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ed89fbce-d971-4fbd-9e18-bf793ef95c1a",
                    "type": "RELATION",
                    "name": "workspaceMember",
                    "label": "Workspace Member",
                    "description": "Event workspace member",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5e6c2089-a56b-4e72-b882-06c00ef2f67a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0d1c7b01-b99a-44e8-80c9-959b8bce280b",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ed89fbce-d971-4fbd-9e18-bf793ef95c1a",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d744f7d1-cacc-4e1a-9c40-0f25caa261f3",
                        "name": "auditLogs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59a6858a-772d-4965-b56e-b7c4c22769bf",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "7dd49671-245f-46b8-bc18-8f9b6b550a5e",
                    "type": "RAW_JSON",
                    "name": "context",
                    "label": "Event context",
                    "description": "Json object to provide context (user, device, workspace, etc.)",
                    "icon": "IconListDetails",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "64ff7973-3399-4627-892c-4d3518923d9a",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "549856f0-9d10-42e4-b640-4316059e6247",
                    "type": "RAW_JSON",
                    "name": "properties",
                    "label": "Event details",
                    "description": "Json value for event details",
                    "icon": "IconListDetails",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "32103c54-7d55-49a9-95c5-0afe45aa9b75",
                    "type": "UUID",
                    "name": "workspaceMemberId",
                    "label": "Workspace Member id (foreign key)",
                    "description": "Event workspace member id foreign key",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "e7b3bee5-516c-4eca-b79d-143769de0548",
                    "type": "TEXT",
                    "name": "objectMetadataId",
                    "label": "Object metadata id",
                    "description": "Object metadata id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "1c97c18e-3b7b-4fa7-a644-2347e9144ebe",
                    "type": "TEXT",
                    "name": "objectName",
                    "label": "Object name",
                    "description": "Object name",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "5cb7169b-1e4a-428b-b837-e3dd72665230",
                    "type": "UUID",
                    "name": "recordId",
                    "label": "Record id",
                    "description": "Record id",
                    "icon": "IconAbc",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "ff1ac9f0-4f4f-47a5-a716-a34d455653e8",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
            "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
            "dataSourceId": "515e5fd7-9383-41b2-b9d1-1bebadfb5454",
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
            "createdAt": "2024-10-10T10:10:28.664Z",
            "updatedAt": "2024-10-10T10:10:28.664Z",
            "labelIdentifierFieldMetadataId": "34fb9c32-d142-4107-a62e-55cc128538e7",
            "imageIdentifierFieldMetadataId": null,
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI2"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a54fba04-9275-48ae-828b-e880b6204680",
                    "type": "RELATION",
                    "name": "authoredActivities",
                    "label": "Authored activities",
                    "description": "Activities created by the workspace member",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "752ba769-4bb7-44ba-aa1c-15526717b267",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a54fba04-9275-48ae-828b-e880b6204680",
                        "name": "authoredActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "47fe492f-f3dc-411c-9d71-13ec7db1afa8",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1e3a87c3-7da7-4d25-b646-a09d01a8c3ba",
                    "type": "TEXT",
                    "name": "userEmail",
                    "label": "User Email",
                    "description": "Related user email address",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "633bbfac-7502-4eb3-91fa-8c845855c971",
                    "type": "RELATION",
                    "name": "messageParticipants",
                    "label": "Message Participants",
                    "description": "Message Participants",
                    "icon": "IconUserCircle",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a55b34c4-89e1-4196-9220-c580b0bb5606",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "633bbfac-7502-4eb3-91fa-8c845855c971",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b47f4ecf-d8cc-4dab-acb3-ff52c476f306",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f923e59f-739c-41ec-a4cb-c4adb9e005b0",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2963aae7-8a1d-45fc-9a17-7cb06779b674",
                    "type": "RELATION",
                    "name": "assignedTasks",
                    "label": "Assigned tasks",
                    "description": "Tasks assigned to the workspace member",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "653ef9e8-9041-43a8-860f-cefe5c7e7a9a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2963aae7-8a1d-45fc-9a17-7cb06779b674",
                        "name": "assignedTasks"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "babbdc76-144f-42cd-96a3-f44a3caa4bbd",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "662822a2-18f3-4e4a-a950-512ec8616191",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7306e298-2895-4f78-bf5f-e0b138741eef",
                    "type": "RELATION",
                    "name": "assignedActivities",
                    "label": "Assigned activities",
                    "description": "Activities assigned to the workspace member",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1ccb9704-f27d-4680-9c17-1b91e603f959",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7306e298-2895-4f78-bf5f-e0b138741eef",
                        "name": "assignedActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5cf41c21-1042-4f29-9cd9-0ac57b106e98",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "42f2cebd-e58e-44ff-a2f6-45d892cc6169",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37ab620c-259c-4177-b2c4-3ff7303ce142",
                    "type": "UUID",
                    "name": "userId",
                    "label": "User Id",
                    "description": "Associated User Id",
                    "icon": "IconCircleUsers",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "560d1ba4-34ad-4698-b196-32dc527cd5fc",
                    "type": "RELATION",
                    "name": "accountOwnerForCompanies",
                    "label": "Account Owner For Companies",
                    "description": "Account owner for companies",
                    "icon": "IconBriefcase",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7ffb5a2a-241f-4734-962c-6c26c087653b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "560d1ba4-34ad-4698-b196-32dc527cd5fc",
                        "name": "accountOwnerForCompanies"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c13b2560-f267-438d-b2ec-64ff0eeb0d6b",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5bdc296c-dad9-41b0-90f9-f6006e07cfe1",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "faa10ca1-ab1c-462f-94d1-956f6f1e0a29",
                    "type": "RELATION",
                    "name": "timelineActivities",
                    "label": "Events",
                    "description": "Events linked to the workspace member",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fe08e066-6693-441d-a2cc-4d68595bd942",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "faa10ca1-ab1c-462f-94d1-956f6f1e0a29",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "78cc1621-67fe-40a8-8cb4-8af973f7ad9e",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "daa01e46-5127-4cfd-aae1-bb0a0f9a4746",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d26af909-9e54-470e-bbe3-aea6551d8497",
                    "type": "RELATION",
                    "name": "authoredAttachments",
                    "label": "Authored attachments",
                    "description": "Attachments created by the workspace member",
                    "icon": "IconFileImport",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9f7d9955-d1ef-4310-ade2-6e39e18ac463",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d26af909-9e54-470e-bbe3-aea6551d8497",
                        "name": "authoredAttachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e22cb21d-8ae2-4dc2-a31b-b79b9e25a753",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b447deea-334b-4964-92b8-49dbcf34fdff",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4fbe3539-0e34-4d9b-8551-93c3dfe548e9",
                    "type": "SELECT",
                    "name": "timeFormat",
                    "label": "Time format",
                    "description": "User's preferred time format",
                    "icon": "IconClock2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "90db96a2-7c6a-4f2d-ae77-f6b102370773",
                        "color": "sky",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "7e155874-59d2-4d9e-b6ee-0cdf78736484",
                        "color": "red",
                        "label": "24HRS",
                        "value": "HOUR_24",
                        "position": 1
                      },
                      {
                        "id": "3879e00f-c6af-4297-9274-79b1ca2deb1e",
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
                    "id": "1d2d6bbf-16d0-4921-9d90-537709effb15",
                    "type": "TEXT",
                    "name": "colorScheme",
                    "label": "Color Scheme",
                    "description": "Preferred color scheme",
                    "icon": "IconColorSwatch",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "0f5dcfb2-44d2-467b-86c3-3638027143db",
                    "type": "UUID",
                    "name": "id",
                    "label": "Id",
                    "description": "Id",
                    "icon": "Icon123",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "3acf8d2b-cf5c-49ec-8c07-d1176778aae5",
                    "type": "RELATION",
                    "name": "calendarEventParticipants",
                    "label": "Calendar Event Participants",
                    "description": "Calendar Event Participants",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d4f72554-d396-440c-be8c-e724424ef6b1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3acf8d2b-cf5c-49ec-8c07-d1176778aae5",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b763c893-db54-4b48-bafa-9a9011e983df",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bec01164-379d-49dd-84cd-56fed48d5b47",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "50c8e931-cbd5-4ac6-8c41-ae34cfbd1179",
                    "type": "RELATION",
                    "name": "authoredComments",
                    "label": "Authored comments",
                    "description": "Authored comments",
                    "icon": "IconComment",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "01ed6f59-e77b-452b-8ec5-2ee4802eab57",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "50c8e931-cbd5-4ac6-8c41-ae34cfbd1179",
                        "name": "authoredComments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4639806a-115d-415c-89c9-f0c71414ff80",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c03f44dd-3439-4d9c-a86e-f9d75bd6af7e",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a12e4220-3abd-4632-9d01-d8eff3620aca",
                    "type": "RELATION",
                    "name": "connectedAccounts",
                    "label": "Connected accounts",
                    "description": "Connected accounts",
                    "icon": "IconAt",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "310efb99-b450-47f1-88a5-21d8305c2d3f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a12e4220-3abd-4632-9d01-d8eff3620aca",
                        "name": "connectedAccounts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c50305ed-cb52-433f-9c6a-571990fce400",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d65e4fb3-9efd-4080-99a8-c71f4c05789f",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cf513084-4005-422e-aae2-4d71764fb05c",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites linked to the workspace member",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "699f772b-31aa-46f6-86c3-d09182c170a8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cf513084-4005-422e-aae2-4d71764fb05c",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "61bb6c63-1f01-47f9-90d1-059f25de0920",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fede373e-4961-4516-9f82-fe7aa88642f6",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b09d5118-4588-4323-acf8-5e736e2939ef",
                    "type": "DATE_TIME",
                    "name": "createdAt",
                    "label": "Creation date",
                    "description": "Creation date",
                    "icon": "IconCalendar",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "907513f2-6204-4d25-ab6e-9cf1b721313a",
                    "type": "RELATION",
                    "name": "blocklist",
                    "label": "Blocklist",
                    "description": "Blocklisted handles",
                    "icon": "IconForbid2",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "587905a0-4b1b-4af9-ae29-ec2e45b9ae1a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "907513f2-6204-4d25-ab6e-9cf1b721313a",
                        "name": "blocklist"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d110c026-327b-4536-8b47-8d9a6b2efe6c",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "95e970ca-55e4-4762-8630-9d8be73ce533",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "34fb9c32-d142-4107-a62e-55cc128538e7",
                    "type": "FULL_NAME",
                    "name": "name",
                    "label": "Name",
                    "description": "Workspace member name",
                    "icon": "IconCircleUser",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "89a56c5f-a961-45a3-8f43-4019b02a4714",
                    "type": "SELECT",
                    "name": "dateFormat",
                    "label": "Date format",
                    "description": "User's preferred date format",
                    "icon": "IconCalendarEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "4248c712-3ad2-4627-91ec-727eb67792eb",
                        "color": "turquoise",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "b45414bf-bcb9-4d7e-88c3-398c6f7c73fe",
                        "color": "red",
                        "label": "Month First",
                        "value": "MONTH_FIRST",
                        "position": 1
                      },
                      {
                        "id": "a4431b2f-24e6-40f6-91f4-a4db2d1807c4",
                        "color": "purple",
                        "label": "Day First",
                        "value": "DAY_FIRST",
                        "position": 2
                      },
                      {
                        "id": "1020a38a-c839-4343-adf6-e35767e9b88a",
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
                    "id": "f98a4a42-7586-4b9a-b501-08e6ea786c48",
                    "type": "TEXT",
                    "name": "locale",
                    "label": "Language",
                    "description": "Preferred language",
                    "icon": "IconLanguage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "50e3c6f4-5e1a-4c72-932a-a3db60615c2e",
                    "type": "TEXT",
                    "name": "avatarUrl",
                    "label": "Avatar Url",
                    "description": "Workspace member avatar",
                    "icon": "IconFileUpload",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "989c19a6-7348-4449-b407-fd8e9dbb5a6c",
                    "type": "DATE_TIME",
                    "name": "updatedAt",
                    "label": "Last update",
                    "description": "Last time the record was changed",
                    "icon": "IconCalendarClock",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "96b8289a-adbf-47d3-9421-cd242662b845",
                    "type": "TEXT",
                    "name": "timeZone",
                    "label": "Time zone",
                    "description": "User time zone",
                    "icon": "IconTimezone",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "af7d20bf-77c5-496d-adde-7a7b005d29f1",
                    "type": "RELATION",
                    "name": "messageThreadSubscribers",
                    "label": "Message thread subscribers",
                    "description": "Message thread subscribers for this workspace member",
                    "icon": "IconMessage",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "306d2312-a2bd-4f00-9684-07575aef67b0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "af7d20bf-77c5-496d-adde-7a7b005d29f1",
                        "name": "messageThreadSubscribers"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "77dae991-af08-4495-a4d2-71a094a1b8a0",
                        "nameSingular": "messageThreadSubscriber",
                        "namePlural": "messageThreadSubscriber"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f7e4d070-009a-49c9-9265-d78c2236400a",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c49d917a-5b10-47f6-ae32-2a4d0d34ea13",
                    "type": "DATE_TIME",
                    "name": "deletedAt",
                    "label": "Deleted at",
                    "description": "Date when the record was deleted",
                    "icon": "IconCalendarMinus",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
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
                    "id": "d744f7d1-cacc-4e1a-9c40-0f25caa261f3",
                    "type": "RELATION",
                    "name": "auditLogs",
                    "label": "Audit Logs",
                    "description": "Audit Logs linked to the workspace member",
                    "icon": "IconTimelineEvent",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": true,
                    "isNullable": true,
                    "createdAt": "2024-10-10T10:10:28.664Z",
                    "updatedAt": "2024-10-10T10:10:28.664Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5e6c2089-a56b-4e72-b882-06c00ef2f67a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b77dc6b-d31c-4524-8027-cea780f5fb7b",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d744f7d1-cacc-4e1a-9c40-0f25caa261f3",
                        "name": "auditLogs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0d1c7b01-b99a-44e8-80c9-959b8bce280b",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ed89fbce-d971-4fbd-9e18-bf793ef95c1a",
                        "name": "workspaceMember"
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    }
  } as ObjectMetadataItemsQuery;
