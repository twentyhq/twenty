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
        "endCursor": "YXJyYXljb25uZWN0aW9uOjM2"
      },
      "edges": [
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "fd99213f-1b50-4d72-8708-75ba80097736",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "fec280d4-58dd-410f-addf-be34060d9f90",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e0cacb65-c2ea-44b7-8d5c-508176b44ec7",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "15d4514a-0c1f-461d-bd8c-cf57010c6979",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "f7c177a2-a730-4571-8c06-b16b26476d69"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9eb89e9b-422d-4f81-83a9-0395e5916c8e",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "8d01445d-36e3-45b1-8804-a3e27e177cbc"
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
                    "id": "9974574d-2f7c-4666-88b5-40982e1fa0bb",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "name": "IDX_241f0cca089399c8c5954086b8d",
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
                    "id": "7e45c242-ba08-4ce7-8521-ddaa16ac1387",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "838dc5e9-c28e-4530-b380-525df2ebbbff",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "b152c814-d0f9-44da-8bf0-b8772e7fe4f8"
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
                    "id": "cfbcdd2e-63cd-41c4-b1b1-e90b9aad7078",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "cd268504-7b0c-48da-902d-0b4935be93b5",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "78a0334d-e28e-4b6e-a529-da28c4e73d89"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "2f776bc0-22cc-463b-a1a7-2986b1691b30",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "8d01445d-36e3-45b1-8804-a3e27e177cbc"
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
                    "id": "a87c2280-8913-4e89-b6a3-4403b70087d4",
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
                    "createdAt": "2024-10-10T15:05:42.725Z",
                    "updatedAt": "2024-10-10T15:05:42.725Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bd9974b4-9210-4ef3-892d-4adc2d40feb6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a87c2280-8913-4e89-b6a3-4403b70087d4",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b3186db8-8ea1-49b6-8922-82e4bdc06eb9",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "78a0334d-e28e-4b6e-a529-da28c4e73d89",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4f3ed77c-73e0-41ba-9519-dbaba2e5f571",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b152c814-d0f9-44da-8bf0-b8772e7fe4f8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "63ae8928-a35e-4053-bf6c-ee548e3614c4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9eac5248-f58a-49d3-ab69-376c12f71680",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "63ae8928-a35e-4053-bf6c-ee548e3614c4",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b0200630-5587-4c10-b5ca-1d1344ee2343",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "145a910b-bd70-42f6-bb62-2fd1424af4e8",
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
                    "createdAt": "2024-10-10T15:05:42.724Z",
                    "updatedAt": "2024-10-10T15:05:42.724Z",
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
                    "id": "f7c177a2-a730-4571-8c06-b16b26476d69",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "67bfa361-4269-4494-b2eb-3a9f26f992fd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "99a8cc42-5f5d-41f2-9d5a-44e18f8412e4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "67bfa361-4269-4494-b2eb-3a9f26f992fd",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "408a7fce-1980-48b2-9c0e-9e23b58b5e07",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fa189561-0de7-478f-8673-9f6b68527bed",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "48b33f6e-6f79-4990-9d3a-7bc3ae6020bb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fa189561-0de7-478f-8673-9f6b68527bed",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9637bff7-b622-48f7-8f6c-2ea7ee18edef",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f23b5bd0-ceff-4741-a250-2fa1c10bb315",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8d01445d-36e3-45b1-8804-a3e27e177cbc",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "fec280d4-58dd-410f-addf-be34060d9f90",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "3f1365a0-a273-4d82-9c58-0095c8590541",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5ea37b6c-76b5-4cc3-981e-fefebaa91607",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7be32a73-9b29-422b-b5aa-1933cf5ad254",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5ea37b6c-76b5-4cc3-981e-fefebaa91607",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "45d38878-cca8-4c8c-b7e4-539adf09c5b1",
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
            "id": "f98ea433-1b70-46d3-aefa-43eb369925d2",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "063a1df3-99e1-478e-9be4-7935cad6dc84",
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
                    "id": "45323df4-a610-484e-a9cf-bac16dd4f085",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "68d0646f-9477-4c8e-8d60-22ac5d665f91",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "84b1f586-7867-4cd9-b793-4826d4d99cf5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fcbbe4ce-01e3-4332-8424-16709c40d819",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f98ea433-1b70-46d3-aefa-43eb369925d2",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "84b1f586-7867-4cd9-b793-4826d4d99cf5",
                        "name": "messages"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "673b8cb8-44c1-4c20-9834-7c35d44fd180",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "efdfbd70-a365-4e96-9fb0-095eb91e061a",
                        "name": "messageThread"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e521c5e0-67d6-4a3c-b4e3-3a767f4237dd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "063a1df3-99e1-478e-9be4-7935cad6dc84",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "948959ff-3aee-4617-aa03-042285cd342b",
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
                    "id": "bae3fa70-47b5-495b-9f52-6724f5823bca",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1ba150ca-e985-4ac5-9f0a-055022bab4eb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bae3fa70-47b5-495b-9f52-6724f5823bca",
                        "name": "connectedAccounts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d828bda6-68e2-47f0-b0aa-b810b1f33981",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "94ca1303-d7ef-4ee0-a661-14e64f16d8d0",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "948959ff-3aee-4617-aa03-042285cd342b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "5f482f83-ad70-448c-b612-a4bcc25cfc2c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f2012359-cf46-43e7-8577-0dfc2615eb4e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "d8aac04a-a1c6-4660-9557-950dbe0ebfe0",
                        "color": "sky",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "221dbdac-72a5-4dc0-99aa-07fd656963f6",
                        "color": "red",
                        "label": "24HRS",
                        "value": "HOUR_24",
                        "position": 1
                      },
                      {
                        "id": "77a20632-42f6-4d82-a296-7de278743bdc",
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
                    "id": "0d89e67d-e021-4fb7-9022-5b91d22706d4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "95aa4a80-fab0-4ffa-ab6b-a0213b94cdbd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "45553fd2-1f4d-4b1b-8536-e41307b80cf7",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "95aa4a80-fab0-4ffa-ab6b-a0213b94cdbd",
                        "name": "authoredComments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "eda936a5-97b9-4b9f-986a-d8e19e8ea882",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "50d416ef-6abd-4329-b51e-7dae0193ce33",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8e4da134-4b27-4f18-9fae-dddee6c6f3e9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c07499e3-5511-4e95-82de-5d2490c89470",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8e4da134-4b27-4f18-9fae-dddee6c6f3e9",
                        "name": "authoredActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1b094a8b-20f7-4402-8fdc-40af2405186f",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "792d296b-22ae-4f57-a2a0-f7dad5cfd4a2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "cf9c06a1-f820-476d-95ad-ebc12598a5f0",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "174dc37b-4a28-4789-8f72-5d3782b32b06",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "4af78cad-69c5-4190-a23f-6db322f80f27",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1aef1a4d-f090-4f5a-8e39-f7d21d465199",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4af78cad-69c5-4190-a23f-6db322f80f27",
                        "name": "auditLogs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "2590029a-05d7-4908-8b7a-a253967068a1",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1475304d-4734-4b66-96a8-ed7d84727fe6",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "07667783-a2b1-4eb5-8e3b-86ec786993fa",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1c4db1ed-209f-4274-bf95-004e0cb74404",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "07667783-a2b1-4eb5-8e3b-86ec786993fa",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6edf5dd8-ee31-42ec-80f9-728b01c50ff4",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "edc0cbe6-9c05-48a7-8cf5-6ff782ad055d",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c5797fa5-1ff4-403f-896a-eb45447b468f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "b391761f-fedd-4a1d-acd1-497c21a615ba",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1185289f-ef64-4b23-a7ef-c16303bea50f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b391761f-fedd-4a1d-acd1-497c21a615ba",
                        "name": "blocklist"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8ae98b12-2ef6-4c20-adc6-240857dd7343",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "84b616f8-2db3-472d-93dd-a8e89b9db810",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5233906b-4d12-4e40-9081-436ff5c6cefe",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "970f0f7f-a30d-4a6f-b023-c3bc5a1b412c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5233906b-4d12-4e40-9081-436ff5c6cefe",
                        "name": "assignedTasks"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0400e2ae-05e4-46f5-b7e1-3fd8e7c15731",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5ef8d68c-516d-42b4-a727-612b1619ae55",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "3687c43a-dab2-4043-b2c5-ba090cb9f46d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "09d87091-a73a-440d-9ef0-11f4639dbd64",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3687c43a-dab2-4043-b2c5-ba090cb9f46d",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "37bb5979-9521-434c-8fca-84a84a545314",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6d033705-c48b-43e0-9cc1-5191c0f9ecd2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5622d0fd-cbf2-4baa-8be9-bc5ea20d321b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6d033705-c48b-43e0-9cc1-5191c0f9ecd2",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "93e24db5-c860-420d-90eb-782c3855a36d",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a308f6ca-1a9b-46f2-9215-f184cd7d53d6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "be802643-0a4b-42d1-a87c-606fce69f9f7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1756bbce-2212-4ec2-b1e3-5053810abdb1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "be802643-0a4b-42d1-a87c-606fce69f9f7",
                        "name": "assignedActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d2f57ffe-0cbd-40a0-b83a-1939aaeac560",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e167ca8f-66e1-4d49-8a2f-eb8c96c2285d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "15a3fcda-90b1-4599-a31c-bd0807184401",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e167ca8f-66e1-4d49-8a2f-eb8c96c2285d",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "af56ee43-5666-482f-a980-434fefac00c7",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "409c079f-742a-4bf5-a710-c782544fa21b",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "80303ac9-b0f9-4f44-8e31-3aa4fec4b0ed",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "fc002c8e-9bde-4057-b5aa-61d40e5d90e6",
                        "color": "turquoise",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "1c89f46a-edbf-4c72-b796-8c04caad4a5c",
                        "color": "red",
                        "label": "Month First",
                        "value": "MONTH_FIRST",
                        "position": 1
                      },
                      {
                        "id": "1ccb080d-9d1e-47ba-affa-ceade664bc83",
                        "color": "purple",
                        "label": "Day First",
                        "value": "DAY_FIRST",
                        "position": 2
                      },
                      {
                        "id": "39d1d19a-2788-427a-ba61-0be5bea94e63",
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
                    "id": "579d2711-4edc-4645-99bb-3ecbb45ebf06",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8f1ea273-7d99-442e-94cc-1f77d494edf7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "b6b66a3c-6c39-4e93-b940-836aced4de12",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9b71c7ff-5d2e-43c4-a524-611e309e6f45",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b6b66a3c-6c39-4e93-b940-836aced4de12",
                        "name": "accountOwnerForCompanies"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "09e066b4-d809-49c8-908b-51b8b8724a4c",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4c6c8adf-6958-48d6-b7e6-0bbab57e2dd1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7a297555-158b-4bcb-a751-18e30aac5f3d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4c6c8adf-6958-48d6-b7e6-0bbab57e2dd1",
                        "name": "authoredAttachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3faea476-e6f7-450d-a699-5f58da0f0a09",
                        "name": "author"
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
            "id": "f04a7171-564a-44ec-a061-63938e29f0c5",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "51abf943-f933-446f-932e-3c7b2dc4c8c6",
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
                    "id": "51abf943-f933-446f-932e-3c7b2dc4c8c6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "19346f2e-1c93-4d28-bb1b-85f232a0a65a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b9268707-467d-42b0-875e-dbccd5974263",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c41f695a-568b-43de-a41c-4f617b51e4e2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "18649d38-e8ea-47ff-8109-89920b2f8fc5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ad8dc420-e7a8-4bf6-9d31-01f43c21ff53",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d0d69076-3369-4672-923c-736b71263a1c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "94e86beb-7c83-4779-b723-c9696eca0c4c",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "195e34dd-24b9-48bc-99ae-66ef1a239ea2",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "670e311e-a705-4e3d-a599-d44826329501",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "81ac8880-d8ea-4794-b87b-77b89b5e5141"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "16f945fd-63b1-4609-a31d-de06265893a2",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "28ca5b60-d78e-4cb3-a142-742ef928631c"
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
                    "id": "e34fc97b-d91f-4aa3-b353-a36806a4fa51",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "d76441f4-8236-45eb-b1f2-40ed4a738439",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "f933b4e1-d1d3-404e-8ef8-ab666fba9d35"
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
                    "id": "93be2dfb-e46f-42dc-a37d-5d550a2658ff",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "4de510a8-25b7-4435-b248-79a5df020a52",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "81ac8880-d8ea-4794-b87b-77b89b5e5141"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "887ecf80-a073-4d15-b42e-8f4290537fd0",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "1e2d2291-460a-4ed8-94e8-d3c1f2bbd74f"
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
                    "id": "cf162c2b-2ec8-4385-98ff-6049e7e968d0",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "be0c4484-eb8b-47e3-ad6d-4a0663d81af7",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "81ac8880-d8ea-4794-b87b-77b89b5e5141"
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
                    "id": "80b77505-9340-45f2-8c9e-931754da1192",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7fd53175-abb0-470e-a394-9c1de590b24e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "80b77505-9340-45f2-8c9e-931754da1192",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "80092f7e-405b-4a94-b767-cdf877b2ef41",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f0adc079-73ce-4316-80e0-90295a7192f1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3edc0e3a-d735-4b9c-ac34-352b48a6e705",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f0adc079-73ce-4316-80e0-90295a7192f1",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "db2d038b-73d8-4c99-a709-8737e7e6658c",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4c42e3b9-26a9-4ce1-a37a-9606da0bc12a",
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
                    "createdAt": "2024-10-10T15:05:42.731Z",
                    "updatedAt": "2024-10-10T15:05:42.731Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7df72299-c1f4-4575-98bf-24156cb3e5b8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4c42e3b9-26a9-4ce1-a37a-9606da0bc12a",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f3e444fc-afa9-45d7-b885-5000c2fa2b7d",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1e2d2291-460a-4ed8-94e8-d3c1f2bbd74f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "298b6f3b-4c03-4583-bbcc-8d43b742903e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "94e86beb-7c83-4779-b723-c9696eca0c4c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f933b4e1-d1d3-404e-8ef8-ab666fba9d35",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "24a17b5b-e5cd-43c9-bcd8-422a00b0ebf6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e38b7482-42bb-43b3-a36f-9c7eec06d59e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "24a17b5b-e5cd-43c9-bcd8-422a00b0ebf6",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "eafdfdda-7cda-4fe4-bcaa-be49232fbfd4",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "81ac8880-d8ea-4794-b87b-77b89b5e5141",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "61963eea-7040-4cba-be90-031464ad1e69",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2cb467d4-4e91-459c-a145-5f276f6186e1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "61963eea-7040-4cba-be90-031464ad1e69",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "74bf0e2d-9fc5-4609-b180-a50e18f5f9ca",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "28ca5b60-d78e-4cb3-a142-742ef928631c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9338cb5b-62e3-4636-a544-c872350ef691",
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
                    "createdAt": "2024-10-10T15:05:42.730Z",
                    "updatedAt": "2024-10-10T15:05:42.730Z",
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
                    "id": "ae4f0b40-33c6-429b-bfca-84812311bfbe",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9fcd7cb0-7f2f-473b-ab03-8f604f9c5d69",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "eda936a5-97b9-4b9f-986a-d8e19e8ea882",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "bf3832d9-cdfd-4d88-bd77-2058fbd81447",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7ee50853-aacd-49da-8d15-cba48b38a353",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "1d8f2dac-d481-4ac1-9e14-ee2e901b5a6f",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "506fa74d-51eb-4160-8dba-3166aa4d2301"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "127f01e8-a06c-479e-8aab-129b21eea852",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "c91d7ffc-5a65-4e57-b5e7-1de26022617b"
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
                    "id": "19dbdfa2-259f-4aaf-b4ee-3d22231ff3fe",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "f9a1e7a6-7cc0-48dd-84bb-226e6959b4a3",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "e36ca5db-8217-4aff-8c62-eeefcfac1691"
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
                    "id": "c91d7ffc-5a65-4e57-b5e7-1de26022617b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "506fa74d-51eb-4160-8dba-3166aa4d2301",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "e36ca5db-8217-4aff-8c62-eeefcfac1691",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "87d27084-f6b5-420d-b17e-0cd16628437f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4bfa0272-145c-4f0e-8c38-54ce1e01fea6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d010344a-e348-47ef-b8c3-a7da39b3285d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "50d416ef-6abd-4329-b51e-7dae0193ce33",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "45553fd2-1f4d-4b1b-8536-e41307b80cf7",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "eda936a5-97b9-4b9f-986a-d8e19e8ea882",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "50d416ef-6abd-4329-b51e-7dae0193ce33",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "95aa4a80-fab0-4ffa-ab6b-a0213b94cdbd",
                        "name": "authoredComments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "04e07930-a3f1-4f57-9265-7364f18f2651",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ed3d480f-cc49-4fee-ae36-94e6edd64940",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "eda936a5-97b9-4b9f-986a-d8e19e8ea882",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "04e07930-a3f1-4f57-9265-7364f18f2651",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ccd81283-2fcb-445c-af6f-c2ac27a42824",
                        "name": "comments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bf3832d9-cdfd-4d88-bd77-2058fbd81447",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "e5915d30-4425-4c4c-a9c4-1b4bff20c469",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "01a5ead6-66ab-4188-87b7-55662b90b318",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "093a3d04-734a-4461-93ad-39cc75e79c9e",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "475f6fe5-3025-4ba7-a243-2e0cffa82820",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "c7a5fd23-5b6f-4f84-bae6-e51aeb6ce3b2"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8882dd98-35e5-441c-8f1d-f83496078d73",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "0f5844fe-f16b-4218-9ece-a4631efcc4a9"
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
                    "id": "d067b570-d85f-4c24-9341-70d0fd8534e9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "edfd48ca-31da-4872-8d23-f18671916ae4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0f5844fe-f16b-4218-9ece-a4631efcc4a9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "54150a7d-80b4-4deb-a09e-e5b57f57fda1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "928bb407-6191-4cb3-95df-a75cd34d11c3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'DRAFT'",
                    "options": [
                      {
                        "id": "70cd7090-c978-4428-88e3-b03269310eaf",
                        "color": "yellow",
                        "label": "Draft",
                        "value": "DRAFT",
                        "position": 0
                      },
                      {
                        "id": "1185beb6-82c3-4429-b12e-a6831ae52c4e",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 1
                      },
                      {
                        "id": "15def951-8fd6-41bb-8a6f-d1c3ecc55e15",
                        "color": "red",
                        "label": "Deactivated",
                        "value": "DEACTIVATED",
                        "position": 2
                      },
                      {
                        "id": "bc1f10f9-b0b5-4b76-bc20-e8d7fbfac7a1",
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
                    "id": "2f2b9ae4-4755-4dd3-a465-1e5ca585df8a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "754a62dc-6d46-41f6-9a61-603e19b44ff8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5c088faa-7d48-44e0-bc61-a338fe597395",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c7a5fd23-5b6f-4f84-bae6-e51aeb6ce3b2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "8afee0ef-f4da-41bf-824a-e7cb357d8fc7",
                    "type": "RELATION",
                    "name": "runs",
                    "label": "Runs",
                    "description": "Workflow runs linked to the version.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5a8466a5-1aa6-48e2-a415-878bcb28eb0e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e5915d30-4425-4c4c-a9c4-1b4bff20c469",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8afee0ef-f4da-41bf-824a-e7cb357d8fc7",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "45b7e1cf-792c-45fa-8d6a-0d5e67e1fa42",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ff72aee0-1e66-4493-a057-4f4455f6b738",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "69e06184-8fa4-4df5-95dc-7563936ed95f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5e09f62f-3f3a-4b9a-a2f8-434e7ac69969",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e5915d30-4425-4c4c-a9c4-1b4bff20c469",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "69e06184-8fa4-4df5-95dc-7563936ed95f",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "46f260da-54b5-4739-90c3-b6aab057e442",
                        "name": "versions"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "01a5ead6-66ab-4188-87b7-55662b90b318",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "The workflow version name",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "d828bda6-68e2-47f0-b0aa-b810b1f33981",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "ab45908f-63c2-4158-b89e-13cec2cfa8fb",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9dafdc07-412c-49ab-9fb3-c22755bf1002",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "04fb0407-046b-4412-a4c6-6392e979dabf",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "76f53ec3-f021-4a75-8886-3916234ada48"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e84dbe39-c202-438b-ba33-9688cfc96ca6",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "7ae566f5-11c4-447a-ba00-dab85eda1d09"
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
                    "id": "7ae566f5-11c4-447a-ba00-dab85eda1d09",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "ab45908f-63c2-4158-b89e-13cec2cfa8fb",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "94ca1303-d7ef-4ee0-a661-14e64f16d8d0",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1ba150ca-e985-4ac5-9f0a-055022bab4eb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d828bda6-68e2-47f0-b0aa-b810b1f33981",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "94ca1303-d7ef-4ee0-a661-14e64f16d8d0",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bae3fa70-47b5-495b-9f52-6724f5823bca",
                        "name": "connectedAccounts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6f5b80bc-d041-4b93-902c-cf5bc3429a82",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5d207989-c76c-49db-add7-a988ba0cd9f6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7eedbbe1-3395-436a-8409-b8b95e5c5bea",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "76f53ec3-f021-4a75-8886-3916234ada48",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44aa8b95-c247-4507-bf76-17ff3449b4cb",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "38ead7c5-b8c5-40a1-9db4-088a93b3c798",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d828bda6-68e2-47f0-b0aa-b810b1f33981",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "44aa8b95-c247-4507-bf76-17ff3449b4cb",
                        "name": "calendarChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8cceadc4-de6b-4ecf-8324-82c6b4eec077",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fe2812bf-cf28-4ab1-9c52-1e8598224947",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7036df84-657d-4e56-bb7b-48a8c72df2be",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b072b41-d4e4-4bb0-b64b-51b17887b5a3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d828bda6-68e2-47f0-b0aa-b810b1f33981",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7036df84-657d-4e56-bb7b-48a8c72df2be",
                        "name": "messageChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "92b529f1-b82b-4352-a0d5-18f32f8e47ab",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4a315b5d-ec77-47cf-9467-cc3d86328f02",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e760de08-161b-4772-8261-a4f13234bd46",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "4e191733-69a2-496c-9c1c-2b8f164c86fe",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "4290f6df-ce65-49e4-a428-246422f12ac7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cdfa99d0-fb44-4527-9851-874e3a0da145",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "384762e8-f9ee-4a98-8990-dfcf89293d60",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5d845a06-0f8b-4ffd-9abe-d277a2eaf367",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "20848b35-b160-470f-a467-8fda3e7f28ef",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "7ea64783-b660-4ade-b155-012c66810d45",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "c2b4689a-1592-4ec9-963a-9f646b709e92",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "63ec8514-11f6-48fe-85cd-c81b5ffbec0a",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "48681c53-aac1-4971-bb56-58bbdd97e7b1"
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
                    "id": "07bed533-2603-40bc-bb3f-1f4c6ee46863",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "3c035e56-b3a8-42c2-bc54-1a2ec53e9b23",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "8fad0250-f884-4a20-9bbc-03f95a213e06"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4fe9fa6f-110a-4f43-a470-d179d91cd1ad",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "48681c53-aac1-4971-bb56-58bbdd97e7b1"
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
                    "id": "f2338a67-5927-4dec-9baa-eb1b0f9b112b",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "8760c9f0-03be-4d4a-9277-7494329a5d3a",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "48681c53-aac1-4971-bb56-58bbdd97e7b1"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a47bad55-3b7d-48ba-9c63-4948e06a8a1d",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "e2a8c344-0c1e-4f49-afdc-7b2cc4d09a54"
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
                    "id": "ccfda9d5-7d59-46a1-b5ba-0579fbbab49b",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "d0d55a3a-a721-40ae-8074-69e922e9bc24",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "c524abb7-af5f-4ac7-9add-a944b6765a0f"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "92b95079-df52-4840-bfe1-f0bf8a729066",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "48681c53-aac1-4971-bb56-58bbdd97e7b1"
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
                    "id": "eb88ae97-325a-4182-bfff-451285fc8599",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "45fbb56c-9349-494f-851e-96bd210b809e",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "61793dd1-8f80-4b0b-bea7-d59bd26667a1"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "fe574c74-845f-4ebc-8b8a-e04fa66b599b",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "48681c53-aac1-4971-bb56-58bbdd97e7b1"
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
                    "id": "130c2f7f-be71-44d5-876b-8d38cc7998b0",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "7c6e3992-e68e-4ebb-884f-d685c958a712",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "48681c53-aac1-4971-bb56-58bbdd97e7b1"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "433e113f-de68-4662-992b-fe6b126408ba",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "a6656d59-63e1-4ec0-afbc-3fd5c509b74e"
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
                    "id": "f014e3b3-5b7d-4b23-a5ec-9a3516afaec1",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "name": "IDX_91e687ea21123af4e02c9a07a43",
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjIy"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a6656d59-63e1-4ec0-afbc-3fd5c509b74e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9907dc47-5e02-4966-91f8-5df22fafaaa4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4a95e7b4-8bdc-49ca-b6d3-ae3d86a6e040",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9907dc47-5e02-4966-91f8-5df22fafaaa4",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1bb59b31-1c7d-4697-98d5-9f984cc9ea9c",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5c2e25df-c9e1-4f06-81ca-7b64251ee6e0",
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
                    "createdAt": "2024-10-10T15:05:42.721Z",
                    "updatedAt": "2024-10-10T15:05:42.721Z",
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
                    "id": "61793dd1-8f80-4b0b-bea7-d59bd26667a1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c524abb7-af5f-4ac7-9add-a944b6765a0f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3faea476-e6f7-450d-a699-5f58da0f0a09",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7a297555-158b-4bcb-a751-18e30aac5f3d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3faea476-e6f7-450d-a699-5f58da0f0a09",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4c6c8adf-6958-48d6-b7e6-0bbab57e2dd1",
                        "name": "authoredAttachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8fad0250-f884-4a20-9bbc-03f95a213e06",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "144087ac-d621-4897-8172-14578d80a07b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0a89048f-6e64-4a8d-ad24-51ab63af3a85",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "144087ac-d621-4897-8172-14578d80a07b",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "561cbb88-39b8-47e2-9f48-6ed929f6ca2a",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7592ab0d-a3bd-459f-a2cb-8220148b7cc6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "58616cac-8d7a-4148-9051-a6878ca7e361",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7592ab0d-a3bd-459f-a2cb-8220148b7cc6",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ab39f722-059b-4804-8683-a75f58db81c3",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "619eb737-7e83-4f2b-958d-8098bf95c91e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2f907f04-3122-4b7b-bd83-c192cacc4a83",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c9ce54d1-cb4a-4492-879f-be86056fcce5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2f907f04-3122-4b7b-bd83-c192cacc4a83",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1b548bb0-c4fc-4232-a18f-b7882b6a1ddf",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "99ab5575-ac5d-4284-8621-7e4ac98a5e51",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "01b00bde-0e1f-4e47-ad06-9df00dd1c7a3",
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
                    "createdAt": "2024-10-10T15:05:42.722Z",
                    "updatedAt": "2024-10-10T15:05:42.722Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07793950-4b19-4d72-afda-f1815ec8e5e4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "01b00bde-0e1f-4e47-ad06-9df00dd1c7a3",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c2721d06-ae7f-40e4-b061-d96179f0be97",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f84f5b1b-70b1-4d06-9093-d4be29917d3e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0984e2b5-1ba8-46d8-ade2-11bf79f52557",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f84f5b1b-70b1-4d06-9093-d4be29917d3e",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f2b2e717-0c19-417c-b81a-98d95cadcc67",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "10689971-5c26-4b38-ace8-bab4bca531a7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "48681c53-aac1-4971-bb56-58bbdd97e7b1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "e2a8c344-0c1e-4f49-afdc-7b2cc4d09a54",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c3bd28b7-06b4-448a-9a25-9fffcc4c856f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "052cd77c-3540-4c77-a571-e0144b944351",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fc78e196-db67-41d8-8d95-b1da605f98d5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "052cd77c-3540-4c77-a571-e0144b944351",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "20646869-ca0e-49a0-9344-fe9272d64f6d",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2df006ae-0867-475d-b5db-15b8152c5e87",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "a0e86fca-ff82-4d04-be4b-13918686feba",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "35ff7d4f-78f1-4ac7-b6f6-c1f76c177648",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7ea64783-b660-4ade-b155-012c66810d45",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "4cf1af4a-e7c7-40c9-88e5-c1bbb79776d0",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d71f5aa2-0433-4b1e-a5f5-001efc908018",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "666cb283-0e48-4982-9a10-b8bd813e93da",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "66cbb849-1798-424d-8924-701491da5955"
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
                    "id": "bf689f43-2536-4bda-9e44-49794722c47e",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "3aadce0a-04ce-4e5e-8ca3-6ed6534fd449",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "31d02158-ff64-4da7-adc8-0b170418bae5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "8c32e5f8-c510-4400-a298-9225d7c16274",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "66cbb849-1798-424d-8924-701491da5955"
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
                    "id": "6f30b5f2-f039-4e58-840d-daaa1b14d6eb",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "b13cd64b-486f-4dcd-9bcd-06632dee78a5",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "eea55a50-4866-4e40-b4ee-55cfc8f24f37"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "941a0458-02b1-46e7-97b8-df46b23da17e",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "66cbb849-1798-424d-8924-701491da5955"
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
                    "id": "3830e581-4114-4914-9858-06cdaf072777",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "f747d40f-bf6e-465f-92b8-c0cd8384109f",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "66cbb849-1798-424d-8924-701491da5955"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4b9718e7-4bf4-4c18-b77d-3982bc066c0b",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "e3d4db69-e331-4db1-b26c-5714900c2996"
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
                    "id": "23f93471-7dd4-418f-8ba6-566493294692",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "f67e1247-7831-4b70-b656-faeac8e86d34",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "de785063-55a9-433d-866f-7b219c8a605e"
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
                    "id": "4cb8c460-5fd2-47f6-8023-058e1efbf59f",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "ae8f9213-825e-4a9f-9b00-704c338d9e58",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "66cbb849-1798-424d-8924-701491da5955"
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
                    "id": "3b43ed22-9ff3-4752-b865-1362201acd96",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "373a9183-07ca-47e6-a43e-870fe50f30c5",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "66cbb849-1798-424d-8924-701491da5955"
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
                    "id": "8baea079-e5c6-4ec3-afa1-821e8b4a8eca",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "ef971ebb-ad07-4d92-8667-b51318ce4b3b",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "7da1d1c6-8ea5-4aac-abea-831483bd204a"
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
                    "id": "f7905ef7-a551-41eb-877f-bd2feef547e0",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "415982de-24e3-4428-a0cc-784d91a4a41c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f7905ef7-a551-41eb-877f-bd2feef547e0",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f82b5a4c-e41c-4d92-b36a-c18b5387d373",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2c985750-bb37-4974-ace6-0f3d65846524",
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
                    "createdAt": "2024-10-10T15:05:42.717Z",
                    "updatedAt": "2024-10-10T15:05:42.717Z",
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
                    "id": "23e21a62-5a1f-4fe5-b5f0-1a5949d622f1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c19bfc7c-f7a6-47ac-bd5b-a352ce7ff74b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eea55a50-4866-4e40-b4ee-55cfc8f24f37",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7da1d1c6-8ea5-4aac-abea-831483bd204a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cfcd1a8f-e40e-49cb-a711-c92aab1e4158",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "0d9f922f-d7db-485e-b5ff-1293a0b51dc9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "85086085-d6fb-4f1c-9f77-1edd0b07adcb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0d9f922f-d7db-485e-b5ff-1293a0b51dc9",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "30756ebf-d27c-4ffb-a30f-8a04b909839f",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "31d02158-ff64-4da7-adc8-0b170418bae5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4cf1af4a-e7c7-40c9-88e5-c1bbb79776d0",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "71e4555a-9fcc-41bd-a8f0-248d1605567e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fa6c3b55-5fe4-4406-89a8-9474ca539769",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "71e4555a-9fcc-41bd-a8f0-248d1605567e",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "05d6227a-bc2d-4e08-8390-cfcec921e4a4",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5569602d-cf0d-4b49-ac90-f5d1fc18bde7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3f7749a5-7d4e-4b3c-b5ae-12b8ea631676",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3e2f75b9-76aa-436f-8d24-129798ca4090",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3f7749a5-7d4e-4b3c-b5ae-12b8ea631676",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "134b368a-cf99-438e-8105-9150a2827fd4",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de785063-55a9-433d-866f-7b219c8a605e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "89fe6ca9-b01e-4f73-8fe2-f51ba3a67024",
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
                    "createdAt": "2024-10-10T15:05:42.718Z",
                    "updatedAt": "2024-10-10T15:05:42.718Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9a12826d-783a-4411-89ac-a2a2369e5eb2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "89fe6ca9-b01e-4f73-8fe2-f51ba3a67024",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4d64de07-68da-42c9-b169-d5adf91ae282",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ea2ca48b-3fa6-4b65-9fb2-eb0a194385f5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "60db3d95-7824-4335-9a49-eec97888c068",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "14f171b6-2a7e-4ae3-adc6-1721e91b791f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "60db3d95-7824-4335-9a49-eec97888c068",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0111a4d1-f387-4f21-bc99-94b80139ff7f",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "85779625-b591-4436-bcee-4e69f937a2ea",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e3d4db69-e331-4db1-b26c-5714900c2996",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7626da40-ddb4-4cbc-8554-441f9785ef5e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "033e99d2-7a1a-405c-950d-06031b93a773",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7626da40-ddb4-4cbc-8554-441f9785ef5e",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "42052d18-6fab-4d08-bb69-667683392617",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "53790b28-fd71-4f0f-994d-72e9cb8b018b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8206c6dd-98d8-4526-9836-bad9f2b065bb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "53790b28-fd71-4f0f-994d-72e9cb8b018b",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f86335f9-07e3-4108-a2a2-cafa6820e85e",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "66cbb849-1798-424d-8924-701491da5955",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "37bb5979-9521-434c-8fca-84a84a545314",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "09d87091-a73a-440d-9ef0-11f4639dbd64",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "37bb5979-9521-434c-8fca-84a84a545314",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3687c43a-dab2-4043-b2c5-ba090cb9f46d",
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
            "id": "c55193eb-042d-42d5-a6a7-8263fd1433a2",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "2416e698-40fa-4a3f-9190-fed51819cd7e",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a4e03ada-488b-4c7b-bcbb-ed2f76d4f82f",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "a7c3045f-a5b7-4409-9d85-0d71e1e7ee1d",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "5505a8ee-ac5f-4b0a-bf90-87f80307d8d8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "5512c691-fa4f-4d75-a0bc-06ca74dd5666",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "6aeb1851-3091-4fb9-9aa5-c2a3e3d3aea3"
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
                    "id": "274f0fa6-16c3-49e2-a033-72b0e7fa4310",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "a6632868-3a90-4dcb-909d-905deee50405",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "5505a8ee-ac5f-4b0a-bf90-87f80307d8d8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "674e69ba-749c-4fd1-925a-9a9498177af6",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "9dd7a1fc-bda5-4452-810c-6a966757e1f1"
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
                    "id": "dc1b5993-36b2-45eb-be43-506965789902",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aa5a8453-0d51-4f10-98b2-0a15fcc723c1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6aeb1851-3091-4fb9-9aa5-c2a3e3d3aea3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "9dd7a1fc-bda5-4452-810c-6a966757e1f1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d0bce78c-57eb-48c1-9a66-5e0de3d63a61",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "05ae03d1-1a38-4c4e-bbe1-f46ca40ece76",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c55193eb-042d-42d5-a6a7-8263fd1433a2",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d0bce78c-57eb-48c1-9a66-5e0de3d63a61",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "db666f56-a9ac-41a3-9a41-bb172dbc9cae",
                        "name": "viewSorts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1e5c3440-e396-44ed-9616-c603c514a96e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "5505a8ee-ac5f-4b0a-bf90-87f80307d8d8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2416e698-40fa-4a3f-9190-fed51819cd7e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "6cefd31f-49fd-4e11-b306-3017ca5a653d",
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
                    "id": "bbb3ca4e-a73c-45a4-9040-d062c94dd8fa",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "712a82cd-43fd-429d-83c5-8b1b2c8e90c0",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "1c2ddd98-f8e7-4c61-ba6a-5508383d4702",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "312163f0-9b2f-4c59-8473-9eb1906b8f41",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "678c1f91-1825-4eb5-9960-bea05bd2ca87",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "312163f0-9b2f-4c59-8473-9eb1906b8f41",
                        "name": "viewFilters"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "88f29168-a15b-4330-89a1-680581a2e86b",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d3db3f5c-49f7-4008-b8a4-cec85ac3505e",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4f39ff46-1298-4408-8db7-47ac99750ff9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "90203b84-6898-4ced-976f-cfdb2c3aa691",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f82b5a4c-e41c-4d92-b36a-c18b5387d373",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "415982de-24e3-4428-a0cc-784d91a4a41c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f82b5a4c-e41c-4d92-b36a-c18b5387d373",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f7905ef7-a551-41eb-877f-bd2feef547e0",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2833387e-799c-44b9-a751-87acdefbd502",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "763a455b-2f04-41be-b4d6-cc0c381bc7e9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'INDEX'",
                    "options": [
                      {
                        "id": "f425b635-b0f5-461b-a321-96e621c25a5d",
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
                    "id": "8c46a404-3ed7-4a94-8a02-e9b03197de5e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7184d260-316e-4e2c-af72-431957b1af98",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8c46a404-3ed7-4a94-8a02-e9b03197de5e",
                        "name": "viewFields"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "50f61b05-868d-425b-ab3f-c085e1652d82",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "911faf74-aef1-4b31-a5a3-f1ed80496f18",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db666f56-a9ac-41a3-9a41-bb172dbc9cae",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "05ae03d1-1a38-4c4e-bbe1-f46ca40ece76",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "db666f56-a9ac-41a3-9a41-bb172dbc9cae",
                        "name": "viewSorts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c55193eb-042d-42d5-a6a7-8263fd1433a2",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d0bce78c-57eb-48c1-9a66-5e0de3d63a61",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "46ed3f5f-46da-4475-acae-0d91a634d7e2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3bc56d31-4180-49d8-9aab-a5de97a6d180",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6cefd31f-49fd-4e11-b306-3017ca5a653d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "196ec541-c7a6-49d3-bc76-138511d47263",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9802ccbc-bfab-42eb-b8f3-1f4cb61d3a26",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "08f7b793-78cc-4cc8-b0d3-19d9b7f61370",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5c9d3acc-4705-4cc5-960e-73e436a0fad2",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7535eeab-940b-4f4f-a541-8a32da4b80a2",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "name": "IDX_425ac6c73ecb993cf9cbc2c2b00",
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
                    "id": "27564152-a4a9-4e1e-804e-541cfb4318a7",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "defacb32-eb1f-4538-a17b-6032425ad870",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "a6152400-37e6-4cb1-91e0-50d2e9f88801"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d269e2cd-5b30-4252-90ff-ee583e2be728",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "665675f5-e856-489e-8f05-0233a3c40507"
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
                    "id": "0d3d7f9e-cce7-4eef-8c7d-381d12fc4606",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "06af04f3-4899-460b-be19-2a821c327eec",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "368d7023-7d0d-4c18-98f5-b83b2633e689"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "ac9fa71b-6751-4f9d-93b1-8321aff03e6f",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "665675f5-e856-489e-8f05-0233a3c40507"
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
                    "id": "9637bff7-b622-48f7-8f6c-2ea7ee18edef",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "48b33f6e-6f79-4990-9d3a-7bc3ae6020bb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9637bff7-b622-48f7-8f6c-2ea7ee18edef",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fa189561-0de7-478f-8673-9f6b68527bed",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6e66cbc4-5e29-4bea-85ce-2dd4eda73a73",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a6152400-37e6-4cb1-91e0-50d2e9f88801",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "788977f3-a7c3-4686-8d46-a915649d524d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "23df41ee-2db8-4901-bab4-7ebbc763f5b7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "c7d6d50c-3677-4639-8c2e-801ac13be879",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a679e0f1-1766-4814-ac8e-64b82329cdb9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2fcfb71-1f23-47b7-a818-27371a165214",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a679e0f1-1766-4814-ac8e-64b82329cdb9",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8323137c-6b37-4ec2-9977-accefa773841",
                        "name": "opportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "30756ebf-d27c-4ffb-a30f-8a04b909839f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "85086085-d6fb-4f1c-9f77-1edd0b07adcb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "30756ebf-d27c-4ffb-a30f-8a04b909839f",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0d9f922f-d7db-485e-b5ff-1293a0b51dc9",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ed057590-4d06-4159-a153-48f124dfed73",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08f7b793-78cc-4cc8-b0d3-19d9b7f61370",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "665675f5-e856-489e-8f05-0233a3c40507",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "d560e379-92da-454c-9f4a-1be6d5543816",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0f840679-a025-4d20-9bc0-102e5865dda0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d560e379-92da-454c-9f4a-1be6d5543816",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "58dbba6f-4a0c-4db7-883a-8a99618be069",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3d67a957-e029-4f7d-b04d-8fedb77a4c57",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d9ca2742-9b92-47b2-8af3-63121919d3e6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ba574a70-ed4f-450b-be6b-71907d7264cd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a0f78a63-3342-48c2-966d-2de9111ef8ca",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ba574a70-ed4f-450b-be6b-71907d7264cd",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "36de1418-2c3d-4444-b88f-606993e3d796",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db2d038b-73d8-4c99-a709-8737e7e6658c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3edc0e3a-d735-4b9c-ac34-352b48a6e705",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "db2d038b-73d8-4c99-a709-8737e7e6658c",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f0adc079-73ce-4316-80e0-90295a7192f1",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "368d7023-7d0d-4c18-98f5-b83b2633e689",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'NEW'",
                    "options": [
                      {
                        "id": "1127a5a1-03ee-4cfd-8319-4b33603f93d7",
                        "color": "red",
                        "label": "New",
                        "value": "NEW",
                        "position": 0
                      },
                      {
                        "id": "5d04982d-f01c-4ad4-8487-d0a12998fbb5",
                        "color": "purple",
                        "label": "Screening",
                        "value": "SCREENING",
                        "position": 1
                      },
                      {
                        "id": "ec927e11-84b1-4d43-a948-cb6ed0642a52",
                        "color": "sky",
                        "label": "Meeting",
                        "value": "MEETING",
                        "position": 2
                      },
                      {
                        "id": "f92507db-1c45-496f-9647-ca3d9014d1f1",
                        "color": "turquoise",
                        "label": "Proposal",
                        "value": "PROPOSAL",
                        "position": 3
                      },
                      {
                        "id": "ca5dea89-f5d5-42e2-b623-c43663338c0a",
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
                    "id": "f2b2e717-0c19-417c-b81a-98d95cadcc67",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0984e2b5-1ba8-46d8-ade2-11bf79f52557",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f2b2e717-0c19-417c-b81a-98d95cadcc67",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f84f5b1b-70b1-4d06-9093-d4be29917d3e",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "24a6beff-2f9f-4dd6-8d77-728080e72adb",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cdcedc94-c874-441c-a3ee-9d787cc67cce",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "24a6beff-2f9f-4dd6-8d77-728080e72adb",
                        "name": "pointOfContact"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fd058bb2-7fee-4d8c-8cce-031cb50e7bfe",
                        "name": "pointOfContactForOpportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5defb8ea-aeae-4f30-a5de-86a67f285c8e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "20d9ac99-1460-4382-ba48-1a2fd242b4f9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "7da10df3-f210-421f-9003-533fe5a19dee",
            "imageIdentifierFieldMetadataId": "4c3340cd-5177-41e3-a76a-12bd85f413b8",
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "88deeb4f-02da-4415-9b86-c706e1f9018f",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "c691cb88-ca83-418f-8b47-a0781ef6be3c",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "d26f789a-9291-4e84-8e9e-4d8cb2cb0a8e",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "9733d9e6-cfea-45ca-b8e3-2368c72c6c22"
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
                    "id": "f021ef99-96fc-46aa-8c92-0fea7900e780",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "d80aa4d1-5fbe-4921-8dda-b69d6fbe4a38",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "7b699b17-5d81-41cd-a16c-a9e678a6ab40"
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
                    "id": "0dec9acf-ed41-4b67-8722-a16296bd79aa",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d0aca517-d1b2-4923-a374-65c899bf677d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0dec9acf-ed41-4b67-8722-a16296bd79aa",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "af56ee43-5666-482f-a980-434fefac00c7",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3ffb6e9f-600b-40bd-90b8-d042607b3c64",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "561cbb88-39b8-47e2-9f48-6ed929f6ca2a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0a89048f-6e64-4a8d-ad24-51ab63af3a85",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "561cbb88-39b8-47e2-9f48-6ed929f6ca2a",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "144087ac-d621-4897-8172-14578d80a07b",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b0200630-5587-4c10-b5ca-1d1344ee2343",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9eac5248-f58a-49d3-ab69-376c12f71680",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b0200630-5587-4c10-b5ca-1d1344ee2343",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "63ae8928-a35e-4053-bf6c-ee548e3614c4",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6eed0523-94de-4b4b-8c11-8173b1efbd84",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "81f8a863-1a7a-40ed-a6bc-c1217122a9e4",
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
                    "createdAt": "2024-10-10T15:05:42.600Z",
                    "updatedAt": "2024-10-10T15:05:42.600Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "1a96cbbe-4d42-4796-b1cc-d7d57f64af0d",
                        "label": "1",
                        "value": "RATING_1",
                        "position": 0
                      },
                      {
                        "id": "4357a50c-5ce4-4b21-b667-cf330053dd2b",
                        "label": "2",
                        "value": "RATING_2",
                        "position": 1
                      },
                      {
                        "id": "a884885a-1eba-4c22-84f2-28d4b60387af",
                        "label": "3",
                        "value": "RATING_3",
                        "position": 2
                      },
                      {
                        "id": "4336f387-6651-4be8-8c3d-5e4e21091087",
                        "label": "4",
                        "value": "RATING_4",
                        "position": 3
                      },
                      {
                        "id": "b7a661cc-67b1-4c40-a8bf-bcab4912d086",
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
                    "id": "40d5dd09-08b0-4b6b-af56-2983d6437941",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "418c54ba-a0da-4feb-8198-9287bf38e31c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "85634196-b66b-4921-b30f-c4e078b58926",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "418c54ba-a0da-4feb-8198-9287bf38e31c",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "54a9d278-cf83-4152-bdfb-f26245d39d65",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2b4a6b30-b62d-4c77-a0ee-c4107d999451",
                    "type": "EMAILS",
                    "name": "emails",
                    "label": "Emails",
                    "description": "Contact’s Emails",
                    "icon": "IconMail",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "c502a91b-fde5-426b-aa27-a856ad28fc71",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "89f811eb-6211-4b53-bc32-1acf1241a5dd",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c502a91b-fde5-426b-aa27-a856ad28fc71",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6edf5dd8-ee31-42ec-80f9-728b01c50ff4",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8507c38d-6f90-4b15-afa1-19b749774092",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b9d318fd-1f3c-45eb-afcc-1f0a4133e2a4",
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
                    "createdAt": "2024-10-10T15:05:42.497Z",
                    "updatedAt": "2024-10-10T15:05:42.497Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "d93d744c-999d-44ce-b374-cedffe58a570",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "0c1c6f5c-e2ad-4330-9855-06982c930095",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "56ab2069-89ce-491e-8743-6260ad4e906c",
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
                    "id": "812d8e31-43da-429c-8189-391e7492e6f5",
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
                    "createdAt": "2024-10-10T15:05:42.397Z",
                    "updatedAt": "2024-10-10T15:05:42.397Z",
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
                    "id": "9f20ae61-c8c6-40a9-b1c0-c4e1417affee",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f62802b9-ef34-4186-8db9-ab2d365aa51a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7b699b17-5d81-41cd-a16c-a9e678a6ab40",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "60664773-e0eb-4376-8d17-543eca22b19d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "89da564c-2cb7-4ffa-9bfb-b067222d167c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "fd058bb2-7fee-4d8c-8cce-031cb50e7bfe",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cdcedc94-c874-441c-a3ee-9d787cc67cce",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fd058bb2-7fee-4d8c-8cce-031cb50e7bfe",
                        "name": "pointOfContactForOpportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "24a6beff-2f9f-4dd6-8d77-728080e72adb",
                        "name": "pointOfContact"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "90040907-df23-4e64-a35e-b1f109b730b5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "4c3340cd-5177-41e3-a76a-12bd85f413b8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "06a69687-dab0-4edd-ba1b-1e23c01ddd11",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7da10df3-f210-421f-9003-533fe5a19dee",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "9733d9e6-cfea-45ca-b8e3-2368c72c6c22",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "80092f7e-405b-4a94-b767-cdf877b2ef41",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7fd53175-abb0-470e-a394-9c1de590b24e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "80092f7e-405b-4a94-b767-cdf877b2ef41",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "80b77505-9340-45f2-8c9e-931754da1192",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "42052d18-6fab-4d08-bb69-667683392617",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "033e99d2-7a1a-405c-950d-06031b93a773",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "42052d18-6fab-4d08-bb69-667683392617",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7626da40-ddb4-4cbc-8554-441f9785ef5e",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7d307698-eece-4e31-8c4c-7d5d596eb542",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "659373cb-ab85-4d36-aed2-58789be66d23",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7d307698-eece-4e31-8c4c-7d5d596eb542",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7fbd8d22-49a3-4c55-a80b-1876129eee86",
                        "name": "people"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "81bb2a30-e02d-48ff-925d-14a6c84d535c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "66a4759e-f5f3-4979-9891-f7c8c60143df",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "81bb2a30-e02d-48ff-925d-14a6c84d535c",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ac01d46e-e6da-42d7-aa8b-16eb964485fa",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "17fc5491-8def-413f-8f02-e1e70bcacbb2",
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
                    "createdAt": "2024-10-10T15:05:42.312Z",
                    "updatedAt": "2024-10-10T15:05:42.312Z",
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
                    "id": "1144f285-5116-49ac-91c1-347877888fcf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "745f585b-7ac3-45c1-9d3a-c984f420c32a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "1929a65e-2e30-4b56-8f85-5c18d9948b57",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "86139958-429c-4d36-80b6-a6faa4ed80ef",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d019f884-cea1-4b6a-a1c7-cb75a63a8bb1",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "766b1864-0ba4-4b3d-b8df-a35c81af7f35",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "a1c53a03-7e99-4d03-bab4-7c7f04f6790e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "956842c7-621e-41a9-95de-8c68f16e3136",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "d9162917-c820-4002-8241-0de6ad5ad8d7"
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
                    "id": "645073b7-e8e5-49de-8b3f-3f9720296159",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "ada56d55-9814-424e-83da-9b584ea0a94b",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "a1c53a03-7e99-4d03-bab4-7c7f04f6790e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "98810481-bd9a-4ab1-bc2c-2c81e4880f50",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "e0415588-ce4c-4715-8027-73e4f59ce40b"
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
                    "id": "6620b20c-e1c7-48c3-a949-4ddd7e121fd0",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "d9ca91ee-6794-4c20-b691-74f0f4091e62",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "a1c53a03-7e99-4d03-bab4-7c7f04f6790e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f559be97-9dae-416c-99df-399a3196f84c",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "27af584b-7869-48cd-82bf-b7cea235cfbb"
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
                    "id": "b0a44268-a8cc-4d34-b6ac-2c4f41daa993",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "d7209fa3-c69a-4999-9e19-ae7e7ceee1c0",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "ced82236-eddf-45f8-8378-6a84b285c8ba"
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
                    "id": "0bb617e3-ede3-40d2-b4f6-617bba617132",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "173120ce-b190-45d5-9fe5-c2324268c4ed",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "a1c53a03-7e99-4d03-bab4-7c7f04f6790e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "9876795c-3bdc-4f96-9500-a078d118117f",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "0af727ed-8edf-438f-ad53-b9b8b4af8bc1"
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
                    "id": "68babc5a-ed9a-4b27-b2a9-b20224b46f9a",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "7b157673-8b45-479e-a460-6dca57c36204",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "a1c53a03-7e99-4d03-bab4-7c7f04f6790e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3e40e0d6-d4c1-4a34-a9c1-df89ee8cd6d4",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "fe1628ec-c28d-4fcb-9e43-b9335be3ef81"
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
                    "id": "a1c53a03-7e99-4d03-bab4-7c7f04f6790e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "58dbba6f-4a0c-4db7-883a-8a99618be069",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0f840679-a025-4d20-9bc0-102e5865dda0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "58dbba6f-4a0c-4db7-883a-8a99618be069",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d560e379-92da-454c-9f4a-1be6d5543816",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3156baf4-4034-4c43-bba6-345807b15bc3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "93e24db5-c860-420d-90eb-782c3855a36d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5622d0fd-cbf2-4baa-8be9-bc5ea20d321b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "93e24db5-c860-420d-90eb-782c3855a36d",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6d033705-c48b-43e0-9cc1-5191c0f9ecd2",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d9162917-c820-4002-8241-0de6ad5ad8d7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8376c21d-fd88-4006-b8d7-40d1f27692ac",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "49ad3d9a-01a3-4c82-b6bc-a8d21398e51a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8376c21d-fd88-4006-b8d7-40d1f27692ac",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "325aafc9-525a-457e-9f67-15a8994bd6b8",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2d6776a4-7f43-46a6-9fbf-cf1fa21cd13f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "a8323586-5ff9-491c-a067-ae4a348adaf5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f4341a81-fcba-4480-a757-929635181162",
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
                    "createdAt": "2024-10-10T15:05:42.708Z",
                    "updatedAt": "2024-10-10T15:05:42.708Z",
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
                    "id": "86139958-429c-4d36-80b6-a6faa4ed80ef",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "41761644-f778-43cb-a5d8-80286d7dee8c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "fe1628ec-c28d-4fcb-9e43-b9335be3ef81",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7d14aef8-f63c-47cd-8ce7-29806518d6ca",
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
                    "createdAt": "2024-10-10T15:05:42.709Z",
                    "updatedAt": "2024-10-10T15:05:42.709Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8ddd621-26f4-4fa8-b426-3f545094bd5f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7d14aef8-f63c-47cd-8ce7-29806518d6ca",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "baea02d1-1817-4df3-b9eb-c8020452f3e0",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5096824c-bd72-488b-902e-e5768070e736",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0f9bad06-3762-4797-9079-d7d190da55e5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5096824c-bd72-488b-902e-e5768070e736",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "50c723e9-af8c-455e-a9c6-0dbd591b0258",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e0415588-ce4c-4715-8027-73e4f59ce40b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4e1bab9b-3855-42c5-b0ea-7fcc119949fe",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ced82236-eddf-45f8-8378-6a84b285c8ba",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "49b48088-8d98-4d8d-a9a8-c4f8f462aa72",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e940e46a-ab1a-4e0c-82a4-1af978adcc2c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "49b48088-8d98-4d8d-a9a8-c4f8f462aa72",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "77726d5f-43e6-4011-952a-d9585dc14597",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ac01d46e-e6da-42d7-aa8b-16eb964485fa",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "66a4759e-f5f3-4979-9891-f7c8c60143df",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ac01d46e-e6da-42d7-aa8b-16eb964485fa",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "81bb2a30-e02d-48ff-925d-14a6c84d535c",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c1522e3e-e03f-43d3-971c-af60e584ca7a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1a313c5f-8fbe-4986-9d1c-933e9ed4053c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0af727ed-8edf-438f-ad53-b9b8b4af8bc1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0a5469c0-341b-4085-bc79-a75bae50a278",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "27af584b-7869-48cd-82bf-b7cea235cfbb",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "af56ee43-5666-482f-a980-434fefac00c7",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "cfcd1013-a7a8-492d-acbe-c5266baed6cd",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "6c2da5c4-b0b0-41d1-967b-7dfc0fac7a06",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "8ffd767f-2987-402f-8a27-13245a019583",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "5434e1fa-b089-4dd2-ba71-230ec323236f"
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
                    "id": "8c3e1ee1-755e-4984-8ee0-15468d599b5f",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "8de5e4bc-53ba-44ee-821c-d4ec87ef7997",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "af004cd3-1b68-41be-a50a-6e406c979968"
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
                    "id": "914d1b2f-2ff6-40ad-94fe-e64b4eda1dae",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "6d19cbcf-1260-4188-a3bb-dd6360f89851",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "ab0136fe-6d3a-469a-81ef-a3c5f4426226"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0de99eff-7da0-4dbd-a5be-823464ed6522",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "af004cd3-1b68-41be-a50a-6e406c979968"
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
                    "id": "3c4d9816-97f2-4528-ab9b-47013dd6fa12",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "733e467e-f258-4d83-aa99-2db4674a9c10",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'NEEDS_ACTION'",
                    "options": [
                      {
                        "id": "f42abc88-10a8-4e85-8beb-22c099372e83",
                        "color": "orange",
                        "label": "Needs Action",
                        "value": "NEEDS_ACTION",
                        "position": 0
                      },
                      {
                        "id": "4ba52cef-ccdb-4e62-a811-6f7db31fb836",
                        "color": "red",
                        "label": "Declined",
                        "value": "DECLINED",
                        "position": 1
                      },
                      {
                        "id": "790aa598-64bc-4be7-a1f1-c87380fbcc36",
                        "color": "yellow",
                        "label": "Tentative",
                        "value": "TENTATIVE",
                        "position": 2
                      },
                      {
                        "id": "777111bf-a14a-4e36-9626-647c75978155",
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
                    "id": "77115ac7-f8d1-486f-9c8d-020532f996c1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "409c079f-742a-4bf5-a710-c782544fa21b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "15a3fcda-90b1-4599-a31c-bd0807184401",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "af56ee43-5666-482f-a980-434fefac00c7",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "409c079f-742a-4bf5-a710-c782544fa21b",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e167ca8f-66e1-4d49-8a2f-eb8c96c2285d",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f75ef0a1-23d5-4504-8ccf-5729806d14b5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cd9d90ae-65c2-49b4-ac70-76335498e9f1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "af56ee43-5666-482f-a980-434fefac00c7",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f75ef0a1-23d5-4504-8ccf-5729806d14b5",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "981fd8a9-37a2-4742-98c1-08509d995bd3",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "db316e57-6812-40b7-8c9f-e85f0f492ca8",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cfcd1013-a7a8-492d-acbe-c5266baed6cd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "af004cd3-1b68-41be-a50a-6e406c979968",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f3a2d134-0b23-4bc6-a857-cbaeb85a54d8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "ab0136fe-6d3a-469a-81ef-a3c5f4426226",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3ffb6e9f-600b-40bd-90b8-d042607b3c64",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d0aca517-d1b2-4923-a374-65c899bf677d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "af56ee43-5666-482f-a980-434fefac00c7",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3ffb6e9f-600b-40bd-90b8-d042607b3c64",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0dec9acf-ed41-4b67-8722-a16296bd79aa",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "57fa6b52-2169-4ecf-ab1a-6c5a5983dbb4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5434e1fa-b089-4dd2-ba71-230ec323236f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "40d7bc5e-2d27-4fb4-afd8-99434799e144",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f5a2f8c3-aff4-484e-9dc6-5a649031dc5f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "981fd8a9-37a2-4742-98c1-08509d995bd3",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "49a3400e-e71f-40cb-86b0-bfa8d2ef02ca",
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
                    "id": "9d659849-ffbb-4550-9590-e6fa9967b586",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2d337999-7468-4f6f-bce0-87679dcb5e2f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "daa269f7-c111-492e-88c8-1bfe82e3d637",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "981fd8a9-37a2-4742-98c1-08509d995bd3",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2d337999-7468-4f6f-bce0-87679dcb5e2f",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "149f1a0d-f528-48a3-a3f8-0203926d07f5",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1dc48a6a-270b-466a-8e11-9efd02729791",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d83e0bfc-1879-4a13-92b1-e639f58b2d20",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "9dcd16f4-35f6-4cd3-b13a-6d9f18d6ef3c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "0500721b-4273-4d6b-be4c-3458ac521ef5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "747dc06a-73f3-43cc-ac03-6195edd77034",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d2e9755f-4593-452b-b3c0-8debd51153d6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "db316e57-6812-40b7-8c9f-e85f0f492ca8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "cd9d90ae-65c2-49b4-ac70-76335498e9f1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "981fd8a9-37a2-4742-98c1-08509d995bd3",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "db316e57-6812-40b7-8c9f-e85f0f492ca8",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "af56ee43-5666-482f-a980-434fefac00c7",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f75ef0a1-23d5-4504-8ccf-5729806d14b5",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c7a5ce10-8ca8-40ec-a989-45cb53475d4a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "82922b98-0f27-421a-8b70-0b845fc827e7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "6edaa2aa-617d-4f54-906e-885682bd6d1c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "918e7bcf-0afb-4857-9b35-ec307ccfb1ac",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02e208a0-45cc-429b-ba83-32406e20cb2e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c0383d68-3275-4827-9350-f7a117869e16",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7bbecfaa-b414-40b7-b72e-e5285ff61818",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7a6164bc-0594-40de-94b6-b79065dadaca",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "49a3400e-e71f-40cb-86b0-bfa8d2ef02ca",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "ba5611be-cafc-41bb-bdfc-a4881b6adb25",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "92b529f1-b82b-4352-a0d5-18f32f8e47ab",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "c6b9967f-3bf3-4de8-a0f7-1a5d8404068f",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f45f65e3-0387-4af1-be3e-162dc3c77a62",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "98488b85-c958-4fa4-9f8b-5b0387eee9e8",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "7365f80a-9b92-4aeb-81aa-0a25be7f0e97"
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
                    "id": "4a315b5d-ec77-47cf-9467-cc3d86328f02",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4b072b41-d4e4-4bb0-b64b-51b17887b5a3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "92b529f1-b82b-4352-a0d5-18f32f8e47ab",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4a315b5d-ec77-47cf-9467-cc3d86328f02",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d828bda6-68e2-47f0-b0aa-b810b1f33981",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7036df84-657d-4e56-bb7b-48a8c72df2be",
                        "name": "messageChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b38ce87f-490e-4787-b665-096ca83ea9d7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "df4c1a6b-ed46-4ca5-baf7-6f0fb053e1bf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "2db95ca6-4d28-46a1-aef8-7e947244bf17",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'email'",
                    "options": [
                      {
                        "id": "dda1da8b-785f-4d7f-8f42-8e9f48c3ba7d",
                        "color": "green",
                        "label": "Email",
                        "value": "email",
                        "position": 0
                      },
                      {
                        "id": "72d3ec38-a442-442b-bea8-34252a14769b",
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
                    "id": "58657610-ed68-4735-933e-390cfa3b448a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "18c6892b-8723-41fd-b414-5fbd14e59fd4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c6b9967f-3bf3-4de8-a0f7-1a5d8404068f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "6a0dc17c-504f-4f37-b423-7e4a806b89df",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "5e01dcbf-ed18-43e9-a2d0-ee3286d9d0bf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "79232ac7-685b-4591-978c-7ce86bd10aec",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7365f80a-9b92-4aeb-81aa-0a25be7f0e97",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "90648e68-2f7c-4d0c-ab8a-79e6eec769ee",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "612d689f-eb0d-4e6b-b72e-82acb8ae76e2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "92b529f1-b82b-4352-a0d5-18f32f8e47ab",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "90648e68-2f7c-4d0c-ab8a-79e6eec769ee",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "631882fd-28e8-4a87-8ceb-f8217006a620",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "aac54567-521e-4fe8-a0bc-116f2aabf592",
                        "name": "messageChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ee91dcdd-90d4-4258-9575-cf5a49c2c67c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "b5da4f14-5aca-4311-bf0c-06a0678388a1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "3b99363d-b465-47ee-b7d6-8f9776c5aa84",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "ab451f3e-e3c0-4695-bcdb-f4e1d4d80d9a",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "9b543bcd-1a4d-4daf-ac80-1bf6a10451e8",
                        "color": "blue",
                        "label": "Subject",
                        "value": "SUBJECT",
                        "position": 1
                      },
                      {
                        "id": "036d2ea4-5333-4131-9c07-6f59796388f3",
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
                    "id": "2547a346-f71c-4f28-a7fd-6181ac26ea98",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "9b7e0a88-b635-4ce3-a401-0bd9429aec84",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6cc31dce-2ad0-443f-b4ba-54f2fdf11bb3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'SENT'",
                    "options": [
                      {
                        "id": "631a81c3-ac67-48c7-879f-f09e17696387",
                        "color": "green",
                        "label": "Sent and Received",
                        "value": "SENT_AND_RECEIVED",
                        "position": 0
                      },
                      {
                        "id": "229a6e5b-3299-4b75-ada7-7512be411ba5",
                        "color": "blue",
                        "label": "Sent",
                        "value": "SENT",
                        "position": 1
                      },
                      {
                        "id": "9cc86698-3cc4-439e-b1db-c7f3fcb57039",
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
                    "id": "01f7fe00-ee96-4c2e-a7e8-568cf750ee1e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7ebfb686-ecb8-422b-b0e0-f657876f54ae",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "0401fe59-2ba4-4fb7-987f-f034cc320dc0",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "39e83b69-9c92-40dc-9d56-108c0cc503df",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "9add7229-e120-492f-bb55-2331213d816e",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "2f387da6-5621-4a98-a393-2afbb6dca0cc",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "e7ae1d24-0d7b-47bf-b9f5-37c58f339b19",
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
                    "id": "6b5d2d3d-7f2c-473c-a480-72f0118a94fe",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "a1249249-c073-4722-9959-9080e9f280e8",
                        "color": "blue",
                        "label": "Full messages list fetch pending",
                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "4ce4e92c-a3e2-43ae-a1bf-c99fd6e58155",
                        "color": "blue",
                        "label": "Partial messages list fetch pending",
                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "2953ac47-534a-49e3-9c78-4577db774dd0",
                        "color": "orange",
                        "label": "Messages list fetch ongoing",
                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "7518c99f-9d8d-4a94-b747-e527e4579dbe",
                        "color": "blue",
                        "label": "Messages import pending",
                        "value": "MESSAGES_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "98ace89b-8b49-4e7a-8d75-d8a4b9648c51",
                        "color": "orange",
                        "label": "Messages import ongoing",
                        "value": "MESSAGES_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "89909514-399d-41c7-97c0-260f087a3a56",
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
            "id": "8cceadc4-de6b-4ecf-8324-82c6b4eec077",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "72762a31-80cf-45cf-bc6c-49609d4c940e",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e342f766-c2f8-4ad5-8c91-c2a5bca9590f",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "352f65a9-6b7e-4b12-a29a-d9b9800297d9",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "1b7e194e-4b39-40ab-a91c-eb06cf6d6ddc"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3e73f944-1df9-4e7c-9ceb-13a6add8fe23",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "41fef682-fda8-488a-baa6-a58e38d5b71a"
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
                    "id": "e9781587-1419-4700-bc53-ed815b69d169",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1acd47f7-2ddf-434a-876a-683f602dcfbd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "2a678cd8-8077-4fc0-bc7e-68dfd9d58668",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "142f711d-95ba-4707-9e83-209c50d93e85",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "bac0648b-9b3b-4bce-b59c-bc5afedd2012",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "365a2ee9-e467-4cd9-b74f-045c2b832560",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "a372985e-5404-45ce-9265-510552007505",
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
                    "id": "6689ffa2-6e50-4a72-8574-3e91469976b6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "72ea3e4e-79c9-40ff-b83d-e413d86d7781",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "72b79103-2228-4530-8481-68504790bfcd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "1b7e194e-4b39-40ab-a91c-eb06cf6d6ddc",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "674a0bad-ff98-40d2-a711-47a92d7b3a46",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "6c212aec-f637-4abc-84e4-9328ec4f454a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "2d3cece4-46f8-4b2d-bff7-381591429995",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "0fd14471-aa1c-4637-91a6-0917614dfe35",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "b95b0238-fdb2-4b63-8b3f-908a156cb6ee",
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
                    "id": "c845dede-582d-47c8-a631-34862f5e9c87",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "75fba4a8-ddf9-46e3-a6f0-4da74d180dc4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "fe2812bf-cf28-4ab1-9c52-1e8598224947",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "38ead7c5-b8c5-40a1-9db4-088a93b3c798",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8cceadc4-de6b-4ecf-8324-82c6b4eec077",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fe2812bf-cf28-4ab1-9c52-1e8598224947",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d828bda6-68e2-47f0-b0aa-b810b1f33981",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "44aa8b95-c247-4507-bf76-17ff3449b4cb",
                        "name": "calendarChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7ec1ea5f-c98f-4569-91ef-8797294cf183",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c040d959-808f-4b7d-8844-ac87a45c0b04",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8cceadc4-de6b-4ecf-8324-82c6b4eec077",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7ec1ea5f-c98f-4569-91ef-8797294cf183",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "149f1a0d-f528-48a3-a3f8-0203926d07f5",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5d68a9e6-9e85-4ae4-8601-43e685dcf90b",
                        "name": "calendarChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "41fef682-fda8-488a-baa6-a58e38d5b71a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eeb8bb8b-85b7-46f8-a434-ab35704f1afa",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                    "options": [
                      {
                        "id": "6632b738-012f-4841-ac54-7bc6593cd551",
                        "color": "green",
                        "label": "As Participant and Organizer",
                        "value": "AS_PARTICIPANT_AND_ORGANIZER",
                        "position": 0
                      },
                      {
                        "id": "c0b6918d-925c-4f80-a900-c374833e2c40",
                        "color": "orange",
                        "label": "As Participant",
                        "value": "AS_PARTICIPANT",
                        "position": 1
                      },
                      {
                        "id": "639ded55-04c3-4068-b340-ad8eb6137cee",
                        "color": "blue",
                        "label": "As Organizer",
                        "value": "AS_ORGANIZER",
                        "position": 2
                      },
                      {
                        "id": "2493394c-ca24-4600-8caf-fff75eae583a",
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
                    "id": "5b646ee9-aa3d-41ff-b786-3f9cfad7ee12",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "9ddbe48c-b6b5-4582-8079-b97ab459dc05",
                        "color": "blue",
                        "label": "Full calendar event list fetch pending",
                        "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "b632a8f0-ab5d-4c39-954e-4b0a5b7bce35",
                        "color": "blue",
                        "label": "Partial calendar event list fetch pending",
                        "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "9591ff35-9a14-4f04-b25c-482d84f57e6a",
                        "color": "orange",
                        "label": "Calendar event list fetch ongoing",
                        "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "f64e01f4-de1e-4b2c-99ee-31f649b65dcd",
                        "color": "blue",
                        "label": "Calendar events import pending",
                        "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "c56a146f-88fe-4676-a69f-5b22e75c8376",
                        "color": "orange",
                        "label": "Calendar events import ongoing",
                        "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "084344f8-fa0c-45a2-ac45-0526b9afc004",
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
                    "id": "72762a31-80cf-45cf-bc6c-49609d4c940e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "6a3003ce-1041-451b-8e66-f69d9b0dd2ab",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "8ae98b12-2ef6-4c20-adc6-240857dd7343",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "50f7918f-c677-4e34-baae-3012e3b6d5a8",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7a223e05-f418-496a-b258-1df57a7c4acf",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "8e1db228-ee1a-455f-a00d-b32d69aeb309",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "fd3f4444-1951-4869-a25c-f6198d9d37a2"
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
                    "id": "c1ba16b8-45a1-48b3-a945-eb9390421d4c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "50f7918f-c677-4e34-baae-3012e3b6d5a8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "d3588b81-9a6d-49c9-8c1f-66006c5bbf40",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c7856143-ebb9-425b-8e13-1be7b63387a6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fd3f4444-1951-4869-a25c-f6198d9d37a2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "fe6a4945-0e11-43b8-b052-a8b433f341ea",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "84b616f8-2db3-472d-93dd-a8e89b9db810",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1185289f-ef64-4b23-a7ef-c16303bea50f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8ae98b12-2ef6-4c20-adc6-240857dd7343",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "84b616f8-2db3-472d-93dd-a8e89b9db810",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b391761f-fedd-4a1d-acd1-497c21a615ba",
                        "name": "blocklist"
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
            "id": "88f29168-a15b-4330-89a1-680581a2e86b",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "f036575d-bd0d-43da-bbcc-545384a75b64",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d9778e2a-e57a-4117-83f1-5da2c78036e2",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "efb10056-7029-43c4-a074-4504eca5c775",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "cb05eb84-b336-494a-b3d9-eb9cf64dba10"
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
                    "id": "31efb6ce-3571-4786-99bf-40b9f22e4678",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "70f8731d-006a-4a1e-9391-e5f180c63d24",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "8180c369-8f83-4244-9ae5-ebed178d3601",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "961fcf39-4973-49e0-8686-715d1c6f8f7f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f036575d-bd0d-43da-bbcc-545384a75b64",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "cb05eb84-b336-494a-b3d9-eb9cf64dba10",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "854ce53f-9073-4cc2-b3f3-2f8467afccc1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "356029e0-d8e9-4d36-8921-936265c27d90",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "2004362c-52c5-4a3f-99e7-ddef7eeaf9af",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d3db3f5c-49f7-4008-b8a4-cec85ac3505e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "678c1f91-1825-4eb5-9960-bea05bd2ca87",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "88f29168-a15b-4330-89a1-680581a2e86b",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d3db3f5c-49f7-4008-b8a4-cec85ac3505e",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "312163f0-9b2f-4c59-8473-9eb1906b8f41",
                        "name": "viewFilters"
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
            "id": "823e8b9d-1947-48f9-9f43-116a2cbceba3",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "9f7e51c5-d296-4a59-ad04-82c92b5b26fd",
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
                    "id": "df862ab4-9901-4a1e-87ae-231f783f9647",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "af92d573-4e0e-409c-be39-d6756f5ac540",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e1890810-5257-4bf8-9f56-e1c801424462",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "fb283e72-3e58-4509-aa8a-f5e364bc6862",
                    "type": "TEXT",
                    "name": "operation",
                    "label": "Operation",
                    "description": "Webhook operation",
                    "icon": "IconCheckbox",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "defedbc6-cf37-4bed-9594-0eba58fb3b0f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "4b835f28-6706-49df-8399-5ba87cb02d0f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "9f7e51c5-d296-4a59-ad04-82c92b5b26fd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "aba08838-a25b-4e59-b634-c3bbd4e38c47",
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
                    "id": "ef5457d1-77ad-4c68-87aa-31a108160922",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "05d6227a-bc2d-4e08-8390-cfcec921e4a4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fa6c3b55-5fe4-4406-89a8-9474ca539769",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "05d6227a-bc2d-4e08-8390-cfcec921e4a4",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "71e4555a-9fcc-41bd-a8f0-248d1605567e",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "561bdfd7-91b4-426c-a7ff-30c5469e7d54",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "1f691bcc-0b90-452c-b922-54a6f39e9e37",
                    "type": "RELATION",
                    "name": "runs",
                    "label": "Runs",
                    "description": "Workflow runs linked to the workflow.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e73cc998-6f8b-4968-a56f-504738c4aa71",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1f691bcc-0b90-452c-b922-54a6f39e9e37",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "45b7e1cf-792c-45fa-8d6a-0d5e67e1fa42",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1e1810ae-6ebf-49a1-b7e4-2b217c3a5a13",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "330683fa-283d-4e2a-b351-88ded0749f48",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "427e9c03-19df-4f8a-89d7-af0bcdbe8a38",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0cf97b57-1c48-48a3-bccb-c1e4557e1de0",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "bd955f7c-c827-477e-9aaa-f46fc9cc09a1",
                    "type": "RELATION",
                    "name": "eventListeners",
                    "label": "Event Listeners",
                    "description": "Workflow event listeners linked to the workflow.",
                    "icon": "IconVersions",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dc06be4a-4d8f-45ed-b331-4a353a080894",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bd955f7c-c827-477e-9aaa-f46fc9cc09a1",
                        "name": "eventListeners"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "65cce76e-0f4c-4de1-a68a-6cadce4d000e",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "de496463-da61-4d9d-8d14-730a48c66f45",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aba08838-a25b-4e59-b634-c3bbd4e38c47",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "46f260da-54b5-4739-90c3-b6aab057e442",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5e09f62f-3f3a-4b9a-a2f8-434e7ac69969",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "46f260da-54b5-4739-90c3-b6aab057e442",
                        "name": "versions"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e5915d30-4425-4c4c-a9c4-1b4bff20c469",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "69e06184-8fa4-4df5-95dc-7563936ed95f",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "97f377f3-7d31-486d-8a59-fad17484efcf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "de537cba-0660-4a43-872a-8a5c867f3638",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "6edf5dd8-ee31-42ec-80f9-728b01c50ff4",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "78a29a18-74ca-4d90-81bc-563916d82017",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "b4a9798c-a77f-443b-9a68-4f105affbed2",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "name": "IDX_6d9700e5ae2ab8c294d614e72f6",
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
                    "id": "89bb196f-6678-4b21-a527-4753a6830cff",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "aca3173e-3128-402e-9c4c-7c0f126b7626",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "6b5429cd-116b-4470-95e6-bb4a15269715"
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
                    "id": "f588e813-71dc-4cf9-96d9-d7443bb11cbf",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "665ff0a5-e5b6-4fc3-8a04-670078815cf6",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "90325846-5bd5-4867-ad09-a2dd66b569b3"
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
                    "id": "76780c2e-a012-4ff7-8c5f-1dee290dd458",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'from'",
                    "options": [
                      {
                        "id": "37c322cd-7db3-4bcd-9b57-00c6e99a2e95",
                        "color": "green",
                        "label": "From",
                        "value": "from",
                        "position": 0
                      },
                      {
                        "id": "d1bcffe7-9417-4580-98ed-6f3202713057",
                        "color": "blue",
                        "label": "To",
                        "value": "to",
                        "position": 1
                      },
                      {
                        "id": "6e4bb3b8-7ba1-48bb-9a4d-a5027f7e1283",
                        "color": "orange",
                        "label": "Cc",
                        "value": "cc",
                        "position": 2
                      },
                      {
                        "id": "51527ffd-620b-4b53-859c-93714cddc508",
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
                    "id": "90325846-5bd5-4867-ad09-a2dd66b569b3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6f328351-fb72-43a2-bf91-ef7c98972589",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e497dbce-a48a-4ea8-82c9-5f8a38ca26dc",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "edc0cbe6-9c05-48a7-8cf5-6ff782ad055d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1c4db1ed-209f-4274-bf95-004e0cb74404",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6edf5dd8-ee31-42ec-80f9-728b01c50ff4",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "edc0cbe6-9c05-48a7-8cf5-6ff782ad055d",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "07667783-a2b1-4eb5-8e3b-86ec786993fa",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0b579046-7846-4d34-a22a-21c64991e776",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "78a29a18-74ca-4d90-81bc-563916d82017",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "6b5429cd-116b-4470-95e6-bb4a15269715",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8afc59b9-a712-4158-9103-910312d481e5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2433b7ad-ce4f-4ea3-a572-910b6e2ce66f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6edf5dd8-ee31-42ec-80f9-728b01c50ff4",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8afc59b9-a712-4158-9103-910312d481e5",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "673b8cb8-44c1-4c20-9834-7c35d44fd180",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8791bc22-6d54-4267-9b2f-758946e99bbf",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2bb51505-1b04-43c7-8e81-74c33911f4f8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ef9604ad-a71d-444c-936f-bbd8e4a18997",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "8507c38d-6f90-4b15-afa1-19b749774092",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "89f811eb-6211-4b53-bc32-1acf1241a5dd",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6edf5dd8-ee31-42ec-80f9-728b01c50ff4",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8507c38d-6f90-4b15-afa1-19b749774092",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c502a91b-fde5-426b-aa27-a856ad28fc71",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3f2d6322-f612-4c7c-8329-42de4a988867",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "6a09bc08-33ae-4321-868a-30064279097f",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "c9c0b35e-a84c-449a-b6ca-69efc8f71a52",
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
                    "id": "14bcdb46-70ad-4947-92d6-2b981a01d8dc",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "20646869-ca0e-49a0-9344-fe9272d64f6d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fc78e196-db67-41d8-8d95-b1da605f98d5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "20646869-ca0e-49a0-9344-fe9272d64f6d",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "052cd77c-3540-4c77-a571-e0144b944351",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "45d38878-cca8-4c8c-b7e4-539adf09c5b1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7be32a73-9b29-422b-b5aa-1933cf5ad254",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "45d38878-cca8-4c8c-b7e4-539adf09c5b1",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5ea37b6c-76b5-4cc3-981e-fefebaa91607",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "20718057-bac8-4dc8-b755-d547d461ddf2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "94bd02c5-733a-466f-8525-e4b53a221533",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f86335f9-07e3-4108-a2a2-cafa6820e85e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8206c6dd-98d8-4526-9836-bad9f2b065bb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f86335f9-07e3-4108-a2a2-cafa6820e85e",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "53790b28-fd71-4f0f-994d-72e9cb8b018b",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2f11215d-436b-4cf6-ab77-7bb582af633c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c9c0b35e-a84c-449a-b6ca-69efc8f71a52",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "fb8df7bd-0b5b-42cf-9f62-1e0b05a06286",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "325aafc9-525a-457e-9f67-15a8994bd6b8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "49ad3d9a-01a3-4c82-b6bc-a8d21398e51a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a09bc08-33ae-4321-868a-30064279097f",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "325aafc9-525a-457e-9f67-15a8994bd6b8",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8376c21d-fd88-4006-b8d7-40d1f27692ac",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9c8f3988-16e1-40be-abc1-4ab3e03822f6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e94bf127-bdef-4d9e-a703-5202d624bc5b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "5691876e-1463-4117-a7ef-2d0b089fa1ff",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "0d1fcd80-02e2-4bbe-80c5-bc0c09f9241d",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "4afbc310-7760-4e36-9796-7590c75c902b",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "559b6272-f96c-4f39-883e-a01b4741b2ed"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "39a9a119-fbfe-4a02-9b32-cb805fa52791",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "e99d0dcd-4e33-46bd-9bd7-d80a957003f8"
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
                    "id": "46331eb9-1722-4cfa-8d2e-fdbc87e6d879",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "e3e5b381-059f-49f9-acc6-38d92ca70bd7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "61700dc0-7a07-4421-a85f-50d1b40ef66e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0a0a3b30-46a9-476b-ab0c-a4b9a91a0456",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d6ad1859-b68e-4363-8bba-7db17b61fca5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'TODO'",
                    "options": [
                      {
                        "id": "af1e2cda-b54d-4014-b1ec-dc8237098028",
                        "color": "sky",
                        "label": "To do",
                        "value": "TODO",
                        "position": 0
                      },
                      {
                        "id": "e2c18902-9ba6-4d35-9036-22d8c04985fd",
                        "color": "purple",
                        "label": "In progress",
                        "value": "IN_PROGESS",
                        "position": 1
                      },
                      {
                        "id": "b0f06a1d-7821-46ae-9eb9-1a13201d0a2f",
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
                    "id": "e99d0dcd-4e33-46bd-9bd7-d80a957003f8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1bb59b31-1c7d-4697-98d5-9f984cc9ea9c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4a95e7b4-8bdc-49ca-b6d3-ae3d86a6e040",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1bb59b31-1c7d-4697-98d5-9f984cc9ea9c",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9907dc47-5e02-4966-91f8-5df22fafaaa4",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0400e2ae-05e4-46f5-b7e1-3fd8e7c15731",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "970f0f7f-a30d-4a6f-b023-c3bc5a1b412c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0400e2ae-05e4-46f5-b7e1-3fd8e7c15731",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5233906b-4d12-4e40-9081-436ff5c6cefe",
                        "name": "assignedTasks"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9fd18cc3-10c9-4017-91a6-ee42e1955e29",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "77726d5f-43e6-4011-952a-d9585dc14597",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e940e46a-ab1a-4e0c-82a4-1af978adcc2c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "77726d5f-43e6-4011-952a-d9585dc14597",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "49b48088-8d98-4d8d-a9a8-c4f8f462aa72",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0111a4d1-f387-4f21-bc99-94b80139ff7f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "14f171b6-2a7e-4ae3-adc6-1721e91b791f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0111a4d1-f387-4f21-bc99-94b80139ff7f",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "60db3d95-7824-4335-9a49-eec97888c068",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5691876e-1463-4117-a7ef-2d0b089fa1ff",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "ceef7231-1933-4c8b-a2d1-a0e9749cd69a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "74bf0e2d-9fc5-4609-b180-a50e18f5f9ca",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2cb467d4-4e91-459c-a145-5f276f6186e1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "681f89d7-0581-42b0-b97d-870e3b2a8359",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "74bf0e2d-9fc5-4609-b180-a50e18f5f9ca",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "61963eea-7040-4cba-be90-031464ad1e69",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bec117bf-86b7-4531-b192-d8917777a9c6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "559b6272-f96c-4f39-883e-a01b4741b2ed",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "673b8cb8-44c1-4c20-9834-7c35d44fd180",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "8624c6f2-87b6-4bb5-b90a-4fd63230c2fd",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ccd3d99a-7422-40f1-9eb7-39fd739613bf",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "dbb0a4c8-7607-474c-a360-56ee92260e7c",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "373b653f-399a-4fe2-940e-b10efe9973b1"
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
                    "id": "373b653f-399a-4fe2-940e-b10efe9973b1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "34f11a4b-3fab-4402-a1dd-e5ba6eb57a40",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "129b9862-08af-4424-b313-2b38dae6c003",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8791bc22-6d54-4267-9b2f-758946e99bbf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2433b7ad-ce4f-4ea3-a572-910b6e2ce66f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "673b8cb8-44c1-4c20-9834-7c35d44fd180",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8791bc22-6d54-4267-9b2f-758946e99bbf",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6edf5dd8-ee31-42ec-80f9-728b01c50ff4",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8afc59b9-a712-4158-9103-910312d481e5",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c2396aae-ce94-4dc2-b0b1-45c595bbb067",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "82974b3e-72cf-47d4-9b1d-52008c370b14",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "efdfbd70-a365-4e96-9fb0-095eb91e061a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fcbbe4ce-01e3-4332-8424-16709c40d819",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "673b8cb8-44c1-4c20-9834-7c35d44fd180",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "efdfbd70-a365-4e96-9fb0-095eb91e061a",
                        "name": "messageThread"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f98ea433-1b70-46d3-aefa-43eb369925d2",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "84b1f586-7867-4cd9-b793-4826d4d99cf5",
                        "name": "messages"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b5d8a70e-5e7c-4ec1-bcdd-d29ce5ce31bf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "a1050506-9f21-47d5-be1f-2ae25b974c1c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "9a32cb5a-af34-4c27-9e66-a741674b0701",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "8624c6f2-87b6-4bb5-b90a-4fd63230c2fd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "1be8e5e6-167b-49cd-9a37-224969040f28",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f7d4519f-c655-4cb4-a371-c7bf44451fd4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "673b8cb8-44c1-4c20-9834-7c35d44fd180",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1be8e5e6-167b-49cd-9a37-224969040f28",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "631882fd-28e8-4a87-8ceb-f8217006a620",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "310ff925-20c8-4525-9343-9c243efeb8df",
                        "name": "message"
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
            "id": "65cce76e-0f4c-4de1-a68a-6cadce4d000e",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "bc61037f-5ab1-48c4-9565-5b743b45bc1e",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "74da0929-df7b-429d-93dc-5658aeb95a87",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "b6983178-9322-4010-aa89-61d2860af688",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "1e7c94c5-c013-4924-aa6c-cb67d45b33a3"
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
                    "id": "8cf7ceee-898f-4835-b966-eaf2c1429798",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6f46ad82-ecec-472d-9a1b-dbabbda3c339",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "18c59e83-4a1a-406b-b1cc-8b7706c9a661",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1e7c94c5-c013-4924-aa6c-cb67d45b33a3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "de496463-da61-4d9d-8d14-730a48c66f45",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dc06be4a-4d8f-45ed-b331-4a353a080894",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "65cce76e-0f4c-4de1-a68a-6cadce4d000e",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "de496463-da61-4d9d-8d14-730a48c66f45",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bd955f7c-c827-477e-9aaa-f46fc9cc09a1",
                        "name": "eventListeners"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bc61037f-5ab1-48c4-9565-5b743b45bc1e",
                    "type": "TEXT",
                    "name": "eventName",
                    "label": "Name",
                    "description": "The workflow event listener name",
                    "icon": "IconPhoneCheck",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "3b08bd66-e033-4c78-befd-5a7e19be4ebe",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "631882fd-28e8-4a87-8ceb-f8217006a620",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "87d926ac-0aab-4ea6-b41f-7ab64cbdd65b",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f6c85d6e-6efb-43bb-bb4e-47a3b98856f9",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "ce685d06-92ee-4612-9cb1-dbd6bb9fa713",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "c44b95ee-3e23-48c0-864f-eb693a46719d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "48bde8b2-0629-4028-bb59-cc1634902000",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "c6659e96-78c1-4a71-b927-5d5c0d852248"
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
                    "id": "d1d32a0f-692a-4dce-8abf-cc11c26fbc07",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "4490d296-7ef7-46b5-b76a-20797916881b",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "c44b95ee-3e23-48c0-864f-eb693a46719d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b029d0fa-593e-4000-a708-b7263f338e77",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "bdb6b50a-a084-4717-83d4-cdf7d36a056e"
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
                    "id": "5ae16290-e931-4be5-b155-343044540f60",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c6659e96-78c1-4a71-b927-5d5c0d852248",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bdb6b50a-a084-4717-83d4-cdf7d36a056e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "310ff925-20c8-4525-9343-9c243efeb8df",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f7d4519f-c655-4cb4-a371-c7bf44451fd4",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "631882fd-28e8-4a87-8ceb-f8217006a620",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "310ff925-20c8-4525-9343-9c243efeb8df",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "673b8cb8-44c1-4c20-9834-7c35d44fd180",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1be8e5e6-167b-49cd-9a37-224969040f28",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "490611ce-ddb6-4dee-a2c1-159bdf0ab5a9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "aac54567-521e-4fe8-a0bc-116f2aabf592",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "612d689f-eb0d-4e6b-b72e-82acb8ae76e2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "631882fd-28e8-4a87-8ceb-f8217006a620",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "aac54567-521e-4fe8-a0bc-116f2aabf592",
                        "name": "messageChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "92b529f1-b82b-4352-a0d5-18f32f8e47ab",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "90648e68-2f7c-4d0c-ab8a-79e6eec769ee",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c44b95ee-3e23-48c0-864f-eb693a46719d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "316e028e-acbf-4d5e-a7ad-28ba9ae41938",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "87d926ac-0aab-4ea6-b41f-7ab64cbdd65b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "139c4436-2b14-41f0-a29f-64da3c7f46cf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "16d3b512-51f7-451a-8531-666b7ad80bcb",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'INCOMING'",
                    "options": [
                      {
                        "id": "de903213-75ec-464b-b4ea-29b636638475",
                        "color": "green",
                        "label": "Incoming",
                        "value": "INCOMING",
                        "position": 0
                      },
                      {
                        "id": "2d0e7921-4cb4-41ac-87a6-263957a0f037",
                        "color": "blue",
                        "label": "Outgoing",
                        "value": "OUTGOING",
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
            "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "e865ea21-e17e-47e3-8d14-6b3e4aa8b6a9",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f5874304-d8ee-4cba-93dc-4f8f3d4826c7",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "c858a5d9-2120-460a-9006-827014ce7de5",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "f64fd8c3-ce7d-462f-b12d-1437434cd614"
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
                    "id": "26f6e296-e919-4239-985e-d9c26ada07f1",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "2914f54a-0fd1-4467-b8b7-b3564ea2eeb5",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "a5636fee-d403-4824-b2fd-bfdc1144927c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "5e838e0c-73c2-4e9c-abed-b4e117ec5ef0",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "9d00fec5-f501-4c12-831d-78936dca9c4f"
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
                    "id": "ccd81283-2fcb-445c-af6f-c2ac27a42824",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ed3d480f-cc49-4fee-ae36-94e6edd64940",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ccd81283-2fcb-445c-af6f-c2ac27a42824",
                        "name": "comments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "eda936a5-97b9-4b9f-986a-d8e19e8ea882",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "04e07930-a3f1-4f57-9265-7364f18f2651",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "eac47cad-333f-40d9-bb57-0f9239520875",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9c2c3c63-b1ef-4065-b314-93d812db936e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e865ea21-e17e-47e3-8d14-6b3e4aa8b6a9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "d2f57ffe-0cbd-40a0-b83a-1939aaeac560",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1756bbce-2212-4ec2-b1e3-5053810abdb1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d2f57ffe-0cbd-40a0-b83a-1939aaeac560",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "be802643-0a4b-42d1-a87c-606fce69f9f7",
                        "name": "assignedActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "054b0615-518b-4b65-84ec-8663b07bff43",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9d00fec5-f501-4c12-831d-78936dca9c4f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1b094a8b-20f7-4402-8fdc-40af2405186f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c07499e3-5511-4e95-82de-5d2490c89470",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1b094a8b-20f7-4402-8fdc-40af2405186f",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8e4da134-4b27-4f18-9fae-dddee6c6f3e9",
                        "name": "authoredActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a5636fee-d403-4824-b2fd-bfdc1144927c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "df718d85-fe6c-4740-8397-e7b3d3809ce8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7d84599b-e518-4dcf-8719-1b7a78843303",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "247a39b1-477f-4727-abe3-11f17a816611",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2ed29dba-4fa9-47d4-b5cb-7cdf6912267f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "247a39b1-477f-4727-abe3-11f17a816611",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "89b493ae-6316-4de6-894b-e65566e3ca3a",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fe4cb329-682f-426b-b367-08f7ae5f3e10",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "f64fd8c3-ce7d-462f-b12d-1437434cd614",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ab39f722-059b-4804-8683-a75f58db81c3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "58616cac-8d7a-4148-9051-a6878ca7e361",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ab39f722-059b-4804-8683-a75f58db81c3",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7592ab0d-a3bd-459f-a2cb-8220148b7cc6",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aacc33bd-7ba4-4885-a43a-761c48826279",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "657693c8-662d-4679-b89e-d930d0c04ad9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "50f61b05-868d-425b-ab3f-c085e1652d82",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "9561ae08-0209-4d26-ade1-04fcf0b5ee55",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a6ec8c2f-707f-4bf8-a3de-51d7424f7f53",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "name": "IDX_260f80ae1d2ccc67388995d6d05",
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
                    "id": "b0ea4747-200b-4948-a5a0-10f6b7150d72",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "6584884e-629c-4a0c-9531-1e5f9606efc5",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "2e706f77-92fe-40e2-847e-f9d03c4e8762"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "5088ff87-fa9f-494b-8052-f30b42a9d54b",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "779c3768-2387-4954-ac78-eac2266b879c"
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
                    "id": "9561ae08-0209-4d26-ade1-04fcf0b5ee55",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "2e706f77-92fe-40e2-847e-f9d03c4e8762",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "779c3768-2387-4954-ac78-eac2266b879c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "03e37726-2233-4ff6-ac40-423aad045e61",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "a292d9ab-60ac-4483-89a7-4473f1f7faa4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "d6a609c8-f596-46a2-acfc-086adea1744f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "639e87d6-fbfd-4cd0-9b61-c374f2b0f816",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "a6aec827-c50d-4079-aff3-a7b4632d74ea",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "adffcf84-60be-48b3-bb3e-a13d5451cc84",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "911faf74-aef1-4b31-a5a3-f1ed80496f18",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7184d260-316e-4e2c-af72-431957b1af98",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "50f61b05-868d-425b-ab3f-c085e1652d82",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "911faf74-aef1-4b31-a5a3-f1ed80496f18",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c46916fc-0528-4331-9766-6ac2247a70fb",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8c46a404-3ed7-4a94-8a02-e9b03197de5e",
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
            "id": "45b7e1cf-792c-45fa-8d6a-0d5e67e1fa42",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "a93f8b7c-6f7b-434f-9c7c-c316640d959a",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "babe87a1-7a4d-41a3-b53b-4b0e388a0724",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "e5983670-2cb1-43d9-96a4-423e039570d3",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "986ce5ad-1381-4fd4-84ba-a91e2582d0ca"
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
                    "id": "1b77049d-6e10-4dce-a985-f76540e522a4",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "075185d5-c0ec-4b02-8fe0-266cca150361",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "6b7c15a7-bc2e-4ebd-9083-9e561573f4b2"
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
                    "id": "6b7c15a7-bc2e-4ebd-9083-9e561573f4b2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "b5683731-4a83-493a-b0f6-5a521b1fdc65",
                    "type": "RAW_JSON",
                    "name": "output",
                    "label": "Output",
                    "description": "Json object to provide output of the workflow run",
                    "icon": null,
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": true,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e0e5b711-ccda-4616-98e2-736d43e3b0b1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "0b00ed15-16de-44da-801d-29633021ceaa",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a93f8b7c-6f7b-434f-9c7c-c316640d959a",
                    "type": "TEXT",
                    "name": "name",
                    "label": "Name",
                    "description": "Name of the workflow run",
                    "icon": "IconText",
                    "isCustom": false,
                    "isActive": true,
                    "isSystem": false,
                    "isNullable": false,
                    "isUnique": false,
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "986ce5ad-1381-4fd4-84ba-a91e2582d0ca",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "351e2e90-ca93-4e66-9733-811998b116d1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "'NOT_STARTED'",
                    "options": [
                      {
                        "id": "79559b6a-641c-423a-8d76-bfb6f571da2e",
                        "color": "grey",
                        "label": "Not started",
                        "value": "NOT_STARTED",
                        "position": 0
                      },
                      {
                        "id": "d2443780-e320-435f-b7ba-9b17a77d401c",
                        "color": "yellow",
                        "label": "Running",
                        "value": "RUNNING",
                        "position": 1
                      },
                      {
                        "id": "e6eb98ea-9413-49d0-a7ef-1f04980890c6",
                        "color": "green",
                        "label": "Completed",
                        "value": "COMPLETED",
                        "position": 2
                      },
                      {
                        "id": "85887608-fd25-4798-a91e-90f44d2c91e1",
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
                    "id": "1e1810ae-6ebf-49a1-b7e4-2b217c3a5a13",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e73cc998-6f8b-4968-a56f-504738c4aa71",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "45b7e1cf-792c-45fa-8d6a-0d5e67e1fa42",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1e1810ae-6ebf-49a1-b7e4-2b217c3a5a13",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7cab9c82-929f-4ea3-98e1-5c221a12263d",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1f691bcc-0b90-452c-b922-54a6f39e9e37",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3c44c451-c804-49f0-8505-1b6cd9b9ff8d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2df11dc4-8ac5-4832-840d-391487e2743b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "ca88a1c5-f009-46e7-8350-640d4154c203",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aed8a050-3ad5-4db6-b8e3-ec207e5e381e",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ff72aee0-1e66-4493-a057-4f4455f6b738",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5a8466a5-1aa6-48e2-a415-878bcb28eb0e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "45b7e1cf-792c-45fa-8d6a-0d5e67e1fa42",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ff72aee0-1e66-4493-a057-4f4455f6b738",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e5915d30-4425-4c4c-a9c4-1b4bff20c469",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8afee0ef-f4da-41bf-824a-e7cb357d8fc7",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bcd5dc97-b168-4c12-9624-9a6de51d5497",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8f462d3d-8f64-4ebb-a4a3-b0b89ff804ce",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "d065441d-308f-4fc9-845d-30c634328802",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f130efec-e85d-4aae-9178-4d3a7043f155",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "88d0bdd6-b736-4e77-ac0d-ae165ae66db5",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "d4cc7cf0-d1b1-4be9-af85-de8d8e184ed1"
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
                    "id": "be1d11f7-41e8-470d-bac8-1da9e1c06cd4",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "915aa8e3-2bd6-440f-a8b5-ba746caf88cb",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "dc199543-c1a2-44d6-861b-70631e9ba86a"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a188d050-017d-4863-8ac8-0bcdac2fe36c",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "adf5b30e-3dad-46d9-b69b-caf13743a69c"
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
                    "id": "422e32e1-5431-4946-be58-eac598431d29",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "497ab28c-706d-4b61-befe-9823b5a140f3",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "bb01f3ff-e3d2-4f56-98b6-7cb8e41b17a5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "aa082553-f078-48b1-976f-47d477a8ee11",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "dc199543-c1a2-44d6-861b-70631e9ba86a"
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
                    "id": "d8d0f396-224e-4d9e-8d44-f96044ff6378",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "5b205e1b-9c11-49a8-917b-a0ae7695e0e2",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "949994a2-dedb-4b12-967a-bf8646549ec2"
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
                    "id": "d065441d-308f-4fc9-845d-30c634328802",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "54a9d278-cf83-4152-bdfb-f26245d39d65",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "85634196-b66b-4921-b30f-c4e078b58926",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "54a9d278-cf83-4152-bdfb-f26245d39d65",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "418c54ba-a0da-4feb-8198-9287bf38e31c",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8972d18f-9c46-4d11-bffb-f77278a17b99",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b3d96a62-4d15-433d-bd4f-caf3c62d1876",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d4cc7cf0-d1b1-4be9-af85-de8d8e184ed1",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9b42b1c9-98e0-4893-9ae9-3e9195dc904a",
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
                    "createdAt": "2024-10-10T15:05:42.713Z",
                    "updatedAt": "2024-10-10T15:05:42.713Z",
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
                    "id": "89b493ae-6316-4de6-894b-e65566e3ca3a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2ed29dba-4fa9-47d4-b5cb-7cdf6912267f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "89b493ae-6316-4de6-894b-e65566e3ca3a",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a1aa92b-1ee9-4a7e-ab08-ca8c1e462d16",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "247a39b1-477f-4727-abe3-11f17a816611",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "36de1418-2c3d-4444-b88f-606993e3d796",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a0f78a63-3342-48c2-966d-2de9111ef8ca",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "36de1418-2c3d-4444-b88f-606993e3d796",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ba574a70-ed4f-450b-be6b-71907d7264cd",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a0752532-9ed5-4ba1-8ee4-eb7393d36a62",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "75f42dd7-0c3a-4658-98d2-7af163fbcf6a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a0752532-9ed5-4ba1-8ee4-eb7393d36a62",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b9c2d94a-41dd-4a59-8266-76973d472a09",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9deff6cb-fd97-4d2a-9c5b-be2fd90d5d7e",
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
                    "createdAt": "2024-10-10T15:05:42.714Z",
                    "updatedAt": "2024-10-10T15:05:42.714Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0b9d9ac1-f853-4df1-be0e-1b2f6fce2d4f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9deff6cb-fd97-4d2a-9c5b-be2fd90d5d7e",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2951011a-6c7b-4a4c-bded-f212f70ca93a",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bb01f3ff-e3d2-4f56-98b6-7cb8e41b17a5",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "949994a2-dedb-4b12-967a-bf8646549ec2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "adf5b30e-3dad-46d9-b69b-caf13743a69c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dc199543-c1a2-44d6-861b-70631e9ba86a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "bed55285-cec4-4a78-ba3a-a70febd66dc6",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "371d89ea-c6b5-41b6-a190-1ab22566b8d0",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "name": "IDX_UNIQUE_2a32339058d0b6910b0834ddf81",
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
                            "id": "229ae450-d9c8-40fa-ad58-fefe1925b806",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "c41db169-bd37-442d-a8ce-61a60307587c"
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
                    "id": "ba420185-6ce2-4162-8705-7e7fb4ceb3b5",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "296575a1-21ac-4821-96b5-3cfc4fda0486",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "6e131b8b-27b6-4b00-8a41-8e35ccca14ae"
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
                    "id": "d2c39785-3dfb-41e3-8d72-93438715b82f",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "cf214e76-2c21-408d-a397-fd86f7e77d06",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "68df0343-db1c-46ee-a142-8694d291827a"
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
                    "id": "4da6fb76-9f16-4fd9-baf9-3fe93dd93002",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "31df49f2-d793-462e-aca6-be5ac250f069",
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
                    "createdAt": "2024-10-10T15:05:42.123Z",
                    "updatedAt": "2024-10-10T15:05:42.123Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "4a5d069c-706e-497a-9a22-23a1ff870cc6",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "c8a21cdc-220f-45aa-ad42-506f0e3a0ae8",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "3eb0c16b-e0a6-4991-a65d-5b972b12c4da",
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
                    "id": "77cdca6a-51fd-42d2-bb1c-5e423f721fff",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a4758b6c-4a48-4ec7-8898-d1f91eec75d9",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "50c723e9-af8c-455e-a9c6-0dbd591b0258",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0f9bad06-3762-4797-9079-d7d190da55e5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "50c723e9-af8c-455e-a9c6-0dbd591b0258",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5096824c-bd72-488b-902e-e5768070e736",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a19a3726-642e-4b1f-a8e0-0d05ce62dcd4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "7fbd8d22-49a3-4c55-a80b-1876129eee86",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "659373cb-ab85-4d36-aed2-58789be66d23",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7fbd8d22-49a3-4c55-a80b-1876129eee86",
                        "name": "people"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b74e80b0-7132-469f-bbd9-6e6fc12f04f8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7d307698-eece-4e31-8c4c-7d5d596eb542",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "77add2d7-09c4-4648-b202-f7909fd11442",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8caf11d2-f8c7-41df-948b-10c6e702459c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "ef38e2d0-9369-4744-840d-85e5841f36dc",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "585ee60d-cc7d-4500-8db9-e38ab8f90a60",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "bed55285-cec4-4a78-ba3a-a70febd66dc6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "b9c2d94a-41dd-4a59-8266-76973d472a09",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "75f42dd7-0c3a-4658-98d2-7af163fbcf6a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b9c2d94a-41dd-4a59-8266-76973d472a09",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a0752532-9ed5-4ba1-8ee4-eb7393d36a62",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "395bfecf-e9ce-46d2-9612-3d8840ee3f59",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "8323137c-6b37-4ec2-9977-accefa773841",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2fcfb71-1f23-47b7-a818-27371a165214",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8323137c-6b37-4ec2-9977-accefa773841",
                        "name": "opportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "be13cda6-aff5-4003-8fe9-e936011b3325",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a679e0f1-1766-4814-ac8e-64b82329cdb9",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c41db169-bd37-442d-a8ce-61a60307587c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "9aa7c531-5fcc-4a24-a149-a28daf8d11a3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "09e066b4-d809-49c8-908b-51b8b8724a4c",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9b71c7ff-5d2e-43c4-a524-611e309e6f45",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "09e066b4-d809-49c8-908b-51b8b8724a4c",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b6b66a3c-6c39-4e93-b940-836aced4de12",
                        "name": "accountOwnerForCompanies"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "408a7fce-1980-48b2-9c0e-9e23b58b5e07",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "99a8cc42-5f5d-41f2-9d5a-44e18f8412e4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "408a7fce-1980-48b2-9c0e-9e23b58b5e07",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "67bfa361-4269-4494-b2eb-3a9f26f992fd",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "328a0398-9023-4f24-b4df-ba56f5efcc0e",
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
                    "createdAt": "2024-10-10T15:05:41.897Z",
                    "updatedAt": "2024-10-10T15:05:41.897Z",
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
                    "id": "134b368a-cf99-438e-8105-9150a2827fd4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3e2f75b9-76aa-436f-8d24-129798ca4090",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "134b368a-cf99-438e-8105-9150a2827fd4",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3f7749a5-7d4e-4b3c-b5ae-12b8ea631676",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1b548bb0-c4fc-4232-a18f-b7882b6a1ddf",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c9ce54d1-cb4a-4492-879f-be86056fcce5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1b548bb0-c4fc-4232-a18f-b7882b6a1ddf",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2f907f04-3122-4b7b-bd83-c192cacc4a83",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7d98e29b-96a1-4f6b-973e-dac0b3477f03",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e79f5c59-356b-473d-97f6-69fc4e075134",
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
                    "createdAt": "2024-10-10T15:05:42.009Z",
                    "updatedAt": "2024-10-10T15:05:42.009Z",
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
                    "id": "eafdfdda-7cda-4fe4-bcaa-be49232fbfd4",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e38b7482-42bb-43b3-a36f-9c7eec06d59e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "39d5f2b7-03ce-41e7-afe9-7710aeb766a2",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "eafdfdda-7cda-4fe4-bcaa-be49232fbfd4",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "24a17b5b-e5cd-43c9-bcd8-422a00b0ebf6",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6e131b8b-27b6-4b00-8a41-8e35ccca14ae",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dbcb6817-a87a-4d76-8b1c-eca83d525c5d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "68df0343-db1c-46ee-a142-8694d291827a",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5e0a25f0-fe8b-42f3-af2b-423766333ab2",
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
                    "createdAt": "2024-10-10T15:05:42.226Z",
                    "updatedAt": "2024-10-10T15:05:42.226Z",
                    "defaultValue": false,
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
            "id": "2590029a-05d7-4908-8b7a-a253967068a1",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "4fdcef64-197f-438c-8b92-a6712a80e747",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d0f42493-dfe8-43a9-9c2f-bb0f63759210",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "8115bdeb-f099-464f-b438-5ac80d23637a",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "c89083d6-f45d-4fd0-8149-9c3a9e71eb1f"
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
                    "id": "743142f7-9e4d-4f92-beae-7d7040233009",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a8ebb52f-95f7-4c65-bd68-b9d2372907c8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "be533c19-a031-4c6d-86cf-3e2fb2defb2f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c89083d6-f45d-4fd0-8149-9c3a9e71eb1f",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "1475304d-4734-4b66-96a8-ed7d84727fe6",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1aef1a4d-f090-4f5a-8e39-f7d21d465199",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "2590029a-05d7-4908-8b7a-a253967068a1",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1475304d-4734-4b66-96a8-ed7d84727fe6",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f2414140-86ea-4fa3-bc63-ca5dab9f9044",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4af78cad-69c5-4190-a23f-6db322f80f27",
                        "name": "auditLogs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "86e941ea-a43a-412c-8197-479adbb09a15",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ab8ea51d-bc10-426c-9e5c-65c09c09f5bd",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "4fdcef64-197f-438c-8b92-a6712a80e747",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "d6812840-4b41-46f8-a5c0-6ad697d00fe3",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0b88c2e2-68a1-488a-ae3c-32f1919ba8b8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "be183254-da94-4664-a8d4-b72a26ba115d",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "5e414096-d916-4d3f-9710-54a4932078a8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
            "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:42.702Z",
            "updatedAt": "2024-10-10T15:05:42.702Z",
            "labelIdentifierFieldMetadataId": null,
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "ee1a3903-9f40-4789-a61c-90716bce789d",
                    "createdAt": "2024-10-10T15:05:42.750Z",
                    "updatedAt": "2024-10-10T15:05:42.750Z",
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
                            "id": "b6b09e0f-38a7-4c1a-b80b-46e392accdd8",
                            "createdAt": "2024-10-10T15:05:42.750Z",
                            "updatedAt": "2024-10-10T15:05:42.750Z",
                            "order": 0,
                            "fieldMetadataId": "c2df610f-40a0-4c0f-9c24-dd3356f5f871"
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
                    "id": "4d64de07-68da-42c9-b169-d5adf91ae282",
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
                    "createdAt": "2024-10-10T15:05:42.718Z",
                    "updatedAt": "2024-10-10T15:05:42.718Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9a12826d-783a-4411-89ac-a2a2369e5eb2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4d64de07-68da-42c9-b169-d5adf91ae282",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "cb8c8d67-16c0-4a38-a919-b375845abf42",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "89fe6ca9-b01e-4f73-8fe2-f51ba3a67024",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "38556e40-979a-4c6a-9328-a99b1392d98f",
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
                    "createdAt": "2024-10-10T15:05:42.702Z",
                    "updatedAt": "2024-10-10T15:05:42.702Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c2df610f-40a0-4c0f-9c24-dd3356f5f871",
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
                    "createdAt": "2024-10-10T15:05:42.747Z",
                    "updatedAt": "2024-10-10T15:05:42.747Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "492bf0fb-85ee-4805-a41d-6ad94b1bd904",
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
                    "createdAt": "2024-10-10T15:05:42.702Z",
                    "updatedAt": "2024-10-10T15:05:42.702Z",
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
                    "id": "d4700cc4-14a1-4264-96c9-0d87ebeeb482",
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
                    "createdAt": "2024-10-10T15:05:42.702Z",
                    "updatedAt": "2024-10-10T15:05:42.702Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c2721d06-ae7f-40e4-b061-d96179f0be97",
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
                    "createdAt": "2024-10-10T15:05:42.722Z",
                    "updatedAt": "2024-10-10T15:05:42.722Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "07793950-4b19-4d72-afda-f1815ec8e5e4",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c2721d06-ae7f-40e4-b061-d96179f0be97",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "d00ff1e9-774a-4b08-87fb-03d37c24f174",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "01b00bde-0e1f-4e47-ad06-9df00dd1c7a3",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b3186db8-8ea1-49b6-8922-82e4bdc06eb9",
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
                    "createdAt": "2024-10-10T15:05:42.725Z",
                    "updatedAt": "2024-10-10T15:05:42.725Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bd9974b4-9210-4ef3-892d-4adc2d40feb6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b3186db8-8ea1-49b6-8922-82e4bdc06eb9",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "fd99213f-1b50-4d72-8708-75ba80097736",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a87c2280-8913-4e89-b6a3-4403b70087d4",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2951011a-6c7b-4a4c-bded-f212f70ca93a",
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
                    "createdAt": "2024-10-10T15:05:42.714Z",
                    "updatedAt": "2024-10-10T15:05:42.714Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0b9d9ac1-f853-4df1-be0e-1b2f6fce2d4f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2951011a-6c7b-4a4c-bded-f212f70ca93a",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "43fe0e45-b323-4b6e-ab98-1d9fe30c9af9",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9deff6cb-fd97-4d2a-9c5b-be2fd90d5d7e",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "baea02d1-1817-4df3-b9eb-c8020452f3e0",
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
                    "createdAt": "2024-10-10T15:05:42.709Z",
                    "updatedAt": "2024-10-10T15:05:42.709Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8ddd621-26f4-4fa8-b426-3f545094bd5f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "baea02d1-1817-4df3-b9eb-c8020452f3e0",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b6e22795-68e7-4d18-a242-545afea5a8a9",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7d14aef8-f63c-47cd-8ce7-29806518d6ca",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fd7a600a-93e7-4139-b944-4cd2022f07c6",
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
                    "createdAt": "2024-10-10T15:05:42.702Z",
                    "updatedAt": "2024-10-10T15:05:42.702Z",
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
                    "id": "1fb5fc79-28b2-419f-87cf-ecb498d7d3dd",
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
                    "createdAt": "2024-10-10T15:05:42.702Z",
                    "updatedAt": "2024-10-10T15:05:42.702Z",
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
                    "id": "f3e444fc-afa9-45d7-b885-5000c2fa2b7d",
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
                    "createdAt": "2024-10-10T15:05:42.731Z",
                    "updatedAt": "2024-10-10T15:05:42.731Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7df72299-c1f4-4575-98bf-24156cb3e5b8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "1e5ee6b2-67e5-4549-bebc-8d35bc6bc649",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f3e444fc-afa9-45d7-b885-5000c2fa2b7d",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "edfd2da3-26e4-4e84-b490-c0790848dc23",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4c42e3b9-26a9-4ce1-a37a-9606da0bc12a",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "22ea99a0-3835-4e6a-b3ef-af40ec618326",
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
                    "createdAt": "2024-10-10T15:05:42.702Z",
                    "updatedAt": "2024-10-10T15:05:42.702Z",
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
                    "id": "6ba199c2-44a2-4cee-b9f2-ee6d6686b6f8",
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
                    "createdAt": "2024-10-10T15:05:42.702Z",
                    "updatedAt": "2024-10-10T15:05:42.702Z",
                    "defaultValue": "now",
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
            "id": "149f1a0d-f528-48a3-a3f8-0203926d07f5",
            "dataSourceId": "d8a38ce6-6ac9-4c10-b55f-408386f86290",
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
            "createdAt": "2024-10-10T15:05:37.064Z",
            "updatedAt": "2024-10-10T15:05:37.064Z",
            "labelIdentifierFieldMetadataId": "0687870d-58fb-45ee-ad5f-9c35bea78a70",
            "imageIdentifierFieldMetadataId": null,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7e192f75-5a94-4914-a60a-58d324a76ae4",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "71fa278a-a8a3-4129-bdaf-8ee244ce5257",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "72a89c96-8301-46b5-b2ba-b05c418a9863"
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
                    "id": "90fc8a97-03c9-4bf3-8de0-7a9bc6417579",
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                            "id": "632e255a-abbf-466c-96e1-f9b9c160cfc0",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 1,
                            "fieldMetadataId": "045d4eed-8f9f-463d-9ee0-4b579c090121"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e7a0d7d5-0006-4795-b9e4-3ab822aa16e1",
                            "createdAt": "2024-10-10T15:05:37.064Z",
                            "updatedAt": "2024-10-10T15:05:37.064Z",
                            "order": 0,
                            "fieldMetadataId": "90e949eb-5d48-4a77-8496-71aa56184df7"
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
                    "id": "045d4eed-8f9f-463d-9ee0-4b579c090121",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "1dc48a6a-270b-466a-8e11-9efd02729791",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "daa269f7-c111-492e-88c8-1bfe82e3d637",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "149f1a0d-f528-48a3-a3f8-0203926d07f5",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1dc48a6a-270b-466a-8e11-9efd02729791",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "981fd8a9-37a2-4742-98c1-08509d995bd3",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2d337999-7468-4f6f-bce0-87679dcb5e2f",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a407c6e4-c9ea-4dd4-838a-230893118ab8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "0687870d-58fb-45ee-ad5f-9c35bea78a70",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "0b649b56-2018-4645-b6d1-3dbb44125b50",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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
                    "id": "5d68a9e6-9e85-4ae4-8601-43e685dcf90b",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c040d959-808f-4b7d-8844-ac87a45c0b04",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "149f1a0d-f528-48a3-a3f8-0203926d07f5",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5d68a9e6-9e85-4ae4-8601-43e685dcf90b",
                        "name": "calendarChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8cceadc4-de6b-4ecf-8324-82c6b4eec077",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7ec1ea5f-c98f-4569-91ef-8797294cf183",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "90e949eb-5d48-4a77-8496-71aa56184df7",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a4b46b44-3ff6-46cd-b354-2ae81e3298e8",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "72a89c96-8301-46b5-b2ba-b05c418a9863",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b7acd3f1-6921-4a7a-92a6-fbf48572bbc2",
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
                    "createdAt": "2024-10-10T15:05:37.064Z",
                    "updatedAt": "2024-10-10T15:05:37.064Z",
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