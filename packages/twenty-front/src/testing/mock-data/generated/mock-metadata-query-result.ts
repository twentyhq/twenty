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
        "endCursor": "YXJyYXljb25uZWN0aW9uOjM3"
      },
      "edges": [
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "49f7216e-bc45-4586-9b12-c5287bab69c2",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f022645f-2f8c-4d22-a7a6-563b0c5a372c",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "525c8dae-2cfa-41b2-80c4-49ae2fe927de",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "94d4545e-1d15-43bc-8382-023a1d6f03f5",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "c3381b45-ae7a-4bab-babd-7109e5c26d3b"
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
                    "id": "f7e81f66-cef7-4b3f-8629-9f6f8fe293c4",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "f6718a7f-1095-4ece-8a52-3282d8249000",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
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
                    "id": "bb4bcab2-ebcf-4d78-8f23-4ae37c89f999",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "name": "IDX_7e0d952730f13369e3bd9c2f1a9",
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
                    "id": "f900f442-105a-4a9a-abe6-50fac1f392bf",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "87b2f836-39ff-4b4f-95e7-f96d1f905647",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "dd3fd99b-a320-45e5-a1bc-9813ae08940f"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f8942602-3ebd-4c6c-bc47-96f0e34f9db2",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
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
                    "id": "9914800e-cb3a-47e6-9a7f-fbdd6d1d1ae6",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "6b105731-9675-4776-8777-c437df027766",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "18412b09-974b-4342-a898-06e53e67750b"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "be8f290c-894e-43d0-b255-a565a5c834ae",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
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
                    "id": "2d00fbfd-744b-4385-a819-918f31a51834",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "d6cc177f-4939-488b-9143-5c9af544c636",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9cad7476-7417-447a-898f-e702f4181f3f",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "f62a4ee1-b592-49aa-be86-54c7b77e8991"
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
                    "id": "357b1ee9-a68c-4d46-9f0f-47422ce23f69",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "cb9f9777-1cf3-4bc7-91c5-affa77eaa9de",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f890f0db-4ddd-43ac-8cbf-13a067daf615",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "7775b7fa-bcc5-49c8-8c42-7a81c899f05c"
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
                    "id": "75d27631-a6be-4d36-b826-1d3a21b7a2c5",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "b0a19421-4084-482e-8b9b-35bf467956f9",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b52bfff0-de6e-49c8-972b-4aa6e989fb4a",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "8f8d69ea-206b-4b0f-a743-8dea86ee9b2a"
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
                    "id": "19c161a1-0f33-4974-846e-da5b96a0e41e",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "e355e580-822f-4752-84fa-74eb27f4032b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "093d6adc-e8ea-43fd-82b1-7c6267457918"
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
                    "id": "55e3d646-30f1-4f89-9481-f70c1341fcbd",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6b9c2e47-5d1e-4654-9db1-5af9e3b1f2bc",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "55e3d646-30f1-4f89-9481-f70c1341fcbd",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "42af8b29-9ca5-4e43-b254-ffb38d3f4e60",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8f8d69ea-206b-4b0f-a743-8dea86ee9b2a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "48824956-9d5f-4030-86b8-1e6d1ab18cc3",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "fa7cc428-9b2f-49f5-aa94-2a9529a12570",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "3181c914-3ef0-4959-96be-cc81adabbe52",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3625b437-1cef-4ff5-aab0-667bce288bcd",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3181c914-3ef0-4959-96be-cc81adabbe52",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "04f88aa3-afa8-4f3a-a069-507f51903921",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "047d5f3d-1a7e-4914-b7b8-658ca47f699c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a85d0d55-76f2-44ed-9634-6574b13ced51",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "047d5f3d-1a7e-4914-b7b8-658ca47f699c",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "36ea3277-90d2-4c13-a849-81c019ed0000",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd3fd99b-a320-45e5-a1bc-9813ae08940f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "321eca71-9560-463b-8e17-add170c6eb38",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f65d88ca-cb93-45f7-b117-1ccfd9198aff",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "321eca71-9560-463b-8e17-add170c6eb38",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8657eb38-3650-472c-a57a-95488bf601d5",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f62a4ee1-b592-49aa-be86-54c7b77e8991",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "093d6adc-e8ea-43fd-82b1-7c6267457918",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7317696c-66c9-467c-a11a-644478968fdd",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da86164e-c9c2-45b8-b8fe-63c7c1eedeee",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f2ecf051-770b-4869-a544-1800b276b56c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "330e854f-ff52-4beb-b3e8-1d5d47ab52d4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "18412b09-974b-4342-a898-06e53e67750b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "84a092a7-d6bf-4d36-8105-cbd47dfef6eb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2703abc1-6e14-4730-b96d-b1abbe357721",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "83927bec-c9c1-430f-a458-cb6be374e4ca",
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
                    "createdAt": "2024-10-24T06:44:12.674Z",
                    "updatedAt": "2024-10-24T06:44:12.674Z",
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
                    "id": "9b1c5a76-fb2d-4847-8c0b-4a8b2651a292",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0dafd3bc-1bdd-44ec-a6d5-b334cadde0f2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9b1c5a76-fb2d-4847-8c0b-4a8b2651a292",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "06bc0e07-0b93-45d4-87ad-d45b28e56572",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59e363c3-6f39-4857-a2a7-fe4bc44a6681",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7775b7fa-bcc5-49c8-8c42-7a81c899f05c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d0cf89da-dea4-408f-aa01-e939efc61afd",
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
                    "createdAt": "2024-10-24T06:44:12.675Z",
                    "updatedAt": "2024-10-24T06:44:12.675Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f0a54248-25b5-464f-a4f6-79d2f17f0786",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d0cf89da-dea4-408f-aa01-e939efc61afd",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "496603ed-28e2-494a-92e2-677201ccd295",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d310ad78-36de-42f2-acbd-c34077ce9519",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2061e138-9c37-41ef-803d-686cc995e7d3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d310ad78-36de-42f2-acbd-c34077ce9519",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0b67973d-dc78-4fcd-8f0f-8e2f4f775598",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "49f7216e-bc45-4586-9b12-c5287bab69c2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2dee7a8d-51f7-420c-93f3-e4242335bf86",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a0d6874d-088a-4c50-88b8-180c07fa60b3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2dee7a8d-51f7-420c-93f3-e4242335bf86",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "496b6233-e52f-4cd1-b9fc-29ff0c584bdb",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c3381b45-ae7a-4bab-babd-7109e5c26d3b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3f6ef05a-0e7f-4efb-b434-17ebbfa4a80f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37a21c95-8e20-4e79-8c8d-c518c21c4c88",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0d9ab59a-38f7-4b69-8027-6a23b8ba2e26",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "37a21c95-8e20-4e79-8c8d-c518c21c4c88",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "97bc78da-75d9-4f68-b8b6-fb8de97f8e18",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3227cd31-e9d2-4eea-9cec-99609d7bfef4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9e9f354f-7639-4b69-b31b-163d9377039a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3227cd31-e9d2-4eea-9cec-99609d7bfef4",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0bbe4245-e57c-46ed-a116-c8aa07293313",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "32f478c7-a653-4b90-8bec-a1e6294134f3",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "f90259bb-e2c4-4907-9740-00c74c337fcc",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "f3e6cf7c-2e6a-4c06-9c64-7bd89da0ee6f",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5a082435-88c6-46bf-87e5-2bbe7bde6ee7",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "name": "IDX_260f80ae1d2ccc67388995d6d05",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjk="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1602e80f-f64e-40f4-a2c8-3cc797893b7f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e7ea2036-10ed-4233-8097-89804b6d9c65",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c86a904e-cafe-4061-b218-5da746c98ac6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c33eec23-528f-4c15-b85b-09653412abd4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f90259bb-e2c4-4907-9740-00c74c337fcc",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c86a904e-cafe-4061-b218-5da746c98ac6",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d3c2ce9d-3a77-45f1-8960-4a6a9b0ba1ff",
                        "name": "viewFields"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dc74a040-6fa3-4d7a-a523-83cfe6862606",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "f3e6cf7c-2e6a-4c06-9c64-7bd89da0ee6f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "fb493bfd-2f9c-4006-b377-1a239c159bdd",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "1c8a6354-f0a4-498a-acea-03cd9889f0bb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "af7053f5-c439-4e70-9a65-adf6b5263eee",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d1cc555a-7757-4184-ba4e-9bbb07235a32",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4c10b74c-2404-4819-9562-ce5c8bc41c0e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "14ed1720-1172-4a43-986f-78c8ab0dbf37",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "84f67681-5d11-4d63-b780-4aa012443afc",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "81a779d6-3fe0-44af-884e-d51e3a3d6ae9",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "aaff3ad9-744d-4eb1-a5e3-48585031b660"
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
                    "id": "9bd2a6eb-73e3-46c4-a06f-3a78d3de930e",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "d51462e7-6d78-4a36-bbb8-999a087a309f",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "97d4ac40-e878-4dda-8951-54673921ec5b"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "aceecc53-85b0-4ea3-907f-068de9aed4d5",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "82607b87-3f02-4662-ae68-bb4ff587d6b2"
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
                    "id": "458e9630-509e-42b0-905e-4b4bd82287d2",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "8e0e3aa2-1434-42e4-a6ef-7d8b4fa80474",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "3e6819d1-23a8-40e7-891b-776911b2b68c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "52bcefd1-399d-452e-9721-ac44c949ccf0",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "97d4ac40-e878-4dda-8951-54673921ec5b"
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
                    "id": "99eb97a1-d2af-4323-a93f-98ccaf19cf89",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "6fa531a2-8d65-4722-a3b3-29af7112b440",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "97d4ac40-e878-4dda-8951-54673921ec5b"
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
                    "id": "7b39b6b3-1de6-4f69-97e5-4936a56c855c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "3e6819d1-23a8-40e7-891b-776911b2b68c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6af8f07e-7d53-4d24-b9d6-aa4e6c61eb41",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "584686e7-843b-4f5d-ac44-403cb0a5b389",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e8db1ac4-b575-486c-b380-e7cd050b9795",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "584686e7-843b-4f5d-ac44-403cb0a5b389",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b4b455e2-455c-4477-8d93-c8829af111e9",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ad61839a-cb78-4e30-a970-8299fe194dd8",
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
                    "createdAt": "2024-10-24T06:44:12.688Z",
                    "updatedAt": "2024-10-24T06:44:12.688Z",
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
                    "id": "a16f4872-42bb-4d81-8b34-acd4eeef33ab",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1f3ea8ef-d977-47b6-861b-d03f02005ea9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a16f4872-42bb-4d81-8b34-acd4eeef33ab",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8f190133-f843-417c-bf3c-cc99cb9f1309",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5d7d4d81-e942-4cd2-ad07-7638a14cfe7d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3a779979-4ccf-4fc6-914f-f21302737925",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5d7d4d81-e942-4cd2-ad07-7638a14cfe7d",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1854c9ea-7e26-4ba8-8274-83c4339cdfb8",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "826abff4-58c9-4be9-8773-7d6485b10823",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "14ed1720-1172-4a43-986f-78c8ab0dbf37",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "aaff3ad9-744d-4eb1-a5e3-48585031b660",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f0b5bd8c-282b-42f7-9102-299d04890e04",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6b6a42cf-21d8-45dc-bf29-1fee334aab77",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f0b5bd8c-282b-42f7-9102-299d04890e04",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "baea5730-25af-4c44-a349-09c13c34ee24",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b1f67d51-1d6a-4b59-9aa8-6ca1771510bd",
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
                    "createdAt": "2024-10-24T06:44:12.689Z",
                    "updatedAt": "2024-10-24T06:44:12.689Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c41a7527-ea0e-486a-9aa6-035d1fe1fef6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b1f67d51-1d6a-4b59-9aa8-6ca1771510bd",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cec56a37-a8b0-4968-a216-be6878d2c49e",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "97d4ac40-e878-4dda-8951-54673921ec5b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "82607b87-3f02-4662-ae68-bb4ff587d6b2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "e633c380-a719-4203-9a48-c5122f816ed7",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "90cf9a29-d889-4f85-9bb5-148ad5d4e9c0",
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
                    "id": "79cac0e9-8d02-4e21-9eb0-fc86a5161bfe",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "049577e2-c30d-4ac9-abeb-1d8bdf173ba2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2b2e743c-d583-45d1-8522-8d4d60bcbc69",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7e45521e-0c4f-423c-8160-02c8cdcd1af5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f63435d7-4c96-4bf0-b7a0-d0cafe50e30a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c4793372-870a-457c-8291-88b6f351fb4f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c55b770d-e5df-4341-9162-2cf6d1bf089e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4c1197cd-7a09-47cd-b48b-c2e964130a69",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "789b2a37-67ed-43b9-a4d6-6af57a97e10a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "81970612-52e7-43f6-acab-700357b45943",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d9631e05-ebc1-4037-8cf8-e9847c564721",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "3c33409e-bdb2-4dc1-a7f6-010e61042dc9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "092b2a3f-0c15-424e-864b-09628978cd2b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "96af79de-ef09-4d25-b668-8c6cced6370f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e633c380-a719-4203-9a48-c5122f816ed7",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "092b2a3f-0c15-424e-864b-09628978cd2b",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "29d8317d-268a-4cd8-920d-7c98489c214d",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "955c8cf2-7179-4a95-8516-d75d92dd06a1",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08f12e65-4aad-4770-b067-40e6cf9febde",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c8fa30dd-e861-401d-b8fc-2466f1fe0e7b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4b577ec5-0271-43f1-aa63-ef30abc3b580",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bbd23f14-1779-448e-804c-79c6df08e8e9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e633c380-a719-4203-9a48-c5122f816ed7",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4b577ec5-0271-43f1-aa63-ef30abc3b580",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3443ab0d-6636-48eb-b4a6-a2420d4c308d",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e82314d3-d5d5-4fa9-87fe-1a477089c66b",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "90cf9a29-d889-4f85-9bb5-148ad5d4e9c0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "70e81e10-cc09-4c52-882f-b66371f7fe38",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "fdd7af70-b658-4f04-9523-5043e306d645",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4debe3b3-4f1d-4e94-a015-1eb4baa8515f",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "b2f0eea9-1f2d-4c3b-9e50-3904e601fc43",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "d3405e44-b356-47d1-9ea0-a80395e55be0"
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
                    "id": "699bf6da-edc6-4692-ab22-d1c0f9cb8078",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "955cfa69-cca8-4820-8586-25c4718cab9b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "ceec7abf-a8d1-41d7-9bca-a88900bd616e"
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
                    "id": "cc2e2a29-c6c8-4c17-ba20-4129ce29eac9",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "52e4a1d3-6da7-4574-9d5d-009e4a0c84d4",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "701ed3d0-7279-4870-a1cf-76bdae22a3d5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "07c2796e-7729-4d02-98ba-bb4e5eb1a075",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "d3405e44-b356-47d1-9ea0-a80395e55be0"
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
                    "id": "02075b19-6e20-43d8-9fe4-51062592e8fa",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "0e982e6a-b421-4cf2-9b14-b8f594b8e7da",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "5afceff2-df59-4001-8670-e3426fa93383"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "453d52c1-b71a-4994-b213-d8eed4c642f7",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "d3405e44-b356-47d1-9ea0-a80395e55be0"
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
                    "id": "40a2da66-a4c7-422e-a53f-1f521ae3fb8b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "fdd7af70-b658-4f04-9523-5043e306d645",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d3405e44-b356-47d1-9ea0-a80395e55be0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7fe412b4-051f-4082-ac11-92c796e6322f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e59c1e7c-3a2c-4376-bb01-19bde184a05e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e618c44b-2bb8-434d-ae55-5567cafe13da",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e59c1e7c-3a2c-4376-bb01-19bde184a05e",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1808ac24-2736-4a3f-ad5c-04b4f9fa6d64",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0f9ef777-7896-4c77-a720-531af7a72c46",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eabcbb59-e8c1-4dcb-9919-fd2511fbb854",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0f9ef777-7896-4c77-a720-531af7a72c46",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e37bf0e5-ae55-431b-8201-1927c90f8e12",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "701ed3d0-7279-4870-a1cf-76bdae22a3d5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "19eac652-6e76-4bf3-9cf8-6a2abbdec4cb",
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
                    "createdAt": "2024-10-24T06:44:12.677Z",
                    "updatedAt": "2024-10-24T06:44:12.677Z",
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
                    "id": "df643967-3450-4043-a3ca-09f30ed8422c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bc09de35-a72e-49bb-9715-9ee464947863",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "df643967-3450-4043-a3ca-09f30ed8422c",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b9ffb8ca-f9ee-43d5-b666-b521e2b628d7",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d898bf7d-ac9d-4073-bb8f-91173b6de53c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d8b5e77a-09bc-4afb-a6f6-136e75fa26cb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d898bf7d-ac9d-4073-bb8f-91173b6de53c",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "918cd6b3-5513-45da-8a11-32af1388b4b8",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8310cd37-c4a7-4b74-8fbb-e5f59ef645e6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ceec7abf-a8d1-41d7-9bca-a88900bd616e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5afceff2-df59-4001-8670-e3426fa93383",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a7a3eb67-8e01-4e88-8764-18658da3047c",
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
                    "createdAt": "2024-10-24T06:44:12.678Z",
                    "updatedAt": "2024-10-24T06:44:12.678Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a1855dd0-ab59-47c1-85e5-8b5923bd7428",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a7a3eb67-8e01-4e88-8764-18658da3047c",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c755c699-88fe-48a6-b626-b796e23581ce",
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
            "id": "dd6868d4-f36c-428e-8da6-cdb2adce4e2c",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "859c5903-3eff-4d16-91f3-70d8099cbc68",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "878a10da-a99e-4880-b5b3-bbb8c005130b",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "name": "IDX_7d1b454b2a538273bdb947e848f",
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
                    "id": "d7abca8d-1765-495b-bf1a-89ba8ce6b239",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3bf45b66-48dc-41cb-aa9b-209673dbd8c8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "90a3c34b-b465-45af-b8de-926d0bad4620",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ed077d2c-6d1b-491b-b9b9-1ca93821d5b7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "859c5903-3eff-4d16-91f3-70d8099cbc68",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "856980a1-ebbe-4d1e-b4a0-de4237200dff",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d37a9105-c594-4b95-abf4-6e0b305d63fe",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "e20680c8-c17e-4977-a7a9-80425632bf96",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "f5705c55-f1d7-42fc-b2ab-7023517e3872",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "98a162b7-b987-425f-983f-62416069216b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "dd6868d4-f36c-428e-8da6-cdb2adce4e2c",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f5705c55-f1d7-42fc-b2ab-7023517e3872",
                        "name": "calendarChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "21b32191-72dc-410b-bb8a-3d6531dafddd",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c298b310-a6a3-4062-a751-42679ceb795e",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d58ed761-82e0-4348-aa60-02774c188d74",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8b04d26-cd27-4aec-9b53-3ba540ccf32a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "dd6868d4-f36c-428e-8da6-cdb2adce4e2c",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d58ed761-82e0-4348-aa60-02774c188d74",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e69c4a96-cfb7-460c-aba7-011cbf5c1351",
                        "name": "connectedAccounts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a2efd715-0479-456b-b8ad-32c9947703a2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a41327bc-5ee8-4225-a743-144a7a6e149f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b464aae3-d0b5-4cfa-a259-14f22d7d437e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "700de574-9961-4e9f-989c-23c66021b5e0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "dd6868d4-f36c-428e-8da6-cdb2adce4e2c",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b464aae3-d0b5-4cfa-a259-14f22d7d437e",
                        "name": "messageChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a16daa83-d9ad-4b50-8283-744b83846e78",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6a5ad669-9654-45f3-b878-19d12322708a",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1eb85e9f-5f97-458c-b6fe-3305c4c6ba7d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d14e26c3-e5e0-4746-99b0-ff2a6a6e03cd",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "230e8d81-76b4-44e1-a541-0a1e93687ef6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "42475070-4dd8-4948-b08e-aecea99dc32b",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "2ebb05fe-99fc-486b-bf95-10392e07f2f8",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "6c88c747-bc67-48a4-aab7-81b0d676e83c",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "2c3f774e-7e13-4ede-962e-1accadbb7233"
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
                    "id": "9fd49151-0bf6-4076-9a71-b77c3fb8d75a",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "cf4bbebb-ea0f-49a9-ad61-a21f7cfd63ca",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "04adfd01-e7ac-405b-8f96-55367b9b8272"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "868cd5c1-2546-4c18-bc5f-66e27054e7f1",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "38d835e6-4a66-4af5-8877-4d5083eed3fa"
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
                    "id": "5c32172d-28e7-4f25-8679-99215fc361d6",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d1027af4-e9bd-4d8e-91fe-630bb9b13aaf",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "a55b3b82-31f1-497b-b7b0-34979a269c15",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "c9d6886b-7d90-4d63-81f0-e6cb8ac5868c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4d2be469-6130-45da-9fac-4bf09fd7311f",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "04adfd01-e7ac-405b-8f96-55367b9b8272"
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
                    "id": "23ef56b8-fcd1-4524-8066-7bf0b8110e18",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c9d6886b-7d90-4d63-81f0-e6cb8ac5868c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2c3f774e-7e13-4ede-962e-1accadbb7233",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eca01fe0-690c-4c1d-a69d-46c61a2fe828",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "69acb392-54f7-426e-9cda-e47a161f7daa",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eca01fe0-690c-4c1d-a69d-46c61a2fe828",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c9bc2775-bf90-482c-b789-3a91bbda3082",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "04adfd01-e7ac-405b-8f96-55367b9b8272",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "865a0b6e-22a8-44b2-bf3d-3fab9acfd040",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9adde7f7-a0eb-4bf2-b758-b6b6a78b7337",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2725f9ad-6262-4eda-bc19-f0e4363ccef5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8d3cede2-7776-495c-98b3-22fa336035e1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2725f9ad-6262-4eda-bc19-f0e4363ccef5",
                        "name": "pointOfContact"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "71190da2-023f-4c16-8a89-30b5e9098907",
                        "name": "pointOfContactForOpportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b219c5b2-2e95-41e6-91fc-8a87b393b327",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "baea5730-25af-4c44-a349-09c13c34ee24",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6b6a42cf-21d8-45dc-bf29-1fee334aab77",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "baea5730-25af-4c44-a349-09c13c34ee24",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f0b5bd8c-282b-42f7-9102-299d04890e04",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f5efbacd-9768-41b6-8c9b-55d2044febfd",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0673ef58-0e1d-4f91-9687-8392c39896e6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "38d835e6-4a66-4af5-8877-4d5083eed3fa",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'NEW'",
                    "options": [
                      {
                        "id": "02974b70-be39-4959-b649-7f2b487cbf7d",
                        "color": "red",
                        "label": "New",
                        "value": "NEW",
                        "position": 0
                      },
                      {
                        "id": "4c96ee9d-b49d-42d1-89d3-6f7b076a2451",
                        "color": "purple",
                        "label": "Screening",
                        "value": "SCREENING",
                        "position": 1
                      },
                      {
                        "id": "bdb36f4e-d744-4071-9e37-94d77f2e7057",
                        "color": "sky",
                        "label": "Meeting",
                        "value": "MEETING",
                        "position": 2
                      },
                      {
                        "id": "07709a84-315e-490e-8975-f4e2889ccf83",
                        "color": "turquoise",
                        "label": "Proposal",
                        "value": "PROPOSAL",
                        "position": 3
                      },
                      {
                        "id": "4d451369-cd00-4b39-a7dc-5e8154121d5d",
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
                    "id": "1808ac24-2736-4a3f-ad5c-04b4f9fa6d64",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e618c44b-2bb8-434d-ae55-5567cafe13da",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1808ac24-2736-4a3f-ad5c-04b4f9fa6d64",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e59c1e7c-3a2c-4376-bb01-19bde184a05e",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b1145905-e5c8-4b49-aba8-48122aa34d95",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "496b6233-e52f-4cd1-b9fc-29ff0c584bdb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a0d6874d-088a-4c50-88b8-180c07fa60b3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "496b6233-e52f-4cd1-b9fc-29ff0c584bdb",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2dee7a8d-51f7-420c-93f3-e4242335bf86",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5a4f7372-9284-418a-b67a-7243b9f10d88",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0f2ea0b0-5103-47b7-af69-51523d98068c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5a4f7372-9284-418a-b67a-7243b9f10d88",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c26ae3e8-ac34-4972-b6ec-1566e1492aef",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "24e3e725-b1b9-443e-923c-be1bed10a6b1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b2f6300c-af72-4b5a-918d-7afe5e3aa2b7",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "24e3e725-b1b9-443e-923c-be1bed10a6b1",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "67c23286-5728-43c4-bb41-6ed5a486dcd5",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6ad04543-ac3c-4e80-8748-51a18dd40568",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "42475070-4dd8-4948-b08e-aecea99dc32b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5e30c325-c1d7-4e75-8dc3-111036587978",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a6a4e683-50cc-4180-a1c3-a948a1ea4da3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5e30c325-c1d7-4e75-8dc3-111036587978",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "74983410-62bb-45bc-a7b5-a4eae4f0d987",
                        "name": "opportunities"
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
            "id": "cabae7da-efc6-4f43-ab53-2e7f58216eb7",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "9af79401-3f8e-4e06-8442-32c43549ee5d",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "866816ae-003b-4a2b-829a-bdb7ae5a6b5f",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "c0643e35-d0e1-4458-8fed-1a08a3341a7e",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "612e9c62-dd44-4eb1-ada4-3021674118de"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d458254e-1e74-4c07-976a-ca0dfa18feaa",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "72fcd04e-a47e-4985-8de4-26b8a5adb7f0"
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
                    "id": "8bf75419-763e-4aa1-a602-ae9d1cf3c2cd",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5607f7fb-87d3-41d1-8d83-48ac5dd96c02",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cabae7da-efc6-4f43-ab53-2e7f58216eb7",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8bf75419-763e-4aa1-a602-ae9d1cf3c2cd",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e9eaa5e5-1b58-4ae4-8ee0-df5b28d1e304",
                        "name": "viewSorts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "72fcd04e-a47e-4985-8de4-26b8a5adb7f0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "612e9c62-dd44-4eb1-ada4-3021674118de",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "89ef13e7-05d3-452b-b6e9-567c4aa76c13",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "55ac4d77-69f7-4db1-8db9-321b90f2c647",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "9af79401-3f8e-4e06-8442-32c43549ee5d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "6b99e943-5481-4693-bfe7-68355ac6e6ac",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a84c5bf3-aed3-4ea9-9a2d-fb3e26d48cae",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "c7179c98-c344-475e-83ca-67e516265c86",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "ca384bb1-7f16-4a90-9ba8-8c72c225dab4",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "59baba02-5c39-438b-86e0-635993594a5e",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "02215099-469f-48c3-a313-0f9eebbc8630",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "a375f0ef-053a-4d2f-92ae-7a681813775b"
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
                    "id": "ca384bb1-7f16-4a90-9ba8-8c72c225dab4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "9b468c88-f084-42d0-91c0-8935ebc92a41",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0b8a6ada-0545-4899-a1dc-12c48450b950",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a375f0ef-053a-4d2f-92ae-7a681813775b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "35874c56-44df-4ac2-bf48-d04b4fca6e0f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "dcd28787-ffe6-4784-aa71-90c82a35d599",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "630d049c-3f66-4a65-972b-e1919a2a2f79",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "035b4a86-1a3f-448c-8abf-d131d358b474",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "cd349868-7f2e-4ac6-b171-f61442f15dcc",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "54ee3076-7cf4-47f5-98b5-79097284f049",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b8d2963d-e063-473b-99f9-3ec0ca14a2f7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4aad81a8-b112-4836-bfc6-f09b19beb89a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1a5b4a80-cfcb-4497-9380-6b747c758461",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c7179c98-c344-475e-83ca-67e516265c86",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4aad81a8-b112-4836-bfc6-f09b19beb89a",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "94c32206-a4d5-4c6e-9afb-4706b9892418",
                        "name": "auditLogs"
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
            "id": "c104944f-59da-4510-9a41-1d08c2da37e0",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "b223c8c9-b9c1-4129-aed1-f9f160d85292",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d9ffc7ff-dad4-4431-bc6e-8ee2bddd42f5",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "6d7ce670-8575-4f18-a395-97b2d031cb46",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "b0dda136-270e-4cc6-99ae-8a0cfff1e48f"
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
                    "id": "0df2a4a1-ba97-4361-8928-b3a8382cc72a",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "d3fffd79-5a67-4dcb-b29f-ff492da8a9c6",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "dd3e2dc7-441d-4993-8e38-e7e706199f6a"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9c5095a3-abc9-44c7-bb5b-42064425c2c0",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "eca5dda2-f82c-4852-a88f-66a28deeeb1d"
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
                    "id": "14ba2945-edd2-48b1-adf7-961bbf8f4efe",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b223c8c9-b9c1-4129-aed1-f9f160d85292",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b0dda136-270e-4cc6-99ae-8a0cfff1e48f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eca5dda2-f82c-4852-a88f-66a28deeeb1d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "88d9dee3-beed-4d8e-8660-6f3b0b7bf24d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b9ab9415-115f-4b9f-a2c3-e39564d0697f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c104944f-59da-4510-9a41-1d08c2da37e0",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "88d9dee3-beed-4d8e-8660-6f3b0b7bf24d",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f8497670-2720-4a88-9a67-3a1a2b1141e4",
                        "name": "authoredComments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd3e2dc7-441d-4993-8e38-e7e706199f6a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "bf849f34-be34-48fe-8892-625283ec08e4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2fbf3233-7ba8-41d4-acaf-b29a28351b71",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ec9cde84-ba59-42c3-a33a-633f3f9a4247",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c104944f-59da-4510-9a41-1d08c2da37e0",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2fbf3233-7ba8-41d4-acaf-b29a28351b71",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0605299c-a662-4df9-80ed-5a232b7430be",
                        "name": "comments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ad0dc24d-9080-495d-a908-e323b5088860",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "48503b4e-8cd4-4a58-89ed-6b9483500f06",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEy"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a6be8834-a288-422f-9b4d-9f98271c5776",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ac0a90d8-6dc9-4aea-afea-8cf1a091c977",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59593af4-3013-4d3b-a7fa-02b9bd6eac59",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d6bf83d6-7090-4d2a-b260-a2456c7d87d0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "59593af4-3013-4d3b-a7fa-02b9bd6eac59",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6f2cad20-f363-4b9f-9e51-1e40affa7cb7",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "48503b4e-8cd4-4a58-89ed-6b9483500f06",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "8c4c2a5f-d75c-409b-aaf2-50116f1c3a67",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "15339f86-c585-42b0-bbd8-c8f6b0a45848",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "07824344-d59f-4d01-b811-cbfa59127cb4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "db3a3f1e-66a1-4ac6-9818-3419a8fefdae",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "aa185176-fe60-4d4c-befb-6ef84d99f733",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "db3a3f1e-66a1-4ac6-9818-3419a8fefdae",
                        "name": "eventListeners"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7d168431-7c54-414e-9e33-57601a057eac",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "96a4ee75-ad1c-4a43-b5e3-66b47b032d1b",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "04f88aa3-afa8-4f3a-a069-507f51903921",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3625b437-1cef-4ff5-aab0-667bce288bcd",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "04f88aa3-afa8-4f3a-a069-507f51903921",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3181c914-3ef0-4959-96be-cc81adabbe52",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0960583d-3fc4-4763-9f87-819b6d83fc5d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "42ba2450-1034-4e41-9243-b99f4c2db1d9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0960583d-3fc4-4763-9f87-819b6d83fc5d",
                        "name": "versions"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f37cb1c6-737e-4e51-9722-5b9c4aa85b7c",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ef8dfe93-1264-4366-bfdb-1936242c0447",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2847d55e-f9d5-412d-9aa2-3742a3e4e51d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "718202a8-5936-4308-a2ab-c5ae8146faf7",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2847d55e-f9d5-412d-9aa2-3742a3e4e51d",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5dfbfab8-07c2-4289-af1e-59183e456e5e",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5aba30ed-d49e-423c-aa27-7cdc96e32eed",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "a0011eea-de44-4b77-8d5f-7bc58c922d10",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "85f08f11-18d0-4fed-83e5-10363862ef05",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "be6790a8-3a5b-48e3-a922-1c7e481b7921",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "e66cb6b4-87ff-4aef-be50-f80514b12095"
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
                    "id": "539bc517-009b-437c-b471-82a5a5f90b8c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a7a5692a-812a-4ffa-b959-e76ef40c1ef2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b8457c33-6f84-4f58-9022-eda5a2b43ea7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b059824e-8feb-466e-a9b5-34f703dfbcc9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b8457c33-6f84-4f58-9022-eda5a2b43ea7",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "34de8f01-a2f8-4ae8-aa4b-665d9c3a6f85",
                        "name": "assignedTasks"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "713ec72a-a96c-43eb-8e88-2c8ce72d860c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0707ad68-b093-46a9-a865-ef4481b128de",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b22a4bfb-86b8-4f85-9a27-fc25957a7026",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0ee65203-4f34-43b8-89b7-41b244f5757c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b22a4bfb-86b8-4f85-9a27-fc25957a7026",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9b86f0f9-e579-46e2-a04a-bfe2ef0ba32e",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ffea272c-5f34-482b-82ad-9810b4261e8a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8f190133-f843-417c-bf3c-cc99cb9f1309",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1f3ea8ef-d977-47b6-861b-d03f02005ea9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8f190133-f843-417c-bf3c-cc99cb9f1309",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a16f4872-42bb-4d81-8b34-acd4eeef33ab",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "024af722-0516-4c1a-a2f0-96062747534c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b413df7e-8beb-4b27-8c6d-524ca67a18e3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "024af722-0516-4c1a-a2f0-96062747534c",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fa831fd2-a4e6-493d-ba0e-7d6cf16471ac",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d805cb5b-ee62-4396-ab85-fee86bdb344f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "510fdffa-0612-4b0e-a048-23be378b1575",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4add3f25-81bb-47f1-a0ad-ea84e2fd554e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0b67973d-dc78-4fcd-8f0f-8e2f4f775598",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2061e138-9c37-41ef-803d-686cc995e7d3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0b67973d-dc78-4fcd-8f0f-8e2f4f775598",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d310ad78-36de-42f2-acbd-c34077ce9519",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e614a920-31f0-4602-bf41-a40f54288f8c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'TODO'",
                    "options": [
                      {
                        "id": "85b6a055-4a77-424d-87ce-c2012edd6cef",
                        "color": "sky",
                        "label": "To do",
                        "value": "TODO",
                        "position": 0
                      },
                      {
                        "id": "843a56a5-2a3b-4580-917d-2fedca5f9904",
                        "color": "purple",
                        "label": "In progress",
                        "value": "IN_PROGESS",
                        "position": 1
                      },
                      {
                        "id": "92fd991a-237b-4560-957f-8fb5f47fae6b",
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
                    "id": "a0011eea-de44-4b77-8d5f-7bc58c922d10",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "e66cb6b4-87ff-4aef-be50-f80514b12095",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "f37681ad-99e4-4b46-be7a-475b12ee51b2",
            "imageIdentifierFieldMetadataId": "7bd06046-658a-4bfe-aadb-6f7c0d6f9a98",
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "1d24391b-c06c-48a7-acdf-3568012fd237",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "9353711e-c452-4378-9ab8-ee44801f4367",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "87fc7e32-3ea8-4f74-8f6f-ad2067b7e914"
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
                    "id": "7a074240-407f-41bb-93a5-5412f9cb83f2",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "name": "IDX_UNIQUE_87914cd3ce963115f8cb943e2ac",
                    "indexWhereClause": null,
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
                    "id": "5d0b4f73-d228-4d55-8c44-832d69146368",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "9b820f47-392b-4e49-b1d6-63a869f2004d",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "d0767ac8-7bcd-468b-a2ac-64ac57ab8ca3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "1240c77c-59d7-4cfc-b65f-fed41c412826",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "eed00ec2-f0e4-4314-939d-63a3fa6093c4"
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
                    "id": "3162d387-0524-4932-a9e0-36de66f7b054",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3ad9479a-0ddd-4101-9c9a-97e97e818879",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3162d387-0524-4932-a9e0-36de66f7b054",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "023a546f-6f8a-47ec-85bd-9601e7dcdcbb",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1854c9ea-7e26-4ba8-8274-83c4339cdfb8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3a779979-4ccf-4fc6-914f-f21302737925",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1854c9ea-7e26-4ba8-8274-83c4339cdfb8",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5d7d4d81-e942-4cd2-ad07-7638a14cfe7d",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "71190da2-023f-4c16-8a89-30b5e9098907",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8d3cede2-7776-495c-98b3-22fa336035e1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "71190da2-023f-4c16-8a89-30b5e9098907",
                        "name": "pointOfContactForOpportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2725f9ad-6262-4eda-bc19-f0e4363ccef5",
                        "name": "pointOfContact"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ea2699db-fd59-4516-9778-7e66e8ad3d9c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b9ffb8ca-f9ee-43d5-b666-b521e2b628d7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bc09de35-a72e-49bb-9715-9ee464947863",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b9ffb8ca-f9ee-43d5-b666-b521e2b628d7",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "df643967-3450-4043-a3ca-09f30ed8422c",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7bd06046-658a-4bfe-aadb-6f7c0d6f9a98",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "50773145-083d-4532-82e6-7001d19d3476",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "817e061d-4038-47ec-b347-124ffb6a787a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "50773145-083d-4532-82e6-7001d19d3476",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1d131bb7-5dcf-485e-93e3-a867c440355b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b4f6a046-b81d-4d29-a024-43cf60cd3baa",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5f721ca2-5293-4920-8b7f-d145e49d03bc",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8e37619b-816a-4653-88ed-bb8319298949",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5f721ca2-5293-4920-8b7f-d145e49d03bc",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3443ab0d-6636-48eb-b4a6-a2420d4c308d",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0cc76e72-4aa4-4b4c-990f-d0e14868ffdd",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3e7a430b-51cc-473e-a227-f7ad76f51326",
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
                    "createdAt": "2024-10-24T06:44:12.507Z",
                    "updatedAt": "2024-10-24T06:44:12.507Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "2e40e217-ad1e-42f7-a190-fd75e5b4ab46",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "b2bb0395-c4b9-4a21-b3b4-3370f515abbc",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "143b82b3-cd5a-4811-b5cd-0cf11f850038",
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
                    "id": "a057e3e8-daf6-4683-ba15-55524745abb0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "cde156e2-ea24-4096-bcc6-7bc6540e8a0f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "87fc7e32-3ea8-4f74-8f6f-ad2067b7e914",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5fd61267-e411-445f-a3bf-38e05f59e00f",
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
                    "createdAt": "2024-10-24T06:44:12.423Z",
                    "updatedAt": "2024-10-24T06:44:12.423Z",
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
                    "id": "b4ca1f44-7b4a-4b87-ab25-7a35e5cd35e4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eab38cd6-2c7d-481c-b196-ffcbc0bd3b6c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b4ca1f44-7b4a-4b87-ab25-7a35e5cd35e4",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "775ab777-e191-4475-9223-14fb864a93d9",
                        "name": "people"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f95afa01-a01e-4e42-aa8f-1f26d27061d1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4f22cd7f-b0b0-41e4-a2b6-a42886cc26a1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "31917081-2439-4778-a25f-0eefeae7770e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4f22cd7f-b0b0-41e4-a2b6-a42886cc26a1",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0a60b4be-57f3-42ed-826d-67fb14aec2ee",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eed00ec2-f0e4-4314-939d-63a3fa6093c4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1fd84a28-871a-4f3f-abdd-74b19e8131bf",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9c93f0cb-81f3-44b0-a5ba-30e70634f342",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1fd84a28-871a-4f3f-abdd-74b19e8131bf",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "37ac5daa-ba32-40f3-8b74-e86ca8262309",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "147b5216-7ce6-4b62-a2cd-228fa3290192",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "8657eb38-3650-472c-a57a-95488bf601d5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f65d88ca-cb93-45f7-b117-1ccfd9198aff",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8657eb38-3650-472c-a57a-95488bf601d5",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "321eca71-9560-463b-8e17-add170c6eb38",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f37681ad-99e4-4b46-be7a-475b12ee51b2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "1d5fd629-40fb-4b40-9f9d-5042a9c54fa6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d0767ac8-7bcd-468b-a2ac-64ac57ab8ca3",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b4fc7a1c-838d-488c-83be-16c81cae9dd2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "27bafd40-bff5-46f0-9c0f-2704c98bb827",
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
                    "createdAt": "2024-10-24T06:44:12.342Z",
                    "updatedAt": "2024-10-24T06:44:12.342Z",
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
                    "id": "c4810e8d-eb8e-4266-bb48-fab44c48b92c",
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
                    "createdAt": "2024-10-24T06:44:12.588Z",
                    "updatedAt": "2024-10-24T06:44:12.588Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "95407c92-1adb-441f-8c60-6d4eefd9d48f",
                        "label": "1",
                        "value": "RATING_1",
                        "position": 0
                      },
                      {
                        "id": "a70d8926-ee3f-4e55-8afd-958580b605f2",
                        "label": "2",
                        "value": "RATING_2",
                        "position": 1
                      },
                      {
                        "id": "65769a46-7684-4d80-9927-9d177fb36528",
                        "label": "3",
                        "value": "RATING_3",
                        "position": 2
                      },
                      {
                        "id": "03fcbb1b-d722-4008-8731-83f12f7ec676",
                        "label": "4",
                        "value": "RATING_4",
                        "position": 3
                      },
                      {
                        "id": "6a4722f6-d7f3-4dcf-97cf-30a977bb59e0",
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
                    "id": "4cdfc0b5-5f1c-44de-9ae5-b86430f7bb2f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "343d6598-27a1-4d29-ae5c-33eff309eb96",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ff2df453-bb69-4512-9a6f-c403c67a07fc",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7b7f28a6-ae08-4368-812c-4416dcb775c0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "3bf10619-f477-4bbc-976b-359ca9786b2d",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "2f03178b-03d6-4f8f-9815-63e7c7269f03",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "88ff14ff-74dc-43fb-a0d4-9758a3ed0d23",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "d007d0bc-5f8e-429d-a770-4afc2ac531a8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8b5425ba-5f97-43a4-9110-3bf7022ba23e",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "a2339e2f-8646-4b67-93fe-82f62cb95a56"
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
                    "id": "3ca3a6cb-c52f-4e08-a318-047e1f2923fe",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "64d929b4-8ed1-48a8-996b-49c552441fd8",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "d007d0bc-5f8e-429d-a770-4afc2ac531a8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "6620a0f2-720c-4575-bf84-90155209680b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "dd9e6871-82fe-4ce1-984d-12b7e307471e"
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
                    "id": "4d3c6fe2-5dfe-4776-8237-946b4073784b",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "b221d647-76c1-415a-8b48-4fa48a4c1d64",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "cef1d486-c286-4b8a-91dc-e3da3f2a293b"
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
                    "id": "a7e9710e-f330-463f-b19d-33cdc8a9caae",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "46e8ce95-fa31-4057-9b15-84040b381d17",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "39dc9c6f-ccaf-431a-b713-8dadef28ce66"
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
                    "id": "0d5556d9-288d-4c9d-9db1-0f5c7a9ddfe4",
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
                    "createdAt": "2024-10-24T06:44:12.686Z",
                    "updatedAt": "2024-10-24T06:44:12.686Z",
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
                    "id": "3bf10619-f477-4bbc-976b-359ca9786b2d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d007d0bc-5f8e-429d-a770-4afc2ac531a8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c9bc2775-bf90-482c-b789-3a91bbda3082",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "69acb392-54f7-426e-9cda-e47a161f7daa",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c9bc2775-bf90-482c-b789-3a91bbda3082",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eca01fe0-690c-4c1d-a69d-46c61a2fe828",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "228e0808-9084-42bd-8a41-d39b793402b9",
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
                    "createdAt": "2024-10-24T06:44:12.686Z",
                    "updatedAt": "2024-10-24T06:44:12.686Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d44cfa6-c8b9-45f1-aa52-03a5038aec07",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "228e0808-9084-42bd-8a41-d39b793402b9",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c0c7400d-2fd4-4771-895f-8188fcb0e8cb",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd9e6871-82fe-4ce1-984d-12b7e307471e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "39dc9c6f-ccaf-431a-b713-8dadef28ce66",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3bd1ff4e-36f2-45e8-9aa2-2b737e614ed2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "14e29444-2055-428e-8c13-b3890a7c6691",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c590f877-78bf-4314-af91-a55689af4484",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "33bef2ff-dd1a-4d1d-9b00-6d75e729608c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c590f877-78bf-4314-af91-a55689af4484",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f1df1749-fd36-4a52-90a2-b1c1b0c6845e",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cef1d486-c286-4b8a-91dc-e3da3f2a293b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "023a546f-6f8a-47ec-85bd-9601e7dcdcbb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3ad9479a-0ddd-4101-9c9a-97e97e818879",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "023a546f-6f8a-47ec-85bd-9601e7dcdcbb",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3162d387-0524-4932-a9e0-36de66f7b054",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8cb67bf4-8bb4-4b37-a948-4d14f7e8d5ee",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4c3ea5fb-5795-4ba5-84b7-ca69e32ec153",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8cb67bf4-8bb4-4b37-a948-4d14f7e8d5ee",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b8a1828d-e773-42b4-bac3-6651b358d4f4",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a2339e2f-8646-4b67-93fe-82f62cb95a56",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "99e20bf3-1f5a-4f34-8aff-14d3a7575ef2",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "47f0fa0d-c90e-4b8f-9737-0968a2efd3f3",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "8fb202fd-6cea-4916-b00a-4fceeecd9b3f",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "e04aceb9-fd63-41d7-a194-189a42c16d8a"
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
                    "id": "eca6516b-07ae-426f-8ed3-a7982c3a619f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2f3b3ae8-74aa-41af-a730-cff2486dd9d7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "73265bb0-6cd4-4d27-ab22-ecac1c1c0d57",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "3c7cb8ec-fe19-4d97-ac73-5a081aa0a948",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "e04aceb9-fd63-41d7-a194-189a42c16d8a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "42af8b29-9ca5-4e43-b254-ffb38d3f4e60",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6b9c2e47-5d1e-4654-9db1-5af9e3b1f2bc",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "42af8b29-9ca5-4e43-b254-ffb38d3f4e60",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "55e3d646-30f1-4f89-9481-f70c1341fcbd",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "abd2d05c-f929-4e88-b8ff-a5ee803de3c0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8b5bce26-82ca-4b8f-b783-201acbd900df",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "abd2d05c-f929-4e88-b8ff-a5ee803de3c0",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8eb7c24d-957c-4fbf-9967-91400cb6e929",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b0491fb9-3bc0-4eb1-b0a0-4a2b7607b20a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "230a99f6-00dd-426e-9cc6-c76d4e995e2b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b0491fb9-3bc0-4eb1-b0a0-4a2b7607b20a",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bf2a2e38-df01-4682-9251-4141e8ee0ae0",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "229960b9-3c4b-45b4-90c4-a7355b1223c6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0d22fe5d-c738-4b4d-abfa-702737f9c6c4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b8a1828d-e773-42b4-bac3-6651b358d4f4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4c3ea5fb-5795-4ba5-84b7-ca69e32ec153",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b8a1828d-e773-42b4-bac3-6651b358d4f4",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8cb67bf4-8bb4-4b37-a948-4d14f7e8d5ee",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d333da46-abbb-43db-b496-ea281b245856",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "99e20bf3-1f5a-4f34-8aff-14d3a7575ef2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "a221566c-c5e0-44b8-8617-6b1e17d9310a",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "5e70dfe0-3933-4d82-8bcf-dfd919a625a4",
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
                    "id": "22f4f524-6c8e-4894-965a-5c3e624a4370",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d58e8907-d855-4732-933b-50e2ac772c3a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5e70dfe0-3933-4d82-8bcf-dfd919a625a4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "18e27157-7e15-4dab-a45e-387d281e4794",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "045c59cb-f5ac-4371-b81c-ae0cc7f1ef31",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "00f441ac-e73c-48fe-8b1c-0e70ee5a9a46",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2b6e1a42-950a-49fd-a83c-a966b5831ae1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "a16daa83-d9ad-4b50-8283-744b83846e78",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "c50cb359-c1dd-47d9-80d2-ed5de2ba00f8",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "b2eb153b-b74a-4f2b-8ab5-01714b2f7582",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "1083867a-3730-43e1-a69c-8327d8393922",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "765fb9c9-7222-4845-8685-d5521701ff4b"
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
                    "id": "8a8c2e38-b021-43e9-81bd-db6c8b4a69a4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "6a5ad669-9654-45f3-b878-19d12322708a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "700de574-9961-4e9f-989c-23c66021b5e0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a16daa83-d9ad-4b50-8283-744b83846e78",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6a5ad669-9654-45f3-b878-19d12322708a",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "dd6868d4-f36c-428e-8da6-cdb2adce4e2c",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b464aae3-d0b5-4cfa-a259-14f22d7d437e",
                        "name": "messageChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0c5b57a9-07a6-489b-ab7f-a38ac60f2848",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b0df4ee0-e7bc-4d10-a1aa-8e345a3e679f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "765fb9c9-7222-4845-8685-d5521701ff4b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5e8ff625-94c8-4d1e-9286-351682a3afcf",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0c9f587e-1eff-49bd-9e67-ca9174207f48",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "c2468c38-572f-4e15-be4b-5c62cf9094fc",
                        "color": "blue",
                        "label": "Full messages list fetch pending",
                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "9211204b-709a-4e56-81d7-9af70096ef07",
                        "color": "blue",
                        "label": "Partial messages list fetch pending",
                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "84802fbf-b287-4a57-b971-83dcc005ef3d",
                        "color": "orange",
                        "label": "Messages list fetch ongoing",
                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "f164b4be-bacc-48fe-a054-24ba7963d2c1",
                        "color": "blue",
                        "label": "Messages import pending",
                        "value": "MESSAGES_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "d6b7e1d9-8cb3-4ab8-a0d4-94231fc7b0b1",
                        "color": "orange",
                        "label": "Messages import ongoing",
                        "value": "MESSAGES_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "1842ab48-977c-4d8a-a558-bd6195d56a9d",
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
                    "id": "27fdb45a-590b-48b0-925c-6b100d4fc262",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'SENT'",
                    "options": [
                      {
                        "id": "990476c0-cabd-4728-b01e-a8c2b2c963e0",
                        "color": "green",
                        "label": "Sent and Received",
                        "value": "SENT_AND_RECEIVED",
                        "position": 0
                      },
                      {
                        "id": "c8ecf4bb-6af5-42d5-9de3-08fe0ece39db",
                        "color": "blue",
                        "label": "Sent",
                        "value": "SENT",
                        "position": 1
                      },
                      {
                        "id": "79468d0e-59d3-497f-8438-95dcda427380",
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
                    "id": "06ae41be-3988-4e5f-b05d-76a322f99800",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "3d32b244-ba5e-421b-9dfd-179d3caab880",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "8ba28219-26ea-44aa-b69e-f7e28745b1c1",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "7890c3de-5b20-407e-98b9-d53dc64889a1",
                        "color": "blue",
                        "label": "Subject",
                        "value": "SUBJECT",
                        "position": 1
                      },
                      {
                        "id": "8d25761d-352c-4ede-bc85-47d06bb42075",
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
                    "id": "f30ccf37-e826-49c0-bd07-1cb24898453c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b30cc6ed-3b0f-4dda-a092-accce3fbc825",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'email'",
                    "options": [
                      {
                        "id": "bf18edc4-edc4-48ce-9c5a-78aa68f34b76",
                        "color": "green",
                        "label": "Email",
                        "value": "email",
                        "position": 0
                      },
                      {
                        "id": "5d3a3a78-db19-49d8-8535-8e85189403d6",
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
                    "id": "97440ce9-c51f-4d4f-ad38-e7b59f405b1f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "332e97e8-c8fa-4464-b9ba-4ede56e5a3f9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "baf87b3f-b9d9-4714-85c4-985fdc009775",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "af7c454d-0f8d-480a-86b2-ce5831aabead",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "76dda210-bd14-408f-abf8-f6ee980a2df1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a16daa83-d9ad-4b50-8283-744b83846e78",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "af7c454d-0f8d-480a-86b2-ce5831aabead",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5c0d5b87-01bc-4661-8797-f5d4f71862db",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "334996ff-0aef-48ef-ae41-e613b9b8dcc6",
                        "name": "messageChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c50cb359-c1dd-47d9-80d2-ed5de2ba00f8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4f4039db-92fd-4594-9914-94df2862f44e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "d32e6458-aec7-47f9-a604-4d7e14c2ed7c",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "ff887d2d-eac8-4ba0-9d65-2a639c4c40e2",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "0a4a99f0-1548-4a5c-856e-918baf2ba71b",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "82cd0a03-6029-4d22-a61e-459954626ee6",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "f09c3c60-361f-4063-a868-5269261254a5",
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
                    "id": "4581cead-a968-4f39-8ae0-a509d9759afb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "f2a63be2-8124-4ea8-8d46-0312bbb52d5d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "89600347-8953-41b0-886d-d844d8c8aaa7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "93fa2f53-1b7c-4361-b2e6-87975063b22d",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "901e787c-0446-48ba-9ff5-16306e5bd980",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4ac4926f-34aa-4d6c-a2dd-b5eaba0470af",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "aad488f4-1567-401b-baec-d943c1ab4581",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "7e4a9d58-3ddc-46a7-9974-7fd2eeb68575"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3c6934f2-5814-46e7-9d05-c95c96cd3ac4",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "a35e7904-c2ba-4dd1-91c1-3986df40e549"
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
                    "id": "68b65772-dc54-417c-9318-00abbe626b08",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7e4a9d58-3ddc-46a7-9974-7fd2eeb68575",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d2b91662-b0a9-4bfd-a058-c0ada75b7309",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "901e787c-0446-48ba-9ff5-16306e5bd980",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0797c144-ad25-4953-b201-7fc3c9fe784b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b4898798-b85b-4cbd-bc87-ab0c44a89fc3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "93fa2f53-1b7c-4361-b2e6-87975063b22d",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0797c144-ad25-4953-b201-7fc3c9fe784b",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "36b269ef-2b78-4c89-ab0f-ae80591624ac",
                        "name": "blocklist"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b7abcdcb-71b9-4b9a-ab98-3aa4ff383e30",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a35e7904-c2ba-4dd1-91c1-3986df40e549",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "37e83e93-f584-4c65-946e-14e7b8d847d2",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "2f390253-81e3-4340-8c48-757cd4b357ed",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "b223e0d4-2e18-4ed4-ae1c-11246fb09464",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "c9feb6df-c300-434a-9a02-c6b955e6d840"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "ab6fa491-b45d-49aa-a066-0c862e2d9d3b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "63289e41-bfbc-4892-b5d6-5d1493e3a92f"
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
                    "id": "3b7dee51-fde3-4e25-8729-5d98b719b770",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f37cb1c6-737e-4e51-9722-5b9c4aa85b7c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "42ba2450-1034-4e41-9243-b99f4c2db1d9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f37cb1c6-737e-4e51-9722-5b9c4aa85b7c",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0960583d-3fc4-4763-9f87-819b6d83fc5d",
                        "name": "versions"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37e83e93-f584-4c65-946e-14e7b8d847d2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4d51231b-ffd1-4513-9be7-9283ceb30a81",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7b35f5c3-7d1e-4f77-af2e-d4a3c7f60a5b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b3f1c8fe-a6ba-450e-be7a-f60d79f770c2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d9f0bf6-df76-4fbc-9a03-a12ae017d261",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b3f1c8fe-a6ba-450e-be7a-f60d79f770c2",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f0075154-1a3b-4419-991e-6627e94f68f1",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4f0bbfc7-4aee-493a-85ec-9611db6e712d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d1ee2ed7-980f-481a-9037-4d12704a8e31",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e836e8b0-fcad-4191-9b5b-179457545d36",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d1ee2ed7-980f-481a-9037-4d12704a8e31",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e1f3a83f-e2e6-46e1-836b-240e2ee5f6a6",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "63289e41-bfbc-4892-b5d6-5d1493e3a92f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c9feb6df-c300-434a-9a02-c6b955e6d840",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "3adbe133-460f-4322-99e4-4b15b69e0fc2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'DRAFT'",
                    "options": [
                      {
                        "id": "ccb5f394-f36e-41f6-8a61-d74635e05e9a",
                        "color": "yellow",
                        "label": "Draft",
                        "value": "DRAFT",
                        "position": 0
                      },
                      {
                        "id": "5c396515-506b-44c7-aaa6-7de7c12aa52b",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 1
                      },
                      {
                        "id": "0657caa1-b89c-45e9-bc29-3ffe11a5796a",
                        "color": "red",
                        "label": "Deactivated",
                        "value": "DEACTIVATED",
                        "position": 2
                      },
                      {
                        "id": "a6f33c1d-d7d6-4e1e-9f3f-0ee34480fb5d",
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
                    "id": "9f78245f-200d-4396-8bc5-de57fe7c2036",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "703e1db0-6f7b-46ec-a600-fc0ab4a2d4a1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "97bc78da-75d9-4f68-b8b6-fb8de97f8e18",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0d9ab59a-38f7-4b69-8027-6a23b8ba2e26",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "97bc78da-75d9-4f68-b8b6-fb8de97f8e18",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "37a21c95-8e20-4e79-8c8d-c518c21c4c88",
                        "name": "workflowVersion"
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
            "id": "836c53f5-49f1-4a2c-8ee7-352728cfd32d",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "77d7cf28-802f-4cf0-a584-995f542fa9da",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "cd1293a1-8d0f-4c42-8973-63b352f6c304",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "c60f268b-f69a-4a9d-946d-5d60d0133e5b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "42186724-ea55-47e4-89cf-49a4651c353e"
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
                    "id": "6d23439b-5cb6-4358-b294-2e8f3f713e7a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "560f2ba6-f1bd-4d74-b804-666a19b1aa40",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "77d7cf28-802f-4cf0-a584-995f542fa9da",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "458f2328-09cd-483b-823b-4bb9cbdc409f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0fc76979-ab7d-434b-94ac-61a1fbec1486",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "9e0ea457-6f22-4bc1-9959-85df308f9e7c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3ac5836b-d02a-47f2-93da-0435c94644e3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "836c53f5-49f1-4a2c-8ee7-352728cfd32d",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9e0ea457-6f22-4bc1-9959-85df308f9e7c",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "49fbc9bb-c77f-413e-ac40-c4bb2b2075a6",
                        "name": "viewFilters"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1372f8d1-706a-4567-b09c-7b760bc7d964",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "42186724-ea55-47e4-89cf-49a4651c353e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "73a0fcfa-4071-4df1-a122-5a986862d1fb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "cb6dd8cc-bd1d-4875-b2d6-ff73d4850bc9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "7d168431-7c54-414e-9e33-57601a057eac",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "e0cad315-f3b8-4ca5-ae59-a9603cab6c46",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d385870f-55c3-4288-9d33-1acf2c3c4f41",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "4abc6094-86c2-4a8d-a5e1-6bd8caffe4e8",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "711589db-477e-4cec-9f37-60a8bb800ad9"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "39621825-6698-4162-ae03-b0aebf2705d3",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "9060abea-d3b8-4957-affb-43abf0675313"
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
                    "id": "03363d97-cdff-4039-96ff-d78334dc1e8d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "16b8903a-db09-4b0c-9737-2ec056e1b2cb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "9060abea-d3b8-4957-affb-43abf0675313",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e0cad315-f3b8-4ca5-ae59-a9603cab6c46",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "711589db-477e-4cec-9f37-60a8bb800ad9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5270488e-dcb9-4165-af80-7e143db17013",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "96a4ee75-ad1c-4a43-b5e3-66b47b032d1b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "aa185176-fe60-4d4c-befb-6ef84d99f733",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7d168431-7c54-414e-9e33-57601a057eac",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "96a4ee75-ad1c-4a43-b5e3-66b47b032d1b",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "db3a3f1e-66a1-4ac6-9818-3419a8fefdae",
                        "name": "eventListeners"
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
            "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "75e1b465-aa03-418c-b2b6-ba5fee9d817e",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a8104884-a09d-45b0-abd1-9d3f91f96fe7",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "272234c7-a423-4702-900d-b8067eaf6e85",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "94493bda-02ea-40b8-b2a1-f6e16ec14bed"
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
                    "id": "2f4152bf-4f94-4c69-92ca-2b1129e8c33b",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "19efa522-7855-4f50-ab2e-f2324ed23022",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "94493bda-02ea-40b8-b2a1-f6e16ec14bed"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a32ea85e-b124-42f1-a29f-d62873224b67",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "8781949f-fee4-48e4-84a7-894002ff4138"
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
                    "id": "7ba5f286-6ec9-46f7-bd35-a28bcc155119",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "706dbc24-af40-4de0-9d1c-6d58b5d197fe",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "ab49e374-8ece-41e2-bc0f-43a596266426"
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
                    "id": "b23fb68b-23ab-4746-97ae-c39fd2dc6a55",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "235b76a2-3185-4c7c-a42b-893817be9c3b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "94493bda-02ea-40b8-b2a1-f6e16ec14bed"
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
                    "id": "85690d67-74e3-424d-adf5-1bb16205db5c",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "f99365ed-34ca-4285-9e2f-cdea6028468e",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "b795b589-cf96-47d4-a287-0f43cefa1d50"
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
                    "id": "7471d43a-4bae-4103-a939-56ed61dff936",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "92ddeda8-ba38-4be4-9529-dad18cf25619",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "94493bda-02ea-40b8-b2a1-f6e16ec14bed"
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
                    "id": "6f845926-9a1e-4759-8e7d-2897dbfc9b16",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "c44a8739-bf6e-4951-b022-85a5d29f9e36",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "94493bda-02ea-40b8-b2a1-f6e16ec14bed"
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
                    "id": "67c23286-5728-43c4-bb41-6ed5a486dcd5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b2f6300c-af72-4b5a-918d-7afe5e3aa2b7",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "67c23286-5728-43c4-bb41-6ed5a486dcd5",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "24e3e725-b1b9-443e-923c-be1bed10a6b1",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b795b589-cf96-47d4-a287-0f43cefa1d50",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f68adb59-54e1-41d3-bfcc-530a5bf3e61d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8781949f-fee4-48e4-84a7-894002ff4138",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bf2a2e38-df01-4682-9251-4141e8ee0ae0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "230a99f6-00dd-426e-9cc6-c76d4e995e2b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bf2a2e38-df01-4682-9251-4141e8ee0ae0",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b0491fb9-3bc0-4eb1-b0a0-4a2b7607b20a",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0a60b4be-57f3-42ed-826d-67fb14aec2ee",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "31917081-2439-4778-a25f-0eefeae7770e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0a60b4be-57f3-42ed-826d-67fb14aec2ee",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4f22cd7f-b0b0-41e4-a2b6-a42886cc26a1",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "75e1b465-aa03-418c-b2b6-ba5fee9d817e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2520ebe2-7e3c-4e14-b6e6-0da9a47dd40e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "94493bda-02ea-40b8-b2a1-f6e16ec14bed",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "92a461bb-eb9f-4268-9e89-05590fb07050",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "78548c32-d43a-49e3-b150-57fbda1faa36",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "cdf1731e-1efd-45d3-bdcc-5946aa0f336a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "76a3aadb-60b7-4811-8e42-e816d4707119",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "257846d1-5233-4165-9ef2-b79bfc5236d6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "76a3aadb-60b7-4811-8e42-e816d4707119",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "61dda144-a442-4e7a-8049-246b693d2a40",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4148863a-d073-4b75-91de-b9441b987dde",
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
                    "createdAt": "2024-10-24T06:44:12.683Z",
                    "updatedAt": "2024-10-24T06:44:12.683Z",
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
                    "id": "6796dac5-28c1-4887-9cd8-5fa86fe0043d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ff125267-eae2-470d-aa9e-ef8afd006497",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5bd44d5c-fcd1-4134-b1ef-89a238007570",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4f1a89ba-5b62-4e34-95a6-da65263b0514",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5bd44d5c-fcd1-4134-b1ef-89a238007570",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "16fa34e3-ff1e-4731-a5ae-ea7fa7d7ac07",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37d97165-3a7d-461c-b93a-33e2e35e8c10",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "80fad415-88b7-4260-ac0b-5ae3ae8281da",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0a32d643-2339-4e60-933d-d5860e9b2213",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3696e1d8-4072-4802-aa1b-4d3106e8fc47",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0a32d643-2339-4e60-933d-d5860e9b2213",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5269f5c2-5705-46f8-8a01-00b6e56d533b",
                        "name": "authoredAttachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fa831fd2-a4e6-493d-ba0e-7d6cf16471ac",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b413df7e-8beb-4b27-8c6d-524ca67a18e3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fa831fd2-a4e6-493d-ba0e-7d6cf16471ac",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "024af722-0516-4c1a-a2f0-96062747534c",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ffb94b5a-0338-45ba-b042-874ec6016c07",
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
                    "createdAt": "2024-10-24T06:44:12.684Z",
                    "updatedAt": "2024-10-24T06:44:12.684Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "62d2cd40-3a41-4fae-b794-7fcb8488971e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ffb94b5a-0338-45ba-b042-874ec6016c07",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cb0107ab-8f04-4021-a64d-2b8280f2d1f1",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ab49e374-8ece-41e2-bc0f-43a596266426",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "a6bfbac8-fe16-42ab-9596-fbbdfcb59800",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "02a82673-6774-4bae-b0af-e64e40b09001",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "name": "IDX_123501237187c835ede626367b7",
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
                    "id": "cbe1476a-5cfe-4876-a4c2-f0328d02dfa9",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "d8ea7657-142e-419c-ae4a-39af01bf901f",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "e31a279c-909e-4c1b-9f7c-b8683c31aca3"
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
                    "id": "9c1b7710-e9e3-4110-b3e9-7135633bcd9c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "e37bf0e5-ae55-431b-8201-1927c90f8e12",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eabcbb59-e8c1-4dcb-9919-fd2511fbb854",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e37bf0e5-ae55-431b-8201-1927c90f8e12",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0f9ef777-7896-4c77-a720-531af7a72c46",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a6bfbac8-fe16-42ab-9596-fbbdfcb59800",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "35579e7e-4436-40ae-8d81-102ba7984423",
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
                    "createdAt": "2024-10-24T06:44:12.091Z",
                    "updatedAt": "2024-10-24T06:44:12.091Z",
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
                    "id": "11945cdc-4d28-4117-90e5-f4db2672fcd1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "cbd919bd-43fc-4cf4-93fc-291ecd6ef432",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ecfc6c11-9eb9-4e28-9c11-14d218f9c1df",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f1df1749-fd36-4a52-90a2-b1c1b0c6845e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "33bef2ff-dd1a-4d1d-9b00-6d75e729608c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f1df1749-fd36-4a52-90a2-b1c1b0c6845e",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c590f877-78bf-4314-af91-a55689af4484",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bef4f9a0-e41f-4d02-a7c7-7b5e071eced7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "775ab777-e191-4475-9223-14fb864a93d9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "eab38cd6-2c7d-481c-b196-ffcbc0bd3b6c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "775ab777-e191-4475-9223-14fb864a93d9",
                        "name": "people"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b4ca1f44-7b4a-4b87-ab25-7a35e5cd35e4",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d03f3a5a-269b-4536-9448-80995fa6d51a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "6e2a4194-f7ee-4208-89cf-273be67ac456",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "74983410-62bb-45bc-a7b5-a4eae4f0d987",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a6a4e683-50cc-4180-a1c3-a948a1ea4da3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "74983410-62bb-45bc-a7b5-a4eae4f0d987",
                        "name": "opportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5e30c325-c1d7-4e75-8dc3-111036587978",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62dcf938-77b9-4922-b564-8c56f4133e10",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "16fa34e3-ff1e-4731-a5ae-ea7fa7d7ac07",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4f1a89ba-5b62-4e34-95a6-da65263b0514",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "16fa34e3-ff1e-4731-a5ae-ea7fa7d7ac07",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5bd44d5c-fcd1-4134-b1ef-89a238007570",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f6b69cfe-a6c5-4724-b2c8-286911f84156",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "9611b48a-bdd5-41ef-a45f-26fcd167e842",
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
                    "createdAt": "2024-10-24T06:44:12.258Z",
                    "updatedAt": "2024-10-24T06:44:12.258Z",
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
                    "id": "e31a279c-909e-4c1b-9f7c-b8683c31aca3",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b4b455e2-455c-4477-8d93-c8829af111e9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e8db1ac4-b575-486c-b380-e7cd050b9795",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b4b455e2-455c-4477-8d93-c8829af111e9",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "584686e7-843b-4f5d-ac44-403cb0a5b389",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1ef40e2e-5dc8-4bec-8289-b2570e651a9d",
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
                    "createdAt": "2024-10-24T06:44:12.003Z",
                    "updatedAt": "2024-10-24T06:44:12.003Z",
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
                    "id": "1dca9d8c-373e-47c5-ad3e-1a60a19b734f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ad03bb30-278a-4101-b2fd-6a2bed8dd5b4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "da3fffe3-1823-4978-b763-8a3388689211",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "117f2eb6-e7a6-4193-98d2-68b4585d07f5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "da3fffe3-1823-4978-b763-8a3388689211",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a1c7e6ea-478e-45c2-9205-5bb0efa432ad",
                        "name": "accountOwnerForCompanies"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "740e8be7-50c9-4a7d-913f-eb6cc998c656",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2078886c-53b4-4ce3-b742-fdeb3a6d8f5d",
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
                    "createdAt": "2024-10-24T06:44:12.176Z",
                    "updatedAt": "2024-10-24T06:44:12.176Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "cd4ff211-e434-4efa-9763-b20864b07517",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "32ebfb7c-4af2-46dc-8b84-6bc6402661ab",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "b5061e81-7b39-43f6-ad95-e7b2a1e0056b",
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
                    "id": "0bbe4245-e57c-46ed-a116-c8aa07293313",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9e9f354f-7639-4b69-b31b-163d9377039a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0bbe4245-e57c-46ed-a116-c8aa07293313",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3227cd31-e9d2-4eea-9cec-99609d7bfef4",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0326f611-c8b3-4872-a872-25d6a38e17fb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "baf4d8ae-b39c-4c81-8d13-56f862a42b37",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f12c96c5-ae97-4d94-8034-59a1bcbc9d37",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "baf4d8ae-b39c-4c81-8d13-56f862a42b37",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b445ef6d-f137-4c32-8841-cd1b5052af57",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1790c34c-19de-4674-85c3-00d6904d6b1b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "5c0d5b87-01bc-4661-8797-f5d4f71862db",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "4c87f408-b988-45d1-8e3c-b341767587d2",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "91c809a7-be00-4dc9-b5e6-e87a3e1690b8",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "19874e21-0781-4f65-8255-cf4ce6dafd04",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "574fe542-c403-4aed-a453-e194d78e0fcc"
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
                    "id": "17da6cff-a7d4-46a3-8caf-6acf678fc2bc",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "6368bd34-734d-4a67-9b30-feac75b8f022",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "eff012bf-b827-4f29-8abe-d3806b7f5368"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "75c94e00-6ad0-411f-8b82-f826647dd932",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "c9ca1618-f412-451c-a09f-eca5af014666"
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
                    "id": "c9ca1618-f412-451c-a09f-eca5af014666",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4c87f408-b988-45d1-8e3c-b341767587d2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "eff012bf-b827-4f29-8abe-d3806b7f5368",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "1808ff1b-f5dd-4215-8c32-abc9baa00c37",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'INCOMING'",
                    "options": [
                      {
                        "id": "eb87635f-6759-45d9-b4db-5fa6e0b7c355",
                        "color": "green",
                        "label": "Incoming",
                        "value": "INCOMING",
                        "position": 0
                      },
                      {
                        "id": "d75cc0f7-433e-472d-a1d9-83f14f30b076",
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
                    "id": "574fe542-c403-4aed-a453-e194d78e0fcc",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8bce4a75-4cd0-42f3-add4-ae9b25d7205b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "fb724150-2c86-46e6-85f8-8db10cab09d3",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "334996ff-0aef-48ef-ae41-e613b9b8dcc6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "76dda210-bd14-408f-abf8-f6ee980a2df1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5c0d5b87-01bc-4661-8797-f5d4f71862db",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "334996ff-0aef-48ef-ae41-e613b9b8dcc6",
                        "name": "messageChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a16daa83-d9ad-4b50-8283-744b83846e78",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "af7c454d-0f8d-480a-86b2-ce5831aabead",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "10d498e5-4043-4cbd-ba72-6e92df6db510",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "05b8e464-7689-4486-9b8a-88a2a2a1c64c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ff141c1c-4a88-4551-a347-733f9a8fd4f0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d590eb3b-aa9f-4981-99da-c36e305f35a1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5c0d5b87-01bc-4661-8797-f5d4f71862db",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ff141c1c-4a88-4551-a347-733f9a8fd4f0",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4dadcf89-39bf-4156-aa08-1a37a424c1b4",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9d1b85ef-5cc7-4066-9202-d3e72e532b3b",
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
            "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "96f4d654-eb09-4dbb-910f-f4473616d396",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "3c99b9a5-2c1c-4982-92f7-683cac69043e",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "aa5825d0-bc52-47b8-9785-3b079454f009",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "922fe103-3d82-48fa-8769-3f9fa5a5d3f3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "5096ca3f-ea2d-471f-a01c-870d181ba19c",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "b18baa94-a57e-404c-805c-c9f040a0f2f8"
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
                    "id": "38f47e12-55d9-4e4b-8fb4-50699d551b70",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "9eec2ef2-94c0-4642-8d72-643d826f1f5b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "9db578e0-c179-4c0d-80a3-16613acbc0e8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "fccb102f-346f-4256-8964-9d044f139d8b",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "922fe103-3d82-48fa-8769-3f9fa5a5d3f3"
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
                    "id": "a29442bc-637b-4a74-a817-20805fac9b7a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d3694d93-8231-4a43-8298-419098d961fa",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'NOT_STARTED'",
                    "options": [
                      {
                        "id": "44376b3d-b54c-4c7b-9e4f-c1580f8f6c48",
                        "color": "grey",
                        "label": "Not started",
                        "value": "NOT_STARTED",
                        "position": 0
                      },
                      {
                        "id": "f81139a7-6928-46ec-9b0b-ec6d4a98be01",
                        "color": "yellow",
                        "label": "Running",
                        "value": "RUNNING",
                        "position": 1
                      },
                      {
                        "id": "05c85657-e637-4736-89ef-20a11e8e5b5a",
                        "color": "green",
                        "label": "Completed",
                        "value": "COMPLETED",
                        "position": 2
                      },
                      {
                        "id": "037d799c-3322-4ff1-8dc6-281e997eee06",
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
                    "id": "7b25e047-c908-4a6f-89a6-58f9973fb599",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "96f4d654-eb09-4dbb-910f-f4473616d396",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "28766eca-828f-4b5a-884d-1f6271bca159",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e1f3a83f-e2e6-46e1-836b-240e2ee5f6a6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e836e8b0-fcad-4191-9b5b-179457545d36",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e1f3a83f-e2e6-46e1-836b-240e2ee5f6a6",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d1ee2ed7-980f-481a-9037-4d12704a8e31",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9db578e0-c179-4c0d-80a3-16613acbc0e8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "922fe103-3d82-48fa-8769-3f9fa5a5d3f3",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "6f2cad20-f363-4b9f-9e51-1e40affa7cb7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d6bf83d6-7090-4d2a-b260-a2456c7d87d0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6f2cad20-f363-4b9f-9e51-1e40affa7cb7",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "59593af4-3013-4d3b-a7fa-02b9bd6eac59",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a458e9ad-f2d4-4b91-abaa-3cae4d80e746",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cc837f18-202f-4068-aabf-955fb3ffd806",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a458e9ad-f2d4-4b91-abaa-3cae4d80e746",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d2aa260f-dce5-43ca-80ff-c4aea065a63a",
                        "name": "workflowRun"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "66971cb2-6c2b-4589-9284-e1968972bba5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a681f719-6384-47c9-a233-d85ee8a1d7fa",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4c2a2fe0-7273-4fe1-8ad3-bde7062e04a2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b18baa94-a57e-404c-805c-c9f040a0f2f8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ad6e9c78-92e0-4284-b00d-2aa83bdf13d2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "06bc0e07-0b93-45d4-87ad-d45b28e56572",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0dafd3bc-1bdd-44ec-a6d5-b334cadde0f2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "06bc0e07-0b93-45d4-87ad-d45b28e56572",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9b1c5a76-fb2d-4847-8c0b-4a8b2651a292",
                        "name": "workflowRun"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3031572d-cd7c-4b71-8d19-b14ab66c3c79",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "4dadcf89-39bf-4156-aa08-1a37a424c1b4",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "526029fb-1ce5-42d6-a474-27442cb799e2",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "38536ab5-663f-439e-aea6-11ecf02fa17a",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "0ff1f848-4189-4784-a49d-6b7952dc9f43",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "9b1d7058-c85f-45c0-ad4f-b291c6549392"
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
                    "id": "35c7296c-42ed-4001-adbe-4a09c7a6999f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "1f834eae-bfbc-47b6-8fb0-4498982bec36",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f797db7a-0782-4ebe-8d30-5579337304df",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4dadcf89-39bf-4156-aa08-1a37a424c1b4",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1f834eae-bfbc-47b6-8fb0-4498982bec36",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1d131bb7-5dcf-485e-93e3-a867c440355b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6800c05c-6700-4958-b83f-411b44d27aae",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6be75154-50a6-4826-9c68-4bb728824abb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "bbf6fadb-84fc-4a13-b3ed-48dfdbe3356a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5f7b9796-1309-4afa-9f8f-5b0415e440cb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7b5d8a53-6393-4288-9e99-1a4ada655b6a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4dadcf89-39bf-4156-aa08-1a37a424c1b4",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5f7b9796-1309-4afa-9f8f-5b0415e440cb",
                        "name": "messageThread"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "17022a76-5a3d-437f-87e2-f367732a4114",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a72db665-1141-449c-944a-4fc6a6dd7167",
                        "name": "messages"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9b1d7058-c85f-45c0-ad4f-b291c6549392",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6b641ea8-1088-4cb6-a0a9-8e7dcaa804e2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "9d1b85ef-5cc7-4066-9202-d3e72e532b3b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d590eb3b-aa9f-4981-99da-c36e305f35a1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "4dadcf89-39bf-4156-aa08-1a37a424c1b4",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9d1b85ef-5cc7-4066-9202-d3e72e532b3b",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5c0d5b87-01bc-4661-8797-f5d4f71862db",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ff141c1c-4a88-4551-a347-733f9a8fd4f0",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "48150eb0-9b3e-46b8-ad2c-6067fb1c311b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a354d958-c1f6-429d-9c58-4da96963dde2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ef791bd5-b9e6-4ea6-b672-4c08e4b0706d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "526029fb-1ce5-42d6-a474-27442cb799e2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "7137b62b-ad0c-4cff-8aa7-7d5be56c03b2",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "99551751-b5c2-43bb-aeb8-79a9dc7ba0b1",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "57e09f6f-00bd-474f-b35c-e86deeda632a",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "2b2b799d-cc4f-4076-ae5d-a256f7737dd5"
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
                    "id": "6a506309-3157-4a8c-a718-5446a0780666",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "0fedaff7-e998-4b54-b0be-455c3bbd03be",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "4748b9e3-50fe-4979-a2c5-884b74baf236"
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
                    "id": "e6645923-f67e-459c-9e40-d8d0193aaf82",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "name": "IDX_a900d9f809273abe54dc5e166fa",
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
                    "id": "4f14ced0-19d0-4975-981a-1fa279309e1b",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "0612393a-1219-4ce2-b2fd-b965c2fd3bdc",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b356a5a3-3721-4259-a6c1-5aabdfd1107d"
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
                    "id": "7fe0f44a-3478-4651-9666-cd9a3081b4b2",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "058d362b-fdee-4103-82d0-2e3a581e12fd",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b356a5a3-3721-4259-a6c1-5aabdfd1107d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4e45ef5b-ef3d-4476-80b6-4ec27ff4d361",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "f57769fa-d637-4a90-8ffd-45a737186d39"
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
                    "id": "face5e14-2f3a-4162-a933-7247a20e6a5a",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "c1b15f23-0c59-4dee-b9ba-fa0e182a0808",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b356a5a3-3721-4259-a6c1-5aabdfd1107d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4a99b028-fa93-47ba-a7d4-8ce753304286",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "dbb12f3b-d802-4eac-9f61-c3641b0dfbe5"
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
                    "id": "2fbd4e81-48be-4354-bc7c-06f4d1749d1f",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "2ff19858-bd10-4b01-896b-901c711a32b1",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b356a5a3-3721-4259-a6c1-5aabdfd1107d"
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
                    "id": "ee2987d6-3676-456e-9311-8ccf4b00e602",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "name": "IDX_b810a8e37adf5cafd342170ccf8",
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
                    "id": "2d12170c-7d57-4f2e-8ff8-40c410118a56",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "625ba716-9787-44c8-95d9-1b54b78b9603",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "77e1518b-0686-4494-ab81-65d833b47885"
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
                    "id": "70f76a26-4c17-4f07-9e48-e4af525c8449",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "2d44c910-9856-41a1-bc3c-61b06d16e312",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b356a5a3-3721-4259-a6c1-5aabdfd1107d"
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
                    "id": "92fd2ed0-0df0-4f7d-806b-d1d4b9cc25c8",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "1aa77fca-eba5-4644-97de-fc5fb76a19fb",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b356a5a3-3721-4259-a6c1-5aabdfd1107d"
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
                    "id": "53fec90c-4b7e-44fc-bebb-bd273278f0a2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "26a7a48e-84dd-4c2d-a6b4-0741cb59419a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "53fec90c-4b7e-44fc-bebb-bd273278f0a2",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "385ecbff-fbf4-45db-930c-2b75bf72ec32",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "36437874-7a50-4b32-bf41-fa95a8a0dc5d",
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
                    "createdAt": "2024-10-24T06:44:12.680Z",
                    "updatedAt": "2024-10-24T06:44:12.680Z",
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
                    "id": "b76c5b98-3f77-4063-ba6e-3eb7eb35f14e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "8eb7c24d-957c-4fbf-9967-91400cb6e929",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8b5bce26-82ca-4b8f-b783-201acbd900df",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8eb7c24d-957c-4fbf-9967-91400cb6e929",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a648da68-4861-4e67-b094-ea53d1d4c487",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "abd2d05c-f929-4e88-b8ff-a5ee803de3c0",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f0075154-1a3b-4419-991e-6627e94f68f1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d9f0bf6-df76-4fbc-9a03-a12ae017d261",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f0075154-1a3b-4419-991e-6627e94f68f1",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "93b336d3-1055-4b59-88db-34dd638f3a8f",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b3f1c8fe-a6ba-450e-be7a-f60d79f770c2",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "479de6a3-329b-45b0-85f0-0cf5ed01fb6b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "30d1c559-6999-48dd-8547-840104e0548c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "479de6a3-329b-45b0-85f0-0cf5ed01fb6b",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d36ea730-4cfa-4afe-85fc-5b8dfab60a8d",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5c0cb70c-4e95-4036-9237-b2f423253952",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d2aa260f-dce5-43ca-80ff-c4aea065a63a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cc837f18-202f-4068-aabf-955fb3ffd806",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d2aa260f-dce5-43ca-80ff-c4aea065a63a",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4f69c48c-ff57-4730-80b4-5b4552b6f8ef",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a458e9ad-f2d4-4b91-abaa-3cae4d80e746",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b356a5a3-3721-4259-a6c1-5aabdfd1107d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "2b2b799d-cc4f-4076-ae5d-a256f7737dd5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f57769fa-d637-4a90-8ffd-45a737186d39",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9b86f0f9-e579-46e2-a04a-bfe2ef0ba32e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0ee65203-4f34-43b8-89b7-41b244f5757c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9b86f0f9-e579-46e2-a04a-bfe2ef0ba32e",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b22a4bfb-86b8-4f85-9a27-fc25957a7026",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "77e1518b-0686-4494-ab81-65d833b47885",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dbb12f3b-d802-4eac-9f61-c3641b0dfbe5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f43086f6-139e-4a4a-ac88-8bca3a9e79d6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5c0c6a41-c9dc-4f31-b01f-d46b174b9082",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d49282a1-2ebe-4352-a0dc-a5af721dd8ad",
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
                    "createdAt": "2024-10-24T06:44:12.681Z",
                    "updatedAt": "2024-10-24T06:44:12.681Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d18e6ea4-3353-45f2-b930-67c67b060db2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d49282a1-2ebe-4352-a0dc-a5af721dd8ad",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7755c022-1edc-456e-9c7f-99026788c01e",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "74960b3a-7b84-4f66-9fae-685ae94e326c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b445ef6d-f137-4c32-8841-cd1b5052af57",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f12c96c5-ae97-4d94-8034-59a1bcbc9d37",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b445ef6d-f137-4c32-8841-cd1b5052af57",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "baf4d8ae-b39c-4c81-8d13-56f862a42b37",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "528671b3-6b87-4620-bd2a-56904cd08eb9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e911e315-32f6-4cd6-ae24-18b2168e151e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5384ea74-86f0-4609-9e34-9fb1f49ccf11",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "53c8b17a-5872-41e3-990c-d75841e41691",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5384ea74-86f0-4609-9e34-9fb1f49ccf11",
                        "name": "favoriteFolder"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32f0039c-9e1e-4b9c-9d9c-a5ae9175b9fc",
                        "nameSingular": "favoriteFolder",
                        "namePlural": "favoriteFolders"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "74d64fc2-f7d5-432f-ad72-dcf90b77b316",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2825dd1a-1c10-4998-a71a-846e6aed867b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5dfbfab8-07c2-4289-af1e-59183e456e5e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "718202a8-5936-4308-a2ab-c5ae8146faf7",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5dfbfab8-07c2-4289-af1e-59183e456e5e",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ba8d6a73-7781-4dee-810b-b3a390adec42",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2847d55e-f9d5-412d-9aa2-3742a3e4e51d",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37ac5daa-ba32-40f3-8b74-e86ca8262309",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9c93f0cb-81f3-44b0-a5ba-30e70634f342",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "37ac5daa-ba32-40f3-8b74-e86ca8262309",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1fd84a28-871a-4f3f-abdd-74b19e8131bf",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7137b62b-ad0c-4cff-8aa7-7d5be56c03b2",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4748b9e3-50fe-4979-a2c5-884b74baf236",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c26ae3e8-ac34-4972-b6ec-1566e1492aef",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0f2ea0b0-5103-47b7-af69-51523d98068c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c26ae3e8-ac34-4972-b6ec-1566e1492aef",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d29773a8-80c2-464d-88f9-1e54f83c8f7b",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5a4f7372-9284-418a-b67a-7243b9f10d88",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "266ffba3-8906-4619-8931-cacb3e7a6cd7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "3cb958e8-951c-47a6-9fa3-23b905905b43",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "b4b8e90c-f943-4b94-bd06-70eda7de42a9",
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
                    "id": "a048b2d0-b243-4a54-bc4e-c15d9ceb91ac",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "06cf199a-0c85-4102-af2a-fd5e75c7acdb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b4b8e90c-f943-4b94-bd06-70eda7de42a9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "1e8348c0-89b4-4122-82ce-28779f1d64c1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7bfdef9e-9834-4423-ac5c-c9aee67dea0f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d91a1da2-23af-44fd-b586-ae68ab3ddf38",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "52acd804-0539-447f-b493-2fa9202df26c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:12.671Z",
            "updatedAt": "2024-10-24T06:44:12.671Z",
            "labelIdentifierFieldMetadataId": null,
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ce3016d5-4cf0-4ef8-b88c-e3293276e518",
                    "createdAt": "2024-10-24T06:44:12.698Z",
                    "updatedAt": "2024-10-24T06:44:12.698Z",
                    "name": "IDX_530792e4278e7696c4e3e3e55f8",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjEz"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cec56a37-a8b0-4968-a216-be6878d2c49e",
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
                    "createdAt": "2024-10-24T06:44:12.689Z",
                    "updatedAt": "2024-10-24T06:44:12.689Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c41a7527-ea0e-486a-9aa6-035d1fe1fef6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cec56a37-a8b0-4968-a216-be6878d2c49e",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f22f9250-1b56-467c-af5b-e78cfe7df0da",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b1f67d51-1d6a-4b59-9aa8-6ca1771510bd",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6d73d156-6954-43aa-a7b6-8e62b39a3204",
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
                    "createdAt": "2024-10-24T06:44:12.671Z",
                    "updatedAt": "2024-10-24T06:44:12.671Z",
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
                    "id": "c0c7400d-2fd4-4771-895f-8188fcb0e8cb",
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
                    "createdAt": "2024-10-24T06:44:12.686Z",
                    "updatedAt": "2024-10-24T06:44:12.686Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d44cfa6-c8b9-45f1-aa52-03a5038aec07",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c0c7400d-2fd4-4771-895f-8188fcb0e8cb",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "aa8006c4-6e8c-4194-bbdd-704922574a32",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "228e0808-9084-42bd-8a41-d39b793402b9",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7755c022-1edc-456e-9c7f-99026788c01e",
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
                    "createdAt": "2024-10-24T06:44:12.681Z",
                    "updatedAt": "2024-10-24T06:44:12.681Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d18e6ea4-3353-45f2-b930-67c67b060db2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7755c022-1edc-456e-9c7f-99026788c01e",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d49282a1-2ebe-4352-a0dc-a5af721dd8ad",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "496603ed-28e2-494a-92e2-677201ccd295",
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
                    "createdAt": "2024-10-24T06:44:12.675Z",
                    "updatedAt": "2024-10-24T06:44:12.675Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f0a54248-25b5-464f-a4f6-79d2f17f0786",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "496603ed-28e2-494a-92e2-677201ccd295",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d0cf89da-dea4-408f-aa01-e939efc61afd",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec1cde4a-5b0b-4100-b571-04102e6bcccb",
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
                    "createdAt": "2024-10-24T06:44:12.697Z",
                    "updatedAt": "2024-10-24T06:44:12.697Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c755c699-88fe-48a6-b626-b796e23581ce",
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
                    "createdAt": "2024-10-24T06:44:12.678Z",
                    "updatedAt": "2024-10-24T06:44:12.678Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a1855dd0-ab59-47c1-85e5-8b5923bd7428",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c755c699-88fe-48a6-b626-b796e23581ce",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a7a3eb67-8e01-4e88-8764-18658da3047c",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ce4fa0d7-2283-412d-90d6-cbd4250b1e8e",
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
                    "createdAt": "2024-10-24T06:44:12.671Z",
                    "updatedAt": "2024-10-24T06:44:12.671Z",
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
                    "id": "cb0107ab-8f04-4021-a64d-2b8280f2d1f1",
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
                    "createdAt": "2024-10-24T06:44:12.684Z",
                    "updatedAt": "2024-10-24T06:44:12.684Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "62d2cd40-3a41-4fae-b794-7fcb8488971e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3b0d3ff4-2330-42e2-9623-c029eaadbdc0",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cb0107ab-8f04-4021-a64d-2b8280f2d1f1",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ffb94b5a-0338-45ba-b042-874ec6016c07",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd566aa6-839a-4423-af20-dd968033eea2",
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
                    "createdAt": "2024-10-24T06:44:12.671Z",
                    "updatedAt": "2024-10-24T06:44:12.671Z",
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
                    "id": "1234b6bf-7196-4f9c-a762-abb18c78a254",
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
                    "createdAt": "2024-10-24T06:44:12.671Z",
                    "updatedAt": "2024-10-24T06:44:12.671Z",
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
                    "id": "6cbf81d7-726b-4d7d-92c7-9bb17af8a684",
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
                    "createdAt": "2024-10-24T06:44:12.671Z",
                    "updatedAt": "2024-10-24T06:44:12.671Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59619b2a-19ba-4cab-937b-79efa5da4b93",
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
                    "createdAt": "2024-10-24T06:44:12.671Z",
                    "updatedAt": "2024-10-24T06:44:12.671Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db4a0dff-c2d1-43c3-ae7e-aba43a88330e",
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
                    "createdAt": "2024-10-24T06:44:12.671Z",
                    "updatedAt": "2024-10-24T06:44:12.671Z",
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
            "id": "3443ab0d-6636-48eb-b4a6-a2420d4c308d",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "474114ed-2a98-45ea-893b-eca1051b783f",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a5424b49-0d58-44a0-964d-04c557291fad",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "bd0e96cd-2a1f-4db1-90f7-ce80d13ce64c",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "0687c8d9-0f80-43ea-b85a-5795b59b5e97"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "ed262150-9331-4e07-ac7c-6f12aaed5fbc",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "fd1346c9-570f-44cb-8e19-dd29b63a08ad"
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
                    "id": "bf6031e0-02ca-4cb5-91fc-0d5c4e7b9827",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "040800d3-4f5d-4007-a751-ed4e546326a9",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "0687c8d9-0f80-43ea-b85a-5795b59b5e97"
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
                    "id": "00f28ce7-bddb-455b-8f19-708873841a5b",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "43281b79-173b-46d0-b42e-8b9cd1bf1983",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "b220cd32-2384-4cdc-8f73-174b7d19e97d"
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
                    "id": "474114ed-2a98-45ea-893b-eca1051b783f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "8737887f-d453-48bd-af39-dae82ecdc85e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "fac5907d-d435-4421-bc7c-1a1ab7139fb1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b865a1e-3445-44b0-a7d2-1a9670ce4c83",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3443ab0d-6636-48eb-b4a6-a2420d4c308d",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fac5907d-d435-4421-bc7c-1a1ab7139fb1",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "485efd8f-723f-46ce-b232-093f34105593",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fd1346c9-570f-44cb-8e19-dd29b63a08ad",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "731b0e4c-d325-4cbc-b915-f6c28d904e92",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0687c8d9-0f80-43ea-b85a-5795b59b5e97",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "e82314d3-d5d5-4fa9-87fe-1a477089c66b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bbd23f14-1779-448e-804c-79c6df08e8e9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3443ab0d-6636-48eb-b4a6-a2420d4c308d",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e82314d3-d5d5-4fa9-87fe-1a477089c66b",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e633c380-a719-4203-9a48-c5122f816ed7",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4b577ec5-0271-43f1-aa63-ef30abc3b580",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0cc76e72-4aa4-4b4c-990f-d0e14868ffdd",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8e37619b-816a-4653-88ed-bb8319298949",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "3443ab0d-6636-48eb-b4a6-a2420d4c308d",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0cc76e72-4aa4-4b4c-990f-d0e14868ffdd",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5f721ca2-5293-4920-8b7f-d145e49d03bc",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e4790ff1-15ce-44d8-ab72-cb3ea35089ed",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4a692fe3-469e-4969-a85b-ab2917969c1b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44d6a6c2-617f-47bb-8a05-559409c528db",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "cb94be92-d110-41cb-8b17-39bc6a37c40c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'NEEDS_ACTION'",
                    "options": [
                      {
                        "id": "dad4e8f0-73ec-45cb-9f88-83e26ea5bace",
                        "color": "orange",
                        "label": "Needs Action",
                        "value": "NEEDS_ACTION",
                        "position": 0
                      },
                      {
                        "id": "b188d31f-35cb-4bc7-882a-ed94c488276b",
                        "color": "red",
                        "label": "Declined",
                        "value": "DECLINED",
                        "position": 1
                      },
                      {
                        "id": "bf88eee2-1e97-4cb1-aa2a-892b1552768c",
                        "color": "yellow",
                        "label": "Tentative",
                        "value": "TENTATIVE",
                        "position": 2
                      },
                      {
                        "id": "56cf7252-4612-49a5-bcaa-f8f6254a7759",
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
                    "id": "536bde81-4614-46ff-b5f5-fa4595343e4f",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b220cd32-2384-4cdc-8f73-174b7d19e97d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "32f0039c-9e1e-4b9c-9d9c-a5ae9175b9fc",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
            "nameSingular": "favoriteFolder",
            "namePlural": "favoriteFolders",
            "labelSingular": "Favorite Folder",
            "labelPlural": "Favorite Folders",
            "description": "A Folder of favorites",
            "icon": "IconFolder",
            "isCustom": false,
            "isRemote": false,
            "isActive": true,
            "isSystem": false,
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "ab89d2bc-cf74-4bb4-a7a4-b10210c21fa0",
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
                    "id": "2576da51-ab60-4b01-bc9a-600aeec41ebf",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "48e836b9-21ff-46e7-8786-a20c5c2d59b5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "bbe9e88e-55b7-43e0-b745-5a209bef3430",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "53acfe70-2cd3-4b02-9ccf-2cbce42c60c4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "74d64fc2-f7d5-432f-ad72-dcf90b77b316",
                    "type": "RELATION",
                    "name": "favorites",
                    "label": "Favorites",
                    "description": "Favorites in this folder",
                    "icon": "IconHeart",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "53c8b17a-5872-41e3-990c-d75841e41691",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32f0039c-9e1e-4b9c-9d9c-a5ae9175b9fc",
                        "nameSingular": "favoriteFolder",
                        "namePlural": "favoriteFolders"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "74d64fc2-f7d5-432f-ad72-dcf90b77b316",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5384ea74-86f0-4609-9e34-9fb1f49ccf11",
                        "name": "favoriteFolder"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ab89d2bc-cf74-4bb4-a7a4-b10210c21fa0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c2babdfa-88b3-4da0-8921-84ad78638641",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "29d8317d-268a-4cd8-920d-7c98489c214d",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "5de8da40-c82d-4166-8fd8-7f3b6620e52e",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "dea0ed49-42ad-4746-8097-f5028f29df23",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "1860f51b-b38d-47bb-b7d0-cd5780b883d7",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "c230e880-ee6a-47a9-9ffb-f961de4cc1be"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3d918f2f-b8bf-4a50-8f71-131a4e509b1a",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b0d0c0de-0139-47c6-b9e2-6e9f542bff6e"
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
                    "id": "82270737-923b-4e6f-b21d-66058ae55574",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "0900ed0c-fcca-41bc-a874-82ece0fc138f",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "b0d0c0de-0139-47c6-b9e2-6e9f542bff6e"
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
                    "id": "7350335e-9a5f-46dd-b69d-86ae9ad896b4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "529a7c72-4a7d-4ede-a846-e6af05176ad0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "29d8317d-268a-4cd8-920d-7c98489c214d",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7350335e-9a5f-46dd-b69d-86ae9ad896b4",
                        "name": "calendarChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "21b32191-72dc-410b-bb8a-3d6531dafddd",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "30f74c7d-425e-49f5-b2e4-2d9042eb7abf",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c45005a1-416c-4085-95aa-18500582a7a7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "50af401e-e2dd-40e4-a4af-752fd12dbd6a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "72dbfbb8-13f5-4ab7-81c0-3f36c63890c8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "955c8cf2-7179-4a95-8516-d75d92dd06a1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "96af79de-ef09-4d25-b668-8c6cced6370f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "29d8317d-268a-4cd8-920d-7c98489c214d",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "955c8cf2-7179-4a95-8516-d75d92dd06a1",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e633c380-a719-4203-9a48-c5122f816ed7",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "092b2a3f-0c15-424e-864b-09628978cd2b",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1a157b33-adc4-45da-8085-d6c35ec1fe41",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b0d0c0de-0139-47c6-b9e2-6e9f542bff6e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "87c99dc6-a2dc-4bb2-82b7-20750e1e91ca",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "c230e880-ee6a-47a9-9ffb-f961de4cc1be",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5de8da40-c82d-4166-8fd8-7f3b6620e52e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "27670a0f-abda-407b-b811-3fc227b2a099",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "03ad0145-699d-4246-abea-680a81e3be34",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI1"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "03ad0145-699d-4246-abea-680a81e3be34",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "3f14e10e-4769-4fa0-9003-98c7dacdeaca",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "36b269ef-2b78-4c89-ab0f-ae80591624ac",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b4898798-b85b-4cbd-bc87-ab0c44a89fc3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "36b269ef-2b78-4c89-ab0f-ae80591624ac",
                        "name": "blocklist"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "93fa2f53-1b7c-4361-b2e6-87975063b22d",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0797c144-ad25-4953-b201-7fc3c9fe784b",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1bfdc343-3cf0-4342-8a2a-31271a883081",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "774301c0-874a-4ea8-b283-66178bfe82bb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f1840058-f57f-4562-b103-b6bdd1aae45b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "774301c0-874a-4ea8-b283-66178bfe82bb",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1d131bb7-5dcf-485e-93e3-a867c440355b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cce228b5-f2b4-48b9-b59c-d715823b104b",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a9fd743d-041e-4a86-bc07-ef357c90aed3",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "485efd8f-723f-46ce-b232-093f34105593",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b865a1e-3445-44b0-a7d2-1a9670ce4c83",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "485efd8f-723f-46ce-b232-093f34105593",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3443ab0d-6636-48eb-b4a6-a2420d4c308d",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fac5907d-d435-4421-bc7c-1a1ab7139fb1",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "94c32206-a4d5-4c6e-9afb-4706b9892418",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1a5b4a80-cfcb-4497-9380-6b747c758461",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "94c32206-a4d5-4c6e-9afb-4706b9892418",
                        "name": "auditLogs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c7179c98-c344-475e-83ca-67e516265c86",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4aad81a8-b112-4836-bfc6-f09b19beb89a",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fec3feb4-5c5f-4448-b43b-14b545449f86",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0689d748-8129-4ad0-b7d0-68f7ad39371b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "1a7643b0-10f1-472a-accf-93b7ddb869d8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "e0deb9c1-4151-4b8b-af6e-4a050aa21c55",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "385ecbff-fbf4-45db-930c-2b75bf72ec32",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "26a7a48e-84dd-4c2d-a6b4-0741cb59419a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "385ecbff-fbf4-45db-930c-2b75bf72ec32",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "53fec90c-4b7e-44fc-bebb-bd273278f0a2",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e69c4a96-cfb7-460c-aba7-011cbf5c1351",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8b04d26-cd27-4aec-9b53-3ba540ccf32a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e69c4a96-cfb7-460c-aba7-011cbf5c1351",
                        "name": "connectedAccounts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "dd6868d4-f36c-428e-8da6-cdb2adce4e2c",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d58ed761-82e0-4348-aa60-02774c188d74",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f8497670-2720-4a88-9a67-3a1a2b1141e4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b9ab9415-115f-4b9f-a2c3-e39564d0697f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f8497670-2720-4a88-9a67-3a1a2b1141e4",
                        "name": "authoredComments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c104944f-59da-4510-9a41-1d08c2da37e0",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "88d9dee3-beed-4d8e-8660-6f3b0b7bf24d",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f916bfc8-d641-4a7f-85d0-f81a137dc9eb",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9d782e03-e0a0-45f4-b1af-1fa309d60a9a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f916bfc8-d641-4a7f-85d0-f81a137dc9eb",
                        "name": "assignedActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ec0d29b1-caf0-4abc-a413-97cce055207e",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5269f5c2-5705-46f8-8a01-00b6e56d533b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3696e1d8-4072-4802-aa1b-4d3106e8fc47",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5269f5c2-5705-46f8-8a01-00b6e56d533b",
                        "name": "authoredAttachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0a32d643-2339-4e60-933d-d5860e9b2213",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1080acab-4e47-4857-8482-585efc4468f0",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1054135c-376e-485e-8927-e63367bb1362",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1080acab-4e47-4857-8482-585efc4468f0",
                        "name": "authoredActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6f44e4e7-d4ac-40fc-8748-194a0b37d1d1",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "36ea3277-90d2-4c13-a849-81c019ed0000",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a85d0d55-76f2-44ed-9634-6574b13ced51",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "36ea3277-90d2-4c13-a849-81c019ed0000",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fcbfef41-3800-48d2-a730-f486f35c6d4d",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "047d5f3d-1a7e-4914-b7b8-658ca47f699c",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "944280f9-bd62-4694-a08f-84b8131166b9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "ae3dac58-4de8-4660-ba20-a66b11ffebb5",
                        "color": "sky",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "148aaec2-3dd9-4638-bbdc-7a838b4870ab",
                        "color": "red",
                        "label": "24HRS",
                        "value": "HOUR_24",
                        "position": 1
                      },
                      {
                        "id": "84c1cede-460e-4390-aa17-81758689747e",
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
                    "id": "41489416-b10e-410d-b84a-b0f7923fdf60",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "b48e2805-93c8-4fa9-bda5-5518389c447a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a1c7e6ea-478e-45c2-9205-5bb0efa432ad",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "117f2eb6-e7a6-4193-98d2-68b4585d07f5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a1c7e6ea-478e-45c2-9205-5bb0efa432ad",
                        "name": "accountOwnerForCompanies"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "67a4d82e-484f-4f8f-9399-1da3e8f45027",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "da3fffe3-1823-4978-b763-8a3388689211",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "34de8f01-a2f8-4ae8-aa4b-665d9c3a6f85",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b059824e-8feb-466e-a9b5-34f703dfbcc9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "34de8f01-a2f8-4ae8-aa4b-665d9c3a6f85",
                        "name": "assignedTasks"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5feda50-3df7-4a46-b9c1-f6e339c0e2fc",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b8457c33-6f84-4f58-9022-eda5a2b43ea7",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "943c95f4-faf3-44d8-8e91-286dd801ce8e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "3f28a07a-77fe-4a6b-a0bf-bb6f3e53f430",
                        "color": "turquoise",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "2143e452-6756-4891-8cd1-eb9d193228da",
                        "color": "red",
                        "label": "Month First",
                        "value": "MONTH_FIRST",
                        "position": 1
                      },
                      {
                        "id": "0e1723d6-4401-4931-b188-ad8643d054aa",
                        "color": "purple",
                        "label": "Day First",
                        "value": "DAY_FIRST",
                        "position": 2
                      },
                      {
                        "id": "98686b65-1698-4b21-8950-0f926bb11e61",
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
                    "id": "11cfb3a2-2e82-4df3-9269-ab7dd5d78237",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "21b32191-72dc-410b-bb8a-3d6531dafddd",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "a1bc46ce-3232-4a1f-bacf-98b73de8e4ff",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4a7edb17-24da-4ce5-8978-2512c4135138",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "606eff54-cff0-4cd1-8dbf-426cd5371503",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "e5abdf1a-e738-47e1-ae7e-604661608781"
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
                    "id": "3ea74c8a-0cd0-484f-93c6-da2195f8d8a7",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                    "options": [
                      {
                        "id": "b22579e6-ba3c-45e1-ac24-e4784f8bee9a",
                        "color": "green",
                        "label": "As Participant and Organizer",
                        "value": "AS_PARTICIPANT_AND_ORGANIZER",
                        "position": 0
                      },
                      {
                        "id": "f0855319-31a7-4483-acf1-dfdb7631b24e",
                        "color": "orange",
                        "label": "As Participant",
                        "value": "AS_PARTICIPANT",
                        "position": 1
                      },
                      {
                        "id": "200bfe5a-715c-4ba7-8270-b492180fbb5b",
                        "color": "blue",
                        "label": "As Organizer",
                        "value": "AS_ORGANIZER",
                        "position": 2
                      },
                      {
                        "id": "c1fe8fcc-626e-4965-a924-0669d3708fea",
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
                    "id": "d249dc34-3843-4cf2-b859-686e38ab6715",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ec400f7b-a032-47d8-8aad-34ac589eab46",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4f7c368f-e319-4cdd-9c46-ec0d6c32457d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "67d1e47f-d63b-421a-b191-2fbee68467d0",
                        "color": "blue",
                        "label": "Full calendar event list fetch pending",
                        "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "f225024d-2fb7-4959-9d22-83d7a5fe9d72",
                        "color": "blue",
                        "label": "Partial calendar event list fetch pending",
                        "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "e5dd5cc8-349d-45e0-b7cb-0d0c70856841",
                        "color": "orange",
                        "label": "Calendar event list fetch ongoing",
                        "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "fc79fc43-68c3-4099-9a01-a5ca90dd1440",
                        "color": "blue",
                        "label": "Calendar events import pending",
                        "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "52b38123-3ecc-43a0-9000-44bf7968524d",
                        "color": "orange",
                        "label": "Calendar events import ongoing",
                        "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "70dd6918-3257-4d6c-9db9-b4c59c046a41",
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
                    "id": "4a8a7f61-6c60-4ff7-b694-b73f0712f962",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "89e38852-abf0-4156-bf45-1dc3d616ab95",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "69132e23-03ee-4241-a32f-6c612563f93b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "de5891bc-b06f-417a-8d39-84f3d84f2ae9",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "71de52a3-bcf5-4069-b199-dcd0148d3113",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a1bc46ce-3232-4a1f-bacf-98b73de8e4ff",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "d3faebfc-7183-46fb-94d1-fcc3b998df81",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aec00008-918f-4dc4-ab51-370135dc264b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c298b310-a6a3-4062-a751-42679ceb795e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "98a162b7-b987-425f-983f-62416069216b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "21b32191-72dc-410b-bb8a-3d6531dafddd",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c298b310-a6a3-4062-a751-42679ceb795e",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "dd6868d4-f36c-428e-8da6-cdb2adce4e2c",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f5705c55-f1d7-42fc-b2ab-7023517e3872",
                        "name": "calendarChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b12cf43b-dd64-4f3b-a87a-c6cb0237bb27",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "30f74c7d-425e-49f5-b2e4-2d9042eb7abf",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "529a7c72-4a7d-4ede-a846-e6af05176ad0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "21b32191-72dc-410b-bb8a-3d6531dafddd",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "30f74c7d-425e-49f5-b2e4-2d9042eb7abf",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "29d8317d-268a-4cd8-920d-7c98489c214d",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7350335e-9a5f-46dd-b69d-86ae9ad896b4",
                        "name": "calendarChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ac3813f1-8218-4945-998c-d5868236f991",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "46852a16-ef42-44bc-b7d8-e20f23ab9eae",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "ae445296-cf2f-4260-a0f1-2dc80d35cc3a",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "f1065d4e-8050-494d-a36f-6cd4373b3d7a",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "cc72b274-7e71-446e-9772-567535f0ec29",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "fe553d1e-0dce-4f99-bb29-1d348b8d177c",
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
                    "id": "e5abdf1a-e738-47e1-ae7e-604661608781",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "5390bc59-fdf2-4b96-b149-9fcd9771ea74",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "a75a4b88-9323-4cb3-beca-0784a0aa774b",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "2bc15189-032b-4032-8bb9-bed693bfcbc6",
                        "color": "orange",
                        "label": "Share Everything",
                        "value": "SHARE_EVERYTHING",
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
            "id": "1d131bb7-5dcf-485e-93e3-a867c440355b",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "8e9856bb-ce09-4f02-8ed0-c615f14e3106",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a4db5ca5-c04e-4e41-b9b4-ea9ff85e563d",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "703dda61-848e-486b-abe3-db50842212da",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "a3a92043-de5c-4648-a879-8817b52a4c9d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b5f0dd86-ae45-4c5a-97ba-7ad2d41952ab",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "7e2b8bf1-445c-40a7-b7e7-0137886574c4"
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
                    "id": "5941cf35-fcfb-4592-81d2-8475b7feaca0",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "6fea42d8-1381-429a-9c08-ff931e0a90ac",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "81b0b6bf-5930-46e4-8185-c0138b43bdb1"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "96cf0f4f-c0b1-4d29-8818-c2954da93115",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "7e2b8bf1-445c-40a7-b7e7-0137886574c4"
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
                    "id": "696e45e7-8448-483d-a8ce-82e148700bf1",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "2362b90d-d1d4-4c4e-a5a6-9a3322cb42f4",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "7e2b8bf1-445c-40a7-b7e7-0137886574c4"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "62adfd62-4acf-4752-92fb-d564ef07be75",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "386a1577-e07c-4ccb-aae8-87f2c132c9e8"
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
                    "id": "59b1f326-6475-49a8-a5af-fbd439e8e99c",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "6800c05c-6700-4958-b83f-411b44d27aae",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f797db7a-0782-4ebe-8d30-5579337304df",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1d131bb7-5dcf-485e-93e3-a867c440355b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6800c05c-6700-4958-b83f-411b44d27aae",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4dadcf89-39bf-4156-aa08-1a37a424c1b4",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1f834eae-bfbc-47b6-8fb0-4498982bec36",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a3a92043-de5c-4648-a879-8817b52a4c9d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f4bae4cf-3b8d-4a8a-9940-445d77e52e77",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "cce228b5-f2b4-48b9-b59c-d715823b104b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f1840058-f57f-4562-b103-b6bdd1aae45b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1d131bb7-5dcf-485e-93e3-a867c440355b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cce228b5-f2b4-48b9-b59c-d715823b104b",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "774301c0-874a-4ea8-b283-66178bfe82bb",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e1d8f432-a4ce-4bb7-b9ff-6a859fd6e585",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "660f4b7d-5f9d-41d0-b6e0-1a372cbe281b",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'from'",
                    "options": [
                      {
                        "id": "5ee26d98-610e-4417-a54f-00c04a7c6157",
                        "color": "green",
                        "label": "From",
                        "value": "from",
                        "position": 0
                      },
                      {
                        "id": "fa1d9377-1461-4992-ad1c-2e22e228111e",
                        "color": "blue",
                        "label": "To",
                        "value": "to",
                        "position": 1
                      },
                      {
                        "id": "5f488515-bd75-45e5-82c6-f23cc5ea5a2e",
                        "color": "orange",
                        "label": "Cc",
                        "value": "cc",
                        "position": 2
                      },
                      {
                        "id": "dacfb4f8-bfc8-40da-a0d8-d499a4ab8741",
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
                    "id": "b4f6a046-b81d-4d29-a024-43cf60cd3baa",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "817e061d-4038-47ec-b347-124ffb6a787a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1d131bb7-5dcf-485e-93e3-a867c440355b",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b4f6a046-b81d-4d29-a024-43cf60cd3baa",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "acb37969-d0f5-47be-a8ea-efec7b732752",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "50773145-083d-4532-82e6-7001d19d3476",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "58681aad-a22e-4135-951b-66d02cd78ec5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "7e2b8bf1-445c-40a7-b7e7-0137886574c4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "81b0b6bf-5930-46e4-8185-c0138b43bdb1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8e9856bb-ce09-4f02-8ed0-c615f14e3106",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "386a1577-e07c-4ccb-aae8-87f2c132c9e8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "17022a76-5a3d-437f-87e2-f367732a4114",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "f7746993-6b62-4579-8e6f-240007528af5",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjQ="
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "493f3a56-1020-46a2-a2c3-146a746d9172",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "f7746993-6b62-4579-8e6f-240007528af5",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "a72db665-1141-449c-944a-4fc6a6dd7167",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7b5d8a53-6393-4288-9e99-1a4ada655b6a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "17022a76-5a3d-437f-87e2-f367732a4114",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a72db665-1141-449c-944a-4fc6a6dd7167",
                        "name": "messages"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "4dadcf89-39bf-4156-aa08-1a37a424c1b4",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5f7b9796-1309-4afa-9f8f-5b0415e440cb",
                        "name": "messageThread"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "81ff0edb-91dd-4246-9794-aa858c73976a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "f21029e9-356d-497c-81e6-245f43b4f313",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "0bb930dd-9399-4017-886e-14800d1e5a01",
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
                    "id": "d3c2ce9d-3a77-45f1-8960-4a6a9b0ba1ff",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c33eec23-528f-4c15-b85b-09653412abd4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d3c2ce9d-3a77-45f1-8960-4a6a9b0ba1ff",
                        "name": "viewFields"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f90259bb-e2c4-4907-9740-00c74c337fcc",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c86a904e-cafe-4061-b218-5da746c98ac6",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fc66cef0-96fa-48a5-a1a7-b668c0d7e6a6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "8ff9d3f0-24aa-4300-a90b-e04397a282da",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd1ecb5a-92fc-4df0-9805-0029cb7cdd83",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "dd91705f-6e16-4bc2-afb0-400da279659a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "4bf668db-1e68-4475-adf0-d525603ccc48",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": "'INDEX'",
                    "options": [
                      {
                        "id": "5a995b7f-375c-425e-8f16-4c03673c88a5",
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
                    "id": "d36ea730-4cfa-4afe-85fc-5b8dfab60a8d",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "30d1c559-6999-48dd-8547-840104e0548c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d36ea730-4cfa-4afe-85fc-5b8dfab60a8d",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "3e4e6375-1591-4a86-a167-12e2cab87209",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "479de6a3-329b-45b0-85f0-0cf5ed01fb6b",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "54085543-b288-4000-8780-14d266902417",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "8f617f50-4186-4e94-bca1-0af9c890f75e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0bb930dd-9399-4017-886e-14800d1e5a01",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "9247059d-76df-44c2-b6b5-ca39764ab603",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "555967ef-c9c4-400f-9aaf-c0a8f52c9d0e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fd0f7272-637b-41ff-9270-7f775287921a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "e9eaa5e5-1b58-4ae4-8ee0-df5b28d1e304",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5607f7fb-87d3-41d1-8d83-48ac5dd96c02",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e9eaa5e5-1b58-4ae4-8ee0-df5b28d1e304",
                        "name": "viewSorts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cabae7da-efc6-4f43-ab53-2e7f58216eb7",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8bf75419-763e-4aa1-a602-ae9d1cf3c2cd",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "49fbc9bb-c77f-413e-ac40-c4bb2b2075a6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3ac5836b-d02a-47f2-93da-0435c94644e3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "116b5bf5-0de3-4625-b18c-d00f9a7cd715",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "49fbc9bb-c77f-413e-ac40-c4bb2b2075a6",
                        "name": "viewFilters"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "836c53f5-49f1-4a2c-8ee7-352728cfd32d",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9e0ea457-6f22-4bc1-9959-85df308f9e7c",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "086abf19-f6b9-4509-9034-4446c35f3aab",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
            "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
            "dataSourceId": "8b2f5e92-2c3b-4576-9eb6-a92cd36c3734",
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
            "createdAt": "2024-10-24T06:44:08.821Z",
            "updatedAt": "2024-10-24T06:44:08.821Z",
            "labelIdentifierFieldMetadataId": "5482429f-d33c-452f-9293-8bb751c30e65",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "597a22f8-ceab-43e2-ab45-f5647254732a",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "9627d7a8-9490-489c-96da-fef6192c2584",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "135f1821-ca93-41b6-882a-bea1a41410c1"
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
                    "id": "d1f59553-2b5c-484e-a243-b9fbec46e74f",
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                            "id": "e21dc546-9b61-435b-8dd2-91b85c645f0d",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 1,
                            "fieldMetadataId": "62945b61-67df-4aac-98c3-5deb48c5db65"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "842a5304-c91c-4710-96c4-b5a51dfbe0df",
                            "createdAt": "2024-10-24T06:44:08.821Z",
                            "updatedAt": "2024-10-24T06:44:08.821Z",
                            "order": 0,
                            "fieldMetadataId": "70c29705-76a2-446f-ae57-5acd07eb2168"
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
                    "id": "9e66eefc-45e7-4e23-8e18-c7abd0e390d4",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e8ad17a9-962d-4902-bdc6-5d51f6db6645",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "61dda144-a442-4e7a-8049-246b693d2a40",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "257846d1-5233-4165-9ef2-b79bfc5236d6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "61dda144-a442-4e7a-8049-246b693d2a40",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7676f874-8efc-4efb-a08f-39b97b145f0b",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "76a3aadb-60b7-4811-8e42-e816d4707119",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "01de7c4a-7ef3-45b7-821c-f5e8e3758074",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "6f44e4e7-d4ac-40fc-8748-194a0b37d1d1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1054135c-376e-485e-8927-e63367bb1362",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6f44e4e7-d4ac-40fc-8748-194a0b37d1d1",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1080acab-4e47-4857-8482-585efc4468f0",
                        "name": "authoredActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "42a887db-8123-444c-a49b-3ef3991f0517",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c42f398a-df99-449c-86ef-d1e8f70a87d6",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "605ec14b-274c-40cb-8242-67f866468f20",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "70c29705-76a2-446f-ae57-5acd07eb2168",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "135f1821-ca93-41b6-882a-bea1a41410c1",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5482429f-d33c-452f-9293-8bb751c30e65",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "ec0d29b1-caf0-4abc-a413-97cce055207e",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9d782e03-e0a0-45f4-b1af-1fa309d60a9a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ec0d29b1-caf0-4abc-a413-97cce055207e",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "27670a0f-abda-407b-b811-3fc227b2a099",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f916bfc8-d641-4a7f-85d0-f81a137dc9eb",
                        "name": "assignedActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "47752939-2866-40f3-922f-5b9af38200cf",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "918cd6b3-5513-45da-8a11-32af1388b4b8",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d8b5e77a-09bc-4afb-a6f6-136e75fa26cb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "918cd6b3-5513-45da-8a11-32af1388b4b8",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e3e6bc80-bf88-4239-83bc-a4098da6f4b6",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d898bf7d-ac9d-4073-bb8f-91173b6de53c",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "520fa180-7532-46a4-a26e-f5a0fa23ab0a",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
                    "id": "0605299c-a662-4df9-80ed-5a232b7430be",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ec9cde84-ba59-42c3-a33a-633f3f9a4247",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0c811114-48ff-41ae-90df-50a9f54b2280",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0605299c-a662-4df9-80ed-5a232b7430be",
                        "name": "comments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c104944f-59da-4510-9a41-1d08c2da37e0",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2fbf3233-7ba8-41d4-acaf-b29a28351b71",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62945b61-67df-4aac-98c3-5deb48c5db65",
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
                    "createdAt": "2024-10-24T06:44:08.821Z",
                    "updatedAt": "2024-10-24T06:44:08.821Z",
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
        }
      ]
    }
  } as ObjectMetadataItemsQuery

