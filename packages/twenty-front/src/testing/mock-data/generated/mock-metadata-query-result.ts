import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

// This file is not designed to be manually edited.
// It's an extract from the dev seeded environment metadata call
// TODO: automate the generation of this file
// ⚠️ WARNING ⚠️: Be sure to activate the workflow feature flag (IsWorkflowEnabled) before updating that mock.
export const mockedStandardObjectMetadataQueryResult: ObjectMetadataItemsQuery =
  {
    objects: {
      "__typename": "ObjectConnection",
      "pageInfo": {
        "__typename": "PageInfo",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "YXJyYXljb25uZWN0aW9uOjA=",
        "endCursor": "YXJyYXljb25uZWN0aW9uOjM4"
      },
      "edges": [
        {
          "__typename": "objectEdge",
          "node": {
            "__typename": "object",
            "id": "ff7731cb-fa60-4dc6-b467-23e97f3affda",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "b6e355c4-b91b-43e6-983c-c1c20b0899ff",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "69d1eebc-c1ce-47a3-9156-f5d2a24f450f",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "9d1cc2b9-e87a-4136-840a-f6673575a14c",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "ff7f156b-573b-4fd1-b954-fde082d16853"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "2e7b0d55-0b27-4d4a-8a8b-9566a4cf504f",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "16b380aa-e427-4502-819c-48595d386496"
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
                    "id": "acbbcd2f-f989-44b8-9522-e3d2d58b4e51",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "f0321a75-260e-4895-a722-849f901c2437",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "16b380aa-e427-4502-819c-48595d386496"
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
                    "id": "03f82710-ad80-452d-8b3d-618f68277863",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6aa54c45-fba2-4b23-b9e1-04e89f6cb354",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c03f79a9-5161-4107-8ac2-aad5ffbe3ba4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e38da392-bce1-4c58-9dff-7257dc961463",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8d172a6c-3c1c-4c1b-8314-4390ad583483",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ff7731cb-fa60-4dc6-b467-23e97f3affda",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e38da392-bce1-4c58-9dff-7257dc961463",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4aa1f97c-da9f-44b7-96bf-46b96fea58cc",
                        "name": "comments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e94a62e6-0730-4a15-8581-396e0bc53d85",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f627b41a-3025-4626-9a8f-75ecc86dd918",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "ff7731cb-fa60-4dc6-b467-23e97f3affda",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e94a62e6-0730-4a15-8581-396e0bc53d85",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6de2ed4f-3d86-4b79-9c3b-58deffbb5546",
                        "name": "authoredComments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ff7f156b-573b-4fd1-b954-fde082d16853",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "16b380aa-e427-4502-819c-48595d386496",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "41aac7e1-8082-46eb-b280-0deeaf34650b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b6e355c4-b91b-43e6-983c-c1c20b0899ff",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "f53b9cf9-d2a5-401b-a0f2-3d560b0a5728",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "73ee8c8b-39c5-40a6-9d91-1c88e714d964",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "9dd62d76-f179-4228-8dff-eb25bc78540d",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "40aaeefd-8b6e-40bf-9a83-aad0f614379f",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "a6e6ec8e-6921-4baf-bc64-ce5e807cc191"
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
                    "id": "a6e6ec8e-6921-4baf-bc64-ce5e807cc191",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "73ee8c8b-39c5-40a6-9d91-1c88e714d964",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f48f5008-b406-426a-82dd-a486cbf72c17",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "ea9bbb0f-1499-49b7-84eb-3c9e12d6bac0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "033e7a2e-7bef-487c-bfc1-9282d8be8302",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "8c9e2c6a-a5b2-44c4-a891-cc5a0a8ddf08",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ee939d9-f4c6-4d14-b7c2-4a04ebc317a0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f53b9cf9-d2a5-401b-a0f2-3d560b0a5728",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8c9e2c6a-a5b2-44c4-a891-cc5a0a8ddf08",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "98375a53-4d80-41a3-9be6-2b89c0188bf0",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2eb6d8ca-7e09-4577-adb0-02991f9eb6f9",
                        "name": "messageChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "26d2806f-0642-4649-99f7-c3296de4d64e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "3c517d16-ded8-471e-bd27-5ba705673dcc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "a2244e55-854d-43b0-92eb-c6f1ce24e559",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "dcf69652-3142-4df1-9f1c-af58606e6b1b",
                        "color": "blue",
                        "label": "Subject",
                        "value": "SUBJECT",
                        "position": 1
                      },
                      {
                        "id": "b6da521f-ca5f-44b0-980f-329511f89821",
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
                    "id": "f7c22586-5680-48ae-9a2a-d2acc1fe9ad4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "efcc6782-a3ef-4a37-8928-a18c97af5180",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c3aebd90-f8df-420e-80c2-99548db202a2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "625adce3-7df8-4c44-a710-46a0846a33f4",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "892478bd-de46-4516-9d96-ae88457149bf",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "cba20446-e5ab-4159-a7b2-c6acc39d6560",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "f4917c48-a4da-40f5-a2cb-e768900e1fa4",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "7deb7af8-6f84-44f0-bd8c-b27f2a110e8c",
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
                    "id": "c8dea08c-15d9-4a12-968a-a1d58bfbb06f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "c2cfa970-a5db-4ae8-a9e0-1f2f0cd304b5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e1f2f8f9-82a6-4214-9e6a-8bdbe40d30c6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd15198d-64c0-41f3-9f21-49ddfbab52f5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62c54094-a17b-4826-969c-257bff5ed8b3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fe5ed048-a28b-4c81-9cf6-b8f01b0fb8ea",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "f53b9cf9-d2a5-401b-a0f2-3d560b0a5728",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "62c54094-a17b-4826-969c-257bff5ed8b3",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "99902373-0ccf-4c20-b5b3-f3f2904432b7",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2c3a640e-0eb2-4b23-bd54-c1e48237d834",
                        "name": "messageChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3165d0c3-d34e-4097-b15c-56898231a529",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "a2800580-5122-4500-9a92-fb5c3ebe3310",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'email'",
                    "options": [
                      {
                        "id": "73d0474c-cbc9-4e94-98ef-85d38b751244",
                        "color": "green",
                        "label": "Email",
                        "value": "email",
                        "position": 0
                      },
                      {
                        "id": "df2f43a5-5666-478e-af75-dc57e0ca8fde",
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
                    "id": "644d3e67-dd0f-45b9-afcf-8f695b63a35e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'FULL_MESSAGE_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "33d202db-9c5d-4396-98ac-e52cc1b0f95f",
                        "color": "blue",
                        "label": "Full messages list fetch pending",
                        "value": "FULL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "0332ea24-6aa3-4030-96e2-6cb08324be98",
                        "color": "blue",
                        "label": "Partial messages list fetch pending",
                        "value": "PARTIAL_MESSAGE_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "3c9faa49-deff-4052-921d-e08524d66357",
                        "color": "orange",
                        "label": "Messages list fetch ongoing",
                        "value": "MESSAGE_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "4368541c-50eb-4758-9d75-8358d70d63dc",
                        "color": "blue",
                        "label": "Messages import pending",
                        "value": "MESSAGES_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "5efe9a9b-610a-448e-a93a-aba7899edc94",
                        "color": "orange",
                        "label": "Messages import ongoing",
                        "value": "MESSAGES_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "f77b0d3c-4732-45c1-8451-3e4274307d51",
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
                    "id": "9f630738-1fe3-4217-905e-2ddf3134361b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'SENT'",
                    "options": [
                      {
                        "id": "78752858-6556-4120-911a-3607b6c2afdf",
                        "color": "green",
                        "label": "Sent and Received",
                        "value": "SENT_AND_RECEIVED",
                        "position": 0
                      },
                      {
                        "id": "231a8d24-a577-40f1-b75a-0db2d350e59a",
                        "color": "blue",
                        "label": "Sent",
                        "value": "SENT",
                        "position": 1
                      },
                      {
                        "id": "2606ef5a-d8b0-42a5-a191-3f1ba599c5d0",
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
                    "id": "7193f036-a54d-41fd-8cd2-85a06bac925d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "f0c8e9d4-79eb-4616-83b7-98a2b29d8027",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "852f3946-38a1-4fdf-b6f7-31a860dd10cc",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
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
                    "id": "9dc7a988-485f-48e3-a6e6-ef3e5b611006",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "72e00443-8a88-46e8-8d0e-27eeadee5955",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "852f3946-38a1-4fdf-b6f7-31a860dd10cc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d3f953b9-c3b8-48d6-98fa-a2440507f470",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ea996dcc-f9f6-4d47-b7bd-a7e1cc6991cf",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "b5a39916-b01f-4472-a539-cf51c1c131e5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "97ef6dd1-f0d5-46bf-b36b-a56defc1c682",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "e63536c1-73a7-4a91-aefe-3cf2a7f53b97",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "e898603e-f823-484e-9a30-01f6d79e6457",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "0a39c42f-5aae-4807-8113-e23fe02e2316",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "42ab31cb-c45a-4822-bbc5-7821515fcfdd",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "7337c750-17e5-496b-97e1-8c6d96e9f8e6"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "47a3641d-d640-4eaa-b857-267eaf06bd64",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "c28bab8a-6018-48ee-93a0-a77be2c2da08"
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
                    "id": "1dc3a122-7681-48ea-bf70-8abbe4243eb8",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "40fbe99d-f09f-47f0-8700-f9be56236036",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "ca17dc1d-e931-46a8-810a-9a6d7779f87d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "92a14dbc-65c5-4543-95ae-723ca3d54b04",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "c28bab8a-6018-48ee-93a0-a77be2c2da08"
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
                    "id": "ad3085fc-8dd8-4bcc-b6f6-a25eadc54ed6",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "6f303e75-beab-4321-bf14-613205ff058e",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "c455936e-b3a4-4511-8a90-682ab55933fd"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "c9afc7e5-177a-4149-b19d-d416f8aa8893",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "c28bab8a-6018-48ee-93a0-a77be2c2da08"
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
                    "id": "c28bab8a-6018-48ee-93a0-a77be2c2da08",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "e898603e-f823-484e-9a30-01f6d79e6457",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2bcd80f3-f582-481d-acb9-6d53e919b8c5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'from'",
                    "options": [
                      {
                        "id": "e5904c05-9f7b-4c64-a91c-d96ea8b80222",
                        "color": "green",
                        "label": "From",
                        "value": "from",
                        "position": 0
                      },
                      {
                        "id": "981c42e1-15d2-42ec-8a1d-244ed9a6f644",
                        "color": "blue",
                        "label": "To",
                        "value": "to",
                        "position": 1
                      },
                      {
                        "id": "74e4bdef-b43e-43f0-b81f-0870add6d4d7",
                        "color": "orange",
                        "label": "Cc",
                        "value": "cc",
                        "position": 2
                      },
                      {
                        "id": "b4679fae-b280-401c-9eb8-c100116095e0",
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
                    "id": "971b3e1c-ea12-4319-9e47-6edb5142f53e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8442962-a066-438a-8d4e-896f2b3b387c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e63536c1-73a7-4a91-aefe-3cf2a7f53b97",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "971b3e1c-ea12-4319-9e47-6edb5142f53e",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f5930f68-a26b-46ca-a081-4b0fd6cccb70",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c455936e-b3a4-4511-8a90-682ab55933fd",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ca17dc1d-e931-46a8-810a-9a6d7779f87d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7beb20c3-b282-44cf-8448-e9283a0caa99",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7337c750-17e5-496b-97e1-8c6d96e9f8e6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e4112e2b-3e32-41f7-a5dc-759ed4680036",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8925a530-0852-4359-9e9a-4e4338742786",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f136bd0d-56c3-4375-9546-0e20620d853a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f2454b8d-1c93-4300-867e-2373acbae3f0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e63536c1-73a7-4a91-aefe-3cf2a7f53b97",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f136bd0d-56c3-4375-9546-0e20620d853a",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11af9fae-3a59-46c1-a7cf-e4835c3e0b95",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c5e9e852-f06b-4f6a-8780-e505ababeefb",
                        "name": "messageParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c4ff3483-a551-4280-a487-20b0b7e5d999",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "3f9d3aab-086f-4f3c-bc26-e0b205c702c5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "333fafe7-948e-41ea-bbc4-0395bc196218",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e63536c1-73a7-4a91-aefe-3cf2a7f53b97",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3f9d3aab-086f-4f3c-bc26-e0b205c702c5",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "412c5a1f-c266-48a9-8b3c-79497fbaf0a0",
                        "name": "messageParticipants"
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
            "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "a2e76302-4aab-40a0-a873-ea476782a592",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "0dab70d1-bac8-4414-839c-4fb76ed4c493",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "5d2c3b8d-5b9a-40e4-9388-578d1671332e",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "62708f97-ba55-4b48-a3e6-c76111e18f60"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "fe993c2d-0fda-40dc-ad7c-e437eb078115",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "061b9be9-4d78-4948-abcd-83520d6ea50b"
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
                    "id": "ddafb854-6d1a-4065-ab1c-86074126ae49",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "70b6da92-15d4-4b90-a09b-e1de935d22e6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "84e615c9-4345-4689-ac79-2adbb273b809",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "70b6da92-15d4-4b90-a09b-e1de935d22e6",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7cd6f1bc-9511-4302-ac30-5714d202fecc",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "79615225-efc5-483a-8a76-0de461eac9db",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6478a161-783d-4e53-857d-435d33757985",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "79615225-efc5-483a-8a76-0de461eac9db",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "aeb12371-fbd7-4e19-a98c-35fbabde6325",
                        "name": "versions"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a2e76302-4aab-40a0-a873-ea476782a592",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "97c6bcf4-3b3e-4211-bdeb-5b4d2c64b201",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "de5801c6-6f10-49a0-9c54-f4961182f425",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'DRAFT'",
                    "options": [
                      {
                        "id": "b518f2a4-8339-496c-976e-78a86fc3491d",
                        "color": "yellow",
                        "label": "Draft",
                        "value": "DRAFT",
                        "position": 0
                      },
                      {
                        "id": "635d8bba-3dfe-4a0e-9431-c6b69459cf25",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 1
                      },
                      {
                        "id": "24c23a45-36e5-4e17-8e33-db9369f20bba",
                        "color": "red",
                        "label": "Deactivated",
                        "value": "DEACTIVATED",
                        "position": 2
                      },
                      {
                        "id": "abca275d-aaf8-49d9-9d2d-5c89d4eae241",
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
                    "id": "f554cf5d-b56a-46a5-b115-10c1c83439d0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "81506bd9-617c-4dba-a97a-68d90ed70291",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f554cf5d-b56a-46a5-b115-10c1c83439d0",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0a0c5648-e817-4135-aea0-57fded8fac2f",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "061b9be9-4d78-4948-abcd-83520d6ea50b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5aa91a0b-78ae-4bb2-a3a2-0d5fbd83a7e2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62708f97-ba55-4b48-a3e6-c76111e18f60",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "270cbed1-2c78-475f-af59-65603dec6e61",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e8c8b38a-5a35-4ecf-8969-6f8bc1435c0e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8e4cd20f-fbef-4e26-96b3-8eb1997abba3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e8c8b38a-5a35-4ecf-8969-6f8bc1435c0e",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "89e8f09f-ff9c-4590-9429-f5fad404a12c",
                        "name": "workflowVersion"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "145c7f12-ad25-4635-89ad-72dff2f77e96",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3e76022b-acc3-434b-ac31-1eb61a6e6808",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "3a44b550-d9d0-4d96-892b-bfa704eb8e2f",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f03c28b3-312e-43ef-8ef4-155525728178",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "6c1c2dfb-8462-40d3-9ab1-94aa4b93a9cc",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "99daf16e-60ae-4039-8418-96bd827a5792"
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
                    "id": "009dae67-56f1-4c60-9413-da68a027c47a",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "a44f6904-54ed-434f-ab58-1abdbe2f587e",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "dd7303d6-4443-4257-b294-6843b8a2ca60",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "bf1e36d7-3edc-4fac-a7de-11265873e25d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0431f744-df0f-4993-8dac-510c9502cef1",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "d7b77a12-fcc9-4725-9c4f-c00e5b06e64f"
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
                    "id": "19492077-3b36-4d17-8a03-6d42994a34fc",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "1b7abe81-99df-4baa-b3c0-37d534a5547a",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "c141af23-2f91-4940-b45c-f8a19607724c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "40e60b4e-6ef2-4b41-a788-935ecf422810",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "bf1e36d7-3edc-4fac-a7de-11265873e25d"
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
                    "id": "d3711a3c-c15c-485d-9d8d-a3b96ff528f4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "99daf16e-60ae-4039-8418-96bd827a5792",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d7b77a12-fcc9-4725-9c4f-c00e5b06e64f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e66836a8-eed6-4c9e-b38a-f4dfe5294137",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3a44b550-d9d0-4d96-892b-bfa704eb8e2f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "7f517d89-5888-49eb-be73-dc4fb8fc4cc2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c8794e86-7d97-40d1-bd53-9fa552684949",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7f517d89-5888-49eb-be73-dc4fb8fc4cc2",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "464870b2-9896-4777-9c0e-82702418e1fc",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ff6873c8-e6c3-4e59-8fcd-9362e5fe8a7f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bde52054-dcad-4b4b-a41d-06f57e1e8e14",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ff6873c8-e6c3-4e59-8fcd-9362e5fe8a7f",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "87161f1a-047f-4e22-9a32-79ff665dad20",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3c1758b5-032d-4d8a-b2fd-683c55032281",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4aa915eb-426e-416e-8f16-b67e8a7e87ed",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d2cf984-9523-4fb7-b4ae-7bbd4a23217e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4aa915eb-426e-416e-8f16-b67e8a7e87ed",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "13a3aac3-cd3a-4202-809b-1d147dd228f2",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3375d9ad-c50e-45c2-be3f-e958ee4acb7a",
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
                    "createdAt": "2024-10-25T08:35:30.069Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4eed66a0-c791-44e2-9f2c-f4d3a7ea6b44",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3375d9ad-c50e-45c2-be3f-e958ee4acb7a",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "997c0a41-86ca-425f-ba7c-76f1f9a3aa35",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "baec6361-2982-4563-acac-beee96d19959",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "03e9e810-9096-42be-b402-70599430ed1d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "baec6361-2982-4563-acac-beee96d19959",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d5d8f73e-92a7-475f-b399-54ac1a6487b7",
                        "name": "noteTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c141af23-2f91-4940-b45c-f8a19607724c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "435ae195-7823-4f70-8cca-5f9fe7db664f",
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
                    "createdAt": "2024-10-25T08:35:30.069Z",
                    "updatedAt": "2024-10-25T08:35:30.069Z",
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
                    "id": "bf1e36d7-3edc-4fac-a7de-11265873e25d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "c03c9de7-5750-4516-8636-78a47152abbe",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "1203d97b-204c-443b-a488-76b30b5ddbf3",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "d2b6f14a-cd57-4333-b7d3-04c92d96aa8d",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "name": "IDX_627d4437c96f22d5d46cc9a85bb",
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
                    "id": "b2986b4f-13b7-4edc-abc9-93ba80377da2",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "b292db1f-67e4-44ce-93fa-05f117ae9250",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "11a5e1ba-2561-4b43-92a8-e4c31f938c48"
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
                    "id": "ffb5dd33-df1b-4a34-b53f-3d810bd8053e",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "9e11bca0-58a2-4264-91bb-0783e61347a9",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "187e7fbd-593c-425d-998c-9fcfe4539a15"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b88c314d-61b8-4f32-9965-b02b10fa4c8f",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "11a5e1ba-2561-4b43-92a8-e4c31f938c48"
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
                    "id": "09cf940a-80e7-46b9-855e-dec53974bba7",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "0c7c64da-39e7-4acb-a6de-6ca479244f06",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "e4fd703c-e7b0-4b0b-847c-8fdda08146bd"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4da9e3b3-e83b-4965-82f1-26cc9f43fb84",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "11a5e1ba-2561-4b43-92a8-e4c31f938c48"
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
                    "id": "29c17815-b3dd-447a-9954-8d84e59e114a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1203d97b-204c-443b-a488-76b30b5ddbf3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "55fa116a-3d4f-4a4a-8fc0-222dea75c928",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2aa3b525-7738-4f40-95d1-9cf095818e78",
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
                    "createdAt": "2024-10-25T08:35:30.071Z",
                    "updatedAt": "2024-10-25T08:35:30.071Z",
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
                    "id": "e4fd703c-e7b0-4b0b-847c-8fdda08146bd",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "11a5e1ba-2561-4b43-92a8-e4c31f938c48",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "187e7fbd-593c-425d-998c-9fcfe4539a15",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3f2750e1-a563-41b1-9d45-197088e1309a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "43e511c4-fd00-449f-ac45-7b0e1653398b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "76baa28a-e2a2-4202-94a9-c50c30253822",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "43e511c4-fd00-449f-ac45-7b0e1653398b",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "09141d8b-5c95-41f5-b4b5-48769033761e",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "37ffec38-b674-47dd-9c49-a3367742980b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2490480-856f-4e89-b76a-aa7a73458294",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "37ffec38-b674-47dd-9c49-a3367742980b",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "74053420-b1b1-411f-b36d-702b194cbc3b",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b167dd77-1466-4085-878a-650af03ba364",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b7a37da1-258c-431b-afb8-0b97c936b530",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b167dd77-1466-4085-878a-650af03ba364",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "50a0a13e-ec01-424d-bdae-9aeea5f2e5fe",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a8d45a6c-541b-4b27-89f2-590633e7255d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "477105ae-7b13-421f-966a-dd0b2bd468e0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a251da21-7cae-4060-a455-ca38af4b9fd2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "477105ae-7b13-421f-966a-dd0b2bd468e0",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4e22d58d-edbf-41bb-9bbe-c96e5fd97ff4",
                        "name": "taskTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bee1f5fc-e6a7-49ab-9294-b3100d7e79ae",
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
                    "createdAt": "2024-10-25T08:35:30.072Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1c99d621-5ed8-4eb1-b7ea-c5f01c510358",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bee1f5fc-e6a7-49ab-9294-b3100d7e79ae",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "defdbcde-42eb-4aa9-83b2-e40119762a59",
                        "name": "taskTargets"
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
            "id": "bad634b4-fc51-4dd1-b4d5-d9e9cd44a8e0",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "579e8e20-2657-4dc5-8588-1fd16f903d4a",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "bb9906af-449e-4432-b057-b7eaad17369c",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "36bcd8b3-5dd1-45a0-b54e-27c0fae308a6",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "b8b67d4d-056d-426f-bbfc-6d33f4e5323b"
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
                    "id": "cc7123b8-5e60-4700-afbc-7f17ebb5a672",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'NOT'",
                    "options": [
                      {
                        "id": "fc43dcd6-e29c-4c76-9b21-1b43c3fed0f2",
                        "color": "blue",
                        "label": "AND",
                        "value": "AND",
                        "position": 0
                      },
                      {
                        "id": "bd71bc0e-3630-45b5-a30f-c745b51679de",
                        "color": "green",
                        "label": "OR",
                        "value": "OR",
                        "position": 1
                      },
                      {
                        "id": "b4c2bdb3-3bbd-4dbd-b15c-74d6e86035d4",
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
                    "id": "198f2d66-3cd6-4ae6-9d41-7911bc79d37f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "93ec087d-4be0-43fa-ae49-5fe656cf9c49",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b8b67d4d-056d-426f-bbfc-6d33f4e5323b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "443e71fd-92ac-443c-bd5c-28cb3f9b7c12",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44c53857-9a65-413b-b5c9-94f5ca075d9d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b8c23d54-5586-4b46-95a6-ecb60573414f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "bad634b4-fc51-4dd1-b4d5-d9e9cd44a8e0",
                        "nameSingular": "viewFilterGroup",
                        "namePlural": "viewFilterGroups"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "44c53857-9a65-413b-b5c9-94f5ca075d9d",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6b5b6803-be7d-4345-aa35-85174cf7a1f8",
                        "name": "viewFilterGroups"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e091801b-d2a3-47b9-acd7-0651e7d678ad",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9cf60ef9-f89d-4a7c-84aa-55e1ba5bdd63",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "579e8e20-2657-4dc5-8588-1fd16f903d4a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "5a19318f-c331-4269-950c-0fbce75c21f7",
            "imageIdentifierFieldMetadataId": "89c5c1fa-c2d9-498c-8c6b-fa0d42dffabe",
            "shortcut": "P",
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "99d9d466-1c63-462a-ae74-6268d168750b",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "357c13a0-9ea9-41e8-b809-404a8b204ff6",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "aa805d2b-4f92-4760-a26c-a86e2c0b7a79"
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
                    "id": "11983e08-5b3c-47b2-a92f-2f5ebdac0cd2",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "fec61cf2-1174-414f-9b3a-366e85a558ed",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "c1f29b72-c431-412f-87ed-9d9d06173975",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "4a3d7c7b-a6c0-43c5-b8e4-3600943c7d0e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3372af68-17e9-4371-b8fc-104c8497469a",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "41f2d26d-beab-4a3c-85da-a4b4a56b01e9"
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
                    "id": "5a19318f-c331-4269-950c-0fbce75c21f7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "aa805d2b-4f92-4760-a26c-a86e2c0b7a79",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e73731d8-1d1b-4d1c-a3ac-90cc23512bf2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bb6fd19f-5ed1-4a73-9888-b292b8c7b9df",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e73731d8-1d1b-4d1c-a3ac-90cc23512bf2",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "df4a48ae-af45-48c7-a40a-6ce0f9777856",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "41f2d26d-beab-4a3c-85da-a4b4a56b01e9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "26be86c4-5168-46b9-9676-832df80f526a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "300e424c-d18f-4dda-8897-0f85b81efdf7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2a6b451-1ed7-4865-97c2-0ce6a16712ff",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "300e424c-d18f-4dda-8897-0f85b81efdf7",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e0cba842-5298-48e2-b056-740c603f5aac",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "335de868-cf9a-4211-9263-5206ed42e63b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "09141d8b-5c95-41f5-b4b5-48769033761e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "76baa28a-e2a2-4202-94a9-c50c30253822",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "09141d8b-5c95-41f5-b4b5-48769033761e",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "43e511c4-fd00-449f-ac45-7b0e1653398b",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ed262c30-c680-4cc6-8204-f04d2fd57c2d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1c89e312-03e7-4f7f-874e-4b2144c6d471",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "98e54261-7203-4d33-b6b7-a23122f650b9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1c89e312-03e7-4f7f-874e-4b2144c6d471",
                        "name": "pointOfContactForOpportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8b898db8-e1b3-4c5b-9460-07d85137dee8",
                        "name": "pointOfContact"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4386edaa-396d-4924-b0af-a9d70d586e72",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bf7ab05e-31c0-4691-8b21-7e3671a691b1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "164b37aa-68fa-4f45-bf2f-f60474b275b0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fc6dee88-5f08-40a0-a4e7-01ec54e0daa1",
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
                    "createdAt": "2024-10-25T08:35:29.806Z",
                    "updatedAt": "2024-10-25T08:35:29.806Z",
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
                    "id": "e74f1e9a-5146-4130-a075-cdc8ba83e068",
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
                    "createdAt": "2024-10-25T08:35:29.893Z",
                    "updatedAt": "2024-10-25T08:35:29.893Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "e01aa0ab-76fe-4254-8ea4-b20bea9108cb",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "dbb571b0-336c-46e5-81dd-322d04bf726a",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "b68c7593-e110-4eee-bbdd-39219dd8f292",
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
                    "id": "89c5c1fa-c2d9-498c-8c6b-fa0d42dffabe",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4a3d7c7b-a6c0-43c5-b8e4-3600943c7d0e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "3e321e5f-afc0-4f02-a001-34bdfa9a288e",
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
                    "createdAt": "2024-10-25T08:35:29.722Z",
                    "updatedAt": "2024-10-25T08:35:29.722Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c0ae8c5e-7b2f-4502-bae4-760826a78280",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c264f9b5-3ee7-43fe-91ab-1a85c6425a6d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c0ae8c5e-7b2f-4502-bae4-760826a78280",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "10e3d598-1608-4df4-9e6a-9f2b25019fc0",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2efb0755-d979-4a10-afd0-31e04d5b5395",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02ebf399-2ac6-4748-ac05-61efaa84eefa",
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
                    "createdAt": "2024-10-25T08:35:29.976Z",
                    "updatedAt": "2024-10-25T08:35:29.976Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "6d351868-0cc7-4e89-906d-d1f818ed48dc",
                        "label": "1",
                        "value": "RATING_1",
                        "position": 0
                      },
                      {
                        "id": "3042f8ed-6b41-4943-a885-c7986ff24c86",
                        "label": "2",
                        "value": "RATING_2",
                        "position": 1
                      },
                      {
                        "id": "abcfdc29-a47a-4d60-a18a-cf64c287f6a9",
                        "label": "3",
                        "value": "RATING_3",
                        "position": 2
                      },
                      {
                        "id": "a2f6f846-1a93-4b69-a0ee-0aeca38c28ec",
                        "label": "4",
                        "value": "RATING_4",
                        "position": 3
                      },
                      {
                        "id": "f7fd7aa6-da3f-4ebd-ae0c-9234a6ae5b0f",
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
                    "id": "f5930f68-a26b-46ca-a081-4b0fd6cccb70",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f8442962-a066-438a-8d4e-896f2b3b387c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f5930f68-a26b-46ca-a081-4b0fd6cccb70",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e63536c1-73a7-4a91-aefe-3cf2a7f53b97",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "971b3e1c-ea12-4319-9e47-6edb5142f53e",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "771dba06-8d68-41fb-be08-cee7d1a0ed3a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "89ad904c-90ca-44ce-8bba-3c82924ef43d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "771dba06-8d68-41fb-be08-cee7d1a0ed3a",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "59135c7c-1277-4574-aff4-c347ead92bec",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "53545872-92cc-403f-a0b7-d37a7fe3c5ac",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "9bb0f863-a82b-4d9f-86f2-8c6f29d56f11",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "94ff81e1-7a34-49df-8920-2188048c9344",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "be308fc0-2bd7-485c-b9e4-17df295588ed",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "94ff81e1-7a34-49df-8920-2188048c9344",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "002fa7f0-02e1-4e3a-850b-185c69dfb5f1",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4651ed7c-b879-4830-904b-49380ec3546b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "642d94e2-3918-47f4-a751-6009c9bc96b8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "464870b2-9896-4777-9c0e-82702418e1fc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c8794e86-7d97-40d1-bd53-9fa552684949",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "464870b2-9896-4777-9c0e-82702418e1fc",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7f517d89-5888-49eb-be73-dc4fb8fc4cc2",
                        "name": "person"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2a0e7d89-329a-45be-bb01-14ef6d9fe59d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "e289faeb-73d6-45e2-b2bc-d25d31076c01",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "83dce009-c89d-4671-96b1-fd5ca394a6e5",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e289faeb-73d6-45e2-b2bc-d25d31076c01",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9dc8279c-077e-436e-ad8b-1f0cdb0663d2",
                        "name": "people"
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
            "id": "a23300d6-01d2-44a0-b47c-54c3eac250a3",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "686a4d4e-fc20-49e1-b4af-290916551469",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
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
                    "id": "ea853876-b34d-4012-b932-842cad011372",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "401ae6cb-7cd4-49f8-9385-0e4284470f99",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5014fe19-d734-483e-8179-bc97622e5550",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "a23300d6-01d2-44a0-b47c-54c3eac250a3",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "401ae6cb-7cd4-49f8-9385-0e4284470f99",
                        "name": "messages"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11af9fae-3a59-46c1-a7cf-e4835c3e0b95",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "095fbc40-f6b7-4283-b47b-d0e82ce020af",
                        "name": "messageThread"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b9d91576-4d4f-4991-8e89-b5ccf42c6f64",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "686a4d4e-fc20-49e1-b4af-290916551469",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "56bd1e13-0c52-460a-91c4-291db4eccd06",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "9f44b3a1-3ac9-4c1d-9c96-a17eba5b102a",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "4af2ee12-19e7-4d15-b241-3b7e02400f01",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a5bdf9f0-a82d-41fa-8735-594f6d379ae1",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "ed7dc674-0faa-4da5-a17b-6fa88b4cc148",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "d9841f79-89f7-4a29-9628-0a44476f7671"
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
                    "id": "4af2ee12-19e7-4d15-b241-3b7e02400f01",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "286c3627-96bf-42e9-b080-1b32590e07d4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5778d7f5-19f3-4d18-950d-ae698c6fc3d3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "ead3f6c3-c4dc-4f9f-9389-a1ccd5da8296",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "fe0597b7-af13-464c-a7fb-cbc4acf388c5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9357220f-6971-4d60-929e-15fd0cb9b335",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8cee7dcb-fdaf-4147-a011-3f27822727ac",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9f44b3a1-3ac9-4c1d-9c96-a17eba5b102a",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9357220f-6971-4d60-929e-15fd0cb9b335",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "43306616-1674-4b2e-a4ce-01f30fdff4b4",
                        "name": "eventListeners"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d9841f79-89f7-4a29-9628-0a44476f7671",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "9cd73861-380c-40aa-be74-f3fe70268224",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "5f38cf38-26fc-462a-a8e7-ec66ba703691",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "6056e2c8-5132-4e46-be0d-0d01c1b559f7",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "b3886306-6c09-4098-b495-a328cf7fef7b",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "6ed10a09-6ef4-4c7d-9fd5-26b3ee96f33d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "85af21b3-7ff5-45eb-a73d-a208aa8b4bdd",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "08c2c3cf-3a2f-40a0-9e55-d4bce737f6b5"
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
                    "id": "50f9cc2e-151d-46c2-aaca-2e90672c0add",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "7575a41a-3288-4121-bac3-3766f75a1f58",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "6ed10a09-6ef4-4c7d-9fd5-26b3ee96f33d"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4bf84ea0-ff49-465a-a61d-d6ebccbbc825",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "abccf941-6629-41d9-8c5f-c9cc6aef3c1b"
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
                    "id": "72752fe0-eb8a-400c-9de0-8ab35fcc45b6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "f8829dbb-c263-4993-8b5e-169af7f5bc90",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9d788663-dba5-4b40-8b8c-35e4af8d26ef",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f8829dbb-c263-4993-8b5e-169af7f5bc90",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "18e89205-4a21-47fa-97b3-687190769cca",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1a006803-643f-492b-b211-6e84e9c212b7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d80903d0-16b1-4870-8c01-deacf0f7eaaf",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b185d812-01c3-4e84-b7c8-7d876c4bcab6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d71280bc-cd5a-4126-a471-ef600b8e7f4b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b185d812-01c3-4e84-b7c8-7d876c4bcab6",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "05d08a19-1884-4110-96a7-a7ef58531fd8",
                        "name": "authoredActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6ed10a09-6ef4-4c7d-9fd5-26b3ee96f33d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "4aa1f97c-da9f-44b7-96bf-46b96fea58cc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8d172a6c-3c1c-4c1b-8314-4390ad583483",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4aa1f97c-da9f-44b7-96bf-46b96fea58cc",
                        "name": "comments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ff7731cb-fa60-4dc6-b467-23e97f3affda",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e38da392-bce1-4c58-9dff-7257dc961463",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4bd82a11-55c5-4911-8494-47a23417efcd",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5f38cf38-26fc-462a-a8e7-ec66ba703691",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fb835c2b-6891-455c-bac9-359c22414082",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8b5b8ebb-519d-4076-8d88-513dc167d762",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fb835c2b-6891-455c-bac9-359c22414082",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5396b5d2-5d9d-4771-84ea-7c1662a97736",
                        "name": "activity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d3d08ebd-0010-49a6-9c90-0b3b759101b8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "834c7d2f-513b-44e4-aa07-4de528eb0ded",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d3d08ebd-0010-49a6-9c90-0b3b759101b8",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "afe18832-9042-4b3c-8420-746ab764f962",
                        "name": "assignedActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08c2c3cf-3a2f-40a0-9e55-d4bce737f6b5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2782e113-3340-4971-9d75-a0e8ac5807d6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "abccf941-6629-41d9-8c5f-c9cc6aef3c1b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d2968bbf-eb50-4ad1-8b67-3d2ea459d0b3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1720b6c3-34e1-4237-80be-ac96f3219960",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7a66de70-1c88-492a-8cd9-abb21217367a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "9b030f2c-8f12-4406-842f-10a534626804",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:30.054Z",
            "updatedAt": "2024-10-25T13:59:18.399Z",
            "labelIdentifierFieldMetadataId": null,
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "737471d8-dd5e-4fd9-ae39-dd4c3d123cfc",
                    "createdAt": "2024-10-25T08:35:30.081Z",
                    "updatedAt": "2024-10-25T08:35:30.081Z",
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
                    "id": "2c0857d6-518d-4e7e-aeef-1899d2c5096e",
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
                    "createdAt": "2024-10-25T08:35:30.059Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c8f16e19-47a7-42e9-bcea-c79942111627",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2c0857d6-518d-4e7e-aeef-1899d2c5096e",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2e804570-f77a-45ca-b519-bdd4394063ba",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "800c6192-6ad8-4c93-87bf-c7509b8f5e91",
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
                    "createdAt": "2024-10-25T08:35:30.054Z",
                    "updatedAt": "2024-10-25T08:35:30.054Z",
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
                    "id": "997c0a41-86ca-425f-ba7c-76f1f9a3aa35",
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
                    "createdAt": "2024-10-25T08:35:30.069Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4eed66a0-c791-44e2-9f2c-f4d3a7ea6b44",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "997c0a41-86ca-425f-ba7c-76f1f9a3aa35",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3375d9ad-c50e-45c2-be3f-e958ee4acb7a",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "445f049d-6882-4b4b-945c-2dbc0a2add5f",
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
                    "createdAt": "2024-10-25T08:35:30.054Z",
                    "updatedAt": "2024-10-25T08:35:30.054Z",
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
                    "id": "2ce6b5d9-cce4-41f6-810a-c01fd4d4035a",
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
                    "createdAt": "2024-10-25T08:35:30.079Z",
                    "updatedAt": "2024-10-25T08:35:30.079Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d6f9ee5f-827a-4e7f-8830-ace349426d5b",
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
                    "createdAt": "2024-10-25T08:35:30.067Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ba50bfa4-5f5b-42b0-a019-483abc09350a",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d6f9ee5f-827a-4e7f-8830-ace349426d5b",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ca3de53e-5cea-46a9-a504-ebc655528feb",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a524a6c6-28d3-4045-917f-b9209fe26ae4",
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
                    "createdAt": "2024-10-25T08:35:30.062Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "104df9fe-c18a-44ba-8ad0-aaef7c810413",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a524a6c6-28d3-4045-917f-b9209fe26ae4",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5687e420-ad42-4b49-ac41-fa245aebed95",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "defdbcde-42eb-4aa9-83b2-e40119762a59",
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
                    "createdAt": "2024-10-25T08:35:30.072Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1c99d621-5ed8-4eb1-b7ea-c5f01c510358",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "defdbcde-42eb-4aa9-83b2-e40119762a59",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bee1f5fc-e6a7-49ab-9294-b3100d7e79ae",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b6ed5515-4299-4b7c-a264-823432dbe2ee",
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
                    "createdAt": "2024-10-25T08:35:30.064Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4e7410ab-7a52-49e6-90f8-501db2613b98",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b6ed5515-4299-4b7c-a264-823432dbe2ee",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3df0067f-97d8-4dc3-b24b-efbd697ecb66",
                        "name": "rocket"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3ad819cb-cfdf-441e-bc26-072d65ac0f2a",
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
                    "createdAt": "2024-10-25T08:35:30.054Z",
                    "updatedAt": "2024-10-25T08:35:30.054Z",
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
                    "id": "8a3919d7-756c-4221-9996-e805a33cfbdd",
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
                    "createdAt": "2024-10-25T08:35:30.054Z",
                    "updatedAt": "2024-10-25T08:35:30.054Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5bad95ce-ff9a-43bf-92ea-bcc4c06e1da0",
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
                    "createdAt": "2024-10-25T08:35:30.054Z",
                    "updatedAt": "2024-10-25T08:35:30.054Z",
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
                    "id": "d14ae530-6505-4010-a849-f2004e37fe04",
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
                    "createdAt": "2024-10-25T08:35:30.054Z",
                    "updatedAt": "2024-10-25T08:35:30.054Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3e1fa288-6d6c-4df5-acb8-0680dd02d73c",
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
                    "createdAt": "2024-10-25T08:35:30.054Z",
                    "updatedAt": "2024-10-25T08:35:30.054Z",
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
            "id": "99902373-0ccf-4c20-b5b3-f3f2904432b7",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "3108196c-5430-4bdd-9071-72eae366ada1",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "818c6b83-cd22-41c0-a0ba-c82dc620f92b",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "29989b68-22a4-4b57-8c65-cf60998b4a63",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "c1c497dc-5a00-46ba-8902-229e560b2737"
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
                    "id": "039f55ff-fec7-4163-a705-ab7e054dc344",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ea04c65f-0597-4b09-b087-036bbf0206cc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d6d9d791-dcb3-4259-afd7-0b6ec412f108",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a04a82a1-94c8-4481-b236-69fa66777591",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3108196c-5430-4bdd-9071-72eae366ada1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "487fcab6-150f-413b-b93a-cf3afcfd5359",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "09334d88-66a0-4765-b513-84370b16dcc0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "99902373-0ccf-4c20-b5b3-f3f2904432b7",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "487fcab6-150f-413b-b93a-cf3afcfd5359",
                        "name": "calendarChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0abd6b9f-8776-42b6-89fd-2c8516ac10ad",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "756a9de6-6432-4ad5-8060-fde5bd0567b0",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b246af19-f74c-45ea-81ac-5c1cfd9fdfee",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2355de32-f135-4fe6-a418-3f52d9c317b8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8167b2b8-c85f-4b5e-bb29-9cca63811a67",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "efcc0595-2509-4830-93d3-5dc7e1afb817",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "12c923b7-561f-4992-a008-72cea5ffd022",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "99902373-0ccf-4c20-b5b3-f3f2904432b7",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "efcc0595-2509-4830-93d3-5dc7e1afb817",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ca1a7c89-b4ef-4973-a8d3-295692d2f6ce",
                        "name": "connectedAccounts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5275adb3-14f1-410b-91ae-934dd8a8f6a3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "2c3a640e-0eb2-4b23-bd54-c1e48237d834",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fe5ed048-a28b-4c81-9cf6-b8f01b0fb8ea",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "99902373-0ccf-4c20-b5b3-f3f2904432b7",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2c3a640e-0eb2-4b23-bd54-c1e48237d834",
                        "name": "messageChannels"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f53b9cf9-d2a5-401b-a0f2-3d560b0a5728",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "62c54094-a17b-4826-969c-257bff5ed8b3",
                        "name": "connectedAccount"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "125f6a81-6356-455b-bc75-904017297d12",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d93c5d86-d6c2-41da-be1f-b185318c57f3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c1c497dc-5a00-46ba-8902-229e560b2737",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "ab15e969-0387-4086-9e8e-cc334343bdf6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "98375a53-4d80-41a3-9be6-2b89c0188bf0",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "db9e2652-9bfb-4590-9972-d49287d71908",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "485575f8-3c4a-442c-a7a7-5985ffd36aeb",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "825efb18-781d-4557-98dc-b6b835120048",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0985f7ad-b59d-4593-bde3-0ce535e4ff39"
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
                    "id": "2aee59ee-359d-4830-b09b-c1be20e654cb",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "5798e3ae-f120-4718-b7e4-f7c86ba6b02c",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0985f7ad-b59d-4593-bde3-0ce535e4ff39"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "0ec61740-be82-4f4c-a7fb-a4e3ea0a79e9",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "f04fb501-fed1-493a-b003-b5807c0b8e06"
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
                    "id": "ea3953bd-5c61-4604-8d45-454740d7c995",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bb4f216e-7b89-4d3e-8d6a-eb3e41b6f6e0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "443d2673-2f3c-48f1-9d36-00ddbb2ecbdf",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2eb6d8ca-7e09-4577-adb0-02991f9eb6f9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5ee939d9-f4c6-4d14-b7c2-4a04ebc317a0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "98375a53-4d80-41a3-9be6-2b89c0188bf0",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2eb6d8ca-7e09-4577-adb0-02991f9eb6f9",
                        "name": "messageChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "f53b9cf9-d2a5-401b-a0f2-3d560b0a5728",
                        "nameSingular": "messageChannel",
                        "namePlural": "messageChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8c9e2c6a-a5b2-44c4-a891-cc5a0a8ddf08",
                        "name": "messageChannelMessageAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62b58c7d-9bf9-4066-a81e-1ee48a0dd822",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0985f7ad-b59d-4593-bde3-0ce535e4ff39",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "b5b65a6b-724d-4f89-bb49-9403b2215d00",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'INCOMING'",
                    "options": [
                      {
                        "id": "35a3f5d1-4cb3-4f13-8a0e-609e5cfe62c8",
                        "color": "green",
                        "label": "Incoming",
                        "value": "INCOMING",
                        "position": 0
                      },
                      {
                        "id": "2778e34e-6318-452e-9fd3-344ee027ad14",
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
                    "id": "a4d9f947-72e0-4fcc-96b3-7252ed723bb0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db9e2652-9bfb-4590-9972-d49287d71908",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "f04fb501-fed1-493a-b003-b5807c0b8e06",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5945b9b7-2978-4ece-8544-0d55ce83b655",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "44177e10-49ed-409d-af7c-c306f310f5c1",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "98375a53-4d80-41a3-9be6-2b89c0188bf0",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5945b9b7-2978-4ece-8544-0d55ce83b655",
                        "name": "message"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "11af9fae-3a59-46c1-a7cf-e4835c3e0b95",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "61a3b5a6-2389-483c-98e3-8103bdefc0cb",
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
            "id": "95f76267-60f2-4349-9cde-693d1d7e82c5",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "420ae3dc-b6f8-48d8-82cf-e45e1ac675f0",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4a5e8893-688a-4a24-8410-2e21d2323153",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "dc4ca17a-9506-4f80-83af-6921fb4529b6",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "b0c352d2-ebf6-4e34-ad3e-568ae9103164"
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
                    "id": "c3eb9841-57ed-4715-b279-5c3385c0af1e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a756af5c-e773-4b8d-958a-f447072ac1f1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "02ceaf72-1ebc-41a7-a3a5-cb6b2a8a5d72",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "95f76267-60f2-4349-9cde-693d1d7e82c5",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a756af5c-e773-4b8d-958a-f447072ac1f1",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "08762fad-8f7c-41dd-8f79-b5e8814fe96e",
                        "name": "viewSorts"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "420ae3dc-b6f8-48d8-82cf-e45e1ac675f0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "b0c352d2-ebf6-4e34-ad3e-568ae9103164",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "e576a571-cc42-490c-bf17-cd5b5e00ad31",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "956946df-36cb-421e-9e55-5d5849b6ba5b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "24885279-6e34-4107-85c6-eb711c304f97",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a135073b-23dc-4658-ab84-9f76b7243a58",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "592509aa-5c06-4f1a-8e31-4f55f544a891",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "18d06a87-a940-429f-b486-74e6913b691c",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "2b82a303-99fb-496f-b71f-d75f997673a5",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "75c7b1cf-d78c-465e-847c-2f15044113d3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f8b802bb-f5eb-41e0-ba6f-2eabf38ea687",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "dcd7eb61-2346-41e5-aa21-1816f6f5afbe"
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
                    "id": "ac5ada8c-b79a-4663-93db-21d843595854",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "bb7ea8e3-1732-4e0c-8926-de0e2ecc7bb8",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "dcd7eb61-2346-41e5-aa21-1816f6f5afbe"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "5c148fe4-4caa-4186-a802-479be6a75369",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "d975a681-7aea-408a-874c-3ef5a8579c61"
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
                    "id": "84d03403-45d1-4441-b4fb-b8dd05196b37",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "149742a3-9975-4edf-8bc8-5d0d2f3c8ea6",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "dcd7eb61-2346-41e5-aa21-1816f6f5afbe"
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
                    "id": "5d7d2e84-11d2-4d93-a39a-4bde57cf101c",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "name": "IDX_0698fed0e67005b7051b5d353b6",
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
                    "id": "4a954b37-ed5d-4194-9c91-7362ab9e5394",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "8062b93d-76d6-4ba8-acb7-b1cebb3feb83",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "e7ebd4e7-74ec-4e22-a51a-116453ed0ed5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "d6274733-4a37-4ee6-8460-2d16454b4b98",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "dcd7eb61-2346-41e5-aa21-1816f6f5afbe"
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
                    "id": "2d12cfb9-f9e6-4164-b6b1-fc437a0fcb76",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "28e2627f-caa0-4c72-8ce4-64b0e27f471e",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "c7ae758b-a256-415c-b3f4-656effbefd93",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "dcd7eb61-2346-41e5-aa21-1816f6f5afbe"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b2a6232a-dfde-48e7-801e-bbd7fd9bc06b",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "bdd7d6a9-0882-4ad8-a7ea-0ea1b9c6d686"
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
                    "id": "ee62e2d5-231a-4476-ac4c-c978b592b077",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "13bac917-5f30-49da-bbc9-5865b5478391",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "65b3b428-3053-4b08-b2ab-4520bec8927d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e5097d7c-4a9c-4619-8c8e-2ad9594aa1fe",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "65b3b428-3053-4b08-b2ab-4520bec8927d",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "614f4fb4-8fa5-458f-a6f4-e6e057d61b61",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ca3de53e-5cea-46a9-a504-ebc655528feb",
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
                    "createdAt": "2024-10-25T08:35:30.067Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ba50bfa4-5f5b-42b0-a019-483abc09350a",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ca3de53e-5cea-46a9-a504-ebc655528feb",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d6f9ee5f-827a-4e7f-8830-ace349426d5b",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5396b5d2-5d9d-4771-84ea-7c1662a97736",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8b5b8ebb-519d-4076-8d88-513dc167d762",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5396b5d2-5d9d-4771-84ea-7c1662a97736",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fb835c2b-6891-455c-bac9-359c22414082",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c00cbb58-c70f-4032-b843-35e4e67268f3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b7ec3f80-19b5-4ecf-80c1-e10b25018c01",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ebc2500f-0c02-44fa-9182-1e9817a7ba4b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b7ec3f80-19b5-4ecf-80c1-e10b25018c01",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "039b8951-ca77-4d53-8d9e-faa008af1af9",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3b989330-af0d-47a2-bc6b-d13cc436505b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "592509aa-5c06-4f1a-8e31-4f55f544a891",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e69e1a85-583e-44c9-bfaa-0eff4a9ac002",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "74dcf03e-8dc1-4ce5-812e-6310b9a43be2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6b0797e3-aba6-4625-a5ff-9a356377cf99",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "74dcf03e-8dc1-4ce5-812e-6310b9a43be2",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5d0076e7-4ff9-42ac-b8ed-225de5270892",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e7ebd4e7-74ec-4e22-a51a-116453ed0ed5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0fc3c470-9d47-4186-9916-2d224297dd36",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9dd509aa-e4a4-4003-8402-976f54c289b8",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0fc3c470-9d47-4186-9916-2d224297dd36",
                        "name": "author"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "af3b63df-4189-4f9c-8ac6-a384d649d0ca",
                        "name": "authoredAttachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "75c7b1cf-d78c-465e-847c-2f15044113d3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f7d0c0eb-f6ec-4bb4-b1b0-31f105a65921",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dcd7eb61-2346-41e5-aa21-1816f6f5afbe",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "df4a48ae-af45-48c7-a40a-6ce0f9777856",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bb6fd19f-5ed1-4a73-9888-b292b8c7b9df",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "df4a48ae-af45-48c7-a40a-6ce0f9777856",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e73731d8-1d1b-4d1c-a3ac-90cc23512bf2",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bdd7d6a9-0882-4ad8-a7ea-0ea1b9c6d686",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8663cfef-aec1-4ff1-8055-0cacdda8b6d0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c0cf0990-a697-40f0-a996-8acf8d8727eb",
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
                    "createdAt": "2024-10-25T08:35:30.066Z",
                    "updatedAt": "2024-10-25T08:35:30.066Z",
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
                    "id": "d975a681-7aea-408a-874c-3ef5a8579c61",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7292a054-5f13-4641-a4bd-7970c4505746",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dc552cf5-7c66-4093-accf-e3c579d921f9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7292a054-5f13-4641-a4bd-7970c4505746",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9f158c61-b15b-405e-b097-7aafc9b89f73",
                        "name": "attachments"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3038604f-0cc6-4fd6-bb75-77e33eb8f2e7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "ac8e2917-8497-437a-bc8b-c5f28dd3cdc3",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "N",
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "c64dba67-b1b3-4cd0-af09-f6b30075c6f4",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "eb6f2d37-6c1b-4620-96d3-5ed13cef4b28",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "c75ca7ac-c5d2-4669-9bc7-070e094f3698",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a720e753-e5bd-49aa-8018-d1275629c88d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "d5d8f73e-92a7-475f-b399-54ac1a6487b7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "03e9e810-9096-42be-b402-70599430ed1d",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d5d8f73e-92a7-475f-b399-54ac1a6487b7",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "baec6361-2982-4563-acac-beee96d19959",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ac8e2917-8497-437a-bc8b-c5f28dd3cdc3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "751d6fb1-bbfe-4292-8778-b4bca0e989ce",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "394cadf7-77a6-4ba8-ae96-301197a846be",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "039b8951-ca77-4d53-8d9e-faa008af1af9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "ebc2500f-0c02-44fa-9182-1e9817a7ba4b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "039b8951-ca77-4d53-8d9e-faa008af1af9",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b7ec3f80-19b5-4ecf-80c1-e10b25018c01",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "db7902cb-d3aa-42f7-8679-5005e0a4ad23",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3be4c328-e5b1-407c-ad36-19de8a690cda",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ac19222a-c7de-4bc0-9139-46d673f3d564",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f9c72811-7612-4073-86ab-5f1f8fd3566a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "aa518a1b-ebb9-4c6e-8988-aa10268a5df2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f9c72811-7612-4073-86ab-5f1f8fd3566a",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fd7de215-f826-4214-8c64-39b9da01ef4a",
                        "name": "note"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9e5e9e86-e4bb-48c6-ab16-845497e232f2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "609d803f-c037-4760-85c4-d8e66c37db33",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9e5e9e86-e4bb-48c6-ab16-845497e232f2",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6827c0c4-1432-415d-b459-2831c0224c93",
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
            "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "9706d218-283d-402c-94be-15b1faa02fc3",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "C",
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "df37a5a7-f3cc-4c20-8475-3d828be3780c",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "0c07181c-5c17-4308-937b-6e3613024bfa",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "10fe397c-e15a-44d0-8198-6586f2c96ef7",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "5b24fd6d-e885-460f-84b3-5da532cbe064"
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
                    "id": "b5aec360-a49f-43e3-8dec-f5f852741cfe",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2b4d7db-73fa-449e-ba57-3cfd36b1c803",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b5aec360-a49f-43e3-8dec-f5f852741cfe",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ac2850c1-336b-4c8d-9450-a47c73d14b9d",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "38887819-d52c-42d6-9d9f-a832d183d939",
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
                    "createdAt": "2024-10-25T08:35:29.382Z",
                    "updatedAt": "2024-10-25T08:35:29.382Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7835c62f-d3e4-4610-9afe-d9bd924d13fb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "61e62307-3b29-4994-a46d-a56ba642ca8b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7835c62f-d3e4-4610-9afe-d9bd924d13fb",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "704c4d51-1e83-42c9-866b-49d2d99f32d6",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3828bc5d-f5d3-4df2-aa06-4213de5c97bd",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "614f4fb4-8fa5-458f-a6f4-e6e057d61b61",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e5097d7c-4a9c-4619-8c8e-2ad9594aa1fe",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "614f4fb4-8fa5-458f-a6f4-e6e057d61b61",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "65b3b428-3053-4b08-b2ab-4520bec8927d",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "aee2cb7c-b2d9-4cd8-9167-d0214288acf6",
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
                    "createdAt": "2024-10-25T08:35:29.555Z",
                    "updatedAt": "2024-10-25T08:35:29.555Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "6b4e8951-b503-49e2-863c-e1f5b1512260",
                        "color": "green",
                        "label": "On-Site",
                        "value": "ON_SITE",
                        "position": 0
                      },
                      {
                        "id": "c588c5c6-9449-48f4-ba71-c53f5bb91520",
                        "color": "turquoise",
                        "label": "Hybrid",
                        "value": "HYBRID",
                        "position": 1
                      },
                      {
                        "id": "cfc6d339-9f13-4619-9a6d-df4fd970b68a",
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
                    "id": "773190c3-e478-4026-9f1d-cd6b8ee8dcd5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "d0a38c5a-7b8f-47c5-8bb9-3d6dc6003a62",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "6f2668c6-3863-4735-bd5a-83efb2846d53",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "5b24fd6d-e885-460f-84b3-5da532cbe064",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "98fa9df2-8a8f-4cae-bc1b-e24e751b599e",
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
                    "createdAt": "2024-10-25T08:35:29.639Z",
                    "updatedAt": "2024-10-25T08:35:29.639Z",
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
                    "id": "62290645-fd54-452a-ab67-760798a12138",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8b1e66a1-a23d-448f-80c7-8dc1b0add441",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "becb0f23-2085-4b6b-a152-4520fb44ac63",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "74053420-b1b1-411f-b36d-702b194cbc3b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2490480-856f-4e89-b76a-aa7a73458294",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "74053420-b1b1-411f-b36d-702b194cbc3b",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "37ffec38-b674-47dd-9c49-a3367742980b",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "110e16cc-ee5a-43bc-bf18-be4cc06060bb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "9dc8279c-077e-436e-ad8b-1f0cdb0663d2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "83dce009-c89d-4671-96b1-fd5ca394a6e5",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9dc8279c-077e-436e-ad8b-1f0cdb0663d2",
                        "name": "people"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e289faeb-73d6-45e2-b2bc-d25d31076c01",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b197d090-1304-4e56-b67f-f5508a000427",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "640c5230-6676-48cc-b713-0e121ce352e9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b197d090-1304-4e56-b67f-f5508a000427",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b995e0e8-27e1-4c09-a637-81d500630cae",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a72ca253-4846-4c32-880f-6ec2391cc327",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "2bb00440-32f4-42c6-937b-7034c04bb595",
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
                    "createdAt": "2024-10-25T08:35:29.470Z",
                    "updatedAt": "2024-10-25T08:35:29.470Z",
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
                    "id": "a339ae61-9cf9-4104-a313-e02850da80d5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "9706d218-283d-402c-94be-15b1faa02fc3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "87161f1a-047f-4e22-9a32-79ff665dad20",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bde52054-dcad-4b4b-a41d-06f57e1e8e14",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "87161f1a-047f-4e22-9a32-79ff665dad20",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ff6873c8-e6c3-4e59-8fcd-9362e5fe8a7f",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b0fa1b9d-fa4b-40ad-bb45-3c64e1fdd153",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f9030af8-c62d-4d2c-9806-0350db09b1c7",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b0fa1b9d-fa4b-40ad-bb45-3c64e1fdd153",
                        "name": "opportunities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3ae85bad-ca23-4ee4-b03d-28a63cd58ffb",
                        "name": "company"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "64cc48a1-f8b5-4cc5-b328-5e3be890eafe",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a22f49d5-61b0-4c82-97ce-2cfc23af0c04",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "82012969-6188-407d-894f-8311d43c8753",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2992374f-9952-4a15-9d06-5ae3b174c131",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "82012969-6188-407d-894f-8311d43c8753",
                        "name": "accountOwner"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5eb83245-8b66-42fd-93e5-616576bfbf40",
                        "name": "accountOwnerForCompanies"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4236f473-775a-4123-bcf8-d23fb25755f8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4acc2490-f00b-4901-8c25-f2cf8d85196b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "7e9e679e-d976-4e50-a762-db9bafe83a7a",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "59ad7585-b034-450e-bdd3-78c124a7dc10",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "5b0f809f-4945-40ed-9dd3-c0306c4cceab",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "d1385a95-6933-4e03-8853-a0dfec6d08a3",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "dd782c15-acd6-4cd5-bd1b-3638d0523f89"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3e6b92f3-aca2-4062-9f62-35af14ae68ca",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "e75168a5-a1f6-406c-8250-5cf75c8a811b"
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
                    "id": "87b1896f-c8b5-4b5c-9143-bde5e9ad4fe9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "457fd7b7-f938-4405-a285-e5386d98ea97",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6962d5b8-d6a5-453c-a17d-978fb371d4ca",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1c1390af-859d-4e30-8e30-fa98be40590e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7f008a85-430c-439d-ac57-4481c5ad4e92",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7e9e679e-d976-4e50-a762-db9bafe83a7a",
                        "nameSingular": "viewGroup",
                        "namePlural": "viewGroups"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1c1390af-859d-4e30-8e30-fa98be40590e",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "8f5132da-58ce-456a-9a24-a2747f48f92d",
                        "name": "viewGroups"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e75168a5-a1f6-406c-8250-5cf75c8a811b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "97dd1640-1956-4278-a254-ec35ca7e6420",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "89e93cfd-d6cb-40b1-be3d-b7cf6b6aa131",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "be87dc22-6453-49cf-a8bb-9f95c626e6a3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "dd782c15-acd6-4cd5-bd1b-3638d0523f89",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "59ad7585-b034-450e-bdd3-78c124a7dc10",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "ee96433f-5035-4a4e-aeda-de2fa7800114",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "06a7ab08-903d-4603-92a2-024b903d84e1",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "4f2cd70a-e0ef-42e7-81a5-e8c5c1add646",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "654b8380-c3b3-4701-8a35-db030377c707"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3c07503a-bf25-47b9-875f-c19453564248",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "92f6f586-e596-4d58-990b-0d9db49480d8"
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
                    "id": "3a9f369c-f340-42e2-acba-44bcb0670f43",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "name": "IDX_899f0157b7ab84de320daec7041",
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
                    "id": "d01c1483-1678-4af0-84d0-163ee4d57140",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "83a1228f-ca12-46f8-8100-57f0ac36f180",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "cf027794-761a-4607-ae37-78399d76a792"
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
                    "id": "3d8c83d4-54fb-439d-9aad-f7dee098fc47",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "name": "IDX_224c121e7e3114e53f42b5774cb",
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
                    "id": "cf027794-761a-4607-ae37-78399d76a792",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "92f6f586-e596-4d58-990b-0d9db49480d8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "002fa7f0-02e1-4e3a-850b-185c69dfb5f1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "be308fc0-2bd7-485c-b9e4-17df295588ed",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "002fa7f0-02e1-4e3a-850b-185c69dfb5f1",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "94ff81e1-7a34-49df-8920-2188048c9344",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d0a204a9-08d2-4473-80e3-61e444ea9070",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e85307b4-14a1-449f-94e2-5162ed7079c3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d0a204a9-08d2-4473-80e3-61e444ea9070",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "467389e7-7409-4525-af90-0bed05945f61",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ee96433f-5035-4a4e-aeda-de2fa7800114",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "d73a6e83-e4d7-4ab4-93e0-4c7370797ad0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "36590d8f-3fe1-4cef-a6de-c3e6ed0926ef",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5687e420-ad42-4b49-ac41-fa245aebed95",
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
                    "createdAt": "2024-10-25T08:35:30.062Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "104df9fe-c18a-44ba-8ad0-aaef7c810413",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5687e420-ad42-4b49-ac41-fa245aebed95",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a524a6c6-28d3-4045-917f-b9209fe26ae4",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "18e89205-4a21-47fa-97b3-687190769cca",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9d788663-dba5-4b40-8b8c-35e4af8d26ef",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "18e89205-4a21-47fa-97b3-687190769cca",
                        "name": "activity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f8829dbb-c263-4993-8b5e-169af7f5bc90",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cb68df7f-5f43-4343-b44f-28c5a8421106",
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
                    "createdAt": "2024-10-25T08:35:30.061Z",
                    "updatedAt": "2024-10-25T08:35:30.061Z",
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
                    "id": "b995e0e8-27e1-4c09-a637-81d500630cae",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "640c5230-6676-48cc-b713-0e121ce352e9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b995e0e8-27e1-4c09-a637-81d500630cae",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b197d090-1304-4e56-b67f-f5508a000427",
                        "name": "activityTargets"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "654b8380-c3b3-4701-8a35-db030377c707",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "da91fa8f-7d7a-48fb-886a-3df547d42712",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b665fe08-d1fe-44d1-93ce-b9d344dabf1f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "6a939b03-6738-4767-8d60-868f024bf497",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "7fcbd0a7-b5a0-487e-837b-8857ab97a236",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f8032f54-3113-48ef-9850-11c28315f31d",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "674514e8-12b0-4e4d-aeaf-862663cc5712",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "78f0a2fe-55c9-4d85-8758-08acdbabaef6"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "4a69d619-befb-42f8-ae74-34c3932d1930",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "40da2e22-327e-426b-bc01-0d0242b7db76"
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
                    "id": "3261121b-ab8e-46ad-8d3f-c2c4fccad2c3",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "9dad990d-1fe3-4e21-8ec4-47d2d7a172a6",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "02eac09e-47ec-44e7-be62-27602c4edeb5"
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
                    "id": "9ad974fa-ffef-42fc-8d14-d13b03f73055",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'NOT_STARTED'",
                    "options": [
                      {
                        "id": "27c3cee8-962e-4a1c-937b-7481b178e688",
                        "color": "grey",
                        "label": "Not started",
                        "value": "NOT_STARTED",
                        "position": 0
                      },
                      {
                        "id": "ef8fa1c9-3ebe-4974-9f19-30441c61c09c",
                        "color": "yellow",
                        "label": "Running",
                        "value": "RUNNING",
                        "position": 1
                      },
                      {
                        "id": "b067b547-074c-437d-ab42-e5bf0b959f24",
                        "color": "green",
                        "label": "Completed",
                        "value": "COMPLETED",
                        "position": 2
                      },
                      {
                        "id": "b1434b09-7984-4db4-847f-43d79badd3a5",
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
                    "id": "9d37ba0b-4c05-4d3d-97fd-80b587c9ebfd",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "662625b1-9684-47f7-aafe-d38e6a78f790",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9d37ba0b-4c05-4d3d-97fd-80b587c9ebfd",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9f8eb7f1-e93c-4a1c-bb9f-93fa93d975af",
                        "name": "workflowRun"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "40da2e22-327e-426b-bc01-0d0242b7db76",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7fcbd0a7-b5a0-487e-837b-8857ab97a236",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44d1965d-cd48-4933-93c4-a81b16d9bce4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "7cd6f1bc-9511-4302-ac30-5714d202fecc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "84e615c9-4345-4689-ac79-2adbb273b809",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7cd6f1bc-9511-4302-ac30-5714d202fecc",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "70b6da92-15d4-4b90-a09b-e1de935d22e6",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "62decf92-b9fb-4f2c-ab8b-1f5d63fadd53",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "02eac09e-47ec-44e7-be62-27602c4edeb5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6acc22f1-614b-4c83-9b7d-a5fa74aa8b42",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c4f0c4be-93f7-4de2-b00d-c207963316aa",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "78f0a2fe-55c9-4d85-8758-08acdbabaef6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "5aba96ef-ce9e-43d4-9426-881795a6b1ad",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "25851367-93e8-4b66-8f59-99a774fd01c4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "90f4563c-1b5e-4916-a4f2-291f0f993066",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bbc505f1-b9e9-4730-98d8-e1dd70b52887",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "90f4563c-1b5e-4916-a4f2-291f0f993066",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fbc478cf-d6e3-42dc-a808-e45007261cff",
                        "name": "workflowRun"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ffa3da8f-c5e1-4494-a291-f78bef68e725",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "736af1af-1685-4427-9b9d-3321568f68ac",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "49946488-5ddc-4e37-a5af-6083f2718605",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "736af1af-1685-4427-9b9d-3321568f68ac",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2c1d849e-370d-4a89-9fe0-7c951febc820",
                        "name": "runs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6c93719d-5063-4776-a4aa-e7237565bb3f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "17641dc6-d495-40ea-9c2d-cf6769dad48a",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "O",
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7dafeb76-5740-4cad-9bfc-08f6ce74fbdf",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "0f8a2afe-779d-4689-b33b-2216e6f6568f",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "82978a8d-6b45-439a-9b5e-9d97704e3df3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b5f02082-c764-43ab-a584-509e946c980d",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "4388f2d4-c61b-49c8-ad8c-584d27a8c461"
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
                    "id": "261e1c7b-814f-4c6a-87fe-0036be3db292",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "6d622500-fe6b-4c91-97aa-ce635537f817",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "70ee3d8e-edd8-4ccc-bb1b-34d81aee590f"
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
                    "id": "f411fdaa-6364-461a-99bb-1170ebd817fb",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "1785fe94-0d2e-46cd-a75e-9fe2daf0a499",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "30ba6896-9b96-4382-a62b-39f1aefc44d6"
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
                    "id": "8a354671-ca73-4278-b83d-f0c5838472ce",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "7adcfdd6-bbdd-44f9-8599-c9a2cb2f0a36",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "82978a8d-6b45-439a-9b5e-9d97704e3df3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "3b8ec181-a0ec-440e-9164-5a45e203c2e2",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "e59fe3cb-5e6a-4328-870e-2a2c8883ae12"
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
                    "id": "70ee3d8e-edd8-4ccc-bb1b-34d81aee590f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'NEW'",
                    "options": [
                      {
                        "id": "c341dcee-eb23-4516-ae3b-6d2543c32986",
                        "color": "red",
                        "label": "New",
                        "value": "NEW",
                        "position": 0
                      },
                      {
                        "id": "99b282a6-00d2-421f-916b-b9a966d9862a",
                        "color": "purple",
                        "label": "Screening",
                        "value": "SCREENING",
                        "position": 1
                      },
                      {
                        "id": "3ff40ada-0223-4cb7-9833-ebb8c20faea0",
                        "color": "sky",
                        "label": "Meeting",
                        "value": "MEETING",
                        "position": 2
                      },
                      {
                        "id": "b8c230fd-4674-4e06-826e-14704df642a2",
                        "color": "turquoise",
                        "label": "Proposal",
                        "value": "PROPOSAL",
                        "position": 3
                      },
                      {
                        "id": "9f454d20-3981-4afc-b044-056099564f9f",
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
                    "id": "e59fe3cb-5e6a-4328-870e-2a2c8883ae12",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "17641dc6-d495-40ea-9c2d-cf6769dad48a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f0f471cb-3507-4604-84cc-365fb67aa4e2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "18f0094e-836a-425c-ada4-314b8fd763d2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f0f471cb-3507-4604-84cc-365fb67aa4e2",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6b5df713-0048-4f13-8f01-eb6f1b1c224f",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e5a59550-bc8e-4798-b370-899537427988",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "467389e7-7409-4525-af90-0bed05945f61",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "e85307b4-14a1-449f-94e2-5162ed7079c3",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "467389e7-7409-4525-af90-0bed05945f61",
                        "name": "activityTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7e236393-5c01-48f9-99c9-7c5d4ddfa8b5",
                        "nameSingular": "activityTarget",
                        "namePlural": "activityTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d0a204a9-08d2-4473-80e3-61e444ea9070",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "30ba6896-9b96-4382-a62b-39f1aefc44d6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "697192b5-4963-47e9-ae2a-cf7459584f6b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8fba144a-5ebe-4e87-81fd-c470f22b0839",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "9f158c61-b15b-405e-b097-7aafc9b89f73",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "dc552cf5-7c66-4093-accf-e3c579d921f9",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9f158c61-b15b-405e-b097-7aafc9b89f73",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7292a054-5f13-4641-a4bd-7970c4505746",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8b898db8-e1b3-4c5b-9460-07d85137dee8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "98e54261-7203-4d33-b6b7-a23122f650b9",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8b898db8-e1b3-4c5b-9460-07d85137dee8",
                        "name": "pointOfContact"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1c89e312-03e7-4f7f-874e-4b2144c6d471",
                        "name": "pointOfContactForOpportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "900bee1f-d689-4765-a198-7231c48f1473",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0be9f720-1ad0-4c36-90d6-d1be907ea532",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "900bee1f-d689-4765-a198-7231c48f1473",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "613900da-3f74-4f7c-a985-d56f9050bcc1",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "13a3aac3-cd3a-4202-809b-1d147dd228f2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3d2cf984-9523-4fb7-b4ae-7bbd4a23217e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "13a3aac3-cd3a-4202-809b-1d147dd228f2",
                        "name": "noteTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e0d03b44-21d8-48f8-b7b2-d37f872aac0f",
                        "nameSingular": "noteTarget",
                        "namePlural": "noteTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4aa915eb-426e-416e-8f16-b67e8a7e87ed",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b4c27625-e0e5-4aa9-a7cf-3cfbde9dae33",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "82978a8d-6b45-439a-9b5e-9d97704e3df3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "3ae85bad-ca23-4ee4-b03d-28a63cd58ffb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f9030af8-c62d-4d2c-9806-0350db09b1c7",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3ae85bad-ca23-4ee4-b03d-28a63cd58ffb",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b0fa1b9d-fa4b-40ad-bb45-3c64e1fdd153",
                        "name": "opportunities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "50a0a13e-ec01-424d-bdae-9aeea5f2e5fe",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b7a37da1-258c-431b-afb8-0b97c936b530",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "50a0a13e-ec01-424d-bdae-9aeea5f2e5fe",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b167dd77-1466-4085-878a-650af03ba364",
                        "name": "opportunity"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bbd983d8-f836-458f-b6de-64363ea5429a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4388f2d4-c61b-49c8-ad8c-584d27a8c461",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f5b1053f-f08c-455f-81f5-16fc827dc046",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "a7916247-f93a-42e2-9d4e-e3b712cfc4be",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "27339f3a-6be0-4db4-8ce1-593efb04895e",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
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
                    "id": "cbb33845-0258-4dc1-9b92-94fdab04de43",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b79c57fe-1cbb-4149-bbfb-e4a6ebc8fb94",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "cbb33845-0258-4dc1-9b92-94fdab04de43",
                        "name": "viewFields"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0a6d2e88-766c-41c0-a441-a4bc6af512bb",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a445cf13-521f-4bee-af9a-23956c79e938",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0f70c9a2-acd9-4a1a-8ec3-ad7c4e6ae931",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "619d785b-807e-4d98-bea3-eff796a7f71e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3bf17392-fa06-4786-ab17-e67d1af42db7",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "619d785b-807e-4d98-bea3-eff796a7f71e",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "533b10f9-ff79-4c05-b319-48aaf8edd5a9",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "253489f2-3b9d-4a65-b2e8-9351e929d515",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'INDEX'",
                    "options": [
                      {
                        "id": "d3969db5-3d5a-4857-baed-d30f9a2c6116",
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
                    "id": "e1997643-0189-4ae2-9187-63595ce8af2e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8f5132da-58ce-456a-9a24-a2747f48f92d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "7f008a85-430c-439d-ac57-4481c5ad4e92",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "8f5132da-58ce-456a-9a24-a2747f48f92d",
                        "name": "viewGroups"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7e9e679e-d976-4e50-a762-db9bafe83a7a",
                        "nameSingular": "viewGroup",
                        "namePlural": "viewGroups"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1c1390af-859d-4e30-8e30-fa98be40590e",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "539a361f-52a7-4863-a7e5-608cc79ccdf1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "6b5b6803-be7d-4345-aa35-85174cf7a1f8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b8c23d54-5586-4b46-95a6-ecb60573414f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6b5b6803-be7d-4345-aa35-85174cf7a1f8",
                        "name": "viewFilterGroups"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "bad634b4-fc51-4dd1-b4d5-d9e9cd44a8e0",
                        "nameSingular": "viewFilterGroup",
                        "namePlural": "viewFilterGroups"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "44c53857-9a65-413b-b5c9-94f5ca075d9d",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e68a3c3c-c9da-4c30-8f81-11a1ff540adb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "27339f3a-6be0-4db4-8ce1-593efb04895e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "08762fad-8f7c-41dd-8f79-b5e8814fe96e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "02ceaf72-1ebc-41a7-a3a5-cb6b2a8a5d72",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "08762fad-8f7c-41dd-8f79-b5e8814fe96e",
                        "name": "viewSorts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "95f76267-60f2-4349-9cde-693d1d7e82c5",
                        "nameSingular": "viewSort",
                        "namePlural": "viewSorts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a756af5c-e773-4b8d-958a-f447072ac1f1",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f216bb4e-67d5-4043-8511-040328ddf5bb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8c873d86-4e6f-4414-9e30-597bc871028e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f216bb4e-67d5-4043-8511-040328ddf5bb",
                        "name": "viewFilters"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "157a3189-900e-48ca-a080-0428405b93b0",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f3d36ce6-b8a2-4214-b1fa-7f13d0cadc6d",
                        "name": "view"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c04fc79f-b801-47a5-8b13-4b0388d911c9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "496822b6-6a90-42b2-b7ba-46ac76edfbf6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "3c5eee89-0d61-49b4-9283-b7da74ad9863",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "066949ba-035a-463b-a403-77f960fb9d27",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7277a37e-dbcd-4021-adbf-30f422773814",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "39671758-f406-4af2-9c1d-575103e6fae4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "31bf87e6-5ab3-4763-963c-ad89612df3fe",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "46f3ff34-de68-4db0-b0a7-5b2bcc8a4706",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "e0230f40-5d51-4a38-982b-67d313b74340",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "89567ebf-7c2d-47af-9896-65a7f23c775a"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b4c6e16d-f394-4658-93c1-8ca1d29bd433",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0aa585e2-0ea3-4efb-9d71-70bcad9a8ba3"
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
                    "id": "c01f2532-fa80-4320-b663-e54bc82cfe79",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "a1a07a5a-d9b4-43dc-b5ab-2e1c8074ce5c",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0aa585e2-0ea3-4efb-9d71-70bcad9a8ba3"
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
                    "id": "a9c94dac-53c9-4f89-b202-03a05f1df812",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "ab71f540-701b-4a93-a227-42ea43be2e53",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "a79fd0f7-6422-42c8-a291-d67a62bc25b5"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "808618a5-9477-41b3-9ee7-7e5f408b9550",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0aa585e2-0ea3-4efb-9d71-70bcad9a8ba3"
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
                    "id": "ac184f18-16b3-45f4-9b75-b558a07efd45",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "cf6bbd5c-89b1-4875-a94d-f55888c7913d",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0aa585e2-0ea3-4efb-9d71-70bcad9a8ba3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "04429950-dc0b-4565-abe1-f01ce03c7954",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "a2f3eeda-bff9-42db-b7a0-bd0e52e91e63"
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
                    "id": "4b64b59a-f5dd-4efd-8bb8-53cdf38919bd",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "cc6ebf79-6a42-4ecb-bdc7-c20236f711de",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "faa217e6-9a76-46ce-b089-eac6fe11c7a8"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "dbcc40ff-8b9d-4d22-829c-4ed15207bcce",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0aa585e2-0ea3-4efb-9d71-70bcad9a8ba3"
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
                    "id": "2f97ff3e-db12-4ced-ad19-dc4e1ddf6ccc",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "name": "IDX_b292fe34a9e2d55884febd07e93",
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
                    "id": "ce7b0b2e-88b1-451a-95a2-47de76f6f2ff",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "7f75575f-d7f8-44a2-89dd-744f7881f897",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "67d3a38b-382c-4450-96ed-7a4f443c839e"
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
                    "id": "40f15ecd-c61e-4d5b-b1f3-d0cc77ba4ec6",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "name": "IDX_4e40a441ad75df16dd71499529a",
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
                    "id": "9c604085-21f2-45e2-a142-892608d4d3f0",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "6cc48587-056b-456b-9484-13a6c18ef1c1",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "0aa585e2-0ea3-4efb-9d71-70bcad9a8ba3"
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
                    "id": "331f0d5c-0dff-4e9d-9f81-c6f93eb602af",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0aa585e2-0ea3-4efb-9d71-70bcad9a8ba3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "e0cba842-5298-48e2-b056-740c603f5aac",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2a6b451-1ed7-4865-97c2-0ce6a16712ff",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e0cba842-5298-48e2-b056-740c603f5aac",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "300e424c-d18f-4dda-8897-0f85b81efdf7",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8e06c5ee-f4aa-47fe-a37f-b30e1f511f55",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "788a81ef-0dd3-4ecd-b1fa-3b7467527276",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0871bdd4-c0f4-4e0e-bc7d-3d7fb9d1888e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "788a81ef-0dd3-4ecd-b1fa-3b7467527276",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "606e7d57-1b23-450a-a2c0-8fbcea94f29d",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9ce71eb8-77f4-4993-9fdc-63a77195e122",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "823c83c5-e49e-41e9-ba81-1a0abe3a6ddf",
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
                    "createdAt": "2024-10-25T08:35:30.058Z",
                    "updatedAt": "2024-10-25T08:35:30.058Z",
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
                    "id": "fd7de215-f826-4214-8c64-39b9da01ef4a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "aa518a1b-ebb9-4c6e-8988-aa10268a5df2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fd7de215-f826-4214-8c64-39b9da01ef4a",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f9c72811-7612-4073-86ab-5f1f8fd3566a",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5a67fe20-22a9-49bb-9833-64728e2b5dd9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f2c6310b-d75b-4c60-b12c-5db2dac9cf18",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ac2850c1-336b-4c8d-9450-a47c73d14b9d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c2b4d7db-73fa-449e-ba57-3cfd36b1c803",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ac2850c1-336b-4c8d-9450-a47c73d14b9d",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b5aec360-a49f-43e3-8dec-f5f852741cfe",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6446eaa5-85db-460a-baf5-a96c43e71c56",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "143986c7-dd20-4f83-ae77-de2ef88d7afb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6446eaa5-85db-460a-baf5-a96c43e71c56",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bfe54a7f-7e13-43b1-8e8f-6aab96bc9a5e",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "111f7ebb-070e-442e-bc75-ff0e540f9567",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "b8297860-02d9-4a4f-9535-6c73981e8f6e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6658662b-c50d-423e-864b-c7c6b425c68d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7bf8f623-9b88-4f35-bc49-06eb59c8a6d8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "89567ebf-7c2d-47af-9896-65a7f23c775a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a79fd0f7-6422-42c8-a291-d67a62bc25b5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fb356b01-4d32-46ab-9fa0-6013461f287b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5f8bc622-2f15-4c1e-9e79-83263d77d254",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fb356b01-4d32-46ab-9fa0-6013461f287b",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e5399b2f-661c-40d7-b45c-84b285473df5",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "faa217e6-9a76-46ce-b089-eac6fe11c7a8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4e4341ab-5ed4-4ff7-a644-4dd312f54c9c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fbc478cf-d6e3-42dc-a808-e45007261cff",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "bbc505f1-b9e9-4730-98d8-e1dd70b52887",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fbc478cf-d6e3-42dc-a808-e45007261cff",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "90f4563c-1b5e-4916-a4f2-291f0f993066",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a2f3eeda-bff9-42db-b7a0-bd0e52e91e63",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2e804570-f77a-45ca-b519-bdd4394063ba",
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
                    "createdAt": "2024-10-25T08:35:30.059Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c8f16e19-47a7-42e9-bcea-c79942111627",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2e804570-f77a-45ca-b519-bdd4394063ba",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "2c0857d6-518d-4e7e-aeef-1899d2c5096e",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "613900da-3f74-4f7c-a985-d56f9050bcc1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0be9f720-1ad0-4c36-90d6-d1be907ea532",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "613900da-3f74-4f7c-a985-d56f9050bcc1",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "900bee1f-d689-4765-a198-7231c48f1473",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "89e8f09f-ff9c-4590-9429-f5fad404a12c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8e4cd20f-fbef-4e26-96b3-8eb1997abba3",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "89e8f09f-ff9c-4590-9429-f5fad404a12c",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e8c8b38a-5a35-4ecf-8969-6f8bc1435c0e",
                        "name": "timelineActivities"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "67d3a38b-382c-4450-96ed-7a4f443c839e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dce4c013-1e59-4ab9-965d-f3723394add8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2427d4df-4ab7-45c7-8b1b-6d283c27501b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "31bf87e6-5ab3-4763-963c-ad89612df3fe",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "3fe60426-1d5e-4355-bca0-4bddb8e8ad0f",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "33e02db3-c19a-46d8-9a3d-a93c634185d0",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
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
                    "id": "ea6f4290-8655-4cb9-baae-824f638d4c09",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "50db9a6e-3009-4d63-8d1f-e2cb4892093f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "dbc168d2-5e1b-4feb-9248-9a1387a86fa8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a497f983-4929-4739-8cf6-9fb9da60ea6d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "33e02db3-c19a-46d8-9a3d-a93c634185d0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "54a54719-15db-49a2-9e9c-993bd70ff976",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "229c98e2-e5c6-4e3e-8b70-0a094bc9a2bb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "be60da8f-7c19-42c3-a54d-2ad169cbb842",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "62c696bf-c910-4c13-bcea-40d1e0ca85e2",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "b0812bae-e3ea-4eb7-af72-d5768602e047",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "b8258424-0d7b-447a-9837-6a991418f0fc"
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
                    "id": "cd92e123-bf0b-4d32-87af-8ac8546e53da",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "0af27ced-786b-416f-816b-ad7c33f01092",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "7b889b81-b191-46f7-80ff-c63ee4d2aca3"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "b7b0367a-6055-43c9-ba12-44f7f812df05",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "967b3f3a-5421-495d-8a40-11f99dd69cb0"
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
                    "id": "d7ce41c2-cc9c-4a37-a183-876876a2723b",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "ec91b092-5fa2-4819-b122-4b600b335689",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "4f30fbdf-577c-452a-9ead-efa5aac659dd"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "f640d537-7a12-4f90-91be-91ea678ec3f3",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "7b889b81-b191-46f7-80ff-c63ee4d2aca3"
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
                    "id": "c9f97e7f-dc3d-478b-941c-41a5fcdbfe48",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "939ff5a0-4403-4f1d-be65-4a3ac51e293c",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "name": "IDX_e14b3424016bea8b7fe220f7761",
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
                    "id": "e65d1e75-6249-4660-b6d9-51ee3b80dea4",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "b69fbe59-728d-4a4d-aaf0-97451dff583f",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "21f99a2b-ae16-4de4-b93b-2440beca7381"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "6eecdb0a-d26a-496e-bae0-e906081af4b0",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "7b889b81-b191-46f7-80ff-c63ee4d2aca3"
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
                    "id": "ca1b283e-8b6b-4082-a5c5-12cf92d1a6f2",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "a31dc19c-c09f-470d-8d5f-70d4fe310619",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "6937ab91-4c0b-4891-9c1f-dc523a835a1d"
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
                    "id": "af96ca57-f9fc-4ec4-b28d-f9ea52433358",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "aac9c564-d603-416b-9a7f-f2e08185034c",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "d17abcef-42f8-43a6-b588-1f3b74c23f35",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "40acb97d-7dae-4505-9599-3d20047a820a"
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
                    "id": "9003bb77-a7f2-4f23-bedd-e3adc4721e4b",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "931676c6-a894-4c91-92be-8364b2fd61d1",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "72c61871-5e69-4261-bc94-0518bf98095c"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "15ed9dad-d0c9-494e-8b02-790946beaf78",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "7b889b81-b191-46f7-80ff-c63ee4d2aca3"
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
                "endCursor": "YXJyYXljb25uZWN0aW9uOjI2"
              },
              "edges": [
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6827c0c4-1432-415d-b459-2831c0224c93",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "609d803f-c037-4760-85c4-d8e66c37db33",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6827c0c4-1432-415d-b459-2831c0224c93",
                        "name": "note"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "8b65e0ac-bddd-4ef1-a335-3c6157822986",
                        "nameSingular": "note",
                        "namePlural": "notes"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9e5e9e86-e4bb-48c6-ab16-845497e232f2",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4f30fbdf-577c-452a-9ead-efa5aac659dd",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bbf1c512-3e74-4b3f-b201-2c331a25d654",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d8116b53-0d0c-4aef-b165-054a8bb2b8f6",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bbf1c512-3e74-4b3f-b201-2c331a25d654",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7430a437-ae50-4693-871d-a7eb3abcc9df",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3df0067f-97d8-4dc3-b24b-efbd697ecb66",
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
                    "createdAt": "2024-10-25T08:35:30.064Z",
                    "updatedAt": "2024-10-25T13:59:18.410Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "4e7410ab-7a52-49e6-90f8-501db2613b98",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "3df0067f-97d8-4dc3-b24b-efbd697ecb66",
                        "name": "rocket"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9b030f2c-8f12-4406-842f-10a534626804",
                        "nameSingular": "rocket",
                        "namePlural": "rockets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b6ed5515-4299-4b7c-a264-823432dbe2ee",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8bd033dc-5ddc-4dce-a705-cf2b19d1ffb2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0714e4fb-64d3-41e2-afdf-4732fc5f82f3",
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
                    "createdAt": "2024-10-25T08:35:30.063Z",
                    "updatedAt": "2024-10-25T08:35:30.063Z",
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
                    "id": "533b10f9-ff79-4c05-b319-48aaf8edd5a9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "3bf17392-fa06-4786-ab17-e67d1af42db7",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "533b10f9-ff79-4c05-b319-48aaf8edd5a9",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "619d785b-807e-4d98-bea3-eff796a7f71e",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "59135c7c-1277-4574-aff4-c347ead92bec",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "89ad904c-90ca-44ce-8bba-3c82924ef43d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "59135c7c-1277-4574-aff4-c347ead92bec",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "771dba06-8d68-41fb-be08-cee7d1a0ed3a",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6b5df713-0048-4f13-8f01-eb6f1b1c224f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "18f0094e-836a-425c-ada4-314b8fd763d2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6b5df713-0048-4f13-8f01-eb6f1b1c224f",
                        "name": "opportunity"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5fc0844e-f74e-4f0d-b5b7-b3affd63b177",
                        "nameSingular": "opportunity",
                        "namePlural": "opportunities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f0f471cb-3507-4604-84cc-365fb67aa4e2",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "31d9dc31-2403-460c-b209-72985fa1d590",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "967b3f3a-5421-495d-8a40-11f99dd69cb0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2cdf2124-9089-4225-b451-0de730b52b7b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "72c61871-5e69-4261-bc94-0518bf98095c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6937ab91-4c0b-4891-9c1f-dc523a835a1d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a8c841fe-d0e6-4ae2-a372-56533c402ba6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fcd41fb5-c467-4562-b8c2-a07f15c28b03",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a8c841fe-d0e6-4ae2-a372-56533c402ba6",
                        "name": "task"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "15ebd9da-9750-4b88-bf2e-652a0b76c913",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "be60da8f-7c19-42c3-a54d-2ad169cbb842",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "a387db0d-2172-4868-bce7-8cc415cee1f6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "21f99a2b-ae16-4de4-b93b-2440beca7381",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "704c4d51-1e83-42c9-866b-49d2d99f32d6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "61e62307-3b29-4994-a46d-a56ba642ca8b",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "704c4d51-1e83-42c9-866b-49d2d99f32d6",
                        "name": "company"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7835c62f-d3e4-4610-9afe-d9bd924d13fb",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e175909d-02bd-4b07-80bb-a3c97e9395fb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "0a0c5648-e817-4135-aea0-57fded8fac2f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "81506bd9-617c-4dba-a97a-68d90ed70291",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0a0c5648-e817-4135-aea0-57fded8fac2f",
                        "name": "workflowVersion"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f554cf5d-b56a-46a5-b115-10c1c83439d0",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "40acb97d-7dae-4505-9599-3d20047a820a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7b889b81-b191-46f7-80ff-c63ee4d2aca3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "b8258424-0d7b-447a-9837-6a991418f0fc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fe7b79dc-2e90-4fc8-8c7f-2c1042275aab",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "72d021f8-6864-4b59-b63a-4cf5ef1b6adc",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "fe7b79dc-2e90-4fc8-8c7f-2c1042275aab",
                        "name": "workflow"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "13c110a9-135d-4dc2-812e-918fd4e1d694",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9f8eb7f1-e93c-4a1c-bb9f-93fa93d975af",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "662625b1-9684-47f7-aafe-d38e6a78f790",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "9f8eb7f1-e93c-4a1c-bb9f-93fa93d975af",
                        "name": "workflowRun"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9d37ba0b-4c05-4d3d-97fd-80b587c9ebfd",
                        "name": "favorites"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "141d62d3-915f-45f7-9c21-380be89ce4b1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "44be5d1d-c57f-4bef-ade4-3f52427c2f9c",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "T",
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "f45b7858-f58a-4f60-bc8f-cd5fd75e92ab",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "c4902ceb-c246-4de7-b7f9-d8975ef7f6ae",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "adf08958-e748-4fe0-a130-519280532d22"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "6caf3a63-c087-430f-bfd8-2fbb451fd382",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "a57c5924-7f5f-4237-97ae-a20a977a72ce"
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
                    "id": "4e22d58d-edbf-41bb-9bbe-c96e5fd97ff4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "a251da21-7cae-4060-a455-ca38af4b9fd2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4e22d58d-edbf-41bb-9bbe-c96e5fd97ff4",
                        "name": "taskTargets"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "c03c9de7-5750-4516-8636-78a47152abbe",
                        "nameSingular": "taskTarget",
                        "namePlural": "taskTargets"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "477105ae-7b13-421f-966a-dd0b2bd468e0",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "43492e89-955b-428e-b9bf-434833102af5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'TODO'",
                    "options": [
                      {
                        "id": "44665955-ef66-4602-91c9-cd6f7f786bbd",
                        "color": "sky",
                        "label": "To do",
                        "value": "TODO",
                        "position": 0
                      },
                      {
                        "id": "679aab60-fee9-40b8-b62d-e47374d08349",
                        "color": "purple",
                        "label": "In progress",
                        "value": "IN_PROGESS",
                        "position": 1
                      },
                      {
                        "id": "c63a5ace-95e0-49f6-a848-97589384ea45",
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
                    "id": "1f2594be-f59b-4ace-bfcb-cf8303fef16a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "5d0076e7-4ff9-42ac-b8ed-225de5270892",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6b0797e3-aba6-4625-a5ff-9a356377cf99",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5d0076e7-4ff9-42ac-b8ed-225de5270892",
                        "name": "attachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "74dcf03e-8dc1-4ce5-812e-6310b9a43be2",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ae1d1b1b-9cac-4a9a-aa95-128cf5cb77e5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a57c5924-7f5f-4237-97ae-a20a977a72ce",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "dd2a23a8-8780-4480-ad41-bb5105044230",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "57f22837-ceaa-45db-80da-d61cb2129af2",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "dd2a23a8-8780-4480-ad41-bb5105044230",
                        "name": "assignee"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "23a901bf-a489-4412-a4e6-5f5ffcbb9e1f",
                        "name": "assignedTasks"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "44be5d1d-c57f-4bef-ade4-3f52427c2f9c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cf615e4d-90a3-493d-9861-e7db48adf3f3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "adf08958-e748-4fe0-a130-519280532d22",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "15ebd9da-9750-4b88-bf2e-652a0b76c913",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fcd41fb5-c467-4562-b8c2-a07f15c28b03",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "15ebd9da-9750-4b88-bf2e-652a0b76c913",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "a8c841fe-d0e6-4ae2-a372-56533c402ba6",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ebd9942d-8722-4b42-aee4-6300db0cc765",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "062a32df-dd84-4fb4-ad67-728dccc9a37c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1dd1329a-d59d-40a9-bc2e-e0448266feee",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "606e7d57-1b23-450a-a2c0-8fbcea94f29d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "0871bdd4-c0f4-4e0e-bc7d-3d7fb9d1888e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "606e7d57-1b23-450a-a2c0-8fbcea94f29d",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "788a81ef-0dd3-4ecd-b1fa-3b7467527276",
                        "name": "task"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f64d658e-7369-4c99-8267-b97014b900b1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "194e17c6-ee5d-4dd3-8628-512f23282f4c",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "21241f13-d7fe-4b96-a163-3cb5aff60cbc",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "cebfbe31-b251-43ad-9857-752985881539",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "b1c1e17e-daa4-4713-bae3-52cfd464a6d2",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "ceac4e24-3b1f-4ec2-b4c9-37b5f71dacfb"
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
                    "id": "ceac4e24-3b1f-4ec2-b4c9-37b5f71dacfb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "03bf4876-5aaa-4b62-90e7-910fa6f0bad3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4fbbddde-6c40-4aec-851c-1d1a27e98a36",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a4d42ac8-eec0-418b-a3b3-88af0fb78f2b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "0f291f0a-2860-43a7-8e6e-8841a0724df4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "80af032f-33aa-4070-b468-1a9667af837c",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "194e17c6-ee5d-4dd3-8628-512f23282f4c",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "0f291f0a-2860-43a7-8e6e-8841a0724df4",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4fb152f7-391f-40e3-894c-50cc387fd050",
                        "name": "auditLogs"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4857df3f-b5cc-4afe-a762-2532b422f249",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2631859c-4bd8-4a5b-b73b-32eb0b22d28f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "00a0571b-f80a-460a-a7f1-d818c39fb72c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ac3688bf-59dd-4e0d-a84f-dcfa6e222ca5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "21241f13-d7fe-4b96-a163-3cb5aff60cbc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8eaedea3-4967-428d-a6e5-7046fc8e94c0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "32de0145-7ad9-4056-bc6f-56f311d1cc30",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "18df750d-c677-4548-816b-22cabd067993",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "50d865f8-4fe4-45ad-8eab-cfbc46de93e0",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "e21914f9-906e-44fb-bc46-6219f8be7caf",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "e4d62980-a196-48af-827e-566ffcb14916",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "9c230c8d-4cf9-4d2e-8e26-d873b98df606"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e2afd561-427e-4532-b1c7-c679ff034013",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "bbe9fb05-7dd8-4a2f-ad9e-56c1deaf437d"
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
                    "id": "662e6baf-befb-4fb3-96a2-cbd0982057b5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9c230c8d-4cf9-4d2e-8e26-d873b98df606",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "94905b5c-6579-47f7-87e6-c85cc94cd2a7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fcd33073-9dfb-4fef-a51b-d210aed73510",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "18df750d-c677-4548-816b-22cabd067993",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "94905b5c-6579-47f7-87e6-c85cc94cd2a7",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d0d8e33e-ced9-4817-a524-a86db664370e",
                        "name": "blocklist"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "54cf7983-a556-4efe-af5d-47cb51a47199",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "a8b59b2b-3e84-4f2f-8ba1-411b480b3765",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "50d865f8-4fe4-45ad-8eab-cfbc46de93e0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bbe9fb05-7dd8-4a2f-ad9e-56c1deaf437d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "157a3189-900e-48ca-a080-0428405b93b0",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "a2f11a09-c73d-4a03-a3a5-65d273aceab5",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a8312032-fc50-4b37-aa1e-d7db6a1f0aa3",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "f0d32e98-4412-4118-aa1e-a7581ba258ef",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "4018378e-970f-43f7-a94b-593140411a3e"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "5150a56d-9f30-4a9d-8176-f6bed2b54f43",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "4dcba64d-640a-441e-ac4c-01e863cd54d5"
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
                    "id": "97974822-9fd8-4700-9690-ab91b93f5c03",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "4018378e-970f-43f7-a94b-593140411a3e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "31137f16-c74a-4388-9d94-ca1b629c8b66",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ebbbffd9-9082-4e03-95e2-d5ef9c6304a8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c6df8736-363e-4d33-a797-faf2a0f23c55",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4dcba64d-640a-441e-ac4c-01e863cd54d5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "260b6aed-6dc0-4827-bd32-282b7f109ade",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6afaa3c2-5b30-4eaa-997a-7ab9f8c4e8b3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9cda9e33-a43f-4775-a694-9a84c19b9942",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f3d36ce6-b8a2-4214-b1fa-7f13d0cadc6d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8c873d86-4e6f-4414-9e30-597bc871028e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "157a3189-900e-48ca-a080-0428405b93b0",
                        "nameSingular": "viewFilter",
                        "namePlural": "viewFilters"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "f3d36ce6-b8a2-4214-b1fa-7f13d0cadc6d",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f216bb4e-67d5-4043-8511-040328ddf5bb",
                        "name": "viewFilters"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a2f11a09-c73d-4a03-a3a5-65d273aceab5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "8fdce963-6459-4952-b040-74f6fe8d5b40",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "11af9fae-3a59-46c1-a7cf-e4835c3e0b95",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "cff51164-eb3d-4d30-b258-d07ecff1f314",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "a8bab6a4-7470-4f21-96d1-a7054df2a975",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "828a8900-77bb-4def-a815-1025fe3fc698",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "1bd21a60-dc39-43e7-842c-d0cfcefddd84"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "79f0260f-5731-43aa-b372-1aa32df80e83",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "61fc738d-2906-44ea-8839-d468cf4b231c"
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
                    "id": "c5e9e852-f06b-4f6a-8780-e505ababeefb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f2454b8d-1c93-4300-867e-2373acbae3f0",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11af9fae-3a59-46c1-a7cf-e4835c3e0b95",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "c5e9e852-f06b-4f6a-8780-e505ababeefb",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e63536c1-73a7-4a91-aefe-3cf2a7f53b97",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "f136bd0d-56c3-4375-9546-0e20620d853a",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1bd21a60-dc39-43e7-842c-d0cfcefddd84",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "89d4acc2-4abd-4efa-b88d-25e7cb17f625",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "61fc738d-2906-44ea-8839-d468cf4b231c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "61a3b5a6-2389-483c-98e3-8103bdefc0cb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "44177e10-49ed-409d-af7c-c306f310f5c1",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11af9fae-3a59-46c1-a7cf-e4835c3e0b95",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "61a3b5a6-2389-483c-98e3-8103bdefc0cb",
                        "name": "messageChannelMessageAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "98375a53-4d80-41a3-9be6-2b89c0188bf0",
                        "nameSingular": "messageChannelMessageAssociation",
                        "namePlural": "messageChannelMessageAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "5945b9b7-2978-4ece-8544-0d55ce83b655",
                        "name": "message"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e8c31f21-69af-4306-a3de-a82cee897b42",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "095fbc40-f6b7-4283-b47b-d0e82ce020af",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5014fe19-d734-483e-8179-bc97622e5550",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "11af9fae-3a59-46c1-a7cf-e4835c3e0b95",
                        "nameSingular": "message",
                        "namePlural": "messages"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "095fbc40-f6b7-4283-b47b-d0e82ce020af",
                        "name": "messageThread"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "a23300d6-01d2-44a0-b47c-54c3eac250a3",
                        "nameSingular": "messageThread",
                        "namePlural": "messageThreads"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "401ae6cb-7cd4-49f8-9385-0e4284470f99",
                        "name": "messages"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5ff77a0c-c491-42e2-89c2-d691e355580f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d6e5e29e-4dc7-411e-8436-2e87c2443740",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "684521f1-9f89-4c23-966a-c1a3999c2aea",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a131c2b5-ff19-405a-bec0-a29cf6349a12",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "cff51164-eb3d-4d30-b258-d07ecff1f314",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "10e3d598-1608-4df4-9e6a-9f2b25019fc0",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "f9c7b0ab-55a0-47c5-8e3b-2d63e5cdac21",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "bfa311cf-879c-4878-b672-365fb3c1aca7",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "51d8d7f3-e9d8-44e0-9724-ba4a00666bb7",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "ea14411a-4c71-4bc1-a3b2-b9e9bfc5c138"
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
                    "id": "51fdfc43-3813-4fb7-b5e9-63630cdd434b",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "d6767aa7-f8f8-4c82-92db-8171f80ff708",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "ea14411a-4c71-4bc1-a3b2-b9e9bfc5c138"
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
                    "id": "88d95ddc-053f-48a7-a80d-386216b44c63",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "b2ddddd4-14e0-400e-9b87-eb3443d196f5",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "5f89e0f9-07b4-400a-8c38-9d9c998a6228"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "e3e747b6-4f27-41fa-af79-08ffdc352465",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "ea14411a-4c71-4bc1-a3b2-b9e9bfc5c138"
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
                    "id": "8d64219d-5c54-476e-a54c-b9bc5091db37",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f9c7b0ab-55a0-47c5-8e3b-2d63e5cdac21",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "984efccd-079c-4e3a-83b6-82aaacb5d9f4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "15805121-134e-4263-8b7e-4ddc343786f2",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'NEEDS_ACTION'",
                    "options": [
                      {
                        "id": "be6a067b-d126-4cd5-98d4-56c601206da1",
                        "color": "orange",
                        "label": "Needs Action",
                        "value": "NEEDS_ACTION",
                        "position": 0
                      },
                      {
                        "id": "747c3231-f89d-45f2-afcc-a3aac571bbde",
                        "color": "red",
                        "label": "Declined",
                        "value": "DECLINED",
                        "position": 1
                      },
                      {
                        "id": "0f27da24-bc52-4376-a813-2441f4a04e12",
                        "color": "yellow",
                        "label": "Tentative",
                        "value": "TENTATIVE",
                        "position": 2
                      },
                      {
                        "id": "860c664d-658a-48b3-984f-1d69d0d58aac",
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
                    "id": "ea14411a-4c71-4bc1-a3b2-b9e9bfc5c138",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "ac122679-ac83-4e7f-b058-a0786739aaa6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f775139e-b7ca-4f22-a06d-d6f9e4aa75cb",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "10e3d598-1608-4df4-9e6a-9f2b25019fc0",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ac122679-ac83-4e7f-b058-a0786739aaa6",
                        "name": "workspaceMember"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "1df93bd2-5273-4d00-9ab8-857ee1e8993a",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2efb0755-d979-4a10-afd0-31e04d5b5395",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "c264f9b5-3ee7-43fe-91ab-1a85c6425a6d",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "10e3d598-1608-4df4-9e6a-9f2b25019fc0",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2efb0755-d979-4a10-afd0-31e04d5b5395",
                        "name": "person"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "b5c8cb50-9e14-4fa7-baaa-a9b8970a81d8",
                        "nameSingular": "person",
                        "namePlural": "people"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "c0ae8c5e-7b2f-4502-bae4-760826a78280",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5f89e0f9-07b4-400a-8c38-9d9c998a6228",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e8cd00a4-4356-49e8-acf7-f72cc4e7333b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "6f2dbd40-0571-456c-b7d8-5a2f18762f41",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "98d58db4-6d40-4fa1-9f9f-5b0796c1639f",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "10e3d598-1608-4df4-9e6a-9f2b25019fc0",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6f2dbd40-0571-456c-b7d8-5a2f18762f41",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0010ab05-c459-4c28-ac41-322c6417d20f",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e89d5e9a-71fb-44c1-9f2e-65f4addf18a4",
                        "name": "calendarEventParticipants"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c1a3561e-5470-459a-8601-6235d79323ad",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7539f71c-366e-4e6c-a606-7c95972dd24e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "fdcf1a76-556a-4f1b-92ec-e8b12e16e1ad",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "42880b74-20ce-42e2-a9ea-cf01d52012e9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "e38df050-a43d-4eb0-bb90-ada297f5c2e4",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
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
                    "id": "86ef8710-e8af-4a2e-80ed-695f9c63f833",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "412c5a1f-c266-48a9-8b3c-79497fbaf0a0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "333fafe7-948e-41ea-bbc4-0395bc196218",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "412c5a1f-c266-48a9-8b3c-79497fbaf0a0",
                        "name": "messageParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e63536c1-73a7-4a91-aefe-3cf2a7f53b97",
                        "nameSingular": "messageParticipant",
                        "namePlural": "messageParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "3f9d3aab-086f-4f3c-bc26-e0b205c702c5",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5eb83245-8b66-42fd-93e5-616576bfbf40",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "2992374f-9952-4a15-9d06-5ae3b174c131",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "5eb83245-8b66-42fd-93e5-616576bfbf40",
                        "name": "accountOwnerForCompanies"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "7ecc2045-cfbd-4733-96ba-9dcce371c56e",
                        "nameSingular": "company",
                        "namePlural": "companies"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "82012969-6188-407d-894f-8311d43c8753",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b7a412bf-693d-4bbf-a0a7-2129d90cb78d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "68fbcd16-adb0-47e0-8754-db9097eed4a6",
                        "color": "turquoise",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "baec9619-a40f-41d8-b0fb-949b8a3cc757",
                        "color": "red",
                        "label": "Month First",
                        "value": "MONTH_FIRST",
                        "position": 1
                      },
                      {
                        "id": "4a193ecb-c6f8-4e42-bf8d-c44b6f5640e8",
                        "color": "purple",
                        "label": "Day First",
                        "value": "DAY_FIRST",
                        "position": 2
                      },
                      {
                        "id": "3c31ffac-da04-4862-b58d-7b5450ac4664",
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
                    "id": "05d08a19-1884-4110-96a7-a7ef58531fd8",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d71280bc-cd5a-4126-a471-ef600b8e7f4b",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "05d08a19-1884-4110-96a7-a7ef58531fd8",
                        "name": "authoredActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b185d812-01c3-4e84-b7c8-7d876c4bcab6",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "c25d36da-0e26-42f6-9734-600c6f5a799c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4fb152f7-391f-40e3-894c-50cc387fd050",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "80af032f-33aa-4070-b468-1a9667af837c",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4fb152f7-391f-40e3-894c-50cc387fd050",
                        "name": "auditLogs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "194e17c6-ee5d-4dd3-8628-512f23282f4c",
                        "nameSingular": "auditLog",
                        "namePlural": "auditLogs"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0f291f0a-2860-43a7-8e6e-8841a0724df4",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e5399b2f-661c-40d7-b45c-84b285473df5",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "5f8bc622-2f15-4c1e-9e79-83263d77d254",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e5399b2f-661c-40d7-b45c-84b285473df5",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fb356b01-4d32-46ab-9fa0-6013461f287b",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1df93bd2-5273-4d00-9ab8-857ee1e8993a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f775139e-b7ca-4f22-a06d-d6f9e4aa75cb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "1df93bd2-5273-4d00-9ab8-857ee1e8993a",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "10e3d598-1608-4df4-9e6a-9f2b25019fc0",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "ac122679-ac83-4e7f-b058-a0786739aaa6",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5d912b31-dd3b-4953-aeff-e8820ce97d16",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e52f46b0-454e-4b07-a1bb-3c217d3c04cc",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "af3b63df-4189-4f9c-8ac6-a384d649d0ca",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "9dd509aa-e4a4-4003-8402-976f54c289b8",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "af3b63df-4189-4f9c-8ac6-a384d649d0ca",
                        "name": "authoredAttachments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "94fd31f4-a45b-49f3-b887-f991d9ecf7d3",
                        "nameSingular": "attachment",
                        "namePlural": "attachments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "0fc3c470-9d47-4186-9916-2d224297dd36",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "82d8a02f-864e-48a7-98e8-d95d13c0e8d0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'SYSTEM'",
                    "options": [
                      {
                        "id": "6ae0b25f-fe20-4a15-8357-a719b950a2ec",
                        "color": "sky",
                        "label": "System",
                        "value": "SYSTEM",
                        "position": 0
                      },
                      {
                        "id": "105a5dd9-4704-43f8-8329-44f0e70ec7a8",
                        "color": "red",
                        "label": "24HRS",
                        "value": "HOUR_24",
                        "position": 1
                      },
                      {
                        "id": "556d2290-963a-4ef5-8c52-4db1ab798433",
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
                    "id": "afe18832-9042-4b3c-8420-746ab764f962",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "834c7d2f-513b-44e4-aa07-4de528eb0ded",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "afe18832-9042-4b3c-8420-746ab764f962",
                        "name": "assignedActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9cd73861-380c-40aa-be74-f3fe70268224",
                        "nameSingular": "activity",
                        "namePlural": "activities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "d3d08ebd-0010-49a6-9c90-0b3b759101b8",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d0d8e33e-ced9-4817-a524-a86db664370e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "fcd33073-9dfb-4fef-a51b-d210aed73510",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "d0d8e33e-ced9-4817-a524-a86db664370e",
                        "name": "blocklist"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "18df750d-c677-4548-816b-22cabd067993",
                        "nameSingular": "blocklist",
                        "namePlural": "blocklists"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "94905b5c-6579-47f7-87e6-c85cc94cd2a7",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8ad4a0fb-2d46-4b48-a51c-899da20f37f0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4c381c58-811e-418c-bf5b-4f212190e027",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1454c00c-c88e-4b6a-aaba-922320659e65",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "bde5e971-e0a8-4d95-9231-2074d3a04c7a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "6de2ed4f-3d86-4b79-9c3b-58deffbb5546",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "f627b41a-3025-4626-9a8f-75ecc86dd918",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6de2ed4f-3d86-4b79-9c3b-58deffbb5546",
                        "name": "authoredComments"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "ff7731cb-fa60-4dc6-b467-23e97f3affda",
                        "nameSingular": "comment",
                        "namePlural": "comments"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "e94a62e6-0730-4a15-8581-396e0bc53d85",
                        "name": "author"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "7430a437-ae50-4693-871d-a7eb3abcc9df",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "d8116b53-0d0c-4aef-b165-054a8bb2b8f6",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7430a437-ae50-4693-871d-a7eb3abcc9df",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "bbf1c512-3e74-4b3f-b201-2c331a25d654",
                        "name": "workspaceMember"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "23a901bf-a489-4412-a4e6-5f5ffcbb9e1f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "57f22837-ceaa-45db-80da-d61cb2129af2",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "23a901bf-a489-4412-a4e6-5f5ffcbb9e1f",
                        "name": "assignedTasks"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "26947467-b020-47f0-a17d-7afc3d2fb788",
                        "nameSingular": "task",
                        "namePlural": "tasks"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "dd2a23a8-8780-4480-ad41-bb5105044230",
                        "name": "assignee"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e38df050-a43d-4eb0-bb90-ada297f5c2e4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "ca1a7c89-b4ef-4973-a8d3-295692d2f6ce",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "12c923b7-561f-4992-a008-72cea5ffd022",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0b397572-f47b-4f85-83ed-b6259dec210c",
                        "nameSingular": "workspaceMember",
                        "namePlural": "workspaceMembers"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "ca1a7c89-b4ef-4973-a8d3-295692d2f6ce",
                        "name": "connectedAccounts"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "99902373-0ccf-4c20-b5b3-f3f2904432b7",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "efcc0595-2509-4830-93d3-5dc7e1afb817",
                        "name": "accountOwner"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e2d7c3cc-b5d8-426d-a6f2-d980fab39980",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "67c4d3ab-a395-4d6e-9ae3-59cd241dd49c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "0abd6b9f-8776-42b6-89fd-2c8516ac10ad",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "8b6e2703-2be6-4d5b-8e54-87de42f1a6f9",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "7dd113fc-c9a1-4e3e-b5e0-cd9e072d0a92",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "82d5c1c9-052b-41cd-b229-afc6c69be385",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "bd8eebdc-070e-4bdc-a76f-9d8715d11379"
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
                    "id": "29a2bf2a-84bc-4387-b6a2-a7b1e78c9272",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4449f48e-388b-4738-abf5-5f204a750f9b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "83ca68c8-d171-486e-b054-31e54663d02e",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0abd6b9f-8776-42b6-89fd-2c8516ac10ad",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "4449f48e-388b-4738-abf5-5f204a750f9b",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0196d2de-d7d9-4e08-ae6a-d1fd88ba21f4",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "7fca2daf-583d-4f44-8013-45b945bbd341",
                        "name": "calendarChannel"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "acf7e48e-ae7c-4b70-85a3-c3ca105c1d4f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'AS_PARTICIPANT_AND_ORGANIZER'",
                    "options": [
                      {
                        "id": "72be5fae-0af2-4a0d-aafe-7e0f73da1cdc",
                        "color": "green",
                        "label": "As Participant and Organizer",
                        "value": "AS_PARTICIPANT_AND_ORGANIZER",
                        "position": 0
                      },
                      {
                        "id": "2ee0bc4c-5de4-40ce-a5bd-46b3942ab25e",
                        "color": "orange",
                        "label": "As Participant",
                        "value": "AS_PARTICIPANT",
                        "position": 1
                      },
                      {
                        "id": "c31f2961-5df0-4380-b5be-d9a73051aff7",
                        "color": "blue",
                        "label": "As Organizer",
                        "value": "AS_ORGANIZER",
                        "position": 2
                      },
                      {
                        "id": "18dea159-1f13-4613-aa49-ae099328259b",
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
                    "id": "89410f87-40b9-47a2-adbc-09dd3e88e24f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "bd8eebdc-070e-4bdc-a76f-9d8715d11379",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "22f608c6-89b3-4098-9b44-7e426b31ad01",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6876dc8c-24fd-452a-8cb2-12dd9d2cbbda",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'SHARE_EVERYTHING'",
                    "options": [
                      {
                        "id": "aebd476c-bff7-48be-9fb6-6b387d282376",
                        "color": "green",
                        "label": "Metadata",
                        "value": "METADATA",
                        "position": 0
                      },
                      {
                        "id": "da1f9c96-2237-4f44-8aa1-fcc7b732c174",
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
                    "id": "0acf38e0-8678-400a-ad53-bcfb60c27be4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "263c8479-1e4b-43ba-ae12-13fbf027fd47",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "756a9de6-6432-4ad5-8060-fde5bd0567b0",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "09334d88-66a0-4765-b513-84370b16dcc0",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0abd6b9f-8776-42b6-89fd-2c8516ac10ad",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "756a9de6-6432-4ad5-8060-fde5bd0567b0",
                        "name": "connectedAccount"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "99902373-0ccf-4c20-b5b3-f3f2904432b7",
                        "nameSingular": "connectedAccount",
                        "namePlural": "connectedAccounts"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "487fcab6-150f-413b-b93a-cf3afcfd5359",
                        "name": "calendarChannels"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "07b065e0-9182-49d3-bc7b-b02de27348a9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "0d1b5a41-a837-4cb8-9f79-d05f9c0413bf",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "71756c0e-d90a-4735-8e22-307d2cd6b091",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": [
                      {
                        "id": "fb09b48e-f147-47fd-a3eb-1c48d790c095",
                        "color": "yellow",
                        "label": "Ongoing",
                        "value": "ONGOING",
                        "position": 1
                      },
                      {
                        "id": "803a4019-405d-433b-ae7d-fe879740f2f5",
                        "color": "blue",
                        "label": "Not Synced",
                        "value": "NOT_SYNCED",
                        "position": 2
                      },
                      {
                        "id": "ea7dcac6-582d-42e5-b66a-2bcbd4fe5426",
                        "color": "green",
                        "label": "Active",
                        "value": "ACTIVE",
                        "position": 3
                      },
                      {
                        "id": "e0116782-0ac6-4ba1-838f-372f930a7d99",
                        "color": "red",
                        "label": "Failed Insufficient Permissions",
                        "value": "FAILED_INSUFFICIENT_PERMISSIONS",
                        "position": 4
                      },
                      {
                        "id": "7594b299-1d39-4363-ad60-585b23549435",
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
                    "id": "8b6e2703-2be6-4d5b-8e54-87de42f1a6f9",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2f3d4ae4-d0d3-4eb1-9389-ab58cb17796c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "72127a65-e9d1-4b6d-9ae2-53f9b091c494",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "'FULL_CALENDAR_EVENT_LIST_FETCH_PENDING'",
                    "options": [
                      {
                        "id": "3f471f2d-bed5-4599-9c17-84a572fc53a7",
                        "color": "blue",
                        "label": "Full calendar event list fetch pending",
                        "value": "FULL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 0
                      },
                      {
                        "id": "2a841c63-17dc-4658-a6ac-63048a910cce",
                        "color": "blue",
                        "label": "Partial calendar event list fetch pending",
                        "value": "PARTIAL_CALENDAR_EVENT_LIST_FETCH_PENDING",
                        "position": 1
                      },
                      {
                        "id": "e9859ee7-a857-4de6-a39e-338ef959190b",
                        "color": "orange",
                        "label": "Calendar event list fetch ongoing",
                        "value": "CALENDAR_EVENT_LIST_FETCH_ONGOING",
                        "position": 2
                      },
                      {
                        "id": "ec2a02a8-0b96-4c23-8060-e9e3bf7d424b",
                        "color": "blue",
                        "label": "Calendar events import pending",
                        "value": "CALENDAR_EVENTS_IMPORT_PENDING",
                        "position": 3
                      },
                      {
                        "id": "22e6725a-ea4a-42e2-9737-a443ec8ae41e",
                        "color": "orange",
                        "label": "Calendar events import ongoing",
                        "value": "CALENDAR_EVENTS_IMPORT_ONGOING",
                        "position": 4
                      },
                      {
                        "id": "f9afe886-b250-4252-b724-7240317c77e6",
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
                    "id": "ae8f5514-a052-4946-900f-52a10f71d88e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5ed3c66b-e5a8-4e7f-bb17-bebc637d0e88",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "0a6d2e88-766c-41c0-a441-a4bc6af512bb",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "12b4c52e-09ae-4e26-91ff-9763d0fcd26a",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "4916af68-b8e7-44ee-8505-2bfa35b070d8",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "663e47c0-42d8-45fd-b373-572cfc4a1012",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "f0f63e4c-c846-4d6d-a09e-36d2bae0cb8a"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "72341584-95ad-4bb2-a85a-5bd4d53b2f71",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "d86c3df0-9927-47cb-8816-9b155e2f0c91"
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
                    "id": "8d52192c-9eb6-4b4d-89d8-cb3d2185d3b3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "f0f63e4c-c846-4d6d-a09e-36d2bae0cb8a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "7b425bdf-1c9b-46a9-9f72-69896d4a08ed",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "5c497ac5-2b49-40f2-b8ed-8e76825c0111",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "c6559a27-420a-40c1-80f9-999a8234510b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "12b4c52e-09ae-4e26-91ff-9763d0fcd26a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "d86c3df0-9927-47cb-8816-9b155e2f0c91",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2dfdfb9c-1ba7-43a1-8c26-5f4938d1e06f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a445cf13-521f-4bee-af9a-23956c79e938",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "b79c57fe-1cbb-4149-bbfb-e4a6ebc8fb94",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0a6d2e88-766c-41c0-a441-a4bc6af512bb",
                        "nameSingular": "viewField",
                        "namePlural": "viewFields"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "a445cf13-521f-4bee-af9a-23956c79e938",
                        "name": "view"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "5a3ff63f-f331-4e26-a756-bf9ec3ee8348",
                        "nameSingular": "view",
                        "namePlural": "views"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "cbb33845-0258-4dc1-9b92-94fdab04de43",
                        "name": "viewFields"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b5dffd08-f1f7-4741-92bd-d7125ed127b6",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "c2deab31-d15f-49b6-9851-bbf6354024b1",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": "W",
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
                    "id": "da265134-d266-4416-9a34-55a26feaae21",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "13c110a9-135d-4dc2-812e-918fd4e1d694",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "72d021f8-6864-4b59-b63a-4cf5ef1b6adc",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "13c110a9-135d-4dc2-812e-918fd4e1d694",
                        "name": "favorites"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "32541b2f-abfb-4df2-bbdb-56abb0d5028b",
                        "nameSingular": "favorite",
                        "namePlural": "favorites"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "fe7b79dc-2e90-4fc8-8c7f-2c1042275aab",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2c1d849e-370d-4a89-9fe0-7c951febc820",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "49946488-5ddc-4e37-a5af-6083f2718605",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "2c1d849e-370d-4a89-9fe0-7c951febc820",
                        "name": "runs"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "6a939b03-6738-4767-8d60-868f024bf497",
                        "nameSingular": "workflowRun",
                        "namePlural": "workflowRuns"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "736af1af-1685-4427-9b9d-3321568f68ac",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "43306616-1674-4b2e-a4ce-01f30fdff4b4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "8cee7dcb-fdaf-4147-a011-3f27822727ac",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "43306616-1674-4b2e-a4ce-01f30fdff4b4",
                        "name": "eventListeners"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "9f44b3a1-3ac9-4c1d-9c96-a17eba5b102a",
                        "nameSingular": "workflowEventListener",
                        "namePlural": "workflowEventListeners"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "9357220f-6971-4d60-929e-15fd0cb9b335",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4ca70272-8194-4869-adf3-c3f578b14dbf",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "bfe54a7f-7e13-43b1-8e8f-6aab96bc9a5e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "143986c7-dd20-4f83-ae77-de2ef88d7afb",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "bfe54a7f-7e13-43b1-8e8f-6aab96bc9a5e",
                        "name": "timelineActivities"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "55a44584-c3bf-4569-ad84-1d322ef6c3be",
                        "nameSingular": "timelineActivity",
                        "namePlural": "timelineActivities"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6446eaa5-85db-460a-baf5-a96c43e71c56",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b8aead1e-1fe1-4438-8d7c-e27eb78bb9e3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "2cf07023-1df3-48dc-be50-b181d9988448",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "c2deab31-d15f-49b6-9851-bbf6354024b1",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "9e1fc3df-7d4c-40d4-8bd9-2eec373d2f50",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "124257d9-30da-4ce6-a438-0054adcef097",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "aeb12371-fbd7-4e19-a98c-35fbabde6325",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "6478a161-783d-4e53-857d-435d33757985",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "05247a9c-b09f-4151-8f82-7dd1376c35da",
                        "nameSingular": "workflow",
                        "namePlural": "workflows"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "aeb12371-fbd7-4e19-a98c-35fbabde6325",
                        "name": "versions"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "e41099f8-fdd4-4169-b7f5-6a9241a426c5",
                        "nameSingular": "workflowVersion",
                        "namePlural": "workflowVersions"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "79615225-efc5-483a-8a76-0de461eac9db",
                        "name": "workflow"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "1eb65728-548b-4e64-9643-08c42e8d514d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "0196d2de-d7d9-4e08-ae6a-d1fd88ba21f4",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "d6f9c676-55f4-497c-86af-abeebde0b8d7",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
            "shouldSyncLabelAndName": false,
            "indexMetadatas": {
              "__typename": "ObjectIndexMetadatasConnection",
              "edges": [
                {
                  "__typename": "indexEdge",
                  "node": {
                    "__typename": "index",
                    "id": "c1ff8f98-5a05-418a-b6d0-1bfcbbfc6ff4",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "4dc58ec2-d0cc-4160-a9b3-f97b4e5a7c48",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "52d7e2dc-717b-43e4-957b-1cb5e0cce603"
                          }
                        },
                        {
                          "__typename": "indexFieldEdge",
                          "node": {
                            "__typename": "indexField",
                            "id": "a3972e9d-a110-44e9-ae91-6b188a75b3e1",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 1,
                            "fieldMetadataId": "8d88e034-25e6-43c8-b9a1-1dcda530b8d7"
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
                    "id": "cafa9e02-e511-4eb9-b198-bfd503358808",
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                            "id": "70e7a002-eed8-4eb6-8ecc-dd9e1390f938",
                            "createdAt": "2024-10-25T08:35:26.136Z",
                            "updatedAt": "2024-10-25T08:35:26.136Z",
                            "order": 0,
                            "fieldMetadataId": "d6248175-9502-45b1-964f-4a7c5ce2951a"
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
                    "id": "7fca2daf-583d-4f44-8013-45b945bbd341",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "83ca68c8-d171-486e-b054-31e54663d02e",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0196d2de-d7d9-4e08-ae6a-d1fd88ba21f4",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "7fca2daf-583d-4f44-8013-45b945bbd341",
                        "name": "calendarChannel"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0abd6b9f-8776-42b6-89fd-2c8516ac10ad",
                        "nameSingular": "calendarChannel",
                        "namePlural": "calendarChannels"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "4449f48e-388b-4738-abf5-5f204a750f9b",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6b09e529-20b8-421a-b278-3f00bf639a01",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1a93dfca-e6f4-44c6-a9fe-3df5f6da4381",
                      "direction": "MANY_TO_ONE",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0196d2de-d7d9-4e08-ae6a-d1fd88ba21f4",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "6b09e529-20b8-421a-b278-3f00bf639a01",
                        "name": "calendarEvent"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0010ab05-c459-4c28-ac41-322c6417d20f",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "b5f78c90-a74c-4296-a357-5183fab0c17f",
                        "name": "calendarChannelEventAssociations"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "206df14b-04bd-458c-b428-11f6d897282a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "48b5a818-4d63-4d3d-ad91-c01d8be7c63b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "acdbe369-d7af-4709-b2e9-60e2aa3e960b",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "26e91321-8fd8-4c93-841c-b997137a0a2d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "52d7e2dc-717b-43e4-957b-1cb5e0cce603",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "d6f9c676-55f4-497c-86af-abeebde0b8d7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "d6248175-9502-45b1-964f-4a7c5ce2951a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "8d88e034-25e6-43c8-b9a1-1dcda530b8d7",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
            "id": "0010ab05-c459-4c28-ac41-322c6417d20f",
            "dataSourceId": "0dd83626-7099-48bf-a238-9b5abd9d03c9",
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
            "createdAt": "2024-10-25T08:35:26.136Z",
            "updatedAt": "2024-10-25T08:35:26.136Z",
            "labelIdentifierFieldMetadataId": "ed745204-8b47-4c91-902c-c47062e89614",
            "imageIdentifierFieldMetadataId": null,
            "shortcut": null,
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
                    "id": "ebcba9c9-69af-4b27-b9d5-cc876030b96d",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "4710649d-7240-4bbf-beef-7c3d6b1faa5e",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6edcfca1-26ab-47db-8105-9ab38e100062",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "0b1ea637-890e-4b37-ad6a-6c93e4c8557c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "687192d1-06ad-4582-979c-a5f50cf35453",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "b5d6538a-153e-43b7-8ddb-243c9fb352ba",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
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
                    "id": "4b1a1b47-df2e-40ed-9082-4cf66ea05c4c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "6c4df31f-3309-435e-b486-8a15b68fe6bb",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b2e3fdf1-6a19-4b89-8c1e-24e14d58f3f4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "3185c964-816f-40ee-b8ce-028e96c51792",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "e89d5e9a-71fb-44c1-9f2e-65f4addf18a4",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "98d58db4-6d40-4fa1-9f9f-5b0796c1639f",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0010ab05-c459-4c28-ac41-322c6417d20f",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "e89d5e9a-71fb-44c1-9f2e-65f4addf18a4",
                        "name": "calendarEventParticipants"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "10e3d598-1608-4df4-9e6a-9f2b25019fc0",
                        "nameSingular": "calendarEventParticipant",
                        "namePlural": "calendarEventParticipants"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6f2dbd40-0571-456c-b7d8-5a2f18762f41",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "b5f78c90-a74c-4296-a357-5183fab0c17f",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": {
                      "__typename": "RelationDefinition",
                      "relationId": "1a93dfca-e6f4-44c6-a9fe-3df5f6da4381",
                      "direction": "ONE_TO_MANY",
                      "sourceObjectMetadata": {
                        "__typename": "object",
                        "id": "0010ab05-c459-4c28-ac41-322c6417d20f",
                        "nameSingular": "calendarEvent",
                        "namePlural": "calendarEvents"
                      },
                      "sourceFieldMetadata": {
                        "__typename": "field",
                        "id": "b5f78c90-a74c-4296-a357-5183fab0c17f",
                        "name": "calendarChannelEventAssociations"
                      },
                      "targetObjectMetadata": {
                        "__typename": "object",
                        "id": "0196d2de-d7d9-4e08-ae6a-d1fd88ba21f4",
                        "nameSingular": "calendarChannelEventAssociation",
                        "namePlural": "calendarChannelEventAssociations"
                      },
                      "targetFieldMetadata": {
                        "__typename": "field",
                        "id": "6b09e529-20b8-421a-b278-3f00bf639a01",
                        "name": "calendarEvent"
                      }
                    }
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "f6ff6a41-20f1-4bda-9f60-39e4fb63367a",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ad289f96-ac94-4456-8ffc-e7c652248ec3",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "now",
                    "options": null,
                    "settings": {
                      "displayAsRelativeDate": true
                    },
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ed745204-8b47-4c91-902c-c47062e89614",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": "''",
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a0fbf193-6fa3-43b0-b9e0-be33623670df",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "a6cceca1-0d75-43f0-b591-e43f579c0557",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": null,
                    "options": null,
                    "settings": null,
                    "relationDefinition": null
                  }
                },
                {
                  "__typename": "fieldEdge",
                  "node": {
                    "__typename": "field",
                    "id": "ddef23a4-9f55-401f-bfd6-fa459cf7411c",
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
                    "createdAt": "2024-10-25T08:35:26.136Z",
                    "updatedAt": "2024-10-25T08:35:26.136Z",
                    "defaultValue": false,
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